package com.calendar.chart.ai.config;

import com.calendar.chart.ai.config.memory.MysqlChatMemoryStore;
import com.calendar.chart.ai.service.ChatDemoAssistant;
import com.calendar.chart.config.ApplicationConfig;
import dev.langchain4j.mcp.McpToolProvider;
import dev.langchain4j.memory.chat.ChatMemoryProvider;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.openai.OpenAiStreamingChatModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.tool.ToolProvider;
import dev.langchain4j.store.memory.chat.ChatMemoryStore;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


/**
 * LLM配置类
 * 配置LangChain4j相关的Bean
 */
@Configuration
@RequiredArgsConstructor
public class SpringLLMConfig {

    private final ApplicationConfig applicationConfig;


    /**
     * 创建流式对话模型Bean
     *
     * @return StreamingChatModel
     */
    @Bean
    public StreamingChatModel streamingChatModel() {
        return OpenAiStreamingChatModel.builder()
                /*.baseUrl("http://langchain4j.dev/demo/openai/v1")
                .apiKey("demo")
                .modelName("gpt-4o-mini")*/
                .baseUrl(applicationConfig.getLangchain4jBaseUrl())
                .apiKey(applicationConfig.getLangchain4jApiKey())
                .modelName(applicationConfig.getLangchain4jModelName())
                .temperature(0.7)
                .logRequests(true)
                .logResponses(true)
                .build();
    }


    //@Bean
    public ChatDemoAssistant chatAssistant(StreamingChatModel streamingChatModel) {
        return AiServices.create(ChatDemoAssistant.class, streamingChatModel);
    }


    /**
     * 创建普通对话模型Bean
     *
     * @return ChatModel
     */
    @Bean
    public ChatModel chatModelSimple() {
        return OpenAiChatModel.builder()
/*                .baseUrl("http://langchain4j.dev/demo/openai/v1")
                .apiKey("demo")
                .modelName("gpt-4o-mini")*/
                .baseUrl(applicationConfig.getLangchain4jBaseUrl())
                .apiKey(applicationConfig.getLangchain4jApiKey())
                .modelName(applicationConfig.getLangchain4jModelName())
                .temperature(0.7)
                .logRequests(true)
                .logResponses(true)
                .build();
    }


    // 注释掉 windowChatMemory Bean，因为在 @AiService 注解中同时指定了 chatMemory 和 chatMemoryProvider 时，chatMemoryProvider 会被忽略
    // @Bean
    // public ChatMemory windowChatMemory() {
    //     return MessageWindowChatMemory.withMaxMessages(20);
    // }

    /**
     * 创建MySQL会话消息存储Bean
     * 使用MysqlChatMemoryStore替代InMemoryChatMemoryStore，实现会话持久化
     *
     * @param mysqlChatMemoryStore MySQL会话消息存储
     * @return ChatMemoryStore
     */
    @Bean
    public ChatMemoryStore chatMemoryStore(MysqlChatMemoryStore mysqlChatMemoryStore) {
        return mysqlChatMemoryStore;
    }


    /**
     * 创建会话内存提供者Bean
     *
     * @param persistentChatMemoryStore 会话消息存储
     * @return ChatMemoryProvider
     */
    @Bean
    public ChatMemoryProvider chatMemoryProvider(ChatMemoryStore persistentChatMemoryStore) {
        return userId -> MessageWindowChatMemory.builder()
                .id(userId)
                .maxMessages(200)
                .chatMemoryStore(persistentChatMemoryStore)
                .build();
    }


    //@Bean
    public ToolProvider myToolProvider() {
        return McpToolProvider.builder()
                .mcpClients()
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
