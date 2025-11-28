package com.calendar.chart.dao;



import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.calendar.chart.entity.ChatMessages;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMemoryStoreDao extends BaseMapper<ChatMessages> {

    // 查询会话消息
    ChatMessages getMessages(String memoryId);

    // 新增会话消息
    void save(ChatMessages chatMessages);

    // 更新会话消息
    void updateData(ChatMessages chatMessages);

    // 删除会话消息
    void deleteByMemoryId(String memoryId);
}
