package com.deaofu.service;

import com.deaofu.model.vo.AdminDashboardVo;

/** 管理后台仪表盘统计业务接口。 */
public interface IAdminDashboardService {
    /** 汇总管理后台核心业务数据。 @return 仪表盘统计数据 */
    AdminDashboardVo getDashboard();
}
