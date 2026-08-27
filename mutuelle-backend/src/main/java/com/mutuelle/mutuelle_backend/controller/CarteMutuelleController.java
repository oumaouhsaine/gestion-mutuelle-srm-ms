package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.CarteMutuelle;
import com.mutuelle.mutuelle_backend.repository.CarteMutuelleRepository;
import com.mutuelle.mutuelle_backend.service.PdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cartes")
@CrossOrigin(origins = "http://localhost:3000")
public class CarteMutuelleController {

    @Autowired
    private CarteMutuelleRepository repository;

    @Autowired
    private PdfService pdfService;

    @GetMapping
    public List<CarteMutuelle> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public CarteMutuelle create(@RequestBody CarteMutuelle carte) {
        if (carte.getStatut() == null) carte.setStatut("En attente");
        if (carte.getDateDemande() == null) carte.setDateDemande(new java.util.Date());
        return repository.save(carte);
    }

    @PutMapping("/{id}")
    public CarteMutuelle update(@PathVariable Long id, @RequestBody CarteMutuelle carte) {
        return repository.save(carte);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }

    @GetMapping("/{id}/bulletin")
    public ResponseEntity<byte[]> getBulletin(@PathVariable Long id) {
        try {
            CarteMutuelle carte = repository.findById(id).orElseThrow();
            byte[] pdf = pdfService.generateBulletinAdhesion(carte);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bulletin_adhesion_" + id + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
