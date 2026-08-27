package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "CHATBOT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Chatbot {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID_CHAT")
    private Long idChat;

    @Column(name = "ID_USER")
    private Long idUser;

    @Column(name = "MESSAGE", length = 500)
    private String message;

    @Column(name = "REPONSE", length = 500)
    private String reponse;

    @Column(name = "DATE_MSG")
    @Temporal(TemporalType.TIMESTAMP)
    private Date dateMsg;
}
