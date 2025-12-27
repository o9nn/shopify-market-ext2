const express = require('express');
const router = express.Router();
const { ProductCatalog, SalesChannel, ChannelCatalogLink } = require('../models');

/**
 * @route GET /api/product-catalogs
 * @desc Get all product catalogs
 */
router.get('/', async (req, res, next) => {
  try {
    const { includeChannels = false } = req.query;
    
    const options = {
      order: [['createdAt', 'DESC']]
    };
    
    if (includeChannels === 'true') {
      options.include = [
        {
          model: SalesChannel,
          as: 'channels',
          through: { attributes: ['overrides', 'priority', 'isActive'] }
        }
      ];
    }
    
    const catalogs = await ProductCatalog.findAll(options);
    res.json(catalogs);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/product-catalogs/:id
 * @desc Get a single product catalog with details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const catalog = await ProductCatalog.findByPk(id, {
      include: [
        {
          model: SalesChannel,
          as: 'channels',
          through: { attributes: ['overrides', 'priority', 'isActive'] }
        }
      ]
    });
    
    if (!catalog) {
      return res.status(404).json({ error: 'Catalog not found' });
    }
    
    res.json(catalog);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/product-catalogs
 * @desc Create a new product catalog
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, description, catalogType, filters, pricingStrategy } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Catalog name is required' });
    }
    
    const catalog = await ProductCatalog.create({
      name,
      description,
      catalogType: catalogType || 'standard',
      filters: filters || {},
      pricingStrategy: pricingStrategy || {}
    });
    
    res.status(201).json(catalog);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/product-catalogs/:id
 * @desc Update a product catalog
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, catalogType, filters, pricingStrategy, isActive } = req.body;
    
    const catalog = await ProductCatalog.findByPk(id);
    
    if (!catalog) {
      return res.status(404).json({ error: 'Catalog not found' });
    }
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (catalogType !== undefined) updates.catalogType = catalogType;
    if (filters !== undefined) updates.filters = { ...catalog.filters, ...filters };
    if (pricingStrategy !== undefined) updates.pricingStrategy = { ...catalog.pricingStrategy, ...pricingStrategy };
    if (isActive !== undefined) updates.isActive = isActive;
    
    await catalog.update(updates);
    res.json(catalog);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/product-catalogs/:id
 * @desc Delete a product catalog
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const catalog = await ProductCatalog.findByPk(id);
    
    if (!catalog) {
      return res.status(404).json({ error: 'Catalog not found' });
    }
    
    // Delete associated links
    await ChannelCatalogLink.destroy({ where: { catalogId: id } });
    
    await catalog.destroy();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/product-catalogs/:id/products
 * @desc Get products that match the catalog filters (stub for now)
 */
router.get('/:id/products', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const catalog = await ProductCatalog.findByPk(id);
    
    if (!catalog) {
      return res.status(404).json({ error: 'Catalog not found' });
    }
    
    // TODO: Implement product filtering based on catalog.filters
    // This would query Shopify API or local ProductListing table
    // and apply the filters defined in the catalog
    
    res.json({
      catalogId: id,
      filters: catalog.filters,
      products: [],
      message: 'Product filtering to be implemented'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
