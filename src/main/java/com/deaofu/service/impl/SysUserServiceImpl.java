package com.deaofu.service.impl;

import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.digest.BCrypt;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.deaofu.common.ErrorCode;
import com.deaofu.enums.StatusEnum;
import com.deaofu.exception.BusinessException;
import com.deaofu.mapper.SysUserMapper;
import com.deaofu.model.dto.LoginDto;
import com.deaofu.model.entity.SysUser;
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
public class SysUserServiceImpl implements ISysUserService {

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
}
