package com.deaofu.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;
import java.util.List;

import static cn.hutool.core.date.DatePattern.NORM_DATETIME_PATTERN;

/** 公司动态出参。 */
@Data
public class CompanyNewsVo {

    /** 内容语言：0表示中文，1表示英语。 */
    private Integer language;
    /** 动态ID。 */
    private String newsId;
    /** 封面图访问文件名。 */
    private String coverAccessName;
    /** 封面图预览地址。 */
    private String coverUrl;
    /** 动态标题。 */
    private String title;
    /** 动态简介。 */
    private String summary;
    /** 动态正文HTML。 */
    private String content;
    /** 项目地区。 */
    private String projectRegion;
    /** 咨询邮箱。 */
    private String contactEmail;
    /** 关联的动态标签列表。 */
    private List<NewsTagVo> tags;
    /** 官网首页展示顺序，0表示不展示，1-3表示展示顺序。 */
    private Integer homeShowOrder;
    /** 创建人用户名（数据库存 userId，接口层已转换为用户名）。 */
    private String createBy;
    /** 创建时间，格式 {@code yyyy-MM-dd HH:mm:ss}。 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    private Date createTime;
    /** 更新时间，格式 {@code yyyy-MM-dd HH:mm:ss}。 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    private Date updateTime;
}
