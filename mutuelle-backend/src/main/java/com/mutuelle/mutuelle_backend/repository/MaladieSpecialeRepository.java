package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.MaladieSpeciale;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaladieSpecialeRepository extends JpaRepository<MaladieSpeciale, Long> {
    java.util.List<MaladieSpeciale> findByIdBeneficiaire(Long idBeneficiaire);
}
