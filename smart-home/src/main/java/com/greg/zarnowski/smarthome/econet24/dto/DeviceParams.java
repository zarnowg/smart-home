package com.greg.zarnowski.smarthome.econet24.dto;

import java.util.Map;

public record DeviceParams(
        String uid,
        Integer wifiQuality,
        String wifiStrength,
        Long currentParamsVer,
        Map<String, Object> curr) {}
