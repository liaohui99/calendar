package com.calendar.chart.ai.demo;

import com.calendar.chart.ai.service.FunctionAssistant;
import dev.langchain4j.mcp.McpToolProvider;
import dev.langchain4j.mcp.client.DefaultMcpClient;
import dev.langchain4j.mcp.client.McpClient;
import dev.langchain4j.mcp.client.transport.McpTransport;
import dev.langchain4j.mcp.client.transport.http.StreamableHttpMcpTransport;
import dev.langchain4j.mcp.client.transport.stdio.StdioMcpTransport;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.service.AiServiceContext;
import dev.langchain4j.service.AiServices;

import java.util.List;

/**
 * @author Gabriel
 * @version 1.0
 * @date 2026/1/16 14:47
 * @description: TODO
 */
public class MCPClientStdio {


    public static void main(String[] args) {
        // 1. 获取API KEY
        String apiKey = System.getenv("ZHIPU_API_KEY");
        // 2. 通过McpTransport启动@playwright/mcp，也就是MCP的服务端：MCP Server。会出现两个node.js进程
        McpTransport transport = StdioMcpTransport.builder()
                .command(List.of("npx.cmd", "@playwright/mcp@latest"))
                .logEvents(true) //设置为true，可以查看日志中的McpTransport数据
                .build();

        StreamableHttpMcpTransport streamableHttpMcpTransport = StreamableHttpMcpTransport.builder()
                .url("")
                .build();
        // 3. 定义McpClient
        McpClient mcpClient = DefaultMcpClient.builder()
                .key("Playwright")
                .transport(transport)
                .build();
        // 4. 将McpClient封装为一个McpToolProvider
        McpToolProvider toolProvider = McpToolProvider.builder()
                .mcpClients(mcpClient)
                .build();
        // 5. 构建模型
        ChatModel model = OpenAiChatModel.builder()
                .apiKey(apiKey)
                .baseUrl("https://open.bigmodel.cn/api/paas/v4")
                .modelName("glm-4-flash-250414")
                .build();
        // 6. 通过AiServices，将McpToolProvider作为一个工具提供者放进去使用
        FunctionAssistant assistant = AiServices.builder(FunctionAssistant.class)
                .chatModel(model)
                .toolProvider(toolProvider)
                .build();
        // 7. 访问大模型
        assistant.chat("打开浏览器访问baidu并搜索关键字周星驰");
        String result = assistant.chat("打开浏览器访问baidu并搜索关键字周星驰");
        System.out.println(result);
    }




}
