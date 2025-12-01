package com.calendar.chart.ai.demo;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.loader.FileSystemDocumentLoader;
import dev.langchain4j.data.document.parser.TextDocumentParser;

import java.nio.file.FileSystems;
import java.nio.file.PathMatcher;
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
        Document document = FileSystemDocumentLoader.loadDocument("E:/knowledge/测试.txt");
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
}
