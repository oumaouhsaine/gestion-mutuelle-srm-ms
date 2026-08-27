package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.Medecin;
import com.mutuelle.mutuelle_backend.repository.MedecinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medecins")
@CrossOrigin(origins = "http://localhost:3000")
public class MedecinController {

    @Autowired
    private MedecinRepository medecinRepository;

    @GetMapping
    public List<Medecin> getAll() {
        return medecinRepository.findAll();
    }

    @PostMapping
    public Medecin create(@RequestBody Medecin medecin) {
        return medecinRepository.save(medecin);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medecin> update(@PathVariable Long id, @RequestBody Medecin details) {
        return medecinRepository.findById(id)
                .map(medecin -> {
                    medecin.setNom(details.getNom());
                    medecin.setPrenom(details.getPrenom());
                    medecin.setSpecialite(details.getSpecialite());
                    medecin.setConvention(details.getConvention());
                    medecin.setTelephone(details.getTelephone());
                    medecin.setEmail(details.getEmail());
                    medecin.setIdEtablissement(details.getIdEtablissement());
                    return ResponseEntity.ok(medecinRepository.save(medecin));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return medecinRepository.findById(id)
                .map(medecin -> {
                    medecinRepository.delete(medecin);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}
