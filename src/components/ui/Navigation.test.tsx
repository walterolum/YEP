import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TabPanel, Tabs } from './Navigation';

const items = [
  { id: 'overview', label: 'Project overview' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'deliverables', label: 'Deliverables' },
];

describe('Tabs', () => {
  it('renders multi-word labels as whole strings', () => {
    render(<Tabs items={items} active="overview" onChange={() => undefined} ariaLabel="Project views" />);

    for (const item of items) {
      const tab = screen.getByRole('tab', { name: item.label });
      // A string spread into characters would render "P r o j e c t ...".
      expect(tab.textContent).toBe(item.label);
    }
  });

  it('exposes the active tab and switches on click', async () => {
    const onChange = vi.fn();
    render(<Tabs items={items} active="overview" onChange={onChange} ariaLabel="Project views" />);

    expect(screen.getByRole('tab', { name: 'Project overview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Milestones' })).toHaveAttribute('aria-selected', 'false');

    await userEvent.click(screen.getByRole('tab', { name: 'Milestones' }));
    expect(onChange).toHaveBeenCalledWith('milestones');
  });

  it('renders only the selected panel', () => {
    const { rerender } = render(
      <TabPanel id="overview" active="overview">
        <p>Overview panel</p>
      </TabPanel>,
    );
    expect(screen.getByText('Overview panel')).toBeInTheDocument();

    rerender(
      <TabPanel id="overview" active="milestones">
        <p>Overview panel</p>
      </TabPanel>,
    );
    expect(screen.queryByText('Overview panel')).not.toBeInTheDocument();
  });
});
