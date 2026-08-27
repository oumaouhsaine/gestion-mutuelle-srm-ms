package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.PriseEnCharge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PriseEnChargeRepository extends JpaRepository<PriseEnCharge, Long> {
    java.util.List<PriseEnCharge> findByIdBeneficiaire(Long idBeneficiaire);
}
