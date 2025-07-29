import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Upload, 
  Save, 
  X,
  Instagram,
  Youtube,
  Twitter,
  Globe,
  Building,
  Tag,
  DollarSign,
  Star,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  type: 'creator' | 'business';
  // Basic Info
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  bio: string;
  location: string;
  website?: string;
  
  // Media
  avatar: string;
  coverImage?: string;
  
  // Creator-specific
  categories?: string[];
  specialties?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  languages?: string[];
  experience?: string;
  
  // Business-specific
  companyName?: string;
  industry?: string;
  companySize?: string;
  
  // Social Media
  socialMedia: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
  };
  
  // Settings
  isPublic: boolean;
  allowMessages: boolean;
  showEmail: boolean;
  showPhone: boolean;
  emailNotifications: boolean;
  marketingEmails: boolean;
  
  // Verification
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'none';
}

interface ProfileEditorProps {
  profile: UserProfile;
  onSave: (profile: Partial<UserProfile>) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

const profileSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  username: z.string().min(3, 'El username debe tener al menos 3 caracteres').regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'La biografía no puede exceder 500 caracteres'),
  location: z.string().min(1, 'La ubicación es requerida'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  categories: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  experience: z.string().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  socialMedia: z.object({
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
    youtube: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional()
  }),
  isPublic: z.boolean(),
  allowMessages: z.boolean(),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean()
}).refine((data) => {
  if (data.priceMin && data.priceMax) {
    return data.priceMax >= data.priceMin;
  }
  return true;
}, {
  message: 'El precio máximo debe ser mayor o igual al mínimo',
  path: ['priceMax']
});

type ProfileFormData = z.infer<typeof profileSchema>;

const CATEGORIES = [
  'Beauty', 'Fashion', 'Fitness', 'Food', 'Travel', 'Tech', 'Gaming', 
  'Music', 'Art', 'Photography', 'Lifestyle', 'Health', 'Education'
];

const SPECIALTIES = [
  'Product Reviews', 'Tutorials', 'Unboxing', 'Lifestyle Content', 
  'Educational', 'Entertainment', 'Brand Partnerships', 'Event Coverage'
];

const LANGUAGES = ['Español', 'English', 'Português', 'Français', 'Italiano', 'Deutsch'];

const INDUSTRIES = [
  'Tecnología', 'Retail', 'Salud', 'Educación', 'Entretenimiento', 
  'Deportes', 'Turismo', 'Gastronomía', 'Moda', 'Belleza'
];

const COMPANY_SIZES = [
  '1-10 empleados', '11-50 empleados', '51-200 empleados', 
  '201-500 empleados', '500+ empleados'
];

