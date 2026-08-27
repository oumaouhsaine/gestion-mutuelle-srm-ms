package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "CARTE_MUTUELLE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarteMutuelle {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID_CARTE")
    private Long idCarte;

    @Column(name = "ID_BENEFICIAIRE")
    private Long idBeneficiaire;

    @Column(name = "DATE_DEMANDE")
    @Temporal(TemporalType.DATE)
    private Date dateDemande;

    @Column(name = "STATUT", length = 50)
    private String statut; // En attente, Accordée, Refusée

    @Column(name = "TYPE_DEMANDE", length = 100)
    private String typeDemande; // Adhésion, Duplicata, Changement

    @Column(name = "RAISON_CHANGEMENT", length = 500)
    private String raisonChangement;

    @Column(name = "DATE_VALIDATION")
    @Temporal(TemporalType.DATE)
    private Date dateValidation;
}
