package com.calendar.chart.service;

import com.calendar.chart.dto.ReservationRequest;
import com.calendar.chart.entity.Reservation;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;

/**
 * 预约服务接口
 * @author CalendarChart
 */
public interface ReservationService extends IService<Reservation> {
    
    /**
     * 根据日期查询预约记录
     * @param date 查询日期（格式：yyyy-MM-dd）
     * @return 预约记录列表
     */
    List<Reservation> getReservationsByDate(String date);
    
    /**
     * 创建预约
     * @param request 预约请求数据
     * @return 创建的预约记录
     * @throws Exception 预约冲突或其他异常
     */
    Reservation createReservation(ReservationRequest request) throws Exception;
    
    /**
     * 检查预约时间冲突
     * @param deviceId 设备ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param excludeId 排除的预约ID（用于更新操作）
     * @return 是否存在冲突
     */
    boolean checkTimeConflict(Integer deviceId, String startTime, String endTime, Integer excludeId);
    
    /**
     * 查询设备在指定日期的预约记录
     * @param deviceId 设备ID
     * @param date 查询日期
     * @return 预约记录列表
     */
    List<Reservation> getReservationsByDeviceAndDate(Integer deviceId, String date);
    
    /**
     * 取消/删除预约
     * @param id 预约ID
     * @return 是否取消成功
     */
    boolean cancelReservation(Integer id);
    
    /**
     * 更新预约状态
     * @param id 预约ID
     * @param status 新状态
     * @param reason 状态变更原因（可选）
     * @return 更新后的预约记录
     */
    Reservation updateReservationStatus(Integer id, Integer status, String reason);
}