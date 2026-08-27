package com.mutuelle.mutuelle_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "DEVIS_OPTIQUE")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@PrimaryKeyJoinColumn(name = "ID_DEVIS")
public class DevisOptique extends Devis {
    @Column(name = "TYPE_OPTIQUE", length = 100)
    private String typeOptique;
}
