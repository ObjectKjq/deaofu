package com.deaofu.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 管理端 Web MVC 配置。
 * <p>统一注册管理端页面登录态拦截器，页面 Controller 无需重复编写登录判断。
 */
@Configuration(proxyBeanMethods = false)
public class AdminWebMvcConfig implements WebMvcConfigurer {

    /**
     * 注册管理端页面鉴权拦截器。
     *
     * @param registry Spring MVC 拦截器注册器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new AdminAuthInterceptor()).addPathPatterns("/admin/**");
    }
}
