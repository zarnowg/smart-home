package com.greg.zarnowski.smarthome.boiler;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.greg.zarnowski.smarthome.econet24.Econet24Client;
import com.greg.zarnowski.smarthome.econet24.dto.DeviceParams;
import com.greg.zarnowski.smarthome.econet24.dto.DeviceRegParams;
import java.util.Map;
import org.junit.jupiter.api.Test;

class BoilerStatusServiceTest {

    @Test
    void givenDeviceParams_whenGetStatus_thenMapsAndRoundsValues() {
        // given
        Econet24Client client = mock(Econet24Client.class);
        Map<String, Object> curr = Map.of(
                "tempCO", 66.62198638916016,
                "lambdaLevel", 183,
                "thermostat", 1,
                "pumpCO", true,
                "feeder", false,
                "boilerPower", 30,
                "fuelLevel", 0);
        Map<String, Object> reg = Map.of(
                "1031", 30.279739379882812,
                "1287", 30,
                "132", false,
                "1544", true,
                "150", 17,
                "154", 0,
                "133", true,
                "155", 2);
        when(client.getDeviceParams()).thenReturn(new DeviceParams("U1", 61, "-64", 1L, curr));
        when(client.getDeviceRegParams()).thenReturn(new DeviceRegParams(reg));

        // when
        BoilerStatus status = new BoilerStatusService(client).getStatus();

        // then
        assertThat(status.boilerTemperature()).isEqualTo(66.6);
        assertThat(status.oxygenPercent()).isEqualTo(18.3);
        assertThat(status.boilerThermostat()).isTrue();
        assertThat(status.boilerPump()).isTrue();
        assertThat(status.feeder()).isFalse();
        assertThat(status.boilerPowerPercent()).isEqualTo(30);
        assertThat(status.upperBufferTemperature()).isNull();
        assertThat(status.mixer1())
                .isEqualTo(new MixerStatus(30.3, 30.0, false, true, 17, "STOP"));
        assertThat(status.mixer2().roomThermostat()).isTrue();
        assertThat(status.mixer2().actuator()).isEqualTo("CLOSING");
    }
}
