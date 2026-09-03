package com.deaofu.controller.portal;

import com.deaofu.constants.CommonConstant;
import com.deaofu.enums.CountryEnum;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.vo.*;
import com.deaofu.service.ICompanyNewsService;
import com.deaofu.service.INewsTagService;
import com.deaofu.service.IPartnerCompanyService;
import com.deaofu.service.IProductCategoryService;
import com.deaofu.service.IProductService;
import com.deaofu.service.ITransportRouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import cn.hutool.core.util.StrUtil;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * 官网前台页面控制器。
 *
 * <p>所有页面均在服务端渲染（Thymeleaf）以保证 SEO；
 * 图片等文件通过 {@code /files/preview/{accessName}} 公开访问，不走管理端鉴权。
 */
@Controller
@RequiredArgsConstructor
public class PortalPageController {

    private final IProductService productService;
    private final IProductCategoryService categoryService;
    private final ICompanyNewsService newsService;
    private final INewsTagService newsTagService;
    private final IPartnerCompanyService partnerService;
    private final ITransportRouteService routeService;
    /** i18n 文案查询（默认语言为英文，详情见 {@link com.deaofu.config.I18nConfig}） */
    private final MessageSource messageSource;

    /**
     * GET /：渲染官网首页。
     * <p>聚合运输路线（含地图坐标与 SVG 路径）、合作企业 Logo 墙（上下两行）、
     * 产品分类、推荐产品与最新公司动态。
     *
     * @param model 视图模型
     * @return 首页模板 {@code portal/index}
     */
    @GetMapping({"/", "/index"})
    public String home(Model model) {
        // 世界地图：起点（周口工厂）+ 去重后的目标国家点位 + 路线 SVG 路径
        List<PortalRouteVo> routes = routeService.pageRoutes(page(1, 100)).getList().stream()
                .map(this::toRouteVo).filter(Objects::nonNull).toList();
        Map<String, PortalMapPointVo> targets = new LinkedHashMap<>();
        routes.forEach(route -> targets.putIfAbsent(route.getTargetName(),
                point(msg("home.map.target") + route.getTargetName(), route.getTargetX(), route.getTargetY())));
        model.addAttribute("mapOrigin", point(msg("home.map.origin"), CountryEnum.CN.getX(), CountryEnum.CN.getY()));
        model.addAttribute("mapTargets", targets.values());
        model.addAttribute("routes", routes);
        // 合作企业 Logo 墙：平均拆分上下两行
        List<PortalPartnerVo> partners = partnerService.pagePortalPartners(page(1, 100)).getList();
        int half = (partners.size() + 1) / 2;
        model.addAttribute("partnerRowTop", partners.subList(0, half));
        model.addAttribute("partnerRowBottom", partners.subList(half, partners.size()));
        // 产品分类（两级）与推荐产品、最新动态
        model.addAttribute("categories", categoryService.listCategories());
        model.addAttribute("products", productService.listHomeProducts());
        model.addAttribute("news", newsService.listHomeNews());
        return "portal/index";
    }

    /**
     * GET /products：渲染产品中心页。
     * <p>支持 {@code categoryId}（二级分类）与 {@code keyword} 筛选，服务端渲染结果。
     *
     * @param query 分页与筛选入参（categoryId / keyword / pageNum / pageSize）
     * @param model 视图模型
     * @return 产品中心模板 {@code portal/products}
     */
    @GetMapping("/products")
    public String products(AdminPageDto query, Model model) {
        normalize(query);
        model.addAttribute("categories", categoryService.listCategories());
        model.addAttribute("products", productService.pagePortalProducts(query).getList());
        model.addAttribute("query", query);
        return "portal/products";
    }

    /**
     * GET /product/{productId}：渲染产品详情页。
     * <p>包含产品参数、详情图与同分类下的相关产品（最多3个）。
     *
     * @param productId 产品ID
     * @param model     视图模型
     * @return 产品详情模板 {@code portal/product-detail}
     * @throws com.deaofu.exception.BusinessException 产品不存在
     */
    @GetMapping("/product/{productId}")
    public String product(@PathVariable String productId, Model model) {
        PortalProductVo product = productService.getPortalProduct(productId);
        model.addAttribute("product", product);
        // 相关产品：同二级分类下排除自身的最新产品
        AdminPageDto relatedQuery = page(1, 4);
        relatedQuery.setCategoryId(product.getCategoryId());
        List<PortalProductVo> related = productService.pagePortalProducts(relatedQuery).getList().stream()
                .filter(item -> !StrUtil.equals(item.getProductId(), product.getProductId()))
                .limit(3).toList();
        model.addAttribute("relatedProducts", related);
        return "portal/product-detail";
    }

