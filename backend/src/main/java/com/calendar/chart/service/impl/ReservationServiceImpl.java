package com.calendar.chart.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.calendar.chart.dao.ReservationDao;
import com.calendar.chart.dto.ReservationRequest;
import com.calendar.chart.entity.Reservation;
import com.calendar.chart.service.ReservationService;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import org.springframework.stereotype.Service;

import jakarta.annotation.Resource;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * 预约服务实现类
 * @author CalendarChart
 */
@Service("reservationService")
public class ReservationServiceImpl extends ServiceImpl<ReservationDao, Reservation> implements ReservationService {
    
    @Resource
    private ReservationDao reservationDao;
    
    
    /**
     * 尝试解析多种时间格式的字符串为Date对象
     */
    private Date parseDateTime(String dateTimeStr) throws ParseException {
        // 尝试使用Java 8的DateTimeFormatter解析ISO格式
        try {
            // 移除可能的时区信息
            if (dateTimeStr.contains("Z")) {
                dateTimeStr = dateTimeStr.replace("Z", "");
            }
            if (dateTimeStr.contains(".")) {
                dateTimeStr = dateTimeStr.substring(0, dateTimeStr.lastIndexOf('.'));
            }
            
            // 支持ISO格式：2025-11-10T09:00
            LocalDateTime dateTime = LocalDateTime.parse(dateTimeStr, 
                DateTimeFormatter.ofPattern(dateTimeStr.contains("T") ? "yyyy-MM-dd'T'HH:mm" : "yyyy-MM-dd HH:mm"));
            return java.sql.Timestamp.valueOf(dateTime);
        } catch (DateTimeParseException e) {
            // 尝试使用SimpleDateFormat
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
            return sdf.parse(dateTimeStr);
        }
    }
    
    /**
     * 根据日期查询预约记录
     * @param date 查询日期，格式为yyyy-MM-dd
     * @return 预约记录列表
     */
    @Override
    @Tool("根据日期查询预约记录，日期格式为yyyy-MM-dd。返回值：预约记录列表，每项包含id(预约ID)、deviceId(设备ID)、userName(预约人姓名)、userContact(联系方式)、startTime(开始时间)、endTime(结束时间)、reason(预约事由)、status(状态)等字段")
    public List<Reservation> getReservationsByDate(@P("查询日期，格式为yyyy-MM-dd，必需参数") String date) {
        return reservationDao.selectByDate(date);
    }
    
    /**
     * 创建新的预约记录
     * @param request 预约请求对象，包含设备ID、用户信息、预约时间等
     * @return 创建的预约记录
     * @throws Exception 设备ID无效、时间冲突或预约创建失败时抛出
     */
    @Override
    @Tool("创建新的预约记录，需要提供设备ID、用户信息、预约开始和结束时间。返回值：创建的预约记录对象，包含id(预约ID)、deviceId(设备ID)、userName(预约人姓名)、userContact(联系方式)、startTime(开始时间)、endTime(结束时间)、reason(预约事由)、status(状态)等字段")
    public Reservation createReservation(@P("预约请求对象，包含以下必需字段：deviceId(设备ID，整数类型，必填)、userName(预约人姓名，字符串类型，必填)、userContact(预约人联系方式，字符串类型，必填)、startTime(预约开始时间，格式为yyyy-MM-dd HH:mm或ISO格式，必填)、endTime(预约结束时间，格式为yyyy-MM-dd HH:mm或ISO格式，必填)、reason(预约事由，字符串类型，必填)") ReservationRequest request) throws Exception {
        // 检查设备ID有效性
        if (request.getDeviceId() == null || request.getDeviceId() <= 0) {
            throw new Exception("设备ID无效");
        }
        
        // 检查时间冲突
        if (checkTimeConflict(request.getDeviceId(), request.getStartTime(), request.getEndTime(), null)) {
            throw new Exception("该时间段已被预约，请选择其他时间");
        }
        
        // 创建预约记录
        Reservation reservation = new Reservation();
        reservation.setDeviceId(request.getDeviceId());
        reservation.setUserName(request.getUserName());
        reservation.setUserContact(request.getUserContact());
        reservation.setReason(request.getReason());
        reservation.setStatus(Integer.valueOf(0)); // 初始状态：待使用
        reservation.setCreateTime(new Date());
        reservation.setUpdateTime(new Date());
        
        try {
            reservation.setStartTime(parseDateTime(request.getStartTime()));
            reservation.setEndTime(parseDateTime(request.getEndTime()));
        } catch (ParseException e) {
            throw new Exception("时间格式错误，请使用 yyyy-MM-dd HH:mm 或 ISO 格式");
        }
        
        // 保存到数据库
        if (!save(reservation)) {
            throw new Exception("预约创建失败");
        }
        
        return reservation;
    }
    
