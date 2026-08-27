package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "PRISE_EN_CHARGE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriseEnCharge {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID_PEC")
    private Long idPec;

    @Column(name = "ID_BENEFICIAIRE")
    private Long idBeneficiaire;

    @Column(name = "TAUX_CHARGE")
    private Double tauxCharge;

    @Column(name = "DATE_PEC")
    @Temporal(TemporalType.DATE)
    private Date datePec; // Utilisé comme date de demande

    @Column(name = "DATE_REPONSE")
    @Temporal(TemporalType.DATE)
    private Date dateReponse;

    @Column(name = "STATUT", length = 50)
    private String statut;

    @Column(name = "SCAN", length = 255)
    private String scan;

    @Column(name = "MONTANT_ESTIME")
    private Double montantEstime;

    @Column(name = "MONTANT_ACCORDE")
    private Double montantAccorde;

    @Column(name = "OBSERVATION", length = 255)
    private String observation;

    @Column(name = "NOMBRE_SEANCE")
    private Integer nombreSeance;

    @Column(name = "TYPE_SOIN", length = 100)
    private String typeSoin;

    @Column(name = "ID_ETABLISSEMENT")
    private Long idEtablissement;
}
