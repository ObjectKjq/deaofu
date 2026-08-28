package com.deaofu.controller.admin;

import com.deaofu.common.BaseResponse;
import com.deaofu.common.PageResult;
import com.deaofu.common.ResultUtils;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.SysUserPasswordDto;
import com.deaofu.model.dto.SysUserSaveDto;
import com.deaofu.model.vo.SysUserVo;
import com.deaofu.service.ISysUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 管理端用户管理接口。 */
@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class SysUserController {

    private final ISysUserService userService;

    /** GET /admin/users/page：分页查询用户，支持用户名或显示名称模糊搜索。 @param dto 查询条件 @return 用户分页数据 */
    @GetMapping("/page")
    public BaseResponse<PageResult<SysUserVo>> page(@Valid AdminPageDto dto) {
        return ResultUtils.success(userService.pageUsers(dto));
    }

    /** GET /admin/users/{userId}：查询用户详情。 @param userId 用户ID @return 用户详情；用户不存在时返回业务错误 */
    @GetMapping("/{userId}")
    public BaseResponse<SysUserVo> detail(@PathVariable String userId) {
        return ResultUtils.success(userService.getUser(userId));
    }

    /** POST /admin/users：新增用户并使用 BCrypt 保存密码。 @param dto 用户入参 @return 脱敏用户详情；用户名重复时返回参数错误 */
    @PostMapping
    public BaseResponse<SysUserVo> add(@Valid @RequestBody SysUserSaveDto dto) {
        return ResultUtils.success(userService.addUser(dto));
    }

    /** PUT /admin/users/{userId}：修改用户信息，可选修改密码。 @param userId 用户ID @param dto 用户入参 @return 脱敏用户详情 */
    @PutMapping("/{userId}")
    public BaseResponse<SysUserVo> update(@PathVariable String userId,
                                           @Valid @RequestBody SysUserSaveDto dto) {
        return ResultUtils.success(userService.updateUser(userId, dto));
    }

    /**
     * 修改指定用户密码，必须提供原密码、新密码和确认密码。
     *
     * @param userId 用户ID
     * @param dto 修改密码入参
     * @return 是否修改成功
     */
    @PutMapping("/{userId}/password")
    public BaseResponse<Boolean> updatePassword(
            @PathVariable String userId,
            @Valid @RequestBody SysUserPasswordDto dto) {
        return ResultUtils.success(userService.updatePassword(userId, dto));
    }

    /** DELETE /admin/users/{userId}：删除管理端用户。 @param userId 用户ID @return 是否删除成功 */
    @DeleteMapping("/{userId}")
    public BaseResponse<Boolean> delete(@PathVariable String userId) {
        return ResultUtils.success(userService.deleteUser(userId));
    }
}
