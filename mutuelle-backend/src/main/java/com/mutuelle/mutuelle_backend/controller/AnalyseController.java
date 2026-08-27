package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.Analyse;
import com.mutuelle.mutuelle_backend.repository.AnalyseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analyses")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyseController {

    @Autowired
    private AnalyseRepository analyseRepository;

    @GetMapping
    public List<Analyse> getAll() {
        return analyseRepository.findAll();
    }

    @PostMapping
    public Analyse create(@RequestBody Analyse analyse) {
        return analyseRepository.save(analyse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Analyse> update(@PathVariable Long id, @RequestBody Analyse details) {
        return analyseRepository.findById(id)
                .map(analyse -> {
                    analyse.setIdBeneficiaire(details.getIdBeneficiaire());
                    analyse.setObservation(details.getObservation());
                    analyse.setScan(details.getScan());
                    analyse.setTotal(details.getTotal());
                    return ResponseEntity.ok(analyseRepository.save(analyse));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return analyseRepository.findById(id)
                .map(analyse -> {
                    analyseRepository.delete(analyse);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}
