package com.calendar.chart.ai.config.memory;

import cn.hutool.core.collection.CollUtil;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.store.memory.chat.ChatMemoryStore;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class PersistentChatMemoryStore implements ChatMemoryStore {
    private final Map<Object, List<ChatMessage>> memoryStore = new ConcurrentHashMap<>();

    @Override
    public List<ChatMessage> getMessages(Object memoryId) {
        // TODO: 实现通过内存ID从持久化存储中获取所有消息。
        List<ChatMessage> chatMessages = memoryStore.get(memoryId);
        if (CollUtil.isEmpty(chatMessages)){
            ArrayList<ChatMessage> msgs = new ArrayList<>();
            memoryStore.put(memoryId, msgs);
            return msgs;
        }
        return chatMessages;
        // 可以使用ChatMessageDeserializer.messageFromJson(String)和
        // ChatMessageDeserializer.messagesFromJson(String)辅助方法
        // 轻松地从JSON反序列化聊天消息。
    }

    @Override
    public void updateMessages(Object memoryId, List<ChatMessage> messages) {
        // TODO: 实现通过内存ID更新持久化存储中的所有消息。
        // 轻松地序列化ChatMessage。
        memoryStore.put(memoryId, messages);
        // 可以使用ChatMessageSerializer.messageToJson(ChatMessage)和
        // ChatMessageSerializer.messagesToJson(List<ChatMessage>)辅助方法
        // 轻松地将聊天消息序列化为JSON。

    }

    @Override
    public void deleteMessages(Object memoryId) {
        // TODO: 实现通过内存ID删除持久化存储中的所有消息。
        memoryStore.remove(memoryId);
    }

}
