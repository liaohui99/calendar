// 设备类型定义
export interface DeviceType {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 地点类型定义
export interface Location {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 设备状态枚举
export const DeviceStatus = {
  AVAILABLE: 0,  // 可用
  MAINTENANCE: 1,  // 维护中
  SCRAPPED: 2  // 已报废
} as const;

export type DeviceStatus = typeof DeviceStatus[keyof typeof DeviceStatus];

// 设备类型定义
export interface Device {
  id: number;
  name: string;
  typeId: number;
  locationId: number;
  status: DeviceStatus;
  createdAt: string;
  updatedAt: string;
  // 关联数据
  type?: DeviceType;
  location?: Location;
}

// 预约状态枚举
export const ReservationStatus = {
  PENDING: 0,  // 待确认
  CONFIRMED: 1,  // 已确认
  CANCELLED: 2  // 已取消
} as const;

export type ReservationStatus = typeof ReservationStatus[keyof typeof ReservationStatus];

// 预约记录类型定义
export interface Reservation {
  id: number;
  deviceId: number;
  userName: string;
  userContact: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
  // 关联数据
  device?: Device;
}

// 预约表单数据类型
export interface ReservationFormData {
  deviceId: number;
  userName: string;
  userContact: string;
  startTime: string;
  endTime: string;
  reason: string;
}

// API响应类型定义
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}