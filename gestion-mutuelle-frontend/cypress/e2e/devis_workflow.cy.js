describe('Tests Système - Workflow Devis Dentaire', () => {
  const mockAgent = {
    idAgent: 10,
    idUser: 1,
    matricule: 'M123',
    nomComplet: 'Oumaima Ouhsaine',
    situationFamiliale: 'Célibataire',
    email: 'ouhsaineoumaima1@gmail.com'
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

  const mockDevisList = [
    {
      idDevis: 100,
      idBeneficiaire: 20,
      dateDevis: '2026-06-25T00:00:00.000Z',
      dateDepot: '2026-06-26T00:00:00.000Z',
      dateReponse: null,
      etatReponse: 'En attente',
      montant: 5000,
      precision: 'Couronne dentaire',
      observation: 'Devis initial pour traitement',
      scan: 'scan_devis_100.png'
    }
  ];

  beforeEach(() => {
    // Intercepter les appels d'API requis pour l'initialisation des pages
    cy.intercept('GET', '**/api/agents', [mockAgent]).as('getAgents');
    cy.intercept('GET', '**/api/beneficiaires', mockBeneficiaires).as('getBeneficiaires');
  });

  it('devrait permettre à un Adhérent de créer un nouveau Devis', () => {
    // 1. Simuler la connexion Adhérent
    cy.intercept('POST', '**/api/auth/signin', {
      statusCode: 200,
      body: {
        token: 'fake-adherent-token',
        username: 'adherent_test',
        id: 1,
        roles: ['ROLE_CLIENT']
      }
    }).as('loginAdherent');

    cy.intercept('GET', '**/api/devis-dentaire', []).as('getEmptyDevis');
    cy.intercept('POST', '**/api/files/upload', 'saved_ocr_scan.png').as('ocrUpload');
    cy.intercept('POST', '**/api/devis-dentaire', {
      statusCode: 200,
      body: mockDevisList[0]
    }).as('createDevis');

    cy.visit('/login');
    cy.get('input[type="text"]').type('adherent_test');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginAdherent');

    // Redirection vers l'espace adhérent
    cy.url().should('include', '/adherent');

    // Navigation vers la page des devis dentaires
    cy.visit('/adherent/devis/dentaire');
    cy.wait('@getEmptyDevis');
    cy.wait('@getAgents');
    cy.wait('@getBeneficiaires');
    cy.get('.modern-table').should('be.visible');

    // Cliquer sur le bouton d'ajout (Nouveau)
    cy.get('.add-btn').click({ force: true });

    // Remplir le formulaire dans la modal
    cy.get('.modal-content input[type="number"]').type('5000');
    cy.get('.modal-content input[type="date"]').eq(0).type('2026-06-25');
    cy.get('.modal-content input[type="date"]').eq(1).type('2026-06-26');
    cy.get('.modal-content input[type="text"]').type('Couronne dentaire');
    cy.get('.modal-content textarea').type('Devis initial pour traitement');

    // Simuler le dépôt d'un fichier scan (PDF pour éviter de déclencher l'OCR Tesseract.js dans le test)
    cy.get('.modal-content input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('fake scan file content'),
      fileName: 'devis.pdf',
      mimeType: 'application/pdf'
    });

    // Attendre l'alerte de succès du téléchargement et la fermer
    cy.contains('h3', 'Succès !', { timeout: 10000 }).should('be.visible');
    cy.contains('button', 'OK').click();

    // Vérifier que le fichier est sélectionné avec succès dans le formulaire
    cy.contains('Fichier sélectionné : saved_ocr_scan.png').should('be.visible');

    // Cliquer sur Enregistrer
    cy.get('.modal-content button[type="submit"]').click();

    // Vérifier la boîte de dialogue de succès finale de l'ajout du devis
    cy.contains('h3', 'Succès !', { timeout: 10000 }).should('be.visible');
    cy.contains('button', 'OK').click();
  });

  it('devrait permettre à un Administrateur de prendre en charge et valider un devis', () => {
    // 1. Simuler la connexion Admin
    cy.intercept('POST', '**/api/auth/signin', {
      statusCode: 200,
      body: {
        token: 'fake-admin-token',
        username: 'admin_test',
        id: 2,
        roles: ['ROLE_ADMIN']
      }
    }).as('loginAdmin');

    // Charger les devis avec le devis créé en attente
    cy.intercept('GET', '**/api/devis-dentaire', mockDevisList).as('getDevisList');
    cy.intercept('PUT', '**/api/devis-dentaire/100', {
      statusCode: 200,
      body: {
        ...mockDevisList[0],
        etatReponse: "En cours d'analyse"
      }
    }).as('takeChargeDevis');

    cy.intercept('POST', '**/api/notifications/email', { statusCode: 200 }).as('sendEmailNotification');

    cy.visit('/login');
    cy.get('input[type="text"]').type('admin_test');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginAdmin');

    // Redirection vers le Dashboard Admin
    cy.url().should('include', '/dashboard');

    // Navigation vers la gestion des devis dentaires
    cy.visit('/dashboard/devis/dentaire');
    cy.wait('@getDevisList');
    cy.wait('@getAgents');
    cy.wait('@getBeneficiaires');
    cy.get('.modern-table').should('be.visible');

    // Vérifier la présence du devis dans la table
    cy.contains('td', 'M123').should('be.visible');
    cy.contains('td', 'Ouhsaine Oumaima').should('be.visible');
    cy.contains('td', 'En attente').should('be.visible');

    // Cliquer sur l'action "Voir détails"
    cy.get('.view-btn').click({ force: true });

    // Prendre en charge le devis
    cy.contains('button', 'Prendre en charge').click({ force: true });

    // Vérifier le succès de la prise en charge
    cy.get('.modal-content', { timeout: 10000 }).should('exist');
    cy.contains('h3', 'Succès !').should('exist');
    cy.contains('button', 'OK').click();
  });
});
