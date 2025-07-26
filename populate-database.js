import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Configuración de Supabase
const supabaseUrl = 'https://xmtjzfnddkuxdertnriq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdGp6Zm5kZGt1eGRlcnRucmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NDc4NDIsImV4cCI6MjA2ODUyMzg0Mn0.1BAa2UMFA3CmDxJ8v5fwWvM0hTMu_GM90s_PHLzIi9c';

const supabase = createClient(supabaseUrl, supabaseKey);

// URLs de imágenes obtenidas
const SALON_IMAGES = [
  'https://images.unsplash.com/photo-1631408946577-25526c0d307e?w=800',
  'https://images.unsplash.com/photo-1703792686930-9efa64a9c6c5?w=800',
  'https://images.unsplash.com/photo-1633681138600-295fcd688876?w=800',
  'https://images.unsplash.com/photo-1633681140152-3b8726450518?w=800',
  'https://images.unsplash.com/photo-1706629506571-a6d86798916b?w=800'
];

const SPA_IMAGES = [
  'https://images.unsplash.com/photo-1505408702353-b4d628e05e4f?w=800',
  'https://plus.unsplash.com/premium_photo-1676677516331-8c152c715c82?w=800',
  '/Users/gerardo/Downloads/mcp-fetch/2025-07-26/merged/unsplash_com_16-30-27-065Z_0.jpg'
];

const CREATOR_IMAGES = [
  'https://images.unsplash.com/photo-1549444934-3914051bc6b6?w=400',
  'https://images.unsplash.com/photo-1671395781342-fd36baf0eda3?w=400',
  'https://images.unsplash.com/photo-1591259318430-8359531696fc?w=400',
  'https://images.unsplash.com/photo-1555325083-60f59dcd852d?w=400',
  '/Users/gerardo/Downloads/mcp-fetch/2025-07-26/merged/unsplash_com_16-30-52-884Z_0.jpg'
];

// Datos realistas para Argentina
const BUSINESS_DATA = [
  {
    company_name: "Bella Vista Salon",
    description: "Salón de belleza premium en Palermo con más de 10 años de experiencia. Especialistas en cortes modernos, coloración y tratamientos capilares.",
    address: "Av. Santa Fe 3847, Palermo",
    city: "Buenos Aires",
    phone: "+54 11 4823-7456",
    email: "info@bellavistasalon.com.ar",
    website_url: "https://bellavistasalon.com.ar",
    instagram_handle: "bellavistasalon",
    industry: "beauty",
    venue_type: "salon",
    images: [SALON_IMAGES[0], SALON_IMAGES[1]]
  },
  {
    company_name: "Zen Spa & Wellness",
    description: "Centro de relajación y bienestar en el corazón de Recoleta. Ofrecemos masajes terapéuticos, tratamientos faciales y experiencias de spa completas.",
    address: "Av. Callao 1234, Recoleta",
    city: "Buenos Aires", 
    phone: "+54 11 4815-9234",
    email: "reservas@zenspa.com.ar",
    website_url: "https://zenspa.com.ar",
    instagram_handle: "zenspa_bsas",
    industry: "wellness",
    venue_type: "spa",
    images: [SPA_IMAGES[0], SPA_IMAGES[1]]
  },
  {
    company_name: "Glow Beauty Studio",
    description: "Estudio de belleza especializado en maquillaje profesional, pestañas y cejas. Perfecto para sesiones de fotos y eventos especiales.",
    address: "Gurruchaga 1856, Villa Crick",
    city: "Buenos Aires",
    phone: "+54 11 4773-2891",
    email: "hola@glowbeauty.com.ar",
    website_url: "https://glowbeauty.com.ar",
    instagram_handle: "glow_beauty_studio",
    industry: "beauty",
    venue_type: "beauty",
    images: [SALON_IMAGES[2], SALON_IMAGES[3]]
  },
  {
    company_name: "Urban Fitness Club",
    description: "Gimnasio boutique con entrenamientos personalizados y clases grupales. Ambiente motivador y equipamiento de última generación.",
    address: "Av. Cabildo 2145, Belgrano",
    city: "Buenos Aires",
    phone: "+54 11 4702-5567",
    email: "info@urbanfitness.com.ar",
    website_url: "https://urbanfitness.com.ar",
    instagram_handle: "urban_fitness_club",
    industry: "fitness",
    venue_type: "fitness",
    images: [SALON_IMAGES[4]]
  },
  {
    company_name: "Sakura Wellness Spa",
    description: "Spa asiático con tratamientos tradicionales japoneses y coreanos. Experiencias únicas de relajación y cuidado personal.",
    address: "Av. del Libertador 5678, Núñez",
    city: "Buenos Aires",
    phone: "+54 11 4780-3421",
    email: "reservas@sakuraspa.com.ar",
    website_url: "https://sakuraspa.com.ar",
    instagram_handle: "sakura_wellness",
    industry: "wellness",
    venue_type: "spa",
    images: [SPA_IMAGES[2]]
  }
];

