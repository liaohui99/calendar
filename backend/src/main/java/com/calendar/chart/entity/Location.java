package com.calendar.chart.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import javax.persistence.*;

import java.io.Serializable;
import java.util.Date;

/**
 * 地点实体类
 * @author CalendarChart
 */
@Data
@TableName("location")
@Entity
@Table(name = "location")
public class Location implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * 地点名称
     */
    private String name;

    /**
     * 地点描述
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