package com.deaofu.utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Gson JSON 序列化/反序列化工具类（线程安全）。
 *
 * <p>内部维护两类 {@link Gson} 实例：
 * <ul>
 *   <li>{@link #GSON}：默认实例，禁用 HTML 转义、输出不可序列化字段、日期使用 yyyy-MM-dd HH:mm:ss。</li>
 *   <li>{@link #GSON_PRETTY}：带格式化输出（pretty printing）的实例，便于日志与排错。</li>
 * </ul>
 *
 * <p>所有方法均做了空值/异常防护：
 * <ul>
 *   <li>入参为 {@code null} 时返回 {@code null} 或空集合，不抛 NPE。</li>
 *   <li>反序列化失败抛出 {@link JsonSyntaxException}（Gson 原生异常），便于上层按需处理。</li>
 * </ul>
 *
 * @author deaofu
 */
public final class GsonUtils {

    /** 默认日期格式。 */
    public static final String DATE_PATTERN = "yyyy-MM-dd HH:mm:ss";

    /** 紧凑输出、禁用 HTML 转义、带日期格式化的 Gson 实例。 */
    public static final Gson GSON = new GsonBuilder()
            .disableHtmlEscaping()
            .serializeNulls()
            .setDateFormat(DATE_PATTERN)
            .create();

    /** 带格式化输出（pretty printing）的 Gson 实例，适合日志/调试使用。 */
    public static final Gson GSON_PRETTY = new GsonBuilder()
            .disableHtmlEscaping()
            .serializeNulls()
            .setDateFormat(DATE_PATTERN)
            .setPrettyPrinting()
            .create();

    private GsonUtils() {
        throw new AssertionError("No com.deaofu.utils.GsonUtils instances for you!");
    }

    // ============================== Serialize ==============================

    /**
     * 将对象序列化为 JSON 字符串。空对象返回 "{}"，{@code null} 返回 {@code "null"}。
     *
     * @param obj 待序列化的对象
     * @return JSON 字符串
     */
    public static String toJson(Object obj) {
        if (obj == null) {
            return null;
        }
        return GSON.toJson(obj);
    }

    /**
     * 将对象序列化为带缩进的 JSON 字符串（日志/调试用）。
     *
     * @param obj 待序列化的对象
     * @return 格式化后的 JSON 字符串
     */
    public static String toJsonPretty(Object obj) {
        if (obj == null) {
            return null;
        }
        return GSON_PRETTY.toJson(obj);
    }

    // ============================== Deserialize ==============================

    /**
     * 将 JSON 字符串反序列化为指定类型的对象。
     *
     * @param json     JSON 字符串
     * @param classOfT 目标类型
     * @param <T>      泛型
     * @return 反序列化得到的对象；若 {@code json} 为 null/blank，返回 {@code null}
     * @throws JsonSyntaxException 当 JSON 格式非法时
     */
    public static <T> T fromJson(String json, Class<T> classOfT) {
        if (json == null || json.isEmpty()) {
            return null;
        }
        return GSON.fromJson(json, classOfT);
    }

    /**
     * 带泛型的反序列化（如 {@code List<User>}、{@code Map<String, User>}）。
     *
     * @param json    JSON 字符串
     * @param typeOfT 含泛型的 {@link Type}，可由 {@link TypeToken} 获取
     * @param <T>     泛型
     * @return 反序列化得到的对象
     * @throws JsonSyntaxException 当 JSON 格式非法时
     */
    public static <T> T fromJson(String json, Type typeOfT) {
        if (json == null || json.isEmpty()) {
            return null;
        }
        return GSON.fromJson(json, typeOfT);
    }

    /**
     * 将 JSON 字符串反序列化为 {@link List}{@code <T>}。
     *
     * @param json     JSON 数组字符串
     * @param classOfT 列表元素类型
     * @param <T>      元素泛型
     * @return 列表；{@code json} 为 null/blank 时返回空列表
     */
    public static <T> List<T> fromJsonList(String json, Class<T> classOfT) {
        if (json == null || json.isEmpty()) {
            return Collections.emptyList();
        }
        Type type = TypeToken.getParameterized(List.class, classOfT).getType();
        List<T> list = GSON.fromJson(json, type);
        return list == null ? Collections.emptyList() : list;
    }

    /**
     * 将 JSON 字符串反序列化为 {@link Map}{@code <String, Object>}。
     *
     * @param json JSON 对象字符串
     * @return 解析后的 Map；{@code json} 为 null/blank 时返回空 Map
     */
    public static Map<String, Object> fromJsonMap(String json) {
        if (json == null || json.isEmpty()) {
            return Collections.emptyMap();
        }
        Type type = new TypeToken<Map<String, Object>>() {}.getType();
        Map<String, Object> map = GSON.fromJson(json, type);
        return map == null ? Collections.emptyMap() : map;
    }

    /**
     * 将 JSON 字符串解析为通用的 {@link JsonElement}，可由调用方自由访问。
     * 常用于不确定结构的 JSON 数据，例如配置中心返回。
     *
     * @param json JSON 字符串
     * @return {@link JsonElement}；解析失败时返回 {@code null}
     */
    public static JsonElement parse(String json) {
        if (json == null || json.isEmpty()) {
            return null;
        }
        try {
            return JsonParser.parseString(json);
        } catch (JsonSyntaxException e) {
            return null;
        }
    }

    // ============================== Convert / Inspect ==============================

    /**
     * 深度克隆对象：先 toJson 再 fromJson。会丢失无法序列化或无法通过默认构造器重建的字段。
     *
     * @param obj     源对象
     * @param classOfT 目标类型
     * @param <T>     泛型
     * @return 克隆后的对象；{@code obj} 为 {@code null} 时返回 {@code null}
     */
    public static <T> T deepCopy(Object obj, Class<T> classOfT) {
        if (obj == null) {
            return null;
        }
        return GSON.fromJson(GSON.toJson(obj), classOfT);
    }

    /**
     * 将任意对象转为 {@link JsonObject}。无法转换时返回空对象而非抛异常。
     */
    public static JsonObject toJsonObject(Object obj) {
        if (obj == null) {
            return new JsonObject();
        }
        JsonElement element = GSON.toJsonTree(obj);
        return element.isJsonObject() ? element.getAsJsonObject() : new JsonObject();
    }

    /**
     * 将 JSON 字符串安全地转为 {@link JsonObject}；若不是对象则返回空对象。
     */
    public static JsonObject toJsonObject(String json) {
        JsonElement element = parse(json);
        if (element != null && element.isJsonObject()) {
            return element.getAsJsonObject();
        }
        return new JsonObject();
    }

    /**
     * 将 JSON 数组字符串安全转为 {@link JsonArray}；失败时返回空数组。
     */
    public static JsonArray toJsonArray(String json) {
        JsonElement element = parse(json);
        if (element != null && element.isJsonArray()) {
            return element.getAsJsonArray();
        }
        return new JsonArray();
    }

    /**
     * 将 {@code List<T>} 转为 {@link JsonArray}。
     */
    public static <T> JsonArray toJsonArray(List<T> list) {
        JsonArray array = new JsonArray();
        if (list == null || list.isEmpty()) {
            return array;
        }
        for (T item : list) {
            array.add(GSON.toJsonTree(item));
        }
        return array;
    }

    /**
     * 取 {@link JsonObject} 中指定 key 的字符串值；不存在或非 String 类型时返回 {@code null}。
     */
    public static String getString(JsonObject obj, String key) {
        if (obj == null || !obj.has(key) || obj.get(key).isJsonNull()) {
            return null;
        }
        JsonElement el = obj.get(key);
        return el.isJsonPrimitive() ? el.getAsString() : el.toString();
    }

    /**
     * 取指定 key 的字符串值，提供默认值。
     */
    public static String getString(JsonObject obj, String key, String defaultValue) {
        String value = getString(obj, key);
        return value == null ? defaultValue : value;
    }

    /**
     * 取指定 key 的 int 值；不存在/类型不匹配时返回 {@code defaultValue}。
     */
    public static int getInt(JsonObject obj, String key, int defaultValue) {
        if (obj == null || !obj.has(key) || obj.get(key).isJsonNull()) {
            return defaultValue;
        }
        try {
            return obj.get(key).getAsInt();
        } catch (UnsupportedOperationException e) {
            return defaultValue;
        }
    }

    /**
     * 取指定 key 的 long 值；不存在/类型不匹配时返回 {@code defaultValue}。
     */
    public static long getLong(JsonObject obj, String key, long defaultValue) {
        if (obj == null || !obj.has(key) || obj.get(key).isJsonNull()) {
            return defaultValue;
        }
        try {
            return obj.get(key).getAsLong();
        } catch (UnsupportedOperationException e) {
            return defaultValue;
        }
    }

    /**
     * 取指定 key 的 boolean 值；不存在/类型不匹配时返回 {@code defaultValue}。
     */
    public static boolean getBoolean(JsonObject obj, String key, boolean defaultValue) {
        if (obj == null || !obj.has(key) || obj.get(key).isJsonNull()) {
            return defaultValue;
        }
        try {
            return obj.get(key).getAsBoolean();
        } catch (UnsupportedOperationException e) {
            return defaultValue;
        }
    }

    // ============================== Convenience Builders ==============================

    /**
     * 新建一个空的 {@link JsonObject}，链式写入。
     */
    public static JsonObject newObject() {
        return new JsonObject();
    }

    /**
     * 新建一个空的 {@link JsonArray}。
     */
    public static JsonArray newArray() {
        return new JsonArray();
    }

    /**
     * 将 {@code List<String>} 转为 {@link JsonArray}（便捷重载）。
     */
    public static JsonArray newArray(List<String> items) {
        JsonArray array = new JsonArray();
        if (items == null) {
            return array;
        }
        for (String s : items) {
            array.add(s);
        }
        return array;
    }

    /**
     * 将对象列表中的每个元素反序列化为 {@code classOfT}。失败项会被跳过。
     */
    public static <T> List<T> safeFromJsonList(String json, Class<T> classOfT) {
        List<T> result = new ArrayList<>();
        JsonArray array = toJsonArray(json);
        for (int i = 0; i < array.size(); i++) {
            try {
                result.add(GSON.fromJson(array.get(i), classOfT));
            } catch (JsonSyntaxException ignored) {
                // skip invalid item
            }
        }
        return result;
    }
}
