package com.calendar.chart.ai.adapter;

import com.calendar.chart.ai.req.PromptReq;
import com.calendar.chart.ai.service.CalendarChatAssistant;
import com.calendar.chart.dao.ChatMemoryStoreDao;
import com.calendar.chart.dto.ApiResponse;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.chat.response.StreamingChatResponseHandler;
import dev.langchain4j.model.openai.OpenAiChatModel;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

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
            return ApiResponse.success(newMemoryId);
        } catch (Exception e) {
            return ApiResponse.error("创建新会话失败: " + e.getMessage());
        }
    }

}
