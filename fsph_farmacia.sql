/*
 Navicat Premium Dump SQL

 Source Server         : MYSQL
 Source Server Type    : MySQL
 Source Server Version : 80403 (8.4.3)
 Source Host           : 172.23.42.17:3306
 Source Schema         : fsph_farmacia

 Target Server Type    : MySQL
 Target Server Version : 80403 (8.4.3)
 File Encoding         : 65001

 Date: 27/05/2026 09:45:48
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for tb_boname
-- ----------------------------
DROP TABLE IF EXISTS `tb_boname`;
CREATE TABLE `tb_boname` (
  `bona_id` int NOT NULL,
  `bona_codigo` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bona_descr` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bona_qt_ui` mediumint DEFAULT NULL,
  `bona_diag_id` mediumint DEFAULT NULL,
  `bona_ativo` tinyint DEFAULT NULL,
  PRIMARY KEY (`bona_id`) USING BTREE,
  UNIQUE KEY `bona_codigo` (`bona_codigo`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for tb_depositos
-- ----------------------------
DROP TABLE IF EXISTS `tb_depositos`;
CREATE TABLE `tb_depositos` (
  `dep_id` int NOT NULL,
  `dep_descr` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dep_ativo` tinyint DEFAULT NULL,
  PRIMARY KEY (`dep_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for tb_diagnosticos
-- ----------------------------
DROP TABLE IF EXISTS `tb_diagnosticos`;
CREATE TABLE `tb_diagnosticos` (
  `diag_id` int NOT NULL,
  `diag_descr` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `diag_ativo` tinyint DEFAULT '0',
  PRIMARY KEY (`diag_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for tb_entradas
-- ----------------------------
DROP TABLE IF EXISTS `tb_entradas`;
CREATE TABLE `tb_entradas` (
  `ent_id` int NOT NULL AUTO_INCREMENT,
  `ent_date` date DEFAULT NULL,
  `ent_med_id` int NOT NULL,
  `ent_lote` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ent_qtde` mediumint DEFAULT '0',
  `ent_doc` varchar(90) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ent_fornecido_por` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`ent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for tb_estoque
-- ----------------------------
DROP TABLE IF EXISTS `tb_estoque`;
CREATE TABLE `tb_estoque` (
  `est_id` int NOT NULL,
  `est_dep_id` int DEFAULT NULL,
  `est_med_id` int DEFAULT NULL,
  `est_lote` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `est_saldo` mediumint DEFAULT '0',
  `est_validade` date DEFAULT NULL,
  PRIMARY KEY (`est_id`),
  UNIQUE KEY `idx_itens_estoque` (`est_dep_id`,`est_med_id`,`est_lote`) USING BTREE,
  KEY `fk_estoque_medicamento` (`est_med_id`),
  CONSTRAINT `fk_estoque_deposito` FOREIGN KEY (`est_dep_id`) REFERENCES `tb_depositos` (`dep_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_estoque_medicamento` FOREIGN KEY (`est_med_id`) REFERENCES `tb_medicamentos` (`med_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for tb_inventarios
-- ----------------------------
DROP TABLE IF EXISTS `tb_inventarios`;
CREATE TABLE `tb_inventarios` (
  `inv_id` int NOT NULL,
  `inv_date` date DEFAULT NULL,
  `inv_dep_id` int DEFAULT NULL,
  `inv_med_tipo_codigo` varchar(3) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `inv_status` tinyint DEFAULT '0',
  `inv_mes_ref` tinyint DEFAULT '0',
  `inv_ano_ref` smallint DEFAULT '0',
  PRIMARY KEY (`inv_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for tb_itens_inventario
-- ----------------------------
DROP TABLE IF EXISTS `tb_itens_inventario`;
CREATE TABLE `tb_itens_inventario` (
  `iti_id` int NOT NULL,
  `iti_inv_id` int DEFAULT NULL,
  `iti_med_id` int DEFAULT NULL,
  `iti_lote` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `iti_validade` date DEFAULT NULL,
  `iti_qtde_estoque` mediumint DEFAULT '0',
  `iti_qtde_invent` mediumint DEFAULT '0',
  `iti_qtde_dif` mediumint GENERATED ALWAYS AS ((`iti_qtde_estoque` - `iti_qtde_invent`)) VIRTUAL,
  PRIMARY KEY (`iti_id`) USING BTREE,
  UNIQUE KEY `idx_itens_inventario` (`iti_inv_id`,`iti_med_id`,`iti_lote`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for tb_locais
-- ----------------------------
DROP TABLE IF EXISTS `tb_locais`;
CREATE TABLE `tb_locais` (
  `local_id` mediumint NOT NULL,
  `local_descr` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `local_ativo` tinyint DEFAULT NULL,
  PRIMARY KEY (`local_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for tb_medicamentos
-- ----------------------------
DROP TABLE IF EXISTS `tb_medicamentos`;
CREATE TABLE `tb_medicamentos` (
  `med_id` int NOT NULL,
  `med_descr` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `med_descr_coml` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `med_und` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `med_tipo_codigo` varchar(3) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `med_tipo_med` varchar(90) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `med_max` smallint DEFAULT NULL,
  `med_min` smallint DEFAULT NULL,
  `med_ui_cx` mediumint DEFAULT NULL,
  `med_bona_codigo` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `med_alert` smallint DEFAULT NULL,
  `med_diag_id` int DEFAULT NULL,
  `med_ativo` tinyint DEFAULT NULL,
  PRIMARY KEY (`med_id`),
  KEY `fk_medicamentos_tipos` (`med_tipo_codigo`),
  KEY `fk_medicamentos_boname` (`med_bona_codigo`),
  KEY `fk_medicamentos_diag` (`med_diag_id`),
  CONSTRAINT `fk_medicamentos_boname` FOREIGN KEY (`med_bona_codigo`) REFERENCES `tb_boname` (`bona_codigo`),
  CONSTRAINT `fk_medicamentos_diag` FOREIGN KEY (`med_diag_id`) REFERENCES `tb_diagnosticos` (`diag_id`),
  CONSTRAINT `fk_medicamentos_tipos` FOREIGN KEY (`med_tipo_codigo`) REFERENCES `tb_tipos_medicamentos` (`tipo_codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for tb_pacientes_gaucher
-- ----------------------------
DROP TABLE IF EXISTS `tb_pacientes_gaucher`;
CREATE TABLE `tb_pacientes_gaucher` (
  `gau_id` int NOT NULL,
  `gau_pac_id` int NOT NULL,
  `gau_medico_assis` varchar(125) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gau_medico_crm` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gau_med_id` int DEFAULT NULL,
  `gau_qtde_medicamento` mediumint DEFAULT '0',
  `gau_ativo` tinyint DEFAULT NULL,
  PRIMARY KEY (`gau_pac_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for tb_requisicoes
-- ----------------------------
DROP TABLE IF EXISTS `tb_requisicoes`;
CREATE TABLE `tb_requisicoes` (
  `req_id` int NOT NULL,
  `req_tipo` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `req_pac_id` int DEFAULT NULL,
  `req_date` date DEFAULT NULL,
  `req_med_id` int NOT NULL,
  `req_qtde` mediumint DEFAULT NULL,
  `req_lote` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `req_val_mes` tinyint DEFAULT NULL,
  `req_val_ano` smallint DEFAULT NULL,
  `req_dep_id` int DEFAULT NULL,
  `req_local_id` mediumint DEFAULT NULL,
  `req_aprova` tinyint DEFAULT '0',
  `req_solicitado_por` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `req_aprovado_por` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`req_id`,`req_med_id`,`req_lote`) USING BTREE,
  KEY `fk_requisicoes_tipos` (`req_tipo`),
  KEY `fk_requisicoes_medicamento` (`req_med_id`),
  KEY `fk_requisicoes_paciente` (`req_pac_id`),
  KEY `fk_requisocoes_deposito` (`req_dep_id`),
  KEY `fk_requisicoes_locais` (`req_local_id`),
  CONSTRAINT `fk_requisicoes_locais` FOREIGN KEY (`req_local_id`) REFERENCES `tb_locais` (`local_id`),
  CONSTRAINT `fk_requisicoes_medicamento` FOREIGN KEY (`req_med_id`) REFERENCES `tb_medicamentos` (`med_id`),
  CONSTRAINT `fk_requisicoes_paciente` FOREIGN KEY (`req_pac_id`) REFERENCES `fsph_ambulatorio`.`tb_pacientes` (`num_paciente`),
  CONSTRAINT `fk_requisicoes_tipos` FOREIGN KEY (`req_tipo`) REFERENCES `tb_tipos_requisicoes` (`tip_codigo`),
  CONSTRAINT `fk_requisocoes_deposito` FOREIGN KEY (`req_dep_id`) REFERENCES `tb_depositos` (`dep_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for tb_tipos_medicamentos
-- ----------------------------
DROP TABLE IF EXISTS `tb_tipos_medicamentos`;
CREATE TABLE `tb_tipos_medicamentos` (
  `tipo_id` int NOT NULL,
  `tipo_codigo` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipo_descr` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipo_ativo` tinyint DEFAULT NULL,
  PRIMARY KEY (`tipo_id`),
  UNIQUE KEY `idx_tipo_codigo` (`tipo_codigo`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for tb_tipos_requisicoes
-- ----------------------------
DROP TABLE IF EXISTS `tb_tipos_requisicoes`;
CREATE TABLE `tb_tipos_requisicoes` (
  `tip_id` tinyint NOT NULL,
  `tip_codigo` varchar(3) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tip_descr` varchar(90) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`tip_id`),
  UNIQUE KEY `idx_tipos_requisicoes` (`tip_codigo`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS = 1;
