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
  Icon
} from '@shopify/polaris';
import { 
  PlusCircleIcon, 
  EditIcon, 
  DeleteIcon,
  ProductIcon 
} from '@shopify/polaris-icons';
import { useApi } from '../hooks/useApi';

function ProductCatalogs() {
  const { fetchWithAuth, loading } = useApi();
  const [catalogs, setCatalogs] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [modalActive, setModalActive] = useState(false);
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [catalogToDelete, setCatalogToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    catalogType: 'standard',
    filters: {},
    pricingStrategy: {
      markupType: 'percentage',
      markupValue: 0,
      roundingRule: 'none'
    }
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadCatalogs = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/product-catalogs?includeChannels=true');
      setCatalogs(data || []);
    } catch (err) {
      setError('Failed to load product catalogs');
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  const handleCreateOrUpdate = async () => {
    try {
      if (selectedCatalog) {
        await fetchWithAuth(`/api/product-catalogs/${selectedCatalog.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        setSuccess('Product catalog updated successfully');
      } else {
        await fetchWithAuth('/api/product-catalogs', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        setSuccess('Product catalog created successfully');
      }
      
      setModalActive(false);
      resetForm();
      loadCatalogs();
    } catch (err) {
      setError('Failed to save product catalog');
    }
  };

  const handleDelete = async (catalogId) => {
    try {
      await fetchWithAuth(`/api/product-catalogs/${catalogId}`, {
        method: 'DELETE'
      });
      setSuccess('Product catalog deleted');
      setDeleteModalActive(false);
      setCatalogToDelete(null);
      loadCatalogs();
    } catch (err) {
      setError('Failed to delete product catalog');
    }
  };

  const openDeleteModal = (catalog) => {
    setCatalogToDelete(catalog);
    setDeleteModalActive(true);
  };

  const handleEdit = (catalog) => {
    setSelectedCatalog(catalog);
    setFormData({
      name: catalog.name,
      description: catalog.description || '',
      catalogType: catalog.catalogType,
      filters: catalog.filters || {},
      pricingStrategy: catalog.pricingStrategy || {
        markupType: 'percentage',
        markupValue: 0,
        roundingRule: 'none'
      }
    });
    setModalActive(true);
  };

  const resetForm = () => {
    setSelectedCatalog(null);
    setFormData({
      name: '',
      description: '',
      catalogType: 'standard',
      filters: {},
      pricingStrategy: {
        markupType: 'percentage',
        markupValue: 0,
        roundingRule: 'none'
      }
    });
  };

  const getCatalogTypeBadge = (type) => {
    const toneMap = {
      standard: 'info',
      seasonal: 'success',
      promotional: 'attention',
      custom: 'warning'
    };
    return <Badge tone={toneMap[type] || 'info'}>{type}</Badge>;
  };

  const catalogTypeOptions = [
    { label: 'Standard', value: 'standard' },
    { label: 'Seasonal', value: 'seasonal' },
    { label: 'Promotional', value: 'promotional' },
    { label: 'Custom', value: 'custom' }
  ];

  const markupTypeOptions = [
    { label: 'Percentage', value: 'percentage' },
    { label: 'Fixed Amount', value: 'fixed' }
  ];

  const roundingRuleOptions = [
    { label: 'None', value: 'none' },
    { label: 'Round to .99', value: 'to_99' },
    { label: 'Round to nearest dollar', value: 'to_dollar' }
  ];

  return (
    <Page
      title="Product Catalogs"
      subtitle="Manage product groupings for your sales channels"
      primaryAction={{
        content: 'Create Catalog',
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
          {catalogs.length > 0 ? (
            <Card padding="0">
              <ResourceList
                resourceName={{ singular: 'catalog', plural: 'catalogs' }}
                items={catalogs}
                loading={loading}
                renderItem={(catalog) => {
                  const { id, name, description, catalogType, isActive, channels } = catalog;
                  const channelCount = channels?.length || 0;
                  
                  return (
                    <ResourceItem
                      id={id}
                      media={<Icon source={ProductIcon} />}
                      accessibilityLabel={`View details for ${name}`}
                    >
                      <BlockStack gap="200">
                        <InlineStack align="space-between">
                          <InlineStack gap="300">
                            <Text variant="bodyMd" fontWeight="bold">
                              {name}
                            </Text>
                            {getCatalogTypeBadge(catalogType)}
                            {!isActive && <Badge tone="critical">Inactive</Badge>}
                          </InlineStack>
                          
                          <InlineStack gap="200">
                            <Button
                              size="slim"
                              icon={EditIcon}
                              onClick={() => handleEdit(catalog)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="slim"
                              tone="critical"
                              icon={DeleteIcon}
                              onClick={() => openDeleteModal(catalog)}
                            />
                          </InlineStack>
                        </InlineStack>
                        
                        <InlineStack gap="400">
                          {description && (
                            <Text variant="bodySm" tone="subdued">
                              {description}
                            </Text>
                          )}
                        </InlineStack>
                        
                        <Text variant="bodySm" tone="subdued">
                          Linked to {channelCount} sales {channelCount === 1 ? 'channel' : 'channels'}
                        </Text>
                      </BlockStack>
                    </ResourceItem>
                  );
                }}
              />
            </Card>
          ) : (
            <Card>
              <EmptyState
                heading="Create your first product catalog"
                action={{
                  content: 'Create Catalog',
                  onAction: () => {
                    resetForm();
                    setModalActive(true);
                  }
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>
                  Product catalogs let you group products with specific filters, 
                  pricing strategies, and configurations. Link catalogs to sales 
                  channels to control what products are available on each channel.
                </p>
              </EmptyState>
            </Card>
          )}
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">About Product Catalogs</Text>
              <BlockStack gap="300">
                <Text variant="bodySm">
                  Product catalogs allow you to create flexible product groupings 
                  that can be assigned to different sales channels with custom 
                  pricing and inventory rules.
                </Text>
                <Text variant="bodySm" fontWeight="semibold">Use Cases:</Text>
                <BlockStack gap="200">
                  <Text variant="bodySm">• Seasonal product collections</Text>
                  <Text variant="bodySm">• Marketplace-specific inventory</Text>
                  <Text variant="bodySm">• Promotional product sets</Text>
                  <Text variant="bodySm">• Customer segment products (B2B)</Text>
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
        title={selectedCatalog ? 'Edit Product Catalog' : 'Create Product Catalog'}
        primaryAction={{
          content: selectedCatalog ? 'Update' : 'Create',
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
              label="Catalog Name"
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              autoComplete="off"
              helpText="A descriptive name for this catalog"
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              multiline={3}
              autoComplete="off"
            />
            
            <Select
              label="Catalog Type"
              options={catalogTypeOptions}
              value={formData.catalogType}
              onChange={(value) => setFormData(prev => ({ ...prev, catalogType: value }))}
            />
            
            <BlockStack gap="300">
              <Text variant="headingSm">Pricing Strategy</Text>
              
              <Select
                label="Markup Type"
                options={markupTypeOptions}
                value={formData.pricingStrategy.markupType}
                onChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  pricingStrategy: { ...prev.pricingStrategy, markupType: value } 
                }))}
              />
              
              <TextField
                label="Markup Value"
                type="number"
                value={formData.pricingStrategy.markupValue.toString()}
                onChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  pricingStrategy: { ...prev.pricingStrategy, markupValue: parseFloat(value) || 0 } 
                }))}
                suffix={formData.pricingStrategy.markupType === 'percentage' ? '%' : '$'}
              />
              
              <Select
                label="Rounding Rule"
                options={roundingRuleOptions}
                value={formData.pricingStrategy.roundingRule}
                onChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  pricingStrategy: { ...prev.pricingStrategy, roundingRule: value } 
                }))}
              />
            </BlockStack>
          </FormLayout>
        </Modal.Section>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalActive}
        onClose={() => {
          setDeleteModalActive(false);
          setCatalogToDelete(null);
        }}
        title="Delete Product Catalog"
        primaryAction={{
          content: 'Delete',
          destructive: true,
          onAction: () => handleDelete(catalogToDelete?.id)
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => {
              setDeleteModalActive(false);
              setCatalogToDelete(null);
            }
          }
        ]}
      >
        <Modal.Section>
          <Text>
            Are you sure you want to delete the product catalog "{catalogToDelete?.name}"? 
            This action cannot be undone and will remove all associated channel links.
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}

export default ProductCatalogs;
