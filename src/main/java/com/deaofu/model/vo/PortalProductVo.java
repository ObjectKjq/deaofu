package com.deaofu.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;
import java.util.List;

import static cn.hutool.core.date.DatePattern.NORM_DATETIME_PATTERN;

/** 官网产品出参，图片走公开文件预览接口 {@code /files/{accessName}}。 */
@Data
public class PortalProductVo {

    /** 产品ID，用于详情页路由 {@code /products/{productId}}。 */
    private String productId;

    /** 产品二级分类ID。 */
    private String categoryId;

    /** 产品二级分类名称。 */
    private String categoryName;

    /** 产品一级分类名称。 */
    private String parentCategoryName;

    /** 封面图公开访问地址，形如 {@code /files/{accessName}}。 */
    private String coverUrl;

    /** 详情图公开访问地址列表。 */
    private List<String> detailImageUrls;

    /** 产品标题。 */
    private String title;

    /** 产品简介。 */
    private String summary;

    /** 产品参数列表（label/value）。 */
    private List<ProductParameterVo> parameters;

    /** 创建时间，格式 {@code yyyy-MM-dd HH:mm:ss}。 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    private Date createTime;
}
