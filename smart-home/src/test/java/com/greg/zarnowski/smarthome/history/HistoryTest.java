package com.greg.zarnowski.smarthome.history;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.greg.zarnowski.smarthome.boiler.MixerStatus;
import com.greg.zarnowski.smarthome.boiler.MixerStatusService;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseBuilder;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType;

class HistoryTest {

    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-11-01T12:00:00Z"), ZoneOffset.UTC);

    private MetricSampleRepository newRepository() {
        var db = new EmbeddedDatabaseBuilder()
                .generateUniqueName(true)
                .setType(EmbeddedDatabaseType.H2)
                .addScript("schema.sql")
                .build();
        return new MetricSampleRepository(JdbcClient.create(db));
    }

    @Test
    void givenSavedSamples_whenFind_thenReturnsOnlyMatchingRangeInOrder() {
        // given
        MetricSampleRepository repository = newRepository();
        LocalDateTime base = LocalDateTime.of(2026, 11, 1, 10, 0);
        repository.saveAll(List.of(
                new MetricSample("m", "1", 20.0, base.plusMinutes(1)),
                new MetricSample("m", "1", 10.0, base),
                new MetricSample("m", "2", 99.0, base),
                new MetricSample("m", "1", 30.0, base.plusHours(5))));

        // when
        List<HistoryPoint> points = repository.find("m", "1", base, base.plusHours(1));

        // then
        assertThat(points).extracting(HistoryPoint::value).containsExactly(10.0, 20.0);
        assertThat(repository.findMetrics()).containsExactly("m");
    }

    @Test
    void givenOldSamples_whenDeleteOlderThan_thenKeepsRecentOnes() {
        // given
        MetricSampleRepository repository = newRepository();
        LocalDateTime now = LocalDateTime.of(2026, 11, 1, 12, 0);
        repository.saveAll(List.of(
                new MetricSample("m", "1", 1.0, now.minusDays(400)),
                new MetricSample("m", "1", 2.0, now.minusDays(1))));

        // when
        int deleted = repository.deleteOlderThan(now.minusDays(365));

        // then
        assertThat(deleted).isEqualTo(1);
        assertThat(repository.find("m", "1", now.minusDays(500), now)).hasSize(1);
    }

    @Test
    void givenFailingCollector_whenCollectAll_thenOtherCollectorStillSaves() {
        // given
        MetricSampleRepository repository = mock(MetricSampleRepository.class);
        MetricCollector failing = mock(MetricCollector.class);
        MetricCollector working = mock(MetricCollector.class);
        when(failing.collect()).thenThrow(new RuntimeException("boom"));
        List<MetricSample> samples = List.of(new MetricSample("m", "1", 1.0, LocalDateTime.now(CLOCK)));
        when(working.collect()).thenReturn(samples);
        var scheduler = new MetricScheduler(List.of(failing, working), repository, CLOCK, Duration.ofDays(365));

        // when
        scheduler.collectAll();

        // then
        verify(repository).saveAll(samples);
        verify(repository, never()).saveAll(List.of());
    }

    @Test
    void givenActiveMixers_whenCollect_thenCreatesValveSamplePerMixer() {
        // given
        MixerStatusService mixerService = mock(MixerStatusService.class);
        when(mixerService.getMixers())
                .thenReturn(List.of(
                        new MixerStatus(1, 30.0, 30.0, false, true, 17, "STOP"),
                        new MixerStatus(2, 28.0, 28.0, true, true, null, "STOP")));

        // when
        List<MetricSample> samples = new MixerValveCollector(mixerService, CLOCK).collect();

        // then
        assertThat(samples).hasSize(1);
        assertThat(samples.get(0).metric()).isEqualTo("mixer.valvePercent");
        assertThat(samples.get(0).sourceId()).isEqualTo("1");
        assertThat(samples.get(0).value()).isEqualTo(17.0);
    }
}
