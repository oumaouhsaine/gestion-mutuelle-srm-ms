package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "ETABLISSEMENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Etablissement {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID_ETABLISSEMENT")
    private Long idEtablissement;

    @Column(name = "RAISON_SOCIALE", length = 150)
    private String raisonSociale;

    @Column(name = "ADRESSE", length = 255)
    private String adresse;

    @Column(name = "TELEPHONE", length = 20)
    private String telephone;

    @Column(name = "EMAIL", length = 150)
    private String email;

    @Column(name = "CONVENTION", length = 50)
    private String convention;
}
