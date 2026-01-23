package com.calendar.chart.ai.adapter;

import com.calendar.chart.ai.config.memory.MysqlChatMemoryStore;
import com.calendar.chart.ai.req.PromptReq;
import com.calendar.chart.ai.service.CalendarChatAssistant;
import com.calendar.chart.dao.ChatMemoryStoreDao;
import com.calendar.chart.dto.ApiResponse;
import com.calendar.chart.dto.ChatMessageResponse;
import com.calendar.chart.dto.SessionInfo;
import com.calendar.chart.entity.ChatMessages;
import dev.langchain4j.data.message.*;
import dev.langchain4j.internal.Json;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.chat.response.StreamingChatResponseHandler;
import dev.langchain4j.model.openai.OpenAiChatModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * AI对话控制器
 *
 * @author CalendarChart
 */
@Slf4j
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiDialogueController {

    private /* final */ OpenAiChatModel openAiChatModel;

    //直接使用 low-level LLM API
    private final StreamingChatModel streamingChatLanguageModel;
    private final CalendarChatAssistant calendarChatAssistant;
    private final ChatMemoryStoreDao chatMemoryStoreDao;
    private final MysqlChatMemoryStore chatMemoryStore;

    /**
     * 获取AI对话结果
     *
     * @param prompt 输入内容
     * @return AI对话结果
     */
    @PostMapping("/demo/dialogue")
    public ApiResponse<String> getDialogue(@RequestBody String prompt) {
        String aswString = openAiChatModel.chat(prompt);
        return ApiResponse.success(aswString);
    }


    // http://localhost:9005/chatstream/chat?prompt=天津有什么好吃的
    @PostMapping(value = "/calendar/chat/flux")
    public Flux<String> calendarChatFlux(@RequestBody PromptReq prompt) {
        return calendarChatAssistant.chatFlux(prompt.getMemoryId(), prompt.getUserMessage());
    }

    // http://localhost:9005/chatstream/chat?prompt=天津有什么好吃的
    @PostMapping(value = "/calendar/chat")
    public String calendarChat(@RequestBody @Validated PromptReq prompt) {
        long memoryId = prompt.getMemoryId();
        String userMessage = prompt.getUserMessage();
        
        // 调用AI聊天
        String aiResponse = calendarChatAssistant.chat(memoryId, userMessage);
        
        // 手动保存消息到数据库
        try {
            // 获取现有消息
            List<ChatMessage> existingMessages = chatMemoryStore.getMessages(memoryId);
            
            // 添加用户消息和AI回复
            List<ChatMessage> updatedMessages = new ArrayList<>(existingMessages);
            updatedMessages.add(UserMessage.from(userMessage));
            updatedMessages.add(AiMessage.from(aiResponse));
            
            // 保存到数据库
            chatMemoryStore.updateMessages(memoryId, updatedMessages);
            log.info("消息已保存到数据库，会话ID: {}, 消息数量: {}", memoryId, updatedMessages.size());
        } catch (Exception e) {
            log.error("保存消息失败: {}", e.getMessage());
        }
        
        return aiResponse;
    }

    // http://localhost:9005/chatstream/chat?prompt=天津有什么好吃的
    @GetMapping(value = "/steam/chat")
    public Flux<String> chat(@RequestParam("prompt") String prompt) {
        return Flux.create(sink -> {
            streamingChatLanguageModel.chat(prompt, new StreamingChatResponseHandler() {
                @Override
                public void onPartialResponse(String partialResponse) {
                    log.info("onPartialResponse:{}", partialResponse);
                    sink.next(partialResponse);
                }

                @Override
                public void onCompleteResponse(ChatResponse completeResponse) {
                    log.info("complete:{}", completeResponse);
                    sink.complete();
                }

                @Override
                public void onError(Throwable error) {
                    sink.error(error);
                }
            });
        });
    }

    /**
     * 清空指定对话的历史记录
     *
     * @param memoryId 对话内存ID
     * @return 操作结果
     */
    @DeleteMapping(value = "/calendar/chat/memory/{memoryId}")
    public ApiResponse<String> clearChatMemory(@PathVariable Long memoryId) {
        try {
            chatMemoryStoreDao.deleteByMemoryId(String.valueOf(memoryId));
            return ApiResponse.success("对话历史已清空");
        } catch (Exception e) {
            return ApiResponse.error("清空对话历史失败: " + e.getMessage());
        }
    }

    /**
     * 创建新的对话会话
     * 该接口用于生成新的memoryId，实际创建由前端处理
     *
     * @return 新的对话ID
     */
    @PostMapping(value = "/calendar/chat/session")
    public ApiResponse<Long> createNewSession() {
        try {
            long newMemoryId = System.currentTimeMillis();
            log.info("创建新会话成功: {}", newMemoryId);
            return ApiResponse.success(newMemoryId);
        } catch (Exception e) {
            log.error("创建新会话失败", e);
            return ApiResponse.error("创建新会话失败: " + e.getMessage());
        }
    }

    /**
     * 获取指定会话的消息
     *
     * @param memoryId 会话ID
     * @return 会话消息响应
     */
    @GetMapping(value = "/calendar/chat/messages/{memoryId}")
    public ApiResponse<ChatMessageResponse> getChatMessages(@PathVariable Long memoryId) {
        try {
            ChatMessages chatMessages = chatMemoryStoreDao.getMessages(String.valueOf(memoryId));
            if (chatMessages == null || chatMessages.getContent() == null) {
                // 会话不存在或无消息，返回空列表
                return ApiResponse.success(ChatMessageResponse.builder()
                        .memoryId(memoryId)
                        .messages(new ArrayList<>())
                        .build());
            }
            // 解析消息列表为字符串列表
            List<String> messages = new ArrayList<>();
            try {
                if (chatMessages.getContent() != null) {
                    List<Map<String, Object>> rawMessages = Json.fromJson(chatMessages.getContent(), List.class);
                    for (Map<String, Object> msg : rawMessages) {
                        String type = (String) msg.getOrDefault("type", "TEXT");
                        String text = "";
                        if (msg.containsKey("text")) {
                            text = (String) msg.get("text");
                        } else if (msg.containsKey("contents")) {
                            // 处理UserMessage类型
                            Object contents = msg.get("contents");
                            if (contents instanceof List) {
                                List<?> contentsList = (List<?>) contents;
                                if (!contentsList.isEmpty() && contentsList.get(0) instanceof Map) {
                                    text = (String) ((Map<?, ?>) contentsList.get(0)).get("text");
                                }
                            }
                        }
                        messages.add(text);
                    }
                }
            } catch (Exception e) {
                log.warn("解析消息列表失败: {}", e.getMessage());
            }
            return ApiResponse.success(ChatMessageResponse.builder()
                    .memoryId(memoryId)
                    .messages(messages)
                    .build());
        } catch (Exception e) {
            return ApiResponse.error("获取会话消息失败: " + e.getMessage());
        }
    }

    /**
     * 获取所有会话列表
     *
     * @return 会话列表响应
     */
    @GetMapping(value = "/calendar/chat/sessions")
    public ApiResponse<List<SessionInfo>> getSessions() {
        try {
            List<ChatMessages> allSessions = chatMemoryStoreDao.getAllSessions();
            List<SessionInfo> sessionInfoList = allSessions.stream()
                    .map(chatMessages -> {
                        // 解析消息列表
                        List<ChatMessage> messages = new ArrayList<>();
                        try {
                            if (chatMessages.getContent() != null) {
                                List<Map<String, Object>> rawMessages = Json.fromJson(chatMessages.getContent(), List.class);
                                messages = rawMessages.stream()
                                        .map(this::convertToChatMessage)
                                        .filter(Objects::nonNull)
                                        .collect(Collectors.toList());
                            }
                        } catch (Exception e) {
                            log.warn("解析消息列表失败: {}", e.getMessage());
                        }
                        
                        // 提取第一条用户消息作为标题
                        String title = "空会话";
                        if (!messages.isEmpty()) {
                            for (ChatMessage msg : messages) {
                                if (msg.type() == ChatMessageType.USER) {
                                    String text = ((UserMessage)msg).singleText();
                                    if (text != null && !text.isEmpty()) {
                                        title = text.length() > 20 ? text.substring(0, 20) + "..." : text;
                                        break;
                                    }
                                }
                            }
                        }
                        
                        return SessionInfo.builder()
                                .memoryId(Long.parseLong(chatMessages.getMessageId()))
                                .title(title)
                                .messageCount(messages.size())
                                .createTime(chatMessages.getCreateTime())
                                .updateTime(chatMessages.getUpdateTime())
                                .build();
                    })
                    .collect(Collectors.toList());
            
            return ApiResponse.success(sessionInfoList);
        } catch (Exception e) {
            return ApiResponse.error("获取会话列表失败: " + e.getMessage());
        }
    }

    /**
     * 将 Map 转换为 ChatMessage 对象
     *
     * @param map 消息的 Map 表示
     * @return ChatMessage 对象，转换失败返回 null
     */
    private ChatMessage convertToChatMessage(Map<String, Object> map) {
        try {
            if (map == null || !map.containsKey("text")) {
                return null;
            }

            String type = (String) map.getOrDefault("type", "TEXT");
            String text = (String) map.get("text");

            return switch (type.toUpperCase()) {
                case "USER", "USER_MESSAGE" -> UserMessage.from(text);
                case "AI", "AI_MESSAGE" -> AiMessage.from(text);
                case "SYSTEM", "SYSTEM_MESSAGE" -> SystemMessage.from(text);
                default -> {
                    // 对于未知类型，使用 AiMessage
                    log.warn("未知消息类型: {}, 使用 AiMessage", type);
                    yield AiMessage.from(text);
                }
            };
        } catch (Exception e) {
            log.warn("转换消息失败: {}", e.getMessage());
            return null;
        }
    }

}
