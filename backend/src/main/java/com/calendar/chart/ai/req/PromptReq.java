package com.calendar.chart.ai.req;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * @author Gabriel
 * @version 1.0
 * @date 2025/12/2 11:28
 * @description: AI对话请求参数类
 */
@Data
public class PromptReq {

    @NotNull(message = "memoryId不能为空")
    Long memoryId;

    @NotNull(message = "userMessage不能为空")
    String userMessage;

}
