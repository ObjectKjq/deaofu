package com.deaofu.controller.admin;

import cn.hutool.core.util.StrUtil;
import com.deaofu.common.BaseResponse;
import com.deaofu.common.ErrorCode;
import com.deaofu.common.PageResult;
import com.deaofu.common.ResultUtils;
import com.deaofu.exception.BusinessException;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.NewsTagSaveDto;
import com.deaofu.model.entity.NewsTag;
import com.deaofu.model.vo.NewsTagVo;
import com.deaofu.service.INewsTagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** 管理端动态标签接口。 */
@RestController
@RequestMapping("/admin/news-tags")
@RequiredArgsConstructor
public class NewsTagController {
    private final INewsTagService tagService;

    /** GET /admin/news-tags：查询全部标签，不返回图标二进制。 @return 标签列表 */
    @GetMapping
    public BaseResponse<List<NewsTagVo>> list() {
        return ResultUtils.success(tagService.listTags());
    }

    /** GET /admin/news-tags/page：分页查询标签，keyword 按名称模糊匹配。 @param dto 分页入参 @return 标签分页结果 */
    @GetMapping("/page")
    public BaseResponse<PageResult<NewsTagVo>> page(@Valid AdminPageDto dto) {
        return ResultUtils.success(tagService.pageTags(dto));
    }

    /** GET /admin/news-tags/{tagId}：查询标签详情。 @param tagId 标签ID @return 标签详情 */
    @GetMapping("/{tagId}")
    public BaseResponse<NewsTagVo> detail(@PathVariable String tagId) {
        return ResultUtils.success(tagService.getTag(tagId));
    }

    /** GET /admin/news-tags/{tagId}/icon：输出标签图标二进制；无图标时返回404业务错误。 @param tagId 标签ID @return 图标字节流 */
    @GetMapping("/{tagId}/icon")
    public ResponseEntity<ByteArrayResource> icon(@PathVariable String tagId) {
        NewsTag tag = tagService.getTagEntity(tagId);
        if (tag.getIconData() == null || tag.getIconData().length == 0) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "标签图标不存在");
        }
        String contentType = StrUtil.blankToDefault(tag.getIconContentType(), MediaType.IMAGE_PNG_VALUE);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType))
                .contentLength(tag.getIconData().length).body(new ByteArrayResource(tag.getIconData()));
    }

    /** POST /admin/news-tags：新增标签，可携带Base64图标。 @param dto 标签入参 @return 新增后的标签 */
    @PostMapping
    public BaseResponse<NewsTagVo> add(@Valid @RequestBody NewsTagSaveDto dto) {
        return ResultUtils.success(tagService.addTag(dto));
    }

    /** PUT /admin/news-tags/{tagId}：修改标签；图标留空表示保留原图标。 @param tagId 标签ID @param dto 标签入参 @return 修改后的标签 */
    @PutMapping("/{tagId}")
    public BaseResponse<NewsTagVo> update(@PathVariable String tagId,
                                           @Valid @RequestBody NewsTagSaveDto dto) {
        return ResultUtils.success(tagService.updateTag(tagId, dto));
    }

    /** DELETE /admin/news-tags/{tagId}：删除未被动态使用的标签。 @param tagId 标签ID @return 是否删除成功 */
    @DeleteMapping("/{tagId}")
    public BaseResponse<Boolean> delete(@PathVariable String tagId) {
        return ResultUtils.success(tagService.deleteTag(tagId));
    }
}
