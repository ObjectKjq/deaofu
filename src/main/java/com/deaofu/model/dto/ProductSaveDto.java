package com.deaofu.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/** 产品新增或修改入参。 */
@Data
public class ProductSaveDto {

    /** 产品二级分类ID。 */
    @NotBlank(message = "产品二级分类不能为空")
    private String categoryId;

    /** 封面图在文件表中的访问文件名。 */
    @NotBlank(message = "产品封面不能为空")
    private String coverAccessName;

    /** 详情图片访问文件名列表，至少一张。 */
    @NotEmpty(message = "产品详情图片不能为空")
    private List<@NotBlank(message = "详情图片访问文件名不能为空") String> detailImages;

    /** 产品标题。 */
    @NotBlank(message = "产品标题不能为空")
    @Size(max = 255, message = "产品标题不能超过255个字符")
    private String title;

    /** 产品简介。 */
    @Size(max = 1000, message = "产品简介不能超过1000个字符")
    private String summary;

    /** 产品参数列表。 */
    @Valid
    @NotEmpty(message = "产品参数不能为空")
    private List<ProductParameterDto> parameters;
}
