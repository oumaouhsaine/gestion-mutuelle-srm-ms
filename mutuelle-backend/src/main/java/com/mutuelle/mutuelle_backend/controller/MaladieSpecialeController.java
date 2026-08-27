package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.MaladieSpeciale;
import com.mutuelle.mutuelle_backend.repository.MaladieSpecialeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maladies-speciales")
@CrossOrigin(origins = "http://localhost:3000")
public class MaladieSpecialeController {

    @Autowired
    private MaladieSpecialeRepository maladieSpecialeRepository;

    @GetMapping
    public List<MaladieSpeciale> getAll() {
        return maladieSpecialeRepository.findAll();
    }

    @PostMapping
    public MaladieSpeciale create(@RequestBody MaladieSpeciale maladie) {
        return maladieSpecialeRepository.save(maladie);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaladieSpeciale> update(@PathVariable Long id, @RequestBody MaladieSpeciale details) {
        return maladieSpecialeRepository.findById(id)
                .map(maladie -> {
                    maladie.setIdBeneficiaire(details.getIdBeneficiaire());
                    maladie.setType(details.getType());
                    maladie.setEtatMaladie(details.getEtatMaladie());
                    maladie.setDateDepot(details.getDateDepot());
                    maladie.setDateEnvoi(details.getDateEnvoi());
                    maladie.setObservation(details.getObservation());
                    return ResponseEntity.ok(maladieSpecialeRepository.save(maladie));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return maladieSpecialeRepository.findById(id)
                .map(maladie -> {
                    maladieSpecialeRepository.delete(maladie);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}
