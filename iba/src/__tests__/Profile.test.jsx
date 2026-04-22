import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Profile from '../Profile';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../Header', () => ({ open, setOpen }) => (
  <div data-testid="header" />
));

const renderWithUser = (user = null) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
  return render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );
};

const mockUser = {
  firstName: 'John',
  lastName: 'Doe',
  username: 'johndoe',
  email: 'johndoe@testmail.com',
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  global.fetch = jest.fn();
});

//test rendering
describe('Profile rendering', () => {
  test('renders the page heading', () => {
    renderWithUser(mockUser);
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  test('displays user full name', () => {
    renderWithUser(mockUser);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('displays username with @ prefix', () => {
    renderWithUser(mockUser);
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
  });

  test('displays all profile fields', () => {
    renderWithUser(mockUser);
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('johndoe')).toBeInTheDocument();
    expect(screen.getByText('johndoe@testmail.com')).toBeInTheDocument();
  });

  test('shows fallback message when no user in localStorage', () => {
    renderWithUser(null);
    expect(screen.getByText(/no profile data available/i)).toBeInTheDocument();
  });

  test('renders the Delete Account button', () => {
    renderWithUser(mockUser);
    expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
  });

  test('renders the header component', () => {
    renderWithUser(mockUser);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });
});

//test redirect
describe('Auth redirect', () => {
  test('redirects to /login when no user in localStorage', () => {
    renderWithUser(null);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('does not redirect when user is present', () => {
    renderWithUser(mockUser);
    expect(mockNavigate).not.toHaveBeenCalledWith('/login');
  });
});

//test deletion dialog
describe('Delete account dialog', () => {
  test('dialog is not visible on initial render', () => {
    renderWithUser(mockUser);
    expect(screen.queryByText(/this action cannot be undone/i)).not.toBeInTheDocument();
  });

  test('opens the delete dialog when Delete Account is clicked', async () => {
    renderWithUser(mockUser);
    await userEvent.click(screen.getByRole('button', { name: /delete account/i }));
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
  });

  test('closes the dialog when Cancel is clicked', async () => {
    renderWithUser(mockUser);
    await userEvent.click(screen.getByRole('button', { name: /delete account/i }));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByText(/this action cannot be undone/i)).not.toBeInTheDocument();
    });
  });

  test('password input accepts typed value', async () => {
    renderWithUser(mockUser);
    await userEvent.click(screen.getByRole('button', { name: /delete account/i }));
    const input = screen.getByPlaceholderText(/enter your password/i);
    await userEvent.type(input, 'mysecret');
    expect(input).toHaveValue('mysecret');
  });

  test('clears password input when dialog is cancelled', async () => {
    renderWithUser(mockUser);
    await userEvent.click(screen.getByRole('button', { name: /delete account/i }));
    await userEvent.type(screen.getByPlaceholderText(/enter your password/i), 'mysecret');
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await userEvent.click(screen.getByRole('button', { name: /delete account/i }));
    expect(screen.getByPlaceholderText(/enter your password/i)).toHaveValue('');
  });
});