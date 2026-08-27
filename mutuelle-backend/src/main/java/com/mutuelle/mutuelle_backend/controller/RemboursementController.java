package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.Remboursement;
import com.mutuelle.mutuelle_backend.repository.RemboursementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/remboursements")
@CrossOrigin(origins = "http://localhost:3000")
public class RemboursementController {

    @Autowired
    private RemboursementRepository remboursementRepository;

    @GetMapping
    public List<Remboursement> getAll() {
        return remboursementRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Remboursement> getById(@PathVariable Long id) {
        return remboursementRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Remboursement create(@RequestBody Remboursement remb) {
        return remboursementRepository.save(remb);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Remboursement> update(@PathVariable Long id, @RequestBody Remboursement rembDetails) {
        return remboursementRepository.findById(id)
                .map(remb -> {
                    remb.setIdBeneficiaire(rembDetails.getIdBeneficiaire());
                    remb.setDateDemande(rembDetails.getDateDemande());
                    remb.setMontantDemande(rembDetails.getMontantDemande());
                    remb.setMontantAccorde(rembDetails.getMontantAccorde());
                    remb.setStatut(rembDetails.getStatut());
                    remb.setType(rembDetails.getType());
                    remb.setScan(rembDetails.getScan());
                    remb.setDateReponse(rembDetails.getDateReponse());
                    remb.setMotifRefus(rembDetails.getMotifRefus());
                    return ResponseEntity.ok(remboursementRepository.save(remb));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return remboursementRepository.findById(id)
                .map(remb -> {
                    remboursementRepository.delete(remb);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}
