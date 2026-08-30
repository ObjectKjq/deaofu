package com.deaofu.model.vo;

import lombok.Data;

/** 官网首页合作企业 Logo 墙出参。 */
@Data
public class PortalPartnerVo {

    /** 合作企业ID。 */
    private String partnerId;

    /** 合作企业名称，同时用作 Logo 图片的 alt 文案。 */
    private String companyName;

    /** Logo 图片公开访问地址，形如 {@code /files/{accessName}}。 */
    private String logoUrl;
}
