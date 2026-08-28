package com.deaofu.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** 管理端用户修改密码入参。 */
@Data
public class SysUserPasswordDto {

    /** 原登录密码，用于确认当前操作者掌握原密码。 */
    @NotBlank(message = "原始密码不能为空")
    @Size(max = 100, message = "原始密码长度不能超过100个字符")
    private String oldPassword;

    /** 新登录密码，长度不超过100个字符。 */
    @NotBlank(message = "新密码不能为空")
    @Size(max = 100, message = "新密码长度不能超过100个字符")
    private String newPassword;

    /** 确认新登录密码，必须与新密码一致。 */
    @NotBlank(message = "确认密码不能为空")
    @Size(max = 100, message = "确认密码长度不能超过100个字符")
    private String confirmPassword;
}
