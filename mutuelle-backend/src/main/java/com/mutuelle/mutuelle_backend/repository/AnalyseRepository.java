package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.Analyse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnalyseRepository extends JpaRepository<Analyse, Long> {
    java.util.List<Analyse> findByIdBeneficiaire(Long idBeneficiaire);
}
