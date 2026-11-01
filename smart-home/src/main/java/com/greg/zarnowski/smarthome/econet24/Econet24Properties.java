package com.greg.zarnowski.smarthome.econet24;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Settings for the econet24 client. */
@ConfigurationProperties(prefix = "econet24")
public record Econet24Properties(String baseUrl, String username, String password, String deviceUid) {

    public Econet24Properties {
        if (baseUrl == null || baseUrl.isBlank()) {
            baseUrl = "https://www.econet24.com";
        }
    }
}
