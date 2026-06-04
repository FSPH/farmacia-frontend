/*
 Navicat Premium Dump SQL

 Source Server         : MYSQL
 Source Server Type    : MySQL
 Source Server Version : 80403 (8.4.3)
 Source Host           : 172.23.42.17:3306
 Source Schema         : fsph_ambulatorio

 Target Server Type    : MySQL
 Target Server Version : 80403 (8.4.3)
 File Encoding         : 65001

 Date: 27/05/2026 09:55:10
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for tb_pacientes
-- ----------------------------
DROP TABLE IF EXISTS `tb_pacientes`;
CREATE TABLE `tb_pacientes` (
  `num_paciente` int NOT NULL,
  `dt_cadastro` date DEFAULT NULL,
  `nom_paciente` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nom_social` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dt_nascimento` date DEFAULT NULL,
  `cpf` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nom_pai` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nom_mae` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `responsavel` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `raca` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sexo` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cod_cidade_natu` int DEFAULT NULL,
  `estado_civil` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `doc_identidade` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `doc_exp` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefone` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `profissao` int DEFAULT NULL,
  `celular` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `endereco` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `numero` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bairro` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cod_cidade` int DEFAULT NULL,
  `uf` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cns` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cep` varchar(9) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `abo` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tem_alergia` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `qual` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`num_paciente`),
  KEY `FK_raca` (`raca`),
  KEY `FK_sexo` (`sexo`),
  KEY `FK_cod_cidade_natu` (`cod_cidade_natu`),
  KEY `FK_cod_cidade` (`cod_cidade`),
  KEY `FK_estado_civil` (`estado_civil`),
  KEY `FK_profissao` (`profissao`),
  CONSTRAINT `FK_cod_cidade` FOREIGN KEY (`cod_cidade`) REFERENCES `tb_cidades` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_cod_cidade_natu` FOREIGN KEY (`cod_cidade_natu`) REFERENCES `tb_cidades` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_estado_civil` FOREIGN KEY (`estado_civil`) REFERENCES `tb_estado_civis` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_profissao` FOREIGN KEY (`profissao`) REFERENCES `tb_cbo` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_raca` FOREIGN KEY (`raca`) REFERENCES `tb_racas` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_sexo` FOREIGN KEY (`sexo`) REFERENCES `tb_sexos` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS = 1;
