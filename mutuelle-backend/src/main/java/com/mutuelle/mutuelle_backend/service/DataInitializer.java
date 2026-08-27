package com.mutuelle.mutuelle_backend.service;

import com.mutuelle.mutuelle_backend.model.*;
import com.mutuelle.mutuelle_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class DataInitializer implements CommandLineRunner {

    @Autowired UserRepository userRepository;
    @Autowired AdherentRepository adherentRepository;
    @Autowired PasswordEncoder passwordEncoder;
    
    @Autowired DirectionRepository directionRepository;
    @Autowired DepartementRepository departementRepository;
    @Autowired DivisionRepository divisionRepository;
    @Autowired ServiceRepository serviceRepository;
    @Autowired EntiteRepository entiteRepository;

    @Override
    public void run(String... args) throws Exception {
        createOrUpdateUser("admin", "admin123", "ROLE_ADMIN");
        createOrUpdateUser("operateur", "op123", "ROLE_OPERATEUR");
        createOrUpdateUser("consultant", "cons123", "ROLE_CONSULTANT");
        
        // Création de l'adhérent de test
        User adherentUser = createOrUpdateUser("adherent@test.com", "123456", "ROLE_CLIENT");
        
        if (adherentUser != null && adherentRepository.findByIdUser(adherentUser.getId()).isEmpty()) {
            Adherent adherent = new Adherent();
            adherent.setIdUser(adherentUser.getId());
            adherent.setNumeroAdherent("ADH-2026-001");
            adherentRepository.save(adherent);
            System.out.println("Adhérent de test créé : adherent@test.com / 123456");
        }

        // Seeding default Organisation Hierarchy
        if (directionRepository.count() == 0) {
            Direction dir = new Direction();
            dir.setNom("Direction Générale");
            dir.setCode("DG");
            dir = directionRepository.save(dir);

            Departement dep = new Departement();
            dep.setNom("Département Informatique");
            dep.setCode("DI");
            dep.setIdDirection(dir.getIdDirection());
            dep = departementRepository.save(dep);

            Division div = new Division();
            div.setNom("Division Sécurité");
            div.setCode("DS");
            div.setIdDepartement(dep.getIdDepartement());
            div = divisionRepository.save(div);

            com.mutuelle.mutuelle_backend.model.Service svc = new com.mutuelle.mutuelle_backend.model.Service();
            svc.setNom("Service Réseau");
            svc.setCode("SR");
            svc.setIdDivision(div.getIdDivision());
            svc = serviceRepository.save(svc);

            Entite ent = new Entite();
            ent.setNom("Entité Cyber");
            ent.setType("Technique");
            ent.setIdService(svc.getIdService());
            entiteRepository.save(ent);
            System.out.println("Hiérarchie d'organisation par défaut créée !");
        }
    }

    private User createOrUpdateUser(String username, String password, String role) {
        User user = userRepository.findByUsername(username).orElse(new User());
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setStatut("Actif");
        user.setDateCreation(new Date());
        return userRepository.save(user);
    }
}
