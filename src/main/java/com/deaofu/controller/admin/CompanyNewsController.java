package com.deaofu.controller.admin;

import com.deaofu.common.BaseResponse;
import com.deaofu.common.PageResult;
import com.deaofu.common.ResultUtils;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.CompanyNewsSaveDto;
import com.deaofu.model.vo.CompanyNewsVo;
import com.deaofu.service.ICompanyNewsService;
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

/** 管理端公司动态接口。 */
@RestController
@RequestMapping("/admin/news")
@RequiredArgsConstructor
public class CompanyNewsController {
    private final ICompanyNewsService newsService;

    /** GET /admin/news/page：分页查询动态，可按关键字和标签筛选。 @param dto 查询条件 @return 动态分页数据 */
    @GetMapping("/page")
    public BaseResponse<PageResult<CompanyNewsVo>> page(@Valid AdminPageDto dto) {
        return ResultUtils.success(newsService.pageNews(dto));
    }

    /** GET /admin/news/{newsId}：查询动态详情及标签。 @param newsId 动态ID @return 动态详情 */
    @GetMapping("/{newsId}")
    public BaseResponse<CompanyNewsVo> detail(@PathVariable String newsId) {
        return ResultUtils.success(newsService.getNews(newsId));
    }

    /** POST /admin/news：新增动态并保存标签关系；文件或标签无效时返回业务错误。 @param dto 动态入参 @return 新增后的动态 */
    @PostMapping
    public BaseResponse<CompanyNewsVo> add(@Valid @RequestBody CompanyNewsSaveDto dto) {
        return ResultUtils.success(newsService.addNews(dto));
    }

    /** PUT /admin/news/{newsId}：修改动态并重建标签关系。 @param newsId 动态ID @param dto 动态入参 @return 修改后的动态 */
    @PutMapping("/{newsId}")
    public BaseResponse<CompanyNewsVo> update(@PathVariable String newsId,
                                               @Valid @RequestBody CompanyNewsSaveDto dto) {
        return ResultUtils.success(newsService.updateNews(newsId, dto));
    }

    /** DELETE /admin/news/{newsId}：删除动态及关联关系。 @param newsId 动态ID @return 是否删除成功 */
    @DeleteMapping("/{newsId}")
    public BaseResponse<Boolean> delete(@PathVariable String newsId) {
        return ResultUtils.success(newsService.deleteNews(newsId));
    }
}
