import { GoodsReceiptNote } from '../goods-receipt-note';
import { Product } from '../product';
import { PurchaseOrder } from '../purchase-order';
import { SaleInvoice } from '../sale-invoice';
import { StockMovement } from '../stock-movement';
import { Stock } from '../stock';
import { Supplier } from '../supplier';
import { User } from '../user';
import { Warehouse } from '../warehouse';

const startOfTodayUTC = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

export const getSummary = async () => {
  const todayStart = startOfTodayUTC();

  const [
    totalWarehouses,
    totalActiveAdminUsers,
    totalSuppliers,
    totalProducts,
    totalStockItems,
    lowStockItemsCount,
    totalPurchaseOrders,
    totalGRN,
    totalInvoices,
    totalInHouseInvoices,
    todayStockMovementsCount,
  ] = await Promise.all([
    Warehouse.countDocuments({ isActive: true }),
    User.countDocuments({ roleCode: { $in: ['admin', 'staff'] }, isActive: true }),
    Supplier.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true }),
    Stock.countDocuments({}),
    Stock.countDocuments({ $expr: { $lte: ['$availableQuantity', '$minStockLevel'] } }),
    PurchaseOrder.countDocuments({}),
    GoodsReceiptNote.countDocuments({}),
    SaleInvoice.countDocuments({}),
    SaleInvoice.countDocuments({ invoiceType: 'inHouseSale' }),
    StockMovement.countDocuments({ createdAt: { $gte: todayStart } }),
  ]);

  return {
    totalWarehouses,
    totalActiveAdminUsers,
    totalSuppliers,
    totalProducts,
    totalStockItems,
    lowStockItemsCount,
    totalPurchaseOrders,
    totalGRN,
    totalInvoices,
    totalInHouseInvoices,
    todayStockMovementsCount,
  };
};
