package com.deaofu.controller.portal;

import cn.hutool.core.util.StrUtil;
import com.deaofu.common.BaseResponse;
import com.deaofu.common.PageResult;
import com.deaofu.common.ResultUtils;
import com.deaofu.constants.CommonConstant;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.ConsultationSaveDto;
import com.deaofu.model.entity.NewsTag;
import com.deaofu.model.entity.SysFile;
import com.deaofu.model.vo.CompanyNewsVo;
import com.deaofu.model.vo.PortalProductVo;
import com.deaofu.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * 官网公开接口控制器。
 *
 */
@Controller
@RequiredArgsConstructor
public class PortalApiController {

    private final IConsultationService consultationService;
    private final ISysFileService fileService;
    private final IProductService productService;
    private final ICompanyNewsService newsService;
    private final INewsTagService newsTagService;

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
     * GET /api/products：官网前台产品分页JSON接口，供前端无限滚动加载使用。
     * <p>支持 {@code categoryId}（二级分类）与 {@code keyword} 筛选，固定页大小 。
     *
     * @param pageNum    页码，从1开始，缺省1
     * @param categoryId 二级分类ID，可空
     * @param keyword    关键字，可空
     * @return 当前页的产品列表与总量
     */
    @GetMapping("/api/products")
    @ResponseBody
    public BaseResponse<PageResult<PortalProductVo>> productsApi(
            @RequestParam(value = "pageNum", required = false) Integer pageNum,
            @RequestParam(value = "categoryId", required = false) String categoryId,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "language", required = false) Integer language
    ) {
        AdminPageDto query = new AdminPageDto();
        query.setPageNum(pageNum == null || pageNum < 1 ? 1 : pageNum);
        query.setPageSize(CommonConstant.PORTAL_PAGE_SIZE);
        query.setCategoryId(categoryId);
        query.setKeyword(keyword);
        query.setLanguage(language);
        PageResult<PortalProductVo> page = productService.pagePortalProducts(query);
        List<PortalProductVo> list = page.getList();
        return ResultUtils.success(new PageResult<>(list, page.getTotal()));
    }

    /**
     * GET /api/news：官网前台公司动态分页JSON接口，供前端无限滚动加载使用。
     * <p>支持 {@code tagId} 筛选，固定页大小 。
     *
     * @param pageNum 页码，从1开始，缺省1
     * @param tagId   标签ID，可空
     * @return 当前页的动态列表与总量
     */
    @GetMapping("/api/news")
    @ResponseBody
    public BaseResponse<PageResult<CompanyNewsVo>> newsApi(
            @RequestParam(value = "pageNum", required = false) Integer pageNum,
            @RequestParam(value = "tagId", required = false) String tagId,
            @RequestParam(value = "language", required = false) Integer language
    ) {
        AdminPageDto query = new AdminPageDto();
        query.setPageNum(pageNum == null || pageNum < 1 ? 1 : pageNum);
        query.setPageSize(CommonConstant.PORTAL_PAGE_SIZE);
        query.setTagId(tagId);
        query.setLanguage(language);
        PageResult<CompanyNewsVo> page = newsService.pagePortalNews(query);
        List<CompanyNewsVo> list = page.getList();
        return ResultUtils.success(new PageResult<>(list, page.getTotal()));
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

}
