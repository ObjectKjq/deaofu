package com.deaofu.service;

import com.deaofu.common.PageResult;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.TransportRouteSaveDto;
import com.deaofu.model.vo.TransportRouteVo;

/** 运输线路管理业务接口。 */
public interface ITransportRouteService {
    /** 分页查询运输线路。 @param dto 查询条件 @return 分页结果 */
    PageResult<TransportRouteVo> pageRoutes(AdminPageDto dto);
    /** 查询运输线路。 @param routeId 线路ID @return 线路详情 */
    TransportRouteVo getRoute(String routeId);
    /** 新增运输线路。 @param dto 线路入参 @return 新增结果 */
    TransportRouteVo addRoute(TransportRouteSaveDto dto);
    /** 修改运输线路。 @param routeId 线路ID @param dto 线路入参 @return 修改结果 */
    TransportRouteVo updateRoute(String routeId, TransportRouteSaveDto dto);
    /** 逻辑删除运输线路。 @param routeId 线路ID @return 是否成功 */
    boolean deleteRoute(String routeId);
}
