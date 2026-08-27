package com.mutuelle.mutuelle_backend.repository;

import com.mutuelle.mutuelle_backend.model.Chatbot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatbotRepository extends JpaRepository<Chatbot, Long> {
    List<Chatbot> findByIdUserOrderByDateMsgAsc(Long idUser);
}
