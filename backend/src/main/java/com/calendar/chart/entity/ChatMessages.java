package com.calendar.chart.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 会话消息实体类
 * 用于存储会话消息的JSON数据
 */
@Data
@TableName("chat_messages")
@Entity
@Table(name = "CHAT_MESSAGES")
public class ChatMessages {

    /**
     * 主键ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @TableId(type = IdType.AUTO)
    private Integer id;

    /**
     * 会话ID（对应memoryId）
     */
    @TableField("message_id")
    @Column(name = "MESSAGE_ID")
    private String messageId;

    /**
     * 会话消息JSON
     */
    private String content;

    /**
     * 创建时间
     */
    @TableField("create_time")
    @Column(name = "CREATE_TIME")
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField("update_time")
    @Column(name = "UPDATE_TIME")
    private LocalDateTime updateTime;

    // 显式添加getter和setter以确保Lombok问题时代码仍可编译
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getMessageId() {
        return messageId;
    }

    public void setMessageId(String messageId) {
        this.messageId = messageId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
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
}
