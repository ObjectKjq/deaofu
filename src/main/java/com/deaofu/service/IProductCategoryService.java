package com.deaofu.service;

import com.deaofu.model.dto.ProductCategorySaveDto;
import com.deaofu.model.vo.ProductCategoryVo;

import java.util.List;

/** 产品分类管理业务接口。 */
public interface IProductCategoryService {
    /** 查询全部分类并按层级和排序返回。 @return 分类列表 */
    List<ProductCategoryVo> listCategories();
    /** 查询分类详情。 @param categoryId 分类ID @return 分类详情 */
    ProductCategoryVo getCategory(String categoryId);
    /** 新增分类。 @param dto 分类入参 @return 新增后的分类 */
    ProductCategoryVo addCategory(ProductCategorySaveDto dto);
    /** 修改分类。 @param categoryId 分类ID @param dto 分类入参 @return 修改后的分类 */
    ProductCategoryVo updateCategory(String categoryId, ProductCategorySaveDto dto);
    /** 删除空分类。 @param categoryId 分类ID @return 是否成功 @throws com.deaofu.exception.BusinessException 分类仍有子分类或产品 */
    boolean deleteCategory(String categoryId);
}
