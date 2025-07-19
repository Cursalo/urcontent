import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface QuestionPrompt {
  domain: 'math' | 'reading_writing'
  skill: string
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'multiple_choice' | 'student_produced_response' | 'text_analysis'
  topic?: string
  context?: string
  adaptiveLevel?: number // 1-10 based on student performance
}

export interface GeneratedQuestion {
  id: string
  type: 'multiple_choice' | 'student_produced_response' | 'text_analysis'
  content: string
  passage?: string
  choices?: Array<{ id: string; text: string }>
  correctAnswer: string
  explanation: string
  domain: string
  skill: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: number // seconds
  tags: string[]
  adaptiveMetrics: {
    discriminationIndex: number // How well it differentiates skill levels
    difficultyIndex: number // Statistical difficulty (0-1)
    guessingParameter: number // Probability of guessing correctly
  }
}

const SAT_QUESTION_PROMPTS = {
  math: {
    algebra: {
      easy: `Generate a SAT Digital Math question testing basic linear equation solving. 
      The question should be at an easy difficulty level (about 60-70% of students should answer correctly).
      Include realistic context and ensure the answer is unambiguous.`,
      medium: `Create a SAT Digital Math question involving systems of linear equations or quadratic functions.
      Target medium difficulty (40-60% success rate). Include a real-world application context.`,
      hard: `Develop a challenging SAT Digital Math question combining multiple algebraic concepts.
      Should be hard difficulty (20-40% success rate). Test deep understanding and multi-step reasoning.`
    },
    geometry: {
      easy: `Generate a SAT Digital Math question on basic geometry concepts like area, perimeter, or angles.
      Easy difficulty level with clear diagrams when needed.`,
      medium: `Create a SAT Digital Math question involving coordinate geometry or trigonometry basics.
      Medium difficulty with multiple geometric concepts combined.`,
      hard: `Develop a complex SAT Digital Math question testing advanced geometric reasoning.
      Include 3D geometry, complex coordinate systems, or sophisticated trigonometric applications.`
    },
    data_analysis: {
      easy: `Generate a SAT Digital Math question on basic statistics, percentages, or data interpretation.
      Easy level focusing on reading graphs or simple calculations.`,
      medium: `Create a SAT Digital Math question involving probability, sampling, or statistical analysis.
      Medium difficulty requiring interpretation and calculation.`,
      hard: `Develop a challenging SAT Digital Math question on advanced statistics or complex data scenarios.
      Hard difficulty testing statistical reasoning and inference.`
    }
  },
  reading_writing: {
    reading_comprehension: {
      easy: `Generate a SAT Digital Reading question based on a contemporary passage.
      Test basic comprehension with clear, direct questions. Easy difficulty level.`,
      medium: `Create a SAT Digital Reading question requiring inference from a literary or historical text.
      Medium difficulty testing analytical reading skills.`,
      hard: `Develop a challenging SAT Digital Reading question involving complex synthesis across multiple sources.
      Hard difficulty requiring deep analysis and critical thinking.`
    },
    grammar: {
      easy: `Generate a SAT Digital Writing question on basic grammar rules like subject-verb agreement.
      Easy difficulty with common error patterns.`,
      medium: `Create a SAT Digital Writing question on sentence structure, punctuation, or word choice.
      Medium difficulty requiring understanding of style and clarity.`,
      hard: `Develop a challenging SAT Digital Writing question on complex grammatical concepts.
      Hard difficulty testing nuanced understanding of language conventions.`
    }
  }
}

export async function generateQuestion(prompt: QuestionPrompt): Promise<GeneratedQuestion> {
  try {
    const systemPrompt = getSystemPrompt(prompt)
    const userPrompt = getUserPrompt(prompt)

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    const questionData = JSON.parse(response)
    
    // Generate unique ID and add metadata
    const generatedQuestion: GeneratedQuestion = {
      id: generateQuestionId(),
      ...questionData,
      domain: prompt.domain,
      skill: prompt.skill,
      difficulty: prompt.difficulty,
      adaptiveMetrics: generateAdaptiveMetrics(prompt.difficulty, prompt.adaptiveLevel)
    }

    return generatedQuestion
  } catch (error) {
    console.error('Error generating question:', error)
    throw new Error('Failed to generate question')
  }
}

