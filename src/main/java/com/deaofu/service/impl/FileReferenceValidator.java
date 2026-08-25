package com.deaofu.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.deaofu.common.ErrorCode;
import com.deaofu.exception.BusinessException;
import com.deaofu.mapper.SysFileMapper;
import com.deaofu.model.entity.SysFile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collection;

/** 校验业务表中保存的 {@code sys_file.access_name} 引用。 */
@Component
@RequiredArgsConstructor
public class FileReferenceValidator {
    private final SysFileMapper sysFileMapper;

    /**
     * 校验单个访问文件名存在。
     * @param accessName 访问文件名
     * @throws BusinessException 文件不存在
     */
    public void requireExists(String accessName) {
        if (StrUtil.isBlank(accessName) || sysFileMapper.selectCount(Wrappers.<SysFile>lambdaQuery()
                .eq(SysFile::getAccessName, accessName)) == 0) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "引用的文件不存在：" + accessName);
        }
    }

    /**
     * 校验访问文件名集合全部存在。
     * @param accessNames 访问文件名集合
     * @throws BusinessException 任一文件不存在
     */
    public void requireAllExist(Collection<String> accessNames) {
        if (accessNames == null) {
            return;
        }
        accessNames.forEach(this::requireExists);
    }
}
