package com.calendar.chart.ai.adapter;

import com.calendar.chart.ai.req.PromptReq;
import com.calendar.chart.ai.service.CalendarChatAssistant;
import com.calendar.chart.dto.ApiResponse;
import dev.langchain4j.model.chat.StreamingChatLanguageModel;
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
    private final StreamingChatLanguageModel streamingChatLanguageModel;
    private final CalendarChatAssistant calendarChatAssistant;

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


}
