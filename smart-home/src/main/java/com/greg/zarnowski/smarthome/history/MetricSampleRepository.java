package com.greg.zarnowski.smarthome.history;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class MetricSampleRepository {

    private final JdbcClient jdbc;

    public MetricSampleRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public void saveAll(List<MetricSample> samples) {
        for (MetricSample sample : samples) {
            jdbc.sql("INSERT INTO metric_sample (metric, source_id, metric_value, recorded_at) VALUES (?, ?, ?, ?)")
                    .params(sample.metric(), sample.sourceId(), sample.value(), Timestamp.valueOf(sample.recordedAt()))
                    .update();
        }
    }

    public List<HistoryPoint> find(String metric, String sourceId, LocalDateTime from, LocalDateTime to) {
        return jdbc.sql("SELECT recorded_at, metric_value FROM metric_sample "
                        + "WHERE metric = ? AND source_id = ? AND recorded_at >= ? AND recorded_at <= ? "
                        + "ORDER BY recorded_at")
                .params(metric, sourceId, Timestamp.valueOf(from), Timestamp.valueOf(to))
                .query((rs, i) -> new HistoryPoint(
                        rs.getTimestamp("recorded_at").toLocalDateTime(), (Double) rs.getObject("metric_value")))
                .list();
    }

    public List<String> findMetrics() {
        return jdbc.sql("SELECT DISTINCT metric FROM metric_sample ORDER BY metric")
                .query(String.class)
                .list();
    }

    public int deleteOlderThan(LocalDateTime threshold) {
        return jdbc.sql("DELETE FROM metric_sample WHERE recorded_at < ?")
                .param(Timestamp.valueOf(threshold))
                .update();
    }
}
