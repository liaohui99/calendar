package com.calendar.chart.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.calendar.chart.dao.LocationDao;
import com.calendar.chart.entity.Location;
import com.calendar.chart.service.LocationService;
import org.springframework.stereotype.Service;

import jakarta.annotation.Resource;
import java.util.List;

/**
 * 地点服务实现类
 * @author CalendarChart
 */
@Service("locationService")
public class LocationServiceImpl extends ServiceImpl<LocationDao, Location> implements LocationService {
    
    @Resource
    private LocationDao locationDao;
    
    @Override
    public List<Location> getAllLocations() {
        return locationDao.selectList(null);
    }
    
    @Override
    public Location getLocationById(Integer id) {
        return locationDao.selectById(id);
    }
}