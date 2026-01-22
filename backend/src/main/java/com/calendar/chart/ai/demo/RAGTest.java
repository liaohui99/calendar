package com.calendar.chart.ai.demo;

import com.calendar.chart.ai.service.ChatDemoAssistant;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.loader.FileSystemDocumentLoader;
import dev.langchain4j.data.document.parser.TextDocumentParser;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

import java.nio.file.FileSystems;
import java.nio.file.PathMatcher;
import java.nio.file.Paths;
import java.util.List;

/**
 * @author Gabriel
 * @version 1.0
 * @date 2025/12/1 15:13
 * @description: TODO
 */
public class RAGTest {

    public void testReadDocument() {
        //使用FileSystemDocumentLoader读取指定目录下的知识库文档
        //并使用默认的文档解析器TextDocumentParser对文档进行解析
        Document document = FileSystemDocumentLoader.loadDocument("D:\\飞书\\Downloads\\成交分析.xlsx");
        System.out.println(document.text());

        // 加载单个文档
        Document document1 = FileSystemDocumentLoader.loadDocument("E:/knowledge/file.txt", new TextDocumentParser());

        // 从一个目录中加载所有文档
        List<Document> documents2 = FileSystemDocumentLoader.loadDocuments("E:/knowledge", new TextDocumentParser());

        // 从一个目录中加载所有的.txt文档
        PathMatcher pathMatcher = FileSystems.getDefault().getPathMatcher("glob:*.txt");
        List<Document> documents3 = FileSystemDocumentLoader.loadDocuments("E:/knowledge", pathMatcher, new TextDocumentParser());

        // 从一个目录及其子目录中加载所有文档
        List<Document> documents4 = FileSystemDocumentLoader.loadDocumentsRecursively("E:/knowledge", new TextDocumentParser());
    }


    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() {
        // 使用内存向量库作为示例。生产环境可换为ChromaDB、PgVector等持久化方案。
        return new InMemoryEmbeddingStore<>();
    }

    @Bean
    public EmbeddingStoreIngestor embeddingStoreIngestor(EmbeddingStore<TextSegment> embeddingStore, EmbeddingModel embeddingModel) {
        // EmbeddingStoreIngestor 是一个工具类，封装了分块、向量化、存储的流水线
        return EmbeddingStoreIngestor.builder()
                .documentSplitter(DocumentSplitters.recursive(500, 100)) // 递归分块，最大500字符，重叠100字符
                .embeddingModel(embeddingModel)
                .embeddingStore(embeddingStore)
                .build();
    }

    // 应用启动时加载知识库的Bean
    @Bean
    public Boolean loadKnowledgeBase(EmbeddingStoreIngestor ingestor, @Value("${app.knowledge-base-path}") String path) {
        List<Document> documents = FileSystemDocumentLoader.loadDocuments(Paths.get(path), new TextDocumentParser());
        ingestor.ingest(documents);
        System.out.println("知识库文档加载完毕！");
        return true;
    }

    @Bean
    public ChatDemoAssistant knowledgeBaseAssistant(
            ChatModel chatLanguageModel,
            EmbeddingStore<TextSegment> embeddingStore,
            EmbeddingModel embeddingModel) {

        // 1. 创建内容检索器
        EmbeddingStoreContentRetriever retriever = EmbeddingStoreContentRetriever.builder()
                .embeddingStore(embeddingStore)
                .embeddingModel(embeddingModel)
                .maxResults(2) // 每次检索最相关的2个片段
                .build();

        // 2. 使用AiServices将检索器与AI模型绑定到接口上
        return AiServices.builder(ChatDemoAssistant.class)
                .chatModel(chatLanguageModel)
                .contentRetriever(retriever) // 关键：注入RAG能力！
                .build();
    }





}
