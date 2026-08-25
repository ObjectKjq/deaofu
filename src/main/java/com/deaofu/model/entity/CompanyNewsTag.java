package com.deaofu.model.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

import static cn.hutool.core.date.DatePattern.NORM_DATETIME_PATTERN;

/** 动态与标签关联实体，对应 {@code company_news_tag} 表。 */
@Data
@TableName("company_news_tag")
public class CompanyNewsTag implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 动态ID，与 {@link CompanyNews#getNewsId()} 对应。 */
    private String newsId;

    /** 动态标签ID，与 {@link NewsTag#getTagId()} 对应。 */
    private String tagId;

    /** 创建者，对应 {@code create_by}。 */
    @TableField(fill = FieldFill.INSERT)
    private String createBy;

    /** 创建时间，格式 {@code yyyy-MM-dd HH:mm:ss}。 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;
}
