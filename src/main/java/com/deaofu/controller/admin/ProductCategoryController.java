package com.deaofu.controller.admin;

import com.deaofu.common.BaseResponse;
import com.deaofu.common.PageResult;
import com.deaofu.common.ResultUtils;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.ProductCategorySaveDto;
import com.deaofu.model.vo.ProductCategoryVo;
import com.deaofu.service.IProductCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** 管理端产品分类接口。 */
@RestController
@RequestMapping("/admin/product-categories")
@RequiredArgsConstructor
public class ProductCategoryController {
    private final IProductCategoryService categoryService;

    /** GET /admin/product-categories：查询全部一二级分类，可按 language（0中文、1英语）筛选。 @return 统一响应中的分类列表 */
    @GetMapping
    public BaseResponse<List<ProductCategoryVo>> list(@RequestParam(required = false) Integer language) {
        return ResultUtils.success(categoryService.listCategories(language));
    }

    /** GET /admin/product-categories/page：以一级分类为单位分页，每个一级分类携带二级分类列表。 @param dto 分页入参（keyword 可选） @return 一级分类分页结果 */
    @GetMapping("/page")
    public BaseResponse<PageResult<ProductCategoryVo>> page(@Valid AdminPageDto dto) {
        return ResultUtils.success(categoryService.pageCategories(dto));
    }

    /** GET /admin/product-categories/{categoryId}：查询分类详情；不存在时返回404业务错误。 @param categoryId 分类ID @return 分类详情 */
    @GetMapping("/{categoryId}")
    public BaseResponse<ProductCategoryVo> detail(@PathVariable String categoryId) {
        return ResultUtils.success(categoryService.getCategory(categoryId));
    }

    /** POST /admin/product-categories：新增一级或二级分类；层级非法时返回参数错误。 @param dto 分类入参 @return 新增后的分类 */
    @PostMapping
    public BaseResponse<ProductCategoryVo> add(@Valid @RequestBody ProductCategorySaveDto dto) {
        return ResultUtils.success(categoryService.addCategory(dto));
    }

    /** PUT /admin/product-categories/{categoryId}：修改分类；层级非法时返回参数错误。 @param categoryId 分类ID @param dto 分类入参 @return 修改后的分类 */
    @PutMapping("/{categoryId}")
    public BaseResponse<ProductCategoryVo> update(@PathVariable String categoryId,
                                                   @Valid @RequestBody ProductCategorySaveDto dto) {
        return ResultUtils.success(categoryService.updateCategory(categoryId, dto));
    }

    /** DELETE /admin/product-categories/{categoryId}：删除空分类；存在子分类或产品时拒绝删除。 @param categoryId 分类ID @return 是否删除成功 */
    @DeleteMapping("/{categoryId}")
    public BaseResponse<Boolean> delete(@PathVariable String categoryId) {
        return ResultUtils.success(categoryService.deleteCategory(categoryId));
    }
}
