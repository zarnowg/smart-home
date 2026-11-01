package com.greg.zarnowski.smarthome.boiler;

public record MixerStatus(
        Double temperature,
        Double targetTemperature,
        Boolean roomThermostat,
        Boolean pump,
        Integer valvePercent,
        String actuator) {}
