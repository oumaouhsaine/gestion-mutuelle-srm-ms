package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.Devis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DevisRepository extends JpaRepository<Devis, Long> {
    java.util.List<Devis> findByIdBeneficiaire(Long idBeneficiaire);
}
