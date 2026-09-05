package com.deaofu.model.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** 产品分类新增或修改入参。 */
@Data
public class ProductCategorySaveDto {

    /** 内容语言：0表示中文，1表示英语。 */
    @NotNull(message = "语言标识不能为空")
    @Min(value = 0, message = "语言标识只能为0或1")
    @Max(value = 1, message = "语言标识只能为0或1")
    private Integer language;

    /** 产品分类名称。 */
    @NotBlank(message = "产品分类名称不能为空")
    @Size(max = 128, message = "产品分类名称不能超过128个字符")
    private String categoryName;

    /** 排序值，越大越靠前。 */
    @Min(value = 0, message = "排序值不能小于0")
    @Max(value = 999999, message = "排序值不能超过999999")
    private Integer sortOrder = 0;

    /** 父级分类ID，空值表示一级分类。 */
    private String parentId;
}
