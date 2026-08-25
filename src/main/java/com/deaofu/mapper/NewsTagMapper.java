package com.deaofu.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.deaofu.model.entity.NewsTag;
import org.apache.ibatis.annotations.Mapper;

/** 动态标签 Mapper，基础CRUD由 MyBatis-Plus 提供。 */
@Mapper
public interface NewsTagMapper extends BaseMapper<NewsTag> {
}
