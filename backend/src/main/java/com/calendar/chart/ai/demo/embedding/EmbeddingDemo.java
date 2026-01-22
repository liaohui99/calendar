package com.calendar.chart.ai.demo.embedding;

/**
 * @author Gabriel
 * @version 1.0
 * @date 2026/1/21 17:24
 * @description: TODO
 */

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentParser;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.loader.FileSystemDocumentLoader;
import dev.langchain4j.data.document.parser.TextDocumentParser;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.onnx.allminilml6v2.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;

import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

public class EmbeddingDemo {

    public static void main(String[] args) throws URISyntaxException {
        // 1. 创建本地嵌入模型（无需联网，自动下载）
        EmbeddingModel embeddingModel = new AllMiniLmL6V2EmbeddingModel();
        System.out.println("✅ 嵌入模型加载完成");

        // 2. 创建内存向量存储
        EmbeddingStore<TextSegment> embeddingStore = new InMemoryEmbeddingStore<>();
        System.out.println("✅ 向量存储初始化完成");

        // 3. 加载本地文档（支持 .txt, .pdf, .docx 等）
        String filePath = "docs/sample.txt"; // 准备测试文件
        DocumentParser parser = new TextDocumentParser();
        Document document = FileSystemDocumentLoader.loadDocument(
                Paths.get(filePath), parser
        );
        System.out.println("📄 加载文档: " + document.metadata());

        // 4. 切分文档（按语义切分为小块）
        DocumentSplitter splitter = DocumentSplitters.recursive(
                500,  // 每段最大token数
                50    // 重叠token数
        );
        List<TextSegment> segments = splitter.split(document);
        System.out.println("✂️ 文档切分完成，共 " + segments.size() + " 段");

        // 5. 向量化文档片段
        Response<List<Embedding>> listResponse = embeddingModel.embedAll(segments);
        System.out.println("🔄 向量化完成，向量维度: " + listResponse.content().get(0).dimension());

        // 6. 存储到向量数据库
        embeddingStore.addAll(listResponse.content(), segments);
        System.out.println("💾 向量存储完成！共 " + listResponse.content().size() + " 条记录");

        // 7. 验证检索效果
        String userQuery = "LangChain4j的核心功能是什么？";
        Response<Embedding> embed = embeddingModel.embed(userQuery);
        EmbeddingSearchRequest builder = EmbeddingSearchRequest.builder()
                .queryEmbedding(embed.content())
                .maxResults(3)
                .build();
        EmbeddingSearchResult<TextSegment> search = embeddingStore.search(builder);
        List<EmbeddingMatch<TextSegment>> relevantSegments = search.matches();

        System.out.println("\n🔍 测试检索: " + userQuery);
        for (int i = 0; i < relevantSegments.size(); i++) {
            var result = relevantSegments.get(i);
            System.out.println("\n结果 " + (i + 1) + " (相似度: " +
                    String.format("%.3f", result.score()) + "):");
            System.out.println(result.embedded().text());
        }

        // 保存embeddingStore供对话Demo使用（序列化或注入）
        // 实际项目中可使用 Spring Bean 管理
    }
}
