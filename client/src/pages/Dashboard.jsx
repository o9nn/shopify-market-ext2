import React, { useState, useEffect, useCallback } from 'react';
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  SkeletonBodyText,
  Banner
} from '@shopify/polaris';
import { useApi } from '../hooks/useApi';

function Dashboard() {
  const { fetchWithAuth, loading, error } = useApi();
  const [dashboardData, setDashboardData] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/marketplace/dashboard');
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const getStatusBadge = (status) => {
    const statusMap = {
      active: 'success',
      inactive: 'critical',
      pending: 'warning',
      error: 'critical'
    };
    return <Badge tone={statusMap[status] || 'info'}>{status}</Badge>;
  };

  if (loading && !dashboardData) {
    return (
      <Page title="Dashboard">
        <Layout>
          <Layout.Section>
            <Card>
              <SkeletonBodyText lines={5} />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page title="Marketplace Dashboard">
      {error && (
        <Banner tone="critical" title="Error loading dashboard">
          {error}
        </Banner>
      )}
      
      <Layout>
        {/* Marketplace Connections Overview */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Connected Marketplaces</Text>
              
              {dashboardData?.connections?.length > 0 ? (
                <BlockStack gap="300">
                  {dashboardData.connections.map((conn) => (
                    <InlineStack key={conn.id} align="space-between">
                      <InlineStack gap="200">
                        <Text variant="bodyMd" fontWeight="semibold">
                          {conn.marketplace.charAt(0).toUpperCase() + conn.marketplace.slice(1)}
                        </Text>
                        {getStatusBadge(conn.status)}
                      </InlineStack>
                      <Text variant="bodySm" tone="subdued">
                        Last sync: {conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleString() : 'Never'}
                      </Text>
                    </InlineStack>
                  ))}
                </BlockStack>
              ) : (
                <Text tone="subdued">No marketplaces connected yet.</Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Order Statistics */}
        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Orders by Source</Text>
              
              {dashboardData?.orderStats?.length > 0 ? (
                <BlockStack gap="200">
                  {dashboardData.orderStats.map((stat, idx) => (
                    <InlineStack key={idx} align="space-between">
                      <Text variant="bodyMd">
                        {stat.source.charAt(0).toUpperCase() + stat.source.slice(1)}
                      </Text>
                      <InlineStack gap="400">
                        <Text variant="bodyMd">{stat.orderCount} orders</Text>
                        <Text variant="bodyMd" fontWeight="semibold">
                          ${parseFloat(stat.totalRevenue || 0).toFixed(2)}
                        </Text>
                      </InlineStack>
                    </InlineStack>
                  ))}
                </BlockStack>
              ) : (
                <Text tone="subdued">No orders yet.</Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Listing Statistics */}
        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Product Listings</Text>
              
              {dashboardData?.listingStats?.length > 0 ? (
                <BlockStack gap="200">
                  {dashboardData.listingStats.map((stat, idx) => (
                    <InlineStack key={idx} align="space-between">
                      <Text variant="bodyMd">{stat.status}</Text>
                      <Text variant="bodyMd">{stat.count} products</Text>
                    </InlineStack>
                  ))}
                </BlockStack>
              ) : (
                <Text tone="subdued">No listings yet.</Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Quick Actions */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Quick Actions</Text>
              <InlineStack gap="300">
                <a href="/marketplaces" style={{ textDecoration: 'none' }}>
                  <Badge>Connect Marketplace</Badge>
                </a>
                <a href="/products" style={{ textDecoration: 'none' }}>
                  <Badge>Manage Products</Badge>
                </a>
                <a href="/orders" style={{ textDecoration: 'none' }}>
                  <Badge>View Orders</Badge>
                </a>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default Dashboard;
