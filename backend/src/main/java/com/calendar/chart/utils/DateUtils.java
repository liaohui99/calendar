package com.calendar.chart.utils;

import dev.langchain4j.agent.tool.Tool;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * @author Gabriel
 * @version 1.0
 * @date 2025/12/3 14:42
 * @description: TODO
 */
@Component("dateUtils")
public class DateUtils {

    /**
     * @Author Gabriel
     * @Description 获取当前系统时间和日期-返回格式 2025-12-03 14:42:05
     * @Date 2025/12/3 14:42
     **/
    /**
     * @return 格式为 yyyy-MM-dd HH:mm:ss 的日期时间字符串
     * @Author Gabriel
     * @Description 获取当前系统时间和日期
     * @Date 2025/12/3 14:42
     **/
    @Tool(name = "getCurrentDateTime",value = "获取当前系统时间和日期")
    public String getCurrentDateTime() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return LocalDateTime.now().format(formatter);
    }

}
