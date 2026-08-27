package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.DevisOptique;
import com.mutuelle.mutuelle_backend.model.User;
import com.mutuelle.mutuelle_backend.model.Agent;
import com.mutuelle.mutuelle_backend.model.Adherent;
import com.mutuelle.mutuelle_backend.model.Beneficiaire;
import com.mutuelle.mutuelle_backend.repository.DevisOptiqueRepository;
import com.mutuelle.mutuelle_backend.repository.UserRepository;
import com.mutuelle.mutuelle_backend.repository.AgentRepository;
import com.mutuelle.mutuelle_backend.repository.AdherentRepository;
import com.mutuelle.mutuelle_backend.repository.BeneficiaireRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/devis-optique")
public class DevisOptiqueController {

    @Autowired
    private DevisOptiqueRepository repository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private AdherentRepository adherentRepository;

    @Autowired
    private BeneficiaireRepository beneficiaireRepository;

    private void resolveBeneficiaireIfNull(DevisOptique devis) {
        if (devis.getIdBeneficiaire() == null) {
            try {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated()) {
                    String username = auth.getName();
                    User user = userRepository.findByUsername(username).orElse(null);
                    if (user == null) {
                        Agent agent = agentRepository.findByMatricule(username).orElse(null);
                        if (agent != null && agent.getIdUser() != null) {
                            user = userRepository.findById(agent.getIdUser()).orElse(null);
                        }
                    }
                    if (user != null) {
                        Adherent adherent = adherentRepository.findByIdUser(user.getId()).orElse(null);
                        Agent agent = agentRepository.findByIdUser(user.getId()).orElse(null);
                        if (adherent != null && agent != null) {
                            List<Beneficiaire> beneficiaries = beneficiaireRepository.findByIdAgent(agent.getIdAgent());
                            Beneficiaire selfBene = null;
                            if (beneficiaries != null) {
                                for (Beneficiaire b : beneficiaries) {
                                    if ("Lui-même".equals(b.getLienParente())) {
                                        selfBene = b;
                                        break;
                                    }
                                }
                            }
                            if (selfBene == null) {
                                selfBene = new Beneficiaire();
                                selfBene.setIdAgent(agent.getIdAgent());
                                selfBene.setIdAdherent(adherent.getIdAdherent());
                                selfBene.setNom(agent.getNom());
                                selfBene.setPrenom(agent.getPrenom());
                                selfBene.setLienParente("Lui-même");
                                selfBene.setDateNaissance(agent.getDateNaissance());
                                selfBene = beneficiaireRepository.save(selfBene);
                            }
                            devis.setIdBeneficiaire(selfBene.getIdBeneficiaire());
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Error resolving beneficiary: " + e.getMessage());
            }
        }
    }

    @GetMapping
    public List<DevisOptique> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public DevisOptique create(@RequestBody DevisOptique devis) {
        resolveBeneficiaireIfNull(devis);
        return repository.save(devis);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DevisOptique> update(@PathVariable Long id, @RequestBody DevisOptique devisDetails) {
        DevisOptique devis = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Devis not found with id " + id));

        devis.setIdBeneficiaire(devisDetails.getIdBeneficiaire());
        devis.setDateDevis(devisDetails.getDateDevis());
        devis.setDateDepot(devisDetails.getDateDepot());
        devis.setDateReponse(devisDetails.getDateReponse());
        devis.setEtatReponse(devisDetails.getEtatReponse());
        devis.setMontant(devisDetails.getMontant());
        devis.setScan(devisDetails.getScan());
        devis.setObservation(devisDetails.getObservation());
        devis.setTypeOptique(devisDetails.getTypeOptique());
        devis.setMotifRefus(devisDetails.getMotifRefus());

        resolveBeneficiaireIfNull(devis);
        return ResponseEntity.ok(repository.save(devis));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        DevisOptique devis = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Devis not found with id " + id));
        repository.delete(devis);
        return ResponseEntity.ok().build();
    }
}
