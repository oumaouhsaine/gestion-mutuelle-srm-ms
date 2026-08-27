package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.Etablissement;
import com.mutuelle.mutuelle_backend.repository.EtablissementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/etablissements")
@CrossOrigin(origins = "http://localhost:3000")
public class EtablissementController {

    @Autowired
    private EtablissementRepository etablissementRepository;

    @GetMapping
    public ResponseEntity<List<Etablissement>> getAll() {
        List<Etablissement> list = etablissementRepository.findAll();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Etablissement> getById(@PathVariable Long id) {
        return etablissementRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    public ResponseEntity<Etablissement> create(@RequestBody Etablissement etablissement) {
        try {
            Etablissement saved = etablissementRepository.save(etablissement);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Etablissement> update(@PathVariable Long id, @RequestBody Etablissement details) {
        return etablissementRepository.findById(id)
                .map(etab -> {
                    etab.setRaisonSociale(details.getRaisonSociale());
                    etab.setAdresse(details.getAdresse());
                    etab.setTelephone(details.getTelephone());
                    etab.setEmail(details.getEmail());
                    etab.setConvention(details.getConvention());
                    Etablissement updated = etablissementRepository.save(etab);
                    return ResponseEntity.ok(updated);
                }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return etablissementRepository.findById(id)
                .map(etab -> {
                    etablissementRepository.delete(etab);
                    return ResponseEntity.noContent().build();
                }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}
