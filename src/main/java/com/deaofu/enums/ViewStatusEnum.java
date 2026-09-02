package com.deaofu.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 咨询信息查看状态枚举。
 *
 * <p>对应数据库字段：{@code view_status char(1)}，仅 {@code consultation} 表使用。
 * <ul>
 *   <li>{@code 0}：未查看（管理员尚未点击查看按钮）</li>
 *   <li>{@code 1}：已查看（管理员点击查看后置为已查看）</li>
 * </ul>
 *
 * <p>{@code consultation.view_status} 字段必须使用本枚举的 {@link #code} 作为存储值，
 * 业务代码中禁止出现魔法字符串 {@code "0"} / {@code "1"}，统一通过本枚举读写。
 *
 * @author deaofu
 */
@Getter
@AllArgsConstructor
public enum ViewStatusEnum {

    /** 未查看 */
    UNVIEWED("0", "未查看"),

    /** 已查看 */
    VIEWED("1", "已查看");

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
        for (ViewStatusEnum value : values()) {
            if (value.getCode().equals(code)) {
                return value.getInfo();
            }
        }
        return null;
    }

    /**
     * 判断给定编码是否为"未查看"状态。
     *
     * @param code 数据库编码
     * @return true 表示未查看
     */
    public static boolean isUnviewed(String code) {
        return UNVIEWED.getCode().equals(code);
    }
}
