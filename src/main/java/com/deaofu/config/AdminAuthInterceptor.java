package com.deaofu.config;

import com.deaofu.model.vo.UserSessionVo;
import com.deaofu.utils.SessionUserUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 管理端页面登录态拦截器。
 * <p>浏览器直接访问管理页面且未登录时，统一跳转到登录页；接口请求继续交由
 * {@code AdminAuthAspect} 返回统一 JSON 错误，避免 AJAX 请求收到登录 HTML。
 */
@Slf4j
public class AdminAuthInterceptor implements HandlerInterceptor {

    private static final String LOGIN_PATH = "/admin/login";

    /**
     * 校验管理端页面访问权限。
     *
     * @param request 当前 HTTP 请求
     * @param response 当前 HTTP 响应
     * @param handler Spring MVC 处理器
     * @return 已登录或非页面请求返回 {@code true}；未登录页面请求重定向后返回 {@code false}
     * @throws Exception 响应重定向失败时抛出异常
     */
    @Override
    public boolean preHandle(@NonNull HttpServletRequest request,
                             @NonNull HttpServletResponse response,
                             @NonNull Object handler) throws Exception {
        if (!isBrowserPageRequest(request) || isLoggedIn(request)) {
            return true;
        }
        log.info("管理端页面未登录，跳转登录页：uri={}", request.getRequestURI());
        response.sendRedirect(request.getContextPath() + LOGIN_PATH);
        return false;
    }

    /**
     * 判断请求是否为需要页面跳转的浏览器请求。
     *
     * @param request 当前 HTTP 请求
     * @return 直接访问管理页面时返回 {@code true}
     */
    private boolean isBrowserPageRequest(HttpServletRequest request) {
        if (!"GET".equalsIgnoreCase(request.getMethod())) {
            return false;
        }
        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();
        String path = uri.substring(Math.min(uri.length(), contextPath.length()));
        if (LOGIN_PATH.equals(path) || path.startsWith("/admin/auth/")) {
            return false;
        }
        String accept = request.getHeader("Accept");
        return accept != null && accept.contains("text/html");
    }

    /**
     * 判断当前 Session 是否保存了登录用户。
     *
     * @param request 当前 HTTP 请求
     * @return 已登录返回 {@code true}
     */
    private boolean isLoggedIn(HttpServletRequest request) {
        UserSessionVo currentUser = SessionUserUtils.getCurrentUser();
        return currentUser != null;
    }
}
