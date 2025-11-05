-- H2数据库初始化脚本
-- H2内存数据库不需要创建数据库语句
-- 直接开始创建表结构和插入数据

-- 创建设备类型表 (H2兼容版本)
CREATE TABLE IF NOT EXISTS device_type (
    id INT IDENTITY PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '类型名称',
    description VARCHAR(200) COMMENT '类型描述',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='设备类型表';

-- 创建地点表 (H2兼容版本)
CREATE TABLE IF NOT EXISTS location (
    id INT IDENTITY PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '地点名称',
    description VARCHAR(200) COMMENT '地点描述',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='地点表';

-- 创建设备表 (H2兼容版本)
CREATE TABLE IF NOT EXISTS device (
    id INT IDENTITY PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '设备名称',
    code VARCHAR(50) NOT NULL COMMENT '设备编号',
    type_id INT COMMENT '设备类型ID',
    location_id INT COMMENT '地点ID',
    status INT DEFAULT 0 COMMENT '设备状态：0-空闲，1-使用中，2-故障，3-维护中',
    description VARCHAR(200) COMMENT '设备描述',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (type_id) REFERENCES device_type(id),
    FOREIGN KEY (location_id) REFERENCES location(id)
) COMMENT='设备表';

-- 创建预约记录表 (H2兼容版本)
CREATE TABLE IF NOT EXISTS reservation (
    id INT IDENTITY PRIMARY KEY,
    device_id INT NOT NULL COMMENT '设备ID',
    user_name VARCHAR(50) NOT NULL COMMENT '预约人姓名',
    user_contact VARCHAR(100) NOT NULL COMMENT '预约人联系方式',
    start_time TIMESTAMP NOT NULL COMMENT '预约开始时间',
    end_time TIMESTAMP NOT NULL COMMENT '预约结束时间',
    reason VARCHAR(200) NOT NULL COMMENT '预约事由',
    status INT DEFAULT 0 COMMENT '预约状态：0-待使用，1-进行中，2-已完成，3-已取消',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (device_id) REFERENCES device(id)
) COMMENT='预约记录表';

-- 创建索引以提高查询性能
CREATE INDEX idx_reservation_device_start ON reservation(device_id, start_time);
CREATE INDEX idx_reservation_date ON reservation(start_time);
CREATE INDEX idx_device_location_type ON device(location_id, type_id);

-- 插入测试数据
-- 插入设备类型
INSERT INTO device_type (name, description) VALUES 
('笔记本电脑', '可移动的计算设备'),
('台式电脑', '固定位置的计算设备'),
('会议室', '团队会议场所'),
('投影仪', '演示设备'),
('打印机', '文档输出设备'),
('扫描仪', '文档输入设备'),
('视频会议设备', '远程会议设备'),
('网络设备', '网络连接设备');

-- 插入地点
INSERT INTO location (name, description) VALUES 
('澳特科学园B栋全部', '澳特科学园B栋全部区域'),
('澳特科学园A栋一楼', '澳特科学园A栋一楼区域'),
('澳特科学园C栋', '澳特科学园C栋区域');

-- 插入设备
INSERT INTO device (name, code, type_id, location_id, status, description) VALUES 
-- 笔记本电脑 (类型1) - 10台
('MacBook Pro 16', 'NB-001', 1, 1, 0, 'M2 Pro芯片，16GB内存'),
('ThinkPad X1', 'NB-002', 1, 1, 0, 'i7处理器，16GB内存'),
('Dell XPS 13', 'NB-003', 1, 2, 0, 'i5处理器，8GB内存'),
('HP EliteBook', 'NB-004', 1, 2, 0, 'i7处理器，16GB内存'),
('Lenovo Yoga', 'NB-005', 1, 1, 1, '触摸屏笔记本，i5处理器'),
('ASUS ZenBook', 'NB-006', 1, 3, 0, '超轻薄笔记本'),
('Microsoft Surface', 'NB-007', 1, 2, 0, '二合一设备'),
('Acer Swift', 'NB-008', 1, 3, 0, '经济型笔记本'),
('MSI Gaming', 'NB-009', 1, 1, 3, '游戏本(维护中)'),
('Samsung Galaxy Book', 'NB-010', 1, 3, 0, '轻薄本'),
-- 台式电脑 (类型2) - 10台
('Dell OptiPlex', 'DT-001', 2, 1, 0, 'i7处理器，32GB内存'),
('HP ProDesk', 'DT-002', 2, 1, 1, 'i5处理器，16GB内存'),
('ThinkStation', 'DT-003', 2, 2, 0, '工作站级台式机'),
('Apple Mac Mini', 'DT-004', 2, 3, 0, 'M1芯片，8GB内存'),
('Lenovo ThinkCentre', 'DT-005', 2, 2, 0, 'i7处理器，16GB内存'),
('ASUS ROG', 'DT-006', 2, 1, 0, '游戏台式机'),
('MSI MPG', 'DT-007', 2, 3, 2, '高性能台式机(故障)'),
('Acer Aspire', 'DT-008', 2, 2, 0, '家庭用台式机'),
('Gigabyte AORUS', 'DT-009', 2, 1, 0, '高端台式机'),
('Intel NUC', 'DT-010', 2, 3, 0, '迷你PC'),
-- 会议室 (类型3) - 10个
('会议室A', 'RM-001', 3, 1, 0, '10人会议室'),
('会议室B', 'RM-002', 3, 1, 0, '20人会议室'),
('会议室C', 'RM-003', 3, 2, 0, '小型会议室'),
('会议室D', 'RM-004', 3, 3, 0, '中型会议室'),
('会议室E', 'RM-005', 3, 1, 1, '大型会议室(使用中)'),
('会议室F', 'RM-006', 3, 2, 0, '视频会议室'),
('会议室G', 'RM-007', 3, 3, 0, '多功能会议室'),
('会议室H', 'RM-008', 3, 1, 0, '小型讨论室'),
('会议室I', 'RM-009', 3, 2, 3, '培训室(维护中)'),
('会议室J', 'RM-010', 3, 3, 0, '圆桌会议室'),
-- 投影仪 (类型4) - 10台
('爱普生投影仪', 'PJ-001', 4, 1, 0, '3000流明投影仪'),
('明基投影仪', 'PJ-002', 4, 2, 2, '高清投影仪(故障)'),
('索尼投影仪', 'PJ-003', 4, 3, 0, '4K投影仪'),
('日立投影仪', 'PJ-004', 4, 1, 0, '激光投影仪'),
('NEC投影仪', 'PJ-005', 4, 2, 0, '商务投影仪'),
('松下投影仪', 'PJ-006', 4, 3, 1, '教学投影仪(使用中)'),
('奥图码投影仪', 'PJ-007', 4, 1, 0, '家用投影仪'),
('优派投影仪', 'PJ-008', 4, 2, 0, '便携投影仪'),
('夏普投影仪', 'PJ-009', 4, 3, 0, '短焦投影仪'),
('LG投影仪', 'PJ-010', 4, 1, 3, '智能投影仪(维护中)'),
-- 打印机 (类型5) - 10台
('惠普激光打印机', 'PR-001', 5, 1, 0, '黑白激光打印机'),
('佳能彩色打印机', 'PR-002', 5, 2, 0, '彩色多功能打印机'),
('爱普生喷墨打印机', 'PR-003', 5, 3, 0, '照片打印机'),
('兄弟激光打印机', 'PR-004', 5, 1, 0, '多功能激光打印机'),
('联想打印机', 'PR-005', 5, 2, 1, '黑白打印机(使用中)'),
('三星打印机', 'PR-006', 5, 3, 0, '彩色激光打印机'),
('施乐打印机', 'PR-007', 5, 1, 0, '高速打印机'),
('得力打印机', 'PR-008', 5, 2, 2, '便携打印机(故障)'),
('富士施乐打印机', 'PR-009', 5, 3, 0, '多功能一体机'),
('OKI打印机', 'PR-010', 5, 1, 0, '点阵打印机'),
-- 扫描仪 (类型6) - 10台
('富士通扫描仪', 'SC-001', 6, 1, 0, '高速文档扫描仪'),
('佳能扫描仪', 'SC-002', 6, 2, 0, '平板扫描仪'),
('爱普生扫描仪', 'SC-003', 6, 3, 0, '多功能扫描仪'),
('惠普扫描仪', 'SC-004', 6, 1, 0, '照片扫描仪'),
('兄弟扫描仪', 'SC-005', 6, 2, 0, '便携式扫描仪'),
('松下扫描仪', 'SC-006', 6, 3, 1, '高速扫描仪(使用中)'),
('虹光扫描仪', 'SC-007', 6, 1, 2, '自动馈纸扫描仪(故障)'),
('科密扫描仪', 'SC-008', 6, 2, 0, '名片扫描仪'),
('中晶扫描仪', 'SC-009', 6, 3, 0, '大幅面扫描仪'),
('精益扫描仪', 'SC-010', 6, 1, 3, '文档扫描仪(维护中)'),
-- 视频会议设备 (类型7) - 10台
('Zoom会议设备', 'VC-001', 7, 1, 0, '高清视频会议系统'),
('腾讯会议终端', 'VC-002', 7, 2, 0, '视频会议终端'),
('思科Webex', 'VC-003', 7, 3, 0, '企业级视频会议'),
('华为TE40', 'VC-004', 7, 1, 0, '高清视频会议终端'),
('Polycom Group', 'VC-005', 7, 2, 1, '视频会议系统(使用中)'),
('Logitech Rally', 'VC-006', 7, 3, 0, '智能视频会议'),
('Yealink VC500', 'VC-007', 7, 1, 0, '视频会议终端'),
('小鱼易连', 'VC-008', 7, 2, 2, '云视频会议(故障)'),
('亿联VC800', 'VC-009', 7, 3, 0, '高清视频会议'),
('锐捷视频会议', 'VC-010', 7, 1, 3, '视频会议系统(维护中)'),
-- 网络设备 (类型8) - 10台
('思科路由器', 'NW-001', 8, 1, 0, '企业级路由器'),
('TP-Link交换机', 'NW-002', 8, 2, 0, '网络交换机'),
('华为防火墙', 'NW-003', 8, 3, 0, '网络安全设备'),
('华三交换机', 'NW-004', 8, 1, 0, '核心交换机'),
('D-Link路由器', 'NW-005', 8, 2, 0, '无线路由器'),
('小米路由器', 'NW-006', 8, 3, 1, '智能路由器(使用中)'),
('腾达路由器', 'NW-007', 8, 1, 0, '家用路由器'),
('水星交换机', 'NW-008', 8, 2, 2, '千兆交换机(故障)'),
('华硕路由器', 'NW-009', 8, 3, 0, '游戏路由器'),
('Netgear交换机', 'NW-010', 8, 1, 3, '网管交换机(维护中)');

-- 插入一些测试预约记录
INSERT INTO reservation (device_id, user_name, user_contact, start_time, end_time, reason, status) VALUES 
-- 笔记本电脑预约
(2, '张三', 'zhangsan@example.com', CONCAT(CURDATE(), ' 10:00:00'), CONCAT(CURDATE(), ' 11:00:00'), '项目开发', 1),
(5, '李四', 'lisi@example.com', CONCAT(CURDATE(), ' 14:00:00'), CONCAT(CURDATE(), ' 16:00:00'), '代码审查', 0),
(7, '王五', 'wangwu@example.com', DATEADD('DAY', 1, CONCAT(CURDATE(), ' 09:00:00')), DATEADD('DAY', 1, CONCAT(CURDATE(), ' 12:00:00')), '客户演示', 0),
-- 台式电脑预约
(12, '赵六', 'zhaoliu@example.com', CONCAT(CURDATE(), ' 13:00:00'), CONCAT(CURDATE(), ' 17:00:00'), '数据分析', 1),
(16, '孙七', 'sunqi@example.com', DATEADD('DAY', 1, CONCAT(CURDATE(), ' 14:00:00')), DATEADD('DAY', 1, CONCAT(CURDATE(), ' 16:00:00')), '系统测试', 0),
-- 会议室预约
(25, '周八', 'zhouba@example.com', CONCAT(CURDATE(), ' 10:30:00'), CONCAT(CURDATE(), ' 12:30:00'), '团队会议', 1),
(28, '吴九', 'wujiu@example.com', DATEADD('DAY', 1, CONCAT(CURDATE(), ' 13:30:00')), DATEADD('DAY', 1, CONCAT(CURDATE(), ' 15:30:00')), '项目启动会', 0),
-- 投影仪预约
(32, '郑十', 'zhengshi@example.com', CONCAT(CURDATE(), ' 15:00:00'), CONCAT(CURDATE(), ' 17:00:00'), '产品演示', 1),
-- 打印机预约
(45, '陈一', 'chenyi@example.com', DATEADD('DAY', 2, CONCAT(CURDATE(), ' 10:00:00')), DATEADD('DAY', 2, CONCAT(CURDATE(), ' 11:00:00')), '文档打印', 0),
-- 视频会议设备预约
(62, '林二', 'liner@example.com', DATEADD('DAY', 1, CONCAT(CURDATE(), ' 09:00:00')), DATEADD('DAY', 1, CONCAT(CURDATE(), ' 10:00:00')), '远程会议', 0);

-- 显示创建的表
SHOW TABLES;

-- 显示数据量
SELECT '设备类型' AS table_name, COUNT(*) AS count FROM device_type
UNION ALL
SELECT '地点', COUNT(*) FROM location
UNION ALL
SELECT '设备', COUNT(*) FROM device
UNION ALL
SELECT '预约', COUNT(*) FROM reservation;