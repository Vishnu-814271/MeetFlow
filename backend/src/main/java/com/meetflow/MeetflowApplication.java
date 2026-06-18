package com.meetflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MeetflowApplication {
    public static void main(String[] args) {
        SpringApplication.run(MeetflowApplication.class, args);
    }
}
