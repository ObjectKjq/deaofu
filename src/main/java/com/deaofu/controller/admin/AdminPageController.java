package com.deaofu.controller.admin;

import com.deaofu.common.ErrorCode;
import com.deaofu.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Set;

/** 管理后台 Thymeleaf 页面入口。 */
@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminPageController {

    private static final Set<String> MODULES = Set.of("dashboard", "products", "categories", "routes",
            "partners", "news", "tags", "consultations");

    /** GET /admin/login：渲染登录页；该页面由鉴权切面白名单放行。 @return {@code admin/login} 模板名 */
    @GetMapping("/login")
    public String loginPage() {
        return "admin/login";
    }

    /** GET /admin：渲染管理后台主框架；未登录时由鉴权切面返回未登录错误。 @return {@code admin/index} 模板名 */
    @GetMapping({"", "/"})
    public String indexPage() {
        return "admin/index";
    }

    /**
     * GET /admin/{module}：完整路径直达各模块页面(不带 #)。
     * 渲染统一的 {@code admin/index} 框架；前端 JS 根据 pathname 自动加载对应工作区内容。
     * @return {@code admin/index} 模板名
     */
    @GetMapping({"/dashboard", "/products", "/categories", "/routes",
            "/partners", "/news", "/tags", "/consultations"})
    public String directModulePage() {
        return "admin/index";
    }

    /** GET /admin/pages/{module}：内部接口,由前端 fetch 拉取工作区片段; 模块不存在时返回404业务错误。 @param module 模块编码 @param model 视图模型 @return 与模块一一对应的独立模板名({@code admin/{module}}) */
    @GetMapping("/pages/{module}")
    public String modulePage(@PathVariable String module, Model model) {
        if (!MODULES.contains(module)) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "管理后台模块不存在");
        }
        model.addAttribute("module", module);
        return "admin/" + module;
    }
}
