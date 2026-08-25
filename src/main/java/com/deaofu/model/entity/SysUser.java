package com.deaofu.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.deaofu.common.BaseDo;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/**
 * 管理端用户实体，对应数据库表 {@code sys_user}。
 *
 * @author deaofu
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class SysUser extends BaseDo implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 用户主键ID，UUID */
    @TableId(value = "user_id", type = IdType.ASSIGN_UUID)
    private String userId;

    /** 登录用户名，唯一 */
    private String username;

    /** BCrypt 密码哈希，禁止对外返回 */
    private String passwordHash;

    /** 显示名称（昵称），用于后台界面展示 */
    private String displayName;

    /**
     * 启用/禁用状态，取值见 {@link com.deaofu.enums.StatusEnum}：
     * <ul>
     *   <li>{@code 0}：启用</li>
     *   <li>{@code 1}：禁用</li>
     * </ul>
     */
    private String status;
}
