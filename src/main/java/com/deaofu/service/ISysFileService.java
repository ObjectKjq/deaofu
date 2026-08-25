package com.deaofu.service;

import com.deaofu.model.entity.SysFile;
import com.deaofu.model.vo.FileUploadVo;
import org.springframework.web.multipart.MultipartFile;

/**
 * 文件存储服务接口，负责管理端文件的上传、查询与物理删除。
 *
 * <p>文件存储不做软删除，删除为不可恢复的 {@code DELETE} 操作。
 *
 * @author deaofu
 */
public interface ISysFileService {

    /**
     * 上传文件，将文件二进制内容持久化到 {@code sys_file} 表。
     *
     * @param file 前端上传的 multipart 文件，不能为空
     * @return 文件上传结果（含 fileId / accessName / originalName / contentType / fileSize）
     * @throws IllegalArgumentException 文件为空
     * @throws IllegalStateException    读取文件字节流失败
     */
    FileUploadVo upload(MultipartFile file);

    /**
     * 按访问文件名（{@code access_name}）查询文件实体（含二进制内容）。
     * <p>用于 {@code GET /admin/sys-file/preview/{accessName}} 直链预览。
     *
     * @param accessName 访问文件名（含扩展名），对应数据库唯一索引 {@code uk_sys_file_access_name}
     * @return 文件实体（含字节流）
     * @throws IllegalArgumentException accessName 为空，或对应文件不存在
     */
    SysFile getByAccessName(String accessName);

    /**
     * 物理删除文件：执行真实的 {@code DELETE FROM sys_file WHERE file_id = ?}。
     *
     * <p>由于 {@code sys_file} 表未启用 {@code @TableLogic}，调用
     * {@code BaseMapper#deleteById} 不会转为 {@code UPDATE}，而是物理删除。
     * 删除不可恢复，调用前请确认业务允许。
     *
     * @param fileId 文件主键ID
     * @return {@code true} 表示文件存在并已删除；{@code false} 表示文件不存在
     * @throws IllegalArgumentException fileId 为空
     */
    boolean deleteById(String fileId);
}
