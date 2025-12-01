package com.calendar.chart.ai.demo;

import dev.langchain4j.model.chat.StreamingChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiStreamingChatModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.TokenStream;

/**
 * @author Gabriel
 * @version 1.0
 * @date 2025/12/1 14:38
 * @description: TODO
 */
public class TokenStreamDemo {

    public static void main(String[] args) {
        StreamingChatLanguageModel streamingModel = OpenAiStreamingChatModel.builder()
                .apiKey("你的API密钥")
                .modelName("gpt-3.5-turbo")
                .build();

        interface StreamingAssistant {
            TokenStream stream(String message);
        }

        StreamingAssistant assistant = AiServices.create(StreamingAssistant.class, streamingModel);

        //assistant.stream("讲一个简短的Java编程笑话").subscribe(token -> System.out.print(token.text()));
    }
}
