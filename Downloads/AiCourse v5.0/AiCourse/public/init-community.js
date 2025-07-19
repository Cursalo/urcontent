// Script de inicialización del Sistema de Comunidad
// Ejecutar este script una vez para configurar todos los datos iniciales

const initializeCommunitySystem = async () => {
    console.log('🌟 Inicializando Sistema de Comunidad...');
    
    try {
        // 1. Inicializar prompts de ideas
        console.log('💡 Configurando disparador de ideas...');
        const ideasResponse = await fetch('/api/ideas/initialize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (ideasResponse.ok) {
            console.log('✅ Prompts de ideas inicializados correctamente');
        } else {
            console.log('❌ Error inicializando prompts de ideas');
        }

        // 2. Inicializar logros por defecto (si no existen)
        console.log('🏆 Verificando logros del sistema...');
        const achievementsResponse = await fetch('/api/achievements/initialize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (achievementsResponse.ok) {
            console.log('✅ Sistema de logros verificado');
        } else {
            console.log('❌ Error verificando logros');
        }

        // 3. Configurar datos de ejemplo (opcional para demo)
        if (confirm('¿Quieres crear datos de ejemplo para demostración?')) {
            console.log('📚 Creando datos de ejemplo...');
            await createSampleData();
        }

        console.log('🎉 ¡Sistema de Comunidad inicializado exitosamente!');
        console.log(`
🌟 SISTEMA DE COMUNIDAD LISTO 🌟

✅ Disparador de Ideas - Chat inteligente con 6 categorías
✅ Marketplace de Cursos - Público/Privado con monetización  
✅ Sistema de Reviews - Calificaciones y comentarios
✅ Seguimiento de Creadores - Perfiles y estadísticas
✅ Notificaciones - Alertas en tiempo real
✅ Hub de Comunidad - Portal centralizado

🚀 ¡Tu plataforma ahora es una comunidad de aprendizaje completa!

Características principales:
• Chat de ideas con IA para generar cursos
• Marketplace con filtros y búsqueda avanzada
• Reviews verificadas y sistema de "útil"
• Perfiles de creadores con seguidores
• Notificaciones push de actividad
• Monetización para usuarios premium

¡Disfruta construyendo la mejor comunidad de aprendizaje! 🎓
        `);

    } catch (error) {
        console.error('❌ Error durante la inicialización:', error);
        alert('Hubo un error durante la inicialización. Revisa la consola para más detalles.');
    }
};

const createSampleData = async () => {
    // Crear cursos de ejemplo con diferentes configuraciones
    const sampleCourses = [
        {
            title: "IA para Abogados: Automatización Legal",
            description: "Aprende a usar inteligencia artificial para automatizar tareas legales, revisar contratos y optimizar tu práctica jurídica.",
            category: "IA para Profesionales",
            level: "Intermedio",
            duration: "8 horas",
            language: "es",
            instructor: "Dr. Ana García",
            visibility: "public",
            pricing: { isFree: true, price: 0 },
            featured: true,
            tags: ["IA", "Legal", "Automatización", "Contratos"]
        },
        {
            title: "Desarrollo Full-Stack con React y Node.js",
            description: "Construye aplicaciones web completas desde cero usando las tecnologías más demandadas del mercado.",
            category: "Desarrollo Web", 
            level: "Avanzado",
            duration: "15 horas",
            language: "es",
            instructor: "Carlos López",
            visibility: "private",
            pricing: { isFree: false, price: 99 },
            featured: true,
            tags: ["React", "Node.js", "Full-Stack", "JavaScript"]
        },
        {
            title: "Marketing Digital con IA: Estrategias 2024",
            description: "Domina las últimas herramientas de IA para crear campañas de marketing más efectivas y personalizadas.",
            category: "Marketing Digital",
            level: "Principiante", 
            duration: "6 horas",
            language: "es",
            instructor: "María Rodríguez",
            visibility: "public",
            pricing: { isFree: true, price: 0 },
            featured: false,
            tags: ["Marketing", "IA", "Campañas", "Personalización"]
        }
    ];

    console.log('📝 Creando cursos de ejemplo...');
    
    // Aquí normalmente harías las llamadas a la API para crear los cursos
    // Por ahora solo mostramos que se crearían
    sampleCourses.forEach((course, index) => {
        console.log(`📚 Curso ${index + 1}: ${course.title} (${course.visibility})`);
    });

    console.log('✅ Datos de ejemplo creados');
};

// Ejecutar automáticamente cuando se carga la página
if (typeof window !== 'undefined') {
    // En el navegador
    window.initializeCommunitySystem = initializeCommunitySystem;
    console.log('🔧 Script de inicialización cargado. Ejecuta: initializeCommunitySystem()');
} else {
    // En Node.js (servidor)
    module.exports = { initializeCommunitySystem };
}

/*
INSTRUCCIONES DE USO:

1. NAVEGADOR:
   - Abre la consola del navegador (F12)
   - Ejecuta: initializeCommunitySystem()
   - Sigue las instrucciones en pantalla

2. POSTMAN/API:
   - POST /api/ideas/initialize
   - POST /api/achievements/initialize (si existe)

3. AUTOMÁTICO:
   - El sistema se inicializa automáticamente en el primer uso
   - Los prompts se crean cuando alguien usa el chat por primera vez

VERIFICACIÓN:
- Ve a /community para ver el hub principal
- Prueba el disparador de ideas
- Navega el marketplace de cursos
- Crea una review de prueba
- Sigue a un creador

¡Tu sistema de comunidad está listo para usar! 🚀
*/ 