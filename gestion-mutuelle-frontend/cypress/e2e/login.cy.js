describe('Tests Système - Espace de Connexion', () => {
  beforeEach(() => {
    // Visiter la page de connexion avant chaque test
    cy.visit('/login');
  });

  it('devrait charger la page de connexion avec la langue par défaut (Français)', () => {
    // Vérifier le titre de l'espace de connexion en Français
    cy.get('.form-title').should('contain', 'Espace Mutuelle');
    cy.get('input[type="text"]').should('have.attr', 'placeholder', "Votre nom d'utilisateur ou matricule");
  });

  it('devrait basculer la langue en Arabe et revenir en Français', () => {
    // Cliquer sur le bouton Arabe
    cy.contains('button', 'العربية').click();

    // Vérifier que la direction de la page devient RTL
    cy.get('.login-container').should('have.attr', 'dir', 'rtl');
    cy.get('.form-title').should('contain', 'فضاء التعاضدية');
    cy.get('input[type="text"]').should('have.attr', 'placeholder', 'أدخل اسم المستخدم أو رقم التسجيل');

    // Revenir en Français
    cy.contains('button', 'FR').click();
    cy.get('.login-container').should('have.attr', 'dir', 'ltr');
    cy.get('.form-title').should('contain', 'Espace Mutuelle');
  });

  it('devrait afficher une erreur en cas d\'identifiants incorrects', () => {
    // Intercepter l'appel API de connexion pour renvoyer une erreur 401
    cy.intercept('POST', '**/api/auth/signin', {
      statusCode: 401,
      body: { message: 'Unauthorized' }
    }).as('loginRequestFailed');

    // Saisir des identifiants invalides
    cy.get('input[type="text"]').type('wrong_user');
    cy.get('input[type="password"]').type('wrong_password');

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Attendre que la requête interceptée soit terminée
    cy.wait('@loginRequestFailed');

    // Vérifier l'apparition du message d'erreur
    cy.get('.error-message-split')
      .should('be.visible')
      .and('contain', 'Identifiants incorrects. Veuillez réessayer.');
  });

  it('devrait se connecter avec succès en tant qu\'Adhérent et rediriger vers son espace', () => {
    // Intercepter la requête de connexion pour simuler un succès pour le rôle ROLE_CLIENT
    cy.intercept('POST', '**/api/auth/signin', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token-abcd',
        username: 'adherent_test',
        roles: ['ROLE_CLIENT']
      }
    }).as('loginRequestSuccess');

    // Saisir des identifiants valides
    cy.get('input[type="text"]').type('adherent_test');
    cy.get('input[type="password"]').type('password123');

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Attendre l'appel API
    cy.wait('@loginRequestSuccess');

    // Vérifier la redirection vers l'espace adhérent
    cy.url().should('include', '/adherent');
  });
});
