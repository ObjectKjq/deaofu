## 1. 项目概述

- **项目名称**：deaofu（backend）
- **业务背景**：德奥福（DEAOFU）汽车玻璃有限公司官方网站与企业业务后端骨架。公司主营产品为商用 / 工业车辆层压挡风玻璃（公交玻璃、长途汽车玻璃、卡车玻璃等），同时覆盖车辆照明灯具、制动与缓速系统配件、发动机及动力系统配件等汽车配件产品。
- **业务目标**：
  - 对外展示首页，关于我们、产品中心、公司动态、联系我们等页面（`controller/portal`）。
  - 对内提供后台管理能力（`controller/admin`），用于维护产品（一二级菜单维护） / 世界地图销售点位（有源地点-目标地点） / 公司动态（标签维护） / 客户 logo / 资质证书 / 咨询消息等内容。
- **目标用户**：
  - 公交车 / 长途客车制造商（OEM 客户）。
  - 公交零部件分销商。
  - 海外采购方（覆盖欧洲、南美、亚洲等地区）。
- **项目形态**：基于 Spring Boot 3 的**单模块 Maven 项目**（`pom.xml` 中 `artifactId=deaofu`），目前 `controller/admin`、`controller/portal`、`model/{dto,entity,vo}`、`mapper`、`service/impl` 已预留目录但尚无业务代码。

### 关键依赖概览（详见 `pom.xml`）

| 组件         | 版本 / 说明                                                          |
| ------------ | -------------------------------------------------------------------- |
| JDK          | 17+                                                                  |
| Spring Boot  | 3.3.5                                                                |
| MyBatis-Plus | 3.5.9（`mybatis-plus-spring-boot3-starter`）                         |
| Thymeleaf    | 由 Spring Boot Starter 提供，模板位于 `src/main/resources/templates` |
| MySQL 驱动   | `mysql-connector-j`（runtime）                                       |
| Lombok       | 1.18.34（provided + Spring Boot Maven Plugin 已 exclude）            |
| Hutool       | 5.8.32（`hutool-all`）                                               |
| Gson         | 2.11.0                                                               |
| Validation   | `spring-boot-starter-validation`                                     |

---

## 2. 目录结构

```
deaofu/
├── pom.xml                                    # Maven 配置（Spring Boot 3 / JDK 17）
├── prototype/                                 # 官网原型图
├── README.md                                  # 项目快速上手说明
├── AGENTS.md                                  # 本文件（AI Agent 协作指南）
├── db/
├── src/
│   └── main/
│       ├── java/com/deaofu/
│       │   ├── BackendApplication.java        # SpringBoot 启动类
│       │   ├── common/                        # 通用响应、分页、错误码
│       │   │   ├── BaseResponse.java
│       │   │   ├── ErrorCode.java
│       │   │   ├── ResultUtils.java
│       │   │   ├── PageDomain.java
│       │   │   ├── BaseDo.java
│       │   │   └── PageResult.java
│       │   ├── config/                        # 配置类（WebMvc / MyBatisPlus / Cors 等）
│       │   ├── constants/                     # 业务常量
│       │   ├── enums/                         # 业务枚举
│       │   ├── exception/
│       │   │   └── GlobalExceptionHandler.java # @RestControllerAdvice 全局异常，当有业务相关异常直接抛出RuntimeException
│       │   ├── handler/
│       │   │   └── DefaultDBFieldHandler.java # MyBatis-plus 自动填充配置
│       │   ├── controller/
│       │   │   ├── admin/                     # 后台管理相关接口（路由前缀 /admin/**）
│       │   │   └── portal/                    # 前台官网相关接口（路由前缀 /**）
│       │   ├── mapper/                        # MyBatis-Plus BaseMapper 接口
│       │   ├── model/
│       │   │   ├── dto/                       # 入参对象（请求体 / 查询条件）
│       │   │   ├── entity/                    # 数据库实体（与表结构一一对应）
│       │   │   └── vo/                        # 出参对象（视图 / API 响应）
│       │   ├── service/                       # Service 接口
│       │   │   └── impl/                      # Service 实现
│       │   └── utils/
│       │       └── GsonUtils.java             # JSON 序列化工具（线程安全）
│       └── resources/
│           ├── application.yml                # 数据源、MyBatis-Plus、Thymeleaf 配置
│           ├── i18n/                          # （预留）国际化资源，后续再加
│           └── templates/
│               ├── admin/                     # （预留）后台页 Thymeleaf 模板
│               └── portal/                    # （预留）官网前台页 Thymeleaf 模板
└── .gitignore
```

### 包命名约定

- 根包：`com.deaofu`。
- 子包遵循职责切分：`common / config / constants / enums / exception / controller / mapper / model / service / utils`。
- `controller` 进一步按访问角色拆分为 `admin` 与 `portal` 两个子包。
- `model` 进一步按数据流向拆分为 `dto`（入参：如*PageDto，*UpdateDto， \*CreateDto）、`entity`（持久化）、`vo`（出参）。

---

## 3. 技术栈

### 后端

- **语言**：Java 17（启用 Records、Text Blocks、`sealed` 等特性时可放心使用）。
- **Web 框架**：Spring Boot 3.3.5（`spring-boot-starter-web`），基于 Spring 6 / Jakarta EE 9+。
  - 注解全部来自 `jakarta.*`，**不要**使用旧的 `javax.*`。
