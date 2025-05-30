package com.swiftpigeon.backend.config;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.swiftpigeon.backend.model")
@EntityScan(basePackages = "com.swiftpigeon.backend.model")
public class DataConfig {
    // Configuration is handled through annotations
}
