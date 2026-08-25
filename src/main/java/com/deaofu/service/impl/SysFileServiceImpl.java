package com.deaofu.service.impl;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.io.file.FileNameUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.deaofu.mapper.SysFileMapper;
import com.deaofu.model.entity.SysFile;
import com.deaofu.model.vo.FileUploadVo;
import com.deaofu.service.ISysFileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * 文件存储服务实现，将文件二进制内容直接写入数据库，删除采用物理删除。
 *
 * @author deaofu
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SysFileServiceImpl implements ISysFileService {

    private final SysFileMapper fileStorageMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public FileUploadVo upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("上传文件不能为空");
        }
        try {
            SysFile entity = new SysFile();
            // 1. 预生成 fileId（无连字符 UUID），便于后续基于它生成 accessName
            String fileId = IdUtil.simpleUUID();
            entity.setFileId(fileId);
            // 2. 填充文件元信息，原文件名/MIME 为空时使用兜底值
            String originalName = StrUtil.blankToDefault(file.getOriginalFilename(), "未命名文件");
            entity.setOriginalName(originalName);
            entity.setContentType(StrUtil.blankToDefault(file.getContentType(), "application/octet-stream"));
            entity.setFileSize(file.getSize());
            // 3. 生成访问文件名：fileId 去连字符 + 原扩展名（小写），无扩展名时仅保留 fileId
            String extension = FileUtil.getSuffix(originalName);
            String accessName = StrUtil.isBlank(extension) ? fileId : fileId + "." + extension;
            entity.setAccessName(accessName);
            // 4. 读取二进制内容
            entity.setFileData(file.getBytes());
            // 5. 持久化到数据库
            fileStorageMapper.insert(entity);
            // 6. 组装返回 VO，不暴露二进制内容
            FileUploadVo result = new FileUploadVo();
            result.setFileId(entity.getFileId());
            result.setAccessName(entity.getAccessName());
            result.setOriginalName(entity.getOriginalName());
            result.setContentType(entity.getContentType());
            result.setFileSize(entity.getFileSize());
            return result;
        } catch (IOException e) {
            log.error("读取上传文件失败", e);
            throw new IllegalStateException("读取上传文件失败", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public SysFile getByAccessName(String accessName) {
        // 1. 校验访问文件名非空
        if (StrUtil.isBlank(accessName)) {
            throw new IllegalArgumentException("访问文件名不能为空");
        }
        // 2. 按 access_name 唯一索引精确查询
        SysFile file = fileStorageMapper.selectOne(
                new LambdaQueryWrapper<SysFile>().eq(SysFile::getAccessName, accessName));
        if (file == null) {
            throw new IllegalArgumentException("文件不存在");
        }
        return file;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteById(String fileId) {
        // 1. 校验主键非空
        if (StrUtil.isBlank(fileId)) {
            throw new IllegalArgumentException("文件ID不能为空");
        }
        // 2. 先确认文件存在
        SysFile file = fileStorageMapper.selectById(fileId);
        if (file == null) {
            log.info("文件删除跳过：fileId={} 不存在", fileId);
            return false;
        }
        // 3. 物理删除（无 @TableLogic，MyBatis-Plus 直接发出 DELETE）
        int rows = fileStorageMapper.deleteById(fileId);
        log.info("物理删除文件：fileId={}, rows={}", fileId, rows);
        return rows > 0;
    }
}
