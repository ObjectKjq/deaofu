package com.deaofu.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.deaofu.common.BaseDo;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/** 合作企业实体，对应 {@code partner_company} 表。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("partner_company")
public class PartnerCompany extends BaseDo implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 合作企业主键ID，UUID，对应 {@code partner_id}。 */
    @TableId(value = "partner_id", type = IdType.ASSIGN_UUID)
    private String partnerId;

    /** 企业Logo在 {@code sys_file.access_name} 中的访问文件名。 */
    private String logoAccessName;

    /** 企业名称，对应 {@code company_name}。 */
    private String companyName;
}
