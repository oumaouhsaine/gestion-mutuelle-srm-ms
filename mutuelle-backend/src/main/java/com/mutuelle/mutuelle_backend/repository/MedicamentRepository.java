package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.Medicament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicamentRepository extends JpaRepository<Medicament, Double> {
}
