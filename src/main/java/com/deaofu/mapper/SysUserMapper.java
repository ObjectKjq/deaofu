package com.deaofu.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.deaofu.model.entity.SysUser;
import org.apache.ibatis.annotations.Mapper;

/**
 * 管理端用户 Mapper，对应数据库表 {@code sys_user}。
 * <p>当前仅复用 {@link BaseMapper} 提供的基础 CRUD；如需复杂查询（如联表/统计），
 * 请将 SQL 写在 {@code src/main/resources/mapper/SysUserMapper.xml}。
 *
 * @author deaofu
 */
@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {

}
