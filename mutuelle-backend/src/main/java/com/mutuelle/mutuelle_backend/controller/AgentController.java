package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.*;
import com.mutuelle.mutuelle_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agents")
@CrossOrigin(origins = "http://localhost:3000")
public class AgentController {

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdherentRepository adherentRepository;

    @Autowired
    private BeneficiaireRepository beneficiaireRepository;

    @Autowired
    private DevisRepository devisRepository;

    @Autowired
    private DevisDentaireRepository devisDentaireRepository;

    @Autowired
    private DevisOptiqueRepository devisOptiqueRepository;

    @Autowired
    private RemboursementRepository remboursementRepository;

    @Autowired
    private RadioRepository radioRepository;

    @Autowired
    private PriseEnChargeRepository priseEnChargeRepository;

    @Autowired
    private MaladieSpecialeRepository maladieSpecialeRepository;

    @Autowired
    private AnalyseRepository analyseRepository;

    @Autowired
    private OrdonnanceRepository ordonnanceRepository;

    @Autowired
    private CarteMutuelleRepository carteMutuelleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public List<Agent> getAllAgents() {
        return agentRepository.findAll();
    }

    private User getOrCreateUserForAgent(Agent agent) {
        String email = agent.getEmail();
        if (email == null || email.trim().isEmpty()) {
            String matricule = agent.getMatricule();
            email = (matricule != null ? matricule.toLowerCase() : "agent_" + System.currentTimeMillis()) + "@radeema.ma";
            agent.setEmail(email);
        }

        User user = null;
        if (agent.getIdUser() != null) {
            user = userRepository.findById(agent.getIdUser()).orElse(null);
        }
        if (user == null) {
            user = userRepository.findByUsername(email).orElse(null);
        }

        if (user == null) {
            user = new User();
            user.setUsername(email);
            user.setPassword(passwordEncoder.encode("123456")); // default password
            user.setRole("ROLE_CLIENT"); // every agent/user is an adherent
            user.setStatut("Actif");
            user.setDateCreation(new java.util.Date());
        }

        user.setNom(agent.getNom());
        user.setPrenom(agent.getPrenom());
        return userRepository.save(user);
    }

    private Adherent ensureAdherentExistsForUser(User user, Agent agent) {
        Adherent adherent = adherentRepository.findByIdUser(user.getId()).orElse(null);
        if (adherent == null) {
            adherent = new Adherent();
            adherent.setIdUser(user.getId());
            adherent.setNumeroAdherent("ADH-" + (agent.getMatricule() != null ? agent.getMatricule() : user.getId().toString()));
            adherent = adherentRepository.save(adherent);
        } else {
            adherent.setNumeroAdherent("ADH-" + (agent.getMatricule() != null ? agent.getMatricule() : user.getId().toString()));
            adherent = adherentRepository.save(adherent);
        }
        return adherent;
    }

    private void ensureSelfBeneficiaireExists(Agent agent, Adherent adherent) {
        List<Beneficiaire> list = beneficiaireRepository.findByIdAgent(agent.getIdAgent());
        boolean hasSelf = false;
        if (list != null) {
            for (Beneficiaire b : list) {
                if ("Lui-même".equals(b.getLienParente())) {
                    hasSelf = true;
                    b.setNom(agent.getNom());
                    b.setPrenom(agent.getPrenom());
                    b.setDateNaissance(agent.getDateNaissance());
                    b.setIdAdherent(adherent.getIdAdherent());
                    beneficiaireRepository.save(b);
                    break;
                }
            }
        }
        if (!hasSelf) {
            Beneficiaire self = new Beneficiaire();
            self.setIdAgent(agent.getIdAgent());
            self.setIdAdherent(adherent.getIdAdherent());
            self.setNom(agent.getNom());
            self.setPrenom(agent.getPrenom());
            self.setLienParente("Lui-même");
            self.setDateNaissance(agent.getDateNaissance());
            beneficiaireRepository.save(self);
        }
    }

