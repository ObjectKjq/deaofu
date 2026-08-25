package com.deaofu.controller.admin;

import com.deaofu.common.BaseResponse;
import com.deaofu.common.PageResult;
import com.deaofu.common.ResultUtils;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.TransportRouteSaveDto;
import com.deaofu.model.vo.TransportRouteVo;
import com.deaofu.service.ITransportRouteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 管理端运输线路接口。 */
@RestController
@RequestMapping("/admin/transport-routes")
@RequiredArgsConstructor
public class TransportRouteController {
    private final ITransportRouteService routeService;

    /** GET /admin/transport-routes/page：分页查询线路。 @param dto 查询条件 @return 统一响应中的分页数据 */
    @GetMapping("/page")
    public BaseResponse<PageResult<TransportRouteVo>> page(@Valid AdminPageDto dto) {
        return ResultUtils.success(routeService.pageRoutes(dto));
    }

    /** GET /admin/transport-routes/{routeId}：查询线路详情；不存在时返回404业务错误。 @param routeId 线路ID @return 线路详情 */
    @GetMapping("/{routeId}")
    public BaseResponse<TransportRouteVo> detail(@PathVariable String routeId) {
        return ResultUtils.success(routeService.getRoute(routeId));
    }

    /** POST /admin/transport-routes：新增线路；参数非法时返回参数错误。 @param dto 线路入参 @return 新增后的线路 */
    @PostMapping
    public BaseResponse<TransportRouteVo> add(@Valid @RequestBody TransportRouteSaveDto dto) {
        return ResultUtils.success(routeService.addRoute(dto));
    }

    /** PUT /admin/transport-routes/{routeId}：修改线路；不存在时返回404业务错误。 @param routeId 线路ID @param dto 线路入参 @return 修改后的线路 */
    @PutMapping("/{routeId}")
    public BaseResponse<TransportRouteVo> update(@PathVariable String routeId,
                                                  @Valid @RequestBody TransportRouteSaveDto dto) {
        return ResultUtils.success(routeService.updateRoute(routeId, dto));
    }

    /** DELETE /admin/transport-routes/{routeId}：逻辑删除线路。 @param routeId 线路ID @return 是否删除成功 */
    @DeleteMapping("/{routeId}")
    public BaseResponse<Boolean> delete(@PathVariable String routeId) {
        return ResultUtils.success(routeService.deleteRoute(routeId));
    }
}
