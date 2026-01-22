package com.calendar.chart.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

/**
 * Jackson配置类
 * 配置JSON序列化/反序列化行为
 * 
 * @author Calendar Chart Team
 */
@Configuration
public class JacksonConfig {

    /**
     * 配置ObjectMapper
     * 禁用空对象序列化失败，避免LangChain4j消息类型的序列化问题
     * 
     * @param builder Jackson构建器
     * @return 配置后的ObjectMapper
     */
    @Bean
    public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
        ObjectMapper objectMapper = builder.build();
        
        // 配置序列化特性
        objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        
        return objectMapper;
    }
}
