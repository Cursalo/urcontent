import { supabase, getUserFromRequest } from '../supabase.js'

const ideaPrompts = {
  'ia': [
    '¿Cómo puede la IA automatizar procesos en mi industria?',
    '¿Qué herramientas de IA puedo usar para mejorar mi productividad?',
    '¿Cómo implementar chatbots en mi negocio?',
    '¿Qué es el machine learning y cómo aplicarlo?'
  ],
  'desarrollo-web': [
    '¿Cómo crear una aplicación web moderna?',
    '¿Qué framework elegir para mi proyecto?',
    '¿Cómo optimizar el rendimiento de mi sitio web?',
    '¿Cómo implementar autenticación segura?'
  ],
  'marketing-digital': [
    '¿Cómo crear una estrategia de contenido efectiva?',
    '¿Qué métricas de marketing debo seguir?',
    '¿Cómo optimizar mis campañas publicitarias?',
    '¿Cómo usar las redes sociales para mi negocio?'
  ],
  'emprendimiento': [
    '¿Cómo validar mi idea de negocio?',
    '¿Qué necesito para crear una startup?',
    '¿Cómo conseguir financiamiento?',
    '¿Cómo escalar mi negocio?'
  ]
}

const generateResponse = (message, category) => {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('ia') || lowerMessage.includes('inteligencia artificial')) {
    return {
      response: 'La IA puede transformar tu trabajo de muchas maneras. Te recomiendo empezar con herramientas como ChatGPT para automatizar tareas de escritura, o explorar plataformas como Zapier para conectar aplicaciones.',
      ideas: ['Curso de IA para Principiantes', 'Automatización con IA', 'ChatGPT para Negocios'],
      courseRecommendations: ['ia-desde-cero', 'automatizacion-empresarial', 'chatgpt-avanzado']
    }
  }
  
  if (lowerMessage.includes('web') || lowerMessage.includes('desarrollo')) {
    return {
      response: 'El desarrollo web moderno ofrece infinitas posibilidades. React y Next.js son excelentes para frontend, mientras que Node.js y Supabase son perfectos para el backend.',
      ideas: ['Aplicación Web Completa', 'E-commerce Moderno', 'Dashboard Administrativo'],
      courseRecommendations: ['react-completo', 'nextjs-avanzado', 'fullstack-developer']
    }
  }
  
  if (lowerMessage.includes('marketing') || lowerMessage.includes('negocio')) {
    return {
      response: 'El marketing digital es clave para cualquier negocio hoy en día. Te sugiero enfocarte en crear contenido valioso y usar analytics para medir resultados.',
      ideas: ['Estrategia de Contenido', 'Marketing en Redes Sociales', 'Email Marketing'],
      courseRecommendations: ['marketing-digital-completo', 'social-media-mastery', 'growth-hacking']
    }
  }
  
  return {
    response: 'Interesante pregunta. Para darte una respuesta más específica, ¿podrías contarme más sobre tu industria o área de interés?',
    ideas: ['Curso Personalizado', 'Consultoría Especializada', 'Workshop Práctico'],
    courseRecommendations: ['fundamentos-generales', 'habilidades-digitales', 'emprendimiento-digital']
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({})
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  try {
    if (req.method === 'GET') {
      // Get prompts for category
      const { category } = req.query
      const prompts = ideaPrompts[category] || ideaPrompts['ia']
      
      return res.status(200).json({ prompts })
    }

    if (req.method === 'POST') {
      const user = await getUserFromRequest(req)
      const { message, sessionId, category } = req.body

      // Create or get session
      let session
      if (sessionId) {
        const { data } = await supabase
          .from('idea_chat_sessions')
          .select('*')
          .eq('id', sessionId)
          .single()
        session = data
      } else {
        const { data } = await supabase
          .from('idea_chat_sessions')
          .insert({
            user_id: user?.id,
            category: category || 'general'
          })
          .select()
          .single()
        session = data
      }

      // Generate AI response
      const aiResponse = generateResponse(message, category)

      // Save user message
      await supabase
        .from('idea_chat_messages')
        .insert({
          session_id: session.id,
          sender: 'user',
          content: message
        })

      // Save AI response
      await supabase
        .from('idea_chat_messages')
        .insert({
          session_id: session.id,
          sender: 'ai',
          content: aiResponse.response,
          ideas_generated: aiResponse.ideas,
          course_recommendations: aiResponse.courseRecommendations
        })

      return res.status(200).json({
        sessionId: session.id,
        response: aiResponse.response,
        ideas: aiResponse.ideas,
        courseRecommendations: aiResponse.courseRecommendations
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Idea chat error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
