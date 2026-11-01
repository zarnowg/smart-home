package com.greg.zarnowski.smarthome.boiler;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.greg.zarnowski.smarthome.econet24.Econet24Client;
import com.greg.zarnowski.smarthome.econet24.dto.DeviceRegParams;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class MixerStatusServiceTest {

    private MixerStatusService service;

    @BeforeEach
    void setUp() {
        Econet24Client client = mock(Econet24Client.class);
        Map<String, Object> reg = new HashMap<>();
        reg.put("1031", 30.279739379882812);
        reg.put("1287", 30);
        reg.put("132", false);
        reg.put("1544", true);
        reg.put("150", 17);
        reg.put("154", 0);
        reg.put("1032", 28.1);
        reg.put("133", true);
        reg.put("155", 2);
        reg.put("1033", null);
        reg.put("1034", null);
        when(client.getDeviceRegParams()).thenReturn(new DeviceRegParams(reg));
        service = new MixerStatusService(client);
    }

    @Test
    void givenTwoActiveMixers_whenGetMixerIds_thenReturnsOnlyActiveIds() {
        // given
        // when
        var ids = service.getMixerIds();

        // then
        assertThat(ids).containsExactly(1, 2);
    }

    @Test
    void givenActiveMixers_whenGetMixer_thenMapsRegistryValues() {
        // given
        // when
        var mixer1 = service.getMixer(1).orElseThrow();
        var mixer2 = service.getMixer(2).orElseThrow();

        // then
        assertThat(mixer1).isEqualTo(new MixerStatus(1, 30.3, 30.0, false, true, 17, "STOP"));
        assertThat(mixer2.roomThermostat()).isTrue();
        assertThat(mixer2.actuator()).isEqualTo("CLOSING");
    }

    @Test
    void givenInactiveOrUnknownId_whenGetMixer_thenReturnsEmpty() {
        // given
        // when
        var inactive = service.getMixer(3);
        var unknown = service.getMixer(9);

        // then
        assertThat(inactive).isEmpty();
        assertThat(unknown).isEmpty();
    }
}
