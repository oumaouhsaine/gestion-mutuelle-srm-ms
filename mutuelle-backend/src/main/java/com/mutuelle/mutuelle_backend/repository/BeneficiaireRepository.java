package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.Beneficiaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BeneficiaireRepository extends JpaRepository<Beneficiaire, Long> {
    List<Beneficiaire> findByIdAgent(Long idAgent);
}
