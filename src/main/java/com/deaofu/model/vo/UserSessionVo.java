package com.deaofu.model.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 放入 HTTP Session 的脱敏用户信息，仅保留业务展示与权限所需的最小字段。
 * <p>禁止将密码哈希、加密盐等敏感字段放入本对象。
 *
 * @author deaofu
 */
@Data
public class UserSessionVo implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 用户主键ID */
    private String userId;

    /** 登录用户名 */
    private String username;

    /** 显示名称（昵称） */
    private String displayName;
}
