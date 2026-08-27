package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.Departement;
import com.mutuelle.mutuelle_backend.repository.DepartementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departements")
@CrossOrigin(origins = "*")
public class DepartementController {

    @Autowired
    private DepartementRepository departementRepository;

    @GetMapping
    public List<Departement> getAll() {
        return departementRepository.findAll();
    }

    @PostMapping
    public Departement create(@RequestBody Departement departement) {
        return departementRepository.save(departement);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Departement> getById(@PathVariable Long id) {
        return departementRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Departement> update(@PathVariable Long id, @RequestBody Departement details) {
        return departementRepository.findById(id)
                .map(departement -> {
                    departement.setNom(details.getNom());
                    departement.setCode(details.getCode());
                    departement.setIdDirection(details.getIdDirection());
                    return ResponseEntity.ok(departementRepository.save(departement));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            return departementRepository.findById(id)
                    .map(departement -> {
                        departementRepository.delete(departement);
                        return ResponseEntity.ok().build();
                    }).orElse(ResponseEntity.notFound().build());
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Impossible de supprimer ce département car il est lié à d'autres structures.");
        }
    }
}
