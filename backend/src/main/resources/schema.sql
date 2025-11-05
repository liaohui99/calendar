-- H2数据库初始化脚本
-- H2内存数据库不需要创建数据库语句
-- 直接开始创建表结构

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
('设备', '通用设备'),
('会议室', '会议室资源'),
('项目', '项目资源');

-- 插入地点
INSERT INTO location (name, description) VALUES 
('澳特科学园B栋全部', '澳特科学园B栋全部区域'),
('澳特科学园A栋一楼', '澳特科学园A栋一楼区域'),
('澳特科学园C栋', '澳特科学园C栋区域');

-- 插入设备
INSERT INTO device (name, code, type_id, location_id, status, description) VALUES 
('设备一', 'DEV-001', 1, 1, 0, '测试设备一'),
('设备二', 'DEV-002', 1, 1, 0, '测试设备二'),
('设备三', 'DEV-003', 1, 1, 0, '测试设备三'),
('设备四', 'DEV-004', 1, 1, 0, '测试设备四'),
('设备五', 'DEV-005', 1, 1, 0, '测试设备五'),
('设备六', 'DEV-006', 1, 1, 0, '测试设备六'),
('设备七', 'DEV-007', 1, 2, 0, '测试设备七'),
('设备八', 'DEV-008', 1, 2, 0, '测试设备八');

-- 插入一些测试预约记录
INSERT INTO reservation (device_id, user_name, user_contact, start_time, end_time, reason, status) VALUES 
(5, '飞书_测试用户', 'test@example.com', CONCAT(CURDATE(), ' 14:00:00'), CONCAT(CURDATE(), ' 15:00:00'), '测试预约', 0),
(3, '张三', 'zhangsan@example.com', CONCAT(CURDATE(), ' 09:00:00'), CONCAT(CURDATE(), ' 11:00:00'), '设备调试', 0),
(2, '李四', 'lisi@example.com', CONCAT(CURDATE(), ' 16:00:00'), CONCAT(CURDATE(), ' 18:00:00'), '项目开发', 0);