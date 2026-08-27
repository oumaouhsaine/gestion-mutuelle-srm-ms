package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "AGENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Agent {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID_AGENT")
    private Long idAgent;

    @Column(name = "MATRICULE", length = 50)
    private String matricule;

    @Column(name = "NOM", length = 100)
    private String nom;

    @Column(name = "PRENOM", length = 100)
    private String prenom;

    @Column(name = "SITUATION_FAMILIALE", length = 50)
    private String situationFamiliale;

    public String getNomComplet() {
        return (nom != null ? nom : "") + (prenom != null ? " " + prenom : "");
    }

    public void setNomComplet(String nomComplet) {
        if (nomComplet != null && !nomComplet.trim().isEmpty()) {
            String[] parts = nomComplet.trim().split("\\s+", 2);
            this.nom = parts[0];
            this.prenom = parts.length > 1 ? parts[1] : "";
        }
    }

    @Column(name = "DATE_NAISSANCE")
    @Temporal(TemporalType.DATE)
    private Date dateNaissance;

    @Column(name = "TELEPHONE", length = 20)
    private String telephone;

    @Column(name = "DATE_RECRUTEMENT")
    @Temporal(TemporalType.DATE)
    private Date dateRecrutement;

    @Column(name = "DATE_TITULARISATION")
    @Temporal(TemporalType.DATE)
    private Date dateTitularisation;

    @Column(name = "DATE_ENTREE_REGIE")
    @Temporal(TemporalType.DATE)
    private Date dateEntreeRegie;

    @Column(name = "VILLE", length = 100)
    private String ville;

    @Column(name = "ADRESSE", length = 255)
    private String adresse;

    @Column(name = "STATUT", length = 20)
    private String statut;

    @Column(name = "ID_USER")
    private Long idUser;

    @Column(name = "ID_ENTITE")
    private Long idEntite;

    @Column(name = "ID_SERVICE")
    private Long idService;

    @Column(name = "EMAIL", length = 50)
    private String email;
}
