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
  email: 'john@testmail.com',
  business_data_uploaded: false,
  s3_file_key: 'test-file-key',
};

const mockFlags = {
  supplier_name: '',
  contract_start: '',
  non_pay: false,
  chargeback: false,
  variance_com_drop: false,
};

const mockFileData = {
  body: 'mock file content',
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

// Mock the S3 document fetch — called on component mount
const mockDocumentFetch = () => {
  global.fetch.mockResolvedValueOnce({
    json: async () => mockFileData,
  });
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
  mockDocumentFetch();
  return render(
    <MemoryRouter>
      <GeminiAssistant />
    </MemoryRouter>
  );
};

//test rendering
describe('GeminiAssistant rendering', () => {
  test('renders the header component', async () => {
    renderWithUser();
    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
  });

  test('renders the message input field', async () => {
    renderWithUser();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Message...')).toBeInTheDocument();
    });
  });

  test('renders the send button', async () => {
    renderWithUser();
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  test('message input is empty on initial render', async () => {
    renderWithUser();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Message...')).toHaveValue('');
    });
  });

  test('loading indicator is not shown on initial render', async () => {
    renderWithUser();
    await waitFor(() => {
      expect(screen.queryByText(/assistant is typing/i)).not.toBeInTheDocument();
    });
  });

  test('no messages shown on initial render', async () => {
    renderWithUser();
    await waitFor(() => {
      expect(screen.queryByText('Hello from Gemini')).not.toBeInTheDocument();
    });
  });

  test('fetches user document on mount', async () => {
    renderWithUser();
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:5000/retrieve/bucket/${mockUser.username}/${mockUser.s3_file_key}`,
        expect.objectContaining({ method: 'GET' })
      );
    });
  });
});

//test redirect
describe('GeminiAssistant auth redirect', () => {
  test('does not redirect when user is present', async () => {
    renderWithUser();
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalledWith('/login');
    });
  });
});

//test input behavior
describe('GeminiAssistant input behaviour', () => {
  test('input updates as user types', async () => {
    renderWithUser();
    await waitFor(() => screen.getByPlaceholderText('Message...'));
    await userEvent.type(screen.getByPlaceholderText('Message...'), 'Hello Gemini');
    expect(screen.getByPlaceholderText('Message...')).toHaveValue('Hello Gemini');
  });

  test('input can be cleared', async () => {
    renderWithUser();
    await waitFor(() => screen.getByPlaceholderText('Message...'));
    const input = screen.getByPlaceholderText('Message...');
    await userEvent.type(input, 'Hello');
    await userEvent.clear(input);
    expect(input).toHaveValue('');
  });

  test('does not call chat endpoint when input is empty', async () => {
    renderWithUser();
    await waitFor(() => screen.getByRole('button'));
    const callsBefore = global.fetch.mock.calls.length;
    await userEvent.click(screen.getByRole('button'));
    expect(global.fetch.mock.calls.length).toBe(callsBefore);
  });

  test('does not call chat endpoint when input is only whitespace', async () => {
    renderWithUser();
    await waitFor(() => screen.getByPlaceholderText('Message...'));
    const callsBefore = global.fetch.mock.calls.length;
    await userEvent.type(screen.getByPlaceholderText('Message...'), '   ');
    await userEvent.click(screen.getByRole('button'));
    expect(global.fetch.mock.calls.length).toBe(callsBefore);
  });

  test('input is cleared after sending a message', async () => {
    renderWithUser();
    await waitFor(() => screen.getByPlaceholderText('Message...'));
    mockStreamResponse();
    const input = screen.getByPlaceholderText('Message...');
    await userEvent.type(input, 'Hello Gemini');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  test('pressing Enter sends the message', async () => {
    renderWithUser();
    await waitFor(() => screen.getByPlaceholderText('Message...'));
    mockStreamResponse();
    const callsBefore = global.fetch.mock.calls.length;
    await userEvent.type(screen.getByPlaceholderText('Message...'), 'Hello{enter}');
    await waitFor(() => {
      expect(global.fetch.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });
});

//test message display
describe('GeminiAssistant message display', () => {
  test('displays user message in chat after sending', async () => {
    renderWithUser();
    await waitFor(() => screen.getByPlaceholderText('Message...'));
    mockStreamResponse();
    await userEvent.type(screen.getByPlaceholderText('Message...'), 'Hello Gemini');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Hello Gemini')).toBeInTheDocument();
    });
  });

  test('displays model response after stream completes', async () => {
    renderWithUser();
    await waitFor(() => screen.getByPlaceholderText('Message...'));
    mockStreamResponse('Hello from Gemini');
    await userEvent.type(screen.getByPlaceholderText('Message...'), 'Hello');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Hello from Gemini')).toBeInTheDocument();
    });
  });

  test('calls chat endpoint with correct URL on send', async () => {
    renderWithUser();
    await waitFor(() => screen.getByPlaceholderText('Message...'));
    mockStreamResponse();
    await userEvent.type(screen.getByPlaceholderText('Message...'), 'Hello');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/chat-stream',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  test('calls chat endpoint with FormData body', async () => {
    renderWithUser();
    await waitFor(() => screen.getByPlaceholderText('Message...'));
    mockStreamResponse();
    await userEvent.type(screen.getByPlaceholderText('Message...'), 'Hello');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      const chatCall = fetch.mock.calls.find(
        ([url]) => url === 'http://localhost:5000/chat-stream'
      );
      expect(chatCall).toBeDefined();
      expect(chatCall[1].body).toBeInstanceOf(FormData);
    });
  });

  test('multiple messages accumulate in chat', async () => {
    renderWithUser();
    await waitFor(() => screen.getByPlaceholderText('Message...'));

    mockStreamResponse('First response');
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
    renderWithUser();
    await waitFor(() => screen.getByPlaceholderText('Message...'));
    global.fetch.mockReturnValueOnce(new Promise(() => {}));
    await userEvent.type(screen.getByPlaceholderText('Message...'), 'Hello');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText(/assistant is typing/i)).toBeInTheDocument();
    });
  });
});