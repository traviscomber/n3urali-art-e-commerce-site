-- Create e-commerce schema for n3urali.art
-- Images table for storing equirectangular and fisheye images
CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(20) CHECK (category IN ('equirectangular', 'fisheye')) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  file_url TEXT NOT NULL,
  preview_url TEXT NOT NULL,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  dimensions VARCHAR(50),
  file_size INTEGER,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table for tracking purchases
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  billing_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table for individual items in orders
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  image_id INTEGER REFERENCES images(id) ON DELETE CASCADE,
  license_type VARCHAR(20) CHECK (license_type IN ('standard', 'extended', 'commercial')) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  download_count INTEGER DEFAULT 0,
  download_limit INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Downloads table for tracking download history
CREATE TABLE IF NOT EXISTS downloads (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER REFERENCES order_items(id) ON DELETE CASCADE,
  download_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Licenses table for defining license types
CREATE TABLE IF NOT EXISTS licenses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  price_multiplier DECIMAL(3,2) DEFAULT 1.00,
  download_limit INTEGER DEFAULT 5,
  commercial_use BOOLEAN DEFAULT FALSE,
  resale_rights BOOLEAN DEFAULT FALSE,
  attribution_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_images_category ON images(category);
CREATE INDEX IF NOT EXISTS idx_images_featured ON images(featured);
CREATE INDEX IF NOT EXISTS idx_images_active ON images(active);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_downloads_token ON downloads(download_token);
CREATE INDEX IF NOT EXISTS idx_downloads_expires_at ON downloads(expires_at);

-- Enable Row Level Security
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for images (public read, admin write)
CREATE POLICY "Images are viewable by everyone" ON images
  FOR SELECT USING (active = true);

CREATE POLICY "Images are insertable by authenticated users" ON images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Images are updatable by authenticated users" ON images
  FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for orders (users can only see their own orders)
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can create their own orders" ON orders
  FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE USING (user_email = auth.jwt() ->> 'email');

-- RLS Policies for order_items (users can only see items from their orders)
CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_email = auth.jwt() ->> 'email'
    )
  );

-- RLS Policies for downloads (users can only access their own downloads)
CREATE POLICY "Users can view their own downloads" ON downloads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM order_items 
      JOIN orders ON orders.id = order_items.order_id
      WHERE order_items.id = downloads.order_item_id 
      AND orders.user_email = auth.jwt() ->> 'email'
    )
  );

-- RLS Policies for licenses (public read)
CREATE POLICY "Licenses are viewable by everyone" ON licenses
  FOR SELECT USING (true);
