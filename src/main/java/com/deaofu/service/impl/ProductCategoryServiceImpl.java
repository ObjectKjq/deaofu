package com.deaofu.service.impl;

import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.deaofu.common.ErrorCode;
import com.deaofu.common.PageResult;
import com.deaofu.exception.BusinessException;
import com.deaofu.mapper.ProductCategoryMapper;
import com.deaofu.mapper.ProductMapper;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.ProductCategorySaveDto;
import com.deaofu.model.entity.Product;
import com.deaofu.model.entity.ProductCategory;
import com.deaofu.model.vo.ProductCategoryVo;
import com.deaofu.service.IProductCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** 产品分类管理业务实现，仅允许一级、二级两层结构。 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductCategoryServiceImpl extends ServiceImpl<ProductCategoryMapper, ProductCategory>
        implements IProductCategoryService {

    private final ProductMapper productMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ProductCategoryVo> listCategories() {
        List<ProductCategory> entities = lambdaQuery().orderByDesc(ProductCategory::getCreateTime).list();
        Map<String, ProductCategory> byId = new HashMap<>();
        entities.forEach(item -> byId.put(item.getCategoryId(), item));
        return entities.stream().sorted(Comparator
                        .comparing((ProductCategory item) -> StrUtil.isNotBlank(item.getParentId()))
                        .thenComparing(ProductCategory::getCreateTime, Comparator.reverseOrder()))
                .map(item -> toVo(item, byId)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<ProductCategoryVo> pageCategories(AdminPageDto dto) {
        // 关键字命中二级分类名称时，把其父级分类也纳入分页范围
        List<String> matchedParentIds = StrUtil.isBlank(dto.getKeyword()) ? List.of()
                : lambdaQuery().like(ProductCategory::getCategoryName, dto.getKeyword())
                        .isNotNull(ProductCategory::getParentId).list().stream()
                        .map(ProductCategory::getParentId).distinct().toList();
        Page<ProductCategory> page = lambdaQuery()
                .isNull(ProductCategory::getParentId)
                .and(StrUtil.isNotBlank(dto.getKeyword()), wrapper -> wrapper
                        .like(ProductCategory::getCategoryName, dto.getKeyword())
                        .or().in(!matchedParentIds.isEmpty(), ProductCategory::getCategoryId, matchedParentIds))
                .orderByDesc(ProductCategory::getCreateTime)
                .page(new Page<>(dto.getPageNum(), dto.getPageSize()));
        // 批量查出当前页一级分类下的二级分类并分组
        List<String> parentIds = page.getRecords().stream().map(ProductCategory::getCategoryId).toList();
        Map<String, List<ProductCategory>> childMap = parentIds.isEmpty() ? Map.of()
                : lambdaQuery().in(ProductCategory::getParentId, parentIds)
                        .orderByDesc(ProductCategory::getCreateTime).list().stream()
                        .collect(Collectors.groupingBy(ProductCategory::getParentId));
        List<ProductCategoryVo> list = page.getRecords().stream().map(item -> {
            ProductCategoryVo vo = toVo(item, Map.of());
            vo.setChildren(childMap.getOrDefault(item.getCategoryId(), List.of()).stream()
                    .map(child -> toVo(child, Map.of(item.getCategoryId(), item))).toList());
            return vo;
        }).toList();
        return new PageResult<>(list, page.getTotal());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductCategoryVo getCategory(String categoryId) {
        ProductCategory entity = requireCategory(categoryId);
        Map<String, ProductCategory> byId = new HashMap<>();
        if (StrUtil.isNotBlank(entity.getParentId())) {
            ProductCategory parent = getById(entity.getParentId());
            if (parent != null) {
                byId.put(parent.getCategoryId(), parent);
            }
        }
        return toVo(entity, byId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductCategoryVo addCategory(ProductCategorySaveDto dto) {
        validateParent(null, dto.getParentId());
        ProductCategory entity = new ProductCategory();
        fill(entity, dto);
        save(entity);
        return getCategory(entity.getCategoryId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductCategoryVo updateCategory(String categoryId, ProductCategorySaveDto dto) {
        ProductCategory entity = requireCategory(categoryId);
        validateParent(categoryId, dto.getParentId());
        if (StrUtil.isNotBlank(dto.getParentId()) && lambdaQuery()
                .eq(ProductCategory::getParentId, categoryId).count() > 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "包含二级分类的一级分类不能改为二级分类");
        }
        fill(entity, dto);
        updateById(entity);
        return getCategory(categoryId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteCategory(String categoryId) {
        requireCategory(categoryId);
        if (lambdaQuery().eq(ProductCategory::getParentId, categoryId).count() > 0) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "请先删除该分类下的二级分类");
        }
        Long productCount = productMapper.selectCount(com.baomidou.mybatisplus.core.toolkit.Wrappers
                .<Product>lambdaQuery().eq(Product::getCategoryId, categoryId));
        if (productCount > 0) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "请先删除或转移该分类下的产品");
        }
        return removeById(categoryId);
    }

    private void validateParent(String categoryId, String parentId) {
        if (StrUtil.isBlank(parentId)) {
            return;
        }
        if (ObjectUtil.equal(categoryId, parentId)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "分类不能选择自身作为父级");
        }
        ProductCategory parent = getById(parentId);
        if (parent == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "父级分类不存在");
        }
        if (StrUtil.isNotBlank(parent.getParentId())) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "产品分类最多支持两级");
        }
    }

    private ProductCategory requireCategory(String categoryId) {
        ProductCategory entity = getById(categoryId);
        if (entity == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "产品分类不存在");
        }
        return entity;
    }

    private void fill(ProductCategory entity, ProductCategorySaveDto dto) {
        entity.setCategoryName(dto.getCategoryName());
        entity.setSortOrder(dto.getSortOrder() == null ? 0 : dto.getSortOrder());
        entity.setParentId(StrUtil.isBlank(dto.getParentId()) ? null : dto.getParentId());
    }

    private ProductCategoryVo toVo(ProductCategory entity, Map<String, ProductCategory> byId) {
        ProductCategoryVo vo = new ProductCategoryVo();
        vo.setCategoryId(entity.getCategoryId());
        vo.setCategoryName(entity.getCategoryName());
        vo.setSortOrder(entity.getSortOrder());
        vo.setParentId(entity.getParentId());
        // 一级分类 parentId 为 null，不可变 Map 禁止 null 查询，需先判空
        ProductCategory parent = entity.getParentId() == null ? null : byId.get(entity.getParentId());
        vo.setParentName(parent == null ? null : parent.getCategoryName());
        vo.setLevel(entity.getParentId() == null ? 1 : 2);
        vo.setCreateTime(entity.getCreateTime());
        return vo;
    }
}
