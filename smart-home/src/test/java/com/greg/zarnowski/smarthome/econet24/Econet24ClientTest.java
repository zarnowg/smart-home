package com.greg.zarnowski.smarthome.econet24;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.greg.zarnowski.smarthome.econet24.dto.DeviceParams;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.json.JsonMapper;

class Econet24ClientTest {

    private static final String BASE = "https://econet.test";
    private static final String LOGIN_PAGE =
            "<form><input type=\"hidden\" name=\"csrfmiddlewaretoken\" value=\"tok123\"></form>";
    private static final String PARAMS_JSON =
            "{\"uid\":\"U1\",\"wifiQuality\":61,\"wifiStrength\":\"-64\",\"currentParamsVer\":1,\"curr\":{\"tempCO\":55.5}}";

    private MockRestServiceServer server;
    private Econet24Client client;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder().baseUrl(BASE);
        server = MockRestServiceServer.bindTo(builder).build();
        Econet24Properties properties = new Econet24Properties(BASE, "user@test.com", "secret", "U1");
        client = new Econet24Client(builder.build(), JsonMapper.builder().build(), properties);
    }

    @Test
    void givenSessionExpired_whenGetDeviceParams_thenLogsInAndRetries() {
        // given
        server.expect(requestTo(BASE + "/service/getDeviceParams?uid=U1"))
                .andRespond(withSuccess("{\"error\":\"controller_view_not_allowed\"}", MediaType.APPLICATION_JSON));
        server.expect(requestTo(BASE + "/login/")).andExpect(method(HttpMethod.GET)).andRespond(withSuccess(LOGIN_PAGE, MediaType.TEXT_HTML));
        server.expect(requestTo(BASE + "/login/"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("csrfmiddlewaretoken=tok123")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("username=user%40test.com")))
                .andRespond(withStatus(HttpStatus.FOUND));
        server.expect(requestTo(BASE + "/service/getDeviceParams?uid=U1"))
                .andRespond(withSuccess(PARAMS_JSON, MediaType.APPLICATION_JSON));

        // when
        DeviceParams params = client.getDeviceParams();

        // then
        assertThat(params.uid()).isEqualTo("U1");
        assertThat(params.curr()).containsEntry("tempCO", 55.5);
        server.verify();
    }

    @Test
    void givenWrongPassword_whenLogin_thenThrowsEconet24Exception() {
        // given
        server.expect(requestTo(BASE + "/login/")).andRespond(withSuccess(LOGIN_PAGE, MediaType.TEXT_HTML));
        server.expect(requestTo(BASE + "/login/")).andExpect(method(HttpMethod.POST)).andRespond(withSuccess("<form/>", MediaType.TEXT_HTML));

        // when / then
        assertThatThrownBy(() -> client.login()).isInstanceOf(Econet24Exception.class).hasMessageContaining("Login failed");
    }

    @Test
    void givenErrorAfterRelogin_whenGetDeviceParams_thenThrowsEconet24Exception() {
        // given
        String error = "{\"error\":\"controller_view_not_allowed\"}";
        server.expect(requestTo(BASE + "/service/getDeviceParams?uid=U1")).andRespond(withSuccess(error, MediaType.APPLICATION_JSON));
        server.expect(requestTo(BASE + "/login/")).andRespond(withSuccess(LOGIN_PAGE, MediaType.TEXT_HTML));
        server.expect(requestTo(BASE + "/login/")).andExpect(method(HttpMethod.POST)).andRespond(withStatus(HttpStatus.FOUND));
        server.expect(requestTo(BASE + "/service/getDeviceParams?uid=U1")).andRespond(withSuccess(error, MediaType.APPLICATION_JSON));

        // when / then
        assertThatThrownBy(() -> client.getDeviceParams()).isInstanceOf(Econet24Exception.class).hasMessageContaining("controller_view_not_allowed");
    }
}
