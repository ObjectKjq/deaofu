# DEAOFU Backend

基于 Spring Boot 3、JDK 17、MyBatis-Plus、Thymeleaf、Layui 2.13 与 GSAP 的德奥福官网及管理后台。

## 环境

- JDK 17+
- Maven 3.9+
- MySQL 8+

## 用户名密码

```json
{
    "username": "admin",
    "password": "ax./sx762"
}
```

## 初始化与访问

1. 在 MySQL 8+ 中创建 `deaofu` 数据库。
2. 按文件名顺序执行 `db/` 下 SQL：
   - `20260824000100_file_storage_and_user.sql`
   - `20260825165300_insert_sys_user.sql`
   - `20260825230000_admin_content.sql`
3. 按需通过 `DB_URL / DB_USERNAME / DB_PASSWORD` 覆盖数据源配置。
4. 启动后访问 `http://localhost:8080/admin/login`。

管理后台覆盖产品、产品分类、运输线路、合作企业、公司动态、动态标签及咨询信息管理。业务静态资源位于 `src/main/resources/static/admin`，页面模板位于 `src/main/resources/templates/admin`。












