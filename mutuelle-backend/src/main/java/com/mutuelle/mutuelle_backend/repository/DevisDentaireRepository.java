package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.DevisDentaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DevisDentaireRepository extends JpaRepository<DevisDentaire, Long> {
}
