package com.calendar.chart.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.calendar.chart.dao.DeviceTypeDao;
import com.calendar.chart.entity.DeviceType;
import com.calendar.chart.service.DeviceTypeService;
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
    
    @Override
    public List<DeviceType> getAllTypes() {
        return deviceTypeDao.selectList(null);
    }
    
    @Override
    public DeviceType getTypeById(Integer id) {
        return deviceTypeDao.selectById(id);
    }
}