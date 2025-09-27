-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create downloads table to track image downloads
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_image_id ON order_items(image_id);
CREATE INDEX IF NOT EXISTS idx_downloads_image_id ON downloads(image_id);
CREATE INDEX IF NOT EXISTS idx_downloads_downloaded_at ON downloads(downloaded_at);

-- Add some sample data for testing
INSERT INTO orders (user_email, total_amount, status) VALUES
  ('user1@example.com', 29.99, 'completed'),
  ('user2@example.com', 49.99, 'completed'),
  ('user3@example.com', 19.99, 'pending'),
  ('user4@example.com', 39.99, 'completed'),
  ('user5@example.com', 59.99, 'completed');

-- Add sample order items (assuming we have some images in the database)
INSERT INTO order_items (order_id, image_id, license_id, price)
SELECT 
  o.id,
  i.id,
  l.id,
  i.price
FROM orders o
CROSS JOIN images i
CROSS JOIN licenses l
WHERE o.user_email = 'user1@example.com'
LIMIT 1;

-- Add more sample order items for other orders
INSERT INTO order_items (order_id, image_id, license_id, price)
SELECT 
  o.id,
  i.id,
  l.id,
  i.price
FROM orders o
CROSS JOIN (SELECT * FROM images LIMIT 3) i
CROSS JOIN (SELECT * FROM licenses LIMIT 1) l
WHERE o.status = 'completed'
AND o.user_email != 'user1@example.com';

-- Add sample downloads
INSERT INTO downloads (order_item_id, user_email, image_id)
SELECT 
  oi.id,
  o.user_email,
  oi.image_id
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'completed';
