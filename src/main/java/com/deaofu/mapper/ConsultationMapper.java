package com.deaofu.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.deaofu.model.entity.Consultation;
import org.apache.ibatis.annotations.Mapper;

/** 咨询信息 Mapper，基础CRUD由 MyBatis-Plus 提供。 */
@Mapper
public interface ConsultationMapper extends BaseMapper<Consultation> {
}
