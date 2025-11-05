package com.calendar.chart.dao;

import com.calendar.chart.entity.Reservation;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

/**
 * 预约记录数据访问接口
 * @author CalendarChart
 */
@Repository
public interface ReservationDao extends BaseMapper<Reservation> {
    
    /**
     * 根据日期查询预约记录
     * @param date 查询日期
     * @return 预约记录列表
     */
    List<Reservation> selectByDate(@Param("date") String date);
    
    /**
     * 检查设备在指定时间段内是否有冲突的预约
     * @param deviceId 设备ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param excludeId 排除的预约ID（用于更新操作）
     * @return 冲突的预约数量
     */
    int checkConflict(@Param("deviceId") Integer deviceId,
                     @Param("startTime") Date startTime,
                     @Param("endTime") Date endTime,
                     @Param("excludeId") Integer excludeId);
    
    /**
     * 查询指定设备在指定日期的预约记录
     * @param deviceId 设备ID
     * @param date 查询日期
     * @return 预约记录列表
     */
    List<Reservation> selectByDeviceAndDate(@Param("deviceId") Integer deviceId,
                                          @Param("date") String date);
}