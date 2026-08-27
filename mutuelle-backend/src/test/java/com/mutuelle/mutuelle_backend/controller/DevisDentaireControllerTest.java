package com.mutuelle.mutuelle_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mutuelle.mutuelle_backend.model.DevisDentaire;
import com.mutuelle.mutuelle_backend.repository.*;
import com.mutuelle.mutuelle_backend.security.JwtUtils;
import com.mutuelle.mutuelle_backend.security.UserDetailsServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DevisDentaireController.class)
public class DevisDentaireControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DevisDentaireRepository devisDentaireRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private AgentRepository agentRepository;

    @MockBean
    private AdherentRepository adherentRepository;

    @MockBean
    private BeneficiaireRepository beneficiaireRepository;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @MockBean
    private JwtUtils jwtUtils;

    @Test
    @WithMockUser
    public void testGetAll() throws Exception {
        // Arrange
        DevisDentaire devis1 = new DevisDentaire();
        devis1.setIdDevis(1L);
        devis1.setMontant(2500.0);
        devis1.setEtatReponse("En attente");

        DevisDentaire devis2 = new DevisDentaire();
        devis2.setIdDevis(2L);
        devis2.setMontant(1500.0);
        devis2.setEtatReponse("Accordé");

        when(devisDentaireRepository.findAll()).thenReturn(Arrays.asList(devis1, devis2));

        // Act & Assert
        mockMvc.perform(get("/api/devis-dentaire"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].idDevis").value(1))
                .andExpect(jsonPath("$[0].montant").value(2500.0))
                .andExpect(jsonPath("$[0].etatReponse").value("En attente"))
                .andExpect(jsonPath("$[1].idDevis").value(2))
                .andExpect(jsonPath("$[1].montant").value(1500.0))
                .andExpect(jsonPath("$[1].etatReponse").value("Accordé"));

        verify(devisDentaireRepository, times(1)).findAll();
    }

    @Test
    @WithMockUser
    public void testCreate() throws Exception {
        // Arrange
        DevisDentaire devis = new DevisDentaire();
        devis.setMontant(3000.0);
        devis.setEtatReponse("En attente");
        devis.setPrecision("Implants");

        DevisDentaire savedDevis = new DevisDentaire();
        savedDevis.setIdDevis(1L);
        savedDevis.setMontant(3000.0);
        savedDevis.setEtatReponse("En attente");
        savedDevis.setPrecision("Implants");

        when(devisDentaireRepository.save(any(DevisDentaire.class))).thenReturn(savedDevis);

        // Act & Assert
        mockMvc.perform(post("/api/devis-dentaire")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(devis)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idDevis").value(1))
                .andExpect(jsonPath("$.montant").value(3000.0))
                .andExpect(jsonPath("$.precision").value("Implants"));

        verify(devisDentaireRepository, times(1)).save(any(DevisDentaire.class));
    }

    @Test
    @WithMockUser
    public void testUpdate() throws Exception {
        // Arrange
        Long devisId = 1L;
        DevisDentaire existingDevis = new DevisDentaire();
        existingDevis.setIdDevis(devisId);
        existingDevis.setMontant(3000.0);
        existingDevis.setEtatReponse("En attente");

        DevisDentaire updatedDetails = new DevisDentaire();
        updatedDetails.setMontant(3500.0);
        updatedDetails.setEtatReponse("En cours d'analyse");
        updatedDetails.setPrecision("Implants révisés");

        DevisDentaire savedDevis = new DevisDentaire();
        savedDevis.setIdDevis(devisId);
        savedDevis.setMontant(3500.0);
        savedDevis.setEtatReponse("En cours d'analyse");
        savedDevis.setPrecision("Implants révisés");

        when(devisDentaireRepository.findById(devisId)).thenReturn(Optional.of(existingDevis));
        when(devisDentaireRepository.save(any(DevisDentaire.class))).thenReturn(savedDevis);

        // Act & Assert
        mockMvc.perform(put("/api/devis-dentaire/{id}", devisId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idDevis").value(devisId))
                .andExpect(jsonPath("$.montant").value(3500.0))
                .andExpect(jsonPath("$.etatReponse").value("En cours d'analyse"))
                .andExpect(jsonPath("$.precision").value("Implants révisés"));

        verify(devisDentaireRepository, times(1)).findById(devisId);
        verify(devisDentaireRepository, times(1)).save(any(DevisDentaire.class));
    }

    @Test
    @WithMockUser
    public void testDelete() throws Exception {
        // Arrange
        Long devisId = 1L;
        DevisDentaire existingDevis = new DevisDentaire();
        existingDevis.setIdDevis(devisId);

        when(devisDentaireRepository.findById(devisId)).thenReturn(Optional.of(existingDevis));
        doNothing().when(devisDentaireRepository).delete(existingDevis);

        // Act & Assert
        mockMvc.perform(delete("/api/devis-dentaire/{id}", devisId)
                        .with(csrf()))
                .andExpect(status().isOk());

        verify(devisDentaireRepository, times(1)).findById(devisId);
        verify(devisDentaireRepository, times(1)).delete(existingDevis);
    }
}
