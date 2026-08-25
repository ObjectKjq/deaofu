package com.deaofu.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.deaofu.common.BaseDo;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/** 咨询信息实体，对应 {@code consultation} 表。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("consultation")
public class Consultation extends BaseDo implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 咨询信息主键ID，UUID，对应 {@code consultation_id}。 */
    @TableId(value = "consultation_id", type = IdType.ASSIGN_UUID)
    private String consultationId;

    /** 咨询主题JSON数组，对应 {@code subjects}。 */
    private String subjects;

    /** 咨询内容，对应 {@code content}。 */
    private String content;

    /** 联系人姓名，对应 {@code contact_name}。 */
    private String contactName;

    /** 联系电话，对应 {@code phone}。 */
    private String phone;

    /** 联系邮箱，对应 {@code email}。 */
    private String email;
}
