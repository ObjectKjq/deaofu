package com.deaofu.controller.portal;

import com.deaofu.common.BaseResponse;
import com.deaofu.common.ResultUtils;
import com.deaofu.enums.CountryEnum;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.ConsultationSaveDto;
import com.deaofu.model.entity.NewsTag;
import com.deaofu.model.entity.SysFile;
import com.deaofu.model.vo.CompanyNewsVo;
import com.deaofu.model.vo.NewsTagVo;
import com.deaofu.model.vo.PortalMapPointVo;
import com.deaofu.model.vo.PortalPartnerVo;
import com.deaofu.model.vo.PortalProductVo;
import com.deaofu.model.vo.PortalRouteVo;
import com.deaofu.model.vo.ProductVo;
import com.deaofu.model.vo.TransportRouteVo;
import com.deaofu.service.ICompanyNewsService;
import com.deaofu.service.IConsultationService;
import com.deaofu.service.INewsTagService;
import com.deaofu.service.IPartnerCompanyService;
import com.deaofu.service.IProductCategoryService;
import com.deaofu.service.IProductService;
import com.deaofu.service.ISysFileService;
import com.deaofu.service.ITransportRouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import cn.hutool.core.util.StrUtil;
import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * 官网前台页面及公开接口控制器。
 *
 * <p>所有页面均在服务端渲染（Thymeleaf）以保证 SEO；
 * 图片等文件通过 {@code /files/preview/{accessName}} 公开访问，不走管理端鉴权。
 */
@Controller
@RequiredArgsConstructor
public class PortalController {

    /** 地图上生产基地（中国周口工厂）在 viewBox 0 0 1200 460 中的 X 坐标。 */
    private static final int ORIGIN_X = 963;

    /** 地图上生产基地（中国周口工厂）在 viewBox 0 0 1200 460 中的 Y 坐标。 */
    private static final int ORIGIN_Y = 170;

    /** 管理端文件预览路径前缀，模板渲染前统一替换为公开路径。 */
    private static final String ADMIN_PREVIEW_PREFIX = "/admin/sys-file/preview/";

    /** 公开文件预览路径前缀。 */
    private static final String PUBLIC_PREVIEW_PREFIX = "/files/preview/";

    /** 管理端标签图标路径前缀。 */
    private static final String ADMIN_TAG_ICON_PREFIX = "/admin/news-tags/";

    /** 公开标签图标路径前缀。 */
    private static final String PUBLIC_TAG_ICON_PREFIX = "/files/news-tags/";

