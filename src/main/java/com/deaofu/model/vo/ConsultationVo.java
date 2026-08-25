package com.deaofu.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;
import java.util.List;

import static cn.hutool.core.date.DatePattern.NORM_DATETIME_PATTERN;

/** 咨询信息出参。 */
@Data
public class ConsultationVo {
    /** 咨询信息ID。 */
    private String consultationId;
    /** 咨询主题列表。 */
    private List<String> subjects;
    /** 咨询内容。 */
    private String content;
    /** 联系人姓名。 */
    private String contactName;
    /** 联系电话。 */
    private String phone;
    /** 联系邮箱。 */
    private String email;
    /** 创建时间，格式 {@code yyyy-MM-dd HH:mm:ss}。 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    private Date createTime;
    /** 更新时间，格式 {@code yyyy-MM-dd HH:mm:ss}。 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    private Date updateTime;
}
