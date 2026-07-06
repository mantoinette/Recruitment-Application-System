package com.anto.recruitment_system.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Value("${SPRING_DATASOURCE_URL:}")
    private String springDatasourceUrl;

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Value("${SPRING_DATASOURCE_USERNAME:}")
    private String username;

    @Value("${SPRING_DATASOURCE_PASSWORD:}")
    private String password;

    @Bean
    @Primary
    public DataSource dataSource() {
        String url = !springDatasourceUrl.isBlank() ? springDatasourceUrl : databaseUrl;
        url = toJdbcUrl(url);

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(url);
        dataSource.setDriverClassName("org.postgresql.Driver");

        if (!username.isBlank()) {
            dataSource.setUsername(username);
        }
        if (!password.isBlank()) {
            dataSource.setPassword(password);
        }

        return dataSource;
    }

    static String toJdbcUrl(String url) {
        if (url == null || url.isBlank()) {
            throw new IllegalStateException(
                    "Set SPRING_DATASOURCE_URL or DATABASE_URL (postgresql://... or jdbc:postgresql://...)");
        }

        if (url.startsWith("jdbc:")) {
            return ensureRenderSsl(url);
        }
        if (url.startsWith("postgres://")) {
            return ensureRenderSsl("jdbc:postgresql://" + url.substring("postgres://".length()));
        }
        if (url.startsWith("postgresql://")) {
            return ensureRenderSsl("jdbc:postgresql://" + url.substring("postgresql://".length()));
        }

        return url;
    }

    private static String ensureRenderSsl(String jdbcUrl) {
        if (jdbcUrl.contains("render.com") && !jdbcUrl.contains("sslmode=")) {
            String separator = jdbcUrl.contains("?") ? "&" : "?";
            return jdbcUrl + separator + "sslmode=require";
        }
        return jdbcUrl;
    }
}
