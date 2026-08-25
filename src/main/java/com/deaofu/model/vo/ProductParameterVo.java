package com.deaofu.model.vo;

import lombok.Data;

/** 产品参数项出参。 */
@Data
public class ProductParameterVo {
    /** 参数名称。 */
    private String label;
    /** 参数值。 */
    private String value;
}
