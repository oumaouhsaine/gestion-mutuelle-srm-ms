package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.Direction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DirectionRepository extends JpaRepository<Direction, Long> {
}
