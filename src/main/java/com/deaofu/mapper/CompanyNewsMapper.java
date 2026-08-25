package com.deaofu.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.deaofu.model.entity.CompanyNews;
import org.apache.ibatis.annotations.Mapper;

/** 公司动态 Mapper，基础CRUD由 MyBatis-Plus 提供。 */
@Mapper
public interface CompanyNewsMapper extends BaseMapper<CompanyNews> {
}
