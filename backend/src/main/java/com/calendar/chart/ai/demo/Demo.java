package com.calendar.chart.ai.demo;

import dev.langchain4j.model.openai.OpenAiChatModel;

/**
 * Demo类 - 演示langchain4j的基本使用
 * 使用Java 8兼容的langchain4j 0.24.0版本
 */
public class Demo {
    /**
     * 主方法 - 测试OpenAI聊天模型
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        // 使用0.24.0版本的API创建OpenAI聊天模型
        OpenAiChatModel model = OpenAiChatModel.builder()
                .baseUrl("http://langchain4j.dev/demo/openai/v1")
                .apiKey("demo")
                .modelName("gpt-4o-mini")
                .build();
        
        System.out.println("开始执行AI模型测试...");
        // 发送消息并获取回复
        String answer = model.chat("你好，你可以为我做些什么");
        System.out.println("模型回复:");
        System.out.println(answer); // Hello World
        System.out.println("测试完成!");
    }
}