export async function generateAdaptiveQuestions(
  studentPerformance: {
    correctAnswers: number
    totalAnswers: number
    weakSkills: string[]
    strongSkills: string[]
    averageTime: number
  },
  count: number = 5
): Promise<GeneratedQuestion[]> {
  const questions: GeneratedQuestion[] = []
  
  // Calculate adaptive level (1-10) based on performance
  const successRate = studentPerformance.correctAnswers / studentPerformance.totalAnswers
  const adaptiveLevel = Math.ceil(successRate * 10)
  
  // Determine difficulty distribution based on performance
  const difficultyDistribution = getDifficultyDistribution(successRate)
  
  for (let i = 0; i < count; i++) {
    // Select skill to focus on (bias toward weak skills)
    const skill = selectSkillForPractice(studentPerformance.weakSkills, studentPerformance.strongSkills)
    
    // Select difficulty for this question
    const difficulty = selectDifficulty(difficultyDistribution)
    
    // Determine domain and type
    const domain = Math.random() > 0.5 ? 'math' : 'reading_writing'
    const type = selectQuestionType(domain, skill)
    
    const prompt: QuestionPrompt = {
      domain,
      skill,
      difficulty,
      type,
      adaptiveLevel,
      context: `Adaptive question ${i + 1}/${count} targeting ${skill} at ${difficulty} level`
    }
    
    try {
      const question = await generateQuestion(prompt)
      questions.push(question)
    } catch (error) {
      console.error(`Failed to generate adaptive question ${i + 1}:`, error)
    }
  }
  
  return questions
}

function getSystemPrompt(prompt: QuestionPrompt): string {
  return `You are an expert SAT question generator. Create high-quality, authentic SAT Digital test questions that:

1. Follow the exact format and style of official SAT questions
2. Are appropriate for the specified difficulty level
3. Test the specific skill accurately
4. Include realistic contexts and scenarios
5. Have unambiguous correct answers
6. Provide clear, educational explanations

For multiple choice questions:
- Provide exactly 4 answer choices (A, B, C, D)
- Make distractors plausible but clearly incorrect
- Ensure one definitively correct answer

For student-produced response questions:
- Accept numeric answers only
- Provide clear instructions
- Ensure the answer is a specific number

Return your response as a JSON object with these fields:
{
  "type": "multiple_choice" | "student_produced_response" | "text_analysis",
  "content": "The question text",
  "passage": "Reading passage if applicable (optional)",
  "choices": [{"id": "A", "text": "..."}, ...] (for multiple choice only),
  "correctAnswer": "A" or numeric value,
  "explanation": "Detailed explanation of the solution",
  "estimatedTime": seconds_to_complete,
  "tags": ["tag1", "tag2", ...]
}`
}

function getUserPrompt(prompt: QuestionPrompt): string {
  const basePrompt = SAT_QUESTION_PROMPTS[prompt.domain]?.[prompt.skill as keyof typeof SAT_QUESTION_PROMPTS[typeof prompt.domain]]?.[prompt.difficulty]
  
  if (!basePrompt) {
    return `Generate a SAT Digital ${prompt.domain} question testing ${prompt.skill} at ${prompt.difficulty} difficulty level.`
  }
  
  let fullPrompt = basePrompt
  
  if (prompt.topic) {
    fullPrompt += ` Focus specifically on: ${prompt.topic}.`
  }
  
  if (prompt.context) {
    fullPrompt += ` Additional context: ${prompt.context}.`
  }
  
  if (prompt.adaptiveLevel) {
    fullPrompt += ` This is an adaptive question for a student performing at level ${prompt.adaptiveLevel}/10.`
  }
  
  return fullPrompt
}

