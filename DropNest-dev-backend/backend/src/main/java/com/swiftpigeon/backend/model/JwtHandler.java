package com.swiftpigeon.backend.model;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtHandler {

    private final Key signingKey;

    public JwtHandler(@Value("${jwt.secret-key:c2VjcmV0LWtleS1mb3Itand0LWF1dGhlbnRpY2F0aW9uLWluLXN3aWZ0cGlnZW9uLXByb2plY3Q=}") String secretKey) {
        byte[] bytes = Base64.getDecoder().decode(secretKey);
        signingKey = Keys.hmacShaKeyFor(bytes);
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String parsedUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    /**
     * Validates if a token is valid and not expired
     * 
     * @param token the JWT token to validate
     * @return true if the token is valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token);
            
            // Check if token is expired
            Date expirationDate = extractClaim(token, Claims::getExpiration);
            return !expirationDate.before(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
