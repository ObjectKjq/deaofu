package com.deaofu.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** 运输线路新增或修改入参。 */
@Data
public class TransportRouteSaveDto {

    /** 运输源地址。 */
    @NotBlank(message = "源地址不能为空")
    @Size(max = 255, message = "源地址不能超过255个字符")
    private String sourceAddress;

    /** 运输目标地址。 */
    @NotBlank(message = "目标地址不能为空")
    @Size(max = 255, message = "目标地址不能超过255个字符")
    private String targetAddress;
}