const CREATOR_DATA = [
  {
    username: "sofia_beauty_arg",
    full_name: "Sofía Martínez",
    bio: "Beauty influencer porteña 💄✨ Makeup artist profesional | Tips de belleza | Colaboraciones con marcas premium 🇦🇷",
    email: "sofia.martinez.beauty@gmail.com",
    instagram_handle: "sofia_beauty_arg",
    tiktok_handle: "sofiabeauty",
    followers_instagram: 45000,
    followers_tiktok: 23000,
    specialties: ["belleza", "maquillaje", "skincare", "lifestyle"],
    engagement_rate: 4.8,
    location: "Buenos Aires, Argentina",
    avatar_url: CREATOR_IMAGES[0],
    portfolio_images: [CREATOR_IMAGES[0], SALON_IMAGES[0], SALON_IMAGES[1]]
  },
  {
    username: "lucas_fitness_bsas",
    full_name: "Lucas Rodríguez",
    bio: "Personal trainer 💪 | Fitness lifestyle | Transformaciones reales | Entrenamiento funcional en CABA",
    email: "lucas.fitness.trainer@gmail.com",
    instagram_handle: "lucas_fitness_bsas",
    tiktok_handle: "lucasfitness",
    followers_instagram: 32000,
    followers_tiktok: 18000,
    specialties: ["fitness", "entrenamiento", "nutrición", "lifestyle"],
    engagement_rate: 5.2,
    location: "Buenos Aires, Argentina",
    avatar_url: CREATOR_IMAGES[1],
    portfolio_images: [CREATOR_IMAGES[1], SALON_IMAGES[2]]
  },
  {
    username: "valentina_wellness",
    full_name: "Valentina López",
    bio: "Wellness coach 🧘‍♀️ | Yoga instructor | Vida saludable | Mindfulness y bienestar integral",
    email: "valentina.wellness@gmail.com",
    instagram_handle: "valentina_wellness",
    tiktok_handle: "valewellness",
    followers_instagram: 28000,
    followers_tiktok: 15000,
    specialties: ["wellness", "yoga", "meditación", "lifestyle"],
    engagement_rate: 4.6,
    location: "Buenos Aires, Argentina",
    avatar_url: CREATOR_IMAGES[2],
    portfolio_images: [CREATOR_IMAGES[2], SPA_IMAGES[0]]
  },
  {
    username: "mia_style_arg",
    full_name: "Mía González",
    bio: "Fashion & lifestyle 👗 | Tendencias porteñas | Street style BA | Amante del café y la moda",
    email: "mia.style.argentina@gmail.com",
    instagram_handle: "mia_style_arg",
    tiktok_handle: "miastyle",
    followers_instagram: 52000,
    followers_tiktok: 31000,
    specialties: ["moda", "lifestyle", "beauty", "fotografía"],
    engagement_rate: 5.1,
    location: "Buenos Aires, Argentina",
    avatar_url: CREATOR_IMAGES[3],
    portfolio_images: [CREATOR_IMAGES[3], SALON_IMAGES[3], SALON_IMAGES[4]]
  },
  {
    username: "nico_foodie_ba",
    full_name: "Nicolás Fernández",
    bio: "Food blogger 🍕 | Descubriendo los mejores lugares de Buenos Aires | Gastronomía local | Reviews honestos",
    email: "nico.foodie.ba@gmail.com",
    instagram_handle: "nico_foodie_ba",
    tiktok_handle: "nicofoodieBA",
    followers_instagram: 38000,
    followers_tiktok: 22000,
    specialties: ["gastronomía", "restaurantes", "lifestyle", "reviews"],
    engagement_rate: 4.9,
    location: "Buenos Aires, Argentina",
    avatar_url: CREATOR_IMAGES[4],
    portfolio_images: [CREATOR_IMAGES[4]]
  }
];

