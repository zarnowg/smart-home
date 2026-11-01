package com.greg.zarnowski.smarthome.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class SpaForwardControllerTest {

    private final MockMvc mockMvc =
            MockMvcBuilders.standaloneSetup(new SpaForwardController()).build();

    @Test
    void givenFrontendRoute_whenGet_thenForwardsToIndexHtml() throws Exception {
        // when
        var page = mockMvc.perform(get("/piec"));
        var subPage = mockMvc.perform(get("/dom/parter"));

        // then
        page.andExpect(forwardedUrl("/index.html"));
        subPage.andExpect(forwardedUrl("/index.html"));
    }

    @Test
    void givenApiOrStaticFilePath_whenGet_thenDoesNotForward() throws Exception {
        // when
        var api = mockMvc.perform(get("/api/unknown"));
        var asset = mockMvc.perform(get("/assets/index.js"));

        // then
        api.andExpect(status().isNotFound());
        asset.andExpect(status().isNotFound());
    }
}
