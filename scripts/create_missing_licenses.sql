-- Create the missing license records that are referenced in the code
INSERT INTO licenses (id, name, description, price, active, created_at, updated_at) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'NON_EXCLUSIVE', 'Non-exclusive license for commercial and personal use', 29.99, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'EXCLUSIVE', 'Exclusive license with full commercial rights', 199.99, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
