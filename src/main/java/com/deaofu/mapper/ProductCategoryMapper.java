package com.deaofu.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.deaofu.model.entity.ProductCategory;
import org.apache.ibatis.annotations.Mapper;

/** 产品分类 Mapper，基础CRUD由 MyBatis-Plus 提供。 */
@Mapper
public interface ProductCategoryMapper extends BaseMapper<ProductCategory> {
}
