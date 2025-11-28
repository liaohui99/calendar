package com.calendar.chart.utils;

import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CharsetDecoder;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;

public class ByteToUTF8Converter {
     // 方法1：使用String构造函数（最简单）
    public static String bytesToUtf8(byte[] bytes) {
        if (bytes == null) {
            throw new IllegalArgumentException("字节数组不能为null");
        }
        return new String(bytes, StandardCharsets.UTF_8);
    }
    
    // 方法2：使用CharsetDecoder（更灵活，可处理错误）
    public static String bytesToUtf8WithDecoder(byte[] bytes) {
        if (bytes == null) {
            throw new IllegalArgumentException("字节数组不能为null");
        }
        
        CharsetDecoder decoder = StandardCharsets.UTF_8.newDecoder();
        // 设置遇到无效字节时的处理方式
        decoder.onMalformedInput(CodingErrorAction.REPORT);
        decoder.onUnmappableCharacter(CodingErrorAction.REPORT);
        
        try {
            CharBuffer charBuffer = decoder.decode(ByteBuffer.wrap(bytes));
            return charBuffer.toString();
        } catch (CharacterCodingException e) {
            throw new RuntimeException("字节数组包含无效的UTF-8序列", e);
        }
    }
    
    // 方法3：处理可能包含BOM（字节顺序标记）的UTF-8字节
    public static String bytesToUtf8RemoveBom(byte[] bytes) {
        if (bytes == null || bytes.length == 0) {
            return "";
        }
        
        // 检查并移除UTF-8 BOM (0xEF, 0xBB, 0xBF)
        if (bytes.length >= 3 && 
            (bytes[0] & 0xFF) == 0xEF && 
            (bytes[1] & 0xFF) == 0xBB && 
            (bytes[2] & 0xFF) == 0xBF) {
            // 有BOM，移除前3个字节
            byte[] withoutBom = new byte[bytes.length - 3];
            System.arraycopy(bytes, 3, withoutBom, 0, withoutBom.length);
            return new String(withoutBom, StandardCharsets.UTF_8);
        } else {
            // 无BOM，直接转换
            return new String(bytes, StandardCharsets.UTF_8);
        }
    }
    
    // 方法4：安全转换，处理无效字节
    public static String safeBytesToUtf8(byte[] bytes) {
        if (bytes == null) {
            return "";
        }
        
        CharsetDecoder decoder = StandardCharsets.UTF_8.newDecoder();
        // 遇到无效字节时替换为问号
        decoder.onMalformedInput(CodingErrorAction.REPLACE);
        decoder.onUnmappableCharacter(CodingErrorAction.REPLACE);
        
        try {
            ByteBuffer byteBuffer = ByteBuffer.wrap(bytes);
            CharBuffer charBuffer = decoder.decode(byteBuffer);
            return charBuffer.toString();
        } catch (CharacterCodingException e) {
            // 如果解码失败，使用ISO-8859-1作为后备方案
            return new String(bytes, StandardCharsets.ISO_8859_1);
        }
    }
}
