package com.deaofu.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;
import java.util.List;

import static cn.hutool.core.date.DatePattern.NORM_DATETIME_PATTERN;

/** 产品分类出参。 */
@Data
public class ProductCategoryVo {
    /** 产品分类ID。 */
    private String categoryId;
    /** 产品分类名称。 */
    private String categoryName;
    /** 排序值，越大越靠前。 */
    private Integer sortOrder;
    /** 父级分类ID，空值表示一级分类。 */
    private String parentId;
    /** 父级分类名称，一级分类为空。 */
    private String parentName;
    /** 分类层级，1表示一级、2表示二级。 */
    private Integer level;
    /** 创建时间，格式 {@code yyyy-MM-dd HH:mm:ss}。 */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    private Date createTime;
    /** 二级子分类列表，仅一级分类分页查询时返回。 */
    private List<ProductCategoryVo> children;
}
