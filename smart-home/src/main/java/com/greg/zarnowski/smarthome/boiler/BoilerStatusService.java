package com.greg.zarnowski.smarthome.boiler;

import com.greg.zarnowski.smarthome.econet24.Econet24Client;
import java.util.Map;
import org.springframework.stereotype.Service;

/** Builds the boiler status from econet24 device parameters. */
@Service
public class BoilerStatusService {

    private final Econet24Client client;

    public BoilerStatusService(Econet24Client client) {
        this.client = client;
    }

    public BoilerStatus getStatus() {
        Map<String, Object> curr = client.getDeviceParams().curr();
        Map<String, Object> reg = client.getDeviceRegParams().data();
        Double lambda = number(curr, "lambdaLevel");
        return new BoilerStatus(
                round(number(curr, "tempCO")),
                round(number(curr, "tempFeeder")),
                round(number(curr, "tempExternalSensor")),
                round(number(curr, "tempFlueGas")),
                round(number(curr, "tempCWU")),
                round(number(curr, "tempUpperBuffer")),
                round(number(curr, "tempLowerBuffer")),
                integer(curr, "fuelLevel"),
                isOn(curr.get("thermostat")),
                lambda == null ? null : round(lambda / 10),
                isOn(curr.get("pumpCO")),
                isOn(curr.get("fan")),
                isOn(curr.get("feeder")),
                isOn(curr.get("lighter")),
                isOn(curr.get("pumpCWU")),
                isOn(curr.get("feeder2Additional")),
                integer(curr, "boilerPower"),
                mixer(reg, "1031", "1287", "132", "1544", "150", "154"),
                mixer(reg, "1032", "1288", "133", "1547", "151", "155"));
    }

    private static MixerStatus mixer(
            Map<String, Object> reg, String temp, String target, String thermostat, String pump, String valve, String actuator) {
        return new MixerStatus(
                round(number(reg, temp)),
                round(number(reg, target)),
                isOn(reg.get(thermostat)),
                isOn(reg.get(pump)),
                integer(reg, valve),
                actuatorState(integer(reg, actuator)));
    }

    private static String actuatorState(Integer code) {
        if (code == null) {
            return null;
        }
        return switch (code) {
            case 0 -> "STOP";
            case 1 -> "OPENING";
            case 2 -> "CLOSING";
            default -> "UNKNOWN_" + code;
        };
    }

    private static Double number(Map<String, Object> curr, String key) {
        return curr.get(key) instanceof Number n ? n.doubleValue() : null;
    }

    private static Integer integer(Map<String, Object> curr, String key) {
        return curr.get(key) instanceof Number n ? n.intValue() : null;
    }

    private static Double round(Double value) {
        return value == null ? null : Math.round(value * 10) / 10.0;
    }

    private static Boolean isOn(Object value) {
        if (value instanceof Boolean b) {
            return b;
        }
        return value instanceof Number n ? n.intValue() != 0 : null;
    }
}
