package com.deaofu.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.deaofu.common.ErrorCode;
import com.deaofu.common.PageResult;
import com.deaofu.exception.BusinessException;
import com.deaofu.mapper.PartnerCompanyMapper;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.PartnerCompanySaveDto;
import com.deaofu.model.entity.PartnerCompany;
import com.deaofu.model.vo.PartnerCompanyVo;
import com.deaofu.service.IPartnerCompanyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** 合作企业管理业务实现。 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PartnerCompanyServiceImpl extends ServiceImpl<PartnerCompanyMapper, PartnerCompany>
        implements IPartnerCompanyService {

    private final FileReferenceValidator fileReferenceValidator;

    @Override
    @Transactional(readOnly = true)
    public PageResult<PartnerCompanyVo> pagePartners(AdminPageDto dto) {
        Page<PartnerCompany> page = lambdaQuery()
                .like(StrUtil.isNotBlank(dto.getKeyword()), PartnerCompany::getCompanyName, dto.getKeyword())
                .orderByDesc(PartnerCompany::getCreateTime)
                .page(new Page<>(dto.getPageNum(), dto.getPageSize()));
        List<PartnerCompanyVo> list = page.getRecords().stream().map(this::toVo).toList();
        return new PageResult<>(list, page.getTotal());
    }

    @Override
    @Transactional(readOnly = true)
    public PartnerCompanyVo getPartner(String partnerId) {
        return toVo(requirePartner(partnerId));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PartnerCompanyVo addPartner(PartnerCompanySaveDto dto) {
        fileReferenceValidator.requireExists(dto.getLogoAccessName());
        PartnerCompany entity = new PartnerCompany();
        fill(entity, dto);
        save(entity);
        return toVo(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PartnerCompanyVo updatePartner(String partnerId, PartnerCompanySaveDto dto) {
        fileReferenceValidator.requireExists(dto.getLogoAccessName());
        PartnerCompany entity = requirePartner(partnerId);
        fill(entity, dto);
        updateById(entity);
        return getPartner(partnerId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deletePartner(String partnerId) {
        requirePartner(partnerId);
        return removeById(partnerId);
    }

    private PartnerCompany requirePartner(String partnerId) {
        PartnerCompany entity = getById(partnerId);
        if (entity == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "合作企业不存在");
        }
        return entity;
    }

    private void fill(PartnerCompany entity, PartnerCompanySaveDto dto) {
        entity.setLogoAccessName(dto.getLogoAccessName());
        entity.setCompanyName(dto.getCompanyName());
    }

    private PartnerCompanyVo toVo(PartnerCompany entity) {
        PartnerCompanyVo vo = new PartnerCompanyVo();
        vo.setPartnerId(entity.getPartnerId());
        vo.setLogoAccessName(entity.getLogoAccessName());
        vo.setLogoUrl("/admin/sys-file/preview/" + entity.getLogoAccessName());
        vo.setCompanyName(entity.getCompanyName());
        vo.setCreateTime(entity.getCreateTime());
        vo.setUpdateTime(entity.getUpdateTime());
        return vo;
    }
}
