package com.calendar.chart.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.calendar.chart.dao.DeviceDao;
import com.calendar.chart.entity.Device;
import com.calendar.chart.service.DeviceService;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import org.springframework.stereotype.Service;

import jakarta.annotation.Resource;
import java.util.List;

/**
 * 设备服务实现类
 * @author CalendarChart
 */
@Service("deviceService")
public class DeviceServiceImpl extends ServiceImpl<DeviceDao, Device> implements DeviceService {
    
    @Resource
    private DeviceDao deviceDao;
    
    /**
     * 根据地点ID和设备类型ID查询设备列表
     * @param locationId 地点ID，可选，传null则不限制地点
     * @param typeId 设备类型ID，可选，传null则不限制类型
     * @return 设备列表
     */
    @Override
    @Tool("根据地点和类型条件查询设备列表，参数可选。返回值：设备列表，每项包含id(设备ID)、name(设备名称)、locationId(地点ID)、typeId(设备类型ID)、status(状态)、description(描述)等字段")
    public List<Device> getDevices(@P(value = "地点ID，可选参数，传null则不限制地点", required = false) Integer locationId, @P(value = "设备类型ID，可选参数，传null则不限制类型", required = false) Integer typeId) {
        return deviceDao.selectByCondition(locationId, typeId);
    }
    
    /**
     * 根据ID获取设备信息
     * @param id 设备ID
     * @return 设备信息对象
     */
    @Override
    @Tool("根据设备ID查询详细设备信息。返回值：设备信息对象，包含id(设备ID)、name(设备名称)、locationId(地点ID)、typeId(设备类型ID)、status(状态)、description(描述)等字段")
    public Device getDeviceById(@P("设备ID，必需参数") Integer id) {
        return deviceDao.selectById(id);
    }
    
    /**
     * 统计满足条件的设备数量
     * @param locationId 地点ID，可选，传null则不限制地点
     * @param typeId 设备类型ID，可选，传null则不限制类型
     * @return 设备数量
     */
    @Override
    @Tool("统计指定地点和类型条件下的设备数量。返回值：整数，表示符合条件的设备数量")
    public int countDevices(@P(value = "地点ID，可选参数，传null则不限制地点", required = false) Integer locationId, @P(value = "设备类型ID，可选参数，传null则不限制类型", required = false) Integer typeId) {
        return deviceDao.countByLocationAndType(locationId, typeId);
    }
}