package com.deaofu.service.impl;

import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.digest.BCrypt;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.deaofu.common.ErrorCode;
import com.deaofu.common.PageResult;
import com.deaofu.enums.StatusEnum;
import com.deaofu.exception.BusinessException;
import com.deaofu.mapper.SysUserMapper;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.LoginDto;
import com.deaofu.model.dto.SysUserPasswordDto;
import com.deaofu.model.dto.SysUserSaveDto;
import com.deaofu.model.entity.SysUser;
import com.deaofu.model.vo.SysUserVo;
import com.deaofu.model.vo.UserSessionVo;
import com.deaofu.service.ISysUserService;
import com.deaofu.utils.SessionUserUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 管理端用户服务实现。
 *
 * @author deaofu
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SysUserServiceImpl extends ServiceImpl<SysUserMapper, SysUser> implements ISysUserService {

    private final SysUserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public UserSessionVo login(LoginDto dto) {
        // 1. 按用户名查询（逻辑删除由 MyBatis-Plus 自动过滤）
        SysUser user = userMapper.selectOne(Wrappers.<SysUser>lambdaQuery()
                .eq(SysUser::getUsername, dto.getUsername()).last("LIMIT 1"));
        // 2. 校验账号存在、状态启用、密码哈希非空，并使用 BCrypt 校验明文密码
        if (user == null
                || !StatusEnum.isEnabled(user.getStatus())
                || StrUtil.isBlank(user.getPasswordHash())
                || !BCrypt.checkpw(dto.getPassword(), user.getPasswordHash())) {
            log.warn("管理端登录失败：username={}", dto.getUsername());
            throw new BusinessException(ErrorCode.LOGIN_ERROR);
        }
        // 3. 写入脱敏 session 用户信息
        UserSessionVo result = new UserSessionVo();
        result.setUserId(user.getUserId());
        result.setUsername(user.getUsername());
        result.setDisplayName(user.getDisplayName());
        SessionUserUtils.setCurrentUser(result);
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<SysUserVo> pageUsers(AdminPageDto dto) {
        Page<SysUser> page = lambdaQuery()
                .and(StrUtil.isNotBlank(dto.getKeyword()), wrapper -> wrapper
                        .like(SysUser::getUsername, dto.getKeyword())
                        .or()
                        .like(SysUser::getDisplayName, dto.getKeyword()))
                .orderByDesc(SysUser::getCreateTime)
                .page(new Page<>(dto.getPageNum(), dto.getPageSize()));
        return new PageResult<>(page.getRecords().stream().map(this::toVo).toList(), page.getTotal());
    }

    @Override
    @Transactional(readOnly = true)
    public SysUserVo getUser(String userId) {
        return toVo(requireUser(userId));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SysUserVo addUser(SysUserSaveDto dto) {
        validateStatus(dto.getStatus());
        if (userMapper.selectCount(Wrappers.<SysUser>lambdaQuery().eq(SysUser::getUsername, dto.getUsername())) > 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "登录用户名已存在");
        }
        SysUser entity = new SysUser();
        fill(entity, dto);
        save(entity);
        return getUser(entity.getUserId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SysUserVo updateUser(String userId, SysUserSaveDto dto) {
        validateStatus(dto.getStatus());
        SysUser entity = requireUser(userId);
        if (userMapper.selectCount(Wrappers.<SysUser>lambdaQuery()
                .eq(SysUser::getUsername, dto.getUsername())
                .ne(SysUser::getUserId, userId)) > 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "登录用户名已存在");
        }
        fill(entity, dto);
        updateById(entity);
        return getUser(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updatePassword(String userId, SysUserPasswordDto dto) {
        SysUser entity = requireUser(userId);
        if (StrUtil.isBlank(entity.getPasswordHash()) || !BCrypt.checkpw(dto.getOldPassword(), entity.getPasswordHash())) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "原始密码错误");
        }
        if (!StrUtil.equals(dto.getNewPassword(), dto.getConfirmPassword())) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "新密码和确认密码不一致");
        }
        entity.setPasswordHash(BCrypt.hashpw(dto.getNewPassword()));
        return updateById(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteUser(String userId) {
        requireUser(userId);
        return removeById(userId);
    }

    private SysUser requireUser(String userId) {
        SysUser entity = getById(userId);
        if (entity == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "用户不存在");
        }
        return entity;
    }

    private void validateStatus(String status) {
        if (StatusEnum.getInfoByCode(status) == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户状态不合法");
        }
    }

    private void fill(SysUser entity, SysUserSaveDto dto) {
        entity.setUsername(dto.getUsername());
        entity.setDisplayName(dto.getDisplayName());
        entity.setStatus(dto.getStatus());
        if (entity.getUserId() == null) {
            if (StrUtil.isBlank(dto.getPassword())) {
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "新增用户密码不能为空");
            }
            entity.setPasswordHash(BCrypt.hashpw(dto.getPassword()));
        }
    }

    private SysUserVo toVo(SysUser entity) {
        SysUserVo vo = new SysUserVo();
        vo.setUserId(entity.getUserId());
        vo.setUsername(entity.getUsername());
        vo.setDisplayName(entity.getDisplayName());
        vo.setStatus(entity.getStatus());
        vo.setStatusText(StatusEnum.getInfoByCode(entity.getStatus()));
        vo.setCreateBy(entity.getCreateBy());
        vo.setCreateTime(entity.getCreateTime());
        vo.setUpdateTime(entity.getUpdateTime());
        return vo;
    }
}
