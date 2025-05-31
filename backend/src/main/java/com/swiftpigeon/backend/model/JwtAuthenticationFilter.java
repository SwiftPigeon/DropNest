package com.swiftpigeon.backend.model;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final String HEADER = "Authorization";
    private static final String PREFIX = "Bearer ";

    // Static blacklist for tokens to maintain across instances
    private static final Set<String> blacklistedTokens = Collections.newSetFromMap(new ConcurrentHashMap<>());

    private final JwtHandler jwtHandler;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtHandler jwtHandler,
            UserDetailsService userDetailsService
    ) {
        this.jwtHandler = jwtHandler;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // Skip JWT processing for auth and password endpoints
        return path.startsWith("/auth/") || path.startsWith("/password/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String jwt = getJwtFromRequest(request);
        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Check if token is blacklisted
        if (isTokenBlacklisted(jwt)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            final String username = jwtHandler.parsedUsername(jwt);
            
            // Only proceed if we have a username and no authentication already exists
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                final UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                // Create authentication token
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Set authentication in context
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Could not set user authentication in security context", e);
        }
        
        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(HEADER);
        if (bearerToken == null || !bearerToken.startsWith(PREFIX)) {
            return null;
        }
        return bearerToken.substring(7);
    }
    
    /**
     * Adds a token to the blacklist
     * 
     * @param token the JWT token to blacklist
     */
    public static void blacklistToken(String token) {
        blacklistedTokens.add(token);
    }
    
    /**
     * Checks if a token is blacklisted
     * 
     * @param token the JWT token to check
     * @return true if the token is blacklisted, false otherwise
     */
    public static boolean isTokenBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }
}
