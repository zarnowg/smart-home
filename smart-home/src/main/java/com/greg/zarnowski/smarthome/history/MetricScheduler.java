package com.greg.zarnowski.smarthome.history;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Runs all collectors on a schedule and removes old samples. */
@Component
public class MetricScheduler {

    private static final Logger log = LoggerFactory.getLogger(MetricScheduler.class);

    private final List<MetricCollector> collectors;
    private final MetricSampleRepository repository;
    private final Clock clock;
    private final Duration retention;

    public MetricScheduler(
            List<MetricCollector> collectors,
            MetricSampleRepository repository,
            Clock clock,
            @Value("${history.retention}") Duration retention) {
        this.collectors = collectors;
        this.repository = repository;
        this.clock = clock;
        this.retention = retention;
    }

    @Scheduled(fixedRateString = "${history.collect-interval}")
    public void collectAll() {
        for (MetricCollector collector : collectors) {
            try {
                repository.saveAll(collector.collect());
            } catch (RuntimeException e) {
                log.warn("Collector {} failed: {}", collector.metricName(), e.getMessage());
            }
        }
    }

    @Scheduled(cron = "0 15 3 * * *")
    public void deleteOldSamples() {
        int deleted = repository.deleteOlderThan(LocalDateTime.now(clock).minus(retention));
        log.info("Deleted {} old metric samples", deleted);
    }
}
