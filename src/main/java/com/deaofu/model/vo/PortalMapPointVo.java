package com.deaofu.model.vo;

import lombok.Data;

/** 官网首页世界地图国家点位出参。 */
@Data
public class PortalMapPointVo {

    /** 点位展示名，例如“中国 · 周口工厂”或“服务国家: 德国”。 */
    private String name;

    /** 地图 viewBox 0 0 1200 460 中的 X 坐标（像素）。 */
    private Integer x;

    /** 地图 viewBox 0 0 1200 460 中的 Y 坐标（像素）。 */
    private Integer y;

    /** 名称标签 X 坐标（在点位坐标基础上偏移）。 */
    private Integer labelX;

    /** 名称标签 Y 坐标（在点位坐标基础上偏移）。 */
    private Integer labelY;
}
