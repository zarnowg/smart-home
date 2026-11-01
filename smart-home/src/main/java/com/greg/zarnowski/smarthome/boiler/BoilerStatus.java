package com.greg.zarnowski.smarthome.boiler;

public record BoilerStatus(
        Double boilerTemperature,
        Double feederTemperature,
        Double outdoorTemperature,
        Double flueGasTemperature,
        Double hotWaterTemperature,
        Double upperBufferTemperature,
        Double lowerBufferTemperature,
        Integer fuelLevel,
        Boolean boilerThermostat,
        Double oxygenPercent,
        Boolean boilerPump,
        Boolean blower,
        Boolean feeder,
        Boolean igniter,
        Boolean hotWaterPump,
        Boolean additionalFeeder,
        Integer boilerPowerPercent,
        WifiStatus wifi,
        ServiceCounters serviceCounters) {}
