package com.deaofu.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/** 公司动态新增或修改入参。 */
@Data
public class CompanyNewsSaveDto {

    /** 封面图在文件表中的访问文件名。 */
    @NotBlank(message = "动态封面不能为空")
    private String coverAccessName;

    /** 动态标题。 */
    @NotBlank(message = "动态标题不能为空")
    @Size(max = 255, message = "动态标题不能超过255个字符")
    private String title;

    /** 动态简介。 */
    @Size(max = 1000, message = "动态简介不能超过1000个字符")
    private String summary;

    /** 动态正文HTML，可内嵌Base64图片。 */
    @NotBlank(message = "动态正文不能为空")
    private String content;

    /** 项目地区。 */
    @Size(max = 255, message = "项目地区不能超过255个字符")
    private String projectRegion;

    /** 咨询邮箱。 */
    @Email(message = "咨询邮箱格式不正确")
    @Size(max = 255, message = "咨询邮箱不能超过255个字符")
    private String contactEmail;

    /** 关联的动态标签ID列表。 */
    private List<String> tagIds;
}
