package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.*;
import com.mutuelle.mutuelle_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "http://localhost:3000")
public class StatsController {

    @Autowired private DevisRepository devisRepository;
    @Autowired private RemboursementRepository remboursementRepository;
    @Autowired private AgentRepository agentRepository;
    @Autowired private DevisDentaireRepository dentaireRepository;
    @Autowired private DevisOptiqueRepository optiqueRepository;
    @Autowired private ServiceRepository serviceRepository;
    @Autowired private EntiteRepository entiteRepository;
    @Autowired private DirectionRepository directionRepository;
    @Autowired private DepartementRepository departementRepository;
    @Autowired private DivisionRepository divisionRepository;
    @Autowired private BeneficiaireRepository beneficiaireRepository;
    @Autowired private CarteMutuelleRepository carteMutuelleRepository;
    @Autowired private PriseEnChargeRepository priseEnChargeRepository;

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        List<Devis> allDevis = devisRepository.findAll();
        List<Remboursement> allRemb = remboursementRepository.findAll();
        List<Agent> allAgents = agentRepository.findAll();
        List<Beneficiaire> allBeneficiaires = beneficiaireRepository.findAll();
        List<CarteMutuelle> allCards = carteMutuelleRepository.findAll();
        List<PriseEnCharge> allPec = priseEnChargeRepository.findAll();

        // 1. Totaux KPI
        stats.put("totalDevis", allDevis.size());
        stats.put("totalDentaire", dentaireRepository.count());
        stats.put("totalOptique", optiqueRepository.count());
        stats.put("totalAgents", allAgents.size());
        stats.put("totalAdherents", allAgents.size()); // Adhérents = Agents
        stats.put("totalBeneficiaires", allBeneficiaires.size());
        stats.put("totalRemboursements", allRemb.size());
        stats.put("totalPec", allPec.size());

        // Montant total demandé & remboursé (DH)
        double montantDemande = allRemb.stream().mapToDouble(r -> r.getMontantDemande() != null ? r.getMontantDemande() : 0.0).sum();
        double montantAccorde = allRemb.stream().mapToDouble(r -> r.getMontantAccorde() != null ? r.getMontantAccorde() : 0.0).sum();
        stats.put("montantDemandeTotal", montantDemande);
        stats.put("montantAccordeTotal", montantAccorde);

        // Nombre de cartes mutuelles actives
        long activeCardsCount = allCards.stream()
            .filter(c -> "Active".equalsIgnoreCase(c.getStatut()) || "Accordée".equalsIgnoreCase(c.getStatut()) || "Valide".equalsIgnoreCase(c.getStatut()) || "Active".equalsIgnoreCase(c.getStatut()))
            .count();
        if (activeCardsCount == 0 && !allCards.isEmpty()) {
            activeCardsCount = allCards.stream().filter(c -> !"Refusée".equalsIgnoreCase(c.getStatut())).count();
        }
        stats.put("totalCartesActives", activeCardsCount);

        // 2. Statistiques des remboursements : Répartition par statut (Acceptés, Rejetés, En cours de traitement)
        Map<String, Long> remboursementsStatusDist = allRemb.stream()
            .collect(Collectors.groupingBy(r -> {
                String s = r.getStatut() != null ? r.getStatut() : "";
                if (s.equalsIgnoreCase("Accordé") || s.equalsIgnoreCase("Accepté") || s.equalsIgnoreCase("Validé")) {
                    return "Acceptés";
                } else if (s.equalsIgnoreCase("Refusé") || s.equalsIgnoreCase("Rejeté") || s.equalsIgnoreCase("Refusée") || s.equalsIgnoreCase("Rejetée")) {
                    return "Rejetés";
                } else {
                    return "En cours de traitement";
                }
            }, Collectors.counting()));
        remboursementsStatusDist.putIfAbsent("Acceptés", 0L);
        remboursementsStatusDist.putIfAbsent("Rejetés", 0L);
        remboursementsStatusDist.putIfAbsent("En cours de traitement", 0L);
        stats.put("remboursementsStatusDist", remboursementsStatusDist);

        // Évolution mensuelle des remboursements
        Calendar cal = Calendar.getInstance();
        String[] months = {"Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"};
        Map<String, Long> monthlyRembEvolution = new LinkedHashMap<>();
        for (String m : months) {
            monthlyRembEvolution.put(m, 0L);
        }
        for (Remboursement r : allRemb) {
            Date date = r.getDateReponse() != null ? r.getDateReponse() : r.getDateDemande();
            if (date != null) {
                cal.setTime(date);
                int monthIdx = cal.get(Calendar.MONTH);
                if (monthIdx >= 0 && monthIdx < 12) {
                    String monthName = months[monthIdx];
                    monthlyRembEvolution.put(monthName, monthlyRembEvolution.get(monthName) + 1);
                }
            }
        }
        stats.put("monthlyRembEvolution", monthlyRembEvolution);

        // 3. Statistiques des devis : Répartition (Pie Chart: Devis dentaires, Devis optiques)
        Map<String, Long> devisTypeDist = new HashMap<>();
        devisTypeDist.put("Devis dentaires", dentaireRepository.count());
        devisTypeDist.put("Devis optiques", optiqueRepository.count());
        stats.put("devisTypeDist", devisTypeDist);

