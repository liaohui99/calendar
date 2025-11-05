package com.calendar.chart.init;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.text.SimpleDateFormat;

/**
 * 数据初始化器
 * 在应用启动时自动创建测试数据
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("开始初始化测试数据...");
        
        // 使用JdbcTemplate直接执行SQL，避免依赖其他组件
        String dateStr = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        
        try {
            // 先清空现有数据，确保使用最新的测试数据
            jdbcTemplate.update("DELETE FROM reservation");
            jdbcTemplate.update("DELETE FROM device");
            jdbcTemplate.update("DELETE FROM device_type");
            jdbcTemplate.update("DELETE FROM location");
            
            System.out.println("已清空现有数据，准备插入新的测试数据...");
                // 使用更新后的地点数据
                jdbcTemplate.update("INSERT INTO location (name, description, create_time, update_time) VALUES (?, ?, ?, ?)",
                        "澳特科学园B栋全部", "澳特科学园B栋全部区域", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO location (name, description, create_time, update_time) VALUES (?, ?, ?, ?)",
                        "澳特科学园A栋一楼", "澳特科学园A栋一楼区域", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO location (name, description, create_time, update_time) VALUES (?, ?, ?, ?)",
                        "澳特科学园C栋", "澳特科学园C栋区域", dateStr, dateStr);
                
                // 使用更新后的设备类型数据
                jdbcTemplate.update("INSERT INTO device_type (name, description, create_time, update_time) VALUES (?, ?, ?, ?)",
                        "笔记本电脑", "可移动的计算设备", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device_type (name, description, create_time, update_time) VALUES (?, ?, ?, ?)",
                        "台式电脑", "固定位置的计算设备", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device_type (name, description, create_time, update_time) VALUES (?, ?, ?, ?)",
                        "会议室", "团队会议场所", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device_type (name, description, create_time, update_time) VALUES (?, ?, ?, ?)",
                        "投影仪", "演示设备", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device_type (name, description, create_time, update_time) VALUES (?, ?, ?, ?)",
                        "打印机", "文档输出设备", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device_type (name, description, create_time, update_time) VALUES (?, ?, ?, ?)",
                        "扫描仪", "文档输入设备", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device_type (name, description, create_time, update_time) VALUES (?, ?, ?, ?)",
                        "视频会议设备", "远程会议设备", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device_type (name, description, create_time, update_time) VALUES (?, ?, ?, ?)",
                        "网络设备", "网络连接设备", dateStr, dateStr);
                
                // 插入80台设备 - 笔记本电脑 (类型1) - 10台
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "MacBook Pro 16", "NB-001", 1, 1, 0, "M2 Pro芯片，16GB内存", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "ThinkPad X1 Carbon", "NB-002", 1, 2, 1, "碳纤维机身，i7处理器(使用中)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "Dell XPS 13", "NB-003", 1, 3, 0, "全面屏笔记本", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "HP Spectre x360", "NB-004", 1, 2, 0, "二合一笔记本", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "Lenovo Yoga", "NB-005", 1, 1, 0, "轻薄笔记本", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "Surface Laptop", "NB-006", 1, 3, 2, "触控屏笔记本(故障)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "Acer Swift", "NB-007", 1, 1, 0, "超轻薄笔记本", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "ASUS ZenBook", "NB-008", 1, 2, 0, "商务笔记本", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "LG Gram", "NB-009", 1, 3, 3, "超轻笔记本(维护中)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "Razer Blade", "NB-010", 1, 1, 0, "游戏笔记本", dateStr, dateStr);
                
                // 台式电脑 (类型2) - 10台
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "Dell OptiPlex", "DT-001", 2, 1, 0, "商务台式机", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "HP EliteDesk", "DT-002", 2, 2, 1, "高性能台式机(使用中)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "ThinkStation", "DT-003", 2, 3, 0, "工作站", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "Lenovo IdeaCentre", "DT-004", 2, 1, 0, "家用台式机", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "ASUS ROG", "DT-005", 2, 2, 0, "游戏台式机", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "MSI Gaming", "DT-006", 2, 3, 2, "游戏台式机(故障)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "MSI MPG", "DT-007", 2, 3, 2, "高性能台式机(故障)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "Acer Aspire", "DT-008", 2, 2, 0, "家庭用台式机", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "Gigabyte AORUS", "DT-009", 2, 1, 0, "高端台式机", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "Intel NUC", "DT-010", 2, 3, 0, "迷你PC", dateStr, dateStr);
                
                // 会议室 (类型3) - 10个
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "会议室A", "RM-001", 3, 1, 0, "10人会议室", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "会议室B", "RM-002", 3, 1, 0, "20人会议室", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "会议室C", "RM-003", 3, 2, 0, "小型会议室", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "会议室D", "RM-004", 3, 3, 0, "中型会议室", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "会议室E", "RM-005", 3, 1, 1, "大型会议室(使用中)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "会议室F", "RM-006", 3, 2, 0, "视频会议室", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "会议室G", "RM-007", 3, 3, 2, "多功能会议室(故障)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "会议室H", "RM-008", 3, 1, 0, "培训室", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "会议室I", "RM-009", 3, 2, 0, "圆桌会议室", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "会议室J", "RM-010", 3, 3, 3, "董事会议室(维护中)", dateStr, dateStr);
                
                // 投影仪 (类型4) - 10台
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "爱普生投影仪", "PJ-001", 4, 1, 0, "高清投影仪", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "明基投影仪", "PJ-002", 4, 2, 1, "商务投影仪(使用中)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "索尼投影仪", "PJ-003", 4, 3, 0, "专业投影仪", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "奥图码投影仪", "PJ-004", 4, 1, 0, "短焦投影仪", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "坚果投影仪", "PJ-005", 4, 2, 0, "智能投影仪", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "小米投影仪", "PJ-006", 4, 3, 2, "便携投影仪(故障)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "极米投影仪", "PJ-007", 4, 1, 0, "家用投影仪", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "松下投影仪", "PJ-008", 4, 2, 0, "激光投影仪", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "日立投影仪", "PJ-009", 4, 3, 3, "工程投影仪(维护中)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "NEC投影仪", "PJ-010", 4, 1, 0, "商用投影仪", dateStr, dateStr);
                
                // 打印机 (类型5) - 10台
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "惠普激光打印机", "PR-001", 5, 1, 0, "黑白激光打印机", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "佳能多功能打印机", "PR-002", 5, 2, 1, "彩色打印机(使用中)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "爱普生喷墨打印机", "PR-003", 5, 3, 0, "照片打印机", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "兄弟打印机", "PR-004", 5, 1, 0, "激光打印机", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "三星打印机", "PR-005", 5, 2, 0, "网络打印机", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "得力打印机", "PR-006", 5, 3, 2, "针式打印机(故障)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "联想打印机", "PR-007", 5, 1, 0, "多功能一体机", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "富士施乐打印机", "PR-008", 5, 2, 0, "高速打印机", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "京瓷打印机", "PR-009", 5, 3, 3, "企业级打印机(维护中)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "OKI打印机", "PR-010", 5, 1, 0, "专业打印机", dateStr, dateStr);
                
                // 平板设备 (类型6) - 10台
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "iPad Pro", "TB-001", 6, 1, 0, "12.9英寸平板电脑", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "华为MatePad Pro", "TB-002", 6, 2, 1, "10.8英寸平板(使用中)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "Samsung Galaxy Tab", "TB-003", 6, 3, 0, "Android平板", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "Surface Pro", "TB-004", 6, 1, 0, "二合一平板", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "iPad Air", "TB-005", 6, 2, 0, "10.9英寸平板", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "小米平板", "TB-006", 6, 3, 2, "平板电脑(故障)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "联想平板", "TB-007", 6, 1, 0, "商务平板", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "vivo平板", "TB-008", 6, 2, 0, "娱乐平板", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "OPPO平板", "TB-009", 6, 3, 3, "平板设备(维护中)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "iPad mini", "TB-010", 6, 1, 0, "小屏平板", dateStr, dateStr);
                
                // 视频会议设备 (类型7) - 10台
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "腾讯会议终端", "VC-001", 7, 1, 0, "视频会议终端", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "腾讯会议终端", "VC-002", 7, 2, 0, "视频会议终端", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "思科Webex", "VC-003", 7, 3, 0, "企业级视频会议", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "华为TE40", "VC-004", 7, 1, 0, "高清视频会议终端", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "Polycom Group", "VC-005", 7, 2, 1, "视频会议系统(使用中)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "Logitech Rally", "VC-006", 7, 3, 0, "智能视频会议", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "Yealink VC500", "VC-007", 7, 1, 0, "视频会议终端", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "小鱼易连", "VC-008", 7, 2, 2, "云视频会议(故障)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "亿联VC800", "VC-009", 7, 3, 0, "高清视频会议", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "锐捷视频会议", "VC-010", 7, 1, 3, "视频会议系统(维护中)", dateStr, dateStr);
                
                // 网络设备 (类型8) - 10台
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "思科路由器", "NW-001", 8, 1, 0, "企业级路由器", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "TP-Link交换机", "NW-002", 8, 2, 0, "网络交换机", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "华为防火墙", "NW-003", 8, 3, 0, "网络安全设备", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "华三交换机", "NW-004", 8, 1, 0, "核心交换机", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "D-Link路由器", "NW-005", 8, 2, 0, "无线路由器", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "小米路由器", "NW-006", 8, 3, 1, "智能路由器(使用中)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "腾达路由器", "NW-007", 8, 1, 0, "家用路由器", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "水星交换机", "NW-008", 8, 2, 2, "千兆交换机(故障)", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "华硕路由器", "NW-009", 8, 3, 0, "游戏路由器", dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO device (name, code, type_id, location_id, status, description, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        "Netgear交换机", "NW-010", 8, 1, 3, "网管交换机(维护中)", dateStr, dateStr);
                
                // 插入预约记录
                String todayStr = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
                
                // 笔记本电脑预约
                jdbcTemplate.update("INSERT INTO reservation (device_id, user_name, user_contact, start_time, end_time, reason, status, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        2, "张三", "zhangsan@example.com", todayStr + " 10:00:00", todayStr + " 11:00:00", "项目开发", 1, dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO reservation (device_id, user_name, user_contact, start_time, end_time, reason, status, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        5, "李四", "lisi@example.com", todayStr + " 14:00:00", todayStr + " 16:00:00", "代码审查", 0, dateStr, dateStr);
                
                // 台式电脑预约
                java.util.Calendar cal = java.util.Calendar.getInstance();
                cal.add(java.util.Calendar.DAY_OF_YEAR, 1);
                String tomorrowStr = new SimpleDateFormat("yyyy-MM-dd").format(cal.getTime());
                jdbcTemplate.update("INSERT INTO reservation (device_id, user_name, user_contact, start_time, end_time, reason, status, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        12, "赵六", "zhaoliu@example.com", tomorrowStr + " 13:00:00", tomorrowStr + " 17:00:00", "数据分析", 1, dateStr, dateStr);
                
                // 会议室预约
                jdbcTemplate.update("INSERT INTO reservation (device_id, user_name, user_contact, start_time, end_time, reason, status, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        25, "周八", "zhouba@example.com", todayStr + " 10:30:00", todayStr + " 12:30:00", "团队会议", 1, dateStr, dateStr);
                
                // 投影仪预约
                jdbcTemplate.update("INSERT INTO reservation (device_id, user_name, user_contact, start_time, end_time, reason, status, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        32, "郑十", "zhengshi@example.com", todayStr + " 15:00:00", todayStr + " 17:00:00", "产品演示", 1, dateStr, dateStr);
                
                // 打印机预约
                cal.add(java.util.Calendar.DAY_OF_YEAR, 1);
                String day2Str = new SimpleDateFormat("yyyy-MM-dd").format(cal.getTime());
                jdbcTemplate.update("INSERT INTO reservation (device_id, user_name, user_contact, start_time, end_time, reason, status, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        45, "陈一", "chenyi@example.com", day2Str + " 10:00:00", day2Str + " 11:00:00", "文档打印", 0, dateStr, dateStr);
                
                // 视频会议设备预约
                jdbcTemplate.update("INSERT INTO reservation (device_id, user_name, user_contact, start_time, end_time, reason, status, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        62, "林二", "liner@example.com", tomorrowStr + " 09:00:00", tomorrowStr + " 10:00:00", "远程会议", 0, dateStr, dateStr);
                
                // 更多预约记录
                jdbcTemplate.update("INSERT INTO reservation (device_id, user_name, user_contact, start_time, end_time, reason, status, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        7, "王五", "wangwu@example.com", tomorrowStr + " 09:00:00", tomorrowStr + " 12:00:00", "客户演示", 0, dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO reservation (device_id, user_name, user_contact, start_time, end_time, reason, status, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        16, "孙七", "sunqi@example.com", tomorrowStr + " 14:00:00", tomorrowStr + " 16:00:00", "系统测试", 0, dateStr, dateStr);
                jdbcTemplate.update("INSERT INTO reservation (device_id, user_name, user_contact, start_time, end_time, reason, status, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        28, "吴九", "wujiu@example.com", tomorrowStr + " 13:30:00", tomorrowStr + " 15:30:00", "项目启动会", 0, dateStr, dateStr);
                
                // 读取并执行init.sql文件中的数据插入语句
                // 使用我们更新后的80台设备数据
                System.out.println("测试数据初始化完成！已添加80台设备和10条预约记录。");
        } catch (Exception e) {
            System.out.println("数据初始化过程中发生错误: " + e.getMessage());
            // 如果表不存在，记录错误但不中断启动
            if (e.getMessage().contains("not found") || e.getMessage().contains("不存在")) {
                System.out.println("表可能尚未创建，应用启动后会自动创建表结构。");
            } else {
                e.printStackTrace();
            }
        }
    }
}