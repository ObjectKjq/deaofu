-- 德奥福管理后台业务表
CREATE TABLE `product_category` (
  `category_id` char(32) NOT NULL COMMENT '产品分类ID',
  `category_name` varchar(128) NOT NULL COMMENT '产品分类名称',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序值，越大越靠前',
  `parent_id` char(32) DEFAULT NULL COMMENT '父级分类ID，NULL表示一级分类',
  `del_flag` char(1) NOT NULL DEFAULT '0' COMMENT '删除标志（0存在 1删除）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`category_id`), KEY `idx_product_category_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品分类表';

CREATE TABLE `product` (
  `product_id` char(32) NOT NULL COMMENT '产品ID',
  `category_id` char(32) NOT NULL COMMENT '产品二级分类ID',
  `cover_access_name` varchar(255) NOT NULL COMMENT '封面访问文件名',
  `detail_images` json NOT NULL COMMENT '详情图片访问文件名JSON数组',
  `title` varchar(255) NOT NULL COMMENT '产品标题',
  `summary` varchar(1000) DEFAULT NULL COMMENT '产品简介',
  `specs` json NOT NULL COMMENT '产品参数JSON数组',
  `del_flag` char(1) NOT NULL DEFAULT '0' COMMENT '删除标志（0存在 1删除）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`product_id`), KEY `idx_product_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品表';

CREATE TABLE `transport_route` (
  `route_id` char(32) NOT NULL COMMENT '运输路线ID',
  `source_address` varchar(255) NOT NULL COMMENT '源地址',
  `target_address` varchar(255) NOT NULL COMMENT '目标地址',
  `del_flag` char(1) NOT NULL DEFAULT '0' COMMENT '删除标志（0存在 1删除）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`route_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='运输线路表';

CREATE TABLE `partner_company` (
  `partner_id` char(32) NOT NULL COMMENT '合作企业ID',
  `logo_access_name` varchar(255) NOT NULL COMMENT '企业Logo访问文件名',
  `company_name` varchar(255) NOT NULL COMMENT '企业名称',
  `del_flag` char(1) NOT NULL DEFAULT '0' COMMENT '删除标志（0存在 1删除）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`partner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合作企业表';

CREATE TABLE `company_news` (
  `news_id` char(32) NOT NULL COMMENT '动态ID',
  `cover_access_name` varchar(255) NOT NULL COMMENT '封面访问文件名',
  `title` varchar(255) NOT NULL COMMENT '动态标题',
  `summary` varchar(1000) DEFAULT NULL COMMENT '动态简介',
  `content` longtext NOT NULL COMMENT '正文HTML，允许内嵌Base64图片',
  `project_region` varchar(255) DEFAULT NULL COMMENT '项目地区',
  `contact_email` varchar(255) DEFAULT NULL COMMENT '咨询邮箱',
  `del_flag` char(1) NOT NULL DEFAULT '0' COMMENT '删除标志（0存在 1删除）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`news_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公司动态表';

CREATE TABLE `news_tag` (
  `tag_id` char(32) NOT NULL COMMENT '动态标签ID',
  `tag_name` varchar(128) NOT NULL COMMENT '动态标签名称',
  `icon_data` mediumblob DEFAULT NULL COMMENT '标签图标二进制',
  `icon_content_type` varchar(128) DEFAULT NULL COMMENT '标签图标MIME类型',
  `del_flag` char(1) NOT NULL DEFAULT '0' COMMENT '删除标志（0存在 1删除）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`tag_id`), UNIQUE KEY `uk_news_tag_name` (`tag_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='动态标签表';

CREATE TABLE `company_news_tag` (
  `news_id` char(32) NOT NULL COMMENT '动态ID',
  `tag_id` char(32) NOT NULL COMMENT '动态标签ID',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`news_id`, `tag_id`), KEY `idx_company_news_tag_tag` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='动态与标签关联表';

CREATE TABLE `consultation` (
  `consultation_id` char(32) NOT NULL COMMENT '咨询信息ID',
  `subjects` json NOT NULL COMMENT '咨询主题JSON数组',
  `content` text NOT NULL COMMENT '咨询内容',
  `contact_name` varchar(128) NOT NULL COMMENT '姓名',
  `phone` varchar(64) DEFAULT NULL COMMENT '电话',
  `email` varchar(255) NOT NULL COMMENT '邮箱',
  `del_flag` char(1) NOT NULL DEFAULT '0' COMMENT '删除标志（0存在 1删除）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`consultation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='咨询信息表';

ALTER TABLE `sys_file` ADD UNIQUE KEY `uk_sys_file_access_name` (`access_name`);

-- undo：ALTER TABLE `sys_file` DROP INDEX `uk_sys_file_access_name`;
-- undo：DROP TABLE `consultation`; DROP TABLE `company_news_tag`; DROP TABLE `news_tag`;
-- undo：DROP TABLE `company_news`; DROP TABLE `partner_company`; DROP TABLE `transport_route`;
-- undo：DROP TABLE `product`; DROP TABLE `product_category`;
