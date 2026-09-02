package com.deaofu.service;

import com.deaofu.common.PageResult;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.PartnerCompanySaveDto;
import com.deaofu.model.vo.PartnerCompanyVo;
import com.deaofu.model.vo.PortalPartnerVo;

/** 合作企业管理业务接口。 */
public interface IPartnerCompanyService {
    /** 分页查询合作企业。 @param dto 查询条件 @return 分页结果 */
    PageResult<PartnerCompanyVo> pagePartners(AdminPageDto dto);
    /** 官网前台分页查询合作企业。 @param dto 查询条件 @return 分页结果 */
    PageResult<PortalPartnerVo> pagePortalPartners(AdminPageDto dto);
    /** 查询合作企业。 @param partnerId 合作企业ID @return 合作企业详情 */
    PartnerCompanyVo getPartner(String partnerId);
    /** 新增合作企业。 @param dto 合作企业入参 @return 新增结果 */
    PartnerCompanyVo addPartner(PartnerCompanySaveDto dto);
    /** 修改合作企业。 @param partnerId 合作企业ID @param dto 合作企业入参 @return 修改结果 */
    PartnerCompanyVo updatePartner(String partnerId, PartnerCompanySaveDto dto);
    /** 逻辑删除合作企业。 @param partnerId 合作企业ID @return 是否成功 */
    boolean deletePartner(String partnerId);
}
