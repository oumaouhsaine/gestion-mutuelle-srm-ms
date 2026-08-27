package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.Service;
import com.mutuelle.mutuelle_backend.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
public class ServiceController {

    @Autowired
    private ServiceRepository serviceRepository;

    @GetMapping
    public List<Service> getAll() {
        return serviceRepository.findAll();
    }

    @PostMapping
    public Service create(@RequestBody Service service) {
        return serviceRepository.save(service);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Service> getById(@PathVariable Long id) {
        return serviceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Service> update(@PathVariable Long id, @RequestBody Service details) {
        return serviceRepository.findById(id)
                .map(service -> {
                    service.setNom(details.getNom());
                    service.setCode(details.getCode());
                    service.setIdDivision(details.getIdDivision());
                    return ResponseEntity.ok(serviceRepository.save(service));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            return serviceRepository.findById(id)
                    .map(service -> {
                        serviceRepository.delete(service);
                        return ResponseEntity.ok().build();
                    }).orElse(ResponseEntity.notFound().build());
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Impossible de supprimer ce service car il est lié à d'autres structures.");
        }
    }
}
