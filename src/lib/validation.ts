import { z } from "zod";

// Phone number validation for Argentina
export const phoneRegex = /^(\+54\s?)?(\d{2,4}\s?)?\d{4}[\s-]?\d{4}$/;

// CUIT validation for Argentina
export const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;

// Instagram handle validation
export const instagramHandleRegex = /^[a-zA-Z0-9._]{1,30}$/;

// Common validation schemas
export const emailSchema = z.string()
  .email("Ingresa un email válido")
  .min(1, "El email es requerido");

export const phoneSchema = z.string()
  .min(1, "El teléfono es requerido")
  .regex(phoneRegex, "Ingresa un teléfono válido (ej: +54 11 1234-5678)");

export const passwordSchema = z.string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
  .regex(/[a-z]/, "Debe contener al menos una minúscula")
  .regex(/[0-9]/, "Debe contener al menos un número");

// Business onboarding validation schemas
export const businessStep1Schema = z.object({
  welcomeComplete: z.boolean()
});

export const businessStep2Schema = z.object({
  companyName: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  cuit: z.string()
    .min(1, "El CUIT es requerido")
    .regex(cuitRegex, "Formato de CUIT inválido (XX-XXXXXXXX-X)"),
  industry: z.string()
    .min(1, "Selecciona una industria"),
  companySize: z.string()
    .min(1, "Selecciona el tamaño de la empresa")
});

export const businessStep3Schema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  address: z.string().optional(),
  contactPerson: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
});

export const businessStep4Schema = z.object({
  website: z.string()
    .url("Ingresa una URL válida")
    .optional()
    .or(z.literal("")),
  instagram: z.string()
    .regex(instagramHandleRegex, "Handle de Instagram inválido")
    .optional()
    .or(z.literal("")),
  logoFile: z.any().optional()
});

export const businessStep5Schema = z.object({
  marketingBudget: z.string()
    .min(1, "Selecciona un rango de presupuesto"),
  marketingObjectives: z.array(z.string())
    .min(1, "Selecciona al menos un objetivo"),
  targetAudience: z.object({
    ageRanges: z.array(z.string()).min(1, "Selecciona al menos un rango de edad"),
    interests: z.array(z.string()).min(1, "Selecciona al menos un interés"),
    locations: z.array(z.string()).min(1, "Selecciona al menos una ubicación")
  })
});

export const businessStep6Schema = z.object({
  preferredCreatorTypes: z.array(z.string())
    .min(1, "Selecciona al menos un tipo de creador"),
  collaborationTypes: z.array(z.string())
    .min(1, "Selecciona al menos un tipo de colaboración"),
  brandValues: z.array(z.string())
    .min(1, "Selecciona al menos un valor de marca")
});

// Creator onboarding validation schemas
export const creatorStep1Schema = z.object({
  welcomeComplete: z.boolean()
});

export const creatorStep2Schema = z.object({
  fullName: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  username: z.string()
    .min(3, "El username debe tener al menos 3 caracteres")
    .max(30, "El username no puede exceder 30 caracteres")
    .regex(/^[a-zA-Z0-9._]+$/, "Solo letras, números, puntos y guiones bajos"),
  email: emailSchema,
  phone: phoneSchema
});

export const creatorStep3Schema = z.object({
  instagramHandle: z.string()
    .min(1, "El handle de Instagram es requerido")
    .regex(/^@?[a-zA-Z0-9._]+$/, "Handle de Instagram inválido"),
  tiktokHandle: z.string()
    .regex(/^@?[a-zA-Z0-9._]+$/, "Handle de TikTok inválido")
    .optional()
    .or(z.literal("")),
  youtubeHandle: z.string()
    .optional()
    .or(z.literal("")),
  followersCount: z.string()
    .min(1, "Selecciona el rango de seguidores")
});

export const creatorStep4Schema = z.object({
  specialties: z.array(z.string())
    .min(1, "Selecciona al menos una especialidad")
    .max(5, "Máximo 5 especialidades"),
  contentTypes: z.array(z.string())
    .min(1, "Selecciona al menos un tipo de contenido"),
  bio: z.string()
    .min(50, "La biografía debe tener al menos 50 caracteres")
    .max(500, "La biografía no puede exceder 500 caracteres")
});

export const creatorStep5Schema = z.object({
  portfolioItems: z.array(z.object({
    title: z.string().min(1, "El título es requerido"),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
    mediaUrl: z.string().url("URL inválida"),
    platform: z.string().min(1, "Selecciona una plataforma")
  })).min(3, "Sube al menos 3 elementos al portafolio"),
  minRate: z.number()
    .min(100, "La tarifa mínima debe ser al menos $100")
    .max(1000000, "La tarifa es demasiado alta"),
  maxRate: z.number()
    .min(100, "La tarifa máxima debe ser al menos $100")
    .max(1000000, "La tarifa es demasiado alta")
}).refine((data) => data.maxRate >= data.minRate, {
  message: "La tarifa máxima debe ser mayor o igual a la mínima",
  path: ["maxRate"]
});

export const creatorStep6Schema = z.object({
  audienceDemographics: z.object({
    ageRanges: z.array(z.string()).min(1, "Selecciona al menos un rango de edad"),
    genderSplit: z.object({
      male: z.number().min(0).max(100),
      female: z.number().min(0).max(100),
      other: z.number().min(0).max(100)
    }),
    topLocations: z.array(z.string()).min(1, "Agrega al menos una ubicación"),
    topInterests: z.array(z.string()).min(1, "Agrega al menos un interés")
  }),
  engagementRate: z.number()
    .min(0.1, "La tasa de engagement debe ser al menos 0.1%")
    .max(50, "La tasa de engagement parece demasiado alta"),
  avgLikes: z.number().min(0, "Los likes promedio no pueden ser negativos"),
  avgComments: z.number().min(0, "Los comentarios promedio no pueden ser negativos")
});

// Validation helper functions
export const validateStep = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; errors?: Record<string, string>; data?: T } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: "Error de validación desconocido" } };
  }
};

// CUIT validation function
export const validateCuit = (cuit: string): boolean => {
  // Remove hyphens and spaces to normalize format
  const cleanCuit = cuit.replace(/[-\s]/g, '');
  
  // Check if it's exactly 11 digits
  if (!/^\d{11}$/.test(cleanCuit)) return false;
  
  // CUIT validation algorithm
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCuit[i]) * weights[i];
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;
  
  return checkDigit === parseInt(cleanCuit[10]);
};

// Instagram verification helper
export const verifyInstagramHandle = async (handle: string): Promise<{ exists: boolean; followers?: number; verified?: boolean }> => {
  // This would integrate with Instagram API or a service like RapidAPI
  // For now, we'll simulate the verification
  const cleanHandle = handle.replace('@', '');
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock verification response
  if (cleanHandle.length < 3) {
    return { exists: false };
  }
  
  return {
    exists: true,
    followers: Math.floor(Math.random() * 100000) + 1000,
    verified: Math.random() > 0.8
  };
};