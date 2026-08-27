describe('Tests Système - Cartes Mutuelle', () => {
  const mockAgent = {
    idAgent: 10,
    matricule: 'M123',
    nomComplet: 'Oumaima Ouhsaine',
    situationFamiliale: 'Célibataire'
  };

  const mockBeneficiaires = [
    {
      idBeneficiaire: 20,
      idAgent: 10,
      nom: 'Ouhsaine',
      prenom: 'Oumaima',
      lienParente: 'Lui-même'
    }
  ];

  const mockCartes = [
    {
      idCarte: 1,
      idBeneficiaire: 20,
      typeDemande: 'Adhésion',
      raisonChangement: '',
      statut: 'En attente',
      dateDemande: '2026-06-26T00:00:00.000Z'
    }
  ];

  beforeEach(() => {
    // Authentifier l'admin
    cy.intercept('POST', '**/api/auth/signin', {
      statusCode: 200,
      body: {
        token: 'fake-admin-token',
        username: 'admin_test',
        id: 2,
        roles: ['ROLE_ADMIN']
      }
    }).as('loginAdmin');

    cy.intercept('GET', '**/api/cartes', mockCartes).as('getCartes');
    cy.intercept('GET', '**/api/agents', [mockAgent]).as('getAgents');
    cy.intercept('GET', '**/api/beneficiaires', mockBeneficiaires).as('getBeneficiaires');

    // Connexion et navigation
    cy.visit('/login');
    cy.get('input[type="text"]').type('admin_test');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginAdmin');
    cy.visit('/dashboard/carte-mutuelle');
    cy.get('.modern-table').should('be.visible');
  });

  it('devrait basculer entre le mode Tableau et Grille', () => {
    // Par défaut, nous chargeons sous forme de Tableau (GenericTable)
    cy.get('.modern-table').should('be.visible');
    cy.contains('td', 'M123', { timeout: 15000 }).should('be.visible');
    cy.contains('td', 'Adhésion').should('be.visible');

    // Basculer vers le mode Grille
    cy.contains('button', 'Grille').click();
    cy.get('.mutuelle-grid').should('be.visible');
    cy.get('.mutuelle-card').should('have.length', 1);
    cy.contains('.card-value-matricule', 'M123').should('be.visible');

    // Basculer à nouveau vers le Tableau
    cy.contains('button', 'Tableau').click();
    cy.get('.modern-table').should('be.visible');
  });

  it('devrait permettre de créer une nouvelle demande de carte', () => {
    cy.intercept('POST', '**/api/cartes', {
      statusCode: 200,
      body: {
        idCarte: 2,
        idBeneficiaire: 20,
        typeDemande: 'Duplicata',
        raisonChangement: 'Perte de carte',
        statut: 'En attente',
        dateDemande: '2026-06-26T00:00:00.000Z'
      }
    }).as('createCarte');

    // Basculer vers Grille et cliquer sur Nouveau
    cy.contains('button', 'Grille').click();
    cy.contains('button', 'Nouveau').click({ force: true });

    // Remplir le formulaire modal dans la modal
    cy.get('.modal-content select').eq(0).select('10'); // Agent M123
    cy.get('.modal-content select').eq(1).select('20'); // Bénéficiaire Oumaima
    cy.get('.modal-content select').eq(2).select('Duplicata');
    cy.get('.modal-content textarea').type('Perte de carte');

    cy.get('.modal-content button[type="submit"]').click({ force: true });
    cy.wait('@createCarte');

    // Confirmer le message de succès
    cy.get('.modal-content').should('exist');
    cy.contains('h3', 'Succès !').should('exist');
    cy.contains('button', 'OK').click();
  });

  it('devrait afficher les détails d\'une carte existante', () => {
    cy.contains('button', 'Grille').click();

    // Cliquer sur le bouton "Voir détails" de la carte (premier bouton d'action)
    cy.get('.card-btn-dark').first().click({ force: true });

    // Vérifier les détails dans la modal
    cy.get('.modal-content').should('be.visible');
    cy.contains('h3', 'Détails de la demande #1').should('be.visible');
    cy.contains('p', 'Adhésion').should('be.visible');
    cy.contains('p', 'En attente').should('be.visible');
  });
});
