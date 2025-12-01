package com.calendar.chart.ai.service;

import dev.langchain4j.model.output.Response;
import reactor.core.publisher.Flux;



/**
 * @Author Gabriel
 * @Description 开票助手测试
 * @Date  2025/12/1 14:24
 **/
public interface FunctionAssistant {
    //客户指令：出差住宿发票开票，
    // 开票信息:    公司名称xxx
    // 税号序列:    xx
    // 开票金额:    xxx.00元
    String chat(String message);


    //Response chatFlux(String message);

    /**
     * 调用大模型进行聊天-流式返回
     * @param message 用户消息
     * @return 流式响应
     */
    Flux<String> chatFlux(String message);

}
