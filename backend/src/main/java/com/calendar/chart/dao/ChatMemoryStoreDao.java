package com.calendar.chart.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.calendar.chart.entity.ChatMessages;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 会话消息数据访问接口
 * 提供会话消息的CRUD操作
 */
@Repository
@Mapper
public interface ChatMemoryStoreDao extends BaseMapper<ChatMessages> {

    /**
     * 查询指定会话的消息
     *
     * @param memoryId 会话ID
     * @return 会话消息实体
     */
    ChatMessages getMessages(@Param("memoryId") String memoryId);

    /**
     * 新增会话消息
     *
     * @param chatMessages 会话消息实体
     */
    int save(ChatMessages chatMessages);

    /**
     * 更新会话消息
     *
     * @param chatMessages 会话消息实体
     */
    int updateData(ChatMessages chatMessages);

    /**
     * 删除指定会话的消息
     *
     * @param memoryId 会话ID
     */
    int deleteByMemoryId(@Param("memoryId") String memoryId);

    /**
     * 获取所有会话列表
     *
     * @return 会话消息列表
     */
    @Select("SELECT * FROM chat_messages ORDER BY create_time DESC")
    List<ChatMessages> getAllSessions();
}
