package com.swiftpigeon.backend.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;

import com.swiftpigeon.backend.model.JwtAuthenticationFilter;
import com.swiftpigeon.backend.model.JwtHandler;
import com.swiftpigeon.backend.model.UserDetailsServiceImpl;

@Configuration
public class JwtFilterConfig {

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtHandler jwtHandler, 
                                                           @Qualifier("userDetailsServiceImpl") UserDetailsService userDetailsService) {
        return new JwtAuthenticationFilter(jwtHandler, userDetailsService);
    }
}
