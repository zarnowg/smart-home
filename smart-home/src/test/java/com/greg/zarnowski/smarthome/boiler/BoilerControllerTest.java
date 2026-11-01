package com.greg.zarnowski.smarthome.boiler;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class BoilerControllerTest {

    @Test
    void givenActiveMixers_whenGetMixerDetails_thenReturnsAllMixers() throws Exception {
        // given
        MixerStatusService mixerService = mock(MixerStatusService.class);
        when(mixerService.getMixers())
                .thenReturn(List.of(
                        new MixerStatus(1, 35.5, 40.0, true, true, 30, "OPENING"),
                        new MixerStatus(3, 28.0, 30.0, false, false, 0, "STOP")));
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(
                        new BoilerController(mock(BoilerStatusService.class), mixerService))
                .build();

        // when
        var result = mockMvc.perform(get("/api/boiler/mixers/details"));

        // then
        result.andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[1].id").value(3))
                .andExpect(jsonPath("$[0].actuator").value("OPENING"));
    }
}
