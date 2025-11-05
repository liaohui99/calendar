package com.calendar.chart.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.calendar.chart.entity.Device;

import java.util.List;

/**
 * 设备服务接口
 * @author CalendarChart
 */
public interface DeviceService extends IService<Device> {
    
    /**
     * 根据条件查询设备列表
     * @param locationId 地点ID
     * @param typeId 设备类型ID
     * @return 设备列表
     */
    List<Device> getDevices(Integer locationId, Integer typeId);
    
    /**
     * 根据ID查询设备详情
     * @param id 设备ID
     * @return 设备详情
     */
    Device getDeviceById(Integer id);
    
    /**
     * 查询设备数量统计
     * @param locationId 地点ID
     * @param typeId 设备类型ID
     * @return 设备数量
     */
    int countDevices(Integer locationId, Integer typeId);
}