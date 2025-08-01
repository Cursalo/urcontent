import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Business Onboarding Data Interface
export interface BusinessOnboardingData {
  // Step 1: Welcome
  welcomeComplete: boolean;
  
  // Step 2: Basic Company Info
  companyName: string;
  cuit: string;
  industry: string;
  companySize: string;
  
  // Step 3: Contact & Location
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  
  // Step 4: Digital Presence
  website: string;
  instagram: string;
  logoFile: File | null;
  logoUrl: string;
  
  // Step 5: Marketing Details
  marketingBudget: string;
  marketingObjectives: string[];
  targetAudience: {
    ageRanges: string[];
    interests: string[];
    locations: string[];
  };
  
  // Step 6: Creator Preferences
  preferredCreatorTypes: string[];
  collaborationTypes: string[];
  brandValues: string[];
}

// Creator Onboarding Data Interface
export interface CreatorOnboardingData {
  // Step 1: Welcome
  welcomeComplete: boolean;
  
  // Step 2: Personal Information
  fullName: string;
  username: string;
  email: string;
  phone: string;
  
  // Step 3: Social Media Verification
  instagramHandle: string;
  instagramVerified: boolean;
  instagramFollowers: number;
  tiktokHandle: string;
  youtubeHandle: string;
  followersCount: string;
  
  // Step 4: Content Specialties
  specialties: string[];
  contentTypes: string[];
  bio: string;
  
  // Step 5: Portfolio Setup
  portfolioItems: Array<{
    title: string;
    description: string;
    mediaUrl: string;
    platform: string;
    file?: File;
  }>;
  minRate: number;
  maxRate: number;
  
  // Step 6: Audience & Analytics
  audienceDemographics: {
    ageRanges: string[];
    genderSplit: {
      male: number;
      female: number;
      other: number;
    };
    topLocations: string[];
    topInterests: string[];
  };
  engagementRate: number;
  avgLikes: number;
  avgComments: number;
}

// Portfolio Item Interface
export interface PortfolioItem {
  title: string;
  description: string;
  mediaUrl: string;
  platform: string;
  file?: File;
}

// Hook return types
export interface OnboardingHookReturn<T> {
  currentStep: number;
  totalSteps: number;
  data: T;
  errors: Record<string, string>;
  isLoading: boolean;
  updateData: (updates: Partial<T>) => void;
  nextStep: () => void;
  previousStep: () => void;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  completeOnboarding: () => Promise<boolean>;
}

// Initial business data
const initialBusinessData: BusinessOnboardingData = {
  welcomeComplete: false,
  companyName: '',
  cuit: '',
  industry: '',
  companySize: '',
  email: '',
  phone: '',
  address: '',
  contactPerson: '',
  website: '',
  instagram: '',
  logoFile: null,
  logoUrl: '',
  marketingBudget: '',
  marketingObjectives: [],
  targetAudience: {
    ageRanges: [],
    interests: [],
    locations: []
  },
  preferredCreatorTypes: [],
  collaborationTypes: [],
  brandValues: []
};

// Initial creator data
const initialCreatorData: CreatorOnboardingData = {
  welcomeComplete: false,
  fullName: '',
  username: '',
  email: '',
  phone: '',
  instagramHandle: '',
  instagramVerified: false,
  instagramFollowers: 0,
  tiktokHandle: '',
  youtubeHandle: '',
  followersCount: '',
  specialties: [],
  contentTypes: [],
  bio: '',
  portfolioItems: [],
  minRate: 0,
  maxRate: 0,
  audienceDemographics: {
    ageRanges: [],
    genderSplit: {
      male: 0,
      female: 0,
      other: 0
    },
    topLocations: [],
    topInterests: []
  },
  engagementRate: 0,
  avgLikes: 0,
  avgComments: 0
};

