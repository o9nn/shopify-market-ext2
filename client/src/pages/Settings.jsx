import React, { useState } from 'react';
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Checkbox,
  Button,
  BlockStack,
  Text,
  Divider,
  Banner,
  Select
} from '@shopify/polaris';

function Settings() {
  const [settings, setSettings] = useState({
    autoSync: true,
    syncInterval: '60',
    syncInventory: true,
    syncPrices: true,
    syncOrders: true,
    defaultMarkup: '0',
    roundPrices: true,
    notifyOnNewOrder: true,
    notifyOnLowStock: true,
    lowStockThreshold: '10',
    // Sales channel settings
    enableSalesChannels: true,
    defaultChannelPriority: '0',
    catalogSyncMode: 'automatic'
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (field) => (value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Page title="Settings">
      {saved && (
        <Banner tone="success" onDismiss={() => setSaved(false)}>
          Settings saved successfully
        </Banner>
      )}

      <Layout>
        {/* Sync Settings */}
        <Layout.AnnotatedSection
          title="Sync Settings"
          description="Configure how and when your data syncs with connected marketplaces."
        >
          <Card>
            <FormLayout>
              <Checkbox
                label="Enable automatic sync"
                checked={settings.autoSync}
                onChange={handleChange('autoSync')}
                helpText="Automatically sync products, inventory, and orders with marketplaces"
              />
              
              <Select
                label="Sync interval"
                options={[
                  { label: 'Every 15 minutes', value: '15' },
                  { label: 'Every 30 minutes', value: '30' },
                  { label: 'Every hour', value: '60' },
                  { label: 'Every 2 hours', value: '120' },
                  { label: 'Every 6 hours', value: '360' },
                  { label: 'Daily', value: '1440' }
                ]}
                value={settings.syncInterval}
                onChange={handleChange('syncInterval')}
                disabled={!settings.autoSync}
              />
              
              <Divider />
              
              <BlockStack gap="200">
                <Text variant="bodyMd" fontWeight="semibold">Sync Options</Text>
                
                <Checkbox
                  label="Sync inventory levels"
                  checked={settings.syncInventory}
                  onChange={handleChange('syncInventory')}
                />
                
                <Checkbox
                  label="Sync prices"
                  checked={settings.syncPrices}
                  onChange={handleChange('syncPrices')}
                />
                
                <Checkbox
                  label="Import marketplace orders"
                  checked={settings.syncOrders}
                  onChange={handleChange('syncOrders')}
                />
              </BlockStack>
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>

        {/* Pricing Settings */}
        <Layout.AnnotatedSection
          title="Pricing"
          description="Configure pricing rules for marketplace listings."
        >
          <Card>
            <FormLayout>
              <TextField
                label="Default price markup (%)"
                type="number"
                value={settings.defaultMarkup}
                onChange={handleChange('defaultMarkup')}
                suffix="%"
                helpText="Add a percentage markup to Shopify prices for marketplace listings"
              />
              
              <Checkbox
                label="Round prices to nearest .99"
                checked={settings.roundPrices}
                onChange={handleChange('roundPrices')}
              />
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>

        {/* Sales Channel Settings */}
        <Layout.AnnotatedSection
          title="Sales Channel Configuration"
          description="Configure advanced sales channel and catalog management options."
        >
          <Card>
            <FormLayout>
              <Checkbox
                label="Enable advanced sales channel management"
                checked={settings.enableSalesChannels}
                onChange={handleChange('enableSalesChannels')}
                helpText="Use custom sales channels to manage marketplace connections with catalog-based configurations"
              />
              
              <TextField
                label="Default channel priority"
                type="number"
                value={settings.defaultChannelPriority}
                onChange={handleChange('defaultChannelPriority')}
                disabled={!settings.enableSalesChannels}
                helpText="Higher priority channels are synced first (0-100)"
              />
              
              <Select
                label="Catalog sync mode"
                options={[
                  { label: 'Automatic (sync on changes)', value: 'automatic' },
                  { label: 'Manual (sync on demand)', value: 'manual' },
                  { label: 'Scheduled (sync at intervals)', value: 'scheduled' }
                ]}
                value={settings.catalogSyncMode}
                onChange={handleChange('catalogSyncMode')}
                disabled={!settings.enableSalesChannels}
                helpText="Control when product catalogs sync to sales channels"
              />
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>

        {/* Notification Settings */}
        <Layout.AnnotatedSection
          title="Notifications"
          description="Configure when you receive notifications."
        >
          <Card>
            <FormLayout>
              <Checkbox
                label="Notify on new marketplace orders"
                checked={settings.notifyOnNewOrder}
                onChange={handleChange('notifyOnNewOrder')}
              />
              
              <Checkbox
                label="Notify on low stock"
                checked={settings.notifyOnLowStock}
                onChange={handleChange('notifyOnLowStock')}
              />
              
              <TextField
                label="Low stock threshold"
                type="number"
                value={settings.lowStockThreshold}
                onChange={handleChange('lowStockThreshold')}
                disabled={!settings.notifyOnLowStock}
                helpText="Get notified when inventory falls below this level"
              />
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>

        {/* Danger Zone */}
        <Layout.AnnotatedSection
          title="Danger Zone"
          description="Irreversible actions that affect your marketplace connections."
        >
          <Card>
            <BlockStack gap="400">
              <BlockStack gap="200">
                <Text variant="bodyMd" fontWeight="semibold">Disconnect All Marketplaces</Text>
                <Text variant="bodySm" tone="subdued">
                  This will remove all marketplace connections and stop syncing. Your listings on marketplaces will remain but will no longer be managed from this app.
                </Text>
                <div>
                  <Button tone="critical">Disconnect All</Button>
                </div>
              </BlockStack>
              
              <Divider />
              
              <BlockStack gap="200">
                <Text variant="bodyMd" fontWeight="semibold">Reset App Data</Text>
                <Text variant="bodySm" tone="subdued">
                  This will delete all local data including sync history, settings, and cached information. Marketplace connections will be preserved.
                </Text>
                <div>
                  <Button tone="critical">Reset Data</Button>
                </div>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>

        {/* Save Button */}
        <Layout.Section>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default Settings;
