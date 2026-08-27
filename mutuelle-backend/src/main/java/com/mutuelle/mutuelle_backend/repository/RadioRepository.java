package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.Radio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RadioRepository extends JpaRepository<Radio, Long> {
    java.util.List<Radio> findByIdBeneficiaire(Long idBeneficiaire);
}
