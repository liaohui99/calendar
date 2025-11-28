package com.calendar.chart.entity;

import lombok.Data;

@Data
public class ChatMessages {

    private Integer id;             // 主键
    private String messageId;       // 会话 ID（对应 memoryId）
    private String content;         // 会话消息 JSON
}
