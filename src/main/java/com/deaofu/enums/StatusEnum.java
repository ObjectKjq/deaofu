package com.deaofu.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 通用启用 / 禁用状态枚举。
 *
 * <p>对应数据库通用字段：{@code status char(1)}。
 * <ul>
 *   <li>{@code 0}：启用（正常参与业务）</li>
 *   <li>{@code 1}：禁用（被管理员停用，需屏蔽登录与可见性）</li>
 * </ul>
 *
 * <p>所有业务表中 {@code status} 字段必须使用本枚举的 {@link #code} 作为存储值，
 * 业务代码中禁止出现魔法字符串 {@code "0"} / {@code "1"}，统一通过本枚举读写。
 *
 * @author deaofu
 */
@Getter
@AllArgsConstructor
public enum StatusEnum {

    /** 启用 */
    ENABLE("0", "启用"),

    /** 禁用 */
    DISABLED("1", "禁用");

    /** 数据库存储编码 */
    private final String code;

    /** 中文描述 */
    private final String info;

    /**
     * 根据数据库存储的编码获取对应中文描述。
     *
     * @param code 数据库编码
     * @return 中文描述；未匹配时返回 {@code null}
     */
    public static String getInfoByCode(String code) {
        if (code == null) {
            return null;
        }
        for (StatusEnum value : values()) {
            if (value.getCode().equals(code)) {
                return value.getInfo();
            }
        }
        return null;
    }

    /**
     * 判断给定编码是否为"启用"状态。
     *
     * @param code 数据库编码
     * @return true 表示启用
     */
    public static boolean isEnabled(String code) {
        return ENABLE.getCode().equals(code);
    }
}
