-- Script para poblar la base de datos con datos de ejemplo
-- Se ejecuta directamente en Supabase SQL Editor

-- Deshabilitar RLS temporalmente para insertar datos
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;

-- Insertar usuarios de negocio
INSERT INTO public.users (id, email, full_name, role, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'info@bellavistasalon.com.ar', 'Bella Vista Salon', 'business', NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'reservas@zenspa.com.ar', 'Zen Spa & Wellness', 'business', NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'hola@glowbeauty.com.ar', 'Glow Beauty Studio', 'business', NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'info@urbanfitness.com.ar', 'Urban Fitness Club', 'business', NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', 'reservas@sakuraspa.com.ar', 'Sakura Wellness Spa', 'business', NOW());

-- Insertar perfiles de negocio
INSERT INTO public.business_profiles (
  user_id, company_name, description, industry, address, city, phone, email, 
  website_url, instagram_handle, venue_type, is_beauty_pass_partner
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Bella Vista Salon',
    'Salón de belleza premium en Palermo con más de 10 años de experiencia. Especialistas en cortes modernos, coloración y tratamientos capilares.',
    'beauty',
    'Av. Santa Fe 3847, Palermo',
    'Buenos Aires',
    '+54 11 4823-7456',
    'info@bellavistasalon.com.ar',
    'https://bellavistasalon.com.ar',
    'bellavistasalon',
    'salon',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Zen Spa & Wellness',
    'Centro de relajación y bienestar en el corazón de Recoleta. Ofrecemos masajes terapéuticos, tratamientos faciales y experiencias de spa completas.',
    'wellness',
    'Av. Callao 1234, Recoleta',
    'Buenos Aires',
    '+54 11 4815-9234',
    'reservas@zenspa.com.ar',
    'https://zenspa.com.ar',
    'zenspa_bsas',
    'spa',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Glow Beauty Studio',
    'Estudio de belleza especializado en maquillaje profesional, pestañas y cejas. Perfecto para sesiones de fotos y eventos especiales.',
    'beauty',
    'Gurruchaga 1856, Villa Crick',
    'Buenos Aires',
    '+54 11 4773-2891',
    'hola@glowbeauty.com.ar',
    'https://glowbeauty.com.ar',
    'glow_beauty_studio',
    'beauty',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    'Urban Fitness Club',
    'Gimnasio boutique con entrenamientos personalizados y clases grupales. Ambiente motivador y equipamiento de última generación.',
    'fitness',
    'Av. Cabildo 2145, Belgrano',
    'Buenos Aires',
    '+54 11 4702-5567',
    'info@urbanfitness.com.ar',
    'https://urbanfitness.com.ar',
    'urban_fitness_club',
    'fitness',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440005',
    'Sakura Wellness Spa',
    'Spa asiático con tratamientos tradicionales japoneses y coreanos. Experiencias únicas de relajación y cuidado personal.',
    'wellness',
    'Av. del Libertador 5678, Núñez',
    'Buenos Aires',
    '+54 11 4780-3421',
    'reservas@sakuraspa.com.ar',
    'https://sakuraspa.com.ar',
    'sakura_wellness',
    'spa',
    true
  );

-- Insertar venues
INSERT INTO public.venues (
  business_profile_id, name, category, description, address, city, phone, email,
  website_url, instagram_handle, operating_hours, amenities, images, is_verified, 
  is_active, average_rating, total_reviews
) VALUES
  (
    (SELECT id FROM business_profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'),
    'Bella Vista Salon',
    'salon',
    'Salón de belleza premium en Palermo con más de 10 años de experiencia. Especialistas en cortes modernos, coloración y tratamientos capilares.',
    'Av. Santa Fe 3847, Palermo',
    'Buenos Aires',
    '+54 11 4823-7456',
    'info@bellavistasalon.com.ar',
    'https://bellavistasalon.com.ar',
    'bellavistasalon',
    '{"monday": "09:00-19:00", "tuesday": "09:00-19:00", "wednesday": "09:00-19:00", "thursday": "09:00-19:00", "friday": "09:00-20:00", "saturday": "09:00-18:00", "sunday": "closed"}',
    '{"wifi", "aire_acondicionado", "estacionamiento", "accesible"}',
    '{"https://images.unsplash.com/photo-1631408946577-25526c0d307e?w=800", "https://images.unsplash.com/photo-1703792686930-9efa64a9c6c5?w=800"}',
    true,
    true,
    4.8,
    42
  ),
  (
    (SELECT id FROM business_profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440002'),
    'Zen Spa & Wellness',
    'spa',
    'Centro de relajación y bienestar en el corazón de Recoleta. Ofrecemos masajes terapéuticos, tratamientos faciales y experiencias de spa completas.',
    'Av. Callao 1234, Recoleta',
    'Buenos Aires',
    '+54 11 4815-9234',
    'reservas@zenspa.com.ar',
    'https://zenspa.com.ar',
    'zenspa_bsas',
    '{"monday": "09:00-19:00", "tuesday": "09:00-19:00", "wednesday": "09:00-19:00", "thursday": "09:00-19:00", "friday": "09:00-20:00", "saturday": "09:00-18:00", "sunday": "closed"}',
    '{"wifi", "aire_acondicionado", "estacionamiento", "accesible"}',
    '{"https://images.unsplash.com/photo-1505408702353-b4d628e05e4f?w=800"}',
    true,
    true,
    4.6,
    38
  ),
  (
    (SELECT id FROM business_profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440003'),
    'Glow Beauty Studio',
    'beauty',
    'Estudio de belleza especializado en maquillaje profesional, pestañas y cejas. Perfecto para sesiones de fotos y eventos especiales.',
    'Gurruchaga 1856, Villa Crick',
    'Buenos Aires',
    '+54 11 4773-2891',
    'hola@glowbeauty.com.ar',
    'https://glowbeauty.com.ar',
    'glow_beauty_studio',
    '{"monday": "09:00-19:00", "tuesday": "09:00-19:00", "wednesday": "09:00-19:00", "thursday": "09:00-19:00", "friday": "09:00-20:00", "saturday": "09:00-18:00", "sunday": "closed"}',
    '{"wifi", "aire_acondicionado", "estacionamiento", "accesible"}',
    '{"https://images.unsplash.com/photo-1633681138600-295fcd688876?w=800"}',
    true,
    true,
    4.9,
    51
  ),
  (
    (SELECT id FROM business_profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440004'),
    'Urban Fitness Club',
    'fitness',
    'Gimnasio boutique con entrenamientos personalizados y clases grupales. Ambiente motivador y equipamiento de última generación.',
    'Av. Cabildo 2145, Belgrano',
    'Buenos Aires',
    '+54 11 4702-5567',
    'info@urbanfitness.com.ar',
    'https://urbanfitness.com.ar',
    'urban_fitness_club',
    '{"monday": "06:00-22:00", "tuesday": "06:00-22:00", "wednesday": "06:00-22:00", "thursday": "06:00-22:00", "friday": "06:00-22:00", "saturday": "08:00-20:00", "sunday": "08:00-18:00"}',
    '{"wifi", "aire_acondicionado", "estacionamiento", "vestuarios", "duchas"}',
    '{"https://images.unsplash.com/photo-1706629506571-a6d86798916b?w=800"}',
    true,
    true,
    4.7,
    33
  ),
  (
    (SELECT id FROM business_profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440005'),
    'Sakura Wellness Spa',
    'spa',
    'Spa asiático con tratamientos tradicionales japoneses y coreanos. Experiencias únicas de relajación y cuidado personal.',
    'Av. del Libertador 5678, Núñez',
    'Buenos Aires',
    '+54 11 4780-3421',
    'reservas@sakuraspa.com.ar',
    'https://sakuraspa.com.ar',
    'sakura_wellness',
    '{"monday": "10:00-20:00", "tuesday": "10:00-20:00", "wednesday": "10:00-20:00", "thursday": "10:00-20:00", "friday": "10:00-21:00", "saturday": "09:00-19:00", "sunday": "10:00-18:00"}',
    '{"wifi", "aire_acondicionado", "estacionamiento", "accesible", "jardín"}',
    '{"https://images.unsplash.com/photo-1505408702353-b4d628e05e4f?w=800"}',
    true,
    true,
    4.9,
    67
  );

-- Insertar usuarios creadores
INSERT INTO public.users (id, email, full_name, avatar_url, role, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 'sofia.martinez.beauty@gmail.com', 'Sofía Martínez', 'https://images.unsplash.com/photo-1549444934-3914051bc6b6?w=400', 'creator', NOW()),
  ('550e8400-e29b-41d4-a716-446655440011', 'lucas.fitness.trainer@gmail.com', 'Lucas Rodríguez', 'https://images.unsplash.com/photo-1671395781342-fd36baf0eda3?w=400', 'creator', NOW()),
  ('550e8400-e29b-41d4-a716-446655440012', 'valentina.wellness@gmail.com', 'Valentina López', 'https://images.unsplash.com/photo-1591259318430-8359531696fc?w=400', 'creator', NOW()),
  ('550e8400-e29b-41d4-a716-446655440013', 'mia.style.argentina@gmail.com', 'Mía González', 'https://images.unsplash.com/photo-1555325083-60f59dcd852d?w=400', 'creator', NOW()),
  ('550e8400-e29b-41d4-a716-446655440014', 'nico.foodie.ba@gmail.com', 'Nicolás Fernández', 'https://images.unsplash.com/photo-1549444934-3914051bc6b6?w=400', 'creator', NOW());

-- Insertar perfiles de creadores
INSERT INTO public.creator_profiles (
  user_id, username, bio, instagram_handle, tiktok_handle, followers_instagram, 
  followers_tiktok, specialties, engagement_rate, location, portfolio_images, 
  urscore, is_verified, beauty_pass_member_since, membership_tier
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440010',
    'sofia_beauty_arg',
    'Beauty influencer porteña 💄✨ Makeup artist profesional | Tips de belleza | Colaboraciones con marcas premium 🇦🇷',
    'sofia_beauty_arg',
    'sofiabeauty',
    45000,
    23000,
    '{"belleza", "maquillaje", "skincare", "lifestyle"}',
    4.8,
    'Buenos Aires, Argentina',
    '{"https://images.unsplash.com/photo-1549444934-3914051bc6b6?w=400", "https://images.unsplash.com/photo-1631408946577-25526c0d307e?w=800"}',
    850,
    true,
    NOW(),
    'premium'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440011',
    'lucas_fitness_bsas',
    'Personal trainer 💪 | Fitness lifestyle | Transformaciones reales | Entrenamiento funcional en CABA',
    'lucas_fitness_bsas',
    'lucasfitness',
    32000,
    18000,
    '{"fitness", "entrenamiento", "nutrición", "lifestyle"}',
    5.2,
    'Buenos Aires, Argentina',
    '{"https://images.unsplash.com/photo-1671395781342-fd36baf0eda3?w=400"}',
    920,
    true,
    NOW(),
    'vip'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440012',
    'valentina_wellness',
    'Wellness coach 🧘‍♀️ | Yoga instructor | Vida saludable | Mindfulness y bienestar integral',
    'valentina_wellness',
    'valewellness',
    28000,
    15000,
    '{"wellness", "yoga", "meditación", "lifestyle"}',
    4.6,
    'Buenos Aires, Argentina',
    '{"https://images.unsplash.com/photo-1591259318430-8359531696fc?w=400"}',
    780,
    false,
    NOW(),
    'basic'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440013',
    'mia_style_arg',
    'Fashion & lifestyle 👗 | Tendencias porteñas | Street style BA | Amante del café y la moda',
    'mia_style_arg',
    'miastyle',
    52000,
    31000,
    '{"moda", "lifestyle", "beauty", "fotografía"}',
    5.1,
    'Buenos Aires, Argentina',
    '{"https://images.unsplash.com/photo-1555325083-60f59dcd852d?w=400"}',
    890,
    true,
    NOW(),
    'premium'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440014',
    'nico_foodie_ba',
    'Food blogger 🍕 | Descubriendo los mejores lugares de Buenos Aires | Gastronomía local | Reviews honestos',
    'nico_foodie_ba',
    'nicofoodieBA',
    38000,
    22000,
    '{"gastronomía", "restaurantes", "lifestyle", "reviews"}',
    4.9,
    'Buenos Aires, Argentina',
    '{"https://images.unsplash.com/photo-1549444934-3914051bc6b6?w=400"}',
    820,
    false,
    NOW(),
    'basic'
  );

-- Insertar ofertas
INSERT INTO public.offers (
  venue_id, title, description, type, category, original_value_ars, credit_cost,
  duration_minutes, content_requirements, available_days, available_time_slots,
  advance_booking_hours, cancellation_hours, is_featured, is_active, images
) VALUES
  -- Bella Vista Salon
  (
    (SELECT id FROM venues WHERE name = 'Bella Vista Salon'),
    'Corte + Peinado Premium',
    'Corte personalizado con análisis facial + peinado profesional. Incluye lavado con productos premium y asesoramiento de imagen.',
    'service',
    'beauty',
    8500,
    2,
    90,
    '{"posts": 2, "stories": 3, "mentions": ["@bellavistasalon", "#BellaVistaSalon"]}',
    '{1,2,3,4,5,6}',
    '{"09:00", "10:30", "12:00", "14:00", "15:30", "17:00"}',
    24,
    4,
    true,
    true,
    '{"https://images.unsplash.com/photo-1631408946577-25526c0d307e?w=800"}'
  ),
  (
    (SELECT id FROM venues WHERE name = 'Bella Vista Salon'),
    'Tratamiento Capilar Restaurador',
    'Tratamiento intensivo para cabello dañado con keratina y aceites naturales. Resultados visibles desde la primera sesión.',
    'service',
    'beauty',
    12000,
    3,
    120,
    '{"posts": 1, "stories": 2, "mentions": ["@bellavistasalon", "#TratamientoCapilar"]}',
    '{1,2,3,4,5,6}',
    '{"09:00", "10:30", "12:00", "14:00", "15:30", "17:00"}',
    24,
    4,
    false,
    true,
    '{"https://images.unsplash.com/photo-1703792686930-9efa64a9c6c5?w=800"}'
  ),
  -- Zen Spa & Wellness
  (
    (SELECT id FROM venues WHERE name = 'Zen Spa & Wellness'),
    'Masaje Relajante de 60min',
    'Masaje corporal completo con aceites aromáticos. Perfecta combinación de técnicas para liberar tensiones y estrés.',
    'service',
    'wellness',
    9500,
    2,
    60,
    '{"posts": 1, "stories": 3, "mentions": ["@zenspa_bsas", "#ZenSpa", "#Relax"]}',
    '{1,2,3,4,5,6}',
    '{"09:00", "10:30", "12:00", "14:00", "15:30", "17:00"}',
    24,
    4,
    true,
    true,
    '{"https://images.unsplash.com/photo-1505408702353-b4d628e05e4f?w=800"}'
  ),
  (
    (SELECT id FROM venues WHERE name = 'Zen Spa & Wellness'),
    'Facial Hidratante Premium',
    'Tratamiento facial profundo con productos orgánicos. Incluye limpieza, exfoliación, mascarilla e hidratación personalizada.',
    'service',
    'wellness',
    11000,
    3,
    75,
    '{"posts": 2, "stories": 2, "mentions": ["@zenspa_bsas", "#FacialPremium"]}',
    '{1,2,3,4,5,6}',
    '{"09:00", "10:30", "12:00", "14:00", "15:30", "17:00"}',
    24,
    4,
    false,
    true,
    '{"https://images.unsplash.com/photo-1505408702353-b4d628e05e4f?w=800"}'
  ),
  -- Glow Beauty Studio
  (
    (SELECT id FROM venues WHERE name = 'Glow Beauty Studio'),
    'Maquillaje Profesional + Fotos',
    'Sesión de maquillaje completa para eventos o sesiones fotográficas. Incluye mini sesión de fotos de 30 minutos.',
    'service',
    'beauty',
    15000,
    4,
    90,
    '{"posts": 3, "stories": 4, "mentions": ["@glow_beauty_studio", "#GlowMakeup"]}',
    '{1,2,3,4,5,6}',
    '{"09:00", "10:30", "12:00", "14:00", "15:30", "17:00"}',
    24,
    4,
    true,
    true,
    '{"https://images.unsplash.com/photo-1633681138600-295fcd688876?w=800"}'
  ),
  -- Urban Fitness Club
  (
    (SELECT id FROM venues WHERE name = 'Urban Fitness Club'),
    'Sesión Personal Training',
    'Entrenamiento personalizado de 60 minutos con entrenador certificado. Plan adaptado a tus objetivos específicos.',
    'service',
    'fitness',
    7000,
    2,
    60,
    '{"posts": 1, "stories": 3, "mentions": ["@urban_fitness_club", "#UrbanFitness"]}',
    '{1,2,3,4,5,6}',
    '{"06:00", "07:00", "08:00", "17:00", "18:00", "19:00", "20:00"}',
    24,
    4,
    false,
    true,
    '{"https://images.unsplash.com/photo-1706629506571-a6d86798916b?w=800"}'
  ),
  -- Sakura Wellness Spa
  (
    (SELECT id FROM venues WHERE name = 'Sakura Wellness Spa'),
    'Ritual Japonés Completo',
    'Experiencia spa tradicional japonesa de 2 horas. Incluye baño de sales, masaje shiatsu y ceremonia del té.',
    'experience',
    'wellness',
    18000,
    5,
    120,
    '{"posts": 2, "stories": 5, "mentions": ["@sakura_wellness", "#RitualJaponés", "#SakuraSpa"]}',
    '{1,2,3,4,5,6}',
    '{"10:00", "12:00", "14:00", "16:00"}',
    48,
    24,
    true,
    true,
    '{"https://images.unsplash.com/photo-1505408702353-b4d628e05e4f?w=800"}'
  );

-- Insertar membresías
INSERT INTO public.memberships (user_id, tier, status, monthly_credits, price_ars, start_date, auto_renew, payment_method) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 'premium', 'active', 20, 12000, CURRENT_DATE, true, 'mercado_pago'),
  ('550e8400-e29b-41d4-a716-446655440011', 'vip', 'active', 30, 15000, CURRENT_DATE, true, 'mercado_pago'),
  ('550e8400-e29b-41d4-a716-446655440012', 'basic', 'active', 10, 8000, CURRENT_DATE, true, 'mercado_pago'),
  ('550e8400-e29b-41d4-a716-446655440013', 'premium', 'active', 20, 12000, CURRENT_DATE, true, 'mercado_pago'),
  ('550e8400-e29b-41d4-a716-446655440014', 'basic', 'active', 10, 8000, CURRENT_DATE, true, 'mercado_pago');

-- Habilitar RLS nuevamente
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Mensaje de confirmación
SELECT 'Base de datos poblada exitosamente!' as mensaje;