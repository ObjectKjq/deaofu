-- 德奥福文件存储与管理端用户表
CREATE TABLE `sys_user` (
  `user_id` char(32) NOT NULL COMMENT '用户ID',
  `username` varchar(64) NOT NULL COMMENT '登录用户名',
  `password_hash` varchar(100) NOT NULL COMMENT 'BCrypt密码哈希',
  `display_name` varchar(128) DEFAULT NULL COMMENT '显示名称',
  `status` char(1) NOT NULL DEFAULT '0' COMMENT '状态（0启用 1禁用）',
  `del_flag` char(1) NOT NULL DEFAULT '0' COMMENT '删除标志（0存在 1删除）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`user_id`), UNIQUE KEY `uk_sys_user_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理端用户表';

CREATE TABLE `sys_file` (
  `file_id` char(32) NOT NULL COMMENT '文件ID',
  `original_name` varchar(255) NOT NULL COMMENT '原始文件名',
  `access_name` varchar(255) NOT NULL COMMENT '访问文件名',
  `content_type` varchar(128) NOT NULL DEFAULT 'application/octet-stream' COMMENT 'MIME类型',
  `file_size` bigint unsigned NOT NULL COMMENT '文件字节数',
  `file_data` longblob NOT NULL COMMENT '文件二进制内容',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`file_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据库文件存储表';

-- undo：DROP TABLE `sys_file`; DROP TABLE `sys_user`;
