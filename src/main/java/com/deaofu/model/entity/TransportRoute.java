package com.deaofu.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.deaofu.common.BaseDo;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/** 运输线路实体，对应 {@code transport_route} 表。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("transport_route")
public class TransportRoute extends BaseDo implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 运输线路主键ID，UUID，对应 {@code route_id}。 */
    @TableId(value = "route_id", type = IdType.ASSIGN_UUID)
    private String routeId;

    /** 源地址，对应 {@code source_address}。 */
    private String sourceAddress;

    /** 目标地址，对应 {@code target_address}。 */
    private String targetAddress;
}
