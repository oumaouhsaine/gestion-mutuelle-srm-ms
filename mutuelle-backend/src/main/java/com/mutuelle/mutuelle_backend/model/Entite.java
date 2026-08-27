package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "ENTITE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Entite {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID_ENTITE")
    private Long idEntite;

    @Column(name = "NOM", length = 150)
    private String nom;

    @Column(name = "TYPE", length = 50)
    private String type;

    @Column(name = "ID_SERVICE")
    private Long idService;
}
