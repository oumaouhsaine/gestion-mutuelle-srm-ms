package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.Ordonnance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrdonnanceRepository extends JpaRepository<Ordonnance, Long> {
    List<Ordonnance> findByIdBeneficiaire(Long idBeneficiaire);
}
