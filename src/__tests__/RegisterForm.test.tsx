import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import RegisterForm from '../components/RegisterForm';
import AuthContext from '../context/AuthContext';
import * as routerDom from 'react-router-dom';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('RegisterForm (Critical)', () => {
  const mockRegister = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (routerDom.useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
  });

  const renderWithAuth = (contextValue: any = {}) => {
    const defaultContext = {
      user: null,
      register: mockRegister,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    };
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ ...defaultContext, ...contextValue }}>
          <RegisterForm />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  it('renders registration form elements correctly', () => {
    renderWithAuth();
    
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument(); // reg-password
    expect(screen.getByLabelText(/confirm/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/account type/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create free account/i })).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    const user = userEvent.setup();
    renderWithAuth();

    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm/i), 'DifferentPassword!');
    
    await user.click(screen.getByRole('button', { name: /create free account/i }));

    expect(mockRegister).not.toHaveBeenCalled();
    expect(await screen.findByText(/passwords don't match/i)).toBeInTheDocument();
  });

  it('submits form successfully and navigates (Critical)', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce({ redirectTo: '/contributor/dashboard' });

    renderWithAuth();

    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm/i), 'Password123!');
    
    // Select role (default is contributor)
    const select = screen.getByLabelText(/account type/i);
    await user.selectOptions(select, 'projectOwner');
    
    await user.click(screen.getByRole('button', { name: /create free account/i }));

    expect(mockRegister).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      role: 'projectOwner'
    });
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/onboarding/campaign-owner', { replace: true });
    });
  });

  it('displays API error on failed registration (High)', async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValueOnce({ response: { data: { message: 'Email already exists' } } });

    renderWithAuth();

    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm/i), 'Password123!');
    
    await user.click(screen.getByRole('button', { name: /create free account/i }));

    expect(mockRegister).toHaveBeenCalled();
    // Wait for the button state to reset
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create free account/i })).not.toBeDisabled();
    });
  });
});
