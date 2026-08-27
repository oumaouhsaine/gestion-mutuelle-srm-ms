package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.Division;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DivisionRepository extends JpaRepository<Division, Long> {
}
