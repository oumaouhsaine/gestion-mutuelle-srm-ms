package com.mutuelle.mutuelle_backend.controller;

import com.mutuelle.mutuelle_backend.model.User;
import com.mutuelle.mutuelle_backend.model.Chatbot;
import com.mutuelle.mutuelle_backend.model.Adherent;
import com.mutuelle.mutuelle_backend.repository.UserRepository;
import com.mutuelle.mutuelle_backend.repository.AgentRepository;
import com.mutuelle.mutuelle_backend.repository.AdherentRepository;
import com.mutuelle.mutuelle_backend.repository.ChatbotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/utilisateurs")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private AdherentRepository adherentRepository;

    @Autowired
    private ChatbotRepository chatbotRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public User createUser(@RequestBody User user) {
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        User savedUser = userRepository.save(user);
        if ("ROLE_CLIENT".equals(savedUser.getRole())) {
            if (adherentRepository.findByIdUser(savedUser.getId()).isEmpty()) {
                Adherent adherent = new Adherent();
                adherent.setIdUser(savedUser.getId());
                adherent.setNumeroAdherent("ADH-" + savedUser.getId());
                adherentRepository.save(adherent);
            }
        }
        return savedUser;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setNom(userDetails.getNom());
        user.setPrenom(userDetails.getPrenom());
        user.setUsername(userDetails.getUsername());
        user.setRole(userDetails.getRole());
        user.setStatut(userDetails.getStatut());
        // Password should be handled carefully, perhaps in a separate endpoint or
        // service method
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        final User updatedUser = userRepository.save(user);

        if ("ROLE_CLIENT".equals(updatedUser.getRole())) {
            if (adherentRepository.findByIdUser(updatedUser.getId()).isEmpty()) {
                Adherent adherent = new Adherent();
                adherent.setIdUser(updatedUser.getId());
                adherent.setNumeroAdherent("ADH-" + updatedUser.getId());
                adherentRepository.save(adherent);
            }
        }

        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Unlink Agent
        agentRepository.findByIdUser(id).ifPresent(agent -> {
            agent.setIdUser(null);
            agentRepository.save(agent);
        });

        // Unlink Adherent
        adherentRepository.findByIdUser(id).ifPresent(adherent -> {
            adherent.setIdUser(null);
            adherentRepository.save(adherent);
        });

        // Delete Chatbot messages
        List<Chatbot> chatHistory = chatbotRepository.findByIdUserOrderByDateMsgAsc(id);
        if (chatHistory != null && !chatHistory.isEmpty()) {
            chatbotRepository.deleteAll(chatHistory);
        }

        userRepository.delete(user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(java.util.Collections.singletonMap("error", "Non autorisé"));
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof com.mutuelle.mutuelle_backend.security.UserDetailsImpl) {
            com.mutuelle.mutuelle_backend.security.UserDetailsImpl userDetails = (com.mutuelle.mutuelle_backend.security.UserDetailsImpl) principal;
            User user = userRepository.findById(userDetails.getId()).orElse(null);
            if (user != null) {
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.status(404).body(java.util.Collections.singletonMap("error", "Utilisateur non trouvé"));
    }

    @PutMapping("/modifier-mot-de-passe/{id}")
    public ResponseEntity<?> modifierMotDePasse(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(java.util.Collections.singletonMap("error", "Non autorisé"));
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof com.mutuelle.mutuelle_backend.security.UserDetailsImpl) {
            com.mutuelle.mutuelle_backend.security.UserDetailsImpl userDetails = (com.mutuelle.mutuelle_backend.security.UserDetailsImpl) principal;
            boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isAdmin && !userDetails.getId().equals(id)) {
                return ResponseEntity.status(403).body(java.util.Collections.singletonMap("error", "Vous n'êtes pas autorisé à modifier ce compte."));
            }
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        String newPassword = payload.get("newPassword");
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", "Le mot de passe ne peut pas être vide."));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok().body(java.util.Collections.singletonMap("message", "Mot de passe modifié avec succès."));
    }
}
