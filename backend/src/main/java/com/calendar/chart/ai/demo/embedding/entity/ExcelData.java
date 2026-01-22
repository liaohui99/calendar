package com.calendar.chart.ai.demo.embedding.entity;

/**
 * @author Gabriel
 * @version 1.0
 * @date 2026/1/21 17:40
 * @description: TODO
 */
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("excel_vector_data")
public class ExcelData {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String fileName;              // 文件名
    private String sheetName;             // Sheet名
    private Integer rowIndex;             // 行号
    private String combinedText;          // 合并后的文本（用于向量化的内容）

    // 业务字段（可根据Excel动态扩展）
    private String companyName;           // 示例：公司名称
    private String industry;              // 示例：行业
    private Double revenue;               // 示例：收入
    private Double profit;                // 示例：利润

    private String vectorId;              // 向量库中的ID
    private LocalDateTime createTime;     // 创建时间
}
