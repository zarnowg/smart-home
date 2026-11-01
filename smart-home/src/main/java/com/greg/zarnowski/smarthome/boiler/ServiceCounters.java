package com.greg.zarnowski.smarthome.boiler;

public record ServiceCounters(
        Integer hoursAtPower100,
        Integer hoursAtPower50,
        Integer hoursAtPower30,
        Integer ignitions,
        Integer feederHours) {}
