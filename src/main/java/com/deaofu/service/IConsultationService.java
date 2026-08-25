package com.deaofu.service;

import com.deaofu.common.PageResult;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.ConsultationSaveDto;
import com.deaofu.model.vo.ConsultationVo;

/** 咨询信息管理业务接口。 */
public interface IConsultationService {
    /** 分页查询咨询信息。 @param dto 查询条件 @return 分页结果 */
    PageResult<ConsultationVo> pageConsultations(AdminPageDto dto);
    /** 查询咨询详情。 @param consultationId 咨询ID @return 咨询详情 */
    ConsultationVo getConsultation(String consultationId);
    /** 新增咨询信息。 @param dto 咨询入参 @return 新增结果 */
    ConsultationVo addConsultation(ConsultationSaveDto dto);
    /** 修改咨询信息。 @param consultationId 咨询ID @param dto 咨询入参 @return 修改结果 */
    ConsultationVo updateConsultation(String consultationId, ConsultationSaveDto dto);
    /** 逻辑删除咨询信息。 @param consultationId 咨询ID @return 是否成功 */
    boolean deleteConsultation(String consultationId);
}
