import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navigation as PolarisNavigation, Frame } from '@shopify/polaris';
import {
  HomeIcon,
  ProductIcon,
  OrderIcon,
  StoreIcon,
  SettingsIcon,
  ChannelsIcon,
  CollectionIcon
} from '@shopify/polaris-icons';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isSelected = (path) => location.pathname === path;

  const navigationMarkup = (
    <PolarisNavigation location={location.pathname}>
      <PolarisNavigation.Section
        items={[
          {
            label: 'Dashboard',
            icon: HomeIcon,
            selected: isSelected('/'),
            onClick: () => navigate('/')
          },
          {
            label: 'Products',
            icon: ProductIcon,
            selected: isSelected('/products'),
            onClick: () => navigate('/products')
          },
          {
            label: 'Orders',
            icon: OrderIcon,
            selected: isSelected('/orders'),
            onClick: () => navigate('/orders')
          },
          {
            label: 'Marketplaces',
            icon: StoreIcon,
            selected: isSelected('/marketplaces'),
            onClick: () => navigate('/marketplaces')
          }
        ]}
      />
      <PolarisNavigation.Section
        title="Configuration"
        items={[
          {
            label: 'Sales Channels',
            icon: ChannelsIcon,
            selected: isSelected('/sales-channels'),
            onClick: () => navigate('/sales-channels')
          },
          {
            label: 'Product Catalogs',
            icon: CollectionIcon,
            selected: isSelected('/product-catalogs'),
            onClick: () => navigate('/product-catalogs')
          },
          {
            label: 'Settings',
            icon: SettingsIcon,
            selected: isSelected('/settings'),
            onClick: () => navigate('/settings')
          }
        ]}
      />
    </PolarisNavigation>
  );

  return (
    <div style={{ width: '240px', borderRight: '1px solid #e1e3e5' }}>
      {navigationMarkup}
    </div>
  );
}

export default Navigation;
