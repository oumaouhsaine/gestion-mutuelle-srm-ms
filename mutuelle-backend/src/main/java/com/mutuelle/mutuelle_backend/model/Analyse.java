package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "ANALYSE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Analyse {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID_ANALYSE")
    private Long idAnalyse;

    @Column(name = "ID_BENEFICIAIRE")
    private Long idBeneficiaire;

    @Column(name = "OBSERVATION", length = 255)
    private String observation;

    @Column(name = "SCAN", length = 255)
    private String scan;

    @Column(name = "TOTAL")
    private Double total;
}