    /**
     * 检查指定时间段是否存在预约冲突
     * @param deviceId 设备ID
     * @param startTime 开始时间，格式为yyyy-MM-dd HH:mm或ISO格式
     * @param endTime 结束时间，格式为yyyy-MM-dd HH:mm或ISO格式
     * @param excludeId 需要排除的预约ID（更新时使用）
     * @return 是否存在冲突
     */
    @Override
    @Tool("检查指定设备在特定时间段是否存在预约冲突。返回值：布尔值，true表示存在冲突，false表示不存在冲突")
    public boolean checkTimeConflict(
            @P("设备ID，必需参数") Integer deviceId,
            @P("开始时间，格式为yyyy-MM-dd HH:mm或ISO格式，必需参数") String startTime,
            @P("结束时间，格式为yyyy-MM-dd HH:mm或ISO格式，必需参数") String endTime,
            @P(value = "需要排除的预约ID（更新时使用），可选参数", required = false) Integer excludeId) {
        try {
            Date start = parseDateTime(startTime);
            Date end = parseDateTime(endTime);
            
            // 查询冲突的预约数量
            int conflictCount = reservationDao.checkConflict(deviceId, start, end, excludeId);
            
            return conflictCount > 0;
        } catch (ParseException e) {
            // 记录时间格式错误，便于调试
            System.err.println("时间格式解析错误: " + e.getMessage());
            // 时间格式错误，认为存在冲突
            return true;
        }
    }
    
    /**
     * 根据设备ID和日期查询预约记录
     * @param deviceId 设备ID
     * @param date 查询日期，格式为yyyy-MM-dd
     * @return 预约记录列表
     */
    @Override
    @Tool("根据设备ID和日期查询预约记录。返回值：预约记录列表，每项包含id(预约ID)、deviceId(设备ID)、userName(预约人姓名)、userContact(联系方式)、startTime(开始时间)、endTime(结束时间)、reason(预约事由)、status(状态)等字段")
    public List<Reservation> getReservationsByDeviceAndDate(
            @P("设备ID，必需参数") Integer deviceId,
            @P("查询日期，格式为yyyy-MM-dd，必需参数") String date) {
        return reservationDao.selectByDeviceAndDate(deviceId, date);
    }
    
    /**
     * 取消/删除预约
     * @param id 预约ID
     * @return 是否取消成功
     */
    @Override
    public boolean cancelReservation(@P("预约ID") Integer id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("无效的预约ID");
        }
        
        Reservation reservation = getById(id);
        if (reservation == null) {
            throw new IllegalArgumentException("预约记录不存在");
        }
        
        // 软删除：将状态改为已取消
        reservation.setStatus(Integer.valueOf(2)); // 2: 已取消
        reservation.setUpdateTime(new Date());
        
        return updateById(reservation);
    }
    
    /**
     * 更新预约状态
     * @param id 预约ID
     * @param status 新状态（0: 待确认, 1: 已确认, 2: 已取消）
     * @param reason 状态变更原因（可选）
     * @return 更新后的预约记录
     */
    @Override
    public Reservation updateReservationStatus(
            @P("预约ID") Integer id,
            @P("新状态") Integer status,
            @P(value = "状态变更原因", required = false) String reason) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("无效的预约ID");
        }
        
        if (status == null || status < 0 || status > 2) {
            throw new IllegalArgumentException("无效的预约状态");
        }
        
        Reservation reservation = getById(id);
        if (reservation == null) {
            throw new IllegalArgumentException("预约记录不存在");
        }
        
        // 更新状态
        reservation.setStatus(status);
        reservation.setUpdateTime(new Date());
        
        // 如果提供了原因，则更新原因字段
        if (reason != null && !reason.trim().isEmpty()) {
            reservation.setReason(reason);
        }
        
        updateById(reservation);
        
        return getById(id);
    }
}