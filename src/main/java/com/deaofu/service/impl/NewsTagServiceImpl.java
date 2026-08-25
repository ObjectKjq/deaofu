package com.deaofu.service.impl;

import cn.hutool.core.codec.Base64;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.deaofu.common.ErrorCode;
import com.deaofu.exception.BusinessException;
import com.deaofu.mapper.CompanyNewsTagMapper;
import com.deaofu.mapper.NewsTagMapper;
import com.deaofu.model.dto.NewsTagSaveDto;
import com.deaofu.model.entity.CompanyNewsTag;
import com.deaofu.model.entity.NewsTag;
import com.deaofu.model.vo.NewsTagVo;
import com.deaofu.service.INewsTagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** 动态标签管理业务实现。 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NewsTagServiceImpl extends ServiceImpl<NewsTagMapper, NewsTag> implements INewsTagService {

    private final CompanyNewsTagMapper companyNewsTagMapper;

    @Override
    @Transactional(readOnly = true)
    public List<NewsTagVo> listTags() {
        return lambdaQuery().select(NewsTag::getTagId, NewsTag::getTagName, NewsTag::getIconContentType,
                        NewsTag::getCreateTime).orderByAsc(NewsTag::getTagName).list().stream()
                .map(this::toVo).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public NewsTagVo getTag(String tagId) {
        return toVo(requireTag(tagId));
    }

    @Override
    @Transactional(readOnly = true)
    public NewsTag getTagEntity(String tagId) {
        return requireTag(tagId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public NewsTagVo addTag(NewsTagSaveDto dto) {
        ensureNameUnique(null, dto.getTagName());
        NewsTag entity = new NewsTag();
        fill(entity, dto);
        save(entity);
        return toVo(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public NewsTagVo updateTag(String tagId, NewsTagSaveDto dto) {
        NewsTag entity = requireTag(tagId);
        ensureNameUnique(tagId, dto.getTagName());
        fill(entity, dto);
        updateById(entity);
        return getTag(tagId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteTag(String tagId) {
        requireTag(tagId);
        Long relationCount = companyNewsTagMapper.selectCount(Wrappers.<CompanyNewsTag>lambdaQuery()
                .eq(CompanyNewsTag::getTagId, tagId));
        if (relationCount > 0) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "该标签仍被公司动态使用，无法删除");
        }
        return removeById(tagId);
    }

    private void ensureNameUnique(String tagId, String tagName) {
        long count = lambdaQuery().eq(NewsTag::getTagName, tagName)
                .ne(StrUtil.isNotBlank(tagId), NewsTag::getTagId, tagId).count();
        if (count > 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "动态标签名称已存在");
        }
    }

    private NewsTag requireTag(String tagId) {
        NewsTag entity = getById(tagId);
        if (entity == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "动态标签不存在");
        }
        return entity;
    }

    private void fill(NewsTag entity, NewsTagSaveDto dto) {
        entity.setTagName(dto.getTagName());
        if (StrUtil.isBlank(dto.getIconBase64())) {
            return;
        }
        String source = dto.getIconBase64();
        String contentType = StrUtil.blankToDefault(dto.getIconContentType(), "image/png");
        int commaIndex = source.indexOf(',');
        if (source.startsWith("data:") && commaIndex > 5) {
            int semicolonIndex = source.indexOf(';');
            if (semicolonIndex > 5) {
                contentType = source.substring(5, semicolonIndex);
            }
            source = source.substring(commaIndex + 1);
        }
        try {
            entity.setIconData(Base64.decode(source));
            entity.setIconContentType(contentType);
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "标签图标Base64格式不正确");
        }
    }

    private NewsTagVo toVo(NewsTag entity) {
        NewsTagVo vo = new NewsTagVo();
        vo.setTagId(entity.getTagId());
        vo.setTagName(entity.getTagName());
        vo.setIconUrl(StrUtil.isBlank(entity.getIconContentType()) ? null
                : "/admin/news-tags/" + entity.getTagId() + "/icon");
        vo.setCreateTime(entity.getCreateTime());
        return vo;
    }
}
