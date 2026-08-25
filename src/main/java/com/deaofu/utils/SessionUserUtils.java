package com.deaofu.utils;

import com.deaofu.model.vo.UserSessionVo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/** 管理端登录用户 session 工具。 */
public final class SessionUserUtils {
    public static final String SESSION_USER_KEY = "DEAOFU_LOGIN_USER";

    private SessionUserUtils() {
    }

    public static void setCurrentUser(UserSessionVo user) {
        HttpServletRequest request = currentRequest();
        if (request != null) {
            request.getSession(true).setAttribute(SESSION_USER_KEY, user);
        }
    }

    // public static UserSessionVo getCurrentUser() {
    //     HttpServletRequest request = currentRequest();
    //     return request == null ? null : getCurrentUser(request);
    // }

    public static UserSessionVo getCurrentUser() {
        HttpServletRequest request = currentRequest();
        if (request == null) {
            return null;
        }
        HttpSession session = request.getSession(false);
        Object value = session == null ? null : session.getAttribute(SESSION_USER_KEY);
        return value instanceof UserSessionVo user ? user : null;
    }

    public static void logout() {
        HttpServletRequest request = currentRequest();
        if (request != null) {
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
        }
    }

    private static HttpServletRequest currentRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes == null ? null : attributes.getRequest();
    }
}
