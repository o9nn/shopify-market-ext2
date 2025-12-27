import React, { useMemo } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import { Provider as AppBridgeProvider, useAppBridge } from '@shopify/app-bridge-react';
import enTranslations from '@shopify/polaris/locales/en.json';

import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Marketplaces from './pages/Marketplaces';
import Settings from './pages/Settings';
import SalesChannels from './pages/SalesChannels';
import ProductCatalogs from './pages/ProductCatalogs';
import Navigation from './components/Navigation';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get shop and host from URL params
  const searchParams = new URLSearchParams(location.search);
  const shop = searchParams.get('shop');
  const host = searchParams.get('host');
  
  // App Bridge config
  const appBridgeConfig = useMemo(() => ({
    apiKey: import.meta.env.VITE_SHOPIFY_API_KEY || '',
    host: host || '',
    forceRedirect: true
  }), [host]);

  // Custom link component for Polaris
  const CustomLinkComponent = ({ children, url, ...rest }) => {
    return (
      <a
        href={url}
        onClick={(e) => {
          e.preventDefault();
          navigate(url);
        }}
        {...rest}
      >
        {children}
      </a>
    );
  };

  // If no shop parameter, show error
  if (!shop) {
    return (
      <AppProvider i18n={enTranslations}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Missing Shop Parameter</h1>
          <p>Please install this app from the Shopify App Store.</p>
        </div>
      </AppProvider>
    );
  }

  return (
    <AppProvider i18n={enTranslations} linkComponent={CustomLinkComponent}>
      <AppBridgeProvider config={appBridgeConfig}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Navigation />
          <main style={{ flex: 1, padding: '20px' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/marketplaces" element={<Marketplaces />} />
              <Route path="/sales-channels" element={<SalesChannels />} />
              <Route path="/product-catalogs" element={<ProductCatalogs />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </AppBridgeProvider>
    </AppProvider>
  );
}

export default App;
