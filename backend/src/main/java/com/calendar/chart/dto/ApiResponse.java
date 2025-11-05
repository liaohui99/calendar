package com.calendar.chart.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * API响应数据传输对象
 * @author CalendarChart
 */
@Data
public class ApiResponse<T> implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 响应状态码：0表示成功，非0表示失败
     */
    private int code;

    /**
     * 响应消息
     */
    private String message;

    /**
     * 响应数据
     */
    private T data;

    /**
     * 成功响应构造方法
     * @param data 响应数据
     */
    public ApiResponse(T data) {
        this.code = 0;
        this.message = "success";
        this.data = data;
    }

    /**
     * 带消息的响应构造方法
     * @param code 状态码
     * @param message 消息
     * @param data 响应数据
     */
    public ApiResponse(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    /**
     * 创建成功响应
     * @param data 响应数据
     * @param <T> 数据类型
     * @return 响应对象
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(data);
    }

    /**
     * 创建失败响应
     * @param message 错误消息
     * @param <T> 数据类型
     * @return 响应对象
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(500, message, null);
    }

    /**
     * 创建自定义状态码的响应
     * @param code 状态码
     * @param message 消息
     * @param <T> 数据类型
     * @return 响应对象
     */
    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<>(code, message, null);
    }
}