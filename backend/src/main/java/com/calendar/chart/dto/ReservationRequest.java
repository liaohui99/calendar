package com.calendar.chart.dto;

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
    @NotNull(message = "设备ID不能为空")
    private Integer deviceId;

    /**
     * 预约人姓名
     */
    @NotBlank(message = "预约人姓名不能为空")
    private String userName;

    /**
     * 预约人联系方式
     */
    @NotBlank(message = "联系方式不能为空")
    private String userContact;

    /**
     * 预约开始时间 (格式：yyyy-MM-dd HH:mm)
     */
    @NotBlank(message = "开始时间不能为空")
    private String startTime;

    /**
     * 预约结束时间 (格式：yyyy-MM-dd HH:mm)
     */
    @NotBlank(message = "结束时间不能为空")
    private String endTime;

    /**
     * 预约事由
     */
    @NotBlank(message = "预约事由不能为空")
    private String reason;
}