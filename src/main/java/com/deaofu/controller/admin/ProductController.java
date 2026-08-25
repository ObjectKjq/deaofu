package com.deaofu.controller.admin;

import com.deaofu.common.BaseResponse;
import com.deaofu.common.PageResult;
import com.deaofu.common.ResultUtils;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.ProductSaveDto;
import com.deaofu.model.vo.ProductVo;
import com.deaofu.service.IProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 管理端产品接口。 */
@Validated
@RestController
@RequestMapping("/admin/products")
@RequiredArgsConstructor
public class ProductController {
    private final IProductService productService;

    /** GET /admin/products/page：分页查询产品；参数非法时返回参数错误。 @param dto 查询条件 @return 统一响应中的产品分页数据 */
    @GetMapping("/page")
    public BaseResponse<PageResult<ProductVo>> page(@Valid AdminPageDto dto) {
        return ResultUtils.success(productService.pageProducts(dto));
    }

    /** GET /admin/products/{productId}：查询产品详情；不存在时返回404业务错误。 @param productId 产品ID @return 统一响应中的产品详情 */
    @GetMapping("/{productId}")
    public BaseResponse<ProductVo> detail(@PathVariable String productId) {
        return ResultUtils.success(productService.getProduct(productId));
    }

    /** POST /admin/products：新增产品；分类或文件无效时返回业务错误。 @param dto 产品入参 @return 新增后的产品 */
    @PostMapping
    public BaseResponse<ProductVo> add(@Valid @RequestBody ProductSaveDto dto) {
        return ResultUtils.success(productService.addProduct(dto));
    }

    /** PUT /admin/products/{productId}：修改产品；产品不存在时返回404业务错误。 @param productId 产品ID @param dto 产品入参 @return 修改后的产品 */
    @PutMapping("/{productId}")
    public BaseResponse<ProductVo> update(@PathVariable String productId, @Valid @RequestBody ProductSaveDto dto) {
        return ResultUtils.success(productService.updateProduct(productId, dto));
    }

    /** DELETE /admin/products/{productId}：逻辑删除产品；产品不存在时返回404业务错误。 @param productId 产品ID @return 是否删除成功 */
    @DeleteMapping("/{productId}")
    public BaseResponse<Boolean> delete(@PathVariable String productId) {
        return ResultUtils.success(productService.deleteProduct(productId));
    }
}
