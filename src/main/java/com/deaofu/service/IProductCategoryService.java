package com.deaofu.service;

import com.deaofu.common.PageResult;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.ProductCategorySaveDto;
import com.deaofu.model.vo.ProductCategoryVo;

import java.util.List;

/** 产品分类管理业务接口。 */
public interface IProductCategoryService {
    /** 查询全部分类并按层级和排序返回。 @return 分类列表 */
    List<ProductCategoryVo> listCategories();
    /** 以一级分类为单位分页查询，每个一级分类携带其二级分类列表；关键字同时匹配一级名称与二级名称。 @param dto 分页入参 @return 一级分类分页结果 */
    PageResult<ProductCategoryVo> pageCategories(AdminPageDto dto);
    /** 查询分类详情。 @param categoryId 分类ID @return 分类详情 */
    ProductCategoryVo getCategory(String categoryId);
    /** 新增分类。 @param dto 分类入参 @return 新增后的分类 */
    ProductCategoryVo addCategory(ProductCategorySaveDto dto);
    /** 修改分类。 @param categoryId 分类ID @param dto 分类入参 @return 修改后的分类 */
    ProductCategoryVo updateCategory(String categoryId, ProductCategorySaveDto dto);
    /** 删除空分类。 @param categoryId 分类ID @return 是否成功 @throws com.deaofu.exception.BusinessException 分类仍有子分类或产品 */
    boolean deleteCategory(String categoryId);
}
