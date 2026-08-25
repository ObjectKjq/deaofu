package com.deaofu.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.deaofu.common.ErrorCode;
import com.deaofu.common.PageResult;
import com.deaofu.exception.BusinessException;
import com.deaofu.mapper.TransportRouteMapper;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.TransportRouteSaveDto;
import com.deaofu.model.entity.TransportRoute;
import com.deaofu.model.vo.TransportRouteVo;
import com.deaofu.service.ITransportRouteService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** 运输线路管理业务实现。 */
@Slf4j
@Service
public class TransportRouteServiceImpl extends ServiceImpl<TransportRouteMapper, TransportRoute>
        implements ITransportRouteService {

    @Override
    @Transactional(readOnly = true)
    public PageResult<TransportRouteVo> pageRoutes(AdminPageDto dto) {
        Page<TransportRoute> page = lambdaQuery()
                .and(StrUtil.isNotBlank(dto.getKeyword()), wrapper -> wrapper
                        .like(TransportRoute::getSourceAddress, dto.getKeyword())
                        .or().like(TransportRoute::getTargetAddress, dto.getKeyword()))
                .orderByDesc(TransportRoute::getCreateTime)
                .page(new Page<>(dto.getPageNum(), dto.getPageSize()));
        List<TransportRouteVo> list = page.getRecords().stream().map(this::toVo).toList();
        return new PageResult<>(list, page.getTotal());
    }

    @Override
    @Transactional(readOnly = true)
    public TransportRouteVo getRoute(String routeId) {
        return toVo(requireRoute(routeId));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TransportRouteVo addRoute(TransportRouteSaveDto dto) {
        TransportRoute entity = new TransportRoute();
        fill(entity, dto);
        save(entity);
        return toVo(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TransportRouteVo updateRoute(String routeId, TransportRouteSaveDto dto) {
        TransportRoute entity = requireRoute(routeId);
        fill(entity, dto);
        updateById(entity);
        return getRoute(routeId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteRoute(String routeId) {
        requireRoute(routeId);
        return removeById(routeId);
    }

    private TransportRoute requireRoute(String routeId) {
        TransportRoute entity = getById(routeId);
        if (entity == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "运输线路不存在");
        }
        return entity;
    }

    private void fill(TransportRoute entity, TransportRouteSaveDto dto) {
        entity.setSourceAddress(dto.getSourceAddress());
        entity.setTargetAddress(dto.getTargetAddress());
    }

    private TransportRouteVo toVo(TransportRoute entity) {
        TransportRouteVo vo = new TransportRouteVo();
        vo.setRouteId(entity.getRouteId());
        vo.setSourceAddress(entity.getSourceAddress());
        vo.setTargetAddress(entity.getTargetAddress());
        vo.setCreateTime(entity.getCreateTime());
        vo.setUpdateTime(entity.getUpdateTime());
        return vo;
    }
}
