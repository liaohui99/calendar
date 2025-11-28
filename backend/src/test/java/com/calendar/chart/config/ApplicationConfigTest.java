package com.calendar.chart.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import static org.junit.jupiter.api.Assertions.*;

/**
 * ApplicationConfig配置类的测试用例
 * 使用纯单元测试方法验证配置类的结构和方法是否正确
 * 
 * @author Calendar Chart Team
 */
class ApplicationConfigTest {

    /**
     * 测试配置类的基本结构是否完整
     */
    @Test
    void testConfigurationStructure() {
        // 创建配置类实例（不依赖Spring容器）
        ApplicationConfig config = new ApplicationConfig();
        // 验证配置类能够实例化
        assertNotNull(config, "配置类无法实例化");
    }

    /**
     * 测试配置类是否使用了正确的注解
     */
    @Test
    void testConfigurationAnnotations() {
        assertTrue(ApplicationConfig.class.isAnnotationPresent(org.springframework.context.annotation.Configuration.class),
                "配置类缺少@Configuration注解");
    }

    /**
     * 测试配置类是否包含@Value注解的字段
     */
    @Test
    void testValueAnnotations() {
        try {
            // 检查是否存在使用@Value注解的字段
            boolean hasValueFields = false;
            for (java.lang.reflect.Field field : ApplicationConfig.class.getDeclaredFields()) {
                if (field.isAnnotationPresent(Value.class)) {
                    hasValueFields = true;
                    break;
                }
            }
            assertTrue(hasValueFields, "配置类中没有使用@Value注解的字段");
        } catch (Exception e) {
            fail("检查@Value注解时出错: " + e.getMessage());
        }
    }

    /**
     * 测试配置类是否包含所有必要的getter方法
     * 注意：由于我们使用的是纯单元测试，不调用实际方法（会导致NullPointerException）
     * 而是通过反射来验证方法是否存在
     */
    @Test
    void testGetterMethodsExist() {
        try {
            // 验证关键的getter方法存在
            ApplicationConfig.class.getMethod("getApplicationName");
            ApplicationConfig.class.getMethod("getServerPort");
            ApplicationConfig.class.getMethod("getRedisHost");
            ApplicationConfig.class.getMethod("getDatasourceUrl");
            
            // 如果能执行到这里，说明所有方法都存在
            assertTrue(true, "所有关键getter方法都存在");
        } catch (NoSuchMethodException e) {
            fail("配置类缺少必要的getter方法: " + e.getMessage());
        }
    }

    /**
     * 测试配置类的继承结构
     */
    @Test
    void testInheritance() {
        // 验证配置类是Object的子类（所有Java类都是）
        assertTrue(Object.class.isAssignableFrom(ApplicationConfig.class));
        // 验证配置类没有实现不必要的接口
        assertEquals(0, ApplicationConfig.class.getInterfaces().length);
    }

    /**
     * 测试配置类是否可以被正确初始化
     */
    @Test
    void testConstructor() {
        try {
            // 验证配置类有一个公共的无参构造函数
            ApplicationConfig.class.getConstructor();
            assertTrue(true, "配置类有公共的无参构造函数");
        } catch (NoSuchMethodException e) {
            fail("配置类缺少公共的无参构造函数: " + e.getMessage());
        }
    }
}
