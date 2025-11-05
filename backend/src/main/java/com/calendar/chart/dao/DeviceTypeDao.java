package com.calendar.chart.dao;

import com.calendar.chart.entity.DeviceType;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 设备类型数据访问接口
 * @author CalendarChart
 */
@Repository
public interface DeviceTypeDao extends BaseMapper<DeviceType> {
    

    
    // 基础的CRUD操作已通过BaseMapper提供
    // 可以根据需求添加其他自定义查询方法
}