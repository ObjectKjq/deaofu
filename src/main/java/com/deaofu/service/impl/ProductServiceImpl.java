package com.deaofu.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.deaofu.common.ErrorCode;
import com.deaofu.common.PageResult;
import com.deaofu.exception.BusinessException;
import com.deaofu.mapper.ProductCategoryMapper;
import com.deaofu.mapper.ProductMapper;
import com.deaofu.mapper.SysUserMapper;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.ProductSaveDto;
import com.deaofu.model.entity.Product;
import com.deaofu.model.entity.ProductCategory;
import com.deaofu.model.entity.SysUser;
import com.deaofu.model.vo.ProductParameterVo;
import com.deaofu.model.vo.ProductVo;
import com.deaofu.service.IProductService;
import com.deaofu.utils.GsonUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/** 产品管理业务实现。 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements IProductService {

    private final ProductCategoryMapper productCategoryMapper;
    private final SysUserMapper sysUserMapper;
    private final FileReferenceValidator fileReferenceValidator;

    @Override
    @Transactional(readOnly = true)
    public PageResult<ProductVo> pageProducts(AdminPageDto dto) {
        Page<Product> page = lambdaQuery()
                .like(StrUtil.isNotBlank(dto.getKeyword()), Product::getTitle, dto.getKeyword())
                .eq(StrUtil.isNotBlank(dto.getCategoryId()), Product::getCategoryId, dto.getCategoryId())
                .orderByDesc(Product::getCreateTime)
                .page(new Page<>(dto.getPageNum(), dto.getPageSize()));
        Map<String, ProductCategory> categories = loadCategoryMap();
        Map<String, SysUser> users = loadUserMap(page.getRecords().stream().map(Product::getCreateBy).filter(Objects::nonNull).distinct().toList());
        List<ProductVo> list = page.getRecords().stream().map(item -> toVo(item, categories, users)).toList();
        return new PageResult<>(list, page.getTotal());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductVo getProduct(String productId) {
        Product entity = requireProduct(productId);
        Map<String, SysUser> users = loadUserMap(List.of(entity.getCreateBy()));
        return toVo(entity, loadCategoryMap(), users);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductVo addProduct(ProductSaveDto dto) {
        validateReferences(dto);
        Product entity = new Product();
        fill(entity, dto);
        save(entity);
        return getProduct(entity.getProductId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductVo updateProduct(String productId, ProductSaveDto dto) {
        validateReferences(dto);
        Product entity = requireProduct(productId);
        fill(entity, dto);
        updateById(entity);
        return getProduct(productId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteProduct(String productId) {
        requireProduct(productId);
        return removeById(productId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductVo updateHomeShowOrder(String productId, Integer order) {
        if (order == null || order < 0 || order > 5) throw new BusinessException(ErrorCode.PARAMS_ERROR, "首页产品顺序必须为0-5");
        Product entity = requireProduct(productId);
        if (order > 0) {
            lambdaUpdate().eq(Product::getHomeShowOrder, order).ne(Product::getProductId, productId).set(Product::getHomeShowOrder, 0).update();
        }
        entity.setHomeShowOrder(order);
        updateById(entity);
        return getProduct(productId);
    }

    private void validateReferences(ProductSaveDto dto) {
        ProductCategory category = productCategoryMapper.selectById(dto.getCategoryId());
        if (category == null || StrUtil.isBlank(category.getParentId())) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "产品必须选择有效的二级分类");
        }
        fileReferenceValidator.requireExists(dto.getCoverAccessName());
        fileReferenceValidator.requireAllExist(dto.getDetailImages());
    }

    private Product requireProduct(String productId) {
        Product entity = getById(productId);
        if (entity == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "产品不存在");
        }
        return entity;
    }

    private void fill(Product entity, ProductSaveDto dto) {
        entity.setCategoryId(dto.getCategoryId());
        entity.setCoverAccessName(dto.getCoverAccessName());
        entity.setDetailImages(GsonUtils.toJson(dto.getDetailImages()));
        entity.setTitle(dto.getTitle());
        entity.setSummary(dto.getSummary());
        entity.setSpecs(GsonUtils.toJson(dto.getParameters()));
    }

    private Map<String, ProductCategory> loadCategoryMap() {
        Map<String, ProductCategory> result = new HashMap<>();
        productCategoryMapper.selectList(null).forEach(item -> result.put(item.getCategoryId(), item));
        return result;
    }

    /** 批量加载操作人用户信息，key 为 userId。 */
    private Map<String, SysUser> loadUserMap(List<String> userIds) {
        Map<String, SysUser> result = new HashMap<>();
        if (userIds == null || userIds.isEmpty()) {
            return result;
        }
        sysUserMapper.selectBatchIds(userIds).forEach(user -> result.put(user.getUserId(), user));
        return result;
    }

    private ProductVo toVo(Product entity, Map<String, ProductCategory> categories, Map<String, SysUser> users) {
        ProductVo vo = new ProductVo();
        vo.setProductId(entity.getProductId());
        vo.setCategoryId(entity.getCategoryId());
        ProductCategory category = categories.get(entity.getCategoryId());
        vo.setCategoryName(category == null ? null : category.getCategoryName());
        ProductCategory parent = category == null ? null : categories.get(category.getParentId());
        vo.setParentCategoryName(parent == null ? null : parent.getCategoryName());
        vo.setCoverAccessName(entity.getCoverAccessName());
        vo.setCoverUrl("/admin/sys-file/preview/" + entity.getCoverAccessName());
        List<String> detailImages = GsonUtils.fromJsonList(entity.getDetailImages(), String.class);
        vo.setDetailImages(detailImages == null ? null : detailImages.stream().map(name -> "/admin/sys-file/preview/" + name).toList());
        vo.setTitle(entity.getTitle());
        vo.setSummary(entity.getSummary());
        vo.setParameters(GsonUtils.fromJsonList(entity.getSpecs(), ProductParameterVo.class));
        vo.setHomeShowOrder(entity.getHomeShowOrder() == null ? 0 : entity.getHomeShowOrder());
        SysUser creator = users.get(entity.getCreateBy());
        // createBy 库中存的是 userId，对外展示为用户名
        vo.setCreateBy(creator == null ? entity.getCreateBy() : creator.getUsername());
        vo.setCreateTime(entity.getCreateTime());
        vo.setUpdateTime(entity.getUpdateTime());
        return vo;
    }
}
