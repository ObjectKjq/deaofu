package com.deaofu.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.deaofu.common.BaseDo;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/** 公司动态实体，对应 {@code company_news} 表。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("company_news")
public class CompanyNews extends BaseDo implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 动态主键ID，UUID，对应 {@code news_id}。 */
    @TableId(value = "news_id", type = IdType.ASSIGN_UUID)
    private String newsId;

    /** 内容语言：0表示中文，1表示英语，对应 {@code language}。 */
    private Integer language;

    /** 封面图在 {@code sys_file.access_name} 中的访问文件名。 */
    private String coverAccessName;

    /** 动态标题，对应 {@code title}。 */
    private String title;

    /** 动态简介，对应 {@code summary}。 */
    private String summary;

    /** 动态正文HTML，可包含Base64图片，对应 {@code content}。 */
    private String content;

    /** 项目地区，对应 {@code project_region}。 */
    private String projectRegion;

    /** 咨询邮箱，对应 {@code contact_email}。 */
    private String contactEmail;

    /** 官网首页展示顺序，0表示不展示，1-3表示展示顺序。 */
    private Integer homeShowOrder;
}
