package com.greg.zarnowski.smarthome.boiler;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Exposes the boiler status over REST. */
@RestController
public class BoilerController {

    private final BoilerStatusService service;
    private final MixerStatusService mixerService;

    public BoilerController(BoilerStatusService service, MixerStatusService mixerService) {
        this.service = service;
        this.mixerService = mixerService;
    }

    @GetMapping("/api/boiler/status")
    public BoilerStatus status() {
        return service.getStatus();
    }

    @GetMapping("/api/boiler/mixers")
    public List<Integer> mixerIds() {
        return mixerService.getMixerIds();
    }

    @GetMapping("/api/boiler/mixers/details")
    public List<MixerStatus> mixers() {
        return mixerService.getMixers();
    }

    @GetMapping("/api/boiler/mixers/{id}")
    public MixerStatus mixer(@PathVariable int id) {
        return mixerService
                .getMixer(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mixer not found: " + id));
    }
}
