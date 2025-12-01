package com.calendar.chart.ai.config;

import dev.langchain4j.model.openai.OpenAiChatModel;
import org.springframework.context.annotation.Configuration;


/**
 * @author Gabriel
 * @date 2025/12/1 14:25
 * @description: TODO
 */
@Configuration
public class SpringChatModelConfig {

    //@Bean
    public OpenAiChatModel openAiChatModel() {
        OpenAiChatModel chatModel = OpenAiChatModel.builder()
                .apiKey("百炼平台获取的key")
                .modelName("qwen-plus")
                .baseUrl("https://dashscope.aliyuncs.com/compatible-mode/v1")
                .build();
        return chatModel;
    }



    
}
