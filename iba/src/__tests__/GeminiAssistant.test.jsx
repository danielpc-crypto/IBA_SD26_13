import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import GeminiAssistant from '../GeminiAssistant';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../Header', () => () => <div data-testid="header" />);
jest.mock('react-markdown', () => ({ children }) => <span>{children}</span>);

const mockUser = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  username: 'johndoe',
  email: 'johndoe@fakemail.com',
  business_data_uploaded: false,
};

const mockFlags = {
  supplier_name: '',
  contract_start: '',
  non_pay: false,
  chargeback: false,
  variance_com_drop: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  global.fetch = jest.fn();
});

const renderWithUser = (user = mockUser) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('flags', JSON.stringify(mockFlags));
  }
  return render(
    <MemoryRouter>
      <GeminiAssistant />
    </MemoryRouter>
  );
};

//test page rendering
describe('GeminiAssistant rendering', () => {
  test('renders the header component', () => {
    renderWithUser();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  test('renders the Gemini Chat heading', () => {
    renderWithUser();
    expect(screen.getByText('Gemini Chat')).toBeInTheDocument();
  });

  test('renders the message input field', () => {
    renderWithUser();
    expect(screen.getByPlaceholderText('Message...')).toBeInTheDocument();
  });

  test('renders the send button', () => {
    renderWithUser();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('message input is empty on initial render', () => {
    renderWithUser();
    expect(screen.getByPlaceholderText('Message...')).toHaveValue('');
  });

  test('chat container is empty on initial render', () => {
    renderWithUser();
    expect(screen.queryByText(/gemini is typing/i)).not.toBeInTheDocument();
  });

  test('loading indicator is not shown on initial render', () => {
    renderWithUser();
    expect(screen.queryByText(/gemini is typing/i)).not.toBeInTheDocument();
  });
});

//test login redirect
describe('GeminiAssistant auth redirect', () => {
  test('redirects to /login when no user in localStorage', () => {
    render(<MemoryRouter><GeminiAssistant /></MemoryRouter>);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('does not redirect when user is present', () => {
    renderWithUser();
    expect(mockNavigate).not.toHaveBeenCalledWith('/login');
  });
});

//test input behavior
describe('GeminiAssistant input behaviour', () => {
  test('input updates as user types', async () => {
    renderWithUser();
    const input = screen.getByPlaceholderText('Message...');
    await userEvent.type(input, 'Hello');
    expect(input).toHaveValue('Hello');
  });

  test('input can be cleared', async () => {
    renderWithUser();
    const input = screen.getByPlaceholderText('Message...');
    await userEvent.type(input, 'Hello');
    await userEvent.clear(input);
    expect(input).toHaveValue('');
  });

  test('does not send message when input is empty', async () => {
    renderWithUser();
    await userEvent.click(screen.getByRole('button'));
    expect(fetch).not.toHaveBeenCalled();
  });

  test('does not send message when input is only whitespace', async () => {
    renderWithUser();
    await userEvent.type(screen.getByPlaceholderText('Message...'), '   ');
    await userEvent.click(screen.getByRole('button'));
    expect(fetch).not.toHaveBeenCalled();
  });
});

//test message display
describe('GeminiAssistant message display', () => {
  const mockStreamResponse = (text = 'Hello from Gemini') => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(text));
        controller.close();
      },
    });
    global.fetch.mockResolvedValueOnce({ body: stream });
  };

  test('displays user message after sending', async () => {
    mockStreamResponse();
    renderWithUser();
    await userEvent.type(screen.getByPlaceholderText('Message...'), 'Hello');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  test('clears input field after sending a message', async () => {
    mockStreamResponse();
    renderWithUser();
    const input = screen.getByPlaceholderText('Message...');
    await userEvent.type(input, 'Hello');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  test('displays model response after receiving stream', async () => {
    mockStreamResponse('Hello from Gemini');
    renderWithUser();
    await userEvent.type(screen.getByPlaceholderText('Message...'), 'Hello');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Hello from Gemini')).toBeInTheDocument();
    });
  });

  test('sends message when Enter key is pressed', async () => {
    mockStreamResponse();
    renderWithUser();
    const input = screen.getByPlaceholderText('Message...');
    await userEvent.type(input, 'Hello{enter}');
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  test('calls fetch with correct endpoint when message is sent', async () => {
    mockStreamResponse();
    renderWithUser();
    await userEvent.type(screen.getByPlaceholderText('Message...'), 'Hello');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/chat-stream',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});