package com.deaofu.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 管理端登录入参。
 *
 * @author deaofu
 */
@Data
public class LoginDto {

    /** 登录用户名 */
    @NotBlank(message = "用户名不能为空")
    @Size(max = 64, message = "用户名长度不能超过64个字符")
    private String username;

    /** 登录密码（明文传输，服务端使用 BCrypt 校验） */
    @NotBlank(message = "密码不能为空")
    @Size(max = 100, message = "密码长度不能超过100个字符")
    private String password;
}
