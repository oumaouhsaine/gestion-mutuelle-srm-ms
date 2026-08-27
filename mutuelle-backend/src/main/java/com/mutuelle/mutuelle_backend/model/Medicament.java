package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "MEDICAMENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Medicament {
    @Id
    @Column(name = "ID")
    private Double id;

    @Column(name = "CODEEAN13", length = 10)
    private String codeean13;

    @Column(name = "NOTE", length = 10)
    private String note;

    @Column(name = "CLASSE_THERAPEUTIQUE", length = 10)
    private String classeTherapeutique;

    @Column(name = "FORME", length = 10)
    private String forme;

    @Column(name = "NOMDELASPECIALITE", length = 10)
    private String nomdelaspecialite;

    @Column(name = "OBSERVATION", length = 10)
    private String observation;

    @Column(name = "PRESENTATION", length = 10)
    private String presentation;

    @Column(name = "PRINCEPS_OU_GENERIQUE", length = 10)
    private String princepsOuGenerique;

    @Column(name = "REMBOURSABLE", length = 10)
    private String remboursable;
}
