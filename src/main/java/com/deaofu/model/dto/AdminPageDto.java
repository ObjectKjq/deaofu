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

    /** 当前页码，从1开始。 */
    @Min(value = 1, message = "页码不能小于1")
    private Integer pageNum = 1;

    /** 每页数量，最大100条。 */
    @Min(value = 1, message = "每页数量不能小于1")
    @Max(value = 100, message = "每页数量不能超过100")
    private Integer pageSize = 10;

    /** 模糊搜索关键字，各模块按标题、名称、地址或联系人匹配。 */
    private String keyword;

    /** 产品分类筛选ID，仅产品分页使用。 */
    private String categoryId;

    /** 动态标签筛选ID，仅公司动态分页使用。 */
    private String tagId;
}
