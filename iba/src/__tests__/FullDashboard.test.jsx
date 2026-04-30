import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import FullDashboard from '../FullDashboard';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../Header', () => ({ open, setOpen }) => (
  <div data-testid="header" />
));

jest.mock('../start.css', () => ({}));

jest.mock('@mui/x-charts/LineChart', () => ({
  LineChart: () => <div data-testid="line-chart" />,
}));

const mockUser = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  username: 'johndoe',
  email: 'johndoe@testmailcom',
};

const mockFlags = {
  supplier_name: 'Acme Corp',
  contract_start_date: '2024-01-01',
  contract_term_months: 12,
  non_pay: false,
  chargeback: false,
  variance_com_drop: false,
  fairness: 100,
  current_month_commission: 5000,
  last_month_commission: 4800,
  prior_month_2_commission: 4600,
  prior_month_3_commission: 4400,
  prior_month_4_commission: 4200,
  prior_month_5_commission: 4000,
};

const mockFlagsWithRisks = {
  ...mockFlags,
  non_pay: true,
  chargeback: true,
  variance_com_drop: true,
  fairness: 45,
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

const renderWithUser = (user = mockUser, flags = mockFlags) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('flags', JSON.stringify(flags));
  return render(
    <MemoryRouter>
      <FullDashboard />
    </MemoryRouter>
  );
};

//render tests
describe('FullDashboard rendering', () => {
  test('renders the header component', () => {
    renderWithUser();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  test('renders the welcome message with user first name', () => {
    renderWithUser();
    expect(screen.getByText(/welcome back, Jane/i)).toBeInTheDocument();
  });

  test('renders the supplier analytics subtitle', () => {
    renderWithUser();
    expect(screen.getByText(/supplier analytics overview/i)).toBeInTheDocument();
  });

  test('renders the fairness score section', () => {
    renderWithUser();
    expect(screen.getByText('Fairness Score')).toBeInTheDocument();
  });

  test('renders the risk flags section', () => {
    renderWithUser();
    expect(screen.getByText('Risk Flags')).toBeInTheDocument();
  });

  test('renders the payments trend section', () => {
    renderWithUser();
    expect(screen.getByText('Payments Trend')).toBeInTheDocument();
  });

  test('renders the AI support section', () => {
    renderWithUser();
    expect(screen.getByText('AI Support')).toBeInTheDocument();
  });

  test('renders the line chart', () => {
    renderWithUser();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  test('renders the footer copyright text', () => {
    renderWithUser();
    expect(screen.getByText(/2026 Intelligent Business Analyzer/i)).toBeInTheDocument();
  });

  test('renders the footer disclaimer', () => {
    renderWithUser();
    expect(screen.getByText(/predictive modeling/i)).toBeInTheDocument();
  });
});

//test fact cards
describe('FullDashboard quick facts cards', () => {
  test('displays the supplier name from flags', () => {
    renderWithUser();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  test('displays the supplier name label', () => {
    renderWithUser();
    expect(screen.getByText(/supplier name/i)).toBeInTheDocument();
  });

  test('displays the contract start label', () => {
    renderWithUser();
    expect(screen.getByText(/contract start/i)).toBeInTheDocument();
  });

  test('displays the term months label', () => {
    renderWithUser();
    expect(screen.getByText(/term \(months\)/i)).toBeInTheDocument();
  });

  test('displays the contract term value from flags', () => {
    renderWithUser();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  test('displays N/A when supplier name is missing', () => {
    renderWithUser(mockUser, { ...mockFlags, supplier_name: '' });
    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
  });
});

//test flags
describe('FullDashboard risk flags', () => {
  test('renders Non-Pay flag as No when false', () => {
    renderWithUser();
    expect(screen.getByText('Non-Pay: No')).toBeInTheDocument();
  });

  test('renders Chargeback flag as No when false', () => {
    renderWithUser();
    expect(screen.getByText('Chargeback: No')).toBeInTheDocument();
  });

  test('renders Variance Drop flag as No when false', () => {
    renderWithUser();
    expect(screen.getByText('Variance Drop: No')).toBeInTheDocument();
  });

  test('renders Non-Pay flag as Yes when true', () => {
    renderWithUser(mockUser, mockFlagsWithRisks);
    expect(screen.getByText('Non-Pay: Yes')).toBeInTheDocument();
  });

  test('renders Chargeback flag as Yes when true', () => {
    renderWithUser(mockUser, mockFlagsWithRisks);
    expect(screen.getByText('Chargeback: Yes')).toBeInTheDocument();
  });

  test('renders Variance Drop flag as Yes when true', () => {
    renderWithUser(mockUser, mockFlagsWithRisks);
    expect(screen.getByText('Variance Drop: Yes')).toBeInTheDocument();
  });
});

//test chatbot rendering
describe('FullDashboard AI support section', () => {
  test('renders Chat with Assistant text', () => {
    renderWithUser();
    expect(screen.getByText(/chat with assistant/i)).toBeInTheDocument();
  });

  test('renders the Open Chat button', () => {
    renderWithUser();
    expect(screen.getByRole('button', { name: /open chat/i })).toBeInTheDocument();
  });

  test('renders the assistant description text', () => {
    renderWithUser();
    expect(screen.getByText(/ask questions about supplier performance/i)).toBeInTheDocument();
  });

  test('Open Chat button navigates to /assistant', async () => {
    renderWithUser();
    await userEvent.click(screen.getByRole('button', { name: /open chat/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/assistant');
  });
});

//test redirect
describe('FullDashboard auth redirect', () => {
  test('redirects to /login when no user in localStorage', () => {
    render(
      <MemoryRouter>
        <FullDashboard />
      </MemoryRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('does not redirect when user is present', () => {
    renderWithUser();
    expect(mockNavigate).not.toHaveBeenCalledWith('/login');
  });
});

//test default flags
describe('FullDashboard default flags', () => {
  test('renders with default flag values when no flags in localStorage', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    render(
      <MemoryRouter>
        <FullDashboard />
      </MemoryRouter>
    );
    expect(screen.getByText('Non-Pay: No')).toBeInTheDocument();
    expect(screen.getByText('Chargeback: No')).toBeInTheDocument();
    expect(screen.getByText('Variance Drop: No')).toBeInTheDocument();
  });

  test('renders 0% fairness when flags are default', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    render(
      <MemoryRouter>
        <FullDashboard />
      </MemoryRouter>
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});