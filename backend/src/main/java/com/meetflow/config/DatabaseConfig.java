package com.meetflow.config;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Configuration;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DatabaseConfig implements BeanPostProcessor {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof DataSourceProperties) {
            DataSourceProperties properties = (DataSourceProperties) bean;
            String databaseUrl = System.getenv("DATABASE_URL");
            if (databaseUrl != null && (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
                try {
                    // Replace postgres:// or postgresql:// with http:// to use standard JDK URI parser
                    String cleanUrl = databaseUrl.replaceFirst("postgres(ql)?://", "http://");
                    URI uri = new URI(cleanUrl);
                    
                    String username = "";
                    String password = "";
                    if (uri.getUserInfo() != null) {
                        String[] userInfo = uri.getUserInfo().split(":");
                        username = userInfo[0];
                        if (userInfo.length > 1) {
                            password = userInfo[1];
                        }
                    }
                    
                    String host = uri.getHost();
                    int port = uri.getPort();
                    String path = uri.getPath();
                    String query = uri.getQuery();
                    
                    String jdbcUrl = "jdbc:postgresql://" + host + (port != -1 ? ":" + port : "") + path;
                    if (query != null) {
                        jdbcUrl += "?" + query;
                    }
                    
                    properties.setUrl(jdbcUrl);
                    properties.setUsername(username);
                    properties.setPassword(password);
                } catch (URISyntaxException e) {
                    // Ignore, fallback to properties file config
                }
            }
        }
        return bean;
    }
}
