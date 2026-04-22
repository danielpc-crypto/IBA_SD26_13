import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import GeminiAssistant from '../GeminiAssistant';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../Header', () => ({ open, setOpen }) => (
  <div data-testid="header" />
));
jest.mock('react-markdown', () => ({ children, components }) => (
  <span>{children}</span>
));

const mockUser = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  username: 'johndoe',
  email: 'johndoe@testmail.com',
  business_data_uploaded: false,
};

const mockFlags = {
  supplier_name: '',
  contract_start: '',
  non_pay: false,
  chargeback: false,
  variance_com_drop: false,
};

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

//test rednering
describe('GeminiAssistant rendering', () => {
  test('renders the header component', () => {
    renderWithUser();
    expect(screen.getByTestId('header')).toBeInTheDocument();
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

  test('loading indicator is not shown on initial render', () => {
    renderWithUser();
    expect(screen.queryByText(/assistant is typing/i)).not.toBeInTheDocument();
  });

  test('no messages are shown on initial render', () => {
    renderWithUser();
    expect(screen.queryByText('Hello from Gemini')).not.toBeInTheDocument();
  });
});

//test redirect user
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

//test inputs
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

  test('does not call fetch when input is empty', async () => {
    renderWithUser();
    await userEvent.click(screen.getByRole('button'));
    expect(fetch).not.toHaveBeenCalled();
  });

  test('does not call fetch when input is only whitespace', async () => {
    renderWithUser();
    await userEvent.type(screen.getByPlaceholderText('Message...'), '   ');
    await userEvent.click(screen.getByRole('button'));
    expect(fetch).not.toHaveBeenCalled();
  });

  test('input is cleared after sending a message', async () => {
    mockStreamResponse();
    renderWithUser();
    const input = screen.getByPlaceholderText('Message...');
    await userEvent.type(input, 'Hello');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  test('pressing Enter sends the message', async () => {
    mockStreamResponse();
    renderWithUser();
    await userEvent.type(screen.getByPlaceholderText('Message...'), 'Hello{enter}');
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });
});

//test message display
describe('GeminiAssistant message display', () => {
  test('displays user message in the chat after sending', async () => {
    mockStreamResponse();
    renderWithUser();
    await userEvent.type(screen.getByPlaceholderText('Message...'), 'Hello');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  test('displays model response after stream completes', async () => {
    mockStreamResponse('Hello from Gemini');
    renderWithUser();
    await userEvent.type(screen.getByPlaceholderText('Message...'), 'Hello');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Hello from Gemini')).toBeInTheDocument();
    });
  });

  test('calls fetch with correct endpoint on send', async () => {
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

  test('calls fetch with FormData body', async () => {
    mockStreamResponse();
    renderWithUser();
    await userEvent.type(screen.getByPlaceholderText('Message...'), 'Hello');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      const [, options] = fetch.mock.calls[0];
      expect(options.body).toBeInstanceOf(FormData);
    });
  });

  test('multiple messages accumulate in the chat', async () => {
    mockStreamResponse('First response');
    renderWithUser();
    await userEvent.type(screen.getByPlaceholderText('Message...'), 'First message');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('First message')).toBeInTheDocument();
    });

    mockStreamResponse('Second response');
    await userEvent.type(screen.getByPlaceholderText('Message...'), 'Second message');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('First message')).toBeInTheDocument();
      expect(screen.getByText('Second message')).toBeInTheDocument();
    });
  });

  test('loading indicator appears while waiting for response', async () => {
    global.fetch.mockReturnValueOnce(new Promise(() => {}));
    renderWithUser();
    await userEvent.type(screen.getByPlaceholderText('Message...'), 'Hello');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText(/assistant is typing/i)).toBeInTheDocument();
    });
  });
});