package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "ADHERENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Adherent {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID_ADHERENT")
    private Long idAdherent;

    @Column(name = "ID_USER")
    private Long idUser;

    @Column(name = "NUMERO_ADHERENT", length = 50)
    private String numeroAdherent;
}
