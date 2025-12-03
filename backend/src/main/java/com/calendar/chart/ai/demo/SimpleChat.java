package com.calendar.chart.ai.demo;

import com.calendar.chart.ai.config.memory.PersistentChatMemoryStore;
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.chat.response.StreamingChatResponseHandler;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.openai.OpenAiStreamingChatModel;

import java.util.concurrent.atomic.AtomicBoolean;

/**
 * @author Gabriel
 * @version 1.0
 * @date 2025/11/28 14:41
 * @description: TODO
 */
public class SimpleChat {

    public static OpenAiChatModel simpleChatModel = OpenAiChatModel.builder()
            .baseUrl("http://langchain4j.dev/demo/openai/v1")
            .apiKey("demo")
            .modelName("gpt-4o-mini")
            .build();

    public static ChatMemory chatMemory = MessageWindowChatMemory.builder()
            .id("12345")
            .maxMessages(10)
            .chatMemoryStore(new PersistentChatMemoryStore())
            .build();

    public static void simpleChat() {
        String answer = simpleChatModel.chat("Say 'Hello World'");
        System.out.println(answer); // Hello World
    }

    public static void streamChat() {
        StreamingChatModel model = OpenAiStreamingChatModel.builder()
                .baseUrl("http://langchain4j.dev/demo/openai/v1")
                .apiKey("demo")
                .modelName("gpt-4o-mini")
                .build();

        String userMessage = "Tell me a joke with Chinese";
        AtomicBoolean aBoolean = new AtomicBoolean(false);

        model.chat(userMessage, new StreamingChatResponseHandler() {

            @Override
            public void onPartialResponse(String partialResponse) {
                System.out.println("onPartialResponse: " + partialResponse);
            }

            @Override
            public void onCompleteResponse(ChatResponse completeResponse) {
                System.out.println("onCompleteResponse: " + completeResponse);
                aBoolean.set( true);
            }

            @Override
            public void onError(Throwable error) {
                error.printStackTrace();
            }
        });

        while (!aBoolean.get()) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    public static void main(String[] args) {
        streamChat();
    }

}
