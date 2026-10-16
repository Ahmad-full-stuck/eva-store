-- Replace only known demo placeholders. Preserve any merchant-managed image URLs.
UPDATE products SET image='https://images.unsplash.com/photo-1576597246752-5fb62f1dca74?auto=format&fit=crop&w=900&q=85',
  images_json='["https://images.unsplash.com/photo-1576597246752-5fb62f1dca74?auto=format&fit=crop&w=900&q=85"]',
  updated_at=datetime('now')
WHERE id='m02' AND image LIKE '%photo-1518831959646%';

UPDATE products SET image='https://images.unsplash.com/photo-1777397660834-67c6d0eabe15?auto=format&fit=crop&w=900&q=85',
  images_json='["https://images.unsplash.com/photo-1777397660834-67c6d0eabe15?auto=format&fit=crop&w=900&q=85"]',
  updated_at=datetime('now')
WHERE id='m04' AND image LIKE '%photo-1519689680058%';

UPDATE products SET image='https://images.unsplash.com/photo-1549588974-98aae09c3845?auto=format&fit=crop&w=900&q=85',
  images_json='["https://images.unsplash.com/photo-1549588974-98aae09c3845?auto=format&fit=crop&w=900&q=85"]',
  updated_at=datetime('now')
WHERE id='m07' AND image LIKE '%photo-1519238263530%';

UPDATE products SET image='https://images.unsplash.com/photo-1766918780917-dae0160c3442?auto=format&fit=crop&w=900&q=85',
  images_json='["https://images.unsplash.com/photo-1766918780917-dae0160c3442?auto=format&fit=crop&w=900&q=85"]',
  updated_at=datetime('now')
WHERE id='m08' AND image LIKE '%photo-1519689680058%';

UPDATE categories SET image='https://images.unsplash.com/photo-1576597246752-5fb62f1dca74?auto=format&fit=crop&w=900&q=85'
WHERE id='girls' AND image LIKE '%photo-1518831959646%';

UPDATE categories SET image='https://images.unsplash.com/photo-1777397660834-67c6d0eabe15?auto=format&fit=crop&w=900&q=85'
WHERE id='baby' AND image LIKE '%photo-1519689680058%';

UPDATE categories SET image='https://images.unsplash.com/photo-1549588974-98aae09c3845?auto=format&fit=crop&w=900&q=85'
WHERE id='sets' AND image LIKE '%photo-1519238263530%';
