package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.Adherent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AdherentRepository extends JpaRepository<Adherent, Long> {
    Optional<Adherent> findByIdUser(Long idUser);
}
