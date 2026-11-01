package com.greg.zarnowski.smarthome.econet24.dto;

public record DeviceSysParams(
        String uid, String label, String controllerID, String softVer, String protocolType, String wlan0) {}
