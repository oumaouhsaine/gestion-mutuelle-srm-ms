package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.Entite;
import com.mutuelle.mutuelle_backend.repository.EntiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entites")
@CrossOrigin(origins = "*")
public class EntiteController {

    @Autowired
    private EntiteRepository entiteRepository;

    @GetMapping
    public List<Entite> getAllEntites() {
        return entiteRepository.findAll();
    }

    @PostMapping
    public Entite createEntite(@RequestBody Entite entite) {
        return entiteRepository.save(entite);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Entite> getEntiteById(@PathVariable Long id) {
        return entiteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Entite> updateEntite(@PathVariable Long id, @RequestBody Entite entiteDetails) {
        return entiteRepository.findById(id)
                .map(entite -> {
                    entite.setNom(entiteDetails.getNom());
                    entite.setType(entiteDetails.getType());
                    entite.setIdService(entiteDetails.getIdService());
                    return ResponseEntity.ok(entiteRepository.save(entite));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEntite(@PathVariable Long id) {
        try {
            return entiteRepository.findById(id)
                    .map(entite -> {
                        entiteRepository.delete(entite);
                        return ResponseEntity.ok().build();
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                    .body("Impossible de supprimer cette entité car elle est liée à d'autres structures ou agents.");
        }
    }
}
