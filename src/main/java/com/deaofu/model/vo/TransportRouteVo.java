package com.deaofu.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

import static cn.hutool.core.date.DatePattern.NORM_DATETIME_PATTERN;

/** 运输线路出参。 */
@Data
public class TransportRouteVo {
    /** 运输线路ID。 */
    private String routeId;
    /** 运输源地址。 */
    private String sourceAddress;
    /** 运输目标地址。 */
    private String targetAddress;
    /** 创建时间，格式 {@code yyyy-MM-dd HH:mm:ss}。 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    private Date createTime;
    /** 更新时间，格式 {@code yyyy-MM-dd HH:mm:ss}。 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    private Date updateTime;
}