- **ORM / 持久层**：MyBatis-Plus 3.5.9。
  - 全局开启 `map-underscore-to-camel-case: true`（见 `application.yml`）。
  - 主键策略：`id-type: ASSIGN_UUID`（使用UUID）。
  - 通过 `@TableName`、`@TableId`、`@TableField` 等注解管理映射。
- **校验**：`spring-boot-starter-validation`（Jakarta Bean Validation）。
- **模板引擎**：Thymeleaf（`spring-boot-starter-thymeleaf`），开发期 `thymeleaf.cache: false`。
- **工具库**：
  - **Hutool**：`cn.hutool.core.util.*`、`cn.hutool.json.*` 等。
  - **Gson**：JSON 序列化统一走 `com.deaofu.utils.GsonUtils`（日期格式 `yyyy-MM-dd HH:mm:ss`，禁用 HTML 转义、输出 null）。
  - **Lombok**：编译期生成 `getter / setter / builder / toString` 等。
- **日志**：Spring Boot 默认 Logback；类级别日志使用 `@Slf4j`。

### 前端

`templates/admin`存放后端管理html模板，`templates/portal`存放官网前端模板。

- 纯HTML + CSS +JS开发
- 管理后台使用**layui‑2.13.x**组件库搭建后台管理系统
- 官网前台完全复刻`prototype`目标下的原型图，不使用组件库开发。
- gsap：作为整体项目的动画库。

---

## 4. 代码规范

### 4.1 通用原则

1. **保持现有风格**：在新增任何文件之前，先阅读 `common/`、`exception/`、`utils/` 下的代码，沿用其风格。
2. **状态/类型规范**：状态和类型字段需要在`enums`定义枚举。

```java
/**
 * 字典状态
 *
 * @author kjq
 */
@Getter
@AllArgsConstructor
public enum DictStatus
{

    ENABLE("0", "启动"),
    DISABLED("1", "禁用");

    private final String code;
    private final String info;

    /**
     * 根据code获取对应描述
     * @param code 编码
     * @return 对应info，不存在返回null
     */
    public static String getInfoByCode(String code) {
        for (DictStatus status : values()) {
            if (status.getCode().equals(code)) {
                return status.getInfo();
            }
        }
        return null;
    }

}
```

