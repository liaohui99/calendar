package com.calendar.chart.ai.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.agent.tool.ToolExecutionRequest;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.model.chat.listener.ChatModelListener;
import dev.langchain4j.model.chat.listener.ChatModelResponseContext;
import dev.langchain4j.model.output.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * @author Gabriel
 * @version 1.0
 * @date 2025/12/5 15:07
 * @description: TODO
 */
@Component
public class LongCatToolCallAdapter implements ChatModelListener {

    private static final Logger log = LoggerFactory.getLogger(LongCatToolCallAdapter.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void onResponse(ChatModelResponseContext responseContext) {
        //Response<AiMessage> response = responseContext.response();
        Response<AiMessage> response = null;
        AiMessage originalMessage = response.content();

        // 判断是否为LongCat格式
        if (isLongCatToolCall(originalMessage)) {
            log.info("🐱 检测到LongCat工具调用格式，开始自动转换...");

            try {
                ToolExecutionRequest toolRequest = parseLongCatTag("originalMessage.thoughtsText()");

                // 创建修正后的消息
                AiMessage fixedMessage = new AiMessage(
                        null,  // text保持null（工具调用消息的规范）
                        List.of(toolRequest) // 将解析结果放入正确字段
                      //  originalMessage.thoughtsText()  // 保留原始思考内容
                );

                // 替换原始响应
                Response<AiMessage> fixedResponse = Response.from(
                        fixedMessage,
                        response.tokenUsage(),
                        response.finishReason()
                );

               // responseContext.setResponse(fixedResponse);
                log.info("✅ 工具调用转换成功: {}", toolRequest.name());

            } catch (Exception e) {
                log.error("❌ LongCat工具调用解析失败", e);
            }
        }
    }

    private boolean isLongCatToolCall(AiMessage msg) {
        return msg.text() == null
                && msg.toolExecutionRequests().isEmpty();
                //&& msg.thoughtsText() != null
               // && msg.thoughtsText().contains("<longcat_tool_call>");
    }

    private ToolExecutionRequest parseLongCatTag(String thinking) throws Exception {
        // 提取JSON内容
        int start = thinking.indexOf("<longcat_tool_call>") + 19;
        int end = thinking.indexOf("</longcat_tool_call>");

        if (start == -1 || end == -1) {
            throw new IllegalArgumentException("LongCat标签格式异常");
        }

        String jsonContent = thinking.substring(start, end).trim();
        JsonNode root = objectMapper.readTree(jsonContent);

        return ToolExecutionRequest.builder()
                .id("longcat-" + UUID.randomUUID())
                .name(root.get("name").asText())
                //.arguments(root.get("arguments"))
                .build();
    }
}
