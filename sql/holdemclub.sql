create table `agent`(
	`id` bigint auto_increment,
	`code` varchar(255) CHARACTER SET utf8 NOT NULL,
	`password` varchar(255) CHARACTER SET utf8 NOT NULL,
	`balance` bigint unsigned default 0.00,
	`parent_id` bigint default null,
	primary key(`id`),
	unique key(`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


alter table `agent` add column `layer` tinyint(1) default null;