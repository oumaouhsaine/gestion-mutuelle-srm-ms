package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgentRepository extends JpaRepository<Agent, Long> {
    Optional<Agent> findByMatricule(String matricule);
    Optional<Agent> findByIdUser(Long idUser);
}
