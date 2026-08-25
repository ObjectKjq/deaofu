package com.deaofu.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.deaofu.model.entity.TransportRoute;
import org.apache.ibatis.annotations.Mapper;

/** 运输线路 Mapper，基础CRUD由 MyBatis-Plus 提供。 */
@Mapper
public interface TransportRouteMapper extends BaseMapper<TransportRoute> {
}
