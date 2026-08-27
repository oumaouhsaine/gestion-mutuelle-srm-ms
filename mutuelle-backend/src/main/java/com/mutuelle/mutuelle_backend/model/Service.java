package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "SERVICE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID_SERVICE")
    private Long idService;

    @Column(name = "NOM", length = 150)
    private String nom;

    @Column(name = "CODE", length = 50)
    private String code;

    @Column(name = "ID_DIVISION")
    private Long idDivision;
}
