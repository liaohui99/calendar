package com.calendar.chart;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;

/**
 * 设备预约系统后端主应用类
 * @author CalendarChart
 */
@SpringBootApplication(exclude = {
        RedisAutoConfiguration.class,
        RedisRepositoriesAutoConfiguration.class
})
@MapperScan("com.calendar.chart.dao") // 扫描MyBatis接口
public class CalendarChartApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(CalendarChartApplication.class, args);
    }
}