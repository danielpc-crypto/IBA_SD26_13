import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Start from '../Start';

jest.mock('../start.css', () => ({}));

beforeEach(() => {
  jest.clearAllMocks();
});

//navbar tests
describe('Start navbar', () => {
  test('renders the brand name', () => {
    render(<MemoryRouter><Start /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /intelligent business analyzer/i }))
        .toBeInTheDocument();
    });

  test('brand name links to home', () => {
    render(<MemoryRouter><Start /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /intelligent business analyzer/i }))
      .toHaveAttribute('href', '/');
  });

  test('renders navbar login link', () => {
    render(<MemoryRouter><Start /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /^login$/i })).toBeInTheDocument();
  });

  test('navbar login link points to /login', () => {
    render(<MemoryRouter><Start /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /^login$/i }))
      .toHaveAttribute('href', '/login');
  });

  test('navbar get started link points to /signup', () => {
    render(<MemoryRouter><Start /></MemoryRouter>);
    const links = screen.getAllByRole('link', { name: /get started/i });
    expect(links[0]).toHaveAttribute('href', '/signup');
  });
});

//test features section
describe('Start features section', () => {
  test('renders the why choose IBA heading', () => {
    render(<MemoryRouter><Start /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /why choose iba/i })).toBeInTheDocument();
  });

  test('renders the features section subtitle', () => {
    render(<MemoryRouter><Start /></MemoryRouter>);
    expect(screen.getByText(/actionable intelligence/i)).toBeInTheDocument();
  });

  test('renders the anomaly detection feature card', () => {
    render(<MemoryRouter><Start /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /anomaly detection/i })).toBeInTheDocument();
  });

  test('renders the business rules engine feature card', () => {
    render(<MemoryRouter><Start /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /business rules engine/i })).toBeInTheDocument();
  });

  test('renders the instant insights feature card', () => {
    render(<MemoryRouter><Start /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /instant insights/i })).toBeInTheDocument();
  });

  test('renders anomaly detection description', () => {
    render(<MemoryRouter><Start /></MemoryRouter>);
    expect(screen.getByText(/irregularities and patterns/i)).toBeInTheDocument();
  });

  test('renders business rules engine description', () => {
    render(<MemoryRouter><Start /></MemoryRouter>);
    expect(screen.getByText(/cross-reference data/i)).toBeInTheDocument();
  });

  test('renders instant insights description', () => {
    render(<MemoryRouter><Start /></MemoryRouter>);
    expect(screen.getByText(/detailed analysis report in seconds/i)).toBeInTheDocument();
  });
});

//test CTA section
describe('Start CTA section', () => {
  test('renders the CTA heading', () => {
    render(<MemoryRouter><Start /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /ready to analyze your data/i })).toBeInTheDocument();
  });

  test('renders the CTA subtext', () => {
    render(<MemoryRouter><Start /></MemoryRouter>);
    expect(screen.getByText(/create a free account/i)).toBeInTheDocument();
  });

  test('renders the sign up now button', () => {
    render(<MemoryRouter><Start /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /sign up now/i })).toBeInTheDocument();
  });

  test('sign up now links to /signup', () => {
    render(<MemoryRouter><Start /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /sign up now/i }))
      .toHaveAttribute('href', '/signup');
  });
});

//test footer
describe('Start footer', () => {
  test('renders the footer copyright text', () => {
    render(<MemoryRouter><Start /></MemoryRouter>);
    expect(screen.getByText(/2026 intelligent business analyzer/i)).toBeInTheDocument();
  });

  test('renders footer inside a footer element', () => {
    render(<MemoryRouter><Start /></MemoryRouter>);
    expect(document.querySelector('footer')).toBeInTheDocument();
  });
});