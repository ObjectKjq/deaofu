package com.deaofu.model.vo;

import com.deaofu.enums.CountryEnum;
import lombok.Data;

/**
 * 国家字典出参。
 *
 * <p>仅暴露前端需要的字段：ISO 代码、中英文名称、SVG 坐标。
 * 坐标便于后台世界地图点位配置时使用，业务运输路线不需要坐标。</p>
 */
@Data
public class CountryVo {

    /** ISO 3166-1 alpha-2 国家代码（小写）。 */
    private String code;

    /** 中文显示名，例如 {@code 中国}。 */
    private String name;

    /** 英文显示名，例如 {@code China}。 */
    private String englishName;

    /** SVG X 坐标（像素，{@code viewBox 0 0 1200 460}）。可选，业务不使用坐标时可保持 {@code null}。 */
    private Integer x;

    /** SVG Y 坐标（像素）。 */
    private Integer y;

    /** 从枚举转换。 */
    public static CountryVo from(CountryEnum value) {
        CountryVo vo = new CountryVo();
        vo.setCode(value.getCode());
        vo.setName(value.getName());
        vo.setEnglishName(value.getEnglishName());
        vo.setX(value.getX());
        vo.setY(value.getY());
        return vo;
    }
}
