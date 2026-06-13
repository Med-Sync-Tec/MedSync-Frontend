import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DictationButton } from './DictationButton';

jest.mock('../hooks/useVoiceDictation', () => ({
  useVoiceDictation: jest.fn(() => ({
    state: 'idle',
    error: null,
    start: jest.fn(),
    stop: jest.fn(),
  })),
}));

import { useVoiceDictation } from '../hooks/useVoiceDictation';
const mockUseVoiceDictation = jest.mocked(useVoiceDictation);

describe('DictationButton', () => {
  it('renders "Dictado IA" button in idle state', () => {
    render(<DictationButton onResult={jest.fn()} />);
    expect(screen.getByRole('button', { name: /dictado ia/i })).toBeInTheDocument();
  });

  it('shows recording text in recording state', () => {
    mockUseVoiceDictation.mockReturnValue({
      state: 'recording', error: null, start: jest.fn(), stop: jest.fn(),
    });
    render(<DictationButton onResult={jest.fn()} />);
    expect(screen.getByText(/grabando/i)).toBeInTheDocument();
  });

  it('disables button in processing state', () => {
    mockUseVoiceDictation.mockReturnValue({
      state: 'processing', error: null, start: jest.fn(), stop: jest.fn(),
    });
    render(<DictationButton onResult={jest.fn()} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows error message when state is error', () => {
    mockUseVoiceDictation.mockReturnValue({
      state: 'error', error: 'Permiso de micrófono denegado.', start: jest.fn(), stop: jest.fn(),
    });
    render(<DictationButton onResult={jest.fn()} />);
    expect(screen.getByText(/permiso de micrófono/i)).toBeInTheDocument();
  });

  it('calls start() when idle button is clicked', async () => {
    const start = jest.fn();
    mockUseVoiceDictation.mockReturnValue({
      state: 'idle', error: null, start, stop: jest.fn(),
    });
    render(<DictationButton onResult={jest.fn()} />);
    await userEvent.click(screen.getByRole('button'));
    expect(start).toHaveBeenCalled();
  });

  it('calls stop() when recording button is clicked', async () => {
    const stop = jest.fn();
    mockUseVoiceDictation.mockReturnValue({
      state: 'recording', error: null, start: jest.fn(), stop,
    });
    render(<DictationButton onResult={jest.fn()} />);
    await userEvent.click(screen.getByRole('button'));
    expect(stop).toHaveBeenCalled();
  });
});
