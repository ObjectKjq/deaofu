package com.deaofu.service;

import com.deaofu.model.dto.LoginDto;
import com.deaofu.model.vo.UserSessionVo;

/**
 * 管理端用户服务接口，负责登录、退出与当前用户信息查询。
 *
 * @author deaofu
 */
public interface ISysUserService {

    /**
     * 用户登录校验：核对用户名、密码哈希及启用状态，并将脱敏用户信息写入 Session。
     *
     * @param dto 登录入参
     * @return 登录成功后的脱敏 session 用户信息
     * @throws com.deaofu.exception.BusinessException 用户名/密码错误或账号被禁用
     */
    UserSessionVo login(LoginDto dto);
}
