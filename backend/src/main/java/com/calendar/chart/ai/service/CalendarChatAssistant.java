package com.calendar.chart.ai.service;

import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;
import reactor.core.publisher.Flux;

/**
 * @author Gabriel
 * @version 1.0
 * @date 2025/12/1 14:25
 * @description: 日历助手
 */
public interface ChatDemoAssistant {

    /**
     * 普通输出，不是流式的
     * @param prompt
     * @return
     */
    //@SystemMessage("你是一名医生，请用专业的医疗经验进行回答,今天是{{current_date}}")     //系统提示词
    //@UserMessage("我是一名篮球运动员{{message}}")        //用户提示词
    @SystemMessage(fromResource = "prompt.txt")     //系统提示词
    @UserMessage("我是一名篮球运动员{{message}}")        //用户提示词
    String chat(String prompt);

    /**
     * 流式输出，是流式的
     * 注意：流式输出返回的要为 Flux<T> 类型的数据类型
     * @return
     */
    @SystemMessage(fromResource = "prompt.txt")     //系统提示词
    @UserMessage("我是一名篮球运动员{{message}}")        //用户提示词  使用@UserMessage注解进行用户提示测，用户提示词在每次用户提问时，都会进行携带
    Flux<String> chatFlux(@MemoryId int memoryId, @V("message") String userMessage);
}
