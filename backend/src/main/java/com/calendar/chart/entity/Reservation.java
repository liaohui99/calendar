package com.calendar.chart.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Data;
import jakarta.persistence.*;

import java.io.Serializable;
import java.util.Date;

/**
 * 预约记录实体类
 * @author CalendarChart
 */
@Data
@TableName("reservation")
@Entity
@Table(name = "reservation")
public class Reservation implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * 设备ID
     */
    private Integer deviceId;

    /**
     * 预约人姓名
     */
    private String userName;

    /**
     * 预约人联系方式
     */
    private String userContact;

    /**
     * 预约开始时间
     */
    private Date startTime;

    /**
     * 预约结束时间
     */
    private Date endTime;

    /**
     * 预约事由
     */
    private String reason;

    /**
     * 预约状态：0-待使用，1-进行中，2-已完成，3-已取消
     */
    private Integer status;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;
}