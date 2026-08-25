package com.deaofu.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** 产品参数项入参。 */
@Data
public class ProductParameterDto {

    /** 参数名称，例如“厚度范围”。 */
    @NotBlank(message = "参数名称不能为空")
    @Size(max = 128, message = "参数名称不能超过128个字符")
    private String label;

    /** 参数值，例如“4.76 - 12 mm”。 */
    @NotBlank(message = "参数值不能为空")
    @Size(max = 255, message = "参数值不能超过255个字符")
    private String value;
}
