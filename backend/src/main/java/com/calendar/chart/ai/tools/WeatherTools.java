package com.calendar.chart.ai.tools;

import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.agent.tool.ToolSpecification;
import dev.langchain4j.agent.tool.ToolSpecifications;

import java.util.List;
import java.util.Random;

/**
 * @author Gabriel
 * @version 1.0
 * @date 2025/11/28 16:41
 * @description: TODO
 */
public class WeatherTools {

    List<ToolSpecification> toolSpecifications = ToolSpecifications.toolSpecificationsFrom(WeatherTools.class);

    @Tool("返回给定城市的天气预报(华摄氏度)。返回值：字符串，包含城市名称、天气状况和温度信息")
    public String getWeather(@P("应返回天气预报的城市") String city
    ) {
        Integer temperature = new Random(20).nextInt();
        Random rundomDif = new Random(10);
        Integer temperatureDif = rundomDif.nextInt();
        //10-20度随机数
        return city + "天气预报：今天是晴天，最高气温为" + temperature + "度，最低气温为" + temperatureDif + "度";
    }


}
