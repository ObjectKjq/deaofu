package com.deaofu.service;

import cn.hutool.core.util.IdUtil;
import com.deaofu.common.PageResult;
import com.deaofu.enums.DelFlagEnum;
import com.deaofu.mapper.ProductCategoryMapper;
import com.deaofu.mapper.ProductMapper;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.entity.Product;
import com.deaofu.model.entity.ProductCategory;
import com.deaofu.model.vo.PortalProductVo;
import com.deaofu.utils.GsonUtils;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 官网搜索的 MySQL 集成验证。使用 -Ddeaofu.mysql-tests=true 显式启用。
 * 每个用例中的测试产品与分类均随事务回滚，不保留到业务库。
 */
@SpringBootTest
@Transactional
@EnabledIfSystemProperty(named = "deaofu.mysql-tests", matches = "true")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
class ProductPortalSearchIntegrationTest {

    private final IProductService productService;
    private final ProductMapper productMapper;
    private final ProductCategoryMapper categoryMapper;
    private String token;
    private ProductCategory parent;
    private ProductCategory child;

    @BeforeEach
    void prepareCategories() {
        token = IdUtil.fastSimpleUUID();
        parent = category("一级" + token, null);
        child = category("二级" + token, parent.getCategoryId());
    }

    @Test
    void searchesNamesDescriptionsAndParameterLabelsAndValues() {
        Product named = product(child, 0, "前名称" + token + "后", null, List.of());
        Product described = product(child, 0, "普通产品", "前描述" + token + "后", List.of());
        Product labelled = product(child, 0, "普通产品", null,
                List.of(Map.of("label", "前参数名" + token + "后", "value", "常规")));
        Product valued = product(child, 0, "普通产品", null,
                List.of(Map.of("label", "型号", "value", "前参数值" + token + "/ABC-3800后")));

        assertOnly(search("名称" + token, null, 0, 1, 20), named);
        assertOnly(search("  描述" + token + "  ", null, 0, 1, 20), described);
        assertOnly(search("参数名" + token, null, 0, 1, 20), labelled);
        assertOnly(search("参数值" + token + "/abc-38", null, 0, 1, 20), valued);
        assertThat(search("label", child.getCategoryId(), 0, 1, 20).getTotal()).isZero();
        assertThat(search("value", child.getCategoryId(), 0, 1, 20).getTotal()).isZero();
    }

    @Test
    void searchesBothCategoryLevelsAndExcludesDeletedCategories() {
        Product item = product(child, 0, "普通产品", null, List.of());
        assertOnly(search("一级" + token, null, 0, 1, 20), item);
        assertOnly(search("二级" + token, null, 0, 1, 20), item);
        categoryMapper.deleteById(child.getCategoryId());
        assertThat(search("二级" + token, null, 0, 1, 20).getTotal()).isZero();
    }

    @Test
    void keepsCategoryLanguageDeletionAndPaginationConstraints() {
        Product first = product(child, 0, "共同" + token, null, List.of());
        Product second = product(child, 0, "普通产品", "共同" + token, List.of());
        product(category("其它" + token, parent.getCategoryId()), 0, "共同" + token, null, List.of());
        product(child, 1, "共同" + token, null, List.of());
        Product deleted = product(child, 0, "共同" + token, null, List.of());
        productMapper.deleteById(deleted.getProductId());

        PageResult<PortalProductVo> result = search("共同" + token, child.getCategoryId(), 0, 1, 20);
        assertThat(result.getTotal()).isEqualTo(2L);
        assertThat(result.getList()).extracting(PortalProductVo::getProductId)
                .containsExactlyInAnyOrder(first.getProductId(), second.getProductId());
        PageResult<PortalProductVo> page = search("共同" + token, child.getCategoryId(), 0, 1, 1);
        assertThat(page.getTotal()).isEqualTo(2L);
        assertThat(page.getList()).hasSize(1);
        assertThat(search("共同" + token, child.getCategoryId(), 0, 3, 1).getList()).isEmpty();
        assertThat(search("   ", child.getCategoryId(), 0, 1, 20).getTotal()).isEqualTo(2L);
    }

    @Test
    void treatsSqlWildcardsAndQuotesAsLiteralKeywordContent() {
        Product item = product(child, 0, "普通产品", "前" + token + "50%_!后", List.of());
        product(child, 0, "普通产品", "前" + token + "500ZZ后", List.of());
        assertOnly(search(token + "50%_!", null, 0, 1, 20), item);
        assertThat(search(token + "%' OR 1=1 --", null, 0, 1, 20).getTotal()).isZero();
    }

    private ProductCategory category(String name, String parentId) {
        ProductCategory category = new ProductCategory();
        category.setCategoryName(name);
        category.setParentId(parentId);
        category.setLanguage(0);
        category.setSortOrder(0);
        category.setDelFlag(DelFlagEnum.EXISTS.getCode());
        categoryMapper.insert(category);
        return category;
    }

    private Product product(ProductCategory category, int language, String title, String summary,
                            List<Map<String, String>> parameters) {
        Product product = new Product();
        product.setCategoryId(category.getCategoryId());
        product.setLanguage(language);
        product.setTitle(title);
        product.setSummary(summary);
        product.setCoverAccessName("搜索集成测试");
        product.setDetailImages("[]");
        product.setSpecs(GsonUtils.toJson(parameters));
        product.setHomeShowOrder(0);
        product.setDelFlag(DelFlagEnum.EXISTS.getCode());
        productMapper.insert(product);
        return product;
    }

    private PageResult<PortalProductVo> search(String keyword, String categoryId, int language, int pageNum, int size) {
        AdminPageDto query = new AdminPageDto();
        query.setKeyword(keyword);
        query.setCategoryId(categoryId);
        query.setLanguage(language);
        query.setPageNum(pageNum);
        query.setPageSize(size);
        return productService.pagePortalProducts(query);
    }

    private void assertOnly(PageResult<PortalProductVo> result, Product expected) {
        assertThat(result.getTotal()).isEqualTo(1L);
        assertThat(result.getList()).extracting(PortalProductVo::getProductId).containsExactly(expected.getProductId());
    }
}
