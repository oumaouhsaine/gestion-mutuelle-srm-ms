package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
}
