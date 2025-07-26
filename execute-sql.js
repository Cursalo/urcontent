import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Configuración de Supabase
const supabaseUrl = 'https://xmtjzfnddkuxdertnriq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdGp6Zm5kZGt1eGRlcnRucmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NDc4NDIsImV4cCI6MjA2ODUyMzg0Mn0.1BAa2UMFA3CmDxJ8v5fwWvM0hTMu_GM90s_PHLzIi9c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLScript() {
  console.log('🚀 Ejecutando script SQL...');
  
  try {
    // Leer el archivo SQL
    const sqlScript = readFileSync('insert-sample-data.sql', 'utf8');
    
    // Ejecutar el script completo
    const { data, error } = await supabase.rpc('exec', {
      sql: sqlScript
    });

    if (error) {
      console.error('❌ Error ejecutando SQL:', error);
      
      // Intentar ejecutar por partes si falla
      console.log('🔄 Intentando ejecutar por partes...');
      
      // Dividir el script en secciones
      const sections = sqlScript.split(';').filter(section => section.trim().length > 0);
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i].trim() + ';';
        if (section.length > 1) {
          console.log(`Ejecutando sección ${i + 1}/${sections.length}...`);
          
          const { error: sectionError } = await supabase.rpc('exec', {
            sql: section
          });
          
          if (sectionError) {
            console.warn(`⚠️ Error en sección ${i + 1}:`, sectionError.message);
            // Continuar con la siguiente sección
          }
        }
      }
    } else {
      console.log('✅ Script SQL ejecutado exitosamente!');
      console.log('Resultado:', data);
    }

    // Verificar que los datos se insertaron
    const { data: users } = await supabase.from('users').select('*').limit(5);
    const { data: venues } = await supabase.from('venues').select('*').limit(5);
    const { data: creators } = await supabase.from('creator_profiles').select('*').limit(5);
    
    console.log('📊 Verificación:');
    console.log(`   - ${users?.length || 0} usuarios creados`);
    console.log(`   - ${venues?.length || 0} venues creados`);
    console.log(`   - ${creators?.length || 0} creadores creados`);
    
  } catch (error) {
    console.error('💥 Error fatal:', error);
  }
}

// Ejecutar el script
executeSQLScript().then(() => {
  console.log('🎉 Proceso completado');
  process.exit(0);
}).catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});