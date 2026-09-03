package com.deaofu.config;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.CookieLocaleResolver;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;

/**
 * 官网前台国际化配置。
 *
 * <p>仅针对前台模板（{@code /}、{@code /products}、{@code /news} 等）开启中英文切换，
 * 后台管理（{@code /admin/**}）维持中文不变，登录态校验仍由
 * {@link AdminAuthInterceptor} 负责。
 *
 * <p>默认语言为英文（{@link Locale#US}）；用户在浏览器端首次访问会拿到英文，
 * 点击导航栏 &quot;中 / EN&quot; 链接即可在英文 / 中文之间切换，切换结果写入 cookie，
 * 下次访问自动恢复上次选择。
 *
 * <p>切换 URL 示例：{@code https://deaofu.com/?lang=zh_CN} 或
 * {@code https://deaofu.com/products?lang=en}，由 {@link LocaleChangeInterceptor}
 * 解析。
 *
 * @author kjq
 */
@Configuration(proxyBeanMethods = false)
public class I18nConfig implements WebMvcConfigurer {

    /** 持久化语言偏好的 cookie 名称。 */
    public static final String LOCALE_COOKIE_NAME = "DEAOFU_LOCALE";

    /** 语言切换 URL 参数名。 */
    public static final String LANG_PARAM = "lang";

    /** 英文 cookie 值（与 {@link Locale#US} 对应）。 */
    public static final String LANG_EN = "en";

    /** 中文 cookie 值（与 {@link Locale#SIMPLIFIED_CHINESE} 对应）。 */
    public static final String LANG_ZH = "zh_CN";

    /**
     * 国际化资源加载器（UTF-8，避免中文乱码）。
     *
     * @return MessageSource
     */
    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource source = new ReloadableResourceBundleMessageSource();
        source.setBasename("classpath:i18n/messages");
        source.setDefaultEncoding(StandardCharsets.UTF_8.name());
        source.setFallbackToSystemLocale(false);
        source.setUseCodeAsDefaultMessage(true);
        // 缓存 60 秒：本地开发热加载生效；生产环境几乎无开销
        source.setCacheSeconds(60);
        return source;
    }

    /**
     * 语言解析器：基于 cookie 持久化用户偏好，默认英文（en）。
     *
     * @return LocaleResolver
     */
    @Bean
    public LocaleResolver localeResolver() {
        CookieLocaleResolver resolver = new CookieLocaleResolver(LOCALE_COOKIE_NAME);
        resolver.setDefaultLocale(Locale.US);
        resolver.setCookieMaxAge(60 * 60 * 24 * 365);
        // 仅匹配语言（zh / en），忽略地区变体
        resolver.setLanguageTagCompliant(true);
        return resolver;
    }

    /**
     * 语言切换拦截器：监听 {@code ?lang=} 参数并写回 cookie。
     *
     * @return LocaleChangeInterceptor
     */
    @Bean
    public LocaleChangeInterceptor localeChangeInterceptor() {
        LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
        interceptor.setParamName(LANG_PARAM);
        return interceptor;
    }

    /**
     * 注册语言切换拦截器，仅作用于前台路径；后台 {@code /admin/**} 不参与国际化。
     *
     * <p>此处拦截所有请求路径，仅排除后台管理相关路由（管理端的拦截器单独维护，
     * 互不干扰）。portal 静态资源、portal API 上执行 preHandle 几乎没有开销。
     *
     * @param registry Spring MVC 拦截器注册器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(localeChangeInterceptor())
                .addPathPatterns("/**")
                .excludePathPatterns("/admin/**");
    }
}