    /**
     * GET /news：渲染公司动态列表页。
     * <p>支持 {@code tagId} 按动态标签筛选，服务端渲染结果。
     *
     * @param query 分页与筛选入参（tagId / pageNum / pageSize）
     * @param model 视图模型
     * @return 动态列表模板 {@code portal/news}
     */
    @GetMapping("/news")
    public String news(AdminPageDto query, Model model) {
        normalize(query);
        model.addAttribute("tags", newsTagService.listPortalTags());
        model.addAttribute("news", newsService.pagePortalNews(query).getList());
        model.addAttribute("query", query);
        return "portal/news";
    }

    /**
     * GET /news/{newsId}：渲染公司动态详情页。
     *
     * @param newsId 动态ID
     * @param model  视图模型
     * @return 动态详情模板 {@code portal/news-detail}
     * @throws com.deaofu.exception.BusinessException 动态不存在
     */
    @GetMapping("/news/{newsId}")
    public String newsDetail(@PathVariable String newsId, Model model) {
        model.addAttribute("newsItem", newsService.getPortalNews(newsId));
        return "portal/news-detail";
    }

    /**
     * GET /about：渲染关于我们页（工厂工序与资质证书为静态资源）。
     *
     * @return 关于我们模板 {@code portal/about}
     */
    @GetMapping("/about")
    public String about() {
        return "portal/about";
    }

    /**
     * GET /contact：渲染联系我们页（含咨询表单）。
     *
     * @return 联系我们模板 {@code portal/contact}
     */
    @GetMapping("/contact")
    public String contact() {
        return "portal/contact";
    }

    /**
     * 将运输路线转换为地图路线出参：坐标取自 {@link CountryEnum}，
     * 中国始发时以周口工厂为起点，并预计算 SVG 二次贝塞尔曲线路径。
     *
     * @param route 运输路线
     * @return 地图路线出参；国家代码无法识别时返回 {@code null}
     */
    private PortalRouteVo toRouteVo(TransportRouteVo route) {
        CountryEnum source = CountryEnum.getByCode(route.getSourceAddress());
        CountryEnum target = CountryEnum.getByCode(route.getTargetAddress());
        if (source == null || target == null) {
            return null;
        }
        boolean cnSource = CountryEnum.CN.getCode().equals(source.getCode());
        int sx = cnSource ? CountryEnum.CN.getX() : source.getX();
        int sy = cnSource ? CountryEnum.CN.getY() : source.getY();
        int tx = target.getX();
        int ty = target.getY();
        PortalRouteVo vo = new PortalRouteVo();
        vo.setRouteId(route.getRouteId());
        vo.setSourceName(cnSource ? msg("home.map.origin") : source.getName());
        vo.setSourceX(sx);
        vo.setSourceY(sy);
        vo.setTargetName(target.getName());
        vo.setTargetX(tx);
        vo.setTargetY(ty);
        // 控制点取中点并向上拱起，弧高与两点距离成正比
        int distance = (int) Math.hypot((double) tx - sx, (double) ty - sy);
        int controlX = (sx + tx) / 2;
        int controlY = (sy + ty) / 2 - (int) (distance * 0.3);
        vo.setPathD("M" + sx + " " + sy + " Q" + controlX + " " + controlY + " " + tx + " " + ty);
        return vo;
    }

    /**
     * 构建地图国家点位出参。
     *
     * @param name 点位展示名
     * @param x    X 坐标
     * @param y    Y 坐标
     * @return 点位出参（标签在点位右上方偏移）
     */
    private PortalMapPointVo point(String name, int x, int y) {
        PortalMapPointVo vo = new PortalMapPointVo();
        vo.setName(name);
        vo.setX(x);
        vo.setY(y);
        vo.setLabelX(x + 24);
        vo.setLabelY(y - 12);
        return vo;
    }

    /**
     * 构建指定页码与页容量的分页入参。
     *
     * @param number 页码
     * @param size   页容量
     * @return 分页入参
     */
    private AdminPageDto page(int number, int size) {
        AdminPageDto dto = new AdminPageDto();
        dto.setPageNum(number);
        dto.setPageSize(size);
        return dto;
    }

    /**
     * 根据当前请求的 locale 从 i18n 资源中取文案。
     *
     * @param key 资源键
     * @return 对应语言的文案
     */
    private String msg(String key) {
        return messageSource.getMessage(key, null, LocaleContextHolder.getLocale());
    }

    /**
     * 归一化前台分页入参（未指定时使用默认页容量）。
     *
     * @param query 分页入参
     */
    private void normalize(AdminPageDto query) {
        // 强制使用前台滚动加载的页大小，避免 AdminPageDto 默认值干扰
        if (query.getPageNum() == null || query.getPageNum() < 1) {
            query.setPageNum(1);
        }
        query.setPageSize(CommonConstant.PORTAL_PAGE_SIZE);
    }
}
