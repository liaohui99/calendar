package com.calendar.chart.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.calendar.chart.dao.LocationDao;
import com.calendar.chart.entity.Location;
import com.calendar.chart.service.LocationService;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
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
    
    /**
     * 获取所有地点信息
     * @return 地点列表
     */
    @Override
    @Tool("获取系统中所有可用的地点信息。返回值：地点列表，每项包含id(地点ID)、name(地点名称)、description(地点描述)等字段")
    public List<Location> getAllLocations() {
        return locationDao.selectList(null);
    }
    
    /**
     * 根据ID获取地点信息
     * @param id 地点ID
     * @return 地点信息对象
     */
    @Override
    @Tool("根据地点ID查询详细地点信息。返回值：地点信息对象，包含id(地点ID)、name(地点名称)、description(地点描述)等字段")
    public Location getLocationById(@P("地点ID，必需参数") Integer id) {
        return locationDao.selectById(id);
    }
}