const EXPERIENCE_LEVELS = [
  'Menos de 1 año', '1-2 años', '3-5 años', '5+ años'
];

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  profile,
  onSave,
  onCancel,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(profile.categories || []);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(profile.specialties || []);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(profile.languages || []);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(profile.coverImage || null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar || null);
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      username: profile.username,
      email: profile.email,
      phone: profile.phone || '',
      bio: profile.bio,
      location: profile.location,
      website: profile.website || '',
      companyName: profile.companyName || '',
      industry: profile.industry || '',
      companySize: profile.companySize || '',
      categories: profile.categories || [],
      specialties: profile.specialties || [],
      languages: profile.languages || [],
      experience: profile.experience || '',
      priceMin: profile.priceRange?.min || 0,
      priceMax: profile.priceRange?.max || 0,
      socialMedia: {
        instagram: profile.socialMedia.instagram || '',
        tiktok: profile.socialMedia.tiktok || '',
        youtube: profile.socialMedia.youtube || '',
        twitter: profile.socialMedia.twitter || '',
        linkedin: profile.socialMedia.linkedin || ''
      },
      isPublic: profile.isPublic,
      allowMessages: profile.allowMessages,
      showEmail: profile.showEmail,
      showPhone: profile.showPhone,
      emailNotifications: profile.emailNotifications,
      marketingEmails: profile.marketingEmails
    }
  });

  const handleImageUpload = (file: File, type: 'avatar' | 'cover') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'avatar') {
        setAvatarPreview(result);
      } else {
        setCoverImagePreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newCategories);
    form.setValue('categories', newCategories);
  };

  const handleSpecialtyToggle = (specialty: string) => {
    const newSpecialties = selectedSpecialties.includes(specialty)
      ? selectedSpecialties.filter(s => s !== specialty)
      : [...selectedSpecialties, specialty];
    setSelectedSpecialties(newSpecialties);
    form.setValue('specialties', newSpecialties);
  };

  const handleLanguageToggle = (language: string) => {
    const newLanguages = selectedLanguages.includes(language)
      ? selectedLanguages.filter(l => l !== language)
      : [...selectedLanguages, language];
    setSelectedLanguages(newLanguages);
    form.setValue('languages', newLanguages);
  };

  const handleSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    
    try {
      const updatedProfile: Partial<UserProfile> = {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        phone: data.phone,
        bio: data.bio,
        location: data.location,
        website: data.website,
        companyName: data.companyName,
        industry: data.industry,
        companySize: data.companySize,
        categories: selectedCategories,
        specialties: selectedSpecialties,
        languages: selectedLanguages,
        experience: data.experience,
        priceRange: data.priceMin && data.priceMax ? {
          min: data.priceMin,
          max: data.priceMax
        } : undefined,
        socialMedia: data.socialMedia,
        isPublic: data.isPublic,
        allowMessages: data.allowMessages,
        showEmail: data.showEmail,
        showPhone: data.showPhone,
        emailNotifications: data.emailNotifications,
        marketingEmails: data.marketingEmails
      };

      await onSave(updatedProfile);
      
      toast({
        title: 'Perfil actualizado',
        description: 'Los cambios han sido guardados exitosamente.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios. Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Editar perfil
            </CardTitle>
          </CardHeader>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="professional">
                  {profile.type === 'creator' ? 'Creator' : 'Empresa'}
                </TabsTrigger>
                <TabsTrigger value="social">Redes sociales</TabsTrigger>
                <TabsTrigger value="privacy">Privacidad</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle>Información básica</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Cover Image */}
                    <div className="space-y-4">
                      <Label>Imagen de portada</Label>
                      <div className="relative h-48 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg overflow-hidden">
                        {coverImagePreview ? (
                          <OptimizedImage
                            src={coverImagePreview}
                            alt="Cover"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Camera className="h-12 w-12" />
                          </div>
                        )}
                        <div className="absolute bottom-4 right-4">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handleImageUpload(file, 'cover');
                              };
                              input.click();
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Cambiar
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={avatarPreview || profile.avatar} alt={profile.firstName} />
                          <AvatarFallback className="text-2xl">
                            {profile.firstName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          type="button"
                          size="sm"
                          className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleImageUpload(file, 'avatar');
                            };
                            input.click();
                          }}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">Foto de perfil</div>
                        <div className="text-sm text-muted-foreground">
                          Recomendamos una imagen cuadrada de al menos 400x400px
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apellido *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de usuario *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">@</span>
                              <Input {...field} className="pl-8" />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Tu nombre de usuario será visible en tu URL pública
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input {...field} type="tel" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Biografía *</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Describe quién eres y qué haces..."
                              className="min-h-24"
                            />
                          </FormControl>
                          <FormDescription>
                            {field.value.length}/500 caracteres
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ubicación *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Buenos Aires, Argentina" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sitio web</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://tusitio.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Professional Information Tab */}
              <TabsContent value="professional">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {profile.type === 'creator' ? 'Información profesional' : 'Información de la empresa'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {profile.type === 'business' ? (
                      // Business fields
                      <>
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre de la empresa</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="industry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Industria</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar industria" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {INDUSTRIES.map(industry => (
                                      <SelectItem key={industry} value={industry}>
                                        {industry}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="companySize"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tamaño de la empresa</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar tamaño" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {COMPANY_SIZES.map(size => (
                                      <SelectItem key={size} value={size}>
                                        {size}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    ) : (
                      // Creator fields
                      <>
                        {/* Categories */}
                        <div className="space-y-3">
                          <Label>Categorías</Label>
                          <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(category => (
                              <Badge
                                key={category}
                                variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => handleCategoryToggle(category)}
                              >
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Specialties */}
                        <div className="space-y-3">
                          <Label>Especialidades</Label>
                          <div className="flex flex-wrap gap-2">
                            {SPECIALTIES.map(specialty => (
                              <Badge
                                key={specialty}
                                variant={selectedSpecialties.includes(specialty) ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => handleSpecialtyToggle(specialty)}
                              >
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Languages */}
                        <div className="space-y-3">
                          <Label>Idiomas</Label>
                          <div className="flex flex-wrap gap-2">
                            {LANGUAGES.map(language => (
                              <Badge
                                key={language}
                                variant={selectedLanguages.includes(language) ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => handleLanguageToggle(language)}
                              >
                                {language}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Experience */}
                        <FormField
                          control={form.control}
                          name="experience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Experiencia</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar experiencia" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {EXPERIENCE_LEVELS.map(level => (
                                    <SelectItem key={level} value={level}>
                                      {level}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Price Range */}
                        <div className="space-y-4">
                          <Label>Rango de precios (ARS)</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="priceMin"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Mínimo</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      min="0"
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="priceMax"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Máximo</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      min="0"
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Social Media Tab */}
              <TabsContent value="social">
                <Card>
                  <CardHeader>
                    <CardTitle>Redes sociales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="socialMedia.instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Instagram className="h-4 w-4 text-pink-600" />
                            Instagram
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="@usuario" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialMedia.tiktok"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-black rounded" />
                            TikTok
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="@usuario" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialMedia.youtube"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Youtube className="h-4 w-4 text-red-600" />
                            YouTube
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="@canal" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialMedia.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Twitter className="h-4 w-4 text-blue-400" />
                            Twitter
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="@usuario" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialMedia.linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-blue-700" />
                            LinkedIn
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="perfil-linkedin" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy Tab */}
              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de privacidad</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="isPublic"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center gap-2">
                                {field.value ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                Perfil público
                              </FormLabel>
                              <FormDescription>
                                Tu perfil será visible para todos los usuarios
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <FormField
                        control={form.control}
                        name="allowMessages"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <FormLabel>Permitir mensajes</FormLabel>
                              <FormDescription>
                                Otros usuarios pueden enviarte mensajes privados
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="showEmail"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <FormLabel>Mostrar email</FormLabel>
                              <FormDescription>
                                Tu email será visible en tu perfil público
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="showPhone"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <FormLabel>Mostrar teléfono</FormLabel>
                              <FormDescription>
                                Tu teléfono será visible en tu perfil público
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Notificaciones</h4>
                        
                        <FormField
                          control={form.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel>Notificaciones por email</FormLabel>
                                <FormDescription>
                                  Recibir notificaciones importantes por email
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="marketingEmails"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel>Emails de marketing</FormLabel>
                                <FormDescription>
                                  Recibir ofertas, tips y novedades de la plataforma
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
};

export default ProfileEditor;