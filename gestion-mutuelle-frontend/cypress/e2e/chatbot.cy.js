describe('Tests Système - Chatbot Assistant IA', () => {
  beforeEach(() => {
    // 1. Connexion en tant qu'Adhérent
    cy.intercept('POST', '**/api/auth/signin', {
      statusCode: 200,
      body: {
        token: 'fake-adherent-token',
        username: 'adherent_test',
        id: 1,
        roles: ['ROLE_CLIENT']
      }
    }).as('loginAdherent');

    cy.visit('/login');
    cy.get('input[type="text"]').type('adherent_test');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginAdherent');

    // Le chatbot est inclus dans toutes les pages (App.js)
    cy.url().should('include', '/adherent');
  });

  it('devrait ouvrir et fermer la fenêtre de discussion du Chatbot', () => {
    // Vérifier que la fenêtre n'est pas ouverte par défaut
    cy.get('.chat-window').should('not.exist');

    // Cliquer sur le bouton de bascule (robot)
    cy.get('.chatbot-toggle').click();

    // Vérifier que la fenêtre est ouverte et affiche le message d'accueil personnalisé
    cy.get('.chat-window').should('be.visible');
    cy.contains('.chat-header', 'Assistant n8n (Proxy)').should('be.visible');
    cy.contains('.message.bot', 'Bonjour adherent_test ! Je suis votre assistant IA. Comment puis-je vous aider ?').should('be.visible');

    // Fermer le chatbot
    cy.get('.chatbot-toggle').click();
    cy.get('.chat-window').should('not.exist');
  });

  it('devrait envoyer une question et afficher la réponse du chatbot', () => {
    // Intercepter l'appel proxy vers le chatbot
    cy.intercept('POST', '**/chatbot/proxy-n8n', {
      statusCode: 200,
      body: {
        response: 'Il y a 42 agents enregistrés dans la mutuelle.'
      }
    }).as('chatbotProxyRequest');

    // Ouvrir le chatbot
    cy.get('.chatbot-toggle').click();

    // Entrer et envoyer la question
    const questionText = "Combien d'agents y a-t-il ?";
    cy.get('.chat-footer input').type(questionText);
    cy.get('.chat-footer').submit();

    // Vérifier l'apparition du message utilisateur
    cy.contains('.message.user', questionText).should('be.visible');

    // Attendre l'interception de la requête
    cy.wait('@chatbotProxyRequest');

    // Vérifier l'affichage de la réponse
    cy.contains('.message.bot', 'Il y a 42 agents enregistrés dans la mutuelle.').should('be.visible');
  });
});
