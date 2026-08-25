package com.deaofu.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.deaofu.common.BaseDo;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/** 产品分类实体，对应 {@code product_category} 表。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("product_category")
public class ProductCategory extends BaseDo implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 产品分类主键ID，UUID，对应 {@code category_id}。 */
    @TableId(value = "category_id", type = IdType.ASSIGN_UUID)
    private String categoryId;

    /** 产品分类名称，对应 {@code category_name}。 */
    private String categoryName;

    /** 排序值，数值越大越靠前，对应 {@code sort_order}。 */
    private Integer sortOrder;

    /** 父级分类ID，空值表示一级分类，对应 {@code parent_id}。 */
    private String parentId;
}
