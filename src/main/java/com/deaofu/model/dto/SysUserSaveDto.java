package com.deaofu.model.dto;

import com.deaofu.enums.StatusEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** 管理端用户新增或修改入参。 */
@Data
public class SysUserSaveDto {

    /** 登录用户名，长度不超过64个字符。 */
    @NotBlank(message = "登录用户名不能为空")
    @Size(max = 64, message = "登录用户名不能超过64个字符")
    private String username;

    /** 登录明文密码，仅新增用户时提交，新增必填由服务层校验。 */
    @Size(max = 100, message = "密码不能超过100个字符")
    private String password;

    /** 显示名称（昵称），长度不超过128个字符。 */
    @Size(max = 128, message = "显示名称不能超过128个字符")
    private String displayName;

    /** 启用/禁用状态，取值见 {@link StatusEnum}。 */
    @NotBlank(message = "用户状态不能为空")
    private String status;
}
