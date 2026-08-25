package com.deaofu.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MyBatis-Plus 配置。
 *
 * @author deaofu
 */
@Configuration(proxyBeanMethods = false)
@MapperScan("com.deaofu.mapper")
public class MybatisPlusConfig {

    /**
     * 注册 MySQL 分页拦截器。
     *
     * @return MyBatis-Plus 插件拦截器
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // 显式指定 MySQL 方言，避免分页 SQL 在不同数据库下生成不一致。
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
