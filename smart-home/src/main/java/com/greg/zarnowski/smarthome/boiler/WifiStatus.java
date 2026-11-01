package com.greg.zarnowski.smarthome.boiler;

public record WifiStatus(
        Boolean connected,
        String ssid,
        String security,
        Integer signalPercent,
        String ip,
        String mask,
        String gateway,
        Boolean serverConnected) {}
