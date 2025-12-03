package com.calendar.chart.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * 应用配置类
 * 使用@Value注解注入application.yml中的所有配置项
 * 
 * @author Calendar Chart Team
 */
@Data
@Configuration
public class ApplicationConfig {

    // Spring应用配置
    @Value("${spring.application.name:calendar-chart}")
    private String applicationName;

    // Redis配置
    @Value("${spring.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.redis.port:6379}")
    private int redisPort;

    @Value("${spring.redis.database:0}")
    private int redisDatabase;

    @Value("${spring.redis.password:}")
    private String redisPassword;

    // 数据源配置
    @Value("${spring.datasource.url:jdbc:h2:mem:calendar_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE}")
    private String datasourceUrl;

    @Value("${spring.datasource.driver-class-name:org.h2.Driver}")
    private String datasourceDriverClassName;

    @Value("${spring.datasource.username:sa}")
    private String datasourceUsername;

    @Value("${spring.datasource.password:password}")
    private String datasourcePassword;

    // H2控制台配置
    @Value("${spring.h2.console.enabled:true}")
    private boolean h2ConsoleEnabled;

    @Value("${spring.h2.console.path:/h2-console}")
    private String h2ConsolePath;

    @Value("${spring.h2.console.settings.web-allow-others:true}")
    private boolean h2ConsoleWebAllowOthers;

    // JPA配置
    @Value("${spring.jpa.hibernate.ddl-auto:create-drop}")
    private String jpaHibernateDdlAuto;

    @Value("${spring.jpa.show-sql:true}")
    private boolean jpaShowSql;

    @Value("${spring.main.allow-bean-definition-overriding:false}")
    private boolean allowBeanDefinitionOverriding;

    // 服务器配置
    @Value("${server.port:8080}")
    private int serverPort;

    // 日志配置
    @Value("${logging.level.root:INFO}")
    private String loggingLevelRoot;

    @Value("${logging.level.com.calendar.chart:DEBUG}")
    private String loggingLevelCalendarChart;

    @Value("${logging.level.org.springframework.web:INFO}")
    private String loggingLevelSpringWeb;

    @Value("${logging.level.org.hibernate:INFO}")
    private String loggingLevelHibernate;

    // MyBatis-Plus配置
    @Value("${mybatis-plus.mapper-locations:classpath:mapper/*.xml}")
    private String mybatisPlusMapperLocations;

    @Value("${mybatis-plus.type-aliases-package:com.calendar.chart.entity}")
    private String mybatisPlusTypeAliasesPackage;

    @Value("${mybatis-plus.configuration.map-underscore-to-camel-case:true}")
    private boolean mybatisPlusMapUnderscoreToCamelCase;

    @Value("${mybatis-plus.configuration.log-impl:org.apache.ibatis.logging.stdout.StdOutImpl}")
    private String mybatisPlusLogImpl;

    // LangChain4j OpenAI配置
    @Value("${langchain4j.open-ai.chat-model.api-key:demo}")
    private String langchain4jApiKey;

    @Value("${langchain4j.open-ai.chat-model.model-name:gpt-4o-mini}")
    private String langchain4jModelName;

    @Value("${langchain4j.open-ai.chat-model.thinking-model-name:gpt-4o-mini}")
    private String langchain4jThinkingModelName;

    @Value("${langchain4j.open-ai.chat-model.base-url:http://langchain4j.dev/demo/openai/v1}")
    private String langchain4jBaseUrl;

    @Value("${langchain4j.open-ai.chat-model.log-requests:false}")
    private boolean langchain4jLogRequests;

    @Value("${langchain4j.open-ai.chat-model.log-responses:false}")
    private boolean langchain4jLogResponses;

    // Getter方法 - 提供对配置项的访问

    /**
     * 获取应用名称
     * @return 应用名称
     */
    public String getApplicationName() {
        return applicationName;
    }

    /**
     * 获取Redis主机地址
     * @return Redis主机地址
     */
    public String getRedisHost() {
        return redisHost;
    }

    /**
     * 获取Redis端口
     * @return Redis端口
     */
    public int getRedisPort() {
        return redisPort;
    }

    /**
     * 获取Redis数据库索引
     * @return Redis数据库索引
     */
    public int getRedisDatabase() {
        return redisDatabase;
    }

    /**
     * 获取Redis密码
     * @return Redis密码
     */
    public String getRedisPassword() {
        return redisPassword;
    }

    /**
     * 获取数据源URL
     * @return 数据源URL
     */
    public String getDatasourceUrl() {
        return datasourceUrl;
    }

