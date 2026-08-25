package com.deaofu.handler;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import com.deaofu.model.vo.UserSessionVo;
import com.deaofu.utils.SessionUserUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * 通用参数填充实现类
 *
 * 如果没有显式的对通用参数进行赋值，这里会对通用参数进行填充、赋值
 *
 * @author kjq
 */
@Slf4j
@Component
public class DefaultDBFieldHandler implements MetaObjectHandler {

    /**
     * 数据属性名
     */
    public static final String FIELD_CREATE_TIME = "createTime";
    public static final String FIELD_UPDATE_TIME = "updateTime";
    public static final String FIELD_CREATE_USER = "createBy";
    public static final String FIELD_UPDATE_USER = "updateBy";


    @Override
    public void insertFill(MetaObject metaObject) {
        String userId = getCurrentUserId();
        this.strictInsertFill(metaObject, FIELD_CREATE_USER, String.class, userId);
        this.strictInsertFill(metaObject, FIELD_UPDATE_USER, String.class, userId);
        this.strictInsertFill(metaObject, FIELD_CREATE_TIME, Date.class, DateUtil.date());
        this.strictInsertFill(metaObject, FIELD_UPDATE_TIME, Date.class, DateUtil.date());
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, FIELD_UPDATE_USER, String.class, getCurrentUserId());
        this.strictUpdateFill(metaObject,FIELD_UPDATE_TIME, Date.class, DateUtil.date());
    }

    /** 从当前请求 session 读取操作人，非 HTTP 请求场景返回 null。 */
    private String getCurrentUserId() {
        UserSessionVo user = SessionUserUtils.getCurrentUser();
        return user == null ? null : user.getUserId();
    }
}

