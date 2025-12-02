package com.calendar.chart.dto;

import dev.langchain4j.model.output.structured.Description;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;

/**
 * 预约请求数据传输对象
 * @author CalendarChart
 */
@Data
public class ReservationRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 设备ID
     */
    @Description("设备ID，用于标识预约的具体设备")
    @NotNull(message = "设备ID不能为空")
    private Integer deviceId;

    /**
     * 预约人姓名
     */
    @Description("预约人姓名，字符串类型，不能为空")
    @NotBlank(message = "预约人姓名不能为空")
    private String userName;

    /**
     * 预约人联系方式
     */
    @Description("预约人联系方式，通常为电话号码，字符串类型，不能为空")
    @NotBlank(message = "联系方式不能为空")
    private String userContact;

    /**
     * 预约开始时间 (格式：yyyy-MM-dd HH:mm)
     */
    @Description("预约开始时间，格式为'yyyy-MM-dd HH:mm'，例如'2024-01-01 09:00'，字符串类型，不能为空")
    @NotBlank(message = "开始时间不能为空")
    private String startTime;

    /**
     * 预约结束时间 (格式：yyyy-MM-dd HH:mm)
     */
    @Description("预约结束时间，格式为'yyyy-MM-dd HH:mm'，必须晚于开始时间，字符串类型，不能为空")
    @NotBlank(message = "结束时间不能为空")
    private String endTime;

    /**
     * 预约事由
     */
    @Description("预约事由，描述为什么需要预约该设备，字符串类型，不能为空")
    @NotBlank(message = "预约事由不能为空")
    private String reason;
}