package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.CarteMutuelle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarteMutuelleRepository extends JpaRepository<CarteMutuelle, Long> {
    java.util.List<CarteMutuelle> findByIdBeneficiaire(Long idBeneficiaire);
}