    /**
     * 获取数据源驱动类名
     * @return 数据源驱动类名
     */
    public String getDatasourceDriverClassName() {
        return datasourceDriverClassName;
    }

    /**
     * 获取数据源用户名
     * @return 数据源用户名
     */
    public String getDatasourceUsername() {
        return datasourceUsername;
    }

    /**
     * 获取数据源密码
     * @return 数据源密码
     */
    public String getDatasourcePassword() {
        return datasourcePassword;
    }

    /**
     * 获取H2控制台是否启用
     * @return H2控制台是否启用
     */
    public boolean isH2ConsoleEnabled() {
        return h2ConsoleEnabled;
    }

    /**
     * 获取H2控制台路径
     * @return H2控制台路径
     */
    public String getH2ConsolePath() {
        return h2ConsolePath;
    }

    /**
     * 获取H2控制台是否允许其他Web访问
     * @return H2控制台是否允许其他Web访问
     */
    public boolean isH2ConsoleWebAllowOthers() {
        return h2ConsoleWebAllowOthers;
    }

    /**
     * 获取JPA Hibernate DDL自动模式
     * @return JPA Hibernate DDL自动模式
     */
    public String getJpaHibernateDdlAuto() {
        return jpaHibernateDdlAuto;
    }

    /**
     * 获取JPA是否显示SQL
     * @return JPA是否显示SQL
     */
    public boolean isJpaShowSql() {
        return jpaShowSql;
    }

    /**
     * 获取是否允许Bean定义覆盖
     * @return 是否允许Bean定义覆盖
     */
    public boolean isAllowBeanDefinitionOverriding() {
        return allowBeanDefinitionOverriding;
    }

    /**
     * 获取服务器端口
     * @return 服务器端口
     */
    public int getServerPort() {
        return serverPort;
    }

    /**
     * 获取根日志级别
     * @return 根日志级别
     */
    public String getLoggingLevelRoot() {
        return loggingLevelRoot;
    }

    /**
     * 获取日历图表包日志级别
     * @return 日历图表包日志级别
     */
    public String getLoggingLevelCalendarChart() {
        return loggingLevelCalendarChart;
    }

    /**
     * 获取Spring Web日志级别
     * @return Spring Web日志级别
     */
    public String getLoggingLevelSpringWeb() {
        return loggingLevelSpringWeb;
    }

    /**
     * 获取Hibernate日志级别
     * @return Hibernate日志级别
     */
    public String getLoggingLevelHibernate() {
        return loggingLevelHibernate;
    }

    /**
     * 获取MyBatis-Plus映射器位置
     * @return MyBatis-Plus映射器位置
     */
    public String getMybatisPlusMapperLocations() {
        return mybatisPlusMapperLocations;
    }

    /**
     * 获取MyBatis-Plus类型别名包
     * @return MyBatis-Plus类型别名包
     */
    public String getMybatisPlusTypeAliasesPackage() {
        return mybatisPlusTypeAliasesPackage;
    }

    /**
     * 获取MyBatis-Plus是否将下划线转换为驼峰命名
     * @return MyBatis-Plus是否将下划线转换为驼峰命名
     */
    public boolean isMybatisPlusMapUnderscoreToCamelCase() {
        return mybatisPlusMapUnderscoreToCamelCase;
    }

    /**
     * 获取MyBatis-Plus日志实现类
     * @return MyBatis-Plus日志实现类
     */
    public String getMybatisPlusLogImpl() {
        return mybatisPlusLogImpl;
    }

    /**
     * 获取LangChain4j API密钥
     * @return LangChain4j API密钥
     */
    public String getLangchain4jApiKey() {
        return langchain4jApiKey;
    }

    /**
     * 获取LangChain4j模型名称
     * @return LangChain4j模型名称
     */
    public String getLangchain4jModelName() {
        return langchain4jModelName;
    }

    /**
     * 获取LangChain4j基础URL
     * @return LangChain4j基础URL
     */
    public String getLangchain4jBaseUrl() {
        return langchain4jBaseUrl;
    }

    /**
     * 获取LangChain4j是否记录请求日志
     * @return LangChain4j是否记录请求日志
     */
    public boolean isLangchain4jLogRequests() {
        return langchain4jLogRequests;
    }

    /**
     * 获取LangChain4j是否记录响应日志
     * @return LangChain4j是否记录响应日志
     */
    public boolean isLangchain4jLogResponses() {
        return langchain4jLogResponses;
    }
}
