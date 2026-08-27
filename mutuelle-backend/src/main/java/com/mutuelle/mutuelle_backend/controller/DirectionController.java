package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.Direction;
import com.mutuelle.mutuelle_backend.repository.DirectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/directions")
@CrossOrigin(origins = "*")
public class DirectionController {

    @Autowired
    private DirectionRepository directionRepository;

    @GetMapping
    public List<Direction> getAll() {
        return directionRepository.findAll();
    }

    @PostMapping
    public Direction create(@RequestBody Direction direction) {
        return directionRepository.save(direction);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Direction> getById(@PathVariable Long id) {
        return directionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Direction> update(@PathVariable Long id, @RequestBody Direction details) {
        return directionRepository.findById(id)
                .map(direction -> {
                    direction.setNom(details.getNom());
                    direction.setCode(details.getCode());
                    return ResponseEntity.ok(directionRepository.save(direction));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            return directionRepository.findById(id)
                    .map(direction -> {
                        directionRepository.delete(direction);
                        return ResponseEntity.ok().build();
                    }).orElse(ResponseEntity.notFound().build());
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Impossible de supprimer cette direction car elle est liée à d'autres structures.");
        }
    }
}