const OFFERS_DATA = [
  // Bella Vista Salon
  {
    title: "Corte + Peinado Premium",
    description: "Corte personalizado con análisis facial + peinado profesional. Incluye lavado con productos premium y asesoramiento de imagen.",
    type: "service",
    category: "beauty",
    original_value_ars: 8500,
    credit_cost: 2,
    duration_minutes: 90,
    content_requirements: {
      posts: 2,
      stories: 3,
      mentions: ["@bellavistasalon", "#BellaVistaSalon"]
    }
  },
  {
    title: "Tratamiento Capilar Restaurador",
    description: "Tratamiento intensivo para cabello dañado con keratina y aceites naturales. Resultados visibles desde la primera sesión.",
    type: "service", 
    category: "beauty",
    original_value_ars: 12000,
    credit_cost: 3,
    duration_minutes: 120,
    content_requirements: {
      posts: 1,
      stories: 2,
      mentions: ["@bellavistasalon", "#TratamientoCapilar"]
    }
  },
  // Zen Spa & Wellness
  {
    title: "Masaje Relajante de 60min",
    description: "Masaje corporal completo con aceites aromáticos. Perfecta combinación de técnicas para liberar tensiones y estrés.",
    type: "service",
    category: "wellness",
    original_value_ars: 9500,
    credit_cost: 2,
    duration_minutes: 60,
    content_requirements: {
      posts: 1,
      stories: 3,
      mentions: ["@zenspa_bsas", "#ZenSpa", "#Relax"]
    }
  },
  {
    title: "Facial Hidratante Premium",
    description: "Tratamiento facial profundo con productos orgánicos. Incluye limpieza, exfoliación, mascarilla y hidratación personalizada.",
    type: "service",
    category: "wellness",
    original_value_ars: 11000,
    credit_cost: 3,
    duration_minutes: 75,
    content_requirements: {
      posts: 2,
      stories: 2,
      mentions: ["@zenspa_bsas", "#FacialPremium"]
    }
  },
  // Glow Beauty Studio
  {
    title: "Maquillaje Profesional + Fotos",
    description: "Sesión de maquillaje completa para eventos o sesiones fotográficas. Incluye mini sesión de fotos de 30 minutos.",
    type: "service",
    category: "beauty",
    original_value_ars: 15000,
    credit_cost: 4,
    duration_minutes: 90,
    content_requirements: {
      posts: 3,
      stories: 4,
      mentions: ["@glow_beauty_studio", "#GlowMakeup"]
    }
  },
  // Urban Fitness Club
  {
    title: "Sesión Personal Training",
    description: "Entrenamiento personalizado de 60 minutos con entrenador certificado. Plan adaptado a tus objetivos específicos.",
    type: "service",
    category: "fitness",
    original_value_ars: 7000,
    credit_cost: 2,
    duration_minutes: 60,
    content_requirements: {
      posts: 1,
      stories: 3,
      mentions: ["@urban_fitness_club", "#UrbanFitness"]
    }
  },
  // Sakura Wellness Spa
  {
    title: "Ritual Japonés Completo",
    description: "Experiencia spa tradicional japonesa de 2 horas. Incluye baño de sales, masaje shiatsu y ceremonia del té.",
    type: "experience",
    category: "wellness", 
    original_value_ars: 18000,
    credit_cost: 5,
    duration_minutes: 120,
    content_requirements: {
      posts: 2,
      stories: 5,
      mentions: ["@sakura_wellness", "#RitualJaponés", "#SakuraSpa"]
    }
  }
];

