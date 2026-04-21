import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  global.fetch = jest.fn();
});

//rendering tests
describe('Login rendering', () => {
  test('renders the welcome heading', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  test('renders the subtitle text', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByText(/sign in to access your dashboard/i)).toBeInTheDocument();
  });

  test('renders email input field', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  test('renders password input field', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('renders the login button', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('renders the sign up link', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  test('sign up link points to /signup', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/signup');
  });

  test('email field has correct type', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute('type', 'email');
  });

  test('password field has correct type', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
  });

  test('email field has correct placeholder', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
  });
});

//input tests
describe('Login input behaviour', () => {
  test('email field updates as user types', async () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const emailInput = screen.getByLabelText(/email address/i);
    await userEvent.type(emailInput, 'john@example.com');
    expect(emailInput).toHaveValue('john@example.com');
  });

  test('password field updates as user types', async () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const passwordInput = screen.getByLabelText(/password/i);
    await userEvent.type(passwordInput, 'testpassword');
    expect(passwordInput).toHaveValue('testpassword');
  });

  test('email and password fields are empty on initial render', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByLabelText(/email address/i)).toHaveValue('');
    expect(screen.getByLabelText(/password/i)).toHaveValue('');
  });

  test('email field rejects non-email input via required attribute', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute('required');
  });

  test('password field is marked required', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('required');
  });

  test('both fields can be filled out together', async () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    await userEvent.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'testpassword');
    expect(screen.getByLabelText(/email address/i)).toHaveValue('john@example.com');
    expect(screen.getByLabelText(/password/i)).toHaveValue('testpassword');
  });
});

//test unique login navbar
describe('Login navbar', () => {
  test('renders the brand name', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByText('Intelligent Business Analyzer')).toBeInTheDocument();
  });

  test('navbar login link points to /login', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const navLoginLink = screen.getAllByRole('link', { name: /login/i })[0];
    expect(navLoginLink).toHaveAttribute('href', '/login');
  });

  test('navbar get started link points to /signup', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute('href', '/signup');
  });
});

//test form submission works
describe('Login form submission', () => {
  test('calls fetch when form is submitted', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ message: 'Invalid credentials' }),
    });
    render(<MemoryRouter><Login /></MemoryRouter>);
    await userEvent.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'testpassword');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/login', expect.objectContaining({
        method: 'POST',
      }));
    });
  });
});