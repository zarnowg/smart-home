package com.greg.zarnowski.smarthome.boiler;

import static com.greg.zarnowski.smarthome.boiler.ValueReader.integer;
import static com.greg.zarnowski.smarthome.boiler.ValueReader.isOn;
import static com.greg.zarnowski.smarthome.boiler.ValueReader.number;
import static com.greg.zarnowski.smarthome.boiler.ValueReader.round;
import static com.greg.zarnowski.smarthome.boiler.ValueReader.text;

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
                round(number(reg, "1280")),
                round(number(curr, "tempFeeder")),
                round(number(curr, "tempExternalSensor")),
                round(number(curr, "tempFlueGas")),
                round(number(curr, "tempCWU")),
                round(number(reg, "1281")),
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
                new WifiStatus(
                        isOn(reg.get("182")),
                        text(reg, "184"),
                        wifiSecurity(integer(reg, "180")),
                        integer(reg, "181"),
                        text(reg, "176"),
                        text(reg, "177"),
                        text(reg, "178"),
                        isOn(reg.get("179"))),
                new ServiceCounters(
                        integer(reg, "166"),
                        integer(reg, "167"),
                        integer(reg, "168"),
                        integer(reg, "170"),
                        integer(reg, "169")));
    }

    private static String wifiSecurity(Integer code) {
        if (code == null) {
            return null;
        }
        return code == 4 ? "WPA2" : "UNKNOWN_" + code;
    }
}
