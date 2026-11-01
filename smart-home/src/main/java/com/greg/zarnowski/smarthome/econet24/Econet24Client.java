package com.greg.zarnowski.smarthome.econet24;

import com.greg.zarnowski.smarthome.econet24.dto.DeviceAlarm;
import com.greg.zarnowski.smarthome.econet24.dto.DeviceParams;
import com.greg.zarnowski.smarthome.econet24.dto.DeviceRegParams;
import com.greg.zarnowski.smarthome.econet24.dto.DeviceSysParams;
import java.net.CookieManager;
import java.net.URI;
import java.net.http.HttpClient;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/** Client for the econet24.com web API. Logs in with a form and reuses the session cookie. */
@Service
public class Econet24Client {

    private static final Pattern CSRF_PATTERN =
            Pattern.compile("name=\"csrfmiddlewaretoken\"\\s+value=\"([^\"]+)\"");

    private final RestClient restClient;
    private final JsonMapper jsonMapper;
    private final Econet24Properties properties;

    @Autowired
    public Econet24Client(JsonMapper jsonMapper, Econet24Properties properties) {
        this(
                RestClient.builder()
                        .baseUrl(properties.baseUrl())
                        .requestFactory(new JdkClientHttpRequestFactory(
                                HttpClient.newBuilder().cookieHandler(new CookieManager()).build()))
                        .build(),
                jsonMapper,
                properties);
    }

    Econet24Client(RestClient restClient, JsonMapper jsonMapper, Econet24Properties properties) {
        this.restClient = restClient;
        this.jsonMapper = jsonMapper;
        this.properties = properties;
    }

    public synchronized void login() {
        requireCredentials();
        String loginPage = restClient.get().uri("/login/").retrieve().body(String.class);
        Matcher matcher = CSRF_PATTERN.matcher(loginPage == null ? "" : loginPage);
        if (!matcher.find()) {
            throw new Econet24Exception("CSRF token not found on the login page");
        }
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("csrfmiddlewaretoken", matcher.group(1));
        form.add("username", properties.username());
        form.add("password", properties.password());
        var response = restClient
                .post()
                .uri("/login/")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .header("Referer", properties.baseUrl() + "/login/")
                .body(form)
                .retrieve()
                .toBodilessEntity();
        if (!response.getStatusCode().is3xxRedirection()) {
            throw new Econet24Exception("Login failed: check username and password");
        }
    }

    public boolean isLoggedIn() {
        JsonNode node = fetch("/service/getCurrentState");
        return node.path("logged_in").asBoolean(false);
    }

    public DeviceParams getDeviceParams(String uid) {
        return get("/service/getDeviceParams?uid={uid}", new TypeReference<>() {}, uid);
    }

    public DeviceParams getDeviceParams() {
        return getDeviceParams(defaultUid());
    }

    public DeviceRegParams getDeviceRegParams() {
        return getDeviceRegParams(defaultUid());
    }

    public DeviceRegParams getDeviceRegParams(String uid) {
        return get("/service/getDeviceRegParams?uid={uid}", new TypeReference<>() {}, uid);
    }

    public DeviceSysParams getDeviceSysParams(String uid) {
        return get("/service/getDeviceSysParams?uid={uid}", new TypeReference<>() {}, uid);
    }

    public List<DeviceAlarm> getDeviceAlarms(String uid) {
        return get("/service/getDeviceAlarms?uid={uid}", new TypeReference<>() {}, uid);
    }

    public Map<String, List<List<Object>>> getHistoryParamsValues(String uid, LocalDate from, LocalDate to) {
        return get(
                "/service/getHistoryParamsValues?uid={uid}&fromDate={from}&toDate={to}",
                new TypeReference<>() {},
                uid,
                from,
                to);
    }

    private <T> T get(String uriTemplate, TypeReference<T> type, Object... uriVariables) {
        JsonNode node = fetch(uriTemplate, uriVariables);
        if (isSessionError(node)) {
            login();
            node = fetch(uriTemplate, uriVariables);
        }
        if (isSessionError(node)) {
            throw new Econet24Exception("econet24 returned an error: " + node.path("error").asString());
        }
        return jsonMapper.convertValue(node, type);
    }

    private JsonNode fetch(String uriTemplate, Object... uriVariables) {
        try {
            JsonNode node = restClient.get().uri(uriTemplate, uriVariables).retrieve().body(JsonNode.class);
            if (node == null) {
                throw new Econet24Exception("Empty response from econet24");
            }
            return node;
        } catch (RestClientException e) {
            throw new Econet24Exception("Call to econet24 failed: " + uriTemplate, e);
        }
    }

    private boolean isSessionError(JsonNode node) {
        return node.isObject() && node.has("error");
    }

    private String defaultUid() {
        if (properties.deviceUid() == null || properties.deviceUid().isBlank()) {
            throw new Econet24Exception("econet24.device-uid is not configured");
        }
        return properties.deviceUid();
    }

    private void requireCredentials() {
        if (properties.username() == null
                || properties.username().isBlank()
                || properties.password() == null
                || properties.password().isBlank()) {
            throw new Econet24Exception("econet24.username and econet24.password must be configured");
        }
    }
}
