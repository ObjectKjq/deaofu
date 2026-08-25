package com.deaofu.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

import static cn.hutool.core.date.DatePattern.NORM_DATETIME_PATTERN;

/**
 * 数据库文件存储实体，对应数据库表 {@code sys_file}。
 * <p>当前实现将文件二进制内容直接存放在数据库的 {@code longblob} 字段中，
 * 适合小文件（如资质证书、客户 Logo）场景；如后续切换到对象存储，
 * 需把 {@link #fileData} 调整为对象存储 URL 或对象 Key。
 *
 * @author deaofu
 */
@Data
@TableName("sys_file")
public class SysFile implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 文件主键ID，UUID */
    @TableId(value = "file_id", type = IdType.ASSIGN_UUID)
    private String fileId;

    /** 原始文件名（含扩展名） */
    private String originalName;

    /**
     * 访问文件名（含扩展名，唯一），用于通过文件名直链下载文件。
     * <p>由 {@code fileId}（去除连字符）+ 原始扩展名小写组合而成，例如 {@code "9d7f....png"}。
     * 上传时自动生成，全局唯一，详见 {@link com.deaofu.service.impl.SysFileServiceImpl}。
     */
    @TableField("access_name")
    private String accessName;

    /** MIME 类型，例如 image/png、application/pdf */
    private String contentType;

    /** 文件字节数 */
    private Long fileSize;

    /** 文件二进制内容（数据库 longblob 字段映射） */
    private byte[] fileData;

    /** 创建者 */
    @TableField(fill = FieldFill.INSERT)
    private String createBy;

    /** 创建时间，格式：{@code yyyy-MM-dd HH:mm:ss} */
    @JsonFormat(pattern = NORM_DATETIME_PATTERN)
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;
}
