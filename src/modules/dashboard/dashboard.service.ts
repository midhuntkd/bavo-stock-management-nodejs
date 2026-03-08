import User from '../user/user.model';
import Warehouse from '../warehouse/warehouse.model';
import Stock from '../stock/stock.model';

export const getSummary = async () => {
  const [totalWarehouses, totalAdmins, totalStockItems, lowStockItems] = await Promise.all([
    Warehouse.countDocuments({ isDeleted: false }),
    User.countDocuments({ role: 'admin' }),
    Stock.countDocuments({}),
    Stock.countDocuments({ $expr: { $lte: ['$availableQuantity', '$minimumStockLevel'] } }),
  ]);

  return {
    totalWarehouses,
    totalAdmins,
    totalStockItems,
    lowStockItems,
  };
};
