package com.calendar.chart.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.calendar.chart.dao.ReservationDao;
import com.calendar.chart.dto.ReservationRequest;
import com.calendar.chart.entity.Reservation;
import com.calendar.chart.service.ReservationService;
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
    
    @Override
    public List<Reservation> getReservationsByDate(String date) {
        return reservationDao.selectByDate(date);
    }
    
    @Override
      public Reservation createReservation(ReservationRequest request) throws Exception {
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
        reservation.setStatus(0); // 初始状态：待使用
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
    
    @Override
    public boolean checkTimeConflict(Integer deviceId, String startTime, String endTime, Integer excludeId) {
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
    
    @Override
    public List<Reservation> getReservationsByDeviceAndDate(Integer deviceId, String date) {
        return reservationDao.selectByDeviceAndDate(deviceId, date);
    }
}