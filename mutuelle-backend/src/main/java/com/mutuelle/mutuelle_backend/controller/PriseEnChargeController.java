package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.PriseEnCharge;
import com.mutuelle.mutuelle_backend.repository.PriseEnChargeRepository;
import com.mutuelle.mutuelle_backend.service.PdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prises-en-charge")
@CrossOrigin(origins = "http://localhost:3000")
public class PriseEnChargeController {

    @Autowired
    private PriseEnChargeRepository priseEnChargeRepository;

    @Autowired
    private PdfService pdfService;

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> getPdf(@PathVariable Long id) {
        return priseEnChargeRepository.findById(id)
                .map(pec -> {
                    byte[] pdfBytes = pdfService.generatePecPdf(pec);
                    return ResponseEntity.ok()
                            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=pec_" + id + ".pdf")
                            .contentType(MediaType.APPLICATION_PDF)
                            .body(pdfBytes);
                }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<PriseEnCharge> getAll() {
        return priseEnChargeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PriseEnCharge> getById(@PathVariable Long id) {
        return priseEnChargeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public PriseEnCharge create(@RequestBody PriseEnCharge pec) {
        if (pec.getStatut() == null) {
            pec.setStatut("En cours");
        }
        return priseEnChargeRepository.save(pec);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PriseEnCharge> update(@PathVariable Long id, @RequestBody PriseEnCharge pecDetails) {
        return priseEnChargeRepository.findById(id)
                .map(pec -> {
                    pec.setIdBeneficiaire(pecDetails.getIdBeneficiaire());
                    pec.setTauxCharge(pecDetails.getTauxCharge());
                    pec.setDatePec(pecDetails.getDatePec());
                    pec.setDateReponse(pecDetails.getDateReponse());
                    pec.setStatut(pecDetails.getStatut());
                    pec.setScan(pecDetails.getScan());
                    pec.setMontantEstime(pecDetails.getMontantEstime());
                    pec.setMontantAccorde(pecDetails.getMontantAccorde());
                    pec.setObservation(pecDetails.getObservation());
                    pec.setNombreSeance(pecDetails.getNombreSeance());
                    pec.setTypeSoin(pecDetails.getTypeSoin());
                    pec.setIdEtablissement(pecDetails.getIdEtablissement());
                    return ResponseEntity.ok(priseEnChargeRepository.save(pec));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return priseEnChargeRepository.findById(id)
                .map(pec -> {
                    priseEnChargeRepository.delete(pec);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}
