package com.deaofu.model.vo;

import com.deaofu.enums.ViewStatusEnum;
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
    /** 查看状态编码，取值见 {@link ViewStatusEnum}：{@code 0}未查看、{@code 1}已查看。 */
    private String viewStatus;
    /** 查看状态中文描述，取值见 {@link ViewStatusEnum#getInfo()}。 */
    private String viewStatusText;
    /** 创建时间，格式 {@code yyyy-MM-dd HH:mm:ss}。 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    private Date createTime;
    /** 更新时间，格式 {@code yyyy-MM-dd HH:mm:ss}。 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    private Date updateTime;
}
