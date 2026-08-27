package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.Medicament;
import com.mutuelle.mutuelle_backend.repository.MedicamentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicaments")
@CrossOrigin(origins = "*")
public class MedicamentController {

    @Autowired
    private MedicamentRepository medicamentRepository;

    @GetMapping
    public List<Medicament> getAll() {
        return medicamentRepository.findAll();
    }
}
