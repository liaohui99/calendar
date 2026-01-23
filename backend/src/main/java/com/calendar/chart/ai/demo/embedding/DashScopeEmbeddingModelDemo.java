package com.calendar.chart.ai.demo.embedding;

import com.alibaba.dashscope.embeddings.TextEmbedding;
import com.alibaba.dashscope.embeddings.TextEmbeddingParam;
import com.alibaba.dashscope.embeddings.TextEmbeddingResult;
import com.alibaba.dashscope.exception.NoApiKeyException;
import dev.langchain4j.community.model.dashscope.QwenEmbeddingModel;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.openai.OpenAiEmbeddingModel;
import dev.langchain4j.model.output.Response;

import java.util.Collections;

/**
 * @author Gabriel
 * @version 1.0
 * @date 2026/1/23 9:21
 * @description: TODO
 */
public class DashScopeEmbeddingModelDemo {




    public static void main2(String[] args) {
        String inputTexts = "衣服的质量杠杠的";
        try {
            // 构建请求参数
            TextEmbeddingParam param = TextEmbeddingParam
                    .builder()
                    .model("gte-rerank-v2")
                    // 输入文本
                    .texts(Collections.singleton(inputTexts))
                    .apiKey("sk-36f36bf254134932b98225f6c8fbb616")
                    .build();

            // 创建模型实例并调用
            TextEmbedding textEmbedding = new TextEmbedding();
            TextEmbeddingResult result = textEmbedding.call(param);

            // 输出结果
            System.out.println(result);

        } catch (NoApiKeyException e) {
            // 捕获并处理API Key未设置的异常
            System.err.println("调用 API 时发生异常: " + e.getMessage());
            System.err.println("请检查您的 API Key 是否已正确配置。");
            e.printStackTrace();
        }
    }


    public static void main(String[] args) {
        main1();
    }



    public static void main1() {
       /* EmbeddingModel embeddingModel = QwenEmbeddingModel.builder()
                .baseUrl("https://dashscope.aliyuncs.com/compatible-mode/v1")
                .apiKey("sk-36f36bf254134932b98225f6c8fbb616")
                .modelName("qwen3-rerank")
                .build();*/

        EmbeddingModel embeddingModel = QwenEmbeddingModel.builder()
                .baseUrl("https://dashscope.aliyuncs.com/compatible-mode/v1")
                .apiKey("sk-36f36bf254134932b98225f6c8fbb616")
                .modelName("qwen3-rerank")
                .build();

        Response<Embedding> helloWorld = embeddingModel.embed("hello world");
        System.out.println("helloWorld.content() :" +helloWorld.content());
        System.out.println(helloWorld.content().vectorAsList());
        System.out.println(helloWorld.content().dimension());
        System.out.println(helloWorld.metadata());
        System.out.println(helloWorld.tokenUsage());
        System.out.println(helloWorld.finishReason());

        System.out.println(embeddingModel.modelName());
        System.out.println(embeddingModel.dimension());
        System.out.println(embeddingModel.dimension());
    }



}
