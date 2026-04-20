import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Profile from '../Profile';

//mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

//mock header component so profile is isolated
jest.mock('../Header', () => () => <div data-testid="header" />);

//render Profile with a user in localStorage
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
  email: 'johndoe@fakemail.com',
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  global.fetch = jest.fn();
});

//render
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
    expect(screen.getByText('johndoe@fakemail.com')).toBeInTheDocument();
  });

  test('shows fallback message when no user is in localStorage', () => {
    renderWithUser(null);
    expect(screen.getByText(/no profile data available/i)).toBeInTheDocument();
  });

  test('renders the Delete Account button', () => {
    renderWithUser(mockUser);
    expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
  });
});

// ─── Redirect ─────────────────────────────────────────────────────────────────

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

//delete account dialog test
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
    
    //reopen, confirm field is empty
    await userEvent.click(screen.getByRole('button', { name: /delete account/i }));
    expect(screen.getByPlaceholderText(/enter your password/i)).toHaveValue('');
  });
});