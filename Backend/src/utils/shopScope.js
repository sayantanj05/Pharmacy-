const mongoose = require('mongoose');
const Shop = require('../models/Shop');

/**
 * Shop scoping helper.
 *
 * `User.shopId` is stored as a human readable shop key (e.g. "SHOP001") while every
 * domain model (Medicine, Order, Supply, Vendor, ExpiryLog, ProcurementOrder) stores
 * `shopId` as an ObjectId referencing Shop. Queries that pass the raw key straight to
 * Mongoose blow up with a CastError, which is why owner pages appeared empty.
 *
 * resolveShopId() accepts either form and always returns the Shop `_id` as a string.
 */

const cache = new Map();

const clearShopScopeCache = () => cache.clear();

const asKey = (shopRef) => {
  if (!shopRef) return null;
  if (typeof shopRef === 'object' && shopRef._id) return String(shopRef._id);
  const key = String(shopRef).trim();
  return key || null;
};

const resolveShopId = async (shopRef) => {
  const key = asKey(shopRef);
  if (!key) return null;

  if (cache.has(key)) return cache.get(key);

  let shop = null;
  if (mongoose.isValidObjectId(key)) {
    shop = await Shop.findById(key).select('_id');
  }
  if (!shop) {
    shop = await Shop.findOne({ shopId: key }).select('_id');
  }

  const resolved = shop ? String(shop._id) : null;
  if (resolved) cache.set(key, resolved);
  return resolved;
};

/**
 * Resolves a shop reference used in a query string. Returns the ObjectId string when the
 * value maps to a real shop, otherwise the original value so unknown ids still 404 cleanly.
 */
const resolveShopFilter = async (shopRef) => {
  const key = asKey(shopRef);
  if (!key) return null;
  return (await resolveShopId(key)) || key;
};

module.exports = { resolveShopId, resolveShopFilter, clearShopScopeCache };