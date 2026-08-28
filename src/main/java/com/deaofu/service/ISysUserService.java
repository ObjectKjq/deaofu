package com.deaofu.service;

import com.deaofu.common.PageResult;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.LoginDto;
import com.deaofu.model.dto.SysUserPasswordDto;
import com.deaofu.model.dto.SysUserSaveDto;
import com.deaofu.model.vo.SysUserVo;
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

    /** 分页查询管理端用户。 @param dto 查询条件 @return 用户分页结果 */
    PageResult<SysUserVo> pageUsers(AdminPageDto dto);

    /** 查询用户详情。 @param userId 用户ID @return 用户详情 @throws com.deaofu.exception.BusinessException 用户不存在 */
    SysUserVo getUser(String userId);

    /** 新增用户。 @param dto 用户入参 @return 新增后的用户详情 @throws com.deaofu.exception.BusinessException 用户名已存在 */
    SysUserVo addUser(SysUserSaveDto dto);

    /** 修改用户。 @param userId 用户ID @param dto 用户入参 @return 修改后的用户详情 @throws com.deaofu.exception.BusinessException 用户不存在或用户名已存在 */
    SysUserVo updateUser(String userId, SysUserSaveDto dto);

    /** 修改用户密码。 @param userId 用户ID @param dto 原密码、新密码和确认密码 @return 是否修改成功 @throws com.deaofu.exception.BusinessException 用户不存在、原密码错误或两次新密码不一致 */
    boolean updatePassword(String userId, SysUserPasswordDto dto);

    /** 逻辑删除用户。 @param userId 用户ID @return 是否删除成功 @throws com.deaofu.exception.BusinessException 用户不存在 */
    boolean deleteUser(String userId);
}
