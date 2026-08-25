package com.deaofu.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** 动态标签新增或修改入参。 */
@Data
public class NewsTagSaveDto {

    /** 动态标签名称。 */
    @NotBlank(message = "动态标签名称不能为空")
    @Size(max = 128, message = "动态标签名称不能超过128个字符")
    private String tagName;

    /** 图标Data URL或纯Base64字符串；修改时留空表示保留原图标。 */
    private String iconBase64;

    /** 图标MIME类型；纯Base64模式下使用。 */
    @Size(max = 128, message = "图标MIME类型不能超过128个字符")
    private String iconContentType;
}
