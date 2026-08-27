--------------------------------------------------------
--  Fichier créé - mercredi-avril-29-2026   
--------------------------------------------------------
--------------------------------------------------------
--  DDL for Table ADHERENT
--------------------------------------------------------

  CREATE TABLE "GESTION_MUTUELLE"."ADHERENT" 
   (	"ID_ADHERENT" NUMBER, 
	"ID_USER" NUMBER, 
	"NUMERO_ADHERENT" VARCHAR2(50 BYTE)
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
--------------------------------------------------------
--  DDL for Table AGENT
--------------------------------------------------------

  CREATE TABLE "GESTION_MUTUELLE"."AGENT" 
   (	"ID_AGENT" NUMBER, 
	"ID_USER" NUMBER, 
	"MATRICULE" VARCHAR2(50 BYTE), 
	"NOM" VARCHAR2(100 BYTE), 
	"PRENOM" VARCHAR2(100 BYTE), 
	"SITUATION_FAMILIALE" VARCHAR2(50 BYTE), 
	"DATE_NAISSANCE" DATE, 
	"TELEPHONE" VARCHAR2(20 BYTE), 
	"DATE_RECRUTEMENT" DATE, 
	"STATUT" VARCHAR2(20 BYTE), 
  "EMAIL" VARCHAR2(50 BYTE),
	"ID_ENTITE" NUMBER
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
--------------------------------------------------------
--  DDL for Table ANALYSE
--------------------------------------------------------

  CREATE TABLE "GESTION_MUTUELLE"."ANALYSE" 
   (	"ID_ANALYSE" NUMBER, 
	"ID_BENEFICIAIRE" NUMBER, 
	"OBSERVATION" VARCHAR2(255 BYTE), 
	"SCAN" VARCHAR2(255 BYTE), 
	"TOTAL" NUMBER
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
--------------------------------------------------------
--  DDL for Table BENEFICIAIRE
--------------------------------------------------------

  CREATE TABLE "GESTION_MUTUELLE"."BENEFICIAIRE" 
   (	"ID_BENEFICIAIRE" NUMBER, 
	"ID_ADHERENT" NUMBER, 
	"NOM" VARCHAR2(100 BYTE), 
	"PRENOM" VARCHAR2(100 BYTE), 
	"LIEN_PARENTE" VARCHAR2(50 BYTE), 
	"DATE_NAISSANCE" DATE
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
--------------------------------------------------------
--  DDL for Table CARTE_MUTUELLE
--------------------------------------------------------

  CREATE TABLE "GESTION_MUTUELLE"."CARTE_MUTUELLE" 
   (	"ID_CARTE" NUMBER, 
	"NUMERO_CARTE" VARCHAR2(50 BYTE), 
	"DATE_EMISSION" DATE, 
	"DATE_EXPIRATION" DATE, 
	"STATUT" VARCHAR2(20 BYTE), 
	"ID_ADHERENT" NUMBER
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
--------------------------------------------------------
--  DDL for Table CHATBOT
--------------------------------------------------------

  CREATE TABLE "GESTION_MUTUELLE"."CHATBOT" 
   (	"ID_CHAT" NUMBER, 
	"ID_USER" NUMBER, 
	"MESSAGE" VARCHAR2(500 BYTE), 
	"REPONSE" VARCHAR2(500 BYTE), 
	"DATE_MSG" DATE
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
--------------------------------------------------------
--  DDL for Table DEVIS
--------------------------------------------------------

  CREATE TABLE "GESTION_MUTUELLE"."DEVIS" 
   (	"ID_DEVIS" NUMBER, 
	"ID_BENEFICIAIRE" NUMBER, 
	"DATE_DEVIS" DATE, 
	"DATE_DEPOT" DATE, 
	"DATE_REPONSE" DATE, 
	"ETAT_REPONSE" VARCHAR2(20 BYTE), 
	"MONTANT" NUMBER, 
	"SCAN" VARCHAR2(255 BYTE), 
	"OBSERVATION" VARCHAR2(255 BYTE)
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
--------------------------------------------------------
--  DDL for Table DEVIS_DENTAIRE
--------------------------------------------------------

  CREATE TABLE "GESTION_MUTUELLE"."DEVIS_DENTAIRE" 
   (	"ID_DEVIS" NUMBER, 
	"PRECISION" VARCHAR2(255 BYTE)
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
--------------------------------------------------------
--  DDL for Table DEVIS_OPTIQUE
--------------------------------------------------------

  CREATE TABLE "GESTION_MUTUELLE"."DEVIS_OPTIQUE" 
   (	"ID_DEVIS" NUMBER, 
	"TYPE_OPTIQUE" VARCHAR2(100 BYTE)
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
--------------------------------------------------------
--  DDL for Table ENTITE
--------------------------------------------------------

  CREATE TABLE "GESTION_MUTUELLE"."ENTITE" 
   (	"ID_ENTITE" NUMBER, 
	"NOM" VARCHAR2(150 BYTE), 
	"TYPE" VARCHAR2(50 BYTE)
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
--------------------------------------------------------
--  DDL for Table ETABLISSEMENT
--------------------------------------------------------

  CREATE TABLE "GESTION_MUTUELLE"."ETABLISSEMENT" 
   (	"ID_ETABLISSEMENT" NUMBER, 
	"RAISON_SOCIALE" VARCHAR2(150 BYTE), 
	"ADRESSE" VARCHAR2(255 BYTE), 
	"TELEPHONE" VARCHAR2(20 BYTE), 
	"EMAIL" VARCHAR2(150 BYTE), 
	"CONVENTION" VARCHAR2(50 BYTE)
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
--------------------------------------------------------
--  DDL for Table MALADIE_SPECIALE
--------------------------------------------------------

  CREATE TABLE "GESTION_MUTUELLE"."MALADIE_SPECIALE" 
   (	"ID_MALADIE" NUMBER, 
	"ID_BENEFICIAIRE" NUMBER, 
	"TYPE" VARCHAR2(100 BYTE), 
	"ETAT_MALADIE" VARCHAR2(50 BYTE), 
	"DATE_DEPOT" DATE, 
	"DATE_ENVOI" DATE, 
	"OBSERVATION" VARCHAR2(255 BYTE)
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
--------------------------------------------------------
--  DDL for Table MEDECIN
--------------------------------------------------------

  CREATE TABLE "GESTION_MUTUELLE"."MEDECIN" 
   (	"ID_MEDECIN" NUMBER, 
	"NOM" VARCHAR2(100 BYTE), 
	"PRENOM" VARCHAR2(100 BYTE), 
	"SPECIALITE" VARCHAR2(100 BYTE), 
	"CONVENTION" NUMBER(1,0), 
	"TELEPHONE" VARCHAR2(20 BYTE), 
	"EMAIL" VARCHAR2(150 BYTE), 
	"ID_ETABLISSEMENT" NUMBER
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
--------------------------------------------------------
--  DDL for Table MEDICAMENT
--------------------------------------------------------

  CREATE TABLE "GESTION_MUTUELLE"."MEDICAMENT" 
   (	"ID_MEDICAMENT" NUMBER, 
	"NOM" VARCHAR2(150 BYTE), 
	"DESCRIPTION" VARCHAR2(255 BYTE), 
	"TYPE_REMBOURSEMENT" VARCHAR2(50 BYTE)
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
--------------------------------------------------------
--  DDL for Table ORDONNANCE
--------------------------------------------------------

  CREATE TABLE "GESTION_MUTUELLE"."ORDONNANCE" 
   (	"ID_ORDONNANCE" NUMBER, 
	"ID_BENEFICIAIRE" NUMBER, 
	"DATE_ORDONNANCE" DATE, 
	"NUMERO_ORDONNANCE" VARCHAR2(50 BYTE), 
	"MONTANT_TOTAL" NUMBER, 
	"SCAN" VARCHAR2(255 BYTE), 
	"OBSERVATION" VARCHAR2(255 BYTE)
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
--------------------------------------------------------
--  DDL for Table PRISE_EN_CHARGE
--------------------------------------------------------

  CREATE TABLE "GESTION_MUTUELLE"."PRISE_EN_CHARGE" 
   (	"ID_PEC" NUMBER, 
	"ID_BENEFICIAIRE" NUMBER, 
	"TAUX_CHARGE" NUMBER, 
	"DATE_PEC" DATE, 
	"OBSERVATION" VARCHAR2(255 BYTE)
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
--------------------------------------------------------
--  DDL for Table RADIO
--------------------------------------------------------

  CREATE TABLE "GESTION_MUTUELLE"."RADIO" 
   (	"ID_RADIO" NUMBER, 
	"ID_BENEFICIAIRE" NUMBER, 
	"TYPE_RADIO" VARCHAR2(100 BYTE), 
	"SCAN_RADIO" VARCHAR2(255 BYTE), 
	"OBSERVATION" VARCHAR2(255 BYTE), 
	"TOTAL" NUMBER
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
--------------------------------------------------------
--  DDL for Table REMBOURSEMENT
--------------------------------------------------------

  CREATE TABLE "GESTION_MUTUELLE"."REMBOURSEMENT" 
   (	"ID_REMBOURSEMENT" NUMBER, 
	"ID_BENEFICIAIRE" NUMBER, 
	"DATE_DEMANDE" DATE, 
	"MONTANT_DEMANDE" NUMBER, 
	"MONTANT_ACCORDE" NUMBER, 
	"STATUT" VARCHAR2(20 BYTE), 
	"TYPE" VARCHAR2(50 BYTE),
  "SCAN" VARCHAR(50 BYTE),
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
--------------------------------------------------------
--  DDL for Table UTILISATEUR
--------------------------------------------------------

  CREATE TABLE "GESTION_MUTUELLE"."UTILISATEUR" 
   (	"ID_USER" NUMBER, 
	"NOM" VARCHAR2(100 BYTE), 
	"PRENOM" VARCHAR2(100 BYTE), 
	"EMAIL" VARCHAR2(150 BYTE), 
	"MOT_DE_PASSE" VARCHAR2(255 BYTE), 
	"ROLE" VARCHAR2(30 BYTE), 
	"STATUT" VARCHAR2(20 BYTE), 
	"DATE_CREATION" DATE
   ) SEGMENT CREATION DEFERRED 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  TABLESPACE "USERS" ;
REM INSERTING into GESTION_MUTUELLE.ADHERENT
SET DEFINE OFF;
REM INSERTING into GESTION_MUTUELLE.AGENT
SET DEFINE OFF;
REM INSERTING into GESTION_MUTUELLE.ANALYSE
SET DEFINE OFF;
REM INSERTING into GESTION_MUTUELLE.BENEFICIAIRE
SET DEFINE OFF;
REM INSERTING into GESTION_MUTUELLE.CARTE_MUTUELLE
SET DEFINE OFF;
REM INSERTING into GESTION_MUTUELLE.CHATBOT
SET DEFINE OFF;
REM INSERTING into GESTION_MUTUELLE.DEVIS
SET DEFINE OFF;
REM INSERTING into GESTION_MUTUELLE.DEVIS_DENTAIRE
SET DEFINE OFF;
REM INSERTING into GESTION_MUTUELLE.DEVIS_OPTIQUE
SET DEFINE OFF;
REM INSERTING into GESTION_MUTUELLE.ENTITE
SET DEFINE OFF;
REM INSERTING into GESTION_MUTUELLE.ETABLISSEMENT
SET DEFINE OFF;
REM INSERTING into GESTION_MUTUELLE.MALADIE_SPECIALE
SET DEFINE OFF;
REM INSERTING into GESTION_MUTUELLE.MEDECIN
SET DEFINE OFF;
REM INSERTING into GESTION_MUTUELLE.MEDICAMENT
SET DEFINE OFF;
REM INSERTING into GESTION_MUTUELLE.ORDONNANCE
SET DEFINE OFF;
REM INSERTING into GESTION_MUTUELLE.PRISE_EN_CHARGE
SET DEFINE OFF;
REM INSERTING into GESTION_MUTUELLE.RADIO
SET DEFINE OFF;
REM INSERTING into GESTION_MUTUELLE.REMBOURSEMENT
SET DEFINE OFF;
REM INSERTING into GESTION_MUTUELLE.UTILISATEUR
SET DEFINE OFF;
--------------------------------------------------------
--  Constraints for Table MEDECIN
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."MEDECIN" ADD PRIMARY KEY ("ID_MEDECIN")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
--------------------------------------------------------
--  Constraints for Table DEVIS_OPTIQUE
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."DEVIS_OPTIQUE" ADD PRIMARY KEY ("ID_DEVIS")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
--------------------------------------------------------
--  Constraints for Table ANALYSE
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."ANALYSE" ADD PRIMARY KEY ("ID_ANALYSE")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
--------------------------------------------------------
--  Constraints for Table BENEFICIAIRE
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."BENEFICIAIRE" ADD PRIMARY KEY ("ID_BENEFICIAIRE")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
--------------------------------------------------------
--  Constraints for Table UTILISATEUR
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."UTILISATEUR" ADD PRIMARY KEY ("ID_USER")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
  ALTER TABLE "GESTION_MUTUELLE"."UTILISATEUR" ADD UNIQUE ("EMAIL")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
--------------------------------------------------------
--  Constraints for Table ORDONNANCE
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."ORDONNANCE" ADD PRIMARY KEY ("ID_ORDONNANCE")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
--------------------------------------------------------
--  Constraints for Table RADIO
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."RADIO" ADD PRIMARY KEY ("ID_RADIO")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
--------------------------------------------------------
--  Constraints for Table ADHERENT
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."ADHERENT" ADD PRIMARY KEY ("ID_ADHERENT")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
--------------------------------------------------------
--  Constraints for Table DEVIS
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."DEVIS" ADD PRIMARY KEY ("ID_DEVIS")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
--------------------------------------------------------
--  Constraints for Table PRISE_EN_CHARGE
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."PRISE_EN_CHARGE" ADD PRIMARY KEY ("ID_PEC")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
--------------------------------------------------------
--  Constraints for Table AGENT
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."AGENT" ADD PRIMARY KEY ("ID_AGENT")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
--------------------------------------------------------
--  Constraints for Table MALADIE_SPECIALE
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."MALADIE_SPECIALE" ADD PRIMARY KEY ("ID_MALADIE")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
--------------------------------------------------------
--  Constraints for Table DEVIS_DENTAIRE
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."DEVIS_DENTAIRE" ADD PRIMARY KEY ("ID_DEVIS")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
--------------------------------------------------------
--  Constraints for Table ETABLISSEMENT
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."ETABLISSEMENT" ADD PRIMARY KEY ("ID_ETABLISSEMENT")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
--------------------------------------------------------
--  Constraints for Table ENTITE
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."ENTITE" ADD PRIMARY KEY ("ID_ENTITE")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
--------------------------------------------------------
--  Constraints for Table REMBOURSEMENT
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."REMBOURSEMENT" ADD PRIMARY KEY ("ID_REMBOURSEMENT")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
--------------------------------------------------------
--  Constraints for Table CARTE_MUTUELLE
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."CARTE_MUTUELLE" ADD PRIMARY KEY ("ID_CARTE")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
--------------------------------------------------------
--  Constraints for Table MEDICAMENT
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."MEDICAMENT" ADD PRIMARY KEY ("ID_MEDICAMENT")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
--------------------------------------------------------
--  Constraints for Table CHATBOT
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."CHATBOT" ADD PRIMARY KEY ("ID_CHAT")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  TABLESPACE "USERS"  ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table ADHERENT
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."ADHERENT" ADD FOREIGN KEY ("ID_USER")
	  REFERENCES "GESTION_MUTUELLE"."UTILISATEUR" ("ID_USER") ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table AGENT
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."AGENT" ADD FOREIGN KEY ("ID_USER")
	  REFERENCES "GESTION_MUTUELLE"."UTILISATEUR" ("ID_USER") ENABLE;
  ALTER TABLE "GESTION_MUTUELLE"."AGENT" ADD FOREIGN KEY ("ID_ENTITE")
	  REFERENCES "GESTION_MUTUELLE"."ENTITE" ("ID_ENTITE") ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table ANALYSE
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."ANALYSE" ADD FOREIGN KEY ("ID_BENEFICIAIRE")
	  REFERENCES "GESTION_MUTUELLE"."BENEFICIAIRE" ("ID_BENEFICIAIRE") ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table BENEFICIAIRE
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."BENEFICIAIRE" ADD FOREIGN KEY ("ID_ADHERENT")
	  REFERENCES "GESTION_MUTUELLE"."ADHERENT" ("ID_ADHERENT") ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table CARTE_MUTUELLE
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."CARTE_MUTUELLE" ADD FOREIGN KEY ("ID_ADHERENT")
	  REFERENCES "GESTION_MUTUELLE"."ADHERENT" ("ID_ADHERENT") ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table CHATBOT
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."CHATBOT" ADD FOREIGN KEY ("ID_USER")
	  REFERENCES "GESTION_MUTUELLE"."UTILISATEUR" ("ID_USER") ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table DEVIS
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."DEVIS" ADD FOREIGN KEY ("ID_BENEFICIAIRE")
	  REFERENCES "GESTION_MUTUELLE"."BENEFICIAIRE" ("ID_BENEFICIAIRE") ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table DEVIS_DENTAIRE
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."DEVIS_DENTAIRE" ADD FOREIGN KEY ("ID_DEVIS")
	  REFERENCES "GESTION_MUTUELLE"."DEVIS" ("ID_DEVIS") ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table DEVIS_OPTIQUE
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."DEVIS_OPTIQUE" ADD FOREIGN KEY ("ID_DEVIS")
	  REFERENCES "GESTION_MUTUELLE"."DEVIS" ("ID_DEVIS") ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table MALADIE_SPECIALE
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."MALADIE_SPECIALE" ADD FOREIGN KEY ("ID_BENEFICIAIRE")
	  REFERENCES "GESTION_MUTUELLE"."BENEFICIAIRE" ("ID_BENEFICIAIRE") ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table MEDECIN
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."MEDECIN" ADD FOREIGN KEY ("ID_ETABLISSEMENT")
	  REFERENCES "GESTION_MUTUELLE"."ETABLISSEMENT" ("ID_ETABLISSEMENT") ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table ORDONNANCE
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."ORDONNANCE" ADD FOREIGN KEY ("ID_BENEFICIAIRE")
	  REFERENCES "GESTION_MUTUELLE"."BENEFICIAIRE" ("ID_BENEFICIAIRE") ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table PRISE_EN_CHARGE
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."PRISE_EN_CHARGE" ADD FOREIGN KEY ("ID_BENEFICIAIRE")
	  REFERENCES "GESTION_MUTUELLE"."BENEFICIAIRE" ("ID_BENEFICIAIRE") ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table RADIO
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."RADIO" ADD FOREIGN KEY ("ID_BENEFICIAIRE")
	  REFERENCES "GESTION_MUTUELLE"."BENEFICIAIRE" ("ID_BENEFICIAIRE") ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table REMBOURSEMENT
--------------------------------------------------------

  ALTER TABLE "GESTION_MUTUELLE"."REMBOURSEMENT" ADD FOREIGN KEY ("ID_BENEFICIAIRE")
	  REFERENCES "GESTION_MUTUELLE"."BENEFICIAIRE" ("ID_BENEFICIAIRE") ENABLE;
