package com.deaofu.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.deaofu.common.BaseDo;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/** 动态标签实体，对应 {@code news_tag} 表。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("news_tag")
public class NewsTag extends BaseDo implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 动态标签主键ID，UUID，对应 {@code tag_id}。 */
    @TableId(value = "tag_id", type = IdType.ASSIGN_UUID)
    private String tagId;

    /** 动态标签名称，对应 {@code tag_name}。 */
    private String tagName;

    /** 标签图标二进制，对应 {@code icon_data}。 */
    private byte[] iconData;

    /** 标签图标MIME类型，对应 {@code icon_content_type}。 */
    private String iconContentType;
}
