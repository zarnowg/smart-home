package com.greg.zarnowski.smarthome.history;

import com.greg.zarnowski.smarthome.boiler.BoilerStatus;
import com.greg.zarnowski.smarthome.boiler.BoilerStatusService;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/** Collects boiler, hot water, outdoor temperature, boiler power and fuel level. */
@Component
public class BoilerMetricCollector implements MetricCollector {

    public static final String BOILER_TEMPERATURE = "boiler.temperature";
    public static final String HOT_WATER_TEMPERATURE = "hotWater.temperature";
    public static final String OUTDOOR_TEMPERATURE = "outdoor.temperature";
    public static final String BOILER_POWER = "boiler.powerPercent";
    public static final String FUEL_LEVEL = "fuel.levelPercent";

    private static final String SOURCE_ID = "1";

    private final BoilerStatusService statusService;
    private final Clock clock;

    public BoilerMetricCollector(BoilerStatusService statusService, Clock clock) {
        this.statusService = statusService;
        this.clock = clock;
    }

    @Override
    public String metricName() {
        return "boiler";
    }

    @Override
    public List<MetricSample> collect() {
        BoilerStatus status = statusService.getStatus();
        LocalDateTime now = LocalDateTime.now(clock);
        List<MetricSample> samples = new ArrayList<>();
        add(samples, BOILER_TEMPERATURE, status.boilerTemperature(), now);
        add(samples, HOT_WATER_TEMPERATURE, status.hotWaterTemperature(), now);
        add(samples, OUTDOOR_TEMPERATURE, status.outdoorTemperature(), now);
        add(samples, BOILER_POWER, status.boilerPowerPercent(), now);
        add(samples, FUEL_LEVEL, status.fuelLevel(), now);
        return samples;
    }

    private void add(List<MetricSample> samples, String metric, Number value, LocalDateTime now) {
        if (value != null) {
            samples.add(new MetricSample(metric, SOURCE_ID, value.doubleValue(), now));
        }
    }
}
