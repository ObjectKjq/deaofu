package com.deaofu.model.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 文件上传成功后的返回结果，不包含文件二进制内容。
 * <p>客户端拿到 {@link #accessName} 后可通过
 * {@code /admin/sys-file/preview/{accessName}} 按访问文件名预览。
 *
 * @author deaofu
 */
@Data
public class FileUploadVo implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 文件主键ID，用于文件物理删除等管理操作 */
    private String fileId;

    /**
     * 访问文件名（含扩展名，唯一），由后端自动生成。
     * <p>前端可凭此文件名拼接 {@code /admin/sys-file/preview/{accessName}} 直链。
     */
    private String accessName;

    /** 原始文件名（含扩展名） */
    private String originalName;

    /** MIME 类型，例如 image/png、application/pdf */
    private String contentType;

    /** 文件字节数 */
    private Long fileSize;
}
