package com.deaofu.controller.admin;

import cn.hutool.core.util.StrUtil;
import com.deaofu.common.BaseResponse;
import com.deaofu.common.ResultUtils;
import com.deaofu.model.entity.SysFile;
import com.deaofu.model.vo.FileUploadVo;
import com.deaofu.service.ISysFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

/**
 * 管理端文件上传 / 下载 / 物理删除接口，统一将文件二进制内容存放在数据库。
 *
 * @author deaofu
 */
@RestController
@RequestMapping("/admin/sys-file")
@RequiredArgsConstructor
public class SysFileController {

    private final ISysFileService fileStorageService;

    /**
     * 上传文件。
     * <p>接收 multipart/form-data 中的 {@code file} 字段，落库后返回文件元信息，
     * 不返回二进制内容，避免响应体过大。
     *
     * @param file 上传的文件，支持任意 MIME 类型
     * @return 文件上传结果（包含 fileId、accessName、originalName、contentType、fileSize）
     */
    @PostMapping("/upload")
    public BaseResponse<FileUploadVo> upload(@RequestPart("file") MultipartFile file) {
        return ResultUtils.success(fileStorageService.upload(file));
    }

    /**
     * GET /admin/sys-file/preview/{accessName}：按访问文件名预览文件。
     * <p>拉取原始字节流，并通过 {@code Content-Disposition: inline}
     * 供图片、PDF等内容直接嵌入页面（文件名使用 UTF-8 编码）。
     *
     * @param accessName 文件访问名，对应 {@code sys_file.access_name}
     * @return 文件二进制流，资源类型由存储的 MIME 决定
     */
    @GetMapping("/preview/{accessName}")
    public ResponseEntity<ByteArrayResource> preview(@PathVariable String accessName) {
        SysFile file = fileStorageService.getByAccessName(accessName);
        String contentType = file.getContentType() == null
                ? MediaType.APPLICATION_OCTET_STREAM_VALUE : file.getContentType();
        String filename = StrUtil.blankToDefault(file.getAccessName(), file.getOriginalName());
        ContentDisposition disposition = ContentDisposition.inline()
                .filename(filename, StandardCharsets.UTF_8).build();
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType))
                .contentLength(file.getFileSize())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(new ByteArrayResource(file.getFileData()));
    }

    /**
     * 物理删除文件。
     *
     * <p>删除为不可恢复的 {@code DELETE} 操作，{@code sys_file} 表不做软删除，
     * 删除后数据库记录与文件二进制内容会一并消失；调用前请确认业务允许。
     *
     * <p>不存在时返回 {@code false}，不抛异常，便于前端做"删除即忽略"语义。
     *
     * @param fileId 文件主键ID
     * @return {@code true} 表示文件存在并已删除；{@code false} 表示文件不存在
     */
    @DeleteMapping("/{fileId}")
    public BaseResponse<Boolean> delete(@PathVariable String fileId) {
        return ResultUtils.success(fileStorageService.deleteById(fileId));
    }

}
