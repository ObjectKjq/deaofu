package com.deaofu.controller.admin;

import com.deaofu.common.BaseResponse;
import com.deaofu.common.PageResult;
import com.deaofu.common.ResultUtils;
import com.deaofu.model.dto.AdminPageDto;
import com.deaofu.model.dto.ConsultationSaveDto;
import com.deaofu.model.vo.ConsultationVo;
import com.deaofu.service.IConsultationService;
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

/** 管理端咨询信息接口。 */
@RestController
@RequestMapping("/admin/consultations")
@RequiredArgsConstructor
public class ConsultationController {
    private final IConsultationService consultationService;

    /** GET /admin/consultations/page：分页查询咨询信息；按查看状态升序、提交时间倒序，未查看的优先展示。 @param dto 查询条件 @return 咨询分页数据 */
    @GetMapping("/page")
    public BaseResponse<PageResult<ConsultationVo>> page(@Valid AdminPageDto dto) {
        return ResultUtils.success(consultationService.pageConsultations(dto));
    }

    /** GET /admin/consultations/{consultationId}：查询咨询详情。 @param consultationId 咨询ID @return 咨询详情 */
    @GetMapping("/{consultationId}")
    public BaseResponse<ConsultationVo> detail(@PathVariable String consultationId) {
        return ResultUtils.success(consultationService.getConsultation(consultationId));
    }

    /** POST /admin/consultations：新增咨询信息；参数非法时返回参数错误。 @param dto 咨询入参 @return 新增后的咨询 */
    @PostMapping
    public BaseResponse<ConsultationVo> add(@Valid @RequestBody ConsultationSaveDto dto) {
        return ResultUtils.success(consultationService.addConsultation(dto));
    }

    /** PUT /admin/consultations/{consultationId}：修改咨询信息。 @param consultationId 咨询ID @param dto 咨询入参 @return 修改后的咨询 */
    @PutMapping("/{consultationId}")
    public BaseResponse<ConsultationVo> update(@PathVariable String consultationId,
                                                @Valid @RequestBody ConsultationSaveDto dto) {
        return ResultUtils.success(consultationService.updateConsultation(consultationId, dto));
    }

    /** DELETE /admin/consultations/{consultationId}：逻辑删除咨询信息。 @param consultationId 咨询ID @return 是否删除成功 */
    @DeleteMapping("/{consultationId}")
    public BaseResponse<Boolean> delete(@PathVariable String consultationId) {
        return ResultUtils.success(consultationService.deleteConsultation(consultationId));
    }

    /** PUT /admin/consultations/{consultationId}/viewed：将咨询标记为已查看；幂等，重复调用不会重复更新 {@code update_time}。 @param consultationId 咨询ID @return 标记后的咨询详情 */
    @PutMapping("/{consultationId}/viewed")
    public BaseResponse<ConsultationVo> markAsViewed(@PathVariable String consultationId) {
        return ResultUtils.success(consultationService.markAsViewed(consultationId));
    }
}
