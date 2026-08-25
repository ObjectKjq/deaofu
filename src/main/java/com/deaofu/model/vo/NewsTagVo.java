package com.deaofu.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

import static cn.hutool.core.date.DatePattern.NORM_DATETIME_PATTERN;

/** 动态标签出参，不直接返回图标二进制。 */
@Data
public class NewsTagVo {
    /** 动态标签ID。 */
    private String tagId;
    /** 动态标签名称。 */
    private String tagName;
    /** 标签图标预览地址，无图标时为空。 */
    private String iconUrl;
    /** 创建时间，格式 {@code yyyy-MM-dd HH:mm:ss}。 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    private Date createTime;
}
