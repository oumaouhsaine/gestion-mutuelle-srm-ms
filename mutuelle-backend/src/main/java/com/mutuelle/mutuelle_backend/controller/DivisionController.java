package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.Division;
import com.mutuelle.mutuelle_backend.repository.DivisionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/divisions")
@CrossOrigin(origins = "*")
public class DivisionController {

    @Autowired
    private DivisionRepository divisionRepository;

    @GetMapping
    public List<Division> getAll() {
        return divisionRepository.findAll();
    }

    @PostMapping
    public Division create(@RequestBody Division division) {
        return divisionRepository.save(division);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Division> getById(@PathVariable Long id) {
        return divisionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Division> update(@PathVariable Long id, @RequestBody Division details) {
        return divisionRepository.findById(id)
                .map(division -> {
                    division.setNom(details.getNom());
                    division.setCode(details.getCode());
                    division.setIdDepartement(details.getIdDepartement());
                    return ResponseEntity.ok(divisionRepository.save(division));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            return divisionRepository.findById(id)
                    .map(division -> {
                        divisionRepository.delete(division);
                        return ResponseEntity.ok().build();
                    }).orElse(ResponseEntity.notFound().build());
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Impossible de supprimer cette division car elle est liée à d'autres structures.");
        }
    }
}
