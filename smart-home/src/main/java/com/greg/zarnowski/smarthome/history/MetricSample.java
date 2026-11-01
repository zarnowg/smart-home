package com.greg.zarnowski.smarthome.history;

import java.time.LocalDateTime;

public record MetricSample(String metric, String sourceId, Double value, LocalDateTime recordedAt) {}
