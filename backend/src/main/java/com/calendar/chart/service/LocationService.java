package com.calendar.chart.service;

import com.calendar.chart.entity.Location;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;

/**
 * 地点服务接口
 * @author CalendarChart
 */
public interface LocationService extends IService<Location> {
    
    /**
     * 获取所有地点
     * @return 地点列表
     */
    List<Location> getAllLocations();
    
    /**
     * 根据ID获取地点
     * @param id 地点ID
     * @return 地点
     */
    Location getLocationById(Integer id);
}