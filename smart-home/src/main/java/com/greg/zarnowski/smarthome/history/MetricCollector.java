package com.greg.zarnowski.smarthome.history;

import java.util.List;

/** Source of values that are saved periodically. Add a new bean to store a new parameter. */
public interface MetricCollector {

    String metricName();

    List<MetricSample> collect();
}
