package com.calendar.chart.ai.demo.embedding.entity;

import dev.langchain4j.community.model.dashscope.QwenEmbeddingModel;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.embedding.onnx.allminilml6v2.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.openai.OpenAiEmbeddingModel;
import dev.langchain4j.store.embedding.*;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * @author Gabriel
 * @version 1.0
 * @date 2026/1/21 17:38
 * @description: TODO
 */
@Slf4j
//@RequiredArgsConstructor
public class ExcelVectorService {
    //private EmbeddingModel embeddingModel = new AllMiniLmL6V2EmbeddingModel();
    private EmbeddingStore<TextSegment> embeddingStore = new InMemoryEmbeddingStore<>();
    /*
        //private  ExcelDataMapper dataMapper;

        OllamaChatModel.OllamaChatModelBuilder
                .baseUrl("http://localhost:11434")
                    .modelName("qwen2:7b")
                    .temperature(0.3)
                    .timeout(Duration.ofMinutes(2))
                .build();
    */
    public static EmbeddingModel embeddingModel = QwenEmbeddingModel.builder()
            .baseUrl("https://dashscope.aliyuncs.com/compatible-mode/v1")
            .apiKey("sk-36f36bf254134932b98225f6c8fbb616")
            .modelName("tongyi-embedding-vision-flash")
            .build();

/*    // ✅ 正确：使用DashScopeEmbeddingModel.builder()
    EmbeddingModel embeddingModel = DashScopeEmbeddingModel.builder()
            .apiKey("sk-xxxxxxxxxxxxxxxxxxxx")  // ⚠️ 替换为你的API密钥
            .modelName("tongyi-embedding-vision-flash")
            .maxRetries(2)
            .build();*/

    public static OpenAiChatModel simpleChatModel = OpenAiChatModel.builder()
            .baseUrl("http://langchain4j.dev/demo/openai/v1")
            .apiKey("demo")
            .modelName("gpt-4o-mini")
            .build();

