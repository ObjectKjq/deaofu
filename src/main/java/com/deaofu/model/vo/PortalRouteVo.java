package com.deaofu.model.vo;

import lombok.Data;

/** 官网首页世界地图运输路线出参，坐标来自 {@link com.deaofu.enums.CountryEnum}。 */
@Data
public class PortalRouteVo {

    /** 运输线路ID。 */
    private String routeId;

    /** 始发国家中文名，例如“中国”。 */
    private String sourceName;

    /** 始发国在地图 viewBox 0 0 1200 460 中的 X 坐标（像素）。 */
    private Integer sourceX;

    /** 始发国在地图 viewBox 0 0 1200 460 中的 Y 坐标（像素）。 */
    private Integer sourceY;

    /** 目标国家中文名，例如“德国”。 */
    private String targetName;

    /** 目标国在地图 viewBox 0 0 1200 460 中的 X 坐标（像素）。 */
    private Integer targetX;

    /** 目标国在地图 viewBox 0 0 1200 460 中的 Y 坐标（像素）。 */
    private Integer targetY;

    /** 服务端预计算的 SVG 二次贝塞尔曲线路径，形如 {@code M963 170 Q820 70 565 127}。 */
    private String pathD;
}
