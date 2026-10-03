import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { clearTuneTownStorage } from '../../services/storageAdapter';
import {
  clearServiceCalls,
  getServiceSettings,
  getServiceSnapshot,
  updateServiceSettings,
} from '../../services/serviceConfig';
import DeveloperPanel from './DeveloperPanel';

beforeEach(() => {
  clearTuneTownStorage();
  clearServiceCalls();
  updateServiceSettings({ minDelay: 0, maxDelay: 0, failureRate: 0 });
});

describe('developer controls', () => {
  it('applies runtime settings to the next service call and logs its result', async () => {
    const user = userEvent.setup();
    render(<DeveloperPanel />);

    await user.click(screen.getByText('Developer controls'));
    const failureInput = screen.getByLabelText(/failure rate percentage/i);
    await user.clear(failureInput);
    await user.type(failureInput, '0');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(getServiceSettings()).toMatchObject({ minDelay: 0, maxDelay: 0, failureRate: 0 });

    await user.click(screen.getByRole('button', { name: /run test call/i }));

    expect(await screen.findByText(/catalogue contains 60 products/i)).toBeInTheDocument();
    expect(getServiceSnapshot().calls[0]).toMatchObject({ name: 'getProducts', status: 'success' });
  });
});
