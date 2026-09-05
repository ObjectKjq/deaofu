ALTER TABLE `product_category` ADD COLUMN `language` tinyint NOT NULL DEFAULT 0 COMMENT '内容语言（0中文 1英语）';
ALTER TABLE `product` ADD COLUMN `language` tinyint NOT NULL DEFAULT 0 COMMENT '内容语言（0中文 1英语）';
ALTER TABLE `company_news` ADD COLUMN `language` tinyint NOT NULL DEFAULT 0 COMMENT '内容语言（0中文 1英语）';
ALTER TABLE `news_tag` ADD COLUMN `language` tinyint NOT NULL DEFAULT 0 COMMENT '内容语言（0中文 1英语）';
ALTER TABLE `news_tag` DROP INDEX `uk_news_tag_name`, ADD UNIQUE KEY `uk_news_tag_language_name` (`language`, `tag_name`);

-- undo：ALTER TABLE `news_tag` DROP INDEX `uk_news_tag_language_name`, ADD UNIQUE KEY `uk_news_tag_name` (`tag_name`);
-- undo：ALTER TABLE `news_tag` DROP COLUMN `language`;
-- undo：ALTER TABLE `company_news` DROP COLUMN `language`;
-- undo：ALTER TABLE `product` DROP COLUMN `language`;
-- undo：ALTER TABLE `product_category` DROP COLUMN `language`;
