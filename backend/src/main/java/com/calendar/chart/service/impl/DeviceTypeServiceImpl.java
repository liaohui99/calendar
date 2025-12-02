package com.calendar.chart.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.calendar.chart.dao.DeviceTypeDao;
import com.calendar.chart.entity.DeviceType;
import com.calendar.chart.service.DeviceTypeService;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import org.springframework.stereotype.Service;

import jakarta.annotation.Resource;
import java.util.List;

/**
 * 设备类型服务实现类
 * @author CalendarChart
 */
@Service("deviceTypeService")
public class DeviceTypeServiceImpl extends ServiceImpl<DeviceTypeDao, DeviceType> implements DeviceTypeService {
    
    @Resource
    private DeviceTypeDao deviceTypeDao;
    
    /**
     * 获取所有设备类型信息
     * @return 设备类型列表
     */
    @Override
    @Tool("获取系统中所有可用的设备类型信息。返回值：设备类型列表，每项包含id(设备类型ID)、name(设备类型名称)、description(设备类型描述)等字段")
    public List<DeviceType> getAllTypes() {
        return deviceTypeDao.selectList(null);
    }
    
    /**
     * 根据ID获取设备类型信息
     * @param id 设备类型ID
     * @return 设备类型信息对象
     */
    @Override
    @Tool("根据设备类型ID查询详细设备类型信息。返回值：设备类型信息对象，包含id(设备类型ID)、name(设备类型名称)、description(设备类型描述)等字段")
    public DeviceType getTypeById(@P("设备类型ID，必需参数") Integer id) {
        return deviceTypeDao.selectById(id);
    }
}