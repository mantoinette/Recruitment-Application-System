package com.anto.recruitment_system.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Bean
    @Primary
    public DataSource dataSource() {
        String url = datasourceUrl;
        if (url.isBlank() && !databaseUrl.isBlank()) {
            url = databaseUrl;
        }
        if (url.isBlank()) {
            url = "jdbc:postgresql://localhost:5434/recruitment_db";
        }

        ParsedDatabase parsed = parseDatabaseUrl(url);

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(parsed.jdbcUrl());
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setUsername(username.isBlank() ? parsed.username() : username);
        dataSource.setPassword(password.isBlank() ? parsed.password() : password);

        return dataSource;
    }

    static ParsedDatabase parseDatabaseUrl(String url) {
        String normalized = url.trim();

        if (normalized.startsWith("jdbc:postgresql://")) {
            normalized = "postgresql://" + normalized.substring("jdbc:postgresql://".length());
        } else if (normalized.startsWith("postgres://")) {
            normalized = "postgresql://" + normalized.substring("postgres://".length());
        }

        URI uri = URI.create(normalized);
        String host = uri.getHost();
        int port = uri.getPort() > 0 ? uri.getPort() : 5432;
        String database = uri.getPath() == null ? "" : uri.getPath().replaceFirst("^/", "");

        String parsedUsername = "";
        String parsedPassword = "";
        if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
            String[] credentials = uri.getUserInfo().split(":", 2);
            parsedUsername = decode(credentials[0]);
            parsedPassword = credentials.length > 1 ? decode(credentials[1]) : "";
        }

        String query = uri.getQuery();
        String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + database;
        if (query != null && !query.isBlank()) {
            jdbcUrl += "?" + query;
        }
        jdbcUrl = ensureRenderSsl(jdbcUrl);

        return new ParsedDatabase(jdbcUrl, parsedUsername, parsedPassword);
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private static String ensureRenderSsl(String jdbcUrl) {
        if (jdbcUrl.contains("render.com") && !jdbcUrl.contains("sslmode=")) {
            String separator = jdbcUrl.contains("?") ? "&" : "?";
            return jdbcUrl + separator + "sslmode=require";
        }
        return jdbcUrl;
    }

    record ParsedDatabase(String jdbcUrl, String username, String password) {
    }
}
