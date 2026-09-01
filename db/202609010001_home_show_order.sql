ALTER TABLE `product` ADD COLUMN `home_show_order` int NOT NULL DEFAULT 0 COMMENT '官网首页展示顺序（0不展示，1-5）';
ALTER TABLE `company_news` ADD COLUMN `home_show_order` int NOT NULL DEFAULT 0 COMMENT '官网首页展示顺序（0不展示，1-3）';
