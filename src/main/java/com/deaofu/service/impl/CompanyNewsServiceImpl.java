package com.deaofu.service.impl;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.deaofu.common.ErrorCode;
import com.deaofu.common.PageResult;
import com.deaofu.exception.BusinessException;
import com.deaofu.mapper.CompanyNewsMapper;
import com.deaofu.mapper.CompanyNewsTagMapper;
import com.deaofu.mapper.NewsTagMapper;
import com.deaofu.mapper.SysUserMapper;
import com.deaofu.model.entity.SysUser;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.CompanyNewsSaveDto;
import com.deaofu.model.entity.CompanyNews;
import com.deaofu.model.entity.CompanyNewsTag;
import com.deaofu.model.entity.NewsTag;
import java.util.Objects;

import com.deaofu.model.vo.CompanyNewsVo;
import com.deaofu.model.vo.NewsTagVo;
import com.deaofu.service.ICompanyNewsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** 公司动态管理业务实现。 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyNewsServiceImpl extends ServiceImpl<CompanyNewsMapper, CompanyNews>
        implements ICompanyNewsService {

    private final CompanyNewsTagMapper companyNewsTagMapper;
    private final NewsTagMapper newsTagMapper;
    private final SysUserMapper sysUserMapper;
    private final FileReferenceValidator fileReferenceValidator;

    @Override
    @Transactional(readOnly = true)
    public PageResult<CompanyNewsVo> pageNews(AdminPageDto dto) {
        Set<String> filteredNewsIds = null;
        if (StrUtil.isNotBlank(dto.getTagId())) {
            filteredNewsIds = new LinkedHashSet<>(companyNewsTagMapper.selectList(
                    Wrappers.<CompanyNewsTag>lambdaQuery().eq(CompanyNewsTag::getTagId, dto.getTagId()))
                    .stream().map(CompanyNewsTag::getNewsId).toList());
            if (filteredNewsIds.isEmpty()) {
                return PageResult.empty();
            }
        }
        Page<CompanyNews> page = lambdaQuery()
                .and(StrUtil.isNotBlank(dto.getKeyword()), wrapper -> wrapper
                        .like(CompanyNews::getTitle, dto.getKeyword())
                        .or().like(CompanyNews::getProjectRegion, dto.getKeyword()))
                .in(CollUtil.isNotEmpty(filteredNewsIds), CompanyNews::getNewsId, filteredNewsIds)
                .orderByDesc(CompanyNews::getCreateTime)
                .page(new Page<>(dto.getPageNum(), dto.getPageSize()));
        Map<String, List<NewsTagVo>> tagsByNews = loadTags(page.getRecords().stream()
                .map(CompanyNews::getNewsId).toList());
        Map<String, SysUser> users = loadUserMap(page.getRecords().stream()
                .map(CompanyNews::getCreateBy).filter(Objects::nonNull).distinct().toList());
        List<CompanyNewsVo> list = page.getRecords().stream()
                .map(item -> toVo(item, tagsByNews.getOrDefault(item.getNewsId(), Collections.emptyList()), users))
                .toList();
        return new PageResult<>(list, page.getTotal());
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyNewsVo getNews(String newsId) {
        CompanyNews entity = requireNews(newsId);
        Map<String, SysUser> users = loadUserMap(List.of(entity.getCreateBy()));
        return toVo(entity, loadTags(List.of(newsId)).getOrDefault(newsId, Collections.emptyList()), users);
    }

    /** 批量加载创建人用户信息，key 为 userId。 */
    private Map<String, SysUser> loadUserMap(List<String> userIds) {
        Map<String, SysUser> result = new HashMap<>();
        if (userIds == null || userIds.isEmpty()) {
            return result;
        }
        sysUserMapper.selectBatchIds(userIds).forEach(user -> result.put(user.getUserId(), user));
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CompanyNewsVo addNews(CompanyNewsSaveDto dto) {
        fileReferenceValidator.requireExists(dto.getCoverAccessName());
        validateTags(dto.getTagIds());
        CompanyNews entity = new CompanyNews();
        fill(entity, dto);
        save(entity);
        syncTags(entity.getNewsId(), dto.getTagIds());
        return getNews(entity.getNewsId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CompanyNewsVo updateNews(String newsId, CompanyNewsSaveDto dto) {
        fileReferenceValidator.requireExists(dto.getCoverAccessName());
        validateTags(dto.getTagIds());
        CompanyNews entity = requireNews(newsId);
        fill(entity, dto);
        updateById(entity);
        syncTags(newsId, dto.getTagIds());
        return getNews(newsId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteNews(String newsId) {
        requireNews(newsId);
        companyNewsTagMapper.delete(Wrappers.<CompanyNewsTag>lambdaQuery()
                .eq(CompanyNewsTag::getNewsId, newsId));
        return removeById(newsId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CompanyNewsVo updateHomeShowOrder(String newsId, Integer order) {
        if (order == null || order < 0 || order > 3) throw new BusinessException(ErrorCode.PARAMS_ERROR, "首页动态顺序必须为0-3");
        CompanyNews entity = requireNews(newsId);
        if (order > 0) {
            lambdaUpdate().eq(CompanyNews::getHomeShowOrder, order).ne(CompanyNews::getNewsId, newsId).set(CompanyNews::getHomeShowOrder, 0).update();
        }
        entity.setHomeShowOrder(order);
        updateById(entity);
        return getNews(newsId);
    }

    private void validateTags(List<String> tagIds) {
        if (CollUtil.isEmpty(tagIds)) {
            return;
        }
        Set<String> uniqueIds = new LinkedHashSet<>(tagIds);
        Long count = newsTagMapper.selectCount(Wrappers.<NewsTag>lambdaQuery()
                .in(NewsTag::getTagId, uniqueIds));
        if (count != uniqueIds.size()) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "部分动态标签不存在");
        }
    }

    private void syncTags(String newsId, List<String> tagIds) {
        companyNewsTagMapper.delete(Wrappers.<CompanyNewsTag>lambdaQuery()
                .eq(CompanyNewsTag::getNewsId, newsId));
        if (CollUtil.isEmpty(tagIds)) {
            return;
        }
        new LinkedHashSet<>(tagIds).forEach(tagId -> {
            CompanyNewsTag relation = new CompanyNewsTag();
            relation.setNewsId(newsId);
            relation.setTagId(tagId);
            companyNewsTagMapper.insert(relation);
        });
    }

    private CompanyNews requireNews(String newsId) {
        CompanyNews entity = getById(newsId);
        if (entity == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "公司动态不存在");
        }
        return entity;
    }

    private void fill(CompanyNews entity, CompanyNewsSaveDto dto) {
        entity.setCoverAccessName(dto.getCoverAccessName());
        entity.setTitle(dto.getTitle());
        entity.setSummary(dto.getSummary());
        entity.setContent(dto.getContent());
        entity.setProjectRegion(dto.getProjectRegion());
        entity.setContactEmail(dto.getContactEmail());
    }

    private Map<String, List<NewsTagVo>> loadTags(List<String> newsIds) {
        Map<String, List<NewsTagVo>> result = new HashMap<>();
        if (CollUtil.isEmpty(newsIds)) {
            return result;
        }
        List<CompanyNewsTag> relations = companyNewsTagMapper.selectList(
                Wrappers.<CompanyNewsTag>lambdaQuery().in(CompanyNewsTag::getNewsId, newsIds));
        if (relations.isEmpty()) {
            return result;
        }
        Set<String> tagIds = new LinkedHashSet<>(relations.stream().map(CompanyNewsTag::getTagId).toList());
        Map<String, NewsTagVo> tags = new HashMap<>();
        newsTagMapper.selectList(Wrappers.<NewsTag>lambdaQuery().in(NewsTag::getTagId, tagIds)
                        .select(NewsTag::getTagId, NewsTag::getTagName, NewsTag::getIconContentType,
                                NewsTag::getCreateTime))
                .forEach(item -> tags.put(item.getTagId(), toTagVo(item)));
        relations.forEach(relation -> {
            NewsTagVo tag = tags.get(relation.getTagId());
            if (tag != null) {
                result.computeIfAbsent(relation.getNewsId(), ignored -> new ArrayList<>()).add(tag);
            }
        });
        return result;
    }

    private NewsTagVo toTagVo(NewsTag entity) {
        NewsTagVo vo = new NewsTagVo();
        vo.setTagId(entity.getTagId());
        vo.setTagName(entity.getTagName());
        vo.setIconUrl(StrUtil.isBlank(entity.getIconContentType()) ? null
                : "/admin/news-tags/" + entity.getTagId() + "/icon");
        vo.setCreateTime(entity.getCreateTime());
        return vo;
    }

    private CompanyNewsVo toVo(CompanyNews entity, List<NewsTagVo> tags, Map<String, SysUser> users) {
        CompanyNewsVo vo = new CompanyNewsVo();
        vo.setNewsId(entity.getNewsId());
        vo.setCoverAccessName(entity.getCoverAccessName());
        vo.setCoverUrl("/admin/sys-file/preview/" + entity.getCoverAccessName());
        vo.setTitle(entity.getTitle());
        vo.setSummary(entity.getSummary());
        vo.setContent(entity.getContent());
        vo.setProjectRegion(entity.getProjectRegion());
        vo.setContactEmail(entity.getContactEmail());
        vo.setHomeShowOrder(entity.getHomeShowOrder() == null ? 0 : entity.getHomeShowOrder());
        vo.setTags(tags);
        SysUser creator = users.get(entity.getCreateBy());
        // createBy 库中存的是 userId，对外展示为用户名
        vo.setCreateBy(creator == null ? entity.getCreateBy() : creator.getUsername());
        vo.setCreateTime(entity.getCreateTime());
        vo.setUpdateTime(entity.getUpdateTime());
        return vo;
    }
}
