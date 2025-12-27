import React, { useState, useEffect, useCallback } from 'react';
import {
  Page,
  Layout,
  Card,
  DataTable,
  Badge,
  Button,
  InlineStack,
  BlockStack,
  Text,
  Filters,
  ChoiceList,
  Modal,
  TextField,
  Select,
  Banner,
  Tabs,
  EmptyState
} from '@shopify/polaris';
import { useApi } from '../hooks/useApi';

function Orders() {
  const { fetchWithAuth, loading } = useApi();
  const [orders, setOrders] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState([]);
  const [sourceFilter, setSourceFilter] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [fulfillModalActive, setFulfillModalActive] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const tabs = [
    { id: 'all', content: 'All Orders' },
    { id: 'pending', content: 'Pending' },
    { id: 'processing', content: 'Processing' },
    { id: 'shipped', content: 'Shipped' }
  ];

  const loadOrders = useCallback(async () => {
    try {
      const status = tabs[selectedTab].id !== 'all' ? tabs[selectedTab].id : undefined;
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 50,
        ...(status && { status }),
        ...(sourceFilter.length > 0 && { source: sourceFilter[0] })
      });
      
      const data = await fetchWithAuth(`/api/orders?${params}`);
      setOrders(data.orders || []);
      setPagination(prev => ({ ...prev, totalPages: data.totalPages }));
    } catch (err) {
      setError('Failed to load orders');
    }
  }, [fetchWithAuth, selectedTab, sourceFilter, pagination.page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleFulfillOrder = async () => {
    if (!selectedOrder || !trackingNumber) return;
    
    try {
      await fetchWithAuth(`/api/orders/${selectedOrder.id}/fulfill`, {
        method: 'PUT',
        body: JSON.stringify({
          trackingNumber,
          carrier
        })
      });
      
      setSuccess('Order fulfilled successfully');
      setFulfillModalActive(false);
      setSelectedOrder(null);
      setTrackingNumber('');
      setCarrier('');
      loadOrders();
    } catch (err) {
      setError('Failed to fulfill order');
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await fetchWithAuth(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        body: JSON.stringify({ reason: 'Cancelled by merchant' })
      });
      
      setSuccess('Order cancelled');
      loadOrders();
    } catch (err) {
      setError('Failed to cancel order');
    }
  };

  const openFulfillModal = (order) => {
    setSelectedOrder(order);
    setFulfillModalActive(true);
  };

  const getStatusBadge = (status) => {
    const toneMap = {
      pending: 'attention',
      processing: 'info',
      shipped: 'success',
      delivered: 'success',
      cancelled: 'critical',
      refunded: 'warning'
    };
    return <Badge tone={toneMap[status] || 'info'}>{status}</Badge>;
  };

  const getSourceBadge = (source) => {
    const colorMap = {
      shopify: 'success',
      amazon: 'warning',
      ebay: 'info',
      walmart: 'attention'
    };
    return <Badge tone={colorMap[source] || 'info'}>{source}</Badge>;
  };

  const rows = orders.map(order => [
    order.orderNumber || order.id.slice(0, 8),
    getSourceBadge(order.source),
    order.customerName || order.customerEmail || 'N/A',
    `$${parseFloat(order.total).toFixed(2)}`,
    getStatusBadge(order.status),
    new Date(order.orderedAt || order.createdAt).toLocaleDateString(),
    <InlineStack gap="200" key={order.id}>
      {order.status === 'processing' && (
        <Button size="slim" onClick={() => openFulfillModal(order)}>
          Fulfill
        </Button>
      )}
      {['pending', 'processing'].includes(order.status) && (
        <Button size="slim" tone="critical" onClick={() => handleCancelOrder(order.id)}>
          Cancel
        </Button>
      )}
    </InlineStack>
  ]);

  const filters = [
    {
      key: 'source',
      label: 'Source',
      filter: (
        <ChoiceList
          title="Source"
          titleHidden
          choices={[
            { label: 'Shopify', value: 'shopify' },
            { label: 'Amazon', value: 'amazon' },
            { label: 'eBay', value: 'ebay' },
            { label: 'Walmart', value: 'walmart' }
          ]}
          selected={sourceFilter}
          onChange={setSourceFilter}
        />
      ),
      shortcut: true
    }
  ];

  const appliedFilters = sourceFilter.length > 0
    ? [{ key: 'source', label: `Source: ${sourceFilter.join(', ')}`, onRemove: () => setSourceFilter([]) }]
    : [];

  return (
    <Page title="Orders">
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
            <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
              <div style={{ padding: '16px' }}>
                <Filters
                  filters={filters}
                  appliedFilters={appliedFilters}
                  onClearAll={() => setSourceFilter([])}
                />
              </div>
              
              {orders.length > 0 ? (
                <DataTable
                  columnContentTypes={['text', 'text', 'text', 'numeric', 'text', 'text', 'text']}
                  headings={['Order', 'Source', 'Customer', 'Total', 'Status', 'Date', 'Actions']}
                  rows={rows}
                />
              ) : (
                <EmptyState
                  heading="No orders found"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Orders from Shopify and connected marketplaces will appear here.</p>
                </EmptyState>
              )}
            </Tabs>
          </Card>
        </Layout.Section>
      </Layout>

      {/* Fulfill Order Modal */}
      <Modal
        open={fulfillModalActive}
        onClose={() => setFulfillModalActive(false)}
        title="Fulfill Order"
        primaryAction={{
          content: 'Mark as Fulfilled',
          onAction: handleFulfillOrder,
          disabled: !trackingNumber
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setFulfillModalActive(false)
          }
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            {selectedOrder && (
              <BlockStack gap="200">
                <Text variant="bodyMd" fontWeight="bold">
                  Order: {selectedOrder.orderNumber || selectedOrder.id.slice(0, 8)}
                </Text>
                <Text variant="bodySm">
                  Customer: {selectedOrder.customerName || selectedOrder.customerEmail}
                </Text>
                <Text variant="bodySm">
                  Total: ${parseFloat(selectedOrder.total).toFixed(2)}
                </Text>
              </BlockStack>
            )}
            
            <TextField
              label="Tracking Number"
              value={trackingNumber}
              onChange={setTrackingNumber}
              autoComplete="off"
            />
            
            <Select
              label="Carrier"
              options={[
                { label: 'Select carrier', value: '' },
                { label: 'USPS', value: 'USPS' },
                { label: 'UPS', value: 'UPS' },
                { label: 'FedEx', value: 'FedEx' },
                { label: 'DHL', value: 'DHL' },
                { label: 'Other', value: 'Other' }
              ]}
              value={carrier}
              onChange={setCarrier}
            />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}

export default Orders;
