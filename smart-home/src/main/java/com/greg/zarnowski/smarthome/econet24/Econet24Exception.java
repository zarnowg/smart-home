package com.greg.zarnowski.smarthome.econet24;

/** Signals a login or API failure when calling econet24. */
public class Econet24Exception extends RuntimeException {

    public Econet24Exception(String message) {
        super(message);
    }

    public Econet24Exception(String message, Throwable cause) {
        super(message, cause);
    }
}
