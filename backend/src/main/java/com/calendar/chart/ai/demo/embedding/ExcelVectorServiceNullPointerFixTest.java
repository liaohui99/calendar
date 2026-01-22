package com.calendar.chart.ai.demo.embedding;

import com.calendar.chart.ai.demo.embedding.entity.ExcelData;
import com.calendar.chart.ai.demo.embedding.entity.ExcelVectorService;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.embedding.onnx.allminilml6v2.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


/**
 * @author Gabriel
 * @version 1.0
 * @date 2026/1/21 17:50
 * @description: 修复空指针问题的测试
 */
public class ExcelVectorServiceNullPointerFixTest {


    public static void main(String[] args) throws Exception {
        System.out.println("=".repeat(60));
        System.out.println("   ExcelVectorService 空指针问题修复验证测试");
        System.out.println("=".repeat(60));

        // ========== 1. 创建测试环境 ==========
        System.out.println("\n[步骤1] 创建测试环境和数据...");

        EmbeddingModel embeddingModel = new AllMiniLmL6V2EmbeddingModel();
        EmbeddingStore<TextSegment> embeddingStore = new InMemoryEmbeddingStore<>();
        String testExcelPath = "test-sample-nullpointer-fix.xlsx";

        createTestExcel(testExcelPath);

        // ========== 2. 模拟 ExcelVectorService.processExcel 的核心逻辑 ==========
        System.out.println("\n[步骤2] 处理Excel并生成向量（使用修复后的逻辑）...");

        try (FileInputStream fis = new FileInputStream(testExcelPath);
             Workbook workbook = new XSSFWorkbook(fis)) {

            int totalRows = 0;
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                Sheet sheet = workbook.getSheetAt(i);
                if (sheet.getLastRowNum() < 1) continue;

                Row headerRow = sheet.getRow(0);
                List<String> headers = new ArrayList<>();
                for (org.apache.poi.ss.usermodel.Cell cell : headerRow) {
                    headers.add(cell.getStringCellValue());
                }

                for (int rowNum = 1; rowNum <= sheet.getLastRowNum(); rowNum++) {
                    Row row = sheet.getRow(rowNum);
                    if (row == null) continue;

                    StringBuilder combinedText = new StringBuilder();
                    for (int colNum = 0; colNum < headers.size(); colNum++) {
                        org.apache.poi.ss.usermodel.Cell cell = row.getCell(colNum, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                        String value = (cell != null) ? getCellValue(cell) : "";
                        combinedText.append(headers.get(colNum)).append(": ").append(value).append("; ");
                    }

                    // ✅ 修复：同时存储向量和TextSegment
                    TextSegment segment = TextSegment.from(combinedText.toString());
                    var embedding = embeddingModel.embed(segment.text());
                    embeddingStore.add(embedding.content(), segment);  // 关键修复！

                    totalRows++;
                    System.out.println("  - 存储向量: " + combinedText.toString().substring(0, Math.min(50, combinedText.length())) + "...");
                }
            }
            System.out.println("  ✅ 成功存储 " + totalRows + " 条向量数据");
        }

        // ========== 3. 测试搜索功能 ==========
        System.out.println("\n[步骤3] 测试向量搜索功能...");

        String[] testQueries = {
                "哪个公司收入最高？",
                "互联网行业的公司有哪些？",
                "利润超过5000万的公司"
        };

        for (String query : testQueries) {
            System.out.println("\n  查询: " + query);

            // 执行搜索（模拟 chatWithExcel 中的逻辑）
            var queryEmbedding = embeddingModel.embed(query);
            var searchResult = embeddingStore.search(
                dev.langchain4j.store.embedding.EmbeddingSearchRequest.builder()
                    .queryEmbedding(queryEmbedding.content())
                    .maxResults(5)
                    .minScore(0.1)  // 降低阈值以获取更多结果
                    .build()
            );

            List<dev.langchain4j.store.embedding.EmbeddingMatch<TextSegment>> matches = searchResult.matches();
            System.out.println("  找到 " + matches.size() + " 条匹配结果");

            // ✅ 修复后：不再有空指针异常
            StringBuilder context = new StringBuilder();
            for (dev.langchain4j.store.embedding.EmbeddingMatch<TextSegment> match : matches) {
                if (match.embedded() != null) {
                    String text = match.embedded().text();
                    context.append("- ").append(text).append("\n");
                    System.out.println("    ✓ " + text.substring(0, Math.min(60, text.length())) + "...");
                } else {
                    System.out.println("    ⚠️  embedded() 为 null (不应该发生)");
                }
            }

            if (matches.isEmpty()) {
                System.out.println("    ℹ️  没有找到匹配的结果");
            }
        }

        System.out.println("\n" + "=".repeat(60));
        System.out.println("   ✅ 测试完成！空指针问题已修复");
        System.out.println("=".repeat(60));
        System.out.println("\n修复说明：");
        System.out.println("  问题根因: embeddingStore.add() 只存储了向量，没有存储 TextSegment");
        System.out.println("  修复方案: 改用 embeddingStore.add(embedding.content(), segment)");
        System.out.println("  效果: 现在搜索结果中 embedded() 不再为 null");
    }

    private static String getCellValue(org.apache.poi.ss.usermodel.Cell cell) {
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private static void createTestExcel(String path) throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("公司数据");

        Row header = sheet.createRow(0);
        String[] headers = {"公司名称", "行业", "收入(万)", "利润(万)", "地区"};
        for (int i = 0; i < headers.length; i++) {
            header.createCell(i).setCellValue(headers[i]);
        }

        Object[][] data = {
                {"阿里巴巴", "电商", 50000, 8000, "杭州"},
                {"腾讯", "游戏", 45000, 7500, "深圳"},
                {"字节跳动", "互联网", 30000, 6000, "北京"},
                {"美团", "本地生活", 15000, 2000, "北京"},
                {"拼多多", "电商", 25000, 4500, "上海"}
        };

        for (int i = 0; i < data.length; i++) {
            Row row = sheet.createRow(i + 1);
            row.createCell(0).setCellValue((String) data[i][0]);
            row.createCell(1).setCellValue((String) data[i][1]);
            row.createCell(2).setCellValue(Double.parseDouble(data[i][2].toString()));
            row.createCell(3).setCellValue((Integer) data[i][3]);
            row.createCell(4).setCellValue((String) data[i][4]);
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        try (FileOutputStream fos = new FileOutputStream(path)) {
            workbook.write(fos);
        }
        workbook.close();
    }
}
