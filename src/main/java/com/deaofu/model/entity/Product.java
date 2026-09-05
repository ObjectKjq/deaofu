package com.deaofu.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.deaofu.common.BaseDo;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/** 产品实体，对应 {@code product} 表。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("product")
public class Product extends BaseDo implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 产品主键ID，UUID，对应 {@code product_id}。 */
    @TableId(value = "product_id", type = IdType.ASSIGN_UUID)
    private String productId;

    /** 内容语言：0表示中文，1表示英语，对应 {@code language}。 */
    private Integer language;

    /** 产品二级分类ID，对应 {@code category_id}。 */
    private String categoryId;

    /** 封面图在 {@code sys_file.access_name} 中的访问文件名。 */
    private String coverAccessName;

    /** 详情图片访问文件名JSON数组，对应 {@code detail_images}。 */
    private String detailImages;

    /** 产品标题，对应 {@code title}。 */
    private String title;

    /** 产品简介，对应 {@code summary}。 */
    private String summary;

    /** 参数信息JSON数组，对应 {@code specs}。 */
    private String specs;

    /** 官网首页展示顺序，0表示不展示，1-5表示展示顺序。 */
    private Integer homeShowOrder;
}
