describe('File upload to dashboard flow', () => {
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
    email: 'testuser@testmail.com',
    password: 'testpassword123',
  };

  const loginAndSetStorage = () => {
    return cy.request('POST', 'http://localhost:5000/login', {
      email: testUser.email,
      password: testUser.password,
    }).then((response) => {
      cy.window().then((win) => {
        win.localStorage.setItem('user', JSON.stringify(response.body.user));
      });
    });
  };

  before(() => {
    cy.request({
      method: 'DELETE',
      url: 'http://localhost:5000/users',
      body: { username: testUser.username, password: testUser.password },
      failOnStatusCode: false,
    }).then(() => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:5000/signup',
        body: {
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          username: testUser.username,
          email: testUser.email,
          password: testUser.password,
        },
      });
    });
  });

  after(() => {
    cy.request({
      method: 'DELETE',
      url: 'http://localhost:5000/users',
      body: { username: testUser.username, password: testUser.password },
      failOnStatusCode: false,
    });
  });

  // ─── Upload page rendering ──────────────────────────────────────────────────

  it('renders the upload dashboard page correctly', () => {
    loginAndSetStorage();
    cy.visit('/dashboard');
    cy.contains('Business Anomaly Detection').should('be.visible');
    cy.contains('Upload Business Data').should('be.visible');
    cy.contains('Analyze Data').should('be.visible');
  });

  it('analyze button is disabled before a file is selected', () => {
    loginAndSetStorage();
    cy.visit('/dashboard');
    cy.contains('Analyze Data').should('be.disabled');
  });

  it('shows the file name chip after selecting a file', () => {
    loginAndSetStorage();
    cy.visit('/dashboard');
    cy.get('input[type="file"]').selectFile(
      'cypress/fixtures/test_data.csv',
      { force: true }
    );
    cy.contains('test_data.csv').should('be.visible');
  });

  it('analyze button becomes enabled after selecting a file', () => {
    loginAndSetStorage();
    cy.visit('/dashboard');
    cy.get('input[type="file"]').selectFile(
      'cypress/fixtures/test_data.csv',
      { force: true }
    );
    cy.contains('Analyze Data').should('not.be.disabled');
  });

  // ─── Upload and full dashboard results ─────────────────────────────────────

  describe('After successful upload', () => {
    beforeEach(() => {
      // Delete and recreate user to reset business_data_uploaded flag
      cy.request({
        method: 'DELETE',
        url: 'http://localhost:5000/users',
        body: { username: testUser.username, password: testUser.password },
        failOnStatusCode: false,
      }).then(() => {
        cy.request({
          method: 'POST',
          url: 'http://localhost:5000/signup',
          body: {
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            username: testUser.username,
            email: testUser.email,
            password: testUser.password,
          },
        }).then(() => {
          cy.request('POST', 'http://localhost:5000/login', {
            email: testUser.email,
            password: testUser.password,
          }).then((response) => {
            cy.window().then((win) => {
              win.localStorage.setItem('user', JSON.stringify(response.body.user));
            });
          });
        });
      });

      cy.visit('/dashboard');
      cy.get('input[type="file"]', { timeout: 10000 }).selectFile(
        'cypress/fixtures/test_data.csv',
        { force: true }
      );
      cy.contains('Analyze Data').click();
      cy.contains('Welcome back', { timeout: 30000 }).should('be.visible');
    });

    it('successfully uploads file and navigates to full dashboard', () => {
      cy.url().should('include', '/dashboard');
      cy.contains('Welcome back').should('be.visible');
    });

    it('displays the fairness score of 100% after upload', () => {
        cy.contains('Fairness Score').should('be.visible');
        cy.get('h6').then(($els) => {
        const texts = [...$els].map(el => el.innerText);
        cy.log('h6 texts found: ' + JSON.stringify(texts));
        });
        cy.contains('100%').should('be.visible');
    });

    it('displays risk flags section after upload', () => {
      cy.contains('Risk Flags').should('be.visible');
      cy.contains('Non-Pay').should('be.visible');
      cy.contains('Chargeback').should('be.visible');
      cy.contains('Variance Drop').should('be.visible');
    });

    it('displays payments trend chart after upload', () => {
      cy.contains('Payments Trend').should('be.visible');
    });

    it('displays AI support section after upload', () => {
      cy.contains('Chat with Assistant').should('be.visible');
      cy.contains('Open Chat').should('be.visible');
    });

    it('Open Chat button navigates to assistant page', () => {
      cy.contains('Open Chat').click();
      cy.url().should('include', '/assistant');
    });
  });
});