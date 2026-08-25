package com.deaofu.service;

import com.deaofu.model.dto.NewsTagSaveDto;
import com.deaofu.model.entity.NewsTag;
import com.deaofu.model.vo.NewsTagVo;

import java.util.List;

/** 动态标签管理业务接口。 */
public interface INewsTagService {
    /** 查询全部动态标签。 @return 标签列表 */
    List<NewsTagVo> listTags();
    /** 查询动态标签详情。 @param tagId 标签ID @return 标签详情 */
    NewsTagVo getTag(String tagId);
    /** 查询含二进制图标的标签实体，仅供图标流接口使用。 @param tagId 标签ID @return 标签实体 */
    NewsTag getTagEntity(String tagId);
    /** 新增动态标签。 @param dto 标签入参 @return 新增结果 */
    NewsTagVo addTag(NewsTagSaveDto dto);
    /** 修改动态标签。 @param tagId 标签ID @param dto 标签入参 @return 修改结果 */
    NewsTagVo updateTag(String tagId, NewsTagSaveDto dto);
    /** 删除未使用的标签。 @param tagId 标签ID @return 是否成功 @throws com.deaofu.exception.BusinessException 标签仍被动态使用 */
    boolean deleteTag(String tagId);
}