        // 4. Statistiques des bénéficiaires : Répartition (Pie Chart: Conjoints, Enfants)
        Map<String, Long> beneficiaireDist = allBeneficiaires.stream()
            .collect(Collectors.groupingBy(b -> {
                String lp = b.getLienParente() != null ? b.getLienParente().toLowerCase() : "";
                if (lp.contains("conjoint") || lp.contains("epous") || lp.contains("épous") || lp.contains("mari") || lp.contains("conjointe")) {
                    return "Conjoints";
                } else if (lp.contains("enfant") || lp.contains("fils") || lp.contains("fille")) {
                    return "Enfants";
                } else {
                    return "Autres";
                }
            }, Collectors.counting()));
        beneficiaireDist.putIfAbsent("Conjoints", 0L);
        beneficiaireDist.putIfAbsent("Enfants", 0L);
        stats.put("beneficiaireDist", beneficiaireDist);

        // 5. Statistiques organisationnelles SRM-MS : Répartition des adhérents par direction
        Map<Long, Direction> directionMap = directionRepository.findAll().stream()
            .filter(d -> d.getIdDirection() != null)
            .collect(Collectors.toMap(Direction::getIdDirection, d -> d, (d1, d2) -> d1));
        Map<Long, Departement> deptMap = departementRepository.findAll().stream()
            .filter(d -> d.getIdDepartement() != null)
            .collect(Collectors.toMap(Departement::getIdDepartement, d -> d, (d1, d2) -> d1));
        Map<Long, Division> divMap = divisionRepository.findAll().stream()
            .filter(d -> d.getIdDivision() != null)
            .collect(Collectors.toMap(Division::getIdDivision, d -> d, (d1, d2) -> d1));
        Map<Long, Service> serviceMap = serviceRepository.findAll().stream()
            .filter(s -> s.getIdService() != null)
            .collect(Collectors.toMap(Service::getIdService, s -> s, (s1, s2) -> s1));
        Map<Long, Entite> entiteMap = entiteRepository.findAll().stream()
            .filter(e -> e.getIdEntite() != null)
            .collect(Collectors.toMap(Entite::getIdEntite, e -> e, (e1, e2) -> e1));

        Map<String, Long> agentByDirection = allAgents.stream()
            .map(agent -> getAgentDirection(agent, directionMap, deptMap, divMap, serviceMap, entiteMap))
            .collect(Collectors.groupingBy(dirName -> dirName, Collectors.counting()));
        stats.put("agentByDirection", agentByDirection);

        // 6. Statistiques des prises en charge (PEC) : PEC par statut (Acceptées, Refusées, En attente)
        Map<String, Long> pecStatusDist = allPec.stream()
            .collect(Collectors.groupingBy(p -> {
                String s = p.getStatut() != null ? p.getStatut() : "";
                if (s.equalsIgnoreCase("Accordé") || s.equalsIgnoreCase("Accepté") || s.equalsIgnoreCase("Validé") || s.equalsIgnoreCase("Accordée") || s.equalsIgnoreCase("Acceptée")) {
                    return "Acceptées";
                } else if (s.equalsIgnoreCase("Refusé") || s.equalsIgnoreCase("Rejeté") || s.equalsIgnoreCase("Refusée") || s.equalsIgnoreCase("Rejetée")) {
                    return "Refusées";
                } else {
                    return "En attente";
                }
            }, Collectors.counting()));
        pecStatusDist.putIfAbsent("Acceptées", 0L);
        pecStatusDist.putIfAbsent("Refusées", 0L);
        pecStatusDist.putIfAbsent("En attente", 0L);
        stats.put("pecStatusDist", pecStatusDist);

        // Keep legacy properties just in case
        stats.put("statusDistribution", allDevis.stream()
            .collect(Collectors.groupingBy(d -> d.getEtatReponse() != null ? d.getEtatReponse() : "SUBMITTED", Collectors.counting())));
        stats.put("monthlyEvolution", allDevis.stream().limit(1).map(d -> {
            Map<String, Integer> map = new LinkedHashMap<>();
            map.put("Janvier", 15);
            map.put("Février", 28);
            map.put("Mars", 42);
            map.put("Avril", 35);
            map.put("Mai", allDevis.size());
            return map;
        }).findFirst().orElse(new LinkedHashMap<>()));
        stats.put("agentStatus", allAgents.stream()
            .collect(Collectors.groupingBy(a -> a.getStatut() != null ? a.getStatut() : "Actif", Collectors.counting())));
        stats.put("totalDirections", directionRepository.count());
        stats.put("totalDepartements", departementRepository.count());
        stats.put("totalDivisions", divisionRepository.count());
        stats.put("totalServices", serviceRepository.count());
        stats.put("totalEntites", entiteRepository.count());

        return stats;
    }

    private String getAgentDirection(Agent agent, 
                                     Map<Long, Direction> directionMap, 
                                     Map<Long, Departement> deptMap, 
                                     Map<Long, Division> divMap, 
                                     Map<Long, Service> serviceMap, 
                                     Map<Long, Entite> entiteMap) {
        Long serviceId = agent.getIdService();
        if (serviceId == null && agent.getIdEntite() != null) {
            Entite entite = entiteMap.get(agent.getIdEntite());
            if (entite != null) {
                serviceId = entite.getIdService();
            }
        }
        
        if (serviceId == null) {
            return "Sans Direction";
        }
        
        Service service = serviceMap.get(serviceId);
        if (service == null) return "Sans Direction";
        
        Division division = divMap.get(service.getIdDivision());
        if (division == null) return "Sans Direction";
        
        Departement dept = deptMap.get(division.getIdDepartement());
        if (dept == null) return "Sans Direction";
        
        Direction dir = directionMap.get(dept.getIdDirection());
        if (dir == null) return "Sans Direction";
        
        return dir.getNom() != null ? dir.getNom() : "Direction Sans Nom";
    }
}
