package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "REMBOURSEMENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Remboursement {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID_REMBOURSEMENT")
    private Long idRemboursement;

    @Column(name = "ID_BENEFICIAIRE")
    private Long idBeneficiaire;

    @Column(name = "DATE_DEMANDE")
    @Temporal(TemporalType.DATE)
    private Date dateDemande;

    @Column(name = "MONTANT_DEMANDE")
    private Double montantDemande;

    @Column(name = "MONTANT_ACCORDE")
    private Double montantAccorde;

    @Column(name = "STATUT", length = 50)
    private String statut;

    @Column(name = "TYPE", length = 50)
    private String type;

    @Column(name = "SCAN", length = 255)
    private String scan;

    @Column(name = "DATE_REPONSE")
    @Temporal(TemporalType.DATE)
    private Date dateReponse;

    @Column(name = "MOTIF_REFUS", length = 500)
    private String motifRefus;
}
