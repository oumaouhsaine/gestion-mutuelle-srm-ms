package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "DIRECTION")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Direction {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID_DIRECTION")
    private Long idDirection;

    @Column(name = "NOM", length = 150)
    private String nom;

    @Column(name = "CODE", length = 50)
    private String code;
}
