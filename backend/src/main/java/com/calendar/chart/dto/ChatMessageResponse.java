package com.calendar.chart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 会话消息响应DTO
 * 使用简单的字符串列表，避免LangChain4j消息类型的序列化问题
 * 
 * @author Calendar Chart Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {

    /**
     * 会话ID
     */
    private Long memoryId;

    /**
     * 消息内容列表，每个元素是一条消息的JSON字符串
     */
    private List<String> messages;

    // 显式添加builder方法以确保Lombok问题时代码仍可编译
    public static ChatMessageResponseBuilder builder() {
        return new ChatMessageResponseBuilder();
    }

    public Long getMemoryId() {
        return memoryId;
    }

    public void setMemoryId(Long memoryId) {
        this.memoryId = memoryId;
    }

    public List<String> getMessages() {
        return messages;
    }

    public void setMessages(List<String> messages) {
        this.messages = messages;
    }

    public static class ChatMessageResponseBuilder {
        private Long memoryId;
        private List<String> messages;

        public ChatMessageResponseBuilder memoryId(Long memoryId) {
            this.memoryId = memoryId;
            return this;
        }

        public ChatMessageResponseBuilder messages(List<String> messages) {
            this.messages = messages;
            return this;
        }

        public ChatMessageResponse build() {
            ChatMessageResponse response = new ChatMessageResponse();
            response.memoryId = this.memoryId;
            response.messages = this.messages;
            return response;
        }
    }
}
