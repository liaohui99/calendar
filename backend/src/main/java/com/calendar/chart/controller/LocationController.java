package com.calendar.chart.controller;

import com.calendar.chart.dto.ApiResponse;
import com.calendar.chart.entity.Location;
import com.calendar.chart.service.LocationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.List;

/**
 * 地点控制器
 * @author CalendarChart
 */
@RestController
@RequestMapping("/api/locations")
public class LocationController {
    
    @Resource
    private LocationService locationService;
    
    /**
     * 获取所有地点
     * @return 地点列表
     */
    @GetMapping
    public ApiResponse<List<Location>> getLocations() {
        List<Location> locations = locationService.getAllLocations();
        return ApiResponse.success(locations);
    }
    
    /**
     * 根据ID获取地点详情
     * @param id 地点ID
     * @return 地点详情
     */
    @GetMapping("/{id}")
    public ApiResponse<Location> getLocation(@PathVariable Integer id) {
        Location location = locationService.getLocationById(id);
        return ApiResponse.success(location);
    }
}