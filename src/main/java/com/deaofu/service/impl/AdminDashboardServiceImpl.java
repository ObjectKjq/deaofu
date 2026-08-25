package com.deaofu.service.impl;

import com.deaofu.mapper.CompanyNewsMapper;
import com.deaofu.mapper.ConsultationMapper;
import com.deaofu.mapper.PartnerCompanyMapper;
import com.deaofu.mapper.ProductCategoryMapper;
import com.deaofu.mapper.ProductMapper;
import com.deaofu.mapper.TransportRouteMapper;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.vo.AdminDashboardVo;
import com.deaofu.service.IAdminDashboardService;
import com.deaofu.service.IConsultationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 管理后台仪表盘统计业务实现。 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements IAdminDashboardService {

    private final ProductMapper productMapper;
    private final ProductCategoryMapper productCategoryMapper;
    private final CompanyNewsMapper companyNewsMapper;
    private final ConsultationMapper consultationMapper;
    private final PartnerCompanyMapper partnerCompanyMapper;
    private final TransportRouteMapper transportRouteMapper;
    private final IConsultationService consultationService;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardVo getDashboard() {
        AdminDashboardVo vo = new AdminDashboardVo();
        vo.setProductCount(productMapper.selectCount(null));
        vo.setCategoryCount(productCategoryMapper.selectCount(null));
        vo.setNewsCount(companyNewsMapper.selectCount(null));
        vo.setConsultationCount(consultationMapper.selectCount(null));
        vo.setPartnerCount(partnerCompanyMapper.selectCount(null));
        vo.setRouteCount(transportRouteMapper.selectCount(null));
        AdminPageDto query = new AdminPageDto();
        query.setPageNum(1);
        query.setPageSize(5);
        vo.setRecentConsultations(consultationService.pageConsultations(query).getList());
        return vo;
    }
}
