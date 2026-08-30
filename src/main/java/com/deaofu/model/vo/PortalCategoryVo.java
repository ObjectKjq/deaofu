package com.deaofu.model.vo;

import lombok.Data;

import java.util.List;

/** 官网产品分类树出参，一级分类携带二级子分类，按 sortOrder 升序排列。 */
@Data
public class PortalCategoryVo {

    /** 产品分类ID。 */
    private String categoryId;

    /** 产品分类名称。 */
    private String categoryName;

    /** 排序值，越小越靠前。 */
    private Integer sortOrder;

    /** 父级分类ID，一级分类为空。 */
    private String parentId;

    /** 该分类（含二级分类）下的产品数量，用于筛选栏计数展示。 */
    private Long productCount;

    /** 二级子分类列表，仅一级分类返回。 */
    private List<PortalCategoryVo> children;
}
