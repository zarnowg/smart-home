package com.greg.zarnowski.smarthome.history;

import com.greg.zarnowski.smarthome.boiler.MixerStatus;
import com.greg.zarnowski.smarthome.boiler.MixerStatusService;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Component;

/** Collects the valve position of each active mixer. */
@Component
public class MixerValveCollector implements MetricCollector {

    public static final String METRIC = "mixer.valvePercent";

    private final MixerStatusService mixerService;
    private final Clock clock;

    public MixerValveCollector(MixerStatusService mixerService, Clock clock) {
        this.mixerService = mixerService;
        this.clock = clock;
    }

    @Override
    public String metricName() {
        return METRIC;
    }

    @Override
    public List<MetricSample> collect() {
        LocalDateTime now = LocalDateTime.now(clock);
        return mixerService.getMixers().stream()
                .filter(mixer -> mixer.valvePercent() != null)
                .map(mixer -> toSample(mixer, now))
                .toList();
    }

    private MetricSample toSample(MixerStatus mixer, LocalDateTime now) {
        return new MetricSample(METRIC, String.valueOf(mixer.id()), mixer.valvePercent().doubleValue(), now);
    }
}
