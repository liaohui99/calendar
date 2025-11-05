package com.calendar.chart.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 跨域配置类
 * @author CalendarChart
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Bean
    public CorsFilter corsFilter() {
        // 创建CORS配置
        CorsConfiguration config = new CorsConfiguration();
        
        // 明确允许各种源，特别是localhost和file协议
        config.addAllowedOrigin("*");
        config.addAllowedOriginPattern("*"); // 支持通配符
        
        // 允许的HTTP方法
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS"); // 预检请求
        config.addAllowedMethod("HEAD");
        config.addAllowedMethod("TRACE");
        config.addAllowedMethod("CONNECT");
        
        // 允许的请求头
        config.addAllowedHeader("*");
        
        // 暴露的响应头 - 添加更多常见的响应头
        config.addExposedHeader("*");
        config.addExposedHeader("Content-Type");
        config.addExposedHeader("X-Requested-With");
        config.addExposedHeader("Accept");
        config.addExposedHeader("Authorization");
        config.addExposedHeader("Access-Control-Allow-Origin");
        config.addExposedHeader("Access-Control-Allow-Methods");
        config.addExposedHeader("Access-Control-Allow-Headers");
        
        // 允许携带凭证
        config.setAllowCredentials(false); // 为了兼容通配符origin设置为false
        
        // 预检请求有效期（秒）
        config.setMaxAge(7200L); // 增加预检请求的有效期
        
        // 创建URL配置源
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 对所有路径应用CORS配置
        source.registerCorsConfiguration("/api/**", config);
        source.registerCorsConfiguration("/**", config); // 对所有路径都应用配置
        
        return new CorsFilter(source);
    }
    
    // 另外添加WebMvcConfigurer的CORS配置，作为双重保障
    @Override
    public void addCorsMappings(org.springframework.web.servlet.config.annotation.CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("*")
                .allowedHeaders("*")
                .exposedHeaders("*")
                .allowCredentials(false)
                .maxAge(7200);
    }
}