    /**
     * 上传Excel并向量化的核心方法
     */
    public String processExcel(MultipartFile file) {
        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            String fileName = file.getOriginalFilename();
            List<ExcelData> dataList = new ArrayList<>();

            // 遍历所有Sheet
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                Sheet sheet = workbook.getSheetAt(i);
                if (sheet.getLastRowNum() < 1) continue; // 跳过空Sheet

                // 读取表头（默认第一行）
                Row headerRow = sheet.getRow(0);
                List<String> headers = new ArrayList<>();
                for (Cell cell : headerRow) {
                    headers.add(cell.getStringCellValue());
                }

                // 遍历数据行
                for (int rowNum = 1; rowNum <= sheet.getLastRowNum(); rowNum++) {
                    Row row = sheet.getRow(rowNum);
                    if (row == null) continue;

                    // 构建合并文本：表头+值的键值对形式
                    StringBuilder combinedText = new StringBuilder();
                    for (int colNum = 0; colNum < headers.size(); colNum++) {
                        Cell cell = row.getCell(colNum, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                        String value = (cell != null) ? getCellValue(cell) : "";
                        combinedText.append(headers.get(colNum)).append(": ").append(value).append("; ");
                    }

                    // 创建实体（根据列名动态映射）
                    ExcelData data = new ExcelData();
                    data.setFileName(fileName);
                    data.setSheetName(sheet.getSheetName());
                    data.setRowIndex(rowNum);
                    data.setCombinedText(combinedText.toString());

                    // 示例：动态映射常见字段（可根据实际Excel调整）
                    mapCommonFields(data, headers, row);

                    // 生成向量并存储
                    TextSegment segment = TextSegment.from(combinedText.toString());
                    var embedding = embeddingModel.embed(segment.text());
                    String vectorId = UUID.randomUUID().toString();
                    data.setVectorId(vectorId);

                    // 存入LangChain4j向量库（同时存储向量和原始文本）
                    embeddingStore.add(embedding.content(), segment);

                    data.setCreateTime(LocalDateTime.now());
                    dataList.add(data);
                }
            }

            // 批量存入MySQL
            //dataMapper.insertBatchSomeColumn(dataList);

            return String.format("处理完成：%d个Sheet，%d条记录，生成%d个向量",
                    workbook.getNumberOfSheets(), dataList.size(), dataList.size());

        } catch (Exception e) {
            log.error("Excel处理失败", e);
            throw new RuntimeException("Excel处理失败: " + e.getMessage());
        }
    }

    /**
     * 重载方法：处理本地文件路径（无需MultipartFile）
     */
    public String processExcel(String filePath) {
        try (FileInputStream fis = new FileInputStream(filePath);
             Workbook workbook = new XSSFWorkbook(fis)) {

            File file = new File(filePath);
            String fileName = file.getName();
            List<ExcelData> dataList = new ArrayList<>();

            // 原有处理逻辑不变...
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                Sheet sheet = workbook.getSheetAt(i);
                if (sheet.getLastRowNum() < 1) continue;

                Row headerRow = sheet.getRow(0);
                List<String> headers = new ArrayList<>();
                for (Cell cell : headerRow) {
                    headers.add(cell.getStringCellValue());
                }

                for (int rowNum = 1; rowNum <= sheet.getLastRowNum(); rowNum++) {
                    Row row = sheet.getRow(rowNum);
                    if (row == null) continue;

                    // 构建合并文本...
                    StringBuilder combinedText = new StringBuilder();
                    for (int colNum = 0; colNum < headers.size(); colNum++) {
                        Cell cell = row.getCell(colNum, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                        String value = (cell != null) ? getCellValue(cell) : "";
                        combinedText.append(headers.get(colNum)).append(": ").append(value).append("; ");
                    }

                    // 创建实体...
                    ExcelData data = new ExcelData();
                    data.setFileName(fileName);
                    data.setSheetName(sheet.getSheetName());
                    data.setRowIndex(rowNum);
                    data.setCombinedText(combinedText.toString());
                    mapCommonFields(data, headers, row);

                    TextSegment segment = TextSegment.from(combinedText.toString());
                    var embedding = embeddingModel.embed(segment.text());
                    String vectorId = UUID.randomUUID().toString();
                    data.setVectorId(vectorId);

                    // 存入LangChain4j向量库（同时存储向量和原始文本）
                    embeddingStore.add(embedding.content(), segment);

                    data.setCreateTime(LocalDateTime.now());
                    dataList.add(data);
                }
            }

            //dataMapper.insertBatchSomeColumn(dataList);
            return String.format("处理完成：%d个Sheet，%d条记录，生成%d个向量",
                    workbook.getNumberOfSheets(), dataList.size(), dataList.size());

        } catch (Exception e) {
            log.error("Excel处理失败", e);
            throw new RuntimeException("Excel处理失败: " + e.getMessage());
        }
    }

    /**
     * 与Excel向量对话
     */
    public String chatWithExcel(String userQuery) {
        // 1. 检索相关向量
        var queryEmbedding = embeddingModel.embed(userQuery);
        EmbeddingSearchRequest request = EmbeddingSearchRequest.builder()
                .queryEmbedding(queryEmbedding.content())
                .maxResults(10)
                .minScore(0.7)
                .build();
        var searchResult = embeddingStore.search(request);
        List<EmbeddingMatch<TextSegment>> relevantMatches = searchResult.matches();

        // 2. 构建上下文
        StringBuilder context = new StringBuilder();
        for (EmbeddingMatch<TextSegment> match : relevantMatches) {
            if (match.embedded() != null) {
                context.append("- ").append(match.embedded().text()).append("\n");
            }
        }

        // 3. 调用大模型生成回答
        String prompt = String.format("""
                你是一个Excel数据分析助手。基于以下表格数据回答问题：
                            
                数据内容：
                %s
                            
                用户问题：%s
                            
                请直接给出答案，并引用相关数据支持你的结论。
                """, context, userQuery);


        return simpleChatModel.chat(prompt);
    }

    /**
     * 获取单元格值（兼容不同类型）
     */
    private String getCellValue(Cell cell) {
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getLocalDateTimeCellValue().toString();
                } else {
                    yield String.valueOf(cell.getNumericCellValue());
                }
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> "";
        };
    }

    /**
     * 动态映射常见字段（根据实际业务调整）
     */
    private void mapCommonFields(ExcelData data, List<String> headers, Row row) {
        for (int i = 0; i < headers.size(); i++) {
            String header = headers.get(i).toLowerCase();
            Cell cell = row.getCell(i, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
            if (cell == null) continue;

            String value = getCellValue(cell);

            // 示例映射：根据表头名称自动识别字段
            if (header.contains("公司") || header.contains("name")) {
                data.setCompanyName(value);
            } else if (header.contains("行业") || header.contains("industry")) {
                data.setIndustry(value);
            } else if (header.contains("收入") || header.contains("revenue")) {
                try {
                    data.setRevenue(Double.parseDouble(value));
                } catch (Exception ignored) {
                }
            } else if (header.contains("利润") || header.contains("profit")) {
                try {
                    data.setProfit(Double.parseDouble(value));
                } catch (Exception ignored) {
                }
            }
        }
    }


}
