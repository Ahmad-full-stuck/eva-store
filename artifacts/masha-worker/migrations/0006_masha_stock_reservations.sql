-- Atomically validate/reserve Masha product quantities as order rows are inserted.
-- Each new order decrements stock inside the same SQLite statement transaction.
CREATE TRIGGER IF NOT EXISTS masha_order_check_stock_before_insert
BEFORE INSERT ON orders
WHEN EXISTS (
  SELECT 1
  FROM (
    SELECT
      json_extract(item.value, '$.productId') AS product_id,
      SUM(CAST(json_extract(item.value, '$.quantity') AS INTEGER)) AS requested_quantity
    FROM json_each(NEW.items) AS item
    GROUP BY json_extract(item.value, '$.productId')
  ) AS requested
  LEFT JOIN products AS product ON product.id = requested.product_id
  WHERE product.id IS NULL
     OR product.hidden = 1
     OR product.stock_meters < requested.requested_quantity
)
BEGIN
  SELECT RAISE(ABORT, 'insufficient_stock');
END;

CREATE TRIGGER IF NOT EXISTS masha_order_reserve_stock_after_insert
AFTER INSERT ON orders
BEGIN
  UPDATE products
  SET stock_meters = stock_meters - (
    SELECT SUM(CAST(json_extract(item.value, '$.quantity') AS INTEGER))
    FROM json_each(NEW.items) AS item
    WHERE json_extract(item.value, '$.productId') = products.id
  ),
  updated_at = datetime('now')
  WHERE id IN (
    SELECT json_extract(item.value, '$.productId')
    FROM json_each(NEW.items) AS item
  );
END;

-- Returning an order to an active status must re-check stock before reserving it again.
CREATE TRIGGER IF NOT EXISTS masha_cancelled_order_check_stock
BEFORE UPDATE OF status ON orders
WHEN OLD.status = 'cancelled' AND NEW.status <> 'cancelled'
AND EXISTS (
  SELECT 1
  FROM (
    SELECT
      json_extract(item.value, '$.productId') AS product_id,
      SUM(CAST(json_extract(item.value, '$.quantity') AS INTEGER)) AS requested_quantity
    FROM json_each(NEW.items) AS item
    GROUP BY json_extract(item.value, '$.productId')
  ) AS requested
  LEFT JOIN products AS product ON product.id = requested.product_id
  WHERE product.id IS NULL
     OR product.hidden = 1
     OR product.stock_meters < requested.requested_quantity
)
BEGIN
  SELECT RAISE(ABORT, 'insufficient_stock');
END;

CREATE TRIGGER IF NOT EXISTS masha_cancelled_order_re_reserve_stock
AFTER UPDATE OF status ON orders
WHEN OLD.status = 'cancelled' AND NEW.status <> 'cancelled'
BEGIN
  UPDATE products
  SET stock_meters = stock_meters - (
    SELECT SUM(CAST(json_extract(item.value, '$.quantity') AS INTEGER))
    FROM json_each(NEW.items) AS item
    WHERE json_extract(item.value, '$.productId') = products.id
  ),
  updated_at = datetime('now')
  WHERE id IN (
    SELECT json_extract(item.value, '$.productId')
    FROM json_each(NEW.items) AS item
  );
END;

-- A cancellation before shipment returns reserved stock to the catalog.
CREATE TRIGGER IF NOT EXISTS masha_cancel_order_release_stock
AFTER UPDATE OF status ON orders
WHEN OLD.status IN ('new', 'confirmed', 'preparing') AND NEW.status = 'cancelled'
BEGIN
  UPDATE products
  SET stock_meters = stock_meters + (
    SELECT SUM(CAST(json_extract(item.value, '$.quantity') AS INTEGER))
    FROM json_each(NEW.items) AS item
    WHERE json_extract(item.value, '$.productId') = products.id
  ),
  updated_at = datetime('now')
  WHERE id IN (
    SELECT json_extract(item.value, '$.productId')
    FROM json_each(NEW.items) AS item
  );
END;
