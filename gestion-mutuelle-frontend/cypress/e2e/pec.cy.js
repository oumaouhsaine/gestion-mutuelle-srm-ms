describe('Tests Système - Prise En Charge (PEC)', () => {
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

  const mockEtablissements = [
    {
      idEtablissement: 5,
      raisonSociale: 'Clinique Marrakech',
      convention: 'Conventionnée'
    }
  ];

  const mockPecs = [
    {
      idPec: 12,
      idBeneficiaire: 20,
      datePec: '2026-06-26T00:00:00.000Z',
      montantEstime: 3500,
      montantAccorde: 0,
      tauxCharge: 80,
      statut: 'En cours',
      scan: '',
      observation: 'Séances de rééducation',
      nombreSeance: 10,
      typeSoin: 'Kinésithérapie',
      idEtablissement: 5
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

    cy.intercept('GET', '**/api/prises-en-charge', mockPecs).as('getPecs');
    cy.intercept('GET', '**/api/agents', [mockAgent]).as('getAgents');
    cy.intercept('GET', '**/api/beneficiaires', mockBeneficiaires).as('getBeneficiaires');
    cy.intercept('GET', '**/api/etablissements', mockEtablissements).as('getEtablissements');

    // Connexion et navigation
    cy.visit('/login');
    cy.get('input[type="text"]').type('admin_test');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginAdmin');
    cy.visit('/dashboard/prise-en-charge');
    cy.get('.modern-table').should('be.visible');
  });

  it('devrait afficher la liste des PEC dans le tableau', () => {
    cy.get('.modern-table').should('be.visible');
    cy.contains('td', 'M123', { timeout: 15000 }).should('be.visible');
    cy.contains('td', '3500 DH').should('be.visible');
    cy.contains('td', 'En cours').should('be.visible');
  });

  it('devrait ajouter une nouvelle demande de PEC', () => {
    cy.intercept('POST', '**/api/prises-en-charge', {
      statusCode: 200,
      body: {
        idPec: 13,
        idBeneficiaire: 20,
        datePec: '2026-06-26T00:00:00.000Z',
        montantEstime: 1500,
        montantAccorde: 0,
        tauxCharge: 80,
        statut: 'En cours',
        scan: '',
        observation: 'Achat de lunettes',
        nombreSeance: 1,
        typeSoin: 'Optique',
        idEtablissement: 5
      }
    }).as('createPec');

    // Cliquer sur le bouton d'ajout (Nouveau)
    cy.get('.add-btn').click({ force: true });

    // Remplir le formulaire dans la modal
    cy.get('.modal-content select').eq(0).select('10'); // Agent M123
    cy.get('.modal-content select').eq(1).select('20'); // Bénéficiaire Oumaima
    cy.get('.modal-content input[type="number"]').eq(0).type('1500'); // Montant estimé
    cy.get('.modal-content input[type="number"]').eq(1).type('80'); // Taux
    cy.get('.modal-content input[type="number"]').eq(2).type('1'); // Nb séances
    cy.get('.modal-content input[placeholder*="Kinésithérapie"]').type('Optique');
    cy.get('.modal-content select').eq(2).select('5'); // Clinique Marrakech
    cy.get('.modal-content input[type="date"]').type('2026-06-26');
    cy.get('.modal-content select').eq(3).select('En cours'); // Statut
    cy.get('.modal-content textarea').type('Achat de lunettes');

    cy.get('.modal-content button[type="submit"]').click({ force: true });
    cy.wait('@createPec');

    // Vérifier l'alerte de succès
    cy.get('.modal-content').should('exist');
    cy.contains('h3', 'Succès !').should('exist');
    cy.contains('button', 'OK').click();
  });

  it('devrait afficher les détails d\'une PEC existante', () => {
    // S'assurer que les données sont chargées dans le tableau (évite la race condition de React)
    cy.contains('td', 'M123', { timeout: 15000 }).should('be.visible');

    // Cliquer sur le bouton "Voir détails"
    cy.get('.view-btn').first().click({ force: true });

    // Vérifier les détails dans la modal
    cy.get('.modal-content').should('exist');
    cy.contains('h3', 'Prise En Charge #12').should('exist');
    cy.contains('p', 'Ouhsaine Oumaima', { timeout: 15000 }).should('exist');
  });
});
