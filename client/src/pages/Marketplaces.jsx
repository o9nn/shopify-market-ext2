import React, { useState, useEffect, useCallback } from 'react';
import {
  Page,
  Layout,
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
  Button,
  InlineStack,
  BlockStack,
  Modal,
  Select,
  TextField,
  FormLayout,
  Banner,
  EmptyState,
  Icon
} from '@shopify/polaris';
import { StoreIcon, RefreshIcon, DeleteIcon } from '@shopify/polaris-icons';
import { useApi } from '../hooks/useApi';

function Marketplaces() {
  const { fetchWithAuth, loading } = useApi();
  const [connections, setConnections] = useState([]);
  const [supportedMarketplaces, setSupportedMarketplaces] = useState([]);
  const [modalActive, setModalActive] = useState(false);
  const [selectedMarketplace, setSelectedMarketplace] = useState('');
  const [credentials, setCredentials] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [connectionsRes, supportedRes] = await Promise.all([
        fetchWithAuth('/api/marketplace/connections'),
        fetchWithAuth('/api/marketplace/supported')
      ]);
      
      setConnections(connectionsRes || []);
      setSupportedMarketplaces(supportedRes || []);
    } catch (err) {
      setError('Failed to load marketplace data');
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateConnection = async () => {
    if (!selectedMarketplace) return;
    
    try {
      await fetchWithAuth('/api/marketplace/connections', {
        method: 'POST',
        body: JSON.stringify({
          marketplace: selectedMarketplace,
          credentials
        })
      });
      
      setSuccess('Marketplace connection created');
      setModalActive(false);
      setSelectedMarketplace('');
      setCredentials({});
      loadData();
    } catch (err) {
      setError('Failed to create connection');
    }
  };

  const handleTestConnection = async (connectionId) => {
    try {
      const result = await fetchWithAuth(`/api/marketplace/connections/${connectionId}/test`, {
        method: 'POST'
      });
      
      if (result.success) {
        setSuccess('Connection test successful');
      } else {
        setError('Connection test failed');
      }
      loadData();
    } catch (err) {
      setError('Connection test failed');
    }
  };

  const handleSyncConnection = async (connectionId) => {
    try {
      await fetchWithAuth(`/api/marketplace/connections/${connectionId}/sync`, {
        method: 'POST',
        body: JSON.stringify({ syncType: 'all' })
      });
      
      setSuccess('Sync initiated');
      loadData();
    } catch (err) {
      setError('Failed to initiate sync');
    }
  };

  const handleDeleteConnection = async (connectionId) => {
    if (!confirm('Are you sure you want to delete this connection?')) return;
    
    try {
      await fetchWithAuth(`/api/marketplace/connections/${connectionId}`, {
        method: 'DELETE'
      });
      
      setSuccess('Connection deleted');
      loadData();
    } catch (err) {
      setError('Failed to delete connection');
    }
  };

  const getStatusBadge = (status) => {
    const toneMap = {
      active: 'success',
      inactive: 'critical',
      pending: 'warning',
      error: 'critical'
    };
    return <Badge tone={toneMap[status] || 'info'}>{status}</Badge>;
  };

  const getMarketplaceIcon = (marketplace) => {
    // In a real app, you'd have actual marketplace icons
    return <Icon source={StoreIcon} />;
  };

  const selectedMarketplaceData = supportedMarketplaces.find(m => m.id === selectedMarketplace);

  const marketplaceOptions = supportedMarketplaces
    .filter(m => !connections.some(c => c.marketplace === m.id))
    .map(m => ({ label: m.name, value: m.id }));

  return (
    <Page
      title="Marketplaces"
      primaryAction={{
        content: 'Connect Marketplace',
        onAction: () => setModalActive(true),
        disabled: marketplaceOptions.length === 0
      }}
    >
      {error && (
        <Banner tone="critical" onDismiss={() => setError(null)}>
          {error}
        </Banner>
      )}
      
      {success && (
        <Banner tone="success" onDismiss={() => setSuccess(null)}>
          {success}
        </Banner>
      )}

      <Layout>
        <Layout.Section>
          {connections.length > 0 ? (
            <Card padding="0">
              <ResourceList
                resourceName={{ singular: 'connection', plural: 'connections' }}
                items={connections}
                loading={loading}
                renderItem={(connection) => {
                  const { id, marketplace, status, lastSyncAt, stats } = connection;
                  const marketplaceInfo = supportedMarketplaces.find(m => m.id === marketplace);
                  
                  return (
                    <ResourceItem
                      id={id}
                      media={getMarketplaceIcon(marketplace)}
                      accessibilityLabel={`View details for ${marketplace}`}
                    >
                      <BlockStack gap="200">
                        <InlineStack align="space-between">
                          <InlineStack gap="200">
                            <Text variant="bodyMd" fontWeight="bold">
                              {marketplaceInfo?.name || marketplace}
                            </Text>
                            {getStatusBadge(status)}
                          </InlineStack>
                          
                          <InlineStack gap="200">
                            <Button
                              size="slim"
                              icon={RefreshIcon}
                              onClick={() => handleSyncConnection(id)}
                              disabled={status !== 'active'}
                            >
                              Sync
                            </Button>
                            <Button
                              size="slim"
                              onClick={() => handleTestConnection(id)}
                            >
                              Test
                            </Button>
                            <Button
                              size="slim"
                              tone="critical"
                              icon={DeleteIcon}
                              onClick={() => handleDeleteConnection(id)}
                            />
                          </InlineStack>
                        </InlineStack>
                        
                        <InlineStack gap="400">
                          <Text variant="bodySm" tone="subdued">
                            Last sync: {lastSyncAt ? new Date(lastSyncAt).toLocaleString() : 'Never'}
                          </Text>
                          {stats && (
                            <>
                              <Text variant="bodySm" tone="subdued">
                                {stats.listingCount} listings
                              </Text>
                              <Text variant="bodySm" tone="subdued">
                                {stats.orderCount} orders
                              </Text>
                            </>
                          )}
                        </InlineStack>
                      </BlockStack>
                    </ResourceItem>
                  );
                }}
              />
            </Card>
          ) : (
            <Card>
              <EmptyState
                heading="Connect your first marketplace"
                action={{
                  content: 'Connect Marketplace',
                  onAction: () => setModalActive(true)
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Connect to Amazon, eBay, Walmart, and more to manage all your sales channels in one place.</p>
              </EmptyState>
            </Card>
          )}
        </Layout.Section>

        {/* Supported Marketplaces */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Supported Marketplaces</Text>
              <BlockStack gap="300">
                {supportedMarketplaces.map((marketplace) => {
                  const isConnected = connections.some(c => c.marketplace === marketplace.id);
                  
                  return (
                    <InlineStack key={marketplace.id} align="space-between">
                      <BlockStack gap="100">
                        <Text variant="bodyMd" fontWeight="semibold">{marketplace.name}</Text>
                        <Text variant="bodySm" tone="subdued">{marketplace.description}</Text>
                      </BlockStack>
                      {isConnected ? (
                        <Badge tone="success">Connected</Badge>
                      ) : (
                        <Badge>Available</Badge>
                      )}
                    </InlineStack>
                  );
                })}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      {/* Connect Marketplace Modal */}
      <Modal
        open={modalActive}
        onClose={() => {
          setModalActive(false);
          setSelectedMarketplace('');
          setCredentials({});
        }}
        title="Connect Marketplace"
        primaryAction={{
          content: 'Connect',
          onAction: handleCreateConnection,
          disabled: !selectedMarketplace
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => {
              setModalActive(false);
              setSelectedMarketplace('');
              setCredentials({});
            }
          }
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <Select
              label="Marketplace"
              options={[{ label: 'Select a marketplace', value: '' }, ...marketplaceOptions]}
              value={selectedMarketplace}
              onChange={(value) => {
                setSelectedMarketplace(value);
                setCredentials({});
              }}
            />
            
            {selectedMarketplaceData && (
              <BlockStack gap="300">
                <Text variant="bodySm" tone="subdued">
                  {selectedMarketplaceData.description}
                </Text>
                
                {selectedMarketplaceData.requiredCredentials?.map((field) => (
                  <TextField
                    key={field}
                    label={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    value={credentials[field] || ''}
                    onChange={(value) => setCredentials(prev => ({ ...prev, [field]: value }))}
                    type={field.toLowerCase().includes('secret') || field.toLowerCase().includes('token') ? 'password' : 'text'}
                  />
                ))}
              </BlockStack>
            )}
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}

export default Marketplaces;
