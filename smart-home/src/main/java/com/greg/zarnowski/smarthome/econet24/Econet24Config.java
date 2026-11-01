package com.greg.zarnowski.smarthome.econet24;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(Econet24Properties.class)
class Econet24Config {}
