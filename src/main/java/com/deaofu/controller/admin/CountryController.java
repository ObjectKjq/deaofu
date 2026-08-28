package com.deaofu.controller.admin;

import com.deaofu.common.BaseResponse;
import com.deaofu.common.ResultUtils;
import com.deaofu.enums.CountryEnum;
import com.deaofu.model.vo.CountryVo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 国家字典管理端接口。
 *
 * <p>位于 {@code controller.admin} 包下，由 {@link com.deaofu.aop.AdminAuthAspect}
 * 自动校验管理端 Session 登录态，未登录会被拦截。</p>
 *
 * <p>用途：管理后台运输路线编辑、世界地图销售点位编辑等需要选择国家的场景下拉框。
 * 返回字段为 {@code code} + {@code name}，前端用 code 提交、后端持久化；
 * 显示用 name（中文名）。</p>
 */
@RestController
@RequestMapping("/admin/countries")
public class CountryController {

    /**
     * 列出全部国家（仅 code + name），按 ISO 代码字母升序。
     *
     * @return 国家列表，每项包含 ISO 二字代码与中文名
     */
    @GetMapping
    public BaseResponse<List<CountryVo>> listCountries() {
        List<CountryVo> list = CountryEnum.listAll().stream()
                .map(CountryVo::from)
                .toList();
        return ResultUtils.success(list);
    }
}
