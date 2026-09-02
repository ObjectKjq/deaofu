package com.deaofu.constants;

public interface CommonConstant {

    /** 管理端文件预览路径前缀，模板渲染前统一替换为公开路径。 */
    String ADMIN_PREVIEW_PREFIX = "/admin/sys-file/preview/";

    /** 公开文件预览路径前缀。 */
    String PUBLIC_PREVIEW_PREFIX = "/files/preview/";

    /** 管理端标签图标路径前缀。 */
    String ADMIN_TAG_ICON_PREFIX = "/admin/news-tags/";

    /** 公开标签图标路径前缀。 */
    String PUBLIC_TAG_ICON_PREFIX = "/files/news-tags/";

    /** 官网前台滚动加载页大小，每屏 9 张卡片。 */
    int PORTAL_PAGE_SIZE = 9;

}
