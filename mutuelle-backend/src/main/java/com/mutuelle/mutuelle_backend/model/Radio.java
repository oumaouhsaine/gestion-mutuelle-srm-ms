package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "RADIO")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Radio {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID_RADIO")
    private Long idRadio;

    @Column(name = "ID_BENEFICIAIRE")
    private Long idBeneficiaire;

    @Column(name = "TYPE_RADIO", length = 100)
    private String typeRadio;

    @Column(name = "SCAN_RADIO", length = 255)
    private String scanRadio;

    @Column(name = "OBSERVATION", length = 255)
    private String observation;

    @Column(name = "TOTAL")
    private Double total; // Utilisé comme montant demandé

    @Column(name = "MONTANT_ACCORDE")
    private Double montantAccorde;

    @Column(name = "DATE_DEMANDE")
    @Temporal(TemporalType.DATE)
    private Date dateDemande;

    @Column(name = "DATE_REPONSE")
    @Temporal(TemporalType.DATE)
    private Date dateReponse;

    @Column(name = "STATUT", length = 50)
    private String statut;
}
