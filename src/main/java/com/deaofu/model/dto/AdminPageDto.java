package com.deaofu.model.dto;

import com.deaofu.common.PageDomain;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** 管理后台通用分页查询入参。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class AdminPageDto extends PageDomain {

    /** 模糊搜索关键字，各模块按标题、名称、地址或联系人匹配。 */
    private String keyword;

    /** 产品分类筛选ID，仅产品分页使用。 */
    private String categoryId;

    /** 动态标签筛选ID，仅公司动态分页使用。 */
    private String tagId;

    /** 首页展示筛选：1表示首页展示内容，0表示普通内容，空表示全部。 */
    private Integer homeShow;

    /** 内容语言：0表示中文，1表示英语，空表示全部语言。 */
    @Min(value = 0, message = "语言标识只能为0或1")
    @Max(value = 1, message = "语言标识只能为0或1")
    private Integer language;
}
