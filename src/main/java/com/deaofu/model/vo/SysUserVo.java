package com.deaofu.model.vo;

import com.deaofu.enums.StatusEnum;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

import static cn.hutool.core.date.DatePattern.NORM_DATETIME_PATTERN;

/** 管理端用户脱敏出参，不包含密码哈希。 */
@Data
public class SysUserVo {

    /** 用户主键ID。 */
    private String userId;

    /** 登录用户名。 */
    private String username;

    /** 显示名称（昵称）。 */
    private String displayName;

    /** 状态编码，取值见 {@link StatusEnum}。 */
    private String status;

    /** 状态中文描述。 */
    private String statusText;

    /** 创建者用户ID。 */
    private String createBy;

    /** 创建时间，格式 {@code yyyy-MM-dd HH:mm:ss}。 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    private Date createTime;

    /** 更新时间，格式 {@code yyyy-MM-dd HH:mm:ss}。 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    private Date updateTime;
}
