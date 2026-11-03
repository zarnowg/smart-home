package com.greg.zarnowski.smarthome.history;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

/** Averages history points into equal time buckets. */
final class HistoryBuckets {

    private HistoryBuckets() {}

    static List<HistoryPoint> average(List<HistoryPoint> points, Duration bucket) {
        long bucketSeconds = bucket.toSeconds();
        List<HistoryPoint> result = new ArrayList<>();
        long currentBucket = Long.MIN_VALUE;
        double sum = 0;
        int count = 0;
        for (HistoryPoint point : points) {
            long start = Math.floorDiv(point.time().toEpochSecond(ZoneOffset.UTC), bucketSeconds) * bucketSeconds;
            if (start != currentBucket) {
                flush(result, currentBucket, sum, count);
                currentBucket = start;
                sum = 0;
                count = 0;
            }
            if (point.value() != null) {
                sum += point.value();
                count++;
            }
        }
        flush(result, currentBucket, sum, count);
        return result;
    }

    private static void flush(List<HistoryPoint> result, long bucketStart, double sum, int count) {
        if (bucketStart == Long.MIN_VALUE) {
            return;
        }
        LocalDateTime time = LocalDateTime.ofEpochSecond(bucketStart, 0, ZoneOffset.UTC);
        result.add(new HistoryPoint(time, count == 0 ? null : sum / count));
    }
}
