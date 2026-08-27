package com.mutuelle.mutuelle_backend.service;

import com.mutuelle.mutuelle_backend.model.Agent;
import com.mutuelle.mutuelle_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class ChatbotService {

    @Autowired private AgentRepository agentRepository;
    @Autowired private RemboursementRepository remboursementRepository;
    @Autowired private PriseEnChargeRepository pecRepository;
    @Autowired private BeneficiaireRepository beneficiaireRepository;
    @Autowired private MedecinRepository medecinRepository;
    @Autowired private EtablissementRepository etablissementRepository;
    @Autowired private AnalyseRepository analyseRepository;
    @Autowired private MaladieSpecialeRepository maladieSpecialeRepository;

    public String getSmartResponse(String message, String role) {
        String msg = message.toLowerCase();

        // 1. STATISTIQUES (Questions par "combien" ou "nombre")
        if (msg.contains("combien") || msg.contains("nombre")) {
            if (msg.contains("agent")) 
                return "Il y a " + agentRepository.count() + " agents enregistrés.";
            if (msg.contains("remboursement")) 
                return "Le système compte " + remboursementRepository.count() + " dossiers de remboursement.";
            if (msg.contains("prise en charge") || msg.contains("pec")) 
                return "Il y a " + pecRepository.count() + " demandes de PEC.";
            if (msg.contains("médecin") || msg.contains("medecin")) 
                return "Nous travaillons avec " + medecinRepository.count() + " médecins conventionnés.";
            if (msg.contains("établissement") || msg.contains("etablissement") || msg.contains("clinique")) 
                return "Il y a " + etablissementRepository.count() + " établissements de santé partenaires.";
            if (msg.contains("analyse")) 
                return "Le système enregistre " + analyseRepository.count() + " dossiers d'analyses.";
            if (msg.contains("maladie")) 
                return "Il y a " + maladieSpecialeRepository.count() + " dossiers de maladies spéciales suivis.";
            if (msg.contains("bénéficiaire")) 
                return "Nous comptons " + beneficiaireRepository.count() + " bénéficiaires.";
        }

        // 2. RECHERCHE PAR MATRICULE (Ex: "Cherche agent A123")
        if (msg.contains("cherche") || msg.contains("trouve") || msg.contains("matricule")) {
            String[] words = msg.split(" ");
            for (String word : words) {
                if (word.length() >= 3) { // Supposons qu'un matricule fait au moins 3 car.
                    Optional<Agent> agent = agentRepository.findAll().stream()
                        .filter(a -> a.getMatricule().toLowerCase().equals(word))
                        .findFirst();
                    if (agent.isPresent()) {
                        return "L'agent " + agent.get().getNomComplet() + " (Matricule: " + agent.get().getMatricule() + ") est bien enregistré avec le statut : " + agent.get().getStatut() + ".";
                    }
                }
            }
        }

        // 3. CONTACT ET INFORMATIONS
        if (msg.contains("contact") || msg.contains("email") || msg.contains("adresse") || msg.contains("téléphone")) {
            return "Vous pouvez contacter la Mutuelle SRM-MS au 05.XX.XX.XX.XX ou par email à contact@srm-ms.ma. Nos bureaux sont ouverts de 08h30 à 16h30.";
        }

        // 4. AIDE ET CAPACITÉS
        if (msg.contains("aider") || msg.contains("aide") || msg.contains("fait") || msg.contains("peux tu")) {
            return "Je peux répondre à vos questions sur :\n- Les statistiques (agents, médecins, dossiers)\n- La recherche d'un agent par matricule\n- Les infos de contact de la mutuelle\n- Le statut des remboursements et PEC.";
        }

        // 5. SALUTATIONS
        if (msg.contains("bonjour") || msg.contains("salut") || msg.contains("hello") || msg.contains("coucou")) {
            return "Bonjour ! Je suis l'assistant intelligent de la Mutuelle. Comment puis-je vous aider dans votre gestion aujourd'hui ?";
        }

        if (msg.contains("merci") || msg.contains("thanks")) {
            return "De rien ! Je reste à votre disposition si vous avez d'autres questions.";
        }

        // 6. DÉFAUT
        return "Je n'ai pas trouvé de réponse précise. Essayez de me demander : 'Combien de médecins ?', 'Contact mutuelle' ou 'Cherche matricule [Code]'.";
    }
}
