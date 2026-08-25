package com.deaofu.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** 合作企业新增或修改入参。 */
@Data
public class PartnerCompanySaveDto {

    /** 企业Logo在文件表中的访问文件名。 */
    @NotBlank(message = "企业Logo不能为空")
    private String logoAccessName;

    /** 企业名称。 */
    @NotBlank(message = "企业名称不能为空")
    @Size(max = 255, message = "企业名称不能超过255个字符")
    private String companyName;
}
