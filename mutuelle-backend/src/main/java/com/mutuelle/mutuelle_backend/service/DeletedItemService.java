package com.mutuelle.mutuelle_backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mutuelle.mutuelle_backend.model.*;
import com.mutuelle.mutuelle_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class DeletedItemService {

    @Autowired private DeletedItemRepository deletedItemRepository;
    @Autowired private AgentRepository agentRepository;
    @Autowired private DevisDentaireRepository devisDentaireRepository;
    @Autowired private DevisOptiqueRepository devisOptiqueRepository;
    @Autowired private RemboursementRepository remboursementRepository;
    @Autowired private RadioRepository radioRepository;
    @Autowired private PriseEnChargeRepository priseEnChargeRepository;
    @Autowired private MaladieSpecialeRepository maladieSpecialeRepository;
    @Autowired private AnalyseRepository analyseRepository;
    @Autowired private OrdonnanceRepository ordonnanceRepository;
    @Autowired private CarteMutuelleRepository carteMutuelleRepository;
    @Autowired private EtablissementRepository etablissementRepository;
    @Autowired private MedecinRepository medecinRepository;
    @Autowired private DirectionRepository directionRepository;
    @Autowired private DepartementRepository departementRepository;
    @Autowired private DivisionRepository divisionRepository;
    @Autowired private ServiceRepository serviceRepository;
    @Autowired private EntiteRepository entiteRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private BeneficiaireRepository beneficiaireRepository;
    @Autowired private AdherentRepository adherentRepository;

    private String getCurrentUser() {
        try {
            org.springframework.security.core.Authentication auth = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                return auth.getName();
            }
        } catch (Exception e) {
            // Context not available or anonymous
        }
        return "Admin";
    }

    public List<DeletedItem> getAllDeletedItems() {
        return deletedItemRepository.findAll();
    }

    @Transactional
    public void archiveEntity(String controllerName, Long id) {
        String entityName = controllerName.replace("Controller", "");
        Object entity = null;
        String displayName = entityName + " #" + id;

        switch (entityName) {
            case "Agent":
                entity = agentRepository.findById(id).orElse(null);
                if (entity != null) {
                    Agent a = (Agent) entity;
                    displayName = a.getMatricule() + " - " + a.getNom() + " " + a.getPrenom();
                    
                    Map<String, Object> archiveData = new HashMap<>();
                    archiveData.put("agent", a);
                    
                    List<Beneficiaire> beneficiaries = beneficiaireRepository.findByIdAgent(id);
                    archiveData.put("beneficiaries", beneficiaries);
                    
                    if (a.getIdUser() != null) {
                        userRepository.findById(a.getIdUser()).ifPresent(u -> archiveData.put("user", u));
                        adherentRepository.findByIdUser(a.getIdUser()).ifPresent(adh -> archiveData.put("adherent", adh));
                    }
                    entity = archiveData;
                }
                break;
            case "DevisDentaire":
                entity = devisDentaireRepository.findById(id).orElse(null);
                if (entity != null) {
                    DevisDentaire d = (DevisDentaire) entity;
                    displayName = "Devis Dentaire #" + id + " (" + d.getMontant() + " DH)";
                }
                break;
            case "DevisOptique":
                entity = devisOptiqueRepository.findById(id).orElse(null);
                if (entity != null) {
                    DevisOptique d = (DevisOptique) entity;
                    displayName = "Devis Optique #" + id + " (" + d.getMontant() + " DH)";
                }
                break;
            case "Remboursement":
                entity = remboursementRepository.findById(id).orElse(null);
                if (entity != null) {
                    Remboursement r = (Remboursement) entity;
                    displayName = "Remboursement #" + id + " (" + r.getMontantDemande() + " DH)";
                }
                break;
            case "Radio":
                entity = radioRepository.findById(id).orElse(null);
                if (entity != null) {
                    Radio r = (Radio) entity;
                    displayName = "Radio #" + id + " (" + r.getStatut() + ")";
                }
                break;
            case "PriseEnCharge":
                entity = priseEnChargeRepository.findById(id).orElse(null);
                if (entity != null) {
                    PriseEnCharge pec = (PriseEnCharge) entity;
                    displayName = "Prise en charge #" + id + " (" + pec.getStatut() + ")";
                }
                break;
            case "MaladieSpeciale":
                entity = maladieSpecialeRepository.findById(id).orElse(null);
                if (entity != null) {
                    MaladieSpeciale ms = (MaladieSpeciale) entity;
                    displayName = "Maladie Spéciale #" + id + " (" + ms.getType() + ")";
                }
                break;
            case "Analyse":
                entity = analyseRepository.findById(id).orElse(null);
                if (entity != null) {
                    Analyse a = (Analyse) entity;
                    displayName = "Analyse #" + id + " (Total: " + a.getTotal() + " DH)";
                }
                break;
            case "Ordonnance":
                entity = ordonnanceRepository.findById(id).orElse(null);
                if (entity != null) {
                    Ordonnance o = (Ordonnance) entity;
                    displayName = "Ordonnance #" + id + " (" + o.getNumeroOrdonnance() + ")";
                }
                break;
            case "CarteMutuelle":
                entity = carteMutuelleRepository.findById(id).orElse(null);
                if (entity != null) {
                    CarteMutuelle cm = (CarteMutuelle) entity;
                    displayName = "Carte Mutuelle #" + id + " (" + cm.getStatut() + ")";
                }
                break;
            case "Etablissement":
                entity = etablissementRepository.findById(id).orElse(null);
                if (entity != null) {
                    displayName = ((Etablissement) entity).getRaisonSociale();
                }
                break;
            case "Medecin":
                entity = medecinRepository.findById(id).orElse(null);
                if (entity != null) {
                    Medecin m = (Medecin) entity;
                    displayName = m.getNom() + " " + m.getPrenom();
                }
                break;
            case "Direction":
                entity = directionRepository.findById(id).orElse(null);
                if (entity != null) {
                    displayName = ((Direction) entity).getNom();
                }
                break;
            case "Departement":
                entity = departementRepository.findById(id).orElse(null);
                if (entity != null) {
                    displayName = ((Departement) entity).getNom();
                }
                break;
            case "Division":
                entity = divisionRepository.findById(id).orElse(null);
                if (entity != null) {
                    displayName = ((Division) entity).getNom();
                }
                break;
            case "Service":
                entity = serviceRepository.findById(id).orElse(null);
                if (entity != null) {
                    displayName = ((com.mutuelle.mutuelle_backend.model.Service) entity).getNom();
                }
                break;
            case "Entite":
                entity = entiteRepository.findById(id).orElse(null);
                if (entity != null) {
                    displayName = ((Entite) entity).getNom();
                }
                break;
            case "User":
                entity = userRepository.findById(id).orElse(null);
                if (entity != null) {
                    displayName = ((User) entity).getUsername();
                }
                break;
            default:
                break;
        }

        if (entity != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                String json = mapper.writeValueAsString(entity);

                DeletedItem item = new DeletedItem();
                item.setEntityName(entityName);
                item.setEntityId(id);
                item.setDisplayName(displayName);
                item.setDeletedAt(new Date());
                item.setDeletedBy(getCurrentUser());
                item.setJsonData(json);

                deletedItemRepository.save(item);
            } catch (Exception e) {
                System.err.println("Error archiving entity: " + e.getMessage());
            }
        }
    }

    @Transactional
    public void restoreItem(Long id) throws Exception {
        DeletedItem item = deletedItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Deleted item not found with id " + id));

        ObjectMapper mapper = new ObjectMapper();
        String json = item.getJsonData();
        String type = item.getEntityName();

        switch (type) {
            case "Agent":
                Map<String, Object> archiveData = mapper.readValue(json, Map.class);
                
                // 1. Restore User
                User u = mapper.convertValue(archiveData.get("user"), User.class);
                if (u != null) {
                    userRepository.save(u);
                }
                
                // 2. Restore Adherent
                Adherent adh = mapper.convertValue(archiveData.get("adherent"), Adherent.class);
                if (adh != null) {
                    adherentRepository.save(adh);
                }
                
                // 3. Restore Agent
                Agent agent = mapper.convertValue(archiveData.get("agent"), Agent.class);
                if (agent != null) {
                    agentRepository.save(agent);
                }
                
                // 4. Restore Beneficiaries
                List<?> beneficiariesRaw = (List<?>) archiveData.get("beneficiaries");
                if (beneficiariesRaw != null) {
                    for (Object bRaw : beneficiariesRaw) {
                        Beneficiaire b = mapper.convertValue(bRaw, Beneficiaire.class);
                        beneficiaireRepository.save(b);
                    }
                }
                break;
            case "DevisDentaire":
                DevisDentaire dd = mapper.readValue(json, DevisDentaire.class);
                devisDentaireRepository.save(dd);
                break;
            case "DevisOptique":
                DevisOptique dop = mapper.readValue(json, DevisOptique.class);
                devisOptiqueRepository.save(dop);
                break;
            case "Remboursement":
                Remboursement r = mapper.readValue(json, Remboursement.class);
                remboursementRepository.save(r);
                break;
            case "Radio":
                Radio rad = mapper.readValue(json, Radio.class);
                radioRepository.save(rad);
                break;
            case "PriseEnCharge":
                PriseEnCharge pec = mapper.readValue(json, PriseEnCharge.class);
                priseEnChargeRepository.save(pec);
                break;
            case "MaladieSpeciale":
                MaladieSpeciale ms = mapper.readValue(json, MaladieSpeciale.class);
                maladieSpecialeRepository.save(ms);
                break;
            case "Analyse":
                Analyse ana = mapper.readValue(json, Analyse.class);
                analyseRepository.save(ana);
                break;
            case "Ordonnance":
                Ordonnance ord = mapper.readValue(json, Ordonnance.class);
                ordonnanceRepository.save(ord);
                break;
            case "CarteMutuelle":
                CarteMutuelle cm = mapper.readValue(json, CarteMutuelle.class);
                carteMutuelleRepository.save(cm);
                break;
            case "Etablissement":
                Etablissement et = mapper.readValue(json, Etablissement.class);
                etablissementRepository.save(et);
                break;
            case "Medecin":
                Medecin med = mapper.readValue(json, Medecin.class);
                medecinRepository.save(med);
                break;
            case "Direction":
                Direction dir = mapper.readValue(json, Direction.class);
                directionRepository.save(dir);
                break;
            case "Departement":
                Departement dep = mapper.readValue(json, Departement.class);
                departementRepository.save(dep);
                break;
            case "Division":
                Division div = mapper.readValue(json, Division.class);
                divisionRepository.save(div);
                break;
            case "Service":
                com.mutuelle.mutuelle_backend.model.Service srv = mapper.readValue(json, com.mutuelle.mutuelle_backend.model.Service.class);
                serviceRepository.save(srv);
                break;
            case "Entite":
                Entite ent = mapper.readValue(json, Entite.class);
                entiteRepository.save(ent);
                break;
            case "User":
                User usr = mapper.readValue(json, User.class);
                userRepository.save(usr);
                break;
            default:
                throw new IllegalArgumentException("Unknown entity type: " + type);
        }

        deletedItemRepository.delete(item);
    }

    public void purgeItem(Long id) {
        DeletedItem item = deletedItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Deleted item not found with id " + id));
        deletedItemRepository.delete(item);
    }
}
