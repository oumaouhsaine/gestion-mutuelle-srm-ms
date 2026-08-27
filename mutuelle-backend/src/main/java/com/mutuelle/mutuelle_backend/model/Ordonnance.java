package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "ORDONNANCE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ordonnance {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID_ORDONNANCE")
    private Long idOrdonnance;

    @Column(name = "ID_BENEFICIAIRE")
    private Long idBeneficiaire;

    @Column(name = "ID_MEDECIN")
    private Long idMedecin; // Added as requested

    @Column(name = "DATE_ORDONNANCE")
    @Temporal(TemporalType.DATE)
    private Date dateOrdonnance;

    @Column(name = "NUMERO_ORDONNANCE", length = 50)
    private String numeroOrdonnance;

    @Column(name = "MONTANT_TOTAL")
    private Double montantTotal;

    @Column(name = "SCAN", length = 255)
    private String scan;

    @Column(name = "OBSERVATION", length = 255)
    private String observation;
}
