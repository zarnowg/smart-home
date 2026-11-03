package com.greg.zarnowski.smarthome.history;

import com.greg.zarnowski.smarthome.boiler.MixerStatus;
import com.greg.zarnowski.smarthome.boiler.MixerStatusService;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/** Collects the measured and target temperature of each active mixer. */
@Component
public class MixerTemperatureCollector implements MetricCollector {

    public static final String TEMPERATURE = "mixer.temperature";
    public static final String TARGET_TEMPERATURE = "mixer.targetTemperature";

    private final MixerStatusService mixerService;
    private final Clock clock;

    public MixerTemperatureCollector(MixerStatusService mixerService, Clock clock) {
        this.mixerService = mixerService;
        this.clock = clock;
    }

    @Override
    public String metricName() {
        return "mixer.temperature";
    }

    @Override
    public List<MetricSample> collect() {
        LocalDateTime now = LocalDateTime.now(clock);
        List<MetricSample> samples = new ArrayList<>();
        for (MixerStatus mixer : mixerService.getMixers()) {
            String sourceId = String.valueOf(mixer.id());
            if (mixer.temperature() != null) {
                samples.add(new MetricSample(TEMPERATURE, sourceId, mixer.temperature(), now));
            }
            if (mixer.targetTemperature() != null) {
                samples.add(new MetricSample(TARGET_TEMPERATURE, sourceId, mixer.targetTemperature(), now));
            }
        }
        return samples;
    }
}
