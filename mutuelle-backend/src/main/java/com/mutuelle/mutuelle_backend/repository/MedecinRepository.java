package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.Medecin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedecinRepository extends JpaRepository<Medecin, Long> {
    java.util.List<Medecin> findByNomContainingIgnoreCase(String nom);
}
