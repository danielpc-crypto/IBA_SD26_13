describe('Login to Profile flow', () => {
  const testUser = {
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'johndoe@testmail.com',
    password: 'password',
  };

  before(() => {
    cy.request('POST', 'http://localhost:5000/signup', {
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      username: testUser.username,
      email: testUser.email,
      password: testUser.password,
    });
  });

  it('successfully logs in and lands on dashboard', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('displays correct user info on the profile page after login', () => {
    cy.request('POST', 'http://localhost:5000/login', {
      email: testUser.email,
      password: testUser.password,
    }).then((response) => {
      expect(response.status).to.eq(200);
      const user = response.body.user;
      cy.window().then((win) => {
        win.localStorage.setItem('user', JSON.stringify(user));
      });
    });

    cy.visit('/profile');

    cy.contains(`${testUser.firstName} ${testUser.lastName}`).should('be.visible');
    cy.contains(`@${testUser.username}`).should('be.visible');
    cy.contains(testUser.email).should('be.visible');
    cy.contains(testUser.firstName).should('be.visible');
    cy.contains(testUser.lastName).should('be.visible');
  });

  it('shows an error when logging in with wrong password', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/login');
  });

  it('redirects to login when visiting profile without being logged in', () => {
    cy.clearLocalStorage();
    cy.visit('/profile');
    cy.url().should('include', '/login');
  });

  after(() => {
    cy.request('DELETE', 'http://localhost:5000/users', {
      username: testUser.username,
      password: testUser.password,
    });
  });
});