package com.deaofu.controller.admin;

import com.deaofu.common.BaseResponse;
import com.deaofu.common.ResultUtils;
import com.deaofu.model.vo.AdminDashboardVo;
import com.deaofu.service.IAdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 管理端仪表盘统计接口。 */
@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {
    private final IAdminDashboardService dashboardService;

    /** GET /admin/dashboard：汇总核心业务数量与最近咨询；统计失败时返回统一业务错误。 @return 仪表盘统计数据 */
    @GetMapping
    public BaseResponse<AdminDashboardVo> dashboard() {
        return ResultUtils.success(dashboardService.getDashboard());
    }
}
