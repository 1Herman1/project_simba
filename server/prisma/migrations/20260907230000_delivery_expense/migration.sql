-- Расход магазина на доставку: по способу (прайс) и по заказу (тариф службы).
ALTER TABLE "delivery_options" ADD COLUMN "expense" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN "deliveryExpense" INTEGER;
ALTER TABLE "orders" ADD COLUMN "deliveryExpenseNote" TEXT;
