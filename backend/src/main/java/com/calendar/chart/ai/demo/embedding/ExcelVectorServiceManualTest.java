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
import org.jetbrains.annotations.NotNull;

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
 * @description: TODO
 */
public class ExcelVectorServiceManualTest {


    public static void main(String[] args) throws Exception {
        main2();


    }

    public static void main2() throws Exception {
        ExcelVectorService service = getExcelVectorService("D:\\飞书\\Downloads\\小红书数据.xlsx");

        String[] testQueries = {"首购用户支付金额最大的是多少"};

        for (String query : testQueries) {
            System.out.println("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            System.out.println("问: " + query);
            System.out.println("答: " + service.chatWithExcel(query));
            Thread.sleep(1000); // 避免请求过快
        }

        System.out.println("\n🎉 测试完成！");
    }

    public static void main1() throws Exception {
        ExcelVectorService service = getExcelVectorService("D:\\飞书\\Downloads\\小红书数据.xlsx");

        String[] testQueries = {
                "哪个公司收入最高？",
                "互联网行业的公司有哪些？",
                "利润超过5000万的公司有多少家？"
        };

        for (String query : testQueries) {
            System.out.println("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            System.out.println("问: " + query);
            System.out.println("答: " + service.chatWithExcel(query));
            Thread.sleep(1000); // 避免请求过快
        }

        System.out.println("\n🎉 测试完成！");
    }


    private static ExcelVectorService getExcelVectorService(String testExcelPath) {
        // ========== 1. 准备测试环境 ==========
        System.out.println("🚀 开始纯Java测试...");

        // 创建Excel测试文件（如果不存在）
        //String testExcelPath = "test-sample.xlsx";
        //String testExcelPath = "D:\\飞书\\Downloads\\小红书数据.xlsx";
        //createTestExcel(testExcelPath);

        // 手动装配依赖
        EmbeddingModel embeddingModel = new AllMiniLmL6V2EmbeddingModel();
        EmbeddingStore<TextSegment> embeddingStore = new InMemoryEmbeddingStore<>();
        OllamaChatModel chatModel  = OllamaChatModel.builder()
                .baseUrl("http://localhost:11434")
                .modelName("qwen2:7b")
                .temperature(0.3)
                .timeout(Duration.ofMinutes(2))
                .build();

        // 模拟Mapper（使用内存列表代替MySQL）
        FakeExcelDataMapper fakeMapper = new FakeExcelDataMapper();

        // 创建Service实例
        ExcelVectorService service = new ExcelVectorService();

        // ========== 2. 测试Excel处理 ==========
        System.out.println("\n📊 步骤1: 处理Excel文件...");
        String processResult = service.processExcel(testExcelPath);
        System.out.println("✅ " + processResult);

        // 打印数据库中的数据
        System.out.println("\n📦 数据库中的记录:");
        fakeMapper.selectList().forEach(System.out::println);

        // ========== 3. 测试对话功能 ==========
        System.out.println("\n💬 步骤2: 测试对话...");
        return service;
    }

    // ========== 辅助类和方法 ==========

    /**
     * 创建测试Excel文件
     */
    private static void createTestExcel(String path) throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("公司数据");

        // 创建表头
        Row header = sheet.createRow(0);
        String[] headers = {"公司名称", "行业", "收入(万)", "利润(万)", "地区"};
        for (int i = 0; i < headers.length; i++) {
            header.createCell(i).setCellValue(headers[i]);
        }

        // 创建数据行
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
            row.createCell(2).setCellValue(Double.parseDouble(data[i][2].toString())); // 统一转为double
            row.createCell(3).setCellValue((Integer) data[i][3]);
            row.createCell(4).setCellValue((String) data[i][4]);
        }
        // 自动调整列宽
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        try (FileOutputStream fos = new FileOutputStream(path)) {
            workbook.write(fos);
        }
        workbook.close();

        System.out.println("📁 测试Excel已创建: " + path);
    }



    /**
     * 模拟MyBatis Mapper（使用内存列表）
     */
    static class FakeExcelDataMapper {
        private final List<ExcelData> memoryDb = new ArrayList<>();
        private long autoIncrementId = 1;

        public int insertBatchSomeColumn(List<ExcelData> list) {
            for (ExcelData data : list) {
                data.setId(autoIncrementId++);
                data.setCreateTime(LocalDateTime.now());
                memoryDb.add(data);
            }
            return list.size();
        }

        public List<ExcelData> selectList() {
            return new ArrayList<>(memoryDb);
        }

        public List<ExcelData> selectByFileName(String fileName) {
            return memoryDb.stream()
                    .filter(d -> d.getFileName().equals(fileName))
                    .collect(Collectors.toList());
        }
    }







}
