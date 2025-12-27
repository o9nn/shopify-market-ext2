import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navigation from '../components/Navigation';

// Mock Shopify Polaris components
vi.mock('@shopify/polaris', () => ({
  Navigation: ({ children }) => <nav>{children}</nav>,
  Frame: ({ children }) => <div>{children}</div>
}));

describe('Navigation Component', () => {
  const renderNavigation = () => {
    return render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );
  };

  it('should render without crashing', () => {
    const { container } = renderNavigation();
    expect(container).toBeTruthy();
  });

  it('should render navigation wrapper', () => {
    const { container } = renderNavigation();
    const nav = container.querySelector('nav');
    expect(nav).toBeTruthy();
  });
});
