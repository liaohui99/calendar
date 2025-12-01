package com.calendar.chart.ai.config;

import com.calendar.chart.ai.config.memory.PersistentChatMemoryStore;
import com.calendar.chart.ai.service.ChatDemoAssistant;
import dev.langchain4j.memory.chat.ChatMemoryProvider;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.chat.StreamingChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.openai.OpenAiStreamingChatModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.store.memory.chat.ChatMemoryStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


/**
 * @author Gabriel
 * @date 2025/12/1 14:25
 * @description: TODO
 */
@Configuration
public class SpringLLMConfig {


    /**
     * @return dev.langchain4j.model.chat.StreamingChatLanguageModel
     * @Author Gabriel
     * @Description 流式对话接口 StreamingChatModel
     * @Date 2025/12/1 14:30
     **/
    @Bean
    public StreamingChatLanguageModel streamingChatModel() {
        return OpenAiStreamingChatModel.builder()
                .baseUrl("http://langchain4j.dev/demo/openai/v1")
                .apiKey("demo")
                .modelName("gpt-4o-mini")
                .build();
    }


    @Bean
    public ChatDemoAssistant chatAssistant(StreamingChatLanguageModel streamingChatModel) {
        return AiServices.create(ChatDemoAssistant.class, streamingChatModel);
    }


    /**
     * @return ChatModel
     * @Author Gabriel
     * @Description 普通对话接口 ChatModel
     * @Date 2025/12/1 14:31
     **/
    @Bean(name = "simple")
    public ChatLanguageModel chatModelSimple() {
        return OpenAiChatModel.builder()
                .baseUrl("http://langchain4j.dev/demo/openai/v1")
                .apiKey("demo")
                .modelName("gpt-4o-mini")
                .build();
    }


    /**
     * @Author Gabriel
     * @Description 创建自定义持久化类对象
     * @Date  2025/12/1 14:47
     * @return dev.langchain4j.store.memory.chat.ChatMemoryStore
     **/
    @Bean
    public ChatMemoryStore chatMemoryStore() {
        return new PersistentChatMemoryStore();
    }


    /**
     * @Author Gabriel
     * @Descriptionv 创建自定义持久化类对象
     * @Date  2025/12/1 14:46
     * @return dev.langchain4j.memory.chat.ChatMemoryProvider
     **/
    @Bean
    public ChatMemoryProvider chatMemoryProvider(ChatMemoryStore chatMemoryStore) {
        return userId -> MessageWindowChatMemory.builder()
                .id(userId)
                .maxMessages(10)
                .chatMemoryStore(chatMemoryStore)
                .build();
    }


    //@Bean(name = "qwen")
    public OpenAiChatModel chatModelQwen() {
        OpenAiChatModel chatModel = OpenAiChatModel.builder()
                .apiKey("百炼平台获取的key")
                .modelName("qwen-plus")
                .baseUrl("https://dashscope.aliyuncs.com/compatible-mode/v1")
                .build();
        return chatModel;
    }


}
