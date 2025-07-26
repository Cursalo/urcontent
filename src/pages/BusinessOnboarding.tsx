import React from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { useBusinessOnboarding } from '@/hooks/useOnboarding';
import { BusinessStep1Welcome } from '@/components/onboarding/business/BusinessStep1Welcome';
import { BusinessStep2BasicInfo } from '@/components/onboarding/business/BusinessStep2BasicInfo';
import { BusinessStep3Contact } from '@/components/onboarding/business/BusinessStep3Contact';
import { BusinessStep4Digital } from '@/components/onboarding/business/BusinessStep4Digital';
import { BusinessStep5Marketing } from '@/components/onboarding/business/BusinessStep5Marketing';
import { BusinessStep6Preferences } from '@/components/onboarding/business/BusinessStep6Preferences';
import { BusinessStep7Success } from '@/components/onboarding/business/BusinessStep7Success';
import { validateStep } from '@/lib/validation';
import {
  businessStep1Schema,
  businessStep2Schema,
  businessStep3Schema,
  businessStep4Schema,
  businessStep5Schema,
  businessStep6Schema
} from '@/lib/validation';

const BusinessOnboarding: React.FC = () => {
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
  } = useBusinessOnboarding();

  const stepConfig = {
    1: {
      title: '¡Bienvenido a URContent!',
      description: 'Descubre cómo conectar con los mejores creadores de contenido de Argentina',
      component: BusinessStep1Welcome,
      validation: businessStep1Schema,
      nextLabel: 'Comenzar'
    },
    2: {
      title: 'Información de tu Empresa',
      description: 'Cuéntanos sobre tu empresa para crear el perfil perfecto',
      component: BusinessStep2BasicInfo,
      validation: businessStep2Schema,
      nextLabel: 'Continuar'
    },
    3: {
      title: 'Datos de Contacto',
      description: '¿Cómo podemos contactarte y dónde se ubica tu empresa?',
      component: BusinessStep3Contact,
      validation: businessStep3Schema,
      nextLabel: 'Continuar'
    },
    4: {
      title: 'Presencia Digital',
      description: 'Conecta tus redes sociales y sube el logo de tu marca',
      component: BusinessStep4Digital,
      validation: businessStep4Schema,
      nextLabel: 'Continuar',
      showSkip: true
    },
    5: {
      title: 'Objetivos de Marketing',
      description: 'Define tu presupuesto y objetivos para colaboraciones efectivas',
      component: BusinessStep5Marketing,
      validation: businessStep5Schema,
      nextLabel: 'Continuar'
    },
    6: {
      title: 'Preferencias de Creadores',
      description: 'Especifica qué tipo de creadores y colaboraciones buscas',
      component: BusinessStep6Preferences,
      validation: businessStep6Schema,
      nextLabel: 'Finalizar Setup'
    },
    7: {
      title: '¡Tu perfil está listo!',
      description: 'Comienza a explorar creadores y crear campañas increíbles',
      component: BusinessStep7Success,
      validation: null,
      nextLabel: 'Ir al Dashboard'
    }
  };

  const currentConfig = stepConfig[currentStep as keyof typeof stepConfig];
  const CurrentStepComponent = currentConfig.component;

  const handleNext = async () => {
    // Validate current step if not the last step
    if (currentStep < totalSteps && currentConfig.validation) {
      const validation = validateStep(currentConfig.validation, data);
      
      if (!validation.success) {
        setErrors(validation.errors || {});
        return;
      }
    }

    // If last step, complete onboarding
    if (currentStep === totalSteps) {
      const success = await completeOnboarding();
      if (success) {
        // Redirect to dashboard would happen here
        console.log('Onboarding completed successfully!');
      }
      return;
    }

    // Clear errors and move to next step
    setErrors({});
    nextStep();
  };

  const handlePrevious = () => {
    setErrors({});
    previousStep();
  };

  const handleSkip = () => {
    // Only certain steps can be skipped
    if (currentStep === 4) {
      setErrors({});
      nextStep();
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 1) {
      return !data.welcomeComplete;
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
      userType="business"
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

export default BusinessOnboarding;