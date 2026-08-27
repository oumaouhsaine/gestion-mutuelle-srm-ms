package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.DeletedItem;
import com.mutuelle.mutuelle_backend.service.DeletedItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/deleted-items")
@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('ADMIN')")
public class DeletedItemController {

    @Autowired
    private DeletedItemService deletedItemService;

    @GetMapping
    public List<DeletedItem> getAll() {
        return deletedItemService.getAllDeletedItems();
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<?> restore(@PathVariable Long id) {
        Map<String, String> response = new HashMap<>();
        try {
            deletedItemService.restoreItem(id);
            response.put("message", "Élément restauré avec succès.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Erreur lors de la restauration: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}/purge")
    public ResponseEntity<?> purge(@PathVariable Long id) {
        Map<String, String> response = new HashMap<>();
        try {
            deletedItemService.purgeItem(id);
            response.put("message", "Élément supprimé définitivement.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Erreur lors de la suppression définitive: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
