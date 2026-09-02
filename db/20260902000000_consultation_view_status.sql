-- 咨询信息：新增查看状态字段（0未查看 1已查看）
ALTER TABLE `consultation` ADD COLUMN `view_status` char(1) NOT NULL DEFAULT '0' COMMENT '查看状态（0未查看 1已查看）';

-- undo：ALTER TABLE `consultation` DROP COLUMN `view_status`;
