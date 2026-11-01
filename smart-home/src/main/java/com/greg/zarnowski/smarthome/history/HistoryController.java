package com.greg.zarnowski.smarthome.history;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Exposes stored metric history over REST. */
@RestController
public class HistoryController {

    private static final Duration MAX_RANGE = Duration.ofDays(31);

    private final MetricSampleRepository repository;
    private final Clock clock;

    public HistoryController(MetricSampleRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @GetMapping("/api/history/metrics")
    public List<String> metrics() {
        return repository.findMetrics();
    }

    @GetMapping("/api/history/{metric}")
    public List<HistoryPoint> history(
            @PathVariable String metric,
            @RequestParam(defaultValue = "1") String sourceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        LocalDateTime end = to != null ? to : LocalDateTime.now(clock);
        LocalDateTime start = from != null ? from : end.minusDays(1);
        if (start.isAfter(end)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "from must be before to");
        }
        if (Duration.between(start, end).compareTo(MAX_RANGE) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Range is limited to 31 days");
        }
        return repository.find(metric, sourceId, start, end);
    }
}
