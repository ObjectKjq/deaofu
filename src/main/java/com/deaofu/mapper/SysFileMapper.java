package com.deaofu.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.deaofu.model.entity.SysFile;
import org.apache.ibatis.annotations.Mapper;

/**
 * 文件存储 Mapper，对应数据库表 {@code sys_file}。
 * <p>当前仅复用 {@link BaseMapper} 提供的基础 CRUD；如需复杂查询，
 * 请将 SQL 写在 {@code src/main/resources/mapper/SysFileMapper.xml}。
 *
 * @author deaofu
 */
@Mapper
public interface SysFileMapper extends BaseMapper<SysFile> {

}
