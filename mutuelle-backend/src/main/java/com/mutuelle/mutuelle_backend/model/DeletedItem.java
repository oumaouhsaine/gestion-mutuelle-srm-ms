package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "DELETED_ITEMS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeletedItem {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID")
    private Long id;

    @Column(name = "ENTITY_NAME", nullable = false, length = 100)
    private String entityName; // e.g. "Agent", "DevisDentaire", "DevisOptique", "CarteMutuelle", "Remboursement", "PriseEnCharge"

    @Column(name = "ENTITY_ID", nullable = false)
    private Long entityId;

    @Column(name = "DISPLAY_NAME", nullable = false, length = 255)
    private String displayName; // e.g. "Matricule 1234 - Dupont Jean" or "Devis #15"

    @Column(name = "DELETED_AT")
    @Temporal(TemporalType.TIMESTAMP)
    private Date deletedAt;

    @Column(name = "DELETED_BY", length = 100)
    private String deletedBy;

    @Lob
    @Column(name = "JSON_DATA", columnDefinition = "CLOB")
    private String jsonData;
}