    @PostMapping
    public Agent createAgent(@RequestBody Agent agent) {
        // Save agent first to get an ID if needed, but we can do it after user
        User user = getOrCreateUserForAgent(agent);
        agent.setIdUser(user.getId());
        
        Adherent adherent = ensureAdherentExistsForUser(user, agent);
        
        Agent savedAgent = agentRepository.save(agent);
        
        ensureSelfBeneficiaireExists(savedAgent, adherent);
        
        return savedAgent;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Agent> updateAgent(@PathVariable Long id, @RequestBody Agent agentDetails) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agent not found with id " + id));

        agent.setMatricule(agentDetails.getMatricule());
        agent.setNom(agentDetails.getNom());
        agent.setPrenom(agentDetails.getPrenom());
        agent.setSituationFamiliale(agentDetails.getSituationFamiliale());
        agent.setDateNaissance(agentDetails.getDateNaissance());
        agent.setTelephone(agentDetails.getTelephone());
        agent.setDateRecrutement(agentDetails.getDateRecrutement());
        agent.setDateTitularisation(agentDetails.getDateTitularisation());
        agent.setDateEntreeRegie(agentDetails.getDateEntreeRegie());
        agent.setVille(agentDetails.getVille());
        agent.setAdresse(agentDetails.getAdresse());
        agent.setStatut(agentDetails.getStatut());
        agent.setIdEntite(agentDetails.getIdEntite());
        agent.setIdService(agentDetails.getIdService());
        agent.setEmail(agentDetails.getEmail());

        User user = getOrCreateUserForAgent(agent);
        agent.setIdUser(user.getId());
        
        Adherent adherent = ensureAdherentExistsForUser(user, agent);

        Agent updatedAgent = agentRepository.save(agent);
        
        ensureSelfBeneficiaireExists(updatedAgent, adherent);
        
        return ResponseEntity.ok(updatedAgent);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAgent(@PathVariable Long id) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agent not found with id " + id));

        // Delete beneficiaries associated with the agent first
        try {
            List<Beneficiaire> beneficiaries = beneficiaireRepository.findByIdAgent(id);
            if (beneficiaries != null && !beneficiaries.isEmpty()) {
                for (Beneficiaire b : beneficiaries) {
                    Long bid = b.getIdBeneficiaire();
                    if (bid != null) {
                        // Delete devis dentaires & devis optiques
                        List<Devis> devisList = devisRepository.findByIdBeneficiaire(bid);
                        if (devisList != null) {
                            for (Devis d : devisList) {
                                devisDentaireRepository.findById(d.getIdDevis()).ifPresent(dd -> devisDentaireRepository.delete(dd));
                                devisOptiqueRepository.findById(d.getIdDevis()).ifPresent(doOpt -> devisOptiqueRepository.delete(doOpt));
                                devisRepository.delete(d);
                            }
                        }

                        // Delete other requests
                        remboursementRepository.deleteAll(remboursementRepository.findByIdBeneficiaire(bid));
                        radioRepository.deleteAll(radioRepository.findByIdBeneficiaire(bid));
                        priseEnChargeRepository.deleteAll(priseEnChargeRepository.findByIdBeneficiaire(bid));
                        maladieSpecialeRepository.deleteAll(maladieSpecialeRepository.findByIdBeneficiaire(bid));
                        analyseRepository.deleteAll(analyseRepository.findByIdBeneficiaire(bid));
                        ordonnanceRepository.deleteAll(ordonnanceRepository.findByIdBeneficiaire(bid));
                        carteMutuelleRepository.deleteAll(carteMutuelleRepository.findByIdBeneficiaire(bid));
                    }
                }
                beneficiaireRepository.deleteAll(beneficiaries);
            }
        } catch (Exception e) {
            System.err.println("Could not delete beneficiaries: " + e.getMessage());
        }

        Long idUser = agent.getIdUser();
        if (idUser != null) {
            // Delete Adherent
            try {
                adherentRepository.findByIdUser(idUser).ifPresent(adherent -> {
                    adherentRepository.delete(adherent);
                });
            } catch (Exception e) {
                System.err.println("Could not delete Adherent: " + e.getMessage());
            }

            // Unlink agent from user before deleting user
            agent.setIdUser(null);
            agentRepository.save(agent);

            // Delete User
            try {
                userRepository.findById(idUser).ifPresent(user -> {
                    userRepository.delete(user);
                });
            } catch (Exception e) {
                System.err.println("Could not delete User: " + e.getMessage());
            }
        }

        agentRepository.delete(agent);
        return ResponseEntity.ok().build();
    }
}