async function populateDatabase() {
  console.log('🚀 Iniciando población de la base de datos...');
  
  try {
    // 1. Crear usuarios y perfiles de negocio
    console.log('📊 Creando perfiles de negocios...');
    const businessUsers = [];
    
    for (const business of BUSINESS_DATA) {
      // Crear usuario
      const userId = randomUUID();
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: business.email,
          full_name: business.company_name,
          role: 'business',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creando usuario:', userError);
        continue;
      }

      // Crear perfil de negocio
      const { data: businessProfile, error: businessError } = await supabase
        .from('business_profiles')
        .insert({
          user_id: userId,
          company_name: business.company_name,
          description: business.description,
          industry: business.industry,
          address: business.address,
          city: business.city,
          phone: business.phone,
          email: business.email,
          website_url: business.website_url,
          instagram_handle: business.instagram_handle,
          venue_type: business.venue_type,
          is_beauty_pass_partner: true
        })
        .select()
        .single();

      if (businessError) {
        console.error('Error creando perfil de negocio:', businessError);
        continue;
      }

      businessUsers.push({ ...userData, business_profile: businessProfile, businessData: business });
    }

    // 2. Crear venues
    console.log('🏢 Creando venues...');
    const venues = [];
    
    for (const businessUser of businessUsers) {
      const { data: venue, error: venueError } = await supabase
        .from('venues')
        .insert({
          business_profile_id: businessUser.business_profile.id,
          name: businessUser.businessData.company_name,
          category: businessUser.businessData.venue_type,
          description: businessUser.businessData.description,
          address: businessUser.businessData.address,
          city: businessUser.businessData.city,
          phone: businessUser.businessData.phone,
          email: businessUser.businessData.email,
          website_url: businessUser.businessData.website_url,
          instagram_handle: businessUser.businessData.instagram_handle,
          images: businessUser.businessData.images,
          operating_hours: {
            monday: "09:00-19:00",
            tuesday: "09:00-19:00", 
            wednesday: "09:00-19:00",
            thursday: "09:00-19:00",
            friday: "09:00-20:00",
            saturday: "09:00-18:00",
            sunday: "closed"
          },
          amenities: ["wifi", "aire_acondicionado", "estacionamiento", "accesible"],
          is_verified: true,
          is_active: true,
          average_rating: 4.5 + Math.random() * 0.5,
          total_reviews: Math.floor(Math.random() * 50) + 20
        })
        .select()
        .single();

      if (venueError) {
        console.error('Error creando venue:', venueError);
        continue;
      }

      venues.push({ ...venue, businessUser });
    }

    // 3. Crear usuarios creadores
    console.log('👩‍💼 Creando perfiles de creadores...');
    const creators = [];

    for (const creator of CREATOR_DATA) {
      // Crear usuario
      const userId = randomUUID();
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: creator.email,
          full_name: creator.full_name,
          avatar_url: creator.avatar_url,
          role: 'creator',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creando usuario creador:', userError);
        continue;
      }

      // Crear perfil de creador
      const { data: creatorProfile, error: creatorError } = await supabase
        .from('creator_profiles')
        .insert({
          user_id: userId,
          username: creator.username,
          bio: creator.bio,
          instagram_handle: creator.instagram_handle,
          tiktok_handle: creator.tiktok_handle,
          followers_instagram: creator.followers_instagram,
          followers_tiktok: creator.followers_tiktok,
          specialties: creator.specialties,
          engagement_rate: creator.engagement_rate,
          location: creator.location,
          portfolio_images: creator.portfolio_images,
          urscore: Math.floor(Math.random() * 300) + 700,
          is_verified: Math.random() > 0.5,
          beauty_pass_member_since: new Date().toISOString(),
          membership_tier: ['basic', 'premium', 'vip'][Math.floor(Math.random() * 3)]
        })
        .select()
        .single();

      if (creatorError) {
        console.error('Error creando perfil de creador:', creatorError);
        continue;
      }

      creators.push({ ...userData, creator_profile: creatorProfile });
    }

    // 4. Crear ofertas para cada venue
    console.log('🎁 Creando ofertas...');
    const offers = [];
    
    for (let i = 0; i < venues.length; i++) {
      const venue = venues[i];
      const venueOffers = OFFERS_DATA.filter(offer => {
        if (venue.category === 'salon' || venue.category === 'beauty') {
          return offer.category === 'beauty';
        }
        if (venue.category === 'spa') {
          return offer.category === 'wellness';
        }
        if (venue.category === 'fitness') {
          return offer.category === 'fitness';
        }
        return true;
      });

      for (const offerData of venueOffers.slice(0, 2)) { // Máximo 2 ofertas por venue
        const { data: offer, error: offerError } = await supabase
          .from('offers')
          .insert({
            venue_id: venue.id,
            title: offerData.title,
            description: offerData.description,
            type: offerData.type,
            category: offerData.category,
            original_value_ars: offerData.original_value_ars,
            credit_cost: offerData.credit_cost,
            duration_minutes: offerData.duration_minutes,
            content_requirements: offerData.content_requirements,
            available_days: [1, 2, 3, 4, 5, 6], // Lunes a sábado
            available_time_slots: ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"],
            advance_booking_hours: 24,
            cancellation_hours: 4,
            is_featured: Math.random() > 0.7,
            is_active: true,
            images: [venue.images[0]]
          })
          .select()
          .single();

        if (offerError) {
          console.error('Error creando oferta:', offerError);
          continue;
        }

        offers.push(offer);
      }
    }

    // 5. Crear membresías para los creadores
    console.log('💳 Creando membresías...');
    const membershipTiers = {
      basic: { price: 8000, credits: 10 },
      premium: { price: 12000, credits: 20 },
      vip: { price: 15000, credits: 30 }
    };

    for (const creator of creators) {
      const tier = creator.creator_profile.membership_tier;
      const { error: membershipError } = await supabase
        .from('memberships')
        .insert({
          user_id: creator.id,
          tier: tier,
          status: 'active',
          monthly_credits: membershipTiers[tier].credits,
          price_ars: membershipTiers[tier].price,
          start_date: new Date().toISOString().split('T')[0],
          auto_renew: true,
          payment_method: 'mercado_pago'
        });

      if (membershipError) {
        console.error('Error creando membresía:', membershipError);
      }

      // Agregar créditos iniciales
      const { error: creditsError } = await supabase.rpc('add_credits_to_balance', {
        target_user_id: creator.id,
        credit_amount: membershipTiers[tier].credits,
        transaction_type: 'purchase',
        description_text: `Créditos iniciales de membresía ${tier}`
      });

      if (creditsError) {
        console.error('Error agregando créditos:', creditsError);
      }
    }

    // 6. Crear algunas reservas de ejemplo
    console.log('📅 Creando reservas de ejemplo...');
    for (let i = 0; i < Math.min(creators.length, offers.length); i++) {
      const creator = creators[i];
      const offer = offers[i];
      
      // Fecha futura aleatoria
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 1);
      
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert({
          user_id: creator.id,
          offer_id: offer.id,
          venue_id: offer.venue_id,
          status: 'booked',
          credits_used: offer.credit_cost,
          scheduled_date: futureDate.toISOString().split('T')[0],
          scheduled_time: "14:00",
          guest_count: 1,
          special_requests: "Primera vez en el venue, muy emocionada por la experiencia!"
        })
        .select()
        .single();

      if (reservationError) {
        console.error('Error creando reserva:', reservationError);
        continue;
      }

      // Retener créditos para la reserva
      const { error: holdError } = await supabase.rpc('hold_credits_for_reservation', {
        target_user_id: creator.id,
        credit_amount: offer.credit_cost,
        reservation_id: reservation.id,
        description_text: `Depósito reembolsable para ${offer.title}`
      });

      if (holdError) {
        console.error('Error reteniendo créditos:', holdError);
      }
    }

    console.log('✅ ¡Base de datos poblada exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - ${businessUsers.length} negocios creados`);
    console.log(`   - ${venues.length} venues creados`);
    console.log(`   - ${creators.length} creadores creados`);
    console.log(`   - ${offers.length} ofertas creadas`);
    console.log(`   - Reservas y membresías de ejemplo creadas`);

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
  }
}

// Ejecutar el script
populateDatabase().then(() => {
  console.log('🎉 Proceso completado');
  process.exit(0);
}).catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});