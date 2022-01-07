-- MySQL dump 10.13  Distrib 8.0.22, for Linux (x86_64)
--
-- Host: localhost    Database: boosting
-- ------------------------------------------------------
-- Server version	8.0.26-0ubuntu0.20.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Boosters`
--

DROP TABLE IF EXISTS `Boosters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Boosters` (
  `ID_Booster` int NOT NULL AUTO_INCREMENT,
  `Usuario_Booster` varchar(50) NOT NULL,
  `Contrasena_Booster` varchar(50) NOT NULL,
  `Correo_Booster` varchar(50) NOT NULL,
  `Paypal_Booster` varchar(50) NOT NULL,
  `Status_Booster` varchar(50) NOT NULL,
  PRIMARY KEY (`ID_Booster`),
  UNIQUE KEY `Usuario_Booster` (`Usuario_Booster`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Chats`
--

DROP TABLE IF EXISTS `Chats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Chats` (
  `ID_Chat` int NOT NULL AUTO_INCREMENT,
  `ID_Cliente` int NOT NULL,
  `ID_Booster` int NOT NULL,
  `Status_Chat` varchar(50) NOT NULL,
  `Orden_ID` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ID_Chat`),
  KEY `Chats_ibfk_1` (`ID_Cliente`),
  KEY `Chats_ibfk_2` (`ID_Booster`),
  CONSTRAINT `Chats_ibfk_1` FOREIGN KEY (`ID_Cliente`) REFERENCES `Clientes` (`ID_Cliente`),
  CONSTRAINT `Chats_ibfk_2` FOREIGN KEY (`ID_Booster`) REFERENCES `Boosters` (`ID_Booster`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Clientes`
--

DROP TABLE IF EXISTS `Clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Clientes` (
  `ID_Cliente` int NOT NULL AUTO_INCREMENT,
  `Nombre_Cliente` varchar(50) NOT NULL,
  `Usuario_Cliente` varchar(50) NOT NULL,
  `Contrasena_Cliente` varchar(100) NOT NULL,
  `Correo_Cliente` varchar(100) NOT NULL,
  `Status_Cliente` varchar(50) NOT NULL,
  PRIMARY KEY (`ID_Cliente`),
  UNIQUE KEY `Usuario_Cliente` (`Usuario_Cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Mensajes`
--

DROP TABLE IF EXISTS `Mensajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Mensajes` (
  `ID_Mensaje` int NOT NULL AUTO_INCREMENT,
  `Chat` int NOT NULL,
  `Envia` int NOT NULL,
  `Mensaje` varchar(10000) NOT NULL,
  `Status_Mensaje` varchar(50) NOT NULL,
  `Sent` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_Mensaje`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Pedidos`
--

DROP TABLE IF EXISTS `Pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Pedidos` (
  `ID_Pedido` int NOT NULL AUTO_INCREMENT,
  `Cliente` int NOT NULL,
  `Booster` int NOT NULL,
  `Rango_Actual` varchar(50) NOT NULL,
  `Rango_Deseado` varchar(50) NOT NULL,
  `LP_Actuales` varchar(50) NOT NULL,
  `Servidor` varchar(50) NOT NULL,
  `Modalidad` varchar(50) NOT NULL,
  `Rol` varchar(50) NOT NULL,
  `Campeones` varchar(50) NOT NULL,
  `Precio` double NOT NULL,
  `Estado` varchar(50) NOT NULL,
  `Status_Activo` varchar(50) NOT NULL,
  `DuoQ` int NOT NULL,
  `Id_ig` varchar(300) DEFAULT NULL,
  `Pw_ig` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`ID_Pedido`),
  KEY `Cliente` (`Cliente`),
  KEY `Booster` (`Booster`),
  CONSTRAINT `Pedidos_ibfk_1` FOREIGN KEY (`Cliente`) REFERENCES `Clientes` (`ID_Cliente`),
  CONSTRAINT `Pedidos_ibfk_2` FOREIGN KEY (`Booster`) REFERENCES `Boosters` (`ID_Booster`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Pedidos_Activos`
--

DROP TABLE IF EXISTS `Pedidos_Activos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Pedidos_Activos` (
  `ID_Pedido_Activo` int NOT NULL AUTO_INCREMENT,
  `Cliente_Activo` int NOT NULL,
  `Rango_Actual_Activo` varchar(50) NOT NULL,
  `Rango_Deseado_Activo` varchar(50) NOT NULL,
  `LP_Actuales_Activo` varchar(50) NOT NULL,
  `Servidor_Activo` varchar(50) NOT NULL,
  `Modalidad_Activo` varchar(50) NOT NULL,
  `Rol_Activo` varchar(50) NOT NULL,
  `Campeones_Activo` varchar(50) DEFAULT NULL,
  `Precio_Activo` double NOT NULL,
  `Status_Activo` varchar(50) NOT NULL,
  `DuoQ` int DEFAULT NULL,
  `Created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_Pedido_Activo`),
  KEY `Cliente_Activo` (`Cliente_Activo`),
  CONSTRAINT `Pedidos_Activos_ibfk_1` FOREIGN KEY (`Cliente_Activo`) REFERENCES `Clientes` (`ID_Cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Verif`
--

DROP TABLE IF EXISTS `Verif`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Verif` (
  `ID_Cliente` int NOT NULL,
  `Hashcode` varchar(50) NOT NULL,
  PRIMARY KEY (`ID_Cliente`),
  CONSTRAINT `ID_Cliente` FOREIGN KEY (`ID_Cliente`) REFERENCES `Clientes` (`ID_Cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-08-23  0:24:30
