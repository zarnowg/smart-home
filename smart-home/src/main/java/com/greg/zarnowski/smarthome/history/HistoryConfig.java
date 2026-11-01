package com.greg.zarnowski.smarthome.history;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
class HistoryConfig {

    @Bean
    Clock clock() {
        return Clock.systemDefaultZone();
    }
}