// Business Onboarding Hook
export const useBusinessOnboarding = (): OnboardingHookReturn<BusinessOnboardingData> => {
  const { user, signUp } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<BusinessOnboardingData>(initialBusinessData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateData = useCallback((updates: Partial<BusinessOnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
    
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => delete newErrors[field]);
      return newErrors;
    });
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 7));
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const uploadLogo = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrl } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw new Error('Failed to upload logo');
    }
  };

  const completeOnboarding = async (): Promise<boolean> => {
    setIsLoading(true);
    setErrors({});

    try {
      // Validate required fields
      const requiredFields = ['companyName', 'email', 'contactPerson', 'industry'];
      const missingFields = requiredFields.filter(field => !data[field as keyof BusinessOnboardingData]);
      
      if (missingFields.length > 0) {
        const fieldErrors: Record<string, string> = {};
        missingFields.forEach(field => {
          fieldErrors[field] = 'Este campo es requerido';
        });
        setErrors(fieldErrors);
        return false;
      }

      // Create user account if not exists
      if (!user) {
        const { error: authError } = await signUp(data.email, 'temp-password', {
          full_name: data.contactPerson,
          role: 'business'
        });

        if (authError) {
          throw authError;
        }
      }

      // Upload logo if provided
      let logoUrl = data.logoUrl;
      if (data.logoFile && !logoUrl) {
        logoUrl = await uploadLogo(data.logoFile);
      }

      // Create business profile
      const { error: profileError } = await supabase
        .from('business_profiles')
        .insert({
          user_id: user!.id,
          company_name: data.companyName,
          industry: data.industry,
          description: `Empresa en el sector ${data.industry}`,
          website_url: data.website || null,
          logo_url: logoUrl || null,
          company_size: data.companySize,
          cuit: data.cuit,
          address: data.address || null,
          contact_person: data.contactPerson,
          marketing_budget_range: data.marketingBudget,
          preferred_creator_types: data.preferredCreatorTypes,
          brand_values: data.brandValues,
          target_audience: data.targetAudience
        });

      if (profileError) {
        throw profileError;
      }

      return true;
    } catch (error) {
      console.error('Error completing business onboarding:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Error al crear el perfil. Inténtalo de nuevo.' 
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentStep,
    totalSteps: 7,
    data,
    errors,
    isLoading,
    updateData,
    nextStep,
    previousStep,
    setErrors,
    completeOnboarding
  };
};

// Creator Onboarding Hook
export const useCreatorOnboarding = (): OnboardingHookReturn<CreatorOnboardingData> => {
  const { user, signUp } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<CreatorOnboardingData>(initialCreatorData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateData = useCallback((updates: Partial<CreatorOnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
    
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => delete newErrors[field]);
      return newErrors;
    });
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 7));
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const uploadPortfolioItem = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `portfolio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrl } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Error uploading portfolio item:', error);
      throw new Error('Failed to upload portfolio item');
    }
  };

  const completeOnboarding = async (): Promise<boolean> => {
    setIsLoading(true);
    setErrors({});

    try {
      // Validate required fields
      const requiredFields = ['fullName', 'email', 'instagramHandle'];
      const missingFields = requiredFields.filter(field => !data[field as keyof CreatorOnboardingData]);
      
      if (missingFields.length > 0) {
        const fieldErrors: Record<string, string> = {};
        missingFields.forEach(field => {
          fieldErrors[field] = 'Este campo es requerido';
        });
        setErrors(fieldErrors);
        return false;
      }

      // Create user account if not exists
      if (!user) {
        const { error: authError } = await signUp(data.email, 'temp-password', {
          full_name: data.fullName,
          role: 'creator'
        });

        if (authError) {
          throw authError;
        }
      }

      // Create creator profile
      const { data: creatorProfile, error: profileError } = await supabase
        .from('creator_profiles')
        .insert({
          user_id: user!.id,
          bio: data.bio,
          specialties: data.specialties,
          instagram_handle: data.instagramHandle.replace('@', ''),
          instagram_followers: data.instagramFollowers,
          instagram_verified: data.instagramVerified,
          tiktok_handle: data.tiktokHandle ? data.tiktokHandle.replace('@', '') : null,
          youtube_handle: data.youtubeHandle || null,
          min_collaboration_fee: data.minRate,
          max_collaboration_fee: data.maxRate,
          collaboration_types: data.contentTypes,
          audience_demographics: data.audienceDemographics,
          engagement_rate: data.engagementRate,
          ur_score: 75 // Starting score
        })
        .select()
        .single();

      if (profileError) {
        throw profileError;
      }

      // Upload and create portfolio items
      for (const item of data.portfolioItems) {
        let mediaUrl = item.mediaUrl;
        
        if (item.file) {
          mediaUrl = await uploadPortfolioItem(item.file);
        }

        await supabase
          .from('portfolio_items')
          .insert({
            creator_id: creatorProfile.id,
            title: item.title,
            description: item.description,
            content_type: item.file ? item.file.type.startsWith('video/') ? 'video' : 'image' : 'image',
            media_url: mediaUrl,
            platform: item.platform,
            is_featured: true,
            is_public: true
          });
      }

      return true;
    } catch (error) {
      console.error('Error completing creator onboarding:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Error al crear el perfil. Inténtalo de nuevo.' 
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentStep,
    totalSteps: 7,
    data,
    errors,
    isLoading,
    updateData,
    nextStep,
    previousStep,
    setErrors,
    completeOnboarding
  };
};