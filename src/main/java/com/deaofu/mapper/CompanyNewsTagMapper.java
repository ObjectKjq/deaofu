package com.deaofu.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.deaofu.model.entity.CompanyNewsTag;
import org.apache.ibatis.annotations.Mapper;

/** 动态与标签关联 Mapper，关联记录采用物理删除。 */
@Mapper
public interface CompanyNewsTagMapper extends BaseMapper<CompanyNewsTag> {
}