    private final IProductService productService;
    private final IProductCategoryService categoryService;
    private final ICompanyNewsService newsService;
    private final INewsTagService newsTagService;
    private final IPartnerCompanyService partnerService;
    private final ITransportRouteService routeService;
    private final IConsultationService consultationService;
    private final ISysFileService fileService;

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
                point("服务国家: " + route.getTargetName(), route.getTargetX(), route.getTargetY())));
        model.addAttribute("mapOrigin", point("中国 · 周口工厂", ORIGIN_X, ORIGIN_Y));
        model.addAttribute("mapTargets", targets.values());
        model.addAttribute("routes", routes);
        // 合作企业 Logo 墙：平均拆分上下两行
        List<PortalPartnerVo> partners = partnerService.pagePartners(page(1, 100)).getList().stream()
                .map(this::toPartnerVo).toList();
        int half = (partners.size() + 1) / 2;
        model.addAttribute("partnerRowTop", partners.subList(0, half));
        model.addAttribute("partnerRowBottom", partners.subList(half, partners.size()));
        // 产品分类（两级）与推荐产品、最新动态
        model.addAttribute("categories", categoryService.listCategories());
        model.addAttribute("products", productService.pageProducts(page(1, 4)).getList().stream()
                .map(this::toProductVo).toList());
        model.addAttribute("news", newsService.pageNews(page(1, 3)).getList().stream()
                .map(this::toNewsVo).toList());
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
        normalize(query, 12);
        model.addAttribute("categories", categoryService.listCategories());
        model.addAttribute("products", productService.pageProducts(query).getList().stream()
                .map(this::toProductVo).toList());
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
        PortalProductVo product = toProductVo(productService.getProduct(productId));
        model.addAttribute("product", product);
        // 相关产品：同二级分类下排除自身的最新产品
        AdminPageDto relatedQuery = page(1, 4);
        relatedQuery.setCategoryId(product.getCategoryId());
        List<PortalProductVo> related = productService.pageProducts(relatedQuery).getList().stream()
                .map(this::toProductVo)
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
        normalize(query, 12);
        model.addAttribute("tags", newsTagService.listTags().stream().map(this::toTagVo).toList());
        model.addAttribute("news", newsService.pageNews(query).getList().stream()
                .map(this::toNewsVo).toList());
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
        model.addAttribute("newsItem", toNewsVo(newsService.getNews(newsId)));
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
     * POST /api/consultations：公开提交咨询信息。
     * <p>表单数据由前台 contact.js 以 JSON 提交，主题为多选。
     *
     * @param dto 咨询入参（subjects / content / contactName / phone / email）
     * @return 是否提交成功
     */
    @PostMapping("/api/consultations")
    @ResponseBody
    public BaseResponse<Boolean> consultation(@Valid @RequestBody ConsultationSaveDto dto) {
        consultationService.addConsultation(dto);
        return ResultUtils.success(Boolean.TRUE);
    }

    /**
     * GET /files/preview/{accessName}：公开预览数据库中的文件二进制流。
     *
     * @param accessName 文件访问名，对应 {@code sys_file.access_name}
     * @return 文件二进制流（inline）
     */
    @GetMapping("/files/preview/{accessName:.+}")
    public ResponseEntity<ByteArrayResource> preview(@PathVariable String accessName) {
        SysFile file = fileService.getByAccessName(accessName);
        return fileResponse(file, file.getOriginalName());
    }

    /**
     * GET /files/news-tags/{tagId}/icon：公开获取动态标签图标二进制流。
     *
     * @param tagId 标签ID
     * @return 图标二进制流（inline）
     */
    @GetMapping("/files/news-tags/{tagId}/icon")
    public ResponseEntity<ByteArrayResource> tagIcon(@PathVariable String tagId) {
        NewsTag tag = newsTagService.getTagEntity(tagId);
        SysFile file = new SysFile();
        file.setFileData(tag.getIconData());
        file.setContentType(tag.getIconContentType());
        file.setFileSize(tag.getIconData() == null ? 0L : (long) tag.getIconData().length);
        return fileResponse(file, tag.getTagName());
    }

    /**
     * 构建文件 inline 响应。
     *
     * @param file     文件数据
     * @param filename 下载使用的文件名
     * @return 二进制流响应
     */
    private ResponseEntity<ByteArrayResource> fileResponse(SysFile file, String filename) {
        String contentType = StrUtil.blankToDefault(file.getContentType(),
                MediaType.APPLICATION_OCTET_STREAM_VALUE);
        ContentDisposition disposition = ContentDisposition.inline()
                .filename(StrUtil.blankToDefault(filename, "file"), StandardCharsets.UTF_8).build();
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType))
                .contentLength(file.getFileSize() == null ? 0L : file.getFileSize())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(new ByteArrayResource(file.getFileData() == null ? new byte[0] : file.getFileData()));
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
        int sx = cnSource ? ORIGIN_X : source.getX();
        int sy = cnSource ? ORIGIN_Y : source.getY();
        int tx = target.getX();
        int ty = target.getY();
        PortalRouteVo vo = new PortalRouteVo();
        vo.setRouteId(route.getRouteId());
        vo.setSourceName(cnSource ? "中国 · 周口工厂" : source.getName());
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
     * 转换为官网合作企业出参（Logo 走公开预览地址）。
     *
     * @param partner 合作企业
     * @return 官网合作企业出参
     */
    private PortalPartnerVo toPartnerVo(com.deaofu.model.vo.PartnerCompanyVo partner) {
        PortalPartnerVo vo = new PortalPartnerVo();
        vo.setPartnerId(partner.getPartnerId());
        vo.setCompanyName(partner.getCompanyName());
        vo.setLogoUrl(publicUrl(partner.getLogoUrl()));
        return vo;
    }

    /**
     * 转换为官网产品出参（封面与详情图走公开预览地址）。
     *
     * @param product 产品
     * @return 官网产品出参
     */
    private PortalProductVo toProductVo(ProductVo product) {
        PortalProductVo vo = new PortalProductVo();
        vo.setProductId(product.getProductId());
        vo.setCategoryId(product.getCategoryId());
        vo.setCategoryName(product.getCategoryName());
        vo.setParentCategoryName(product.getParentCategoryName());
        vo.setCoverUrl(publicUrl(product.getCoverUrl()));
        vo.setDetailImageUrls(product.getDetailImages() == null ? List.of()
                : product.getDetailImages().stream().map(this::publicUrl).toList());
        vo.setTitle(product.getTitle());
        vo.setSummary(product.getSummary());
        vo.setParameters(product.getParameters());
        vo.setCreateTime(product.getCreateTime());
        return vo;
    }

    /**
     * 转换公司动态出参（封面走公开预览地址），并原位更新标签图标地址。
     *
     * @param news 公司动态
     * @return 处理后的公司动态出参
     */
    private CompanyNewsVo toNewsVo(CompanyNewsVo news) {
        news.setCoverUrl(publicUrl(news.getCoverUrl()));
        if (news.getTags() != null) {
            news.getTags().forEach(this::toTagVo);
        }
        return news;
    }

    /**
     * 转换动态标签出参（图标走公开访问地址）。
     *
     * @param tag 动态标签
     * @return 处理后的动态标签出参
     */
    private NewsTagVo toTagVo(NewsTagVo tag) {
        if (StrUtil.isNotBlank(tag.getIconUrl())) {
            tag.setIconUrl(tag.getIconUrl().replace(ADMIN_TAG_ICON_PREFIX, PUBLIC_TAG_ICON_PREFIX));
        }
        return tag;
    }

    /**
     * 将管理端文件预览地址替换为公开预览地址。
     *
     * @param url 原始地址
     * @return 公开访问地址；入参为 {@code null} 时返回 {@code null}
     */
    private String publicUrl(String url) {
        return url == null ? null : url.replace(ADMIN_PREVIEW_PREFIX, PUBLIC_PREVIEW_PREFIX);
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
     * 归一化前台分页入参（未指定时使用默认页容量）。
     *
     * @param query 分页入参
     * @param size  默认页容量
     */
    private void normalize(AdminPageDto query, int size) {
        if (query.getPageNum() == null) {
            query.setPageNum(1);
        }
        if (query.getPageSize() == null) {
            query.setPageSize(size);
        }
    }
}
