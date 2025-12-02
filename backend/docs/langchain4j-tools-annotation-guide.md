# LangChain4j 工具注解使用指南

## 概述

本文档描述了在 `com.calendar.chart.service.impl` 包下为各服务实现类添加的 LangChain4j 工具注解，用于将这些服务方法暴露为 AI 代理可调用的工具。

## 注解说明

### 1. @Tool 注解

`@Tool` 注解用于标记一个方法为 AI 代理可调用的工具。注解参数为工具的描述信息，应当简明扼要地说明工具的功能。

### 2. @P 注解

`@P` 注解用于描述方法参数的作用，包含以下信息：
- 参数的详细描述
- 参数的格式要求（如日期格式、ID类型等）
- 参数是否必需

对于复合对象参数（非基本类型），需要在@P注解中详细描述其包含的所有字段、字段类型、格式要求和是否必需。由于当前使用的LangChain4j 1.0.0-beta3版本不支持直接为对象字段添加@Description注解，所以必须在@P注解中完整描述所有字段信息。

## 添加的工具方法

### 1. ReservationServiceImpl

| 方法名 | 工具描述 | 参数说明 | 返回值 |
|-------|---------|---------|-------|
| `getReservationsByDate` | 根据日期查询预约记录，日期格式为yyyy-MM-dd | date: 查询日期，格式为yyyy-MM-dd，必需参数 | List<Reservation> |
| `createReservation` | 创建新的预约记录，需要提供设备ID、用户信息、预约开始和结束时间 | request: 预约请求对象，包含以下必需字段：<br>- deviceId: 设备ID，整数类型，必填<br>- userName: 预约人姓名，字符串类型，必填<br>- userContact: 预约人联系方式，字符串类型，必填<br>- startTime: 预约开始时间，格式为yyyy-MM-dd HH:mm或ISO格式，必填<br>- endTime: 预约结束时间，格式为yyyy-MM-dd HH:mm或ISO格式，必填<br>- reason: 预约事由，字符串类型，必填 | Reservation |
| `checkTimeConflict` | 检查指定设备在特定时间段是否存在预约冲突 | deviceId: 设备ID，必需参数<br>startTime: 开始时间，格式为yyyy-MM-dd HH:mm或ISO格式，必需参数<br>endTime: 结束时间，格式为yyyy-MM-dd HH:mm或ISO格式，必需参数<br>excludeId: 需要排除的预约ID（更新时使用），可选参数 | boolean |
| `getReservationsByDeviceAndDate` | 根据设备ID和日期查询预约记录 | deviceId: 设备ID，必需参数<br>date: 查询日期，格式为yyyy-MM-dd，必需参数 | List<Reservation> |

### 2. LocationServiceImpl

| 方法名 | 工具描述 | 参数说明 | 返回值 |
|-------|---------|---------|-------|
| `getAllLocations` | 获取所有地点列表 | 无参数 | List<Location> |
| `getLocationById` | 根据地点ID查询详细地点信息 | id: 地点ID，必需参数 | Location |

### 3. DeviceTypeServiceImpl

| 方法名 | 工具描述 | 参数说明 | 返回值 |
|-------|---------|---------|-------|
| `getAllTypes` | 获取所有设备类型列表 | 无参数 | List<DeviceType> |
| `getTypeById` | 根据设备类型ID查询详细设备类型信息 | id: 设备类型ID，必需参数 | DeviceType |

### 4. DeviceServiceImpl

| 方法名 | 工具描述 | 参数说明 | 返回值 |
|-------|---------|---------|-------|
| `getDevices` | 根据地点和类型条件查询设备列表，参数可选 | locationId: 地点ID，可选参数，传null则不限制地点<br>typeId: 设备类型ID，可选参数，传null则不限制类型 | List<Device> |
| `getDeviceById` | 根据设备ID查询详细设备信息 | id: 设备ID，必需参数 | Device |
| `countDevices` | 统计指定地点和类型条件下的设备数量 | locationId: 地点ID，可选参数，传null则不限制地点<br>typeId: 设备类型ID，可选参数，传null则不限制类型 | int |

## 使用示例

```java
// AI代理可以这样调用预约查询工具
List<Reservation> reservations = reservationService.getReservationsByDate("2024-12-25");

// 检查时间冲突
boolean hasConflict = reservationService.checkTimeConflict(1, "2024-12-25 09:00", "2024-12-25 11:00", null);

// 获取设备信息
Device device = deviceService.getDeviceById(1);
```

## 注意事项

1. 所有工具方法都应当有明确的参数校验，确保参数的合法性
2. 工具方法的返回值应当清晰、结构化，便于AI代理理解和使用
3. 对于需要特殊格式的参数（如日期、时间），在@P注解中必须明确说明格式要求
4. 对于可选参数，在@P注解中应当标明可选，并说明默认行为
5. 当调用这些工具时，需要确保相关的服务已经被正确注入和初始化

## 依赖配置

项目使用的LangChain4j版本为1.0.0-beta3，相关依赖配置如下：

```xml
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j</artifactId>
    <version>${langchain4j.version}</version>
</dependency>
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-open-ai</artifactId>
    <version>${langchain4j.version}</version>
</dependency>
```

## 维护说明

1. 当添加新的服务方法并希望将其暴露为工具时，需要添加@Tool和@P注解
2. 当修改现有方法的参数或功能时，需要同步更新对应的注解描述
3. 定期检查文档，确保与实际代码保持一致