function generateQuestionId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateAdaptiveMetrics(difficulty: string, adaptiveLevel?: number): GeneratedQuestion['adaptiveMetrics'] {
  const difficultyMap = { easy: 0.7, medium: 0.5, hard: 0.3 }
  const baseDifficulty = difficultyMap[difficulty]
  
  return {
    discriminationIndex: 0.3 + Math.random() * 0.4, // 0.3-0.7 range
    difficultyIndex: baseDifficulty + (Math.random() - 0.5) * 0.2,
    guessingParameter: difficulty === 'hard' ? 0.1 + Math.random() * 0.15 : 0.25
  }
}

function getDifficultyDistribution(successRate: number): { easy: number; medium: number; hard: number } {
  if (successRate < 0.3) {
    return { easy: 0.6, medium: 0.3, hard: 0.1 }
  } else if (successRate < 0.7) {
    return { easy: 0.3, medium: 0.5, hard: 0.2 }
  } else {
    return { easy: 0.2, medium: 0.4, hard: 0.4 }
  }
}

function selectSkillForPractice(weakSkills: string[], strongSkills: string[]): string {
  // 70% chance to focus on weak skills, 30% on strong skills for reinforcement
  if (Math.random() < 0.7 && weakSkills.length > 0) {
    return weakSkills[Math.floor(Math.random() * weakSkills.length)]
  }
  
  if (strongSkills.length > 0) {
    return strongSkills[Math.floor(Math.random() * strongSkills.length)]
  }
  
  // Fallback to common skills
  const fallbackSkills = ['algebra', 'geometry', 'reading_comprehension', 'grammar']
  return fallbackSkills[Math.floor(Math.random() * fallbackSkills.length)]
}

function selectDifficulty(distribution: { easy: number; medium: number; hard: number }): 'easy' | 'medium' | 'hard' {
  const rand = Math.random()
  
  if (rand < distribution.easy) return 'easy'
  if (rand < distribution.easy + distribution.medium) return 'medium'
  return 'hard'
}

function selectQuestionType(domain: string, skill: string): QuestionPrompt['type'] {
  if (domain === 'math' && ['algebra', 'geometry'].includes(skill)) {
    return Math.random() < 0.3 ? 'student_produced_response' : 'multiple_choice'
  }
  
  if (domain === 'reading_writing') {
    return 'multiple_choice'
  }
  
  return 'multiple_choice'
}

// Batch question generation for practice tests
export async function generatePracticeTest(
  sections: {
    domain: 'math' | 'reading_writing'
    questionCount: number
    timeLimit: number
  }[],
  studentLevel?: number
): Promise<{
  sections: Array<{
    domain: string
    questions: GeneratedQuestion[]
    timeLimit: number
  }>
}> {
  const testSections = []
  
  for (const section of sections) {
    const questions: GeneratedQuestion[] = []
    const skills = getSkillsForDomain(section.domain)
    
    for (let i = 0; i < section.questionCount; i++) {
      const skill = skills[i % skills.length]
      const difficulty = selectBalancedDifficulty(i, section.questionCount)
      
      const prompt: QuestionPrompt = {
        domain: section.domain,
        skill,
        difficulty,
        type: selectQuestionType(section.domain, skill),
        adaptiveLevel: studentLevel
      }
      
      try {
        const question = await generateQuestion(prompt)
        questions.push(question)
      } catch (error) {
        console.error(`Failed to generate question ${i + 1} for ${section.domain}:`, error)
      }
    }
    
    testSections.push({
      domain: section.domain,
      questions,
      timeLimit: section.timeLimit
    })
  }
  
  return { sections: testSections }
}

function getSkillsForDomain(domain: string): string[] {
  if (domain === 'math') {
    return ['algebra', 'geometry', 'data_analysis', 'advanced_math']
  }
  return ['reading_comprehension', 'grammar', 'vocabulary', 'rhetoric']
}

function selectBalancedDifficulty(questionIndex: number, totalQuestions: number): 'easy' | 'medium' | 'hard' {
  const position = questionIndex / totalQuestions
  
  if (position < 0.3) return 'easy'
  if (position < 0.7) return 'medium'
  return 'hard'
}