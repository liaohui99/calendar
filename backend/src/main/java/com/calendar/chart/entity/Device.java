package com.calendar.chart.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Data;
import jakarta.persistence.*;

import java.io.Serializable;
import java.util.Date;

/**
 * 设备实体类
 * @author CalendarChart
 */
@Data
@TableName(value = "device")
@Entity
@Table(name = "device")
public class Device implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * 设备名称
     */
    private String name;

    /**
     * 设备编号
     */
    private String code;

    /**
     * 设备类型ID
     */
    private Integer typeId;

    /**
     * 地点ID
     */
    private Integer locationId;

    /**
     * 设备状态：0-空闲，1-使用中，2-故障，3-维护中
     */
    private Integer status;

    /**
     * 设备描述
     */
    private String description;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;
}