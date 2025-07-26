import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase - usando la key anon
const supabaseUrl = 'https://xmtjzfnddkuxdertnriq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdGp6Zm5kZGt1eGRlcnRucmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NDc4NDIsImV4cCI6MjA2ODUyMzg0Mn0.1BAa2UMFA3CmDxJ8v5fwWvM0hTMu_GM90s_PHLzIi9c';

const supabase = createClient(supabaseUrl, supabaseKey);

// Datos simplificados para testing
const SAMPLE_DATA = {
  businesses: [
    {
      email: 'info@bellavistasalon.com.ar',
      full_name: 'Bella Vista Salon',
      company_name: 'Bella Vista Salon',
      description: 'Salón de belleza premium en Palermo',
      address: 'Av. Santa Fe 3847, Palermo',
      city: 'Buenos Aires',
      phone: '+54 11 4823-7456',
      website_url: 'https://bellavistasalon.com.ar',
      instagram_handle: 'bellavistasalon',
      industry: 'beauty',
      venue_type: 'salon'
    }
  ],
  creators: [
    {
      email: 'sofia.martinez.beauty@gmail.com',
      full_name: 'Sofía Martínez',
      username: 'sofia_beauty_arg',
      bio: 'Beauty influencer porteña 💄✨',
      instagram_handle: 'sofia_beauty_arg',
      tiktok_handle: 'sofiabeauty',
      followers_instagram: 45000,
      followers_tiktok: 23000,
      specialties: ['belleza', 'maquillaje', 'skincare'],
      engagement_rate: 4.8,
      location: 'Buenos Aires, Argentina',
      avatar_url: 'https://images.unsplash.com/photo-1549444934-3914051bc6b6?w=400'
    }
  ]
};

async function insertSampleData() {
  console.log('🚀 Insertando datos de muestra...');
  
  try {
    // 1. Insertar un business user de muestra
    console.log('📊 Creando usuario de negocio...');
    
    const businessData = SAMPLE_DATA.businesses[0];
    
    // Usar upsert para evitar duplicados
    const { data: businessUser, error: businessUserError } = await supabase
      .from('users')
      .upsert({
        email: businessData.email,
        full_name: businessData.full_name,
        role: 'business'
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (businessUserError) {
      console.error('Error creando usuario de negocio:', businessUserError);
    } else {
      console.log('✅ Usuario de negocio creado:', businessUser.email);
      
      // Crear perfil de negocio
      const { data: businessProfile, error: businessProfileError } = await supabase
        .from('business_profiles')
        .upsert({
          user_id: businessUser.id,
          company_name: businessData.company_name,
          description: businessData.description,
          address: businessData.address,
          city: businessData.city,
          phone: businessData.phone,
          email: businessData.email,
          website_url: businessData.website_url,
          instagram_handle: businessData.instagram_handle,
          industry: businessData.industry,
          venue_type: businessData.venue_type,
          is_beauty_pass_partner: true
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (businessProfileError) {
        console.error('Error creando perfil de negocio:', businessProfileError);
      } else {
        console.log('✅ Perfil de negocio creado');
        
        // Crear venue
        const { data: venue, error: venueError } = await supabase
          .from('venues')
          .upsert({
            business_profile_id: businessProfile.id,
            name: businessData.company_name,
            category: businessData.venue_type,
            description: businessData.description,
            address: businessData.address,
            city: businessData.city,
            phone: businessData.phone,
            email: businessData.email,
            website_url: businessData.website_url,
            instagram_handle: businessData.instagram_handle,
            operating_hours: {
              monday: "09:00-19:00",
              tuesday: "09:00-19:00", 
              wednesday: "09:00-19:00",
              thursday: "09:00-19:00",
              friday: "09:00-20:00",
              saturday: "09:00-18:00",
              sunday: "closed"
            },
            amenities: ["wifi", "aire_acondicionado", "estacionamiento"],
            images: ["https://images.unsplash.com/photo-1631408946577-25526c0d307e?w=800"],
            is_verified: true,
            is_active: true,
            average_rating: 4.8,
            total_reviews: 42
          }, {
            onConflict: 'business_profile_id'
          })
          .select()
          .single();

        if (venueError) {
          console.error('Error creando venue:', venueError);
        } else {
          console.log('✅ Venue creado');
        }
      }
    }

    // 2. Insertar un creator user de muestra
    console.log('👩‍💼 Creando usuario creador...');
    
    const creatorData = SAMPLE_DATA.creators[0];
    
    const { data: creatorUser, error: creatorUserError } = await supabase
      .from('users')
      .upsert({
        email: creatorData.email,
        full_name: creatorData.full_name,
        avatar_url: creatorData.avatar_url,
        role: 'creator'
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (creatorUserError) {
      console.error('Error creando usuario creador:', creatorUserError);
    } else {
      console.log('✅ Usuario creador creado:', creatorUser.email);
      
      // Crear perfil de creador
      const { data: creatorProfile, error: creatorProfileError } = await supabase
        .from('creator_profiles')
        .upsert({
          user_id: creatorUser.id,
          username: creatorData.username,
          bio: creatorData.bio,
          instagram_handle: creatorData.instagram_handle,
          tiktok_handle: creatorData.tiktok_handle,
          followers_instagram: creatorData.followers_instagram,
          followers_tiktok: creatorData.followers_tiktok,
          specialties: creatorData.specialties,
          engagement_rate: creatorData.engagement_rate,
          location: creatorData.location,
          portfolio_images: [creatorData.avatar_url],
          urscore: 850,
          is_verified: true,
          beauty_pass_member_since: new Date().toISOString(),
          membership_tier: 'premium'
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (creatorProfileError) {
        console.error('Error creando perfil de creador:', creatorProfileError);
      } else {
        console.log('✅ Perfil de creador creado');
      }
    }

    // Verificar resultados
    const { data: users } = await supabase.from('users').select('*');
    const { data: businesses } = await supabase.from('business_profiles').select('*');
    const { data: creators } = await supabase.from('creator_profiles').select('*');
    const { data: venues } = await supabase.from('venues').select('*');

    console.log('📊 Resumen final:');
    console.log(`   - ${users?.length || 0} usuarios totales`);
    console.log(`   - ${businesses?.length || 0} negocios`);
    console.log(`   - ${creators?.length || 0} creadores`);
    console.log(`   - ${venues?.length || 0} venues`);

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Ejecutar
insertSampleData().then(() => {
  console.log('🎉 Proceso completado');
  process.exit(0);
}).catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});