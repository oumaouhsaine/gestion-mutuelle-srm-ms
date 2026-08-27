package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.Beneficiaire;
import com.mutuelle.mutuelle_backend.model.Agent;
import com.mutuelle.mutuelle_backend.model.Adherent;
import com.mutuelle.mutuelle_backend.repository.BeneficiaireRepository;
import com.mutuelle.mutuelle_backend.repository.AgentRepository;
import com.mutuelle.mutuelle_backend.repository.AdherentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beneficiaires")
@CrossOrigin(origins = "http://localhost:3000")
public class BeneficiaireController {

    @Autowired
    private BeneficiaireRepository repository;

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private AdherentRepository adherentRepository;

    @GetMapping
    public List<Beneficiaire> getAll() {
        return repository.findAll();
    }

    private void resolveAdherentForBeneficiaire(Beneficiaire beneficiaire) {
        if (beneficiaire.getIdAgent() != null) {
            agentRepository.findById(beneficiaire.getIdAgent()).ifPresent(agent -> {
                if (agent.getIdUser() != null) {
                    adherentRepository.findByIdUser(agent.getIdUser()).ifPresent(adherent -> {
                        beneficiaire.setIdAdherent(adherent.getIdAdherent());
                    });
                }
            });
        }
    }

    @PostMapping
    public Beneficiaire create(@RequestBody Beneficiaire beneficiaire) {
        resolveAdherentForBeneficiaire(beneficiaire);
        return repository.save(beneficiaire);
    }

    @GetMapping("/agent/{idAgent}")
    public List<Beneficiaire> getByAgentId(@PathVariable Long idAgent) {
        return repository.findByIdAgent(idAgent);
    }

    @PutMapping("/{id}")
    public Beneficiaire update(@PathVariable Long id, @RequestBody Beneficiaire details) {
        Beneficiaire b = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Beneficiaire not found"));
        b.setNom(details.getNom());
        b.setPrenom(details.getPrenom());
        b.setLienParente(details.getLienParente());
        b.setDateNaissance(details.getDateNaissance());
        b.setIdAgent(details.getIdAgent());
        b.setEstSalarie(details.getEstSalarie());
        b.setLieuNaissance(details.getLieuNaissance());
        resolveAdherentForBeneficiaire(b);
        return repository.save(b);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
