package com.deaofu.common;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

import static cn.hutool.core.date.DatePattern.NORM_DATETIME_PATTERN;

/**
 * 完整审计字段基类：{@code createBy / createTime / updateBy / updateTime / delFlag}。
 *
 * <p>{@code delFlag} 对应 {@link com.deaofu.enums.DelFlagEnum}，由
 * MyBatis-Plus 通过 {@code @TableLogic} 自动追加 {@code WHERE del_flag='0'}。
 *
 * @author deaofu
 */
@Data
public class BaseDo {

    /** 删除标志（0代表存在 1代表删除） */
    @TableLogic
    private String delFlag;

    /** 创建者 */
    @TableField(fill = FieldFill.INSERT)
    private String createBy;

    /** 创建时间 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;

    /** 更新者 */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private String updateBy;

    /** 更新时间 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;
}