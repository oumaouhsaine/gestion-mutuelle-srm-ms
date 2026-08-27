package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.Radio;
import com.mutuelle.mutuelle_backend.repository.RadioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/radios")
@CrossOrigin(origins = "http://localhost:3000")
public class RadioController {

    @Autowired
    private RadioRepository radioRepository;

    @GetMapping
    public List<Radio> getAll() {
        return radioRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Radio> getById(@PathVariable Long id) {
        return radioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Radio create(@RequestBody Radio radio) {
        if (radio.getStatut() == null) {
            radio.setStatut("En cours");
        }
        return radioRepository.save(radio);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Radio> update(@PathVariable Long id, @RequestBody Radio radioDetails) {
        return radioRepository.findById(id)
                .map(radio -> {
                    radio.setIdBeneficiaire(radioDetails.getIdBeneficiaire());
                    radio.setTypeRadio(radioDetails.getTypeRadio());
                    radio.setScanRadio(radioDetails.getScanRadio());
                    radio.setObservation(radioDetails.getObservation());
                    radio.setTotal(radioDetails.getTotal());
                    radio.setMontantAccorde(radioDetails.getMontantAccorde());
                    radio.setDateDemande(radioDetails.getDateDemande());
                    radio.setDateReponse(radioDetails.getDateReponse());
                    radio.setStatut(radioDetails.getStatut());
                    return ResponseEntity.ok(radioRepository.save(radio));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return radioRepository.findById(id)
                .map(radio -> {
                    radioRepository.delete(radio);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}
