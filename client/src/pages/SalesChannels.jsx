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
  TextField,
  FormLayout,
  Banner,
  EmptyState,
  Select,
  Tabs,
  DataTable,
  Icon
} from '@shopify/polaris';
import { 
  PlusCircleIcon, 
  EditIcon, 
  DeleteIcon,
  SettingsIcon 
} from '@shopify/polaris-icons';
import { useApi } from '../hooks/useApi';

function SalesChannels() {
  const { fetchWithAuth, loading } = useApi();
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [modalActive, setModalActive] = useState(false);
  const [detailsModalActive, setDetailsModalActive] = useState(false);
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    channelType: 'custom',
    priority: 0
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadChannels = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/sales-channels');
      setChannels(data || []);
    } catch (err) {
      setError('Failed to load sales channels');
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  const handleCreateOrUpdate = async () => {
    try {
      if (selectedChannel) {
        // Update existing channel
        await fetchWithAuth(`/api/sales-channels/${selectedChannel.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        setSuccess('Sales channel updated successfully');
      } else {
        // Create new channel
        await fetchWithAuth('/api/sales-channels', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        setSuccess('Sales channel created successfully');
      }
      
      setModalActive(false);
      resetForm();
      loadChannels();
    } catch (err) {
      setError('Failed to save sales channel');
    }
  };

  const handleDelete = async (channelId) => {
    try {
      await fetchWithAuth(`/api/sales-channels/${channelId}`, {
        method: 'DELETE'
      });
      setSuccess('Sales channel deleted');
      setDeleteModalActive(false);
      setChannelToDelete(null);
      loadChannels();
    } catch (err) {
      setError('Failed to delete sales channel');
    }
  };

  const openDeleteModal = (channel) => {
    setChannelToDelete(channel);
    setDeleteModalActive(true);
  };

  const handleViewDetails = async (channel) => {
    try {
      const details = await fetchWithAuth(`/api/sales-channels/${channel.id}`);
      setSelectedChannel(details);
      setDetailsModalActive(true);
    } catch (err) {
      setError('Failed to load channel details');
    }
  };

  const handleEdit = (channel) => {
    setSelectedChannel(channel);
    setFormData({
      name: channel.name,
      description: channel.description || '',
      channelType: channel.channelType,
      priority: channel.priority
    });
    setModalActive(true);
  };

  const resetForm = () => {
    setSelectedChannel(null);
    setFormData({
      name: '',
      description: '',
      channelType: 'custom',
      priority: 0
    });
  };

  const getChannelTypeBadge = (type) => {
    const toneMap = {
      marketplace: 'info',
      retail: 'success',
      wholesale: 'attention',
      b2b: 'warning',
      custom: 'info'
    };
    return <Badge tone={toneMap[type] || 'info'}>{type}</Badge>;
  };

  const channelTypeOptions = [
    { label: 'Custom', value: 'custom' },
    { label: 'Marketplace', value: 'marketplace' },
    { label: 'Retail', value: 'retail' },
    { label: 'Wholesale', value: 'wholesale' },
    { label: 'B2B', value: 'b2b' }
  ];

  const tabs = [
    { id: 'catalogs', content: 'Product Catalogs', accessibilityLabel: 'Catalogs' },
    { id: 'tenants', content: 'Tenants', accessibilityLabel: 'Tenants' },
    { id: 'settings', content: 'Settings', accessibilityLabel: 'Settings' }
  ];

  return (
    <Page
      title="Sales Channels"
      subtitle="Manage custom sales channels and their configurations"
      primaryAction={{
        content: 'Create Channel',
        icon: PlusCircleIcon,
        onAction: () => {
          resetForm();
          setModalActive(true);
        }
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
          {channels.length > 0 ? (
            <Card padding="0">
              <ResourceList
                resourceName={{ singular: 'channel', plural: 'channels' }}
                items={channels}
                loading={loading}
                renderItem={(channel) => {
                  const { id, name, description, channelType, isActive, priority } = channel;
                  
                  return (
                    <ResourceItem
                      id={id}
                      accessibilityLabel={`View details for ${name}`}
                      onClick={() => handleViewDetails(channel)}
                    >
                      <BlockStack gap="200">
                        <InlineStack align="space-between">
                          <InlineStack gap="300">
                            <Text variant="bodyMd" fontWeight="bold">
                              {name}
                            </Text>
                            {getChannelTypeBadge(channelType)}
                            {!isActive && <Badge tone="critical">Inactive</Badge>}
                            {priority > 0 && (
                              <Badge tone="info">Priority: {priority}</Badge>
                            )}
                          </InlineStack>
                          
                          <InlineStack gap="200">
                            <Button
                              size="slim"
                              icon={EditIcon}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(channel);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="slim"
                              tone="critical"
                              icon={DeleteIcon}
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(channel);
                              }}
                            />
                          </InlineStack>
                        </InlineStack>
                        
                        {description && (
                          <Text variant="bodySm" tone="subdued">
                            {description}
                          </Text>
                        )}
                      </BlockStack>
                    </ResourceItem>
                  );
                }}
              />
            </Card>
          ) : (
            <Card>
              <EmptyState
                heading="Create your first sales channel"
                action={{
                  content: 'Create Channel',
                  onAction: () => {
                    resetForm();
                    setModalActive(true);
                  }
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>
                  Set up custom sales channels to manage different marketplaces, 
                  retail locations, or B2B customer segments with specific product 
                  catalogs and pricing strategies.
                </p>
              </EmptyState>
            </Card>
          )}
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">About Sales Channels</Text>
              <BlockStack gap="300">
                <Text variant="bodySm">
                  Sales channels allow you to organize your marketplace connections 
                  with custom configurations similar to how B2B companies manage 
                  locations and customer segments.
                </Text>
                <Text variant="bodySm" fontWeight="semibold">Key Features:</Text>
                <BlockStack gap="200">
                  <Text variant="bodySm">• Link multiple product catalogs to each channel</Text>
                  <Text variant="bodySm">• Assign tenants with role-based permissions</Text>
                  <Text variant="bodySm">• Configure channel-specific pricing rules</Text>
                  <Text variant="bodySm">• Set priority for sync operations</Text>
                </BlockStack>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      {/* Create/Edit Modal */}
      <Modal
        open={modalActive}
        onClose={() => {
          setModalActive(false);
          resetForm();
        }}
        title={selectedChannel ? 'Edit Sales Channel' : 'Create Sales Channel'}
        primaryAction={{
          content: selectedChannel ? 'Update' : 'Create',
          onAction: handleCreateOrUpdate,
          disabled: !formData.name
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => {
              setModalActive(false);
              resetForm();
            }
          }
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Channel Name"
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              autoComplete="off"
              helpText="A descriptive name for this sales channel"
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              multiline={3}
              autoComplete="off"
            />
            
            <Select
              label="Channel Type"
              options={channelTypeOptions}
              value={formData.channelType}
              onChange={(value) => setFormData(prev => ({ ...prev, channelType: value }))}
            />
            
            <TextField
              label="Priority"
              type="number"
              value={formData.priority.toString()}
              onChange={(value) => setFormData(prev => ({ ...prev, priority: parseInt(value) || 0 }))}
              helpText="Higher priority channels are synced first"
            />
          </FormLayout>
        </Modal.Section>
      </Modal>

      {/* Details Modal */}
      <Modal
        large
        open={detailsModalActive}
        onClose={() => {
          setDetailsModalActive(false);
          setSelectedChannel(null);
        }}
        title={selectedChannel?.name || 'Channel Details'}
        secondaryActions={[
          {
            content: 'Close',
            onAction: () => {
              setDetailsModalActive(false);
              setSelectedChannel(null);
            }
          }
        ]}
      >
        {selectedChannel && (
          <Modal.Section>
            <BlockStack gap="400">
              <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
                <BlockStack gap="400">
                  {selectedTab === 0 && (
                    <Card>
                      <BlockStack gap="300">
                        <Text variant="headingMd">Linked Product Catalogs</Text>
                        {selectedChannel.catalogs && selectedChannel.catalogs.length > 0 ? (
                          <DataTable
                            columnContentTypes={['text', 'text', 'numeric', 'text']}
                            headings={['Catalog Name', 'Type', 'Priority', 'Status']}
                            rows={selectedChannel.catalogs.map(catalog => [
                              catalog.name,
                              catalog.catalogType,
                              catalog.ChannelCatalogLink?.priority || 0,
                              catalog.ChannelCatalogLink?.isActive ? 'Active' : 'Inactive'
                            ])}
                          />
                        ) : (
                          <Text variant="bodySm" tone="subdued">
                            No catalogs linked to this channel
                          </Text>
                        )}
                      </BlockStack>
                    </Card>
                  )}
                  
                  {selectedTab === 1 && (
                    <Card>
                      <BlockStack gap="300">
                        <Text variant="headingMd">Tenant Access</Text>
                        {selectedChannel.tenants && selectedChannel.tenants.length > 0 ? (
                          <DataTable
                            columnContentTypes={['text', 'text', 'text', 'text']}
                            headings={['Shop', 'Role', 'Permissions', 'Status']}
                            rows={selectedChannel.tenants.map(tenant => [
                              tenant.shopDomain || tenant.name || 'Unknown',
                              tenant.TenantChannelLink?.role || 'viewer',
                              'View details',
                              tenant.TenantChannelLink?.isActive ? 'Active' : 'Inactive'
                            ])}
                          />
                        ) : (
                          <Text variant="bodySm" tone="subdued">
                            No tenants assigned to this channel
                          </Text>
                        )}
                      </BlockStack>
                    </Card>
                  )}
                  
                  {selectedTab === 2 && (
                    <Card>
                      <BlockStack gap="300">
                        <Text variant="headingMd">Channel Configuration</Text>
                        <Text variant="bodySm" tone="subdued">
                          Configuration settings will be displayed here
                        </Text>
                      </BlockStack>
                    </Card>
                  )}
                </BlockStack>
              </Tabs>
            </BlockStack>
          </Modal.Section>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalActive}
        onClose={() => {
          setDeleteModalActive(false);
          setChannelToDelete(null);
        }}
        title="Delete Sales Channel"
        primaryAction={{
          content: 'Delete',
          destructive: true,
          onAction: () => handleDelete(channelToDelete?.id)
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => {
              setDeleteModalActive(false);
              setChannelToDelete(null);
            }
          }
        ]}
      >
        <Modal.Section>
          <Text>
            Are you sure you want to delete the sales channel "{channelToDelete?.name}"? 
            This action cannot be undone and will remove all associated catalog and tenant links.
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}

export default SalesChannels;
