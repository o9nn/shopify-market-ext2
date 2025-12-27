const express = require('express');
const router = express.Router();
const { SalesChannel, ProductCatalog, ChannelCatalogLink, TenantChannelLink, Shop } = require('../models');

/**
 * @route GET /api/sales-channels
 * @desc Get all sales channels (with optional tenant filtering)
 */
router.get('/', async (req, res, next) => {
  try {
    const { includeTenants = false } = req.query;
    
    const options = {
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    };
    
    if (includeTenants === 'true') {
      options.include = [
        {
          model: Shop,
          as: 'tenants',
          through: { attributes: ['role', 'permissions', 'isActive'] }
        }
      ];
    }
    
    const channels = await SalesChannel.findAll(options);
    res.json(channels);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/sales-channels/:id
 * @desc Get a single sales channel with details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const channel = await SalesChannel.findByPk(id, {
      include: [
        {
          model: ProductCatalog,
          as: 'catalogs',
          through: { attributes: ['overrides', 'priority', 'isActive'] }
        },
        {
          model: Shop,
          as: 'tenants',
          through: { attributes: ['role', 'permissions', 'isActive'] }
        }
      ]
    });
    
    if (!channel) {
      return res.status(404).json({ error: 'Sales channel not found' });
    }
    
    res.json(channel);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/sales-channels
 * @desc Create a new sales channel
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, description, channelType, configuration, priority } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Channel name is required' });
    }
    
    const channel = await SalesChannel.create({
      name,
      description,
      channelType: channelType || 'custom',
      configuration: configuration || {},
      priority: priority || 0
    });
    
    res.status(201).json(channel);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/sales-channels/:id
 * @desc Update a sales channel
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, channelType, configuration, isActive, priority } = req.body;
    
    const channel = await SalesChannel.findByPk(id);
    
    if (!channel) {
      return res.status(404).json({ error: 'Sales channel not found' });
    }
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (channelType !== undefined) updates.channelType = channelType;
    if (configuration !== undefined) updates.configuration = { ...channel.configuration, ...configuration };
    if (isActive !== undefined) updates.isActive = isActive;
    if (priority !== undefined) updates.priority = priority;
    
    await channel.update(updates);
    res.json(channel);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/sales-channels/:id
 * @desc Delete a sales channel
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const channel = await SalesChannel.findByPk(id);
    
    if (!channel) {
      return res.status(404).json({ error: 'Sales channel not found' });
    }
    
    // Delete associated links (cascade should handle this, but being explicit)
    await ChannelCatalogLink.destroy({ where: { channelId: id } });
    await TenantChannelLink.destroy({ where: { channelId: id } });
    
    await channel.destroy();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/sales-channels/:id/catalogs
 * @desc Link a catalog to a channel
 */
router.post('/:id/catalogs', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { catalogId, overrides, priority } = req.body;
    
    if (!catalogId) {
      return res.status(400).json({ error: 'Catalog ID is required' });
    }
    
    const channel = await SalesChannel.findByPk(id);
    if (!channel) {
      return res.status(404).json({ error: 'Sales channel not found' });
    }
    
    const catalog = await ProductCatalog.findByPk(catalogId);
    if (!catalog) {
      return res.status(404).json({ error: 'Catalog not found' });
    }
    
    // Check if link already exists
    const existing = await ChannelCatalogLink.findOne({
      where: { channelId: id, catalogId }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Catalog already linked to this channel' });
    }
    
    const link = await ChannelCatalogLink.create({
      channelId: id,
      catalogId,
      overrides: overrides || {},
      priority: priority || 0
    });
    
    res.status(201).json(link);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/sales-channels/:id/catalogs/:catalogId
 * @desc Unlink a catalog from a channel
 */
router.delete('/:id/catalogs/:catalogId', async (req, res, next) => {
  try {
    const { id, catalogId } = req.params;
    
    const link = await ChannelCatalogLink.findOne({
      where: { channelId: id, catalogId }
    });
    
    if (!link) {
      return res.status(404).json({ error: 'Catalog link not found' });
    }
    
    await link.destroy();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/sales-channels/:id/tenants
 * @desc Link a tenant (shop) to a channel
 */
router.post('/:id/tenants', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { shopId, role, permissions, settings } = req.body;
    
    if (!shopId) {
      return res.status(400).json({ error: 'Shop ID is required' });
    }
    
    const channel = await SalesChannel.findByPk(id);
    if (!channel) {
      return res.status(404).json({ error: 'Sales channel not found' });
    }
    
    const shop = await Shop.findByPk(shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    
    // Check if link already exists
    const existing = await TenantChannelLink.findOne({
      where: { shopId, channelId: id }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Tenant already linked to this channel' });
    }
    
    const link = await TenantChannelLink.create({
      shopId,
      channelId: id,
      role: role || 'viewer',
      permissions: permissions || {},
      settings: settings || {}
    });
    
    res.status(201).json(link);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/sales-channels/:id/tenants/:shopId
 * @desc Update tenant channel link
 */
router.put('/:id/tenants/:shopId', async (req, res, next) => {
  try {
    const { id, shopId } = req.params;
    const { role, permissions, settings, isActive } = req.body;
    
    const link = await TenantChannelLink.findOne({
      where: { channelId: id, shopId }
    });
    
    if (!link) {
      return res.status(404).json({ error: 'Tenant link not found' });
    }
    
    const updates = {};
    if (role !== undefined) updates.role = role;
    if (permissions !== undefined) updates.permissions = { ...link.permissions, ...permissions };
    if (settings !== undefined) updates.settings = { ...link.settings, ...settings };
    if (isActive !== undefined) updates.isActive = isActive;
    
    await link.update(updates);
    res.json(link);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/sales-channels/:id/tenants/:shopId
 * @desc Unlink a tenant from a channel
 */
router.delete('/:id/tenants/:shopId', async (req, res, next) => {
  try {
    const { id, shopId } = req.params;
    
    const link = await TenantChannelLink.findOne({
      where: { channelId: id, shopId }
    });
    
    if (!link) {
      return res.status(404).json({ error: 'Tenant link not found' });
    }
    
    await link.destroy();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
