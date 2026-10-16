-- Correct the first demo-image pass using verified clothing-specific Unsplash images.
-- Update only known demo placeholders, never images a store owner has replaced.
UPDATE products SET
  image='https://images.unsplash.com/photo-1576597246752-5fb62f1dca74?auto=format&fit=crop&w=900&q=85',
  images_json='["https://images.unsplash.com/photo-1576597246752-5fb62f1dca74?auto=format&fit=crop&w=900&q=85"]',
  updated_at=datetime('now')
WHERE id='m02' AND image LIKE '%photo-1566454544259-f4b94c3d758c%';

UPDATE products SET
  image='https://images.unsplash.com/photo-1549588974-98aae09c3845?auto=format&fit=crop&w=900&q=85',
  images_json='["https://images.unsplash.com/photo-1549588974-98aae09c3845?auto=format&fit=crop&w=900&q=85"]',
  updated_at=datetime('now')
WHERE id='m07' AND image LIKE '%photo-1682802739047-24fa5d983e71%';

UPDATE products SET
  image='https://images.unsplash.com/photo-1766918780917-dae0160c3442?auto=format&fit=crop&w=900&q=85',
  images_json='["https://images.unsplash.com/photo-1766918780917-dae0160c3442?auto=format&fit=crop&w=900&q=85"]',
  updated_at=datetime('now')
WHERE id='m08' AND image LIKE '%photo-1560859259-fcf2b952aed8%';

UPDATE categories SET
  image='https://images.unsplash.com/photo-1576597246752-5fb62f1dca74?auto=format&fit=crop&w=900&q=85'
WHERE id='girls' AND image LIKE '%photo-1566454544259-f4b94c3d758c%';

UPDATE categories SET
  image='https://images.unsplash.com/photo-1549588974-98aae09c3845?auto=format&fit=crop&w=900&q=85'
WHERE id='sets' AND image LIKE '%photo-1682802739047-24fa5d983e71%';
