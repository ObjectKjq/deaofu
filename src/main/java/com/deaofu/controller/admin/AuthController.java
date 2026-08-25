package com.deaofu.controller.admin;

import cn.hutool.core.util.IdUtil;
import cn.hutool.crypto.digest.BCrypt;
import com.deaofu.common.BaseResponse;
import com.deaofu.common.ResultUtils;
import com.deaofu.model.dto.LoginDto;
import com.deaofu.model.vo.UserSessionVo;
import com.deaofu.service.ISysUserService;
import com.deaofu.utils.SessionUserUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 管理端登录、退出与当前用户查询接口。
 *
 * @author deaofu
 */
@RestController
@RequestMapping("/admin/auth")
@RequiredArgsConstructor
public class AuthController {

    private final ISysUserService userService;

    /**
     * 管理端账号登录。
     * <p>校验用户名/密码并将脱敏后的用户信息写入 HTTP Session。
     *
     * @param dto 登录入参（用户名 + 密码）
     * @return 登录成功后的 session 用户信息
     */
    @PostMapping("/login")
    public BaseResponse<UserSessionVo> login(@Valid @RequestBody LoginDto dto) {
        return ResultUtils.success(userService.login(dto));
    }

    /**
     * 退出登录：销毁 HTTP Session。
     *
     * @return 始终返回 true
     */
    @PostMapping("/logout")
    public BaseResponse<Boolean> logout() {
        SessionUserUtils.logout();
        return ResultUtils.success(true);
    }

    /**
     * 获取当前登录用户信息。
     * <p>未登录时返回 {@code null}（由前端按需跳转登录页）。
     *
     * @return 当前 session 中的脱敏用户信息
     */
    @GetMapping("/me")
    public BaseResponse<UserSessionVo> currentUser() {
        return ResultUtils.success(SessionUserUtils.getCurrentUser());
    }

}
