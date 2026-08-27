package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.Entite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EntiteRepository extends JpaRepository<Entite, Long> {
}
