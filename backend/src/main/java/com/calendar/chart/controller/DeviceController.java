package com.calendar.chart.controller;

import com.calendar.chart.dto.ApiResponse;
import com.calendar.chart.entity.Device;
import com.calendar.chart.service.DeviceService;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.Resource;
import java.util.List;

/**
 * 设备控制器
 * @author CalendarChart
 */
@RestController
@RequestMapping("/api/devices")
public class DeviceController {
    
    @Resource
    private DeviceService deviceService;
    
    /**
     * 获取设备列表
     * @param locationId 地点ID（可选）
     * @param typeId 设备类型ID（可选）
     * @return 设备列表
     */
    @GetMapping
    public ApiResponse<List<Device>> getDevices(
            @RequestParam(value = "locationId", required = false) Integer locationId,
            @RequestParam(value = "typeId", required = false) Integer typeId) {
        List<Device> devices = deviceService.getDevices(locationId, typeId);
        return ApiResponse.success(devices);
    }
    
    /**
     * 根据ID获取设备详情
     * @param id 设备ID
     * @return 设备详情
     */
    @GetMapping("/{id}")
    public ApiResponse<Device> getDevice(@PathVariable Integer id) {
        Device device = deviceService.getDeviceById(id);
        return ApiResponse.success(device);
    }
}