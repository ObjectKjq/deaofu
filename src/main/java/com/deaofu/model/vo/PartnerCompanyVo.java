package com.deaofu.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

import static cn.hutool.core.date.DatePattern.NORM_DATETIME_PATTERN;

/** 合作企业出参。 */
@Data
public class PartnerCompanyVo {
    /** 合作企业ID。 */
    private String partnerId;
    /** 企业Logo访问文件名。 */
    private String logoAccessName;
    /** 企业Logo预览地址。 */
    private String logoUrl;
    /** 企业名称。 */
    private String companyName;
    /** 创建时间，格式 {@code yyyy-MM-dd HH:mm:ss}。 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    private Date createTime;
    /** 更新时间，格式 {@code yyyy-MM-dd HH:mm:ss}。 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    private Date updateTime;
}
