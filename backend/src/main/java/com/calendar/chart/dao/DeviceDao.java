package com.calendar.chart.dao;

import com.calendar.chart.entity.Device;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 设备数据访问接口
 * @author CalendarChart
 */
@Repository
public interface DeviceDao extends BaseMapper<Device> {
    
    /**
     * 根据条件查询设备列表
     * @param locationId 地点ID
     * @param typeId 设备类型ID
     * @return 设备列表
     */
    List<Device> selectByCondition(@Param("locationId") Integer locationId, 
                                  @Param("typeId") Integer typeId);
    
    /**
     * 查询指定地点和类型的设备数量
     * @param locationId 地点ID
     * @param typeId 设备类型ID
     * @return 设备数量
     */
    int countByLocationAndType(@Param("locationId") Integer locationId, 
                              @Param("typeId") Integer typeId);
}