package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.Agent;
import com.mutuelle.mutuelle_backend.model.Beneficiaire;
import com.mutuelle.mutuelle_backend.model.Devis;
import com.mutuelle.mutuelle_backend.model.PriseEnCharge;
import com.mutuelle.mutuelle_backend.model.Remboursement;
import com.mutuelle.mutuelle_backend.model.Ordonnance;
import com.mutuelle.mutuelle_backend.model.Analyse;
import com.mutuelle.mutuelle_backend.model.CarteMutuelle;
import com.mutuelle.mutuelle_backend.model.Radio;
import com.mutuelle.mutuelle_backend.model.Etablissement;
import com.mutuelle.mutuelle_backend.model.Medecin;
import com.mutuelle.mutuelle_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/chatbot")
@CrossOrigin("*")
public class ChatbotController {

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private BeneficiaireRepository beneficiaireRepository;

    @Autowired
    private DevisRepository devisRepository;

    @Autowired
    private RemboursementRepository remboursementRepository;

    @Autowired
    private PriseEnChargeRepository priseEnChargeRepository;

    @Autowired
    private OrdonnanceRepository ordonnanceRepository;

    @Autowired
    private AnalyseRepository analyseRepository;

    @Autowired
    private CarteMutuelleRepository carteMutuelleRepository;

    @Autowired
    private RadioRepository radioRepository;

    @Autowired
    private EtablissementRepository etablissementRepository;

    @Autowired
    private MedecinRepository medecinRepository;

    @PostMapping("/query")
    public Object query(@RequestBody Map<String, Object> request) {
        String question = request.get("question") != null ? request.get("question").toString().toLowerCase() : "";

        if (question.contains("agent") || question.contains("matricule") || question.contains("ca") || question.contains("a1") || question.contains("devis") || question.contains("remboursement") || question.contains("prise en charge") || question.contains("ordonnance") || question.contains("analyse") || question.contains("carte") || question.contains("radio")) {
            String[] parts = question.split(" ");
            String matricule = parts[parts.length - 1]; 

            Optional<Agent> agent = agentRepository.findByMatricule(matricule.toUpperCase());

            if (agent.isPresent()) {
                Agent a = agent.get();
                StringBuilder data = new StringBuilder();
                data.append("Agent trouvé : ").append(a.getNomComplet()).append(", Téléphone: ").append(a.getTelephone()).append(". ");
                
                List<Beneficiaire> beneficiaires = beneficiaireRepository.findByIdAgent(a.getIdAgent());
                if(beneficiaires.isEmpty()) {
                    data.append("Cet agent n'a aucun bénéficiaire enregistré. ");
                } else {
                    data.append("Dossiers associés : ");
                    for (Beneficiaire b : beneficiaires) {
                        data.append("[Bénéficiaire ").append(b.getNom()).append(" ").append(b.getPrenom()).append(" - ");
                        
                        List<Devis> devisList = devisRepository.findByIdBeneficiaire(b.getIdBeneficiaire());
                        if (!devisList.isEmpty()) {
                            data.append("Devis: ");
                            for (Devis d : devisList) {
                                data.append(d.getMontant()).append(" DHS (").append(d.getEtatReponse()).append("), ");
                            }
                        }
                        
                        List<Remboursement> rembList = remboursementRepository.findByIdBeneficiaire(b.getIdBeneficiaire());
                        if (!rembList.isEmpty()) {
                            data.append("Remboursements: ");
                            for (Remboursement r : rembList) {
                                data.append(r.getMontantDemande()).append(" DHS (").append(r.getStatut()).append("), ");
                            }
                        }
                        
                        List<PriseEnCharge> pecList = priseEnChargeRepository.findByIdBeneficiaire(b.getIdBeneficiaire());
                        if (!pecList.isEmpty()) {
                            data.append("PriseEnCharge: ");
                            for (PriseEnCharge p : pecList) {
                                data.append(p.getMontantEstime()).append(" DHS (").append(p.getStatut()).append("), ");
                            }
                        }

                        List<Ordonnance> ordList = ordonnanceRepository.findByIdBeneficiaire(b.getIdBeneficiaire());
                        if (!ordList.isEmpty()) {
                            data.append("Ordonnances: ");
                            for (Ordonnance o : ordList) {
                                data.append(o.getNumeroOrdonnance()).append(" (").append(o.getMontantTotal()).append(" DHS), ");
                            }
                        }

                        List<Analyse> analyseList = analyseRepository.findByIdBeneficiaire(b.getIdBeneficiaire());
                        if (!analyseList.isEmpty()) {
                            data.append("Analyses: ");
                            for (Analyse an : analyseList) {
                                data.append(an.getTotal()).append(" DHS, ");
                            }
                        }

                        List<CarteMutuelle> carteList = carteMutuelleRepository.findByIdBeneficiaire(b.getIdBeneficiaire());
                        if (!carteList.isEmpty()) {
                            data.append("Cartes: ");
                            for (CarteMutuelle c : carteList) {
                                data.append(c.getTypeDemande()).append(" (").append(c.getStatut()).append("), ");
                            }
                        }

                        List<Radio> radioList = radioRepository.findByIdBeneficiaire(b.getIdBeneficiaire());
                        if (!radioList.isEmpty()) {
                            data.append("Radios: ");
                            for (Radio rd : radioList) {
                                data.append(rd.getTypeRadio()).append(" (").append(rd.getStatut()).append("), ");
                            }
                        }

                        data.append("] ");
                    }
                }

                Map<String, Object> response = new HashMap<>();
                response.put("found", true);
                response.put("data", data.toString());
                return response;
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("found", false);
                error.put("data", "Aucun agent trouvé avec le matricule " + matricule);
                return error;
            }
        } else if (question.contains("etablissement")) {
            String[] parts = question.split(" ");
            String nomEtablissement = parts[parts.length - 1]; 
            List<Etablissement> etablissements = etablissementRepository.findByRaisonSocialeContainingIgnoreCase(nomEtablissement);
            
            if (!etablissements.isEmpty()) {
                StringBuilder data = new StringBuilder("Etablissements trouvés : ");
                for (Etablissement e : etablissements) {
                    data.append(e.getRaisonSociale()).append(" - Adresse: ").append(e.getAdresse()).append(" - Tel: ").append(e.getTelephone()).append(" (Convention: ").append(e.getConvention()).append("), ");
                }
                Map<String, Object> response = new HashMap<>();
                response.put("found", true);
                response.put("data", data.toString());
                return response;
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("found", false);
                error.put("data", "Aucun établissement trouvé avec le nom " + nomEtablissement);
                return error;
            }
        } else if (question.contains("medecin")) {
            String[] parts = question.split(" ");
            String nomMedecin = parts[parts.length - 1]; 
            List<Medecin> medecins = medecinRepository.findByNomContainingIgnoreCase(nomMedecin);
            
            if (!medecins.isEmpty()) {
                StringBuilder data = new StringBuilder("Médecins trouvés : ");
                for (Medecin m : medecins) {
                    data.append("Dr. ").append(m.getNom()).append(" ").append(m.getPrenom()).append(" - Spécialité: ").append(m.getSpecialite()).append(" - Tel: ").append(m.getTelephone()).append(", ");
                }
                Map<String, Object> response = new HashMap<>();
                response.put("found", true);
                response.put("data", data.toString());
                return response;
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("found", false);
                error.put("data", "Aucun médecin trouvé avec le nom " + nomMedecin);
                return error;
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("found", false);
        response.put("data", "Aucune information spécifique demandée.");
        return response;
    }

    @PostMapping("/proxy-n8n")
    public Object proxyToN8n(@RequestBody Map<String, Object> request) {
        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
        String n8nUrl = "http://localhost:5678/webhook-test/chat"; 
        
        try {
            return restTemplate.postForObject(n8nUrl, request, Object.class);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "n8n est injoignable.");
            return error;
        }
    }
}
