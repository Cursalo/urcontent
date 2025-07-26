import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  stepDescription: string;
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  showSkip?: boolean;
  userType: 'creator' | 'business';
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  currentStep,
  totalSteps,
  stepTitle,
  stepDescription,
  onNext,
  onPrevious,
  onSkip,
  nextLabel = 'Continuar',
  isNextDisabled = false,
  isLoading = false,
  showSkip = false,
  userType
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  const userTypeConfig = {
    creator: {
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      icon: '🎨',
      title: 'Creador'
    },
    business: {
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      icon: '🏢',
      title: 'Marca'
    }
  };

  const config = userTypeConfig[userType];

  return (
    <div className={`min-h-screen ${config.bgColor}`}>
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 bg-gradient-to-r ${config.color} rounded-full flex items-center justify-center text-white font-bold`}>
                {config.icon}
              </div>
              <span className="font-semibold text-gray-900">
                Onboarding {config.title}
              </span>
            </div>

            <div className="text-sm text-gray-500">
              Paso {currentStep} de {totalSteps}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {stepTitle}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-3 rounded-full"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Step Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              {Array.from({ length: totalSteps }, (_, i) => {
                const stepNumber = i + 1;
                const isCompleted = stepNumber < currentStep;
                const isCurrent = stepNumber === currentStep;
                
                return (
                  <React.Fragment key={stepNumber}>
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                      ${isCompleted 
                        ? `bg-gradient-to-r ${config.color} text-white` 
                        : isCurrent 
                          ? `bg-gradient-to-r ${config.color} text-white` 
                          : 'bg-gray-200 text-gray-500'
                      }
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        stepNumber
                      )}
                    </div>
                    {stepNumber < totalSteps && (
                      <div className={`
                        h-1 w-12 mx-2
                        ${stepNumber < currentStep 
                          ? `bg-gradient-to-r ${config.color}` 
                          : 'bg-gray-200'
                        }
                      `} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {stepTitle}
            </h1>
            <p className="text-lg text-gray-600 max-w-lg mx-auto">
              {stepDescription}
            </p>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
            {children}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={onPrevious}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
              )}
              
              {showSkip && onSkip && (
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  disabled={isLoading}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Saltar por ahora
                </Button>
              )}
            </div>

            <Button
              onClick={onNext}
              disabled={isNextDisabled || isLoading}
              className={`bg-gradient-to-r ${config.color} hover:opacity-90 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Procesando...
                </div>
              ) : (
                <>
                  {nextLabel}
                  {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className={`absolute top-20 right-20 w-72 h-72 bg-gradient-to-r ${config.color} rounded-full opacity-5 blur-3xl`} />
        <div className={`absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r ${config.color} rounded-full opacity-3 blur-3xl`} />
      </div>
    </div>
  );
};