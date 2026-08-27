package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.DevisOptique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DevisOptiqueRepository extends JpaRepository<DevisOptique, Long> {
}
