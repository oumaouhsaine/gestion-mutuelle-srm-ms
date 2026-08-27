# Détail des Acteurs et de leur Dashboard (SRM-MS)

Ce document répertorie pour chaque acteur du système de la mutuelle **SRM-MS** ses actions autorisées ainsi que la composition exacte de son tableau de bord (Dashboard) et de son menu latéral (Sidebar).

---

## 1. L'Adhérent 

L'adhérent accède au système principalement via son espace client web dédié ou son application mobile.

### Ce qu'il fait (Actions autorisées)
- Se connecter à son espace personnel de couverture santé.
- Soumettre des demandes de devis complexes (Devis Dentaire et Devis Optique) en renseignant les détails techniques de l'acte et en joignant un justificatif scanné.
- Consulter en temps réel l'avancement de ses dossiers de remboursement.
- Consulter l'historique complet de ses remboursements validés ou rejetés.
- Rechercher des médicaments pour connaître leur statut de remboursement.
- Modifier son mot de passe ou mettre à jour son profil de contact.
- Interroger le Chatbot intelligent pour s'informer sur les remboursements de façon interactive.



## 2. L'Opérateur (Gestionnaire)

L'opérateur est l'utilisateur principal du backoffice web, chargé de la saisie et de la vérification quotidienne des dossiers de remboursement physiques et numériques.

### Ce qu'il fait (Actions autorisées)
- modifier et supprimer les fiches d'agents (adhérents) et lier leurs bénéficiaires 
-modifier et supprimer les dossiers d'examens médicaux (Ordonnances, Analyses, Radiographies).
- modifier et supprimer les demandes de devis et remboursements (saisie du montant demandé, calcul du montant accordé selon les règles de couverture de la mutuelle, validation ou rejet).
- modifier et supprimer les dossiers d'ententes préalables et de Prises En Charge (PEC).
- modifier, suspendre et expédier les cartes mutuelles des agents.
- modifier et supprimer l'annuaire des partenaires médicaux conventionnés (Médecins et Établissements).
- modifier et supprimer l'organisation interne (Directions, Départements, Divisions, Services et Entités).
- Utiliser le Chatbot de support.



## 3. Le Consultant (Auditeur)

Le consultant a un rôle de contrôle et d'audit. Il ne peut effectuer aucune modification ou suppression sur la base de données.

### Ce qu'il fait (Actions autorisées)
- Consulter le tableau de bord décisionnel général.
- Visualiser et analyser l'ensemble des données d'activité de la mutuelle (agents, devis, remboursements, etc.) en mode lecture seule.
- Interagir avec le Chatbot d'aide.



## 4. L'Administrateur (Admin)

L'administrateur a le contrôle absolu sur le système. Il cumule les droits d'administration système avec l'ensemble des droits fonctionnels de l'Opérateur et du Consultant.

### Ce qu'il fait (Actions autorisées)
- Toutes les tâches de l'Opérateur (CRUD complet sur les dossiers, agents, cartes et partenaires, remboursements, etablissements, médecins, organisation, ordonnances, prise en charge etc).
- Toutes les tâches du Consultant (visualisation des statistiques).
- Gérer les comptes des utilisateurs de la plateforme (création, modification des rôles : Admin, Opérateur, Consultant, Adhérent, blocage de compte).
- Gérer en exclusivité les dossiers de Maladies Spéciales (ALD / Affections Longue Durée).
- Consulter et analyser les journaux de sécurité (Audit Logs).

