package com.deaofu.aop;

import com.deaofu.common.ErrorCode;
import com.deaofu.exception.BusinessException;
import com.deaofu.model.vo.UserSessionVo;
import com.deaofu.utils.SessionUserUtils;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

/**
 * 管理端 Controller 登录态校验 AOP。
 * <p>拦截 `com.deaofu.controller.admin` 包及其子包下所有 Controller 方法，
 * 在执行业务前校验当前 HTTP Session 中是否存在登录用户；
 * 未登录时直接抛出 `BusinessException(ErrorCode.NOT_LOGIN_ERROR)`，
 * 由 `GlobalExceptionHandler` 统一转换为 `BaseResponse` JSON 响应；浏览器直接访问页面时，
 * 由 `AdminAuthInterceptor` 在进入 Controller 前统一重定向到登录页。
 *
 * <p>白名单方法（直接放行，不做登录态校验）：
 * <ul>
 *     <li>`AuthController#login` —— 登录接口本身，登录前必须可访问</li>
 *     <li>`AdminPageController#loginPage` —— 管理后台登录页，登录前必须可访问</li>
 *     <li>`SysFileController#preview` —— 文件预览接口（如邮件、富文本中嵌入的图片 / 附件链接，
 *         需在未登录场景下也能被访问）</li>
 * </ul>
 *
 * <p>新增白名单方法时，仅需在本类的 `adminAuthPointcut` 中追加对应 `!execution(...)` 规则即可。
 *
 * @author deaofu
 */
@Slf4j
@Aspect
@Component
public class AdminAuthAspect {

    /**
     * 切点：管理端 Controller 包下所有方法，排除登录接口、登录页面与文件预览三个白名单方法。
     * <p>语法说明：
     * <ul>
     *     <li>`within(com.deaofu.controller.admin..*)` —— 匹配该包及其任意子包下的所有方法</li>
     *     <li>`!execution(* com.deaofu.controller.admin.AuthController.login(..))` —— 排除登录方法</li>
     *     <li>`!execution(* com.deaofu.controller.admin.SysFileController.preview(..))` —— 排除文件预览方法</li>
     * </ul>
     */
    @Pointcut("within(com.deaofu.controller.admin..*) "
            + "&& !execution(* com.deaofu.controller.admin.AuthController.login(..)) "
            + "&& !execution(* com.deaofu.controller.admin.AdminPageController.loginPage(..)) "
            + "&& !execution(* com.deaofu.controller.admin.SysFileController.preview(..))")
    public void adminAuthPointcut() {
    }

    /**
     * 环绕通知：在目标方法执行前校验登录态，未登录抛出业务异常中断执行。
     *
     * @param joinPoint 切点对象
     * @return 目标方法的返回值
     * @throws Throwable 目标方法自身抛出的异常，或未登录时由本切面抛出的 `BusinessException`
     */
    @Around("adminAuthPointcut()")
    public Object checkLogin(ProceedingJoinPoint joinPoint) throws Throwable {
        // 1. 从 HTTP Session 中读取当前登录用户（已脱敏的 UserSessionVo）
        UserSessionVo currentUser = SessionUserUtils.getCurrentUser();
        // 2. 未登录：记录告警日志后抛出业务异常，由 GlobalExceptionHandler 统一处理
        if (currentUser == null) {
            log.warn("管理端接口未登录拦截：method={}", joinPoint.getSignature().toShortString());
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }
        // 3. 已登录：放行执行原方法
        return joinPoint.proceed();
    }
}
