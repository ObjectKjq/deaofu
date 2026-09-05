package com.deaofu.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 内容语言字典。 */
@Getter
@AllArgsConstructor
public enum LanguageEnum {

    /** 中文。 */
    CHINESE(0, "中文"),
    /** 英语。 */
    ENGLISH(1, "英语");

    private final Integer code;
    private final String info;

    /** 判断语言码是否有效。 */
    public static boolean isValid(Integer code) {
        for (LanguageEnum language : values()) {
            if (language.code.equals(code)) {
                return true;
            }
        }
        return false;
    }
}
