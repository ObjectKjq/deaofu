package com.deaofu.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 通用逻辑删除标志枚举。
 *
 * <p>对应数据库通用字段：{@code del_flag char(1)}。
 * <ul>
 *   <li>{@code 0}：存在（未删除）</li>
 *   <li>{@code 1}：已删除（逻辑删除，MyBatis-Plus 自动过滤）</li>
 * </ul>
 *
 * <p>所有继承 {@link com.deaofu.common.BaseDo} 的实体，其 {@code del_flag} 字段
 * 必须使用本枚举的 {@link #code} 作为存储值；MyBatis-Plus 通过
 * {@code @TableLogic} 自动追加 {@code WHERE del_flag='0'} 条件。
 *
 * @author deaofu
 */
@Getter
@AllArgsConstructor
public enum DelFlagEnum {

    /** 存在（未删除） */
    EXISTS("0", "存在"),

    /** 已删除（逻辑删除） */
    DELETED("1", "删除");

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
        for (DelFlagEnum value : values()) {
            if (value.getCode().equals(code)) {
                return value.getInfo();
            }
        }
        return null;
    }

    /**
     * 判断给定编码是否为"存在"状态（即未被逻辑删除）。
     *
     * @param code 数据库编码
     * @return true 表示存在
     */
    public static boolean isExists(String code) {
        return EXISTS.getCode().equals(code);
    }
}
