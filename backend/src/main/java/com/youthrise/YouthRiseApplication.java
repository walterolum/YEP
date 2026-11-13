package com.youthrise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class YouthRiseApplication {

    public static void main(String[] args) {
        SpringApplication.run(YouthRiseApplication.class, args);
    }
}
