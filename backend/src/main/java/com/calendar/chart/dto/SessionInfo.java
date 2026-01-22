package com.calendar.chart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 会话信息DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionInfo {

    /**
     * 会话ID
     */
    private Long memoryId;

    /**
     * 会话标题（第一条用户消息的前20个字符）
     */
    private String title;

    /**
     * 消息数量
     */
    private Integer messageCount;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

    // 显式添加builder方法以确保Lombok问题时代码仍可编译
    public static SessionInfoBuilder builder() {
        return new SessionInfoBuilder();
    }

    public Long getMemoryId() {
        return memoryId;
    }

    public void setMemoryId(Long memoryId) {
        this.memoryId = memoryId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getMessageCount() {
        return messageCount;
    }

    public void setMessageCount(Integer messageCount) {
        this.messageCount = messageCount;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }

    public static class SessionInfoBuilder {
        private Long memoryId;
        private String title;
        private Integer messageCount;
        private LocalDateTime createTime;
        private LocalDateTime updateTime;

        public SessionInfoBuilder memoryId(Long memoryId) {
            this.memoryId = memoryId;
            return this;
        }

        public SessionInfoBuilder title(String title) {
            this.title = title;
            return this;
        }

        public SessionInfoBuilder messageCount(Integer messageCount) {
            this.messageCount = messageCount;
            return this;
        }

        public SessionInfoBuilder createTime(LocalDateTime createTime) {
            this.createTime = createTime;
            return this;
        }

        public SessionInfoBuilder updateTime(LocalDateTime updateTime) {
            this.updateTime = updateTime;
            return this;
        }

        public SessionInfo build() {
            SessionInfo info = new SessionInfo();
            info.memoryId = this.memoryId;
            info.title = this.title;
            info.messageCount = this.messageCount;
            info.createTime = this.createTime;
            info.updateTime = this.updateTime;
            return info;
        }
    }
}