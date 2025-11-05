package com.calendar.chart.service;

import com.calendar.chart.entity.DeviceType;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;

/**
 * 设备类型服务接口
 * @author CalendarChart
 */
public interface DeviceTypeService extends IService<DeviceType> {
    
    /**
     * 获取所有设备类型
     * @return 设备类型列表
     */
    List<DeviceType> getAllTypes();
    
    /**
     * 根据ID获取设备类型
     * @param id 设备类型ID
     * @return 设备类型
     */
    DeviceType getTypeById(Integer id);
}