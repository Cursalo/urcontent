import React from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { useCreatorOnboarding } from '@/hooks/useOnboarding';
import { CreatorStep1Welcome } from '@/components/onboarding/creator/CreatorStep1Welcome';
import { CreatorStep2Personal } from '@/components/onboarding/creator/CreatorStep2Personal';
import { CreatorStep3Social } from '@/components/onboarding/creator/CreatorStep3Social';
import { CreatorStep4Specialties } from '@/components/onboarding/creator/CreatorStep4Specialties';
import { CreatorStep5Portfolio } from '@/components/onboarding/creator/CreatorStep5Portfolio';
import { CreatorStep6Analytics } from '@/components/onboarding/creator/CreatorStep6Analytics';
import { CreatorStep7Success } from '@/components/onboarding/creator/CreatorStep7Success';
import { validateStep } from '@/lib/validation';
import {
  creatorStep1Schema,
  creatorStep2Schema,
  creatorStep3Schema,
  creatorStep4Schema,
  creatorStep5Schema,
  creatorStep6Schema
} from '@/lib/validation';

const CreatorOnboarding: React.FC = () => {
  const {
    currentStep,
    totalSteps,
    data,
    errors,
    isLoading,
    updateData,
    nextStep,
    previousStep,
    setErrors,
    completeOnboarding
  } = useCreatorOnboarding();

  const stepConfig = {
    1: {
      title: '¡Bienvenido a URContent!',
      description: 'Monetiza tu creatividad colaborando con las mejores marcas de Argentina',
      component: CreatorStep1Welcome,
      validation: creatorStep1Schema,
      nextLabel: 'Comenzar'
    },
    2: {
      title: 'Información Personal',
      description: 'Cuéntanos sobre ti para crear tu perfil de creador',
      component: CreatorStep2Personal,
      validation: creatorStep2Schema,
      nextLabel: 'Continuar'
    },
    3: {
      title: 'Verificación de Redes',
      description: 'Conecta y verifica tus redes sociales principales',
      component: CreatorStep3Social,
      validation: creatorStep3Schema,
      nextLabel: 'Continuar'
    },
    4: {
      title: 'Especialidades de Contenido',
      description: 'Define tu nicho y el tipo de contenido que creates',
      component: CreatorStep4Specialties,
      validation: creatorStep4Schema,
      nextLabel: 'Continuar'
    },
    5: {
      title: 'Portfolio y Tarifas',
      description: 'Muestra tu mejor trabajo y define tus precios',
      component: CreatorStep5Portfolio,
      validation: creatorStep5Schema,
      nextLabel: 'Continuar'
    },
    6: {
      title: 'Analytics de Audiencia',
      description: 'Comparte datos sobre tu audiencia para mejor matching',
      component: CreatorStep6Analytics,
      validation: creatorStep6Schema,
      nextLabel: 'Finalizar Setup',
      showSkip: true
    },
    7: {
      title: '¡Tu perfil está listo!',
      description: 'Comienza a recibir propuestas de las mejores marcas',
      component: CreatorStep7Success,
      validation: null,
      nextLabel: 'Ir al Dashboard'
    }
  };

  const currentConfig = stepConfig[currentStep as keyof typeof stepConfig];
  const CurrentStepComponent = currentConfig.component;

  const handleNext = async () => {
    if (currentStep < totalSteps && currentConfig.validation) {
      const validation = validateStep(currentConfig.validation, data);
      
      if (!validation.success) {
        setErrors(validation.errors || {});
        return;
      }
    }

    if (currentStep === totalSteps) {
      const success = await completeOnboarding();
      if (success) {
        console.log('Creator onboarding completed successfully!');
      }
      return;
    }

    setErrors({});
    nextStep();
  };

  const handlePrevious = () => {
    setErrors({});
    previousStep();
  };

  const handleSkip = () => {
    if (currentStep === 6) {
      setErrors({});
      nextStep();
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 1) {
      return !data.welcomeComplete;
    }
    if (currentStep === 3) {
      return !data.instagramHandle || data.instagramHandle.length < 3;
    }
    return false;
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      stepTitle={currentConfig.title}
      stepDescription={currentConfig.description}
      onNext={handleNext}
      onPrevious={currentStep > 1 ? handlePrevious : undefined}
      onSkip={currentConfig.showSkip ? handleSkip : undefined}
      nextLabel={currentConfig.nextLabel}
      isNextDisabled={isNextDisabled()}
      isLoading={isLoading}
      showSkip={currentConfig.showSkip}
      userType="creator"
    >
      <CurrentStepComponent
        data={data}
        updateData={updateData}
        errors={errors}
        isLoading={isLoading}
      />
    </OnboardingLayout>
  );
};

export default CreatorOnboarding;