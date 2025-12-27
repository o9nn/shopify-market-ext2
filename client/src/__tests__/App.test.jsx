import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock Shopify Polaris and App Bridge
vi.mock('@shopify/polaris', () => ({
  AppProvider: ({ children }) => <div>{children}</div>
}));

vi.mock('@shopify/app-bridge-react', () => ({
  Provider: ({ children }) => <div>{children}</div>,
  useAppBridge: () => ({})
}));

// Mock pages
vi.mock('../pages/Dashboard', () => ({
  default: () => <div>Dashboard Page</div>
}));

vi.mock('../pages/Products', () => ({
  default: () => <div>Products Page</div>
}));

vi.mock('../pages/Orders', () => ({
  default: () => <div>Orders Page</div>
}));

vi.mock('../pages/Marketplaces', () => ({
  default: () => <div>Marketplaces Page</div>
}));

vi.mock('../pages/SalesChannels', () => ({
  default: () => <div>Sales Channels Page</div>
}));

vi.mock('../pages/ProductCatalogs', () => ({
  default: () => <div>Product Catalogs Page</div>
}));

vi.mock('../pages/Settings', () => ({
  default: () => <div>Settings Page</div>
}));

vi.mock('../components/Navigation', () => ({
  default: () => <nav>Navigation</nav>
}));

describe('App Component', () => {
  beforeEach(() => {
    // Set up location with shop parameter
    delete window.location;
    window.location = new URL('http://localhost:3000/?shop=test-shop.myshopify.com');
  });

  it('should render without crashing with shop param', () => {
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(container).toBeTruthy();
  });

  it('should show missing shop error when shop param is not provided', () => {
    window.location = new URL('http://localhost:3000/');
    
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Missing Shop Parameter')).toBeTruthy();
  });
});
