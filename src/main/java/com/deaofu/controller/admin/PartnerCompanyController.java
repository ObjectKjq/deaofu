package com.deaofu.controller.admin;

import com.deaofu.common.BaseResponse;
import com.deaofu.common.PageResult;
import com.deaofu.common.ResultUtils;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.PartnerCompanySaveDto;
import com.deaofu.model.vo.PartnerCompanyVo;
import com.deaofu.service.IPartnerCompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 管理端合作企业接口。 */
@RestController
@RequestMapping("/admin/partner-companies")
@RequiredArgsConstructor
public class PartnerCompanyController {
    private final IPartnerCompanyService partnerService;

    /** GET /admin/partner-companies/page：分页查询合作企业。 @param dto 查询条件 @return 分页数据 */
    @GetMapping("/page")
    public BaseResponse<PageResult<PartnerCompanyVo>> page(@Valid AdminPageDto dto) {
        return ResultUtils.success(partnerService.pagePartners(dto));
    }

    /** GET /admin/partner-companies/{partnerId}：查询合作企业详情。 @param partnerId 合作企业ID @return 企业详情 */
    @GetMapping("/{partnerId}")
    public BaseResponse<PartnerCompanyVo> detail(@PathVariable String partnerId) {
        return ResultUtils.success(partnerService.getPartner(partnerId));
    }

    /** POST /admin/partner-companies：新增合作企业；Logo引用无效时返回业务错误。 @param dto 企业入参 @return 新增后的企业 */
    @PostMapping
    public BaseResponse<PartnerCompanyVo> add(@Valid @RequestBody PartnerCompanySaveDto dto) {
        return ResultUtils.success(partnerService.addPartner(dto));
    }

    /** PUT /admin/partner-companies/{partnerId}：修改合作企业。 @param partnerId 合作企业ID @param dto 企业入参 @return 修改后的企业 */
    @PutMapping("/{partnerId}")
    public BaseResponse<PartnerCompanyVo> update(@PathVariable String partnerId,
                                                  @Valid @RequestBody PartnerCompanySaveDto dto) {
        return ResultUtils.success(partnerService.updatePartner(partnerId, dto));
    }

    /** DELETE /admin/partner-companies/{partnerId}：逻辑删除合作企业。 @param partnerId 合作企业ID @return 是否删除成功 */
    @DeleteMapping("/{partnerId}")
    public BaseResponse<Boolean> delete(@PathVariable String partnerId) {
        return ResultUtils.success(partnerService.deletePartner(partnerId));
    }
}
