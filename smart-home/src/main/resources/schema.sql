CREATE TABLE IF NOT EXISTS metric_sample (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    metric VARCHAR(100) NOT NULL,
    source_id VARCHAR(50) NOT NULL,
    metric_value DOUBLE PRECISION,
    recorded_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_metric_sample_lookup ON metric_sample (metric, source_id, recorded_at);
