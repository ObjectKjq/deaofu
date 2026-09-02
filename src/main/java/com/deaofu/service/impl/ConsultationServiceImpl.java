package com.deaofu.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.deaofu.common.ErrorCode;
import com.deaofu.common.PageResult;
import com.deaofu.enums.ViewStatusEnum;
import com.deaofu.exception.BusinessException;
import com.deaofu.mapper.ConsultationMapper;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.ConsultationSaveDto;
import com.deaofu.model.entity.Consultation;
import com.deaofu.model.vo.ConsultationVo;
import com.deaofu.service.IConsultationService;
import com.deaofu.utils.GsonUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** 咨询信息管理业务实现。 */
@Slf4j
@Service
public class ConsultationServiceImpl extends ServiceImpl<ConsultationMapper, Consultation>
        implements IConsultationService {

    @Override
    @Transactional(readOnly = true)
    public PageResult<ConsultationVo> pageConsultations(AdminPageDto dto) {
        Page<Consultation> page = lambdaQuery()
                .and(StrUtil.isNotBlank(dto.getKeyword()), wrapper -> wrapper
                        .like(Consultation::getContactName, dto.getKeyword())
                        .or().like(Consultation::getEmail, dto.getKeyword())
                        .or().like(Consultation::getPhone, dto.getKeyword())
                        .or().like(Consultation::getContent, dto.getKeyword()))
                .orderByAsc(Consultation::getViewStatus)
                .orderByDesc(Consultation::getCreateTime)
                .page(new Page<>(dto.getPageNum(), dto.getPageSize()));
        List<ConsultationVo> list = page.getRecords().stream().map(this::toVo).toList();
        return new PageResult<>(list, page.getTotal());
    }

    @Override
    @Transactional(readOnly = true)
    public ConsultationVo getConsultation(String consultationId) {
        return toVo(requireConsultation(consultationId));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ConsultationVo addConsultation(ConsultationSaveDto dto) {
        Consultation entity = new Consultation();
        fill(entity, dto);
        // 客户从门户提交的新咨询默认未查看
        entity.setViewStatus(ViewStatusEnum.UNVIEWED.getCode());
        save(entity);
        return toVo(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ConsultationVo updateConsultation(String consultationId, ConsultationSaveDto dto) {
        Consultation entity = requireConsultation(consultationId);
        fill(entity, dto);
        updateById(entity);
        return getConsultation(consultationId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteConsultation(String consultationId) {
        requireConsultation(consultationId);
        return removeById(consultationId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ConsultationVo markAsViewed(String consultationId) {
        Consultation entity = requireConsultation(consultationId);
        // 幂等处理：仅当当前为未查看时才更新，避免无意义的 update_by / update_time 变更
        if (ViewStatusEnum.isUnviewed(entity.getViewStatus())) {
            entity.setViewStatus(ViewStatusEnum.VIEWED.getCode());
            updateById(entity);
        }
        return toVo(entity);
    }

    private Consultation requireConsultation(String consultationId) {
        Consultation entity = getById(consultationId);
        if (entity == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "咨询信息不存在");
        }
        return entity;
    }

    private void fill(Consultation entity, ConsultationSaveDto dto) {
        entity.setSubjects(GsonUtils.toJson(dto.getSubjects()));
        entity.setContent(dto.getContent());
        entity.setContactName(dto.getContactName());
        entity.setPhone(dto.getPhone());
        entity.setEmail(dto.getEmail());
    }

    private ConsultationVo toVo(Consultation entity) {
        ConsultationVo vo = new ConsultationVo();
        vo.setConsultationId(entity.getConsultationId());
        vo.setSubjects(GsonUtils.fromJsonList(entity.getSubjects(), String.class));
        vo.setContent(entity.getContent());
        vo.setContactName(entity.getContactName());
        vo.setPhone(entity.getPhone());
        vo.setEmail(entity.getEmail());
        vo.setViewStatus(entity.getViewStatus());
        vo.setViewStatusText(ViewStatusEnum.getInfoByCode(entity.getViewStatus()));
        vo.setCreateTime(entity.getCreateTime());
        vo.setUpdateTime(entity.getUpdateTime());
        return vo;
    }
}
