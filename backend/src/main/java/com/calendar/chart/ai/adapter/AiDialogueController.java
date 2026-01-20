package com.calendar.chart.ai.adapter;

import com.calendar.chart.ai.req.PromptReq;
import com.calendar.chart.ai.service.CalendarChatAssistant;
import com.calendar.chart.dao.ChatMemoryStoreDao;
import com.calendar.chart.dto.ApiResponse;
import com.calendar.chart.dto.ChatMessageResponse;
import com.calendar.chart.dto.SessionInfo;
import com.calendar.chart.entity.ChatMessages;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.ChatMessageType;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.internal.Json;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.chat.response.StreamingChatResponseHandler;
import dev.langchain4j.model.openai.OpenAiChatModel;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * AI对话控制器
 *
 * @author CalendarChart
 */
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiDialogueController {

    private /* final */ OpenAiChatModel openAiChatModel;

    //直接使用 low-level LLM API
    private final StreamingChatModel streamingChatLanguageModel;
    private final CalendarChatAssistant calendarChatAssistant;
    private final ChatMemoryStoreDao chatMemoryStoreDao;

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
        return calendarChatAssistant.chat(prompt.getMemoryId(), prompt.getUserMessage());
    }

    // http://localhost:9005/chatstream/chat?prompt=天津有什么好吃的
    @GetMapping(value = "/steam/chat")
    public Flux<String> chat(@RequestParam("prompt") String prompt) {
        return Flux.create(emitter -> {
            streamingChatLanguageModel.chat(prompt, new StreamingChatResponseHandler() {
                @Override
                public void onPartialResponse(String partialResponse) {
                    System.out.print(partialResponse);
                    emitter.next(partialResponse);
                }

                @Override
                public void onCompleteResponse(ChatResponse completeResponse) {
                    emitter.complete();
                }

                @Override
                public void onError(Throwable throwable) {
                    emitter.error(throwable);
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
            // 反序列化消息列表
            List<ChatMessage> messages = Json.fromJson(chatMessages.getContent(), List.class);
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
                                messages = Json.fromJson(chatMessages.getContent(), List.class);
                            }
                        } catch (Exception e) {
                            // 忽略解析错误，使用空列表
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

}
