package com.deaofu.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/** 咨询信息新增或修改入参。 */
@Data
public class ConsultationSaveDto {

    /** 咨询主题列表，例如“价格咨询”“项目合作”。 */
    @NotEmpty(message = "咨询主题不能为空")
    private List<@NotBlank(message = "咨询主题不能为空") String> subjects;

    /** 咨询内容。 */
    @NotBlank(message = "咨询内容不能为空")
    private String content;

    /** 联系人姓名。 */
    @NotBlank(message = "姓名不能为空")
    @Size(max = 128, message = "姓名不能超过128个字符")
    private String contactName;

    /** 联系电话。 */
    @Size(max = 64, message = "电话不能超过64个字符")
    private String phone;

    /** 联系邮箱。 */
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    @Size(max = 255, message = "邮箱不能超过255个字符")
    private String email;
}
