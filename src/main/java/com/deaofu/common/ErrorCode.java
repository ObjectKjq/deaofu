package com.deaofu.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 错误码
 *
 * @author pine
 */
@Getter
@AllArgsConstructor
public enum ErrorCode {

    SUCCESS(0, "ok"),
    PARAMS_ERROR(40000, "请求参数错误"),
    NOT_LOGIN_ERROR(40100, "未登录"),
    NO_AUTH_ERROR(40101, "无权限"),
    LOGIN_ERROR(40102, "用户名或密码错误"),
    NOT_FOUND_ERROR(40400, "请求数据不存在"),
    FORBIDDEN_ERROR(40300, "禁止访问"),
    OPERATION_ERROR(50001, "操作失败"),
    ;


    /**
     * 状态码
     */
    private final int code;

    /**
     * 信息
     */
    private final String message;

}
