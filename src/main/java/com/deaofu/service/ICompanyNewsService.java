package com.deaofu.service;

import com.deaofu.common.PageResult;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.CompanyNewsSaveDto;
import com.deaofu.model.vo.CompanyNewsVo;
import java.util.List;

/** 公司动态管理业务接口。 */
public interface ICompanyNewsService {
    /** 分页查询公司动态。 @param dto 查询条件 @return 分页结果 */
    PageResult<CompanyNewsVo> pageNews(AdminPageDto dto);
    /** 官网前台分页查询公司动态。 @param dto 查询条件 @return 分页结果 */
    PageResult<CompanyNewsVo> pagePortalNews(AdminPageDto dto);
    /** 查询公司动态详情。 @param newsId 动态ID @return 动态详情 */
    CompanyNewsVo getNews(String newsId);
    /** 官网前台查询公司动态详情。 @param newsId 动态ID @return 动态详情 */
    CompanyNewsVo getPortalNews(String newsId);
    /** 按语言查询官网动态详情。 */
    CompanyNewsVo getPortalNews(String newsId, Integer language);
    /** 新增公司动态并维护标签关系。 @param dto 动态入参 @return 新增结果 */
    CompanyNewsVo addNews(CompanyNewsSaveDto dto);
    /** 修改公司动态并重建标签关系。 @param newsId 动态ID @param dto 动态入参 @return 修改结果 */
    CompanyNewsVo updateNews(String newsId, CompanyNewsSaveDto dto);
    /** 删除公司动态及标签关系。 @param newsId 动态ID @return 是否成功 */
    boolean deleteNews(String newsId);
    /** 设置动态官网首页展示顺序，0表示取消展示。 */
    CompanyNewsVo updateHomeShowOrder(String newsId, Integer order);
    /** 查询官网首页展示动态，按展示顺序倒序返回，最多3条。 */
    List<CompanyNewsVo> listHomeNews(Integer language);
}
