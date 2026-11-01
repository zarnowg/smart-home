package com.greg.zarnowski.smarthome.boiler;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Exposes the boiler status over REST. */
@RestController
public class BoilerController {

    private final BoilerStatusService service;

    public BoilerController(BoilerStatusService service) {
        this.service = service;
    }

    @GetMapping("/api/boiler/status")
    public BoilerStatus status() {
        return service.getStatus();
    }
}
