package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "MALADIE_SPECIALE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaladieSpeciale {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID_MALADIE")
    private Long idMaladie;

    @Column(name = "ID_BENEFICIAIRE")
    private Long idBeneficiaire;

    @Column(name = "TYPE", length = 100)
    private String type;

    @Column(name = "ETAT_MALADIE", length = 50)
    private String etatMaladie;

    @Column(name = "DATE_DEPOT")
    @Temporal(TemporalType.DATE)
    private Date dateDepot;

    @Column(name = "DATE_ENVOI")
    @Temporal(TemporalType.DATE)
    private Date dateEnvoi;

    @Column(name = "OBSERVATION", length = 255)
    private String observation;
}
