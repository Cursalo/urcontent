// Script para inicializar los logros por defecto
// Ejecutar este script una vez para configurar los logros en la base de datos

const initializeAchievements = async () => {
  try {
    const response = await fetch('/api/achievements/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Logros inicializados correctamente');
      console.log('Los siguientes logros están ahora disponibles:');
      console.log('- 🎯 Primer Paso: Inscríbete en tu primer curso');
      console.log('- 📚 Aprendiz: Completa tu primera lección');
      console.log('- 🎓 Graduado: Completa tu primer curso');
      console.log('- 🔥 Constante: Mantén una racha de 7 días');
      console.log('- 💪 Dedicado: Mantén una racha de 30 días');
      console.log('- 🦉 Búho Nocturno: Completa una lección después de las 10 PM');
      console.log('- 🐦 Madrugador: Completa una lección antes de las 8 AM');
      console.log('- 🧠 Maestro de Quizzes: Obtén 100% en 5 quizzes');
      console.log('- 🏆 Coleccionista: Completa 5 cursos');
      console.log('- 🔍 Buscador de Conocimiento: Completa 100 lecciones');
      console.log('- 👑 Leyenda: Completa 10 cursos');
    } else {
      console.error('❌ Error al inicializar logros:', result.message);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
};

// Ejecutar si se llama directamente
if (typeof window !== 'undefined') {
  // En el navegador
  window.initializeAchievements = initializeAchievements;
  console.log('Función initializeAchievements disponible. Ejecuta initializeAchievements() para inicializar los logros.');
} else {
  // En Node.js (si se ejecuta desde servidor)
  initializeAchievements();
} 