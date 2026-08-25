package com.deaofu.model.vo;

import lombok.Data;

import java.util.List;

/** 管理后台仪表盘统计出参。 */
@Data
public class AdminDashboardVo {
    /** 产品总数。 */
    private Long productCount;
    /** 产品分类总数。 */
    private Long categoryCount;
    /** 公司动态总数。 */
    private Long newsCount;
    /** 咨询信息总数。 */
    private Long consultationCount;
    /** 合作企业总数。 */
    private Long partnerCount;
    /** 运输线路总数。 */
    private Long routeCount;
    /** 最近五条咨询信息。 */
    private List<ConsultationVo> recentConsultations;
}