3. **单一职责**：每个类只做一件事；分层严格 —— Controller 只编排，Service 承载业务，Mapper 只做持久化。
4. **不引入未在 `pom.xml` 中声明的依赖**：如确需新增，必须在 `pom.xml` 中显式声明版本号，并在 PR 描述中说明理由。
5. **JDK 17 兼容**：避免使用预览特性（除非通过 `--enable-preview` 显式开启）。
6. **优先使用 jakarta 包**，不使用 javax 包。
7. **中文优先**：注释、错误信息、日志面向中文用户，统一使用中文；标识符使用英文。
8. **强制注释**：所有 model（entity/dto/vo）字段、controller / service / mapper 的方法 **必须** 写 JavaDoc 注释；详见 [§4.10](#410-代码注释与字典枚举强制要求)。
9. **判空和判断相等**：使用hutool进行判断字符串，对象等是否为空，使用hutool判断两个字符串或者是对象是否相等。
10. **依赖注入**：统一使用构造函数的方式 + 使用 `@RequiredArgsConstructor` 配合 `final` 字段

### 4.2 包与命名

- **包名**：全小写，名词单数，例如 `controller/admin`、`model/dto`。
- **类名**：
  - Controller：`XxxController`（接口加 `@RestController` 或 `@Controller`）。
  - Service：`IXxxService`（接口）+ `XxxServiceImpl`（实现）。
  - Mapper：`XxxMapper`，继承 `BaseMapper<XxxEntity>`。
  - Entity：`Xxx`，与表名保持一致，如果有逻辑删除实体类需要集成`com/deaofu/common/BaseDo.java`类，`com/deaofu/handler/DefaultDBFieldHandler.java`统一赋值。
  - DTO：`XxxDto`，与具体接口语义对齐。
  - VO：`XxxVo`，用于视图层或 API 返回。
  - 枚举：名词或形容词短语，例如 `ErrorCode`。
- **方法名**：动词或动宾短语（`getXxx` / `listXxx` / `addXxx` / `updateXxx` / `deleteXxx` / `pageXxx`）。
- **常量**：全大写 + 下划线；定义在 `constants/` 包下，按模块命名，例如 `UserConstants.DEFAULT_AVATAR`。

### 4.3 注解与 Lombok

- **实体类**：使用 `@Data` + `@TableName("xxx")`；主键字段 `@TableId(type = IdType.ASSIGN_UUID)`；非表字段用 `@TableField(exist = false)`。
- **服务实现类**：使用 `@Service` + `@Slf4j`，按需 `@Transactional(rollbackFor = Exception.class)`。
- **控制器**：使用 `@RestController`（返回 JSON）或 `@Controller`（返回 Thymeleaf 视图）；请求路径使用 `@RequestMapping("/xxx")` 显式声明，不依赖类级默认值以外的隐式路径。
- **Lombok**：
  - POJO / Entity 优先 `@Data`。
  - 枚举（携带字段的）使用 `@Getter` + `@AllArgsConstructor`。
  - 构造器过多时使用 `@Builder`；禁止滥用 `@EqualsAndHashCode` / `@ToString` 在含懒加载字段的实体上。
- **日志**：使用 `@Slf4j` + `log.info / log.warn / log.error`，**不要**使用 `System.out.println`。

### 4.4 响应封装

> 使用`thymeleaf`渲染页面接口

- 渲染页面接口不需要进行`BaseResponse<T>`封装，如果是分页数据需要进行`PageResult<T>`封装。

> 所有对外 JSON 接口必须通过 `com.deaofu.common` 下的统一结构返回：

```java
// 成功
return ResultUtils.success(data);

// 失败（按业务错误码）
return ResultUtils.error(ErrorCode.PARAMS_ERROR, "用户名校验失败");
```

- `BaseResponse<T>`：包含 `code / data / message`。
- `ResultUtils`：仅暴露 `success(T)` 与 `error(ErrorCode[, String])`。
- 分页结果统一封装为 `PageResult<T>`（含 `total / list`），与 `PageDomain`（入参分页对象）配合使用；`jsqlparser`作为分页插。

### 4.5 异常处理

- 业务异常直接抛出，由 `GlobalExceptionHandler` 统一捕获并转换为 `BaseResponse`。
- 新增业务异常时：
  - 在 `ErrorCode` 中新增枚举项（**不要**硬编码错误码字符串）。
  - 必要时自定义 `XxxException extends RuntimeException` 并在 `GlobalExceptionHandler` 中追加 `@ExceptionHandler`。
- 控制器层**不要**使用 `try-catch` 吞掉异常后再返回响应；只在需要"降级 / 兜底"语义时才捕获。

### 4.6 校验与入参

- 控制器方法参数使用 Bean Validation 注解（`@NotNull` / `@NotBlank` / `@Size` / `@Min` / `@Max` 等），并在类或方法上标注 `@Valid`。
- 校验失败抛 `MethodArgumentNotValidException` / `ConstraintViolationException`，由 `GlobalExceptionHandler` 统一处理（必要时扩展）。

### 4.7 持久层

- **Mapper 接口**：继承 `BaseMapper<Entity>`；复杂查询使用 XML 或 `@Select` 注解，明确命名空间与列名。
- **Service 实现**：组合条件构造器 `LambdaQueryWrapper` / `LambdaUpdateWrapper`，**避免**在 Controller 中直接调用 Mapper。
- **事务边界**：写操作集中在 `XxxServiceImpl` 上，配合 `@Transactional(rollbackFor = Exception.class)`。
- **软删除 / 审计字段**：表如带 `delFlag`、`createBy`、`updateBy`、`createTime`、`updateTime`，统一在 `com/deaofu/handler/DefaultDBFieldHandler.java` 中配置自动填充策略；`com/deaofu/common/BaseDo.java`公共的字段有逻辑删除表的实体类继承。

### 4.8 模板与静态资源

- Thymeleaf 模板统一放在 `src/main/resources/templates/{admin,portal}/...`。
- 静态前端资源（公司展示站）放在 `frontend/`，**不**通过 Spring Boot 托管，除非有明确需求接入。
- 模板中变量命名与 `model.vo` 保持一致；时间字段使用 `${#temporals.format(xxx, 'yyyy-MM-dd HH:mm:ss')}`。

### 4.9 登录

- `com/deaofu/controller/admin/SysUserController.java`是登录，退出登录和获取用户信息相关接口。
- `com/deaofu/utils/SessionUserUtils.java`获取用户信息相关代码
- 后端使用session保存登录用户信息，只有管理后台需要登录才能访问，官网前台不需要登录。
- 密码以密文方式存储到服务器，使用`hutool`的BCrypt进行加密。

---

### 4.10 代码注释与字典枚举强制要求

> ⚠️ **强制项**：以下条款为不可妥协的硬性要求，新建/修改任何代码都须遵守，
> Code Review 阶段必须按本节逐条核查。

#### 4.10.1 代码注释强制要求

| 层                                          | 强制内容                                                                                                                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model/entity/*`                            | 每个字段（**包括继承自 `BaseDo` 的字段以外的全部业务字段**）**必须** 写 JavaDoc `/** */`，说明字段含义、单位、取值范围、与数据库列的对应关系；与枚举关联的字段需 `@link` 到对应枚举。 |
| `model/dto/*`                               | 每个入参字段 **必须** 写 JavaDoc，说明业务语义；Bean Validation 注解（`@NotBlank` 等）的 `message` **必须** 用中文且可读。                                                            |
| `model/vo/*`                                | 每个出参字段 **必须** 写 JavaDoc，说明字段含义、单位、时间格式；时间字段需注明使用 `yyyy-MM-dd HH:mm:ss`。                                                                            |
| `controller/admin/*`、`controller/portal/*` | 每个对外方法（页面跳转 + JSON 接口）**必须** 写 JavaDoc，包含 HTTP 方法、请求路径语义、入参说明、返回结构与异常场景。                                                                 |
| `service/IXxxService`                       | 每个业务方法 **必须** 写 JavaDoc，说明业务目的、入参约束、返回值、可能抛出的业务异常。                                                                                                |
| `service/impl/XxxServiceImpl`               | 如果接口中存在了JavaDoc这里就不需要加JavaDoc，对私有方法可以加JavaDoc                                                                                                                 |
| `mapper/XxxMapper` 接口 + XML               | 每个自定义方法 **必须** 写 JavaDoc，说明查询目的与返回结构；XML 中每个 `<select>` / `<insert>` / `<update>` / `<delete>` 节点必须保留 `resultMap` 与列名对应说明。                    |

**反例（禁止）**：

```java
private String userId;       // ❌ 缺少 JavaDoc
private Long fileSize;       // ❌ 缺少 JavaDoc

public void login() { ... }   // ❌ 缺少 JavaDoc
```

**正例（要求）**：

```java
/** 用户主键ID，UUID。 */
private String userId;

/**
 * 校验用户名/密码并写入 HTTP Session。
 *
 * @param dto 登录入参
 * @return 脱敏 session 用户信息
 * @throws com.deaofu.exception.BusinessException 用户名或密码错误
 */
public UserSessionVo login(LoginDto dto) { ... }
```

#### 4.10.2 字典枚举强制要求

- **通用字段**：所有业务表中的 `status`（启用/禁用）、`del_flag`（存在/删除）字段 **必须** 在 `src/main/java/com/deaofu/enums/` 包下定义枚举，禁止魔法字符串：
  - `status` → `com.deaofu.enums.StatusEnum`（`ENABLE("0","启用")`、`DISABLED("1","禁用")`）。
  - `del_flag` → `com.deaofu.enums.DelFlagEnum`（`EXISTS("0","存在")`、`DELETED("1","删除")`）。
- **新增字典字段**：每当业务表新增 `char(1)` 类型的状态/类型字段，**必须** 同步新增 `XxxEnum`。
- **使用方式**：
  - 业务代码中判断状态时，**必须** 使用枚举静态方法，例如 `StatusEnum.isEnabled(user.getStatus())`，禁止直接出现 `"0".equals(user.getStatus())` 这类魔法字符串。
  - Entity 字段类型视情况选择 `String`（与数据库 `char(1)` 一一对应，便于 MyBatis-Plus `@TableLogic` 解析）或枚举类型；选枚举类型时需在枚举的 `code` 字段上加 `@EnumValue`，并在 `application.yml` 配置 `mybatis-plus.type-handlers-package` 或使用 `@TableField(typeHandler=...)`。
  - VO/DTO 暴露给前端的"中文描述"字段，**必须** 调用枚举的 `getInfoByCode(code)` 转换，避免前端自行判别。

#### 4.10.3 字典枚举反例（禁止）

```java
// ❌ 魔法字符串
if ("0".equals(user.getStatus())) { ... }
if ("1".equals(entity.getDelFlag())) { ... }

// ❌ 新增状态字段却没建枚举
public static final String STATUS_OK = "0";   // 应改用 StatusEnum.ENABLE
```

#### 4.10.4 字典枚举正例（要求）

```java
import com.deaofu.enums.StatusEnum;

if (StatusEnum.isEnabled(user.getStatus())) { ... }
String statusText = StatusEnum.getInfoByCode(user.getStatus());   // 暴露给前端："启用"
```

---

### 4.11 管理端 Controller 接口索引（全局参考）

> 后台管理前缀（`controller/admin`）下所有已实现 Controller 的对外 REST 接口清单，
> 用于跨模块协作 / 前端对接 / 联调时的快速查阅。
>
> **维护约定**：任何新增 / 修改 / 删除 `controller/admin/**` 接口时，
> **必须** 同步更新本节对应小节，不得遗漏。
>
> **登录态说明**：本节所有接口默认走 `AdminAuthAspect`（位于 `com/deaofu/aop/AdminAuthAspect.java`），
> 未登录将抛 `BusinessException(NOT_LOGIN_ERROR)`。已在 AOP 切点中白名单放行的方法见各小节"白名单"列。

#### 4.11.1 认证模块 — `AuthController`

**类路径**：`src/main/java/com/deaofu/controller/admin/AuthController.java`
**基础路径**：`/admin/auth`
**依赖**：`ISysUserService`；登录态写入 HTTP Session，key = `SessionUserUtils.SESSION_USER_KEY` = `"DEAOFU_LOGIN_USER"`

| 方法   | 路径                 | 说明                                      | 入参                                            | 响应                          | 白名单 |
| ------ | -------------------- | ----------------------------------------- | ----------------------------------------------- | ----------------------------- | ------ |
| `POST` | `/admin/auth/login`  | 账号密码登录；成功后写入 Session          | `@Valid @RequestBody LoginDto`（用户名 + 密码） | `BaseResponse<UserSessionVo>` | ✅     |
| `POST` | `/admin/auth/logout` | 销毁当前 Session                          | 无                                              | `BaseResponse<Boolean>`       | ❌     |
| `GET`  | `/admin/auth/me`     | 获取当前登录用户；未登录返回 `data: null` | 无                                              | `BaseResponse<UserSessionVo>` | ❌     |

**注意事项**：

- 密码以密文存储，校验使用 `cn.hutool.crypto.digest.BCrypt`；详见 §4.9。
- `/me` 接口在未登录时不会抛异常，而是返回 `data: null`，由前端自行决定是否跳转登录页。

#### 4.11.2 文件存储模块 — `SysFileController`

**类路径**：`src/main/java/com/deaofu/controller/admin/SysFileController.java`
**基础路径**：`/admin/sys-file`
**依赖**：`ISysFileService`；文件二进制直接存放在数据库（`sys_file.file_data`），不落盘

| 方法     | 路径                                   | 说明                                     | 入参                                                 | 响应                                            | 白名单 |
| -------- | -------------------------------------- | ---------------------------------------- | ---------------------------------------------------- | ----------------------------------------------- | ------ |
| `POST`   | `/admin/sys-file/upload`               | 上传文件；返回元信息，不返回二进制       | `multipart/form-data` 字段 `file`（`MultipartFile`） | `BaseResponse<FileUploadVo>`                    | ❌     |
| `GET`    | `/admin/sys-file/preview/{accessName}` | 预览文件流；                             | 路径变量 `accessName`（文件存储名）                  | `ResponseEntity<ByteArrayResource>`（二进制流） | ✅     |
| `DELETE` | `/admin/sys-file/{fileId}`             | 物理删除（不可恢复）；不存在返回 `false` | 路径变量 `fileId`（文件主键）                        | `BaseResponse<Boolean>`                         | ❌     |

**注意事项**：

- 上传返回的 `FileUploadVo` 字段：`fileId / accessName / originalName / contentType / fileSize`。
- 下载响应头由 `org.springframework.http.ContentDisposition` 构造，文件名使用 UTF-8 编码（`StandardCharsets.UTF_8`）。
- 文件表 `sys_file` 走物理删除、**不**软删除 —— 见 §5.1「存储型 / 只读型表」基类选择速查表。
- `/preview` 接口白名单放行原因：允许在邮件 / 富文本编辑器等**未登录场景**嵌入访问。

> **文档同步说明**：§4.9 提及的 `controller/admin/SysUserController.java` 实际文件名为 `AuthController.java`（接口前缀 `/admin/auth`），
> 本节 §4.11.1 为当前最新接口清单。如未来 §4.9 描述变更，需同步更新本节以保持唯一权威来源。

#### 4.11.3 管理后台页面 — `AdminPageController`

**基础路径**：`/admin`

| 方法  | 路径                    | 说明                                                                                                         | 响应                                | 白名单 |
| ----- | ----------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------- | ------ |
| `GET` | `/admin/login`          | 登录页                                                                                                       | `admin/login`                       | ✅     |
| `GET` | `/admin`、`/admin/`     | 后台主框架                                                                                                   | `admin/index`                       | ❌     |
| `GET` | `/admin/pages/{module}` | 工作区模板；支持 `dashboard/forms/uploads/products/categories/routes/partners/news/tags/consultations/users` | `admin/dashboard` 或 `admin/module` | ❌     |

#### 4.11.4 仪表盘 — `AdminDashboardController`

| 方法  | 路径               | 说明                       | 响应                             | 白名单 |
| ----- | ------------------ | -------------------------- | -------------------------------- | ------ |
| `GET` | `/admin/dashboard` | 核心业务数量与最近五条咨询 | `BaseResponse<AdminDashboardVo>` | ❌     |

#### 4.11.5 产品 — `ProductController`

**基础路径**：`/admin/products`

| 方法     | 路径                          | 说明         | 入参                      | 响应                                  |
| -------- | ----------------------------- | ------------ | ------------------------- | ------------------------------------- |
| `GET`    | `/admin/products/page`        | 产品分页     | `AdminPageDto`            | `BaseResponse<PageResult<ProductVo>>` |
| `GET`    | `/admin/products/{productId}` | 产品详情     | 产品ID                    | `BaseResponse<ProductVo>`             |
| `POST`   | `/admin/products`             | 新增产品     | `ProductSaveDto`          | `BaseResponse<ProductVo>`             |
| `PUT`    | `/admin/products/{productId}` | 修改产品     | 产品ID + `ProductSaveDto` | `BaseResponse<ProductVo>`             |
| `DELETE` | `/admin/products/{productId}` | 逻辑删除产品 | 产品ID                    | `BaseResponse<Boolean>`               |

#### 4.11.6 产品分类 — `ProductCategoryController`

**基础路径**：`/admin/product-categories`

| 方法     | 路径                                     | 说明               | 入参                              | 响应                                    |
| -------- | ---------------------------------------- | ------------------ | --------------------------------- | --------------------------------------- |
| `GET`    | `/admin/product-categories`              | 查询全部一二级分类 | 无                                | `BaseResponse<List<ProductCategoryVo>>` |
| `GET`    | `/admin/product-categories/{categoryId}` | 分类详情           | 分类ID                            | `BaseResponse<ProductCategoryVo>`       |
| `POST`   | `/admin/product-categories`              | 新增分类           | `ProductCategorySaveDto`          | `BaseResponse<ProductCategoryVo>`       |
| `PUT`    | `/admin/product-categories/{categoryId}` | 修改分类           | 分类ID + `ProductCategorySaveDto` | `BaseResponse<ProductCategoryVo>`       |
| `DELETE` | `/admin/product-categories/{categoryId}` | 删除空分类         | 分类ID                            | `BaseResponse<Boolean>`                 |

#### 4.11.7 运输线路 — `TransportRouteController`

**基础路径**：`/admin/transport-routes`

| 方法     | 路径                                | 说明         | 入参                    | 响应                                         |
| -------- | ----------------------------------- | ------------ | ----------------------- | -------------------------------------------- |
| `GET`    | `/admin/transport-routes/page`      | 线路分页     | `AdminPageDto`          | `BaseResponse<PageResult<TransportRouteVo>>` |
| `GET`    | `/admin/transport-routes/{routeId}` | 线路详情     | 线路ID                  | `BaseResponse<TransportRouteVo>`             |
| `POST`   | `/admin/transport-routes`           | 新增线路     | `TransportRouteSaveDto` | `BaseResponse<TransportRouteVo>`             |
| `PUT`    | `/admin/transport-routes/{routeId}` | 修改线路     | 线路ID + DTO            | `BaseResponse<TransportRouteVo>`             |
| `DELETE` | `/admin/transport-routes/{routeId}` | 逻辑删除线路 | 线路ID                  | `BaseResponse<Boolean>`                      |

#### 4.11.7.1 国家字典 — `CountryController`

**类路径**：`src/main/java/com/deaofu/controller/admin/CountryController.java`
**基础路径**：`/admin/countries`
**依赖**：无；数据源为 `com.deaofu.enums.CountryEnum` 字典

| 方法  | 路径               | 说明                           | 入参 | 响应                            |
| ----- | ------------------ | ------------------------------ | ---- | ------------------------------- |
| `GET` | `/admin/countries` | 列出全部国家（仅 code + name） | 无   | `BaseResponse<List<CountryVo>>` |

**注意事项**：

- 本 Controller 位于 `controller.admin` 包下，由 `AdminAuthAspect` 自动校验管理端 Session 登录态。
- 返回字段：`code`（ISO 二字代码，用于持久化与下拉 value）+ `name`（中文名，用于下拉显示）。
- 主要消费方：运输路线编辑（始发地 / 目的地）、世界地图销售点位编辑（来源地 / 目标地）。

#### 4.11.8 合作企业 — `PartnerCompanyController`

**基础路径**：`/admin/partner-companies`

| 方法     | 路径                                   | 说明         | 入参                    | 响应                                         |
| -------- | -------------------------------------- | ------------ | ----------------------- | -------------------------------------------- |
| `GET`    | `/admin/partner-companies/page`        | 合作企业分页 | `AdminPageDto`          | `BaseResponse<PageResult<PartnerCompanyVo>>` |
| `GET`    | `/admin/partner-companies/{partnerId}` | 企业详情     | 企业ID                  | `BaseResponse<PartnerCompanyVo>`             |
| `POST`   | `/admin/partner-companies`             | 新增企业     | `PartnerCompanySaveDto` | `BaseResponse<PartnerCompanyVo>`             |
| `PUT`    | `/admin/partner-companies/{partnerId}` | 修改企业     | 企业ID + DTO            | `BaseResponse<PartnerCompanyVo>`             |
| `DELETE` | `/admin/partner-companies/{partnerId}` | 逻辑删除企业 | 企业ID                  | `BaseResponse<Boolean>`                      |

#### 4.11.9 公司动态 — `CompanyNewsController`

**基础路径**：`/admin/news`

| 方法     | 路径                   | 说明                   | 入参                 | 响应                                      |
| -------- | ---------------------- | ---------------------- | -------------------- | ----------------------------------------- |
| `GET`    | `/admin/news/page`     | 动态分页，可按标签筛选 | `AdminPageDto`       | `BaseResponse<PageResult<CompanyNewsVo>>` |
| `GET`    | `/admin/news/{newsId}` | 动态详情               | 动态ID               | `BaseResponse<CompanyNewsVo>`             |
| `POST`   | `/admin/news`          | 新增动态并保存标签关系 | `CompanyNewsSaveDto` | `BaseResponse<CompanyNewsVo>`             |
| `PUT`    | `/admin/news/{newsId}` | 修改动态并重建标签关系 | 动态ID + DTO         | `BaseResponse<CompanyNewsVo>`             |
| `DELETE` | `/admin/news/{newsId}` | 删除动态及标签关系     | 动态ID               | `BaseResponse<Boolean>`                   |

#### 4.11.10 动态标签 — `NewsTagController`

**基础路径**：`/admin/news-tags`

| 方法     | 路径                            | 说明                 | 入参             | 响应                                |
| -------- | ------------------------------- | -------------------- | ---------------- | ----------------------------------- |
| `GET`    | `/admin/news-tags`              | 查询全部标签         | 无               | `BaseResponse<List<NewsTagVo>>`     |
| `GET`    | `/admin/news-tags/{tagId}`      | 标签详情             | 标签ID           | `BaseResponse<NewsTagVo>`           |
| `GET`    | `/admin/news-tags/{tagId}/icon` | 标签图标二进制流     | 标签ID           | `ResponseEntity<ByteArrayResource>` |
| `POST`   | `/admin/news-tags`              | 新增标签及Base64图标 | `NewsTagSaveDto` | `BaseResponse<NewsTagVo>`           |
| `PUT`    | `/admin/news-tags/{tagId}`      | 修改标签             | 标签ID + DTO     | `BaseResponse<NewsTagVo>`           |
| `DELETE` | `/admin/news-tags/{tagId}`      | 删除未使用标签       | 标签ID           | `BaseResponse<Boolean>`             |

#### 4.11.11 用户管理 — `SysUserController`

**类路径**：`src/main/java/com/deaofu/controller/admin/SysUserController.java`
**基础路径**：`/admin/users`

| 方法     | 路径                             | 说明                                 | 入参                          | 响应                                  |
| -------- | -------------------------------- | ------------------------------------ | ----------------------------- | ------------------------------------- |
| `GET`    | `/admin/users/page`              | 用户分页，支持用户名或显示名称搜索   | `AdminPageDto`                | `BaseResponse<PageResult<SysUserVo>>` |
| `GET`    | `/admin/users/{userId}`          | 用户详情                             | 用户ID                        | `BaseResponse<SysUserVo>`             |
| `POST`   | `/admin/users`                   | 新增用户，密码使用 BCrypt 加密       | `SysUserSaveDto`              | `BaseResponse<SysUserVo>`             |
| `PUT`    | `/admin/users/{userId}`          | 修改用户基本信息，不修改密码         | 用户ID + `SysUserSaveDto`     | `BaseResponse<SysUserVo>`             |
| `PUT`    | `/admin/users/{userId}/password` | 修改用户密码，校验原密码及两次新密码 | 用户ID + `SysUserPasswordDto` | `BaseResponse<Boolean>`               |
| `DELETE` | `/admin/users/{userId}`          | 逻辑删除用户                         | 用户ID                        | `BaseResponse<Boolean>`               |

#### 4.11.12 咨询信息 — `ConsultationController`

**基础路径**：`/admin/consultations`

| 方法     | 路径                                    | 说明           | 入参                  | 响应                                       |
| -------- | --------------------------------------- | -------------- | --------------------- | ------------------------------------------ |
| `GET`    | `/admin/consultations/page`             | 咨询分页       | `AdminPageDto`        | `BaseResponse<PageResult<ConsultationVo>>` |
| `GET`    | `/admin/consultations/{consultationId}` | 咨询详情       | 咨询ID                | `BaseResponse<ConsultationVo>`             |
| `POST`   | `/admin/consultations`                  | 管理端录入咨询 | `ConsultationSaveDto` | `BaseResponse<ConsultationVo>`             |
| `PUT`    | `/admin/consultations/{consultationId}` | 修改咨询       | 咨询ID + DTO          | `BaseResponse<ConsultationVo>`             |
| `DELETE` | `/admin/consultations/{consultationId}` | 逻辑删除咨询   | 咨询ID                | `BaseResponse<Boolean>`                    |

> §4.11.3 至 §4.11.12 的接口除 `/admin/login` 外均需要管理端 Session 登录态。

## 5. 新功能代码生成流程

### 步骤 1：数据库变更

如果有MySQL的MCP就直接调用操作数据库。

1. 所有表结构变更在 `db` 中要有相应的迁移脚本和undo回滚脚本，迁移和回滚放到一个sql文件里。命名规范`yyyyMMddHHmmss_description.sql`
2. 创建表规范：
   - **常规业务表**（绝大多数后台表）必须包含 `del_flag / create_by / create_time / update_by / update_time` 五个字段；主键使用 `业务名_id` 形式（如 `user_id`），`del_flag` 必须给默认值 `0`，**禁止使用外键约束**。
   - **存储型 / 只读型表**（如 `sys_file` 文件存储表、字典枚举快照表）**只保留 `create_by / create_time`**：删除走物理删除（直接 `DELETE`），无需 `del_flag`，也无 `update_by / update_time`。此类表对应的 Entity不要继承 `BaseDo`字段完整写在代码里，否则 MyBatis-Plus 会因为存在 `@TableLogic` 字段把 `deleteById` 退化为逻辑删除。
   - 基类选择速查：
     | 场景 | 继承基类 | 数据库字段 |
     | --- | --- | --- |
     | 需要软删除、需要跟踪更新者 | `BaseDo` | `del_flag / create_by / create_time / update_by / update_time` |
   - 删除文件类接口时，Controller 必须使用物理删除（`DELETE /xxx/{id}`），Service 内调用 `BaseMapper#deleteById` 即可，无需额外写 SQL。
   - 例子（常规业务表）：

```sql
CREATE TABLE `ai_model`  (
  `ai_model_id` CHAR(32) NOT NULL COMMENT '模型ID',
  `model_name` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '模型名称',
  `model_type` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '类型标签（0大语言模型 1图片生成模型 2视频生成模型 3音频生成模型）',
  `del_flag` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '0' COMMENT '删除标志（0代表存在 1代表删除）',
  `create_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime NULL DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`ai_model_id`)
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = 'AI模型配置表' ROW_FORMAT = Dynamic;
```

### 步骤 2：Entity（`model/entity/`）

- 新建 `Xxx.java`，使用 `@Data` 与 MyBatis-Plus 注解：

  ```java
  @EqualsAndHashCode(callSuper = true)
  @TableName(value = "表名")
  @Data
  @ToString
  public class Xxx extends BaseDo implements Serializable {

      @TableField(exist = false)
      private static final long serialVersionUID = 1L;

      @TableId(type = IdType.ASSIGN_UUID)
      private String xxxId;  // 主键命名：实体名+Id

      // 其他字段，JSON 类型字段无需特殊注解，MyBatis-Plus 自动处理
      // Date 类型字段加 @JsonFormat(pattern = NORM_DATETIME_PATTERN)
  }
  ```

- 仅做字段映射，不要包含业务方法。
- 基类选择：常规业务表继承 com.deaofu.common.BaseDo（含 del_flag / create_by / create_time / update_by / update_time + @TableLogic 逻辑删除）；存储型 / 只读型表继承 com.deaofu.common.BaseCreateDo（仅 create_by / create_time，删除走物理删除）。详见 [§5.1](#步骤-1数据库变更)。

### 步骤 3：Mapper（`mapper/`）

- 新建 `XxxMapper.java`：
  ```java
  @Mapper
  public interface XxxMapper extends BaseMapper<Xxx> {
      // 一般不需要自定义方法，复杂 SQL 写在 XML 中
  }
  ```
- 复杂 SQL 写在 `src/main/resources/mapper/XxxMapper.xml`。

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.deaofu.mapper.XxxMapper">
</mapper>
```

### 步骤 4：Service（`service/` + `service/impl/`）

如果有其他的Mapper，则需要在Service中注入，并在类上使用`@RequiredArgsConstructor`注解，添加相应`private final XxxMapper xxxMapper;`。

- 接口：`IXxxService`，定义业务方法（按动作命名：`addXxx` / `updateXxx` / `deleteXxx` / `getXxx` / `listXxx` / `pageXxx`）。

```java
@Service
public class XxxServiceImpl extends ServiceImpl<XxxMapper, Xxx> implements IXxxService {
}
```

- 实现：`XxxServiceImpl`，标注 `@Service`，注入 `XxxMapper`，**所有写操作**用 `@Transactional(rollbackFor = Exception.class)`。

### 步骤 5：DTO / VO（`model/dto/`、`model/vo/`）

- **DTO（入参）**：用于接收请求参数。复杂表单用 `XxxCreateDto`，列表查询用 `XxxPageDto`（继承或组合 `PageDomain`）。
- **VO（出参）**：用于返回前端展示，按需裁剪字段、格式化时间。不直接返回 Entity。
- DTO 上使用 Bean Validation 注解做参数校验。

### 步骤 6：Controller（`controller/admin/` 或 `controller/portal/`）

- `controller/admin/`：后台管理接口，建议前缀 `/admin/xxx`。
- `controller/portal/`：前台开放接口，前缀 `/xxx`。
- 例子

```java
@Controller
@RequestMapping("/admin/xxx")
@RequiredArgsConstructor
public class XxxController {

    private final IXxxService xxxService;

    /**
     * 分页列表页
     */
    @GetMapping("/page")
    public String getXxxPage(XxxPageDto dto, Model model) {
        // 1. 执行业务分页查询
        PageResult<XxxPageVo> pageResult = xxxService.selectXxxPage(dto);
        // 2. 数据存入模型，供页面渲染（分页结果 + 查询条件回显）
        model.addAttribute("pageResult", pageResult);
        model.addAttribute("queryParams", dto);
        // 返回Thymeleaf模板路径：对应 resources/templates/admin/xxx/list.html
        return "admin/xxx/list";
    }

    /**
     * 详情页
     */
    @GetMapping("/{XxxId}")
    public String getInfo(
            @PathVariable("XxxId") String XxxId,
            Model model
    ) {
        XxxVo xxxInfo = xxxService.getXxxById(XxxId);
        model.addAttribute("xxx", xxxInfo);
        // 返回详情页模板：对应 resources/templates/admin/xxx/detail.html
        return "admin/xxx/detail";
    }

    /**
     * 新增接口
     */
    @PostMapping
    @ResponseBody
    public BaseResponse<Boolean> add(@Valid @RequestBody XxxCreateDto dto) {
        return ResultUtils.success(xxxService.insertXxx(dto));
    }

    /**
     * 修改接口（保持REST JSON风格）
     */
    @PutMapping
    @ResponseBody
    public BaseResponse<Boolean> edit(@Valid @RequestBody XxxUpdateDto dto) {
        return ResultUtils.success(xxxService.updateXxx(dto));
    }

    /**
     * 删除接口（保持REST JSON风格）
     */
    @DeleteMapping("/{XxxIds}")
    @ResponseBody
    public BaseResponse<Boolean> remove(
            @PathVariable String[] XxxIds
    ) {
        return ResultUtils.success(xxxService.deleteXxxByIds(XxxIds));
    }
}
```

- 视图型控制器（如渲染 Thymeleaf 模板）放 `controller/portal/` 下，方法返回 `String`（模板名），数据放入 `Model`。

### 步骤 7：模板与前端（按需）

- Thymeleaf 模板放在 `templates/portal/` 或 `templates/admin/` 下。
- 翻译文案放入 `src/main/resources/i18n/messages_zh_CN.properties` / `messages_en.properties`**【目前先不做】**。

### 步骤 8：错误码与异常

- 在 `ErrorCode` 中追加业务错误码，沿用区间约定：
  - `0`：成功。
  - `40000-40999`：请求参数 / 客户端错误。
  - `40100-40199`：登录 / 鉴权。
  - `40300`：禁止访问。
  - `40400`：资源不存在。
  - `50000-50999`：业务异常。
- 必要时新增 `XxxException` + `GlobalExceptionHandler` 处理项。

### 步骤 9：启动验证

1. 在项目根目录运行`mvn clean package -DskipTests`进行打包构建。
2. 在项目根目录运行`C:\Users\EDY\.jdks\ms-17.0.20\bin\java.exe -jar target\deaofu-0.0.1-SNAPSHOT.jar`启动项目
3. 访问前台官网首页地址是`http://127.0.0.1:8080/`
4. 访问后台地址`http://127.0.0.1:8080/admin`，如果没有登录会跳转登录页（用户名：admin，密码：ax./sx762），如果已经登录会跳转到产品管理页面（管理后台首页）
5. 然后验证修改的正确性。
6. 验证成功后关闭运行的程序，防止和我外部运行的程序冲突。

---

## 7. Agent 协作约定

- **不修改生成产物**：不要编辑 `target/` 下任何文件；删除 / 重命名时优先用 IDE 安全重构。
- **尊重现有示例**：在骨架尚未填充业务模块时。
- **沟通方式**：遇到歧义时优先在 PR / 注释里写明假设，而不是反复追问。
- **不要触碰**：`.git/`、`.idea/`（除非明确要求）、`frontend/server*.log`（调试日志，非源码）。
