import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DictationButton } from './DictationButton';

vi.mock('../hooks/useVoiceDictation', () => ({
  useVoiceDictation: vi.fn(() => ({
    state: 'idle',
    error: null,
    start: vi.fn(),
    stop: vi.fn(),
  })),
}));

import { useVoiceDictation } from '../hooks/useVoiceDictation';
const mockUseVoiceDictation = vi.mocked(useVoiceDictation);

describe('DictationButton', () => {
  it('renders "Dictado IA" button in idle state', () => {
    render(<DictationButton onResult={vi.fn()} />);
    expect(screen.getByRole('button', { name: /dictado ia/i })).toBeInTheDocument();
  });

  it('shows recording text in recording state', () => {
    mockUseVoiceDictation.mockReturnValue({
      state: 'recording', error: null, start: vi.fn(), stop: vi.fn(),
    });
    render(<DictationButton onResult={vi.fn()} />);
    expect(screen.getByText(/grabando/i)).toBeInTheDocument();
  });

  it('disables button in processing state', () => {
    mockUseVoiceDictation.mockReturnValue({
      state: 'processing', error: null, start: vi.fn(), stop: vi.fn(),
    });
    render(<DictationButton onResult={vi.fn()} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows error message when state is error', () => {
    mockUseVoiceDictation.mockReturnValue({
      state: 'error', error: 'Permiso de micrófono denegado.', start: vi.fn(), stop: vi.fn(),
    });
    render(<DictationButton onResult={vi.fn()} />);
    expect(screen.getByText(/permiso de micrófono/i)).toBeInTheDocument();
  });

  it('calls start() when idle button is clicked', async () => {
    const start = vi.fn();
    mockUseVoiceDictation.mockReturnValue({
      state: 'idle', error: null, start, stop: vi.fn(),
    });
    render(<DictationButton onResult={vi.fn()} />);
    await userEvent.click(screen.getByRole('button'));
    expect(start).toHaveBeenCalled();
  });

  it('calls stop() when recording button is clicked', async () => {
    const stop = vi.fn();
    mockUseVoiceDictation.mockReturnValue({
      state: 'recording', error: null, start: vi.fn(), stop,
    });
    render(<DictationButton onResult={vi.fn()} />);
    await userEvent.click(screen.getByRole('button'));
    expect(stop).toHaveBeenCalled();
  });
});
