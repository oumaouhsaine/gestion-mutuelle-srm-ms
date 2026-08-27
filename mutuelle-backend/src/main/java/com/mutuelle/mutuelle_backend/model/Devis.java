package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "DEVIS")
@Inheritance(strategy = InheritanceType.JOINED)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Devis {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID_DEVIS")
    private Long idDevis;

    @Column(name = "ID_BENEFICIAIRE")
    private Long idBeneficiaire;

    @Column(name = "DATE_DEVIS")
    @Temporal(TemporalType.DATE)
    private Date dateDevis;

    @Column(name = "DATE_DEPOT")
    @Temporal(TemporalType.DATE)
    private Date dateDepot;

    @Column(name = "DATE_REPONSE")
    @Temporal(TemporalType.DATE)
    private Date dateReponse;

    @Column(name = "ETAT_REPONSE", length = 20)
    private String etatReponse;

    @Column(name = "MONTANT")
    private Double montant;

    @Column(name = "SCAN", length = 255)
    private String scan;

    @Column(name = "OBSERVATION", length = 255)
    private String observation;

    @Column(name = "MOTIF_REFUS", length = 500)
    private String motifRefus;
}
