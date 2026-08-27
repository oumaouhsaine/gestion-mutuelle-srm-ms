package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.Remboursement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RemboursementRepository extends JpaRepository<Remboursement, Long> {
    java.util.List<Remboursement> findByIdBeneficiaire(Long idBeneficiaire);
}
