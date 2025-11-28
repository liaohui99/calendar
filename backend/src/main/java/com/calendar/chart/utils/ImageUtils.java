package com.calendar.chart.utils;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Base64;

public class ImageUtils {

    /**
     * 将图片URL转换为Base64编码
     * 
     * @param imageUrl 图片URL
     * @return Base64编码后的字符串
     */
    public static String convertUrlImageToBase64(String imageUrl) {
        try {
            URL url = new URL(imageUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            InputStream inputStream = connection.getInputStream();
            byte[] bytes = inputStream.readAllBytes();
            return Base64.getEncoder().encodeToString(bytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert image to base64", e);
        }
    }

    /**
     * 将本地图片文件转换为Base64编码
     * 
     * @param imageFilePath 图片本地路径（支持绝对路径和相对路径）
     * @return Base64编码后的字符串
     */
    public static String convertFileImageToBase64(String imageFilePath) {
        java.io.File file = new java.io.File(imageFilePath);
        // 校验图片文件是否存在
        if (!file.exists() || !file.isFile()) {
            throw new RuntimeException("Image file not found: " + imageFilePath);
        }
        try {
            // 使用FileInputStream读取本地文件
            java.io.FileInputStream inputStream = new java.io.FileInputStream(file);
            byte[] bytes = inputStream.readAllBytes();
            inputStream.close();
            return Base64.getEncoder().encodeToString(bytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert image to base64", e);
        }
    }

}
