package com.greg.zarnowski.smarthome;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:contexttest",
        "spring.datasource.username=sa",
        "spring.datasource.password="
})
class SmartHomeApplicationTests {

    @Test
    void contextLoads() {
    }

}
