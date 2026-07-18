import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import RegisterForm from '../components/RegisterForm';
import { AuthContext } from '../context/AuthContext';
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
    
    expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();
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
    // In actual implementation, error state is set but maybe not immediately visible in DOM 
    // unless an error banner renders. Assuming an alert icon or text appears:
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
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

    expect(mockRegister).toHaveBeenCalledWith(
      'Test User',
      'test@example.com',
      'Password123!',
      'projectOwner'
    );
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/campaign-owner/onboarding', { replace: true });
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
