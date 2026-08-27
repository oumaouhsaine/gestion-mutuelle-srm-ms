package com.mutuelle.mutuelle_backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.mutuelle.mutuelle_backend.repository.AgentRepository;
import com.mutuelle.mutuelle_backend.repository.MedecinRepository;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ChatbotServiceTest {

    @Mock
    private AgentRepository agentRepository;

    @Mock
    private MedecinRepository medecinRepository;

    @InjectMocks
    private ChatbotService chatbotService;

    @Test
    public void testGetSmartResponse_Bonjour() {
        // Act
        String response = chatbotService.getSmartResponse("bonjour", "ROLE_CLIENT");

        // Assert
        assertTrue(response.contains("Bonjour"));
        assertTrue(response.contains("assistant intelligent"));
    }

    @Test
    public void testGetSmartResponse_Contact() {
        // Act
        String response = chatbotService.getSmartResponse("Quel est votre e-mail et numéro de contact ?", "ROLE_CLIENT");

        // Assert
        assertTrue(response.contains("contact@srm-ms.ma"));
        assertTrue(response.contains("05.XX.XX.XX.XX"));
    }

    @Test
    public void testGetSmartResponse_CombienAgents() {
        // Arrange
        // On simule le fait qu'il y a 42 agents enregistrés en base de données
        when(agentRepository.count()).thenReturn(42L);

        // Act
        String response = chatbotService.getSmartResponse("combien d'agents ?", "ROLE_CLIENT");

        // Assert
        assertTrue(response.contains("Il y a 42 agents enregistrés."));
    }

    @Test
    public void testGetSmartResponse_CombienMedecins() {
        // Arrange
        // On simule le fait qu'il y a 15 médecins conventionnés
        when(medecinRepository.count()).thenReturn(15L);

        // Act
        String response = chatbotService.getSmartResponse("nombre de medecin", "ROLE_CLIENT");

        // Assert
        assertTrue(response.contains("Nous travaillons avec 15 médecins conventionnés."));
    }

    @Test
    public void testGetSmartResponse_SearchAgentByMatricule() {
        // Arrange : Création d'un agent fictif
        com.mutuelle.mutuelle_backend.model.Agent mockAgent = new com.mutuelle.mutuelle_backend.model.Agent();
        mockAgent.setMatricule("A123");
        mockAgent.setNom("John");
        mockAgent.setPrenom("Doe");
        mockAgent.setStatut("Actif");

        // Simulation du comportement du repository
        java.util.List<com.mutuelle.mutuelle_backend.model.Agent> agentsList = java.util.Collections.singletonList(mockAgent);
        when(agentRepository.findAll()).thenReturn(agentsList);

        // Act : Appel de la méthode
        String response = chatbotService.getSmartResponse("cherche matricule a123", "ROLE_CLIENT");

        // Assert : Vérification du résultat
        assertTrue(response.contains("John Doe"));
        assertTrue(response.contains("A123"));
        assertTrue(response.contains("Actif"));
    }
}
