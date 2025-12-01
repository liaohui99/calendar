package com.calendar.chart.ai.demo;

import com.alibaba.fastjson.JSON;
import com.calendar.chart.ai.service.FunctionAssistant;
import com.calendar.chart.ai.config.memory.PersistentChatMemoryStore;
import com.calendar.chart.ai.tools.WeatherTools;
import dev.langchain4j.agent.tool.ToolSpecification;
import dev.langchain4j.agent.tool.ToolSpecifications;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ToolExecutionResultMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.memory.chat.ChatMemoryProvider;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.StreamingChatLanguageModel;
import dev.langchain4j.model.chat.request.ChatRequest;
import dev.langchain4j.model.chat.request.json.JsonObjectSchema;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.openai.OpenAiStreamingChatModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.tool.ToolExecutor;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.UUID;

/**
 * @author Gabriel
 * @version 1.0
 * @date 2025/11/28 16:51
 * @description: TODO
 */
public class ToolsChat {
    public static OpenAiChatModel simpleChatModel = OpenAiChatModel.builder()
            .baseUrl("http://langchain4j.dev/demo/openai/v1")
            .apiKey("demo")
            .modelName("gpt-4o-mini")
            .build();

    public static StreamingChatLanguageModel streamModel = OpenAiStreamingChatModel.builder()
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

    public static List<ToolSpecification> toolSpecifications = ToolSpecifications.toolSpecificationsFrom(WeatherTools.class);





    public static void simpleToolsChat() {
        String uuid = UUID.randomUUID().toString();
        store.deleteMessages(uuid);

        //SystemMessage.systemMessage("你是一个智能设备管理助手");

        //ChatMemory chatMemory = chatMemoryProvider.get(uuid);
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
            ChatRequest build = ChatRequest.builder()
                    .messages(store.getMessages(uuid))
                    .toolSpecifications(toolSpecifications)
                    .build();
            ChatResponse chatResponse2 = simpleChatModel.chat(build);
            AiMessage aiMessage2 = chatResponse2.aiMessage();
            store.getMessages(uuid).add(aiMessage2);
            System.out.println("回答 : "+aiMessage2.text());
            System.out.println("token : "+JSON.toJSONString(chatResponse2.tokenUsage()));
        }


    }


    public static void toolsChat() {

       /* ToolSpecification toolSpecification = ToolSpecification.builder()
                .name("get_booking_details")            // 工具名称（LLM通过此名称调用工具）
                .description("返回预订详情")             // 工具描述（LLM根据此描述决定是否调用）
                .parameters(JsonObjectSchema.builder()  // 定义工具参数结构（JSON Schema格式）
                        .properties(Map.of(
                                "bookingNumber", JsonStringSchema.builder()
                                        .description("B-12345 格式的预订号")  // 参数描述
                                        .build()
                        ))
                        .build())
                .build();*/


        // 工具说明 ToolSpecification
        ToolSpecification toolSpecification = ToolSpecification.builder()
                .name("Assistant")
                .description("根据用户提交的开票信息，开具发票")
                .parameters(JsonObjectSchema.builder()
                        .addStringProperty("companyName", "公司名称")
                        .addStringProperty("dutyNumber", "税号序列")
                        .addStringProperty("amount", "开票金额，保留两位有效数字")
                        .build())
                .build();


        // 业务逻辑 ToolExecutor
        ToolExecutor toolExecutor = (toolExecutionRequest, memoryId) -> {
            System.out.println(toolExecutionRequest.id());
            System.out.println(toolExecutionRequest.name());
            String arguments1 = toolExecutionRequest.arguments();
            System.out.println("arguments1****》 " + arguments1);
            return "开具成功";
        };

        FunctionAssistant functionAssistant = AiServices.builder(FunctionAssistant.class)
                .chatLanguageModel(simpleChatModel)
                .streamingChatLanguageModel(streamModel)
                .tools(Map.of(toolSpecification, toolExecutor)) // Tools (Function Calling)
                .chatMemoryProvider(chatMemoryProvider)
                .systemMessageProvider(chatId -> "你是一个智能设备管理助手")
                .hallucinatedToolNameStrategy(toolExecutionRequest -> ToolExecutionResultMessage.from(
                        toolExecutionRequest, "错误：没有名为 " + toolExecutionRequest.name() + " 的工具"))
                .build();

        //AtomicBoolean aBoolean = new AtomicBoolean(false);
        String uuid = UUID.randomUUID().toString();

/*        while ( true){
            Scanner in = new Scanner(System.in);
            String userMessageStr = in.nextLine();
            if (userMessageStr.equals("Bye")) {
                break;
            }
            UserMessage userMessage = UserMessage.from(userMessageStr);
            //store.getMessages(uuid).add(userMessage);
            String userMessageStr1 = functionAssistant.chat(userMessageStr);
            //store.getMessages(uuid).add(AiMessage.aiMessage(userMessageStr1));
            System.out.println(userMessageStr1);
        }*/

        while ( true){
            Scanner in = new Scanner(System.in);
            String userMessageStr = in.nextLine();
            if (userMessageStr.equals("Bye")) {
                break;
            }
            Flux<String> stringFlux = functionAssistant.chatFlux(userMessageStr);
            stringFlux.subscribe(System.out::println);
        }

    }



    public static void main(String[] args) {
        //simpleToolsChat();
        toolsChat();
    }

}
