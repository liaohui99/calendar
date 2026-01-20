package com.calendar.chart.ai.config.memory;

import com.calendar.chart.dao.ChatMemoryStoreDao;
import com.calendar.chart.entity.ChatMessages;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.internal.Json;
import dev.langchain4j.store.memory.chat.ChatMemoryStore;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * MySQL会话消息存储实现
 * 实现LangChain4j的ChatMemoryStore接口，将会话消息持久化到数据库
 */
@Slf4j
@Component
public class MysqlChatMemoryStore implements ChatMemoryStore {

    private final ChatMemoryStoreDao chatMemoryStoreDao;

    /**
     * 构造函数
     *
     * @param chatMemoryStoreDao 会话消息数据访问对象
     */
    public MysqlChatMemoryStore(ChatMemoryStoreDao chatMemoryStoreDao) {
        this.chatMemoryStoreDao = chatMemoryStoreDao;
    }

    /**
     * 获取指定会话的所有消息
     *
     * @param memoryId 会话ID
     * @return 会话消息列表
     */
    @Override
    public List<ChatMessage> getMessages(Object memoryId) {
        try {
            ChatMessages chatMessages = chatMemoryStoreDao.getMessages(memoryId.toString());
            if (chatMessages == null || chatMessages.getContent() == null) {
                log.debug("会话 {} 无消息记录", memoryId);
                return List.of();
            }
            // JSON 反序列化为 ChatMessage 列表
            log.info("查询会话 {} 消息成功，消息长度：{}", memoryId, chatMessages.getContent().length());
            return Json.fromJson(chatMessages.getContent(), List.class);
        } catch (Exception e) {
            log.error("读取会话 {} 消息失败", memoryId, e);
            return List.of();
        }
    }

    /**
     * 更新指定会话的所有消息
     *
     * @param memoryId 会话ID
     * @param messages 会话消息列表
     */
    @Override
    public void updateMessages(Object memoryId, List<ChatMessage> messages) {
        try {
            // ChatMessage 列表序列化为 JSON
            String messagesJson = Json.toJson(messages);
            log.info("会话 {} 待存储消息，消息数量：{}", memoryId, messages.size());
            log.debug("消息内容：{}", messagesJson.substring(0, Math.min(200, messagesJson.length())));

            ChatMessages chatMessages = chatMemoryStoreDao.getMessages(memoryId.toString());
            if (chatMessages == null) {
                // 新增会话记录
                ChatMessages newRecord = new ChatMessages();
                newRecord.setMessageId(memoryId.toString());
                newRecord.setContent(messagesJson);
                log.info("会话 {} 准备新增记录，messageId={}", memoryId, newRecord.getMessageId());
                int saveResult = chatMemoryStoreDao.save(newRecord);
                log.info("会话 {} 新增结果：{}", memoryId, saveResult > 0 ? "成功" : "失败");
            } else {
                // 更新已有会话记录
                chatMessages.setContent(messagesJson);
                log.info("会话 {} 准备更新记录，id={}", memoryId, chatMessages.getId());
                int updateResult = chatMemoryStoreDao.updateData(chatMessages);
                log.info("会话 {} 更新结果：{}", memoryId, updateResult > 0 ? "成功" : "失败");
            }
        } catch (Exception e) {
            log.error("更新会话 {} 消息失败", memoryId, e);
            throw new RuntimeException("会话消息存储失败", e);
        }
    }

    /**
     * 删除指定会话的所有消息
     *
     * @param memoryId 会话ID
     */
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
