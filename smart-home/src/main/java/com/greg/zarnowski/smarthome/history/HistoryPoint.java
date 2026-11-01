package com.greg.zarnowski.smarthome.history;

import java.time.LocalDateTime;

public record HistoryPoint(LocalDateTime time, Double value) {}
