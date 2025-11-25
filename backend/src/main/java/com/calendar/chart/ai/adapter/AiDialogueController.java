package com.calendar.chart.ai.adapter;

import com.calendar.chart.dto.ApiResponse;
import dev.langchain4j.model.openai.OpenAiChatModel;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AI对话控制器
 * @author CalendarChart
 */
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiDialogueController {

    private final OpenAiChatModel  openAiChatModel;

    
    /**
     * 获取AI对话结果
     * @param prompt 输入内容
     * @return AI对话结果
     */
    @PostMapping("/dialogue")
    public ApiResponse<String> getDialogue(@RequestBody String prompt) {
        String aswString = openAiChatModel.chat(prompt);
        return ApiResponse.success(aswString);
    }
}
