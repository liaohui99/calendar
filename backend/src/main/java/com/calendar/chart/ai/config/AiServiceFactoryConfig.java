package com.calendar.chart.ai.config;

import com.calendar.chart.ai.service.CalendarChatAssistant;
import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.agent.tool.ToolSpecification;
import dev.langchain4j.agent.tool.ToolSpecifications;
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.ChatMemoryProvider;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.moderation.ModerationModel;
import dev.langchain4j.rag.RetrievalAugmentor;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.spring.event.AiServiceRegisteredEvent;
import dev.langchain4j.service.tool.ToolProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Bean;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * @author Gabriel
 * @version 1.0
 * @date 2026/1/19 10:19
 * @description: TODO
 */
//@Configuration
@Slf4j
public class AiServiceFactoryConfig {


    //@Autowired
    private ConfigurableListableBeanFactory beanFactory;
    private ApplicationEventPublisher eventPublisher;
    private ChatModel chatModelSimple;
    private StreamingChatModel streamingChatModel;
    private ChatMemoryProvider chatMemoryProvider;
    private ToolProvider toolProvider;


    @Bean
    public CalendarChatAssistant chatAssistant() {
        String[] chatModels = beanFactory.getBeanNamesForType(ChatModel.class);
        String[] streamingChatModels = beanFactory.getBeanNamesForType(StreamingChatModel.class);
        String[] chatMemories = beanFactory.getBeanNamesForType(ChatMemory.class);
        String[] chatMemoryProviders = beanFactory.getBeanNamesForType(ChatMemoryProvider.class);
        String[] contentRetrievers = beanFactory.getBeanNamesForType(ContentRetriever.class);
        String[] retrievalAugmentors = beanFactory.getBeanNamesForType(RetrievalAugmentor.class);
        String[] moderationModels = beanFactory.getBeanNamesForType(ModerationModel.class);

        Set<String> toolBeanNames = new HashSet<>();
        List<ToolSpecification> toolSpecifications = new ArrayList<>();
        for (String beanName : beanFactory.getBeanDefinitionNames()) {
            try {
                String beanClassName = beanFactory.getBeanDefinition(beanName).getBeanClassName();
                if (beanClassName == null) {
                    continue;
                }
                Class<?> beanClass = Class.forName(beanClassName);
                for (Method beanMethod : beanClass.getDeclaredMethods()) {
                    if (beanMethod.isAnnotationPresent(Tool.class)) {
                        toolBeanNames.add(beanName);
                        try {
                            toolSpecifications.add(ToolSpecifications.toolSpecificationFrom(beanMethod));
                        } catch (Exception e) {
                            log.warn("Cannot convert %s.%s method annotated with @Tool into ToolSpecification"
                                    .formatted(beanClass.getName(), beanMethod.getName()), e);
                        }
                    }
                }
            } catch (Exception e) {
                // TODO
            }
        }
        log.info("🚀 手动构建 ChatAssistant AI 服务...");


        log.info("🛠️ 注册 {} 个工具", toolBeanNames.size());
        for (Object tool : toolBeanNames) {
            log.debug("  工具类: {}", tool.getClass().getSimpleName());
        }
        CalendarChatAssistant aiServiceClass = AiServices.builder(CalendarChatAssistant.class)
                .chatModel(chatModelSimple)
                .streamingChatModel(streamingChatModel)
                .chatMemoryProvider(chatMemoryProvider)
                .toolProvider(toolProvider)
                .tools(toolSpecifications)
                .build();
        if (eventPublisher != null) {
            eventPublisher.publishEvent(new AiServiceRegisteredEvent(this, aiServiceClass.getClass(), toolSpecifications));
        }

        // 手动构建 AI 服务
        return aiServiceClass;
    }









}
