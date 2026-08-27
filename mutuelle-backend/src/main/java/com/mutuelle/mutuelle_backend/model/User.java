package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "UTILISATEUR")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID_USER")
    private Long id;

    @Column(name = "NOM")
    private String nom;

    @Column(name = "PRENOM")
    private String prenom;

    @Column(name = "EMAIL", unique = true, nullable = false)
    private String username;

    @Column(name = "MOT_DE_PASSE", nullable = false)
    private String password;

    @Column(name = "ROLE", nullable = false)
    private String role; 

    @Column(name = "STATUT")
    private String statut;

    @Column(name = "DATE_CREATION")
    private java.util.Date dateCreation;
}
