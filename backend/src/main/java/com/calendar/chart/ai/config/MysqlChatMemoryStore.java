package com.calendar.chart.ai.config;

import com.calendar.chart.dao.ChatMemoryStoreDao;
import com.calendar.chart.entity.ChatMessages;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.internal.Json;
import dev.langchain4j.store.memory.chat.ChatMemoryStore;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MysqlChatMemoryStore implements ChatMemoryStore {

    private static final Logger log = LoggerFactory.getLogger(MysqlChatMemoryStore.class);

    private final ChatMemoryStoreDao chatMemoryStoreDao;

    public MysqlChatMemoryStore(ChatMemoryStoreDao chatMemoryStoreDao) {
        this.chatMemoryStoreDao = chatMemoryStoreDao;
    }

    @Override
    public List<ChatMessage> getMessages(Object memoryId) {
        try {
            ChatMessages chatMessages = chatMemoryStoreDao.getMessages(memoryId.toString());
            if (chatMessages == null || chatMessages.getContent() == null) {
                return List.of();  // 无消息时返回空列表
            }
            // JSON 反序列化为 ChatMessage 列表
            log.info("查询会话 {} 消息：{}", memoryId, chatMessages.getContent());
            return Json.fromJson(chatMessages.getContent(), List.class);
        } catch (Exception e) {
            log.error("读取会话 {} 消息失败", memoryId, e);
            return List.of();
        } 
    }

    @Override
    public void updateMessages(Object memoryId, List<ChatMessage> messages) {
        try {
            // ChatMessage 列表序列化为 JSON
            String messagesJson = Json.toJson(messages);
            log.info("会话 {} 待存储消息：{}", memoryId, messagesJson);

            ChatMessages chatMessages = chatMemoryStoreDao.getMessages(memoryId.toString());
            if (chatMessages == null) {
                // 新增会话记录
                ChatMessages newRecord = new ChatMessages();
                newRecord.setMessageId(memoryId.toString());
                newRecord.setContent(messagesJson);
                chatMemoryStoreDao.save(newRecord);
            } else {
                // 更新已有会话记录
                chatMessages.setContent(messagesJson);
                chatMemoryStoreDao.updateData(chatMessages);
            }
        } catch (Exception e) {
            log.error("更新会话 {} 消息失败", memoryId, e);
            throw new RuntimeException("会话消息存储失败", e);
        }

    }

    @Override
    public void deleteMessages(Object memoryId) {
        try {
            chatMemoryStoreDao.deleteByMemoryId(memoryId.toString());
            log.info("删除会话 {} 消息成功", memoryId);
        } catch (Exception e) {
            log.error("删除会话 {} 消息失败", memoryId, e);
            throw new RuntimeException("会话消息删除失败", e);
        }
    }

}
