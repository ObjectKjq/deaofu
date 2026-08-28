package com.deaofu.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;
import java.util.List;

import static cn.hutool.core.date.DatePattern.NORM_DATETIME_PATTERN;

/** 产品出参。 */
@Data
public class ProductVo {
    /** 产品ID。 */
    private String productId;
    /** 产品二级分类ID。 */
    private String categoryId;
    /** 产品二级分类名称。 */
    private String categoryName;
    /** 产品一级分类名称。 */
    private String parentCategoryName;
    /** 封面图访问文件名。 */
    private String coverAccessName;
    /** 封面图预览地址。 */
    private String coverUrl;
    /** 详情图片访问文件名列表。 */
    private List<String> detailImages;
    /** 产品标题。 */
    private String title;
    /** 产品简介。 */
    private String summary;
    /** 产品参数列表。 */
    private List<ProductParameterVo> parameters;
    /** 创建人用户名（数据库存 userId，接口层已转换为用户名）。 */
    private String createBy;
    /** 创建时间，格式 {@code yyyy-MM-dd HH:mm:ss}。 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    private Date createTime;
    /** 更新时间，格式 {@code yyyy-MM-dd HH:mm:ss}。 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    private Date updateTime;
}
