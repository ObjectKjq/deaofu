package com.deaofu.service;

import com.deaofu.common.PageResult;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.ProductSaveDto;
import com.deaofu.model.vo.PortalProductVo;
import com.deaofu.model.vo.ProductVo;
import java.util.List;

/** 产品管理业务接口。 */
public interface IProductService {
    /** 分页查询产品，支持一级分类下全部产品或指定二级分类筛选。 @param dto 查询条件，分类ID可为空 @return 产品分页结果 */
    PageResult<ProductVo> pageProducts(AdminPageDto dto);
    /**
     * 官网前台分页查询产品，关键词对名称、描述、一二级分类名称及参数名称/值进行模糊匹配。
     *
     * @param dto 分页及筛选条件，关键词为空时不限制，分类和语言条件与关键词同时生效
     * @return 符合条件的产品分页结果及总量
     */
    PageResult<PortalProductVo> pagePortalProducts(AdminPageDto dto);
    /** 查询产品详情。 @param productId 产品ID @return 产品详情 @throws com.deaofu.exception.BusinessException 产品不存在 */
    ProductVo getProduct(String productId);
    /** 官网前台查询产品详情。 @param productId 产品ID @return 产品详情 @throws com.deaofu.exception.BusinessException 产品不存在 */
    PortalProductVo getPortalProduct(String productId);
    /** 按语言查询官网产品详情。 */
    PortalProductVo getPortalProduct(String productId, Integer language);
    /** 新增产品。 @param dto 产品入参 @return 新增后的产品详情 @throws com.deaofu.exception.BusinessException 分类或文件不存在 */
    ProductVo addProduct(ProductSaveDto dto);
    /** 修改产品。 @param productId 产品ID @param dto 产品入参 @return 修改后的产品详情 @throws com.deaofu.exception.BusinessException 产品不存在 */
    ProductVo updateProduct(String productId, ProductSaveDto dto);
    /** 逻辑删除产品。 @param productId 产品ID @return 是否删除成功 */
    boolean deleteProduct(String productId);
    /** 设置产品官网首页展示顺序，0表示取消展示。 */
    ProductVo updateHomeShowOrder(String productId, Integer order);
    /** 查询官网首页展示产品，按展示顺序倒序返回，最多5条。 */
    List<PortalProductVo> listHomeProducts(Integer language);
}
