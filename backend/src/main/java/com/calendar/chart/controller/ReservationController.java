package com.calendar.chart.controller;

import com.calendar.chart.dto.ApiResponse;
import com.calendar.chart.dto.ReservationRequest;
import com.calendar.chart.entity.Reservation;
import com.calendar.chart.service.ReservationService;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.Resource;
import java.util.List;

/**
 * 预约控制器
 * @author CalendarChart
 */
@RestController
@RequestMapping("/api/reservations")
public class ReservationController {
    
    @Resource
    private ReservationService reservationService;
    
    /**
     * 根据日期查询预约记录
     * @param date 查询日期（格式：yyyy-MM-dd）
     * @return 预约记录列表
     */
    @GetMapping
    public ApiResponse<List<Reservation>> getReservations(@RequestParam String date) {
        List<Reservation> reservations = reservationService.getReservationsByDate(date);
        return ApiResponse.success(reservations);
    }
    
    /**
     * 创建新预约
     * @param request 预约请求数据
     * @return 创建的预约记录
     */
    @PostMapping
    public ApiResponse<Reservation> createReservation(@RequestBody ReservationRequest request) {
        try {
            // 先在控制器层进行基础验证
            if (request.getDeviceId() == null || request.getDeviceId() <= 0) {
                return ApiResponse.error(400, "设备ID无效");
            }
            
            Reservation reservation = reservationService.createReservation(request);
            return ApiResponse.success(reservation);
        } catch (Exception e) {
            String message = e.getMessage();
            if (message.contains("已被预约")) {
                return ApiResponse.error(409, message);
            } else if (message.contains("时间格式")) {
                // 时间格式错误属于客户端输入错误，返回400状态码
                return ApiResponse.error(400, message);
            } else if (message.contains("预约创建失败")) {
                // 数据库保存失败可能是服务器内部问题，但提供清晰信息
                return ApiResponse.error(500, message);
            }
            // 其他未知错误也记录状态码
            return ApiResponse.error(400, message);
        }
    }
    
    /**
     * 查询设备在指定日期的预约记录
     * @param deviceId 设备ID
     * @param date 查询日期
     * @return 预约记录列表
     */
    @GetMapping("/device")
    public ApiResponse<List<Reservation>> getDeviceReservations(
            @RequestParam Integer deviceId,
            @RequestParam String date) {
        List<Reservation> reservations = reservationService.getReservationsByDeviceAndDate(deviceId, date);
        return ApiResponse.success(reservations);
    }
    
    /**
     * 取消/删除预约
     * @param id 预约ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> cancelReservation(@PathVariable Integer id) {
        try {
            boolean success = reservationService.cancelReservation(id);
            if (success) {
                return ApiResponse.success(null);
            } else {
                return ApiResponse.error(500, "取消预约失败");
            }
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "取消预约失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新预约状态
     * @param id 预约ID
     * @param request 状态更新请求
     * @return 更新后的预约记录
     */
    @PutMapping("/{id}/status")
    public ApiResponse<Reservation> updateReservationStatus(
            @PathVariable Integer id,
            @RequestBody StatusUpdateRequest request) {
        try {
            // 参数验证
            if (request.getStatus() == null || request.getStatus() < 0 || request.getStatus() > 2) {
                return ApiResponse.error(400, "无效的预约状态");
            }
            
            Reservation reservation = reservationService.updateReservationStatus(
                id, 
                request.getStatus(), 
                request.getReason()
            );
            return ApiResponse.success(reservation);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "更新预约状态失败: " + e.getMessage());
        }
    }
    
    /**
     * 状态更新请求内部类
     */
    public static class StatusUpdateRequest {
        private Integer status;
        private String reason;
        
        public Integer getStatus() {
            return status;
        }
        
        public void setStatus(Integer status) {
            this.status = status;
        }
        
        public String getReason() {
            return reason;
        }
        
        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}