package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.DeletedItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeletedItemRepository extends JpaRepository<DeletedItem, Long> {
}
