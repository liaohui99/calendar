package com.calendar.chart.ai.demo;

import com.calendar.chart.ai.config.memory.PersistentChatMemoryStore;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.ChatMemoryProvider;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.chat.response.StreamingChatResponseHandler;
import dev.langchain4j.model.openai.OpenAiChatModel;

import java.util.Scanner;
import java.util.UUID;

public class MemoryChat {
    public static OpenAiChatModel simpleChatModel = OpenAiChatModel.builder()
            .baseUrl("http://langchain4j.dev/demo/openai/v1")
            .apiKey("demo")
            .modelName("gpt-4o-mini")
            .build();

    // 创建自定义持久化类对象
    public static PersistentChatMemoryStore store = new PersistentChatMemoryStore();
    // 通过chatMemoryStore(store)指定持久化对象
    public static ChatMemoryProvider chatMemoryProvider = userId -> MessageWindowChatMemory.builder()
            .id(userId)
            .maxMessages(10)
            .chatMemoryStore(store)
            .build();

    public static void memoryChat() {
        String uuid = UUID.randomUUID().toString();
        store.deleteMessages(uuid);

        //SystemMessage.systemMessage("你是一个智能设备管理助手");

        ChatMemory chatMemory = chatMemoryProvider.get(uuid);
        UserMessage firstUserMessage = UserMessage.from("你好，我叫廖晖，你能为我做些什么？");
        store.getMessages(uuid).add(firstUserMessage);

        ChatResponse chatResponse = simpleChatModel.chat(store.getMessages(uuid));
        AiMessage aiMessage = chatResponse.aiMessage();
        store.getMessages(uuid).add(aiMessage);
        System.out.println(aiMessage.text());

        while (true) {
            Scanner in = new Scanner(System.in);
            String userMessageStr = in.nextLine();
            if (userMessageStr.equals("Bye")) {
                break;
            }
            UserMessage userMessage = UserMessage.from(userMessageStr);
            store.getMessages(uuid).add(userMessage);
            ChatResponse chatResponse2 = simpleChatModel.chat(store.getMessages(uuid));
            AiMessage aiMessage2 = chatResponse2.aiMessage();
            store.getMessages(uuid).add(aiMessage2);
            System.out.println(aiMessage2.text());
        }


    }

    public static void main(String[] args) {
        memoryChat();
    }


}
