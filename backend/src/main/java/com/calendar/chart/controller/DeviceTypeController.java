package com.calendar.chart.controller;

import com.calendar.chart.dto.ApiResponse;
import com.calendar.chart.entity.DeviceType;
import com.calendar.chart.service.DeviceTypeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.List;

/**
 * 设备类型控制器
 * @author CalendarChart
 */
@RestController
@RequestMapping("/api/types")
public class DeviceTypeController {
    
    @Resource
    private DeviceTypeService deviceTypeService;
    
    /**
     * 获取所有设备类型
     * @return 设备类型列表
     */
    @GetMapping
    public ApiResponse<List<DeviceType>> getTypes() {
        List<DeviceType> types = deviceTypeService.getAllTypes();
        return ApiResponse.success(types);
    }
    
    /**
     * 根据ID获取设备类型详情
     * @param id 设备类型ID
     * @return 设备类型详情
     */
    @GetMapping("/{id}")
    public ApiResponse<DeviceType> getType(@PathVariable Integer id) {
        DeviceType type = deviceTypeService.getTypeById(id);
        return ApiResponse.success(type);
    }
}