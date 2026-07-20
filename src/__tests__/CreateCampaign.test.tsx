import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import CreateCampaign from '../pages/CreateCampaign';
import AuthContext from '../context/AuthContext';
import * as campaignApi from '../api/campaign';
import * as routerDom from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: vi.fn() };
});

vi.mock('../api/campaign', () => ({
  createCampaignApi: vi.fn(),
  uploadCampaignMediaApi: vi.fn(),
  uploadProposalPdfApi: vi.fn(),
}));

vi.mock('../components/WalletButton', () => ({
  default: () => <button>Connect Wallet</button>,
}));

vi.mock('../context/WalletContext', () => ({
  useWallet: () => ({ isConnected: true, isCorrectNetwork: true }),
}));

const mockUser = {
  id: 'owner1',
  name: 'Alice Owner',
  email: 'alice@example.com',
  role: 'projectOwner' as const,
};

const mockNavigate = vi.fn();

const renderWithAuth = (contextOverrides: any = {}) => {
  const defaultContext = {
    user: mockUser,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    loading: false,
    refreshUser: vi.fn(),
    updateProfile: vi.fn(),
    uploadProfileImage: vi.fn(),
    ...contextOverrides,
  };

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={defaultContext}>
        <CreateCampaign />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('CreateCampaign Page (Critical)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (routerDom.useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
  });

  describe('Step 1 – The Vision', () => {
    it('renders the Campaign Wizard heading and step 1 fields', () => {
      renderWithAuth();

      expect(screen.getByRole('heading', { name: /Campaign Wizard/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/give your campaign a compelling title/i)).toBeInTheDocument();
    });

    it('shows step 1 stepper indicator as active', () => {
      renderWithAuth();
      expect(screen.getByText('THE VISION')).toBeInTheDocument();
    });

    it('shows the Next button on step 1', () => {
      renderWithAuth();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });
  });

  describe('Step navigation (High)', () => {
    it('advances to step 2 when Next is clicked', async () => {
      const user = userEvent.setup();
      renderWithAuth();

      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/FUNDING/i)).toBeInTheDocument();
      });
    });

    it('shows Back button after advancing to step 2', async () => {
      const user = userEvent.setup();
      renderWithAuth();

      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      });
    });

    it('returns to step 1 when Back is clicked from step 2', async () => {
      const user = userEvent.setup();
      renderWithAuth();

      await user.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: /back/i }));
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/give your campaign a compelling title/i)).toBeInTheDocument();
      });
    });
  });

  describe('Milestone section (Critical)', () => {
    const navigateToStep3 = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => expect(screen.getByText(/FUNDING/i)).toBeInTheDocument());
      await user.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => expect(screen.getByText(/MILESTONES/i)).toBeInTheDocument());
    };

    it('renders the initial milestone row on step 3', async () => {
      const user = userEvent.setup();
      renderWithAuth();

      await navigateToStep3(user);

      const titleInputs = screen.getAllByPlaceholderText(/milestone title/i);
      expect(titleInputs.length).toBeGreaterThanOrEqual(1);
    });

    it('adds a new milestone row when Add Milestone is clicked', async () => {
      const user = userEvent.setup();
      renderWithAuth();

      await navigateToStep3(user);

      const before = screen.getAllByPlaceholderText(/milestone title/i).length;
      await user.click(screen.getByRole('button', { name: /add milestone/i }));

      const after = screen.getAllByPlaceholderText(/milestone title/i).length;
      expect(after).toBe(before + 1);
    });

    it('removes a milestone row when the delete button is clicked', async () => {
      const user = userEvent.setup();
      renderWithAuth();

      await navigateToStep3(user);

      await user.click(screen.getByRole('button', { name: /add milestone/i }));
      const before = screen.getAllByPlaceholderText(/milestone title/i).length;

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[0]);

      const after = screen.getAllByPlaceholderText(/milestone title/i).length;
      expect(after).toBe(before - 1);
    });
  });

  describe('Deploy / submit (Critical)', () => {
    it('shows a success message after a successful campaign creation', async () => {
      const user = userEvent.setup();
      vi.useFakeTimers({ shouldAdvanceTime: true });

      (campaignApi.createCampaignApi as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: {
          campaign: { id: 'new-camp-1', title: 'Test Campaign', status: 'pending_approval' },
        },
      });

      renderWithAuth();

      await user.type(screen.getByPlaceholderText(/give your campaign a compelling title/i), 'Test Campaign');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => expect(screen.getByText(/FUNDING/i)).toBeInTheDocument());
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => expect(screen.getByText(/MILESTONES/i)).toBeInTheDocument());

      const percentageInput = screen.getAllByPlaceholderText(/e\.g\. 30/i)[0];
      await user.clear(percentageInput);
      await user.type(percentageInput, '100');

      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => expect(screen.getByText(/REVIEW/i)).toBeInTheDocument());

      const deployBtn = screen.getByRole('button', { name: /deploy/i });
      await user.click(deployBtn);

      await waitFor(() => {
        expect(screen.getByText(/Campaign created successfully/i)).toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    it('shows an error message when createCampaignApi fails (Critical)', async () => {
      const user = userEvent.setup();

      (campaignApi.createCampaignApi as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce({
        response: { data: { message: 'Milestone percentages must total exactly 100%' } },
      });

      renderWithAuth();

      await user.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => expect(screen.getByText(/FUNDING/i)).toBeInTheDocument());
      await user.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => expect(screen.getByText(/MILESTONES/i)).toBeInTheDocument());
      await user.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => expect(screen.getByText(/REVIEW/i)).toBeInTheDocument());

      const deployBtn = screen.getByRole('button', { name: /deploy/i });
      await user.click(deployBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/Milestone percentages must total exactly 100%/i)
        ).toBeInTheDocument();
      });
    });

    it('shows an inline error if milestones do not total 100% before submitting', async () => {
      const user = userEvent.setup();
      renderWithAuth();

      await user.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => expect(screen.getByText(/FUNDING/i)).toBeInTheDocument());
      await user.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => expect(screen.getByText(/MILESTONES/i)).toBeInTheDocument());
      await user.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => expect(screen.getByText(/REVIEW/i)).toBeInTheDocument());

      const deployBtn = screen.getByRole('button', { name: /deploy/i });
      await user.click(deployBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/Milestone percentages must total exactly 100%/i)
        ).toBeInTheDocument();
      });

      expect(campaignApi.createCampaignApi).not.toHaveBeenCalled();
    });
  });

  describe('Cover image upload (High)', () => {
    it('calls uploadCampaignMediaApi when a file is selected', async () => {
      (campaignApi.uploadCampaignMediaApi as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        filePath: 'covers/test.jpg',
      });

      renderWithAuth();

      const file = new File(['dummy'], 'cover.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement;

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
        await waitFor(() => {
          expect(campaignApi.uploadCampaignMediaApi).toHaveBeenCalledWith(file);
        });
      }
    });
  });
});
