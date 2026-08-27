package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.Ordonnance;
import com.mutuelle.mutuelle_backend.repository.OrdonnanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ordonnances")
@CrossOrigin(origins = "http://localhost:3000")
public class OrdonnanceController {

    @Autowired
    private OrdonnanceRepository ordonnanceRepository;

    @GetMapping
    public List<Ordonnance> getAll() {
        return ordonnanceRepository.findAll();
    }

    @PostMapping
    public Ordonnance create(@RequestBody Ordonnance ordonnance) {
        return ordonnanceRepository.save(ordonnance);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ordonnance> update(@PathVariable Long id, @RequestBody Ordonnance details) {
        return ordonnanceRepository.findById(id)
                .map(ordonnance -> {
                    ordonnance.setIdBeneficiaire(details.getIdBeneficiaire());
                    ordonnance.setIdMedecin(details.getIdMedecin());
                    ordonnance.setDateOrdonnance(details.getDateOrdonnance());
                    ordonnance.setNumeroOrdonnance(details.getNumeroOrdonnance());
                    ordonnance.setMontantTotal(details.getMontantTotal());
                    ordonnance.setScan(details.getScan());
                    ordonnance.setObservation(details.getObservation());
                    return ResponseEntity.ok(ordonnanceRepository.save(ordonnance));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return ordonnanceRepository.findById(id)
                .map(ordonnance -> {
                    ordonnanceRepository.delete(ordonnance);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}
