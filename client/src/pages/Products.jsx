import React, { useState, useEffect, useCallback } from 'react';
import {
  Page,
  Layout,
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Thumbnail,
  Badge,
  Button,
  InlineStack,
  BlockStack,
  Filters,
  ChoiceList,
  Modal,
  Select,
  TextField,
  Banner,
  Spinner
} from '@shopify/polaris';
import { useApi } from '../hooks/useApi';

function Products() {
  const { fetchWithAuth, loading } = useApi();
  const [products, setProducts] = useState([]);
  const [listings, setListings] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [queryValue, setQueryValue] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [modalActive, setModalActive] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [productsRes, listingsRes, connectionsRes] = await Promise.all([
        fetchWithAuth('/api/products'),
        fetchWithAuth('/api/products/listings/all'),
        fetchWithAuth('/api/marketplace/connections')
      ]);
      
      setProducts(productsRes.products || []);
      setListings(listingsRes.listings || []);
      setConnections(connectionsRes || []);
    } catch (err) {
      setError('Failed to load products');
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateListing = async () => {
    if (!selectedProduct || !selectedConnection) return;
    
    try {
      await fetchWithAuth('/api/products/listings', {
        method: 'POST',
        body: JSON.stringify({
          connectionId: selectedConnection,
          shopifyProductId: selectedProduct.id,
          price: listingPrice || selectedProduct.variants?.[0]?.price
        })
      });
      
      setSuccess('Listing created successfully');
      setModalActive(false);
      setSelectedProduct(null);
      setSelectedConnection('');
      setListingPrice('');
      loadData();
    } catch (err) {
      setError('Failed to create listing');
    }
  };

  const handleSyncListings = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      await fetchWithAuth('/api/products/listings/bulk-sync', {
        method: 'POST',
        body: JSON.stringify({ listingIds: selectedItems })
      });
      
      setSuccess('Sync initiated for selected listings');
      setSelectedItems([]);
      loadData();
    } catch (err) {
      setError('Failed to sync listings');
    }
  };

  const openCreateModal = (product) => {
    setSelectedProduct(product);
    setListingPrice(product.variants?.[0]?.price || '');
    setModalActive(true);
  };

  const getListingStatus = (productId) => {
    const productListings = listings.filter(l => l.shopifyProductId === productId);
    if (productListings.length === 0) return null;
    
    return productListings.map(l => (
      <Badge key={l.id} tone={l.status === 'active' ? 'success' : 'warning'}>
        {l.connection?.marketplace}: {l.status}
      </Badge>
    ));
  };

  const filteredProducts = products.filter(product => {
    const matchesQuery = !queryValue || 
      product.title.toLowerCase().includes(queryValue.toLowerCase());
    return matchesQuery;
  });

  const connectionOptions = connections.map(c => ({
    label: `${c.marketplace.charAt(0).toUpperCase() + c.marketplace.slice(1)}`,
    value: c.id
  }));

  return (
    <Page
      title="Products"
      primaryAction={{
        content: 'Sync Selected',
        disabled: selectedItems.length === 0,
        onAction: handleSyncListings
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
          <Card padding="0">
            <ResourceList
              resourceName={{ singular: 'product', plural: 'products' }}
              items={filteredProducts}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
              selectable
              loading={loading}
              filterControl={
                <Filters
                  queryValue={queryValue}
                  queryPlaceholder="Search products"
                  onQueryChange={setQueryValue}
                  onQueryClear={() => setQueryValue('')}
                  filters={[]}
                />
              }
              renderItem={(product) => {
                const { id, title, images, variants, status } = product;
                const image = images?.[0]?.url;
                const price = variants?.[0]?.price;
                const inventory = variants?.[0]?.inventoryQuantity;
                
                return (
                  <ResourceItem
                    id={id}
                    media={
                      <Thumbnail
                        source={image || 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png'}
                        alt={title}
                      />
                    }
                    accessibilityLabel={`View details for ${title}`}
                  >
                    <BlockStack gap="100">
                      <InlineStack align="space-between">
                        <Text variant="bodyMd" fontWeight="bold">{title}</Text>
                        <Badge tone={status === 'ACTIVE' ? 'success' : 'info'}>{status}</Badge>
                      </InlineStack>
                      
                      <InlineStack gap="400">
                        <Text variant="bodySm">${price}</Text>
                        <Text variant="bodySm" tone="subdued">{inventory} in stock</Text>
                      </InlineStack>
                      
                      <InlineStack gap="200">
                        {getListingStatus(id)}
                        <Button size="slim" onClick={() => openCreateModal(product)}>
                          List on Marketplace
                        </Button>
                      </InlineStack>
                    </BlockStack>
                  </ResourceItem>
                );
              }}
            />
          </Card>
        </Layout.Section>
      </Layout>

      {/* Create Listing Modal */}
      <Modal
        open={modalActive}
        onClose={() => setModalActive(false)}
        title="Create Marketplace Listing"
        primaryAction={{
          content: 'Create Listing',
          onAction: handleCreateListing,
          disabled: !selectedConnection
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setModalActive(false)
          }
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            {selectedProduct && (
              <InlineStack gap="400">
                <Thumbnail
                  source={selectedProduct.images?.[0]?.url || 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png'}
                  alt={selectedProduct.title}
                />
                <BlockStack>
                  <Text variant="bodyMd" fontWeight="bold">{selectedProduct.title}</Text>
                  <Text variant="bodySm">${selectedProduct.variants?.[0]?.price}</Text>
                </BlockStack>
              </InlineStack>
            )}
            
            <Select
              label="Marketplace"
              options={[{ label: 'Select a marketplace', value: '' }, ...connectionOptions]}
              value={selectedConnection}
              onChange={setSelectedConnection}
            />
            
            <TextField
              label="Listing Price"
              type="number"
              value={listingPrice}
              onChange={setListingPrice}
              prefix="$"
              helpText="Leave empty to use Shopify price"
            />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}

export default Products;
