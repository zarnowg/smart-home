package com.greg.zarnowski.smarthome.boiler;

import java.util.Map;

final class ValueReader {

    private ValueReader() {}

    static Double number(Map<String, Object> values, String key) {
        return values.get(key) instanceof Number n ? n.doubleValue() : null;
    }

    static Integer integer(Map<String, Object> values, String key) {
        return values.get(key) instanceof Number n ? n.intValue() : null;
    }

    static String text(Map<String, Object> values, String key) {
        return values.get(key) instanceof String s ? s : null;
    }

    static Double round(Double value) {
        return value == null ? null : Math.round(value * 10) / 10.0;
    }

    static Boolean isOn(Object value) {
        if (value instanceof Boolean b) {
            return b;
        }
        return value instanceof Number n ? n.intValue() != 0 : null;
    }
}
