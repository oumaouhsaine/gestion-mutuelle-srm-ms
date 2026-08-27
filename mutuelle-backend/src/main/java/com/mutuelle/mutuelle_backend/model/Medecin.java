package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "MEDECIN")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Medecin {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID_MEDECIN")
    private Long idMedecin;

    @Column(name = "NOM", length = 100)
    private String nom;

    @Column(name = "PRENOM", length = 100)
    private String prenom;

    @Column(name = "SPECIALITE", length = 100)
    private String specialite;

    @Column(name = "CONVENTION")
    private Integer convention; // 0 or 1

    @Column(name = "TELEPHONE", length = 20)
    private String telephone;

    @Column(name = "EMAIL", length = 150)
    private String email;

    @Column(name = "ID_ETABLISSEMENT")
    private Long idEtablissement;
}
