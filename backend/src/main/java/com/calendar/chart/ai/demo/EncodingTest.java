package com.calendar.chart.ai.demo;

/**
 * UTF-8编码测试类
 * 用于验证Java程序是否正确使用UTF-8编码运行
 */
public class EncodingTest {
    
    /**
     * 主方法，输出编码信息和中文字符测试
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        // 输出系统编码信息
        System.out.println("=========== 编码配置验证 ===========");
        System.out.println("系统文件编码: " + System.getProperty("file.encoding"));
        System.out.println("控制台编码: " + System.getProperty("console.encoding"));
        System.out.println("默认字符集: " + java.nio.charset.Charset.defaultCharset().name());
        
        // 测试中文字符输出
        System.out.println("\n=========== 字符输出测试 ===========");
        System.out.println("中文字符测试: 你好，世界！");
        System.out.println("特殊字符测试: こんにちは 世界！Привет мир! 😀");
        
        // 验证字符串长度和字节表示
        String chinese = "你好世界"; 
        System.out.println("\n=========== 字符串编码信息 ===========");
        System.out.println("字符串: " + chinese);
        System.out.println("字符长度: " + chinese.length());
        try {
            byte[] utf8Bytes = chinese.getBytes("UTF-8");
            System.out.println("UTF-8字节数: " + utf8Bytes.length);
            System.out.println("UTF-8字节表示: " + bytesToHex(utf8Bytes));
            
            // 验证解码是否正确
            String decoded = new String(utf8Bytes, "UTF-8");
            System.out.println("解码后: " + decoded);
            System.out.println("解码正确: " + chinese.equals(decoded));
        } catch (Exception e) {
            System.err.println("编码测试出错: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("\n=========== 配置验证完成 ===========");
    }
    
    /**
     * 将字节数组转换为十六进制字符串表示
     * @param bytes 字节数组
     * @return 十六进制字符串
     */
    private static String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02X ", b));
        }
        return result.toString().trim();
    }
}
