package com.deaofu.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.deaofu.common.ErrorCode;
import com.deaofu.common.PageResult;
import com.deaofu.exception.BusinessException;
import com.deaofu.mapper.ProductCategoryMapper;
import com.deaofu.mapper.ProductMapper;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.ProductSaveDto;
import com.deaofu.model.entity.Product;
import com.deaofu.model.entity.ProductCategory;
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

/** 产品管理业务实现。 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements IProductService {

    private final ProductCategoryMapper productCategoryMapper;
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
        List<ProductVo> list = page.getRecords().stream().map(item -> toVo(item, categories)).toList();
        return new PageResult<>(list, page.getTotal());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductVo getProduct(String productId) {
        return toVo(requireProduct(productId), loadCategoryMap());
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

    private ProductVo toVo(Product entity, Map<String, ProductCategory> categories) {
        ProductVo vo = new ProductVo();
        vo.setProductId(entity.getProductId());
        vo.setCategoryId(entity.getCategoryId());
        ProductCategory category = categories.get(entity.getCategoryId());
        vo.setCategoryName(category == null ? null : category.getCategoryName());
        ProductCategory parent = category == null ? null : categories.get(category.getParentId());
        vo.setParentCategoryName(parent == null ? null : parent.getCategoryName());
        vo.setCoverAccessName(entity.getCoverAccessName());
        vo.setCoverUrl("/admin/sys-file/preview/" + entity.getCoverAccessName());
        vo.setDetailImages(GsonUtils.fromJsonList(entity.getDetailImages(), String.class));
        vo.setTitle(entity.getTitle());
        vo.setSummary(entity.getSummary());
        vo.setParameters(GsonUtils.fromJsonList(entity.getSpecs(), ProductParameterVo.class));
        vo.setCreateTime(entity.getCreateTime());
        vo.setUpdateTime(entity.getUpdateTime());
        return vo;
    }
}
