package com.calendar.chart.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.calendar.chart.dao.DeviceDao;
import com.calendar.chart.entity.Device;
import com.calendar.chart.service.DeviceService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * 设备服务实现类
 * @author CalendarChart
 */
@Service("deviceService")
public class DeviceServiceImpl extends ServiceImpl<DeviceDao, Device> implements DeviceService {
    
    @Resource
    private DeviceDao deviceDao;
    
    @Override
    public List<Device> getDevices(Integer locationId, Integer typeId) {
        return deviceDao.selectByCondition(locationId, typeId);
    }
    
    @Override
    public Device getDeviceById(Integer id) {
        return deviceDao.selectById(id);
    }
    
    @Override
    public int countDevices(Integer locationId, Integer typeId) {
        return deviceDao.countByLocationAndType(locationId, typeId);
    }
}