package com.greg.zarnowski.smarthome.boiler;

import static com.greg.zarnowski.smarthome.boiler.ValueReader.integer;
import static com.greg.zarnowski.smarthome.boiler.ValueReader.isOn;
import static com.greg.zarnowski.smarthome.boiler.ValueReader.number;
import static com.greg.zarnowski.smarthome.boiler.ValueReader.round;

import com.greg.zarnowski.smarthome.econet24.Econet24Client;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.IntStream;
import org.springframework.stereotype.Service;

/** Builds mixer data from econet24 registry parameters. */
@Service
public class MixerStatusService {

    private static final int MIXER_COUNT = 4;

    private final Econet24Client client;

    public MixerStatusService(Econet24Client client) {
        this.client = client;
    }

    public List<Integer> getMixerIds() {
        return getMixers().stream().map(MixerStatus::id).toList();
    }

    public List<MixerStatus> getMixers() {
        Map<String, Object> reg = client.getDeviceRegParams().data();
        return IntStream.rangeClosed(1, MIXER_COUNT)
                .mapToObj(id -> read(reg, id))
                .flatMap(Optional::stream)
                .toList();
    }

    public Optional<MixerStatus> getMixer(int id) {
        if (id < 1 || id > MIXER_COUNT) {
            return Optional.empty();
        }
        return read(client.getDeviceRegParams().data(), id);
    }

    private static Optional<MixerStatus> read(Map<String, Object> reg, int id) {
        if (!exists(reg, id)) {
            return Optional.empty();
        }
        return Optional.of(new MixerStatus(
                id,
                round(number(reg, key(1031, id))),
                round(number(reg, key(1287, id))),
                isOn(reg.get(key(132, id))),
                isOn(reg.get(key(1544, id, 3))),
                integer(reg, key(150, id)),
                actuatorState(integer(reg, key(154, id)))));
    }

    private static boolean exists(Map<String, Object> reg, int id) {
        return number(reg, key(1031, id)) != null;
    }

    private static String key(int firstMixerKey, int id) {
        return key(firstMixerKey, id, 1);
    }

    private static String key(int firstMixerKey, int id, int step) {
        return String.valueOf(firstMixerKey + (id - 1) * step);
    }

    private static String actuatorState(Integer code) {
        if (code == null) {
            return null;
        }
        return switch (code) {
            case 0 -> "STOP";
            case 1 -> "OPENING";
            case 2 -> "CLOSING";
            default -> "UNKNOWN_" + code;
        };
    }
}
