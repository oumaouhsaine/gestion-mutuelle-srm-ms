package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "BENEFICIAIRE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Beneficiaire {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID_BENEFICIAIRE")
    private Long idBeneficiaire;

    @Column(name = "ID_ADHERENT")
    private Long idAdherent;

    @Column(name = "ID_AGENT")
    private Long idAgent;

    @Column(name = "NOM", length = 100)
    private String nom;

    @Column(name = "PRENOM", length = 100)
    private String prenom;

    @Column(name = "LIEN_PARENTE", length = 50)
    private String lienParente;

    @Column(name = "DATE_NAISSANCE")
    @Temporal(TemporalType.DATE)
    private Date dateNaissance;

    @Column(name = "EST_SALARIE")
    private Boolean estSalarie;

    @Column(name = "LIEU_NAISSANCE", length = 100)
    private String lieuNaissance;
}
