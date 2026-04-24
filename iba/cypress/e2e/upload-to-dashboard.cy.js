describe('File upload to dashboard flow', () => {
  const testUser = {
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'johndoe@testmail.com',
    password: 'password',
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

  beforeEach(() => {
    cy.request('POST', 'http://localhost:5000/login', {
      email: testUser.email,
      password: testUser.password,
    }).then((response) => {
      cy.window().then((win) => {
        win.localStorage.setItem('user', JSON.stringify(response.body.user));
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

  //page rendering upload
  it('renders the upload dashboard page correctly', () => {
    cy.visit('/dashboard');
    cy.contains('Business Anomaly Detection').should('be.visible');
    cy.contains('Upload Business Data').should('be.visible');
    cy.contains('Analyze Data').should('be.visible');
  });

  it('analyze button is disabled before a file is selected', () => {
    cy.visit('/dashboard');
    cy.contains('Analyze Data').should('be.disabled');
  });

  it('shows the file name chip after selecting a file', () => {
    cy.visit('/dashboard');
    cy.get('input[type="file"]').selectFile(
      '../../mlmodel/sampleData/test_data.csv',
      { force: true }
    );
    cy.contains('test_data.csv').should('be.visible');
  });

  it('analyze button becomes enabled after selecting a file', () => {
    cy.visit('/dashboard');
    cy.get('input[type="file"]').selectFile(
      '../../mlmodel/sampleData/test_data.csv',
      { force: true }
    );
    cy.contains('Analyze Data').should('not.be.disabled');
  });

  //ml model response
  it('successfully uploads file and navigates to full dashboard', () => {
    cy.visit('/dashboard');
    cy.get('input[type="file"]').selectFile(
      '../../mlmodel/sampleData/test_data.csv',
      { force: true }
    );
    cy.contains('Analyze Data').click();

    cy.contains('Welcome back', { timeout: 30000 }).should('be.visible');
  });

  it('displays the fairness score of 100% after upload', () => {
    cy.visit('/dashboard');
    cy.get('input[type="file"]').selectFile(
      '../../mlmodel/sampleData/test_data.csv',
      { force: true }
    );
    cy.contains('Analyze Data').click();

    cy.contains('Fairness Score', { timeout: 30000 }).should('be.visible');
    cy.contains('100%').should('be.visible');
  });

  it('displays risk flags section after upload', () => {
    cy.visit('/dashboard');
    cy.get('input[type="file"]').selectFile(
      '../../mlmodel/sampleData/test_data.csv',
      { force: true }
    );
    cy.contains('Analyze Data').click();

    cy.contains('Risk Flags', { timeout: 30000 }).should('be.visible');
    cy.contains('Non-Pay').should('be.visible');
    cy.contains('Chargeback').should('be.visible');
    cy.contains('Variance Drop').should('be.visible');
  });

  it('displays payments trend chart after upload', () => {
    cy.visit('/dashboard');
    cy.get('input[type="file"]').selectFile(
      '../../mlmodel/sampleData/test_data.csv',
      { force: true }
    );
    cy.contains('Analyze Data').click();

    cy.contains('Payments Trend', { timeout: 30000 }).should('be.visible');
  });

  it('displays AI support section after upload', () => {
    cy.visit('/dashboard');
    cy.get('input[type="file"]').selectFile(
      '../../mlmodel/sampleData/test_data.csv',
      { force: true }
    );
    cy.contains('Analyze Data').click();

    cy.contains('Chat with Assistant', { timeout: 30000 }).should('be.visible');
    cy.contains('Open Chat').should('be.visible');
  });

  it('Open Chat button navigates to assistant page', () => {
    cy.visit('/dashboard');
    cy.get('input[type="file"]').selectFile(
      '../../mlmodel/sampleData/test_data.csv',
      { force: true }
    );
    cy.contains('Analyze Data').click();

    cy.contains('Open Chat', { timeout: 30000 }).click();
    cy.url().should('include', '/assistant');
  });
});