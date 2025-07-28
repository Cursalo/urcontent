import React, { useState, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

// Enhanced form validation schema
const loginSchema = z.object({
  email: z.string()
    .min(1, "El email es requerido")
    .email("Ingresa un email válido"),
  password: z.string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres")
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = memo(({ onSuccess }) => {
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const { handleSubmit, formState: { isSubmitting } } = form;

  const onSubmit = useCallback(async (data: LoginFormData) => {
    setError('');

    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        setError(error.message);
      } else {
        onSuccess?.();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  }, [signIn, onSuccess]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto bg-white border border-gray-100 rounded-3xl shadow-xl shadow-black/5">
      <CardHeader className="space-y-6 pt-12 pb-8">
      </CardHeader>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 px-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-medium text-black">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="tu@email.com"
                      disabled={isSubmitting}
                      className="h-12 rounded-2xl border-gray-200 focus:border-black focus:ring-black text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-medium text-black">Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        className="h-12 rounded-2xl border-gray-200 focus:border-black focus:ring-black text-base pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-4 hover:bg-transparent rounded-r-2xl"
                        onClick={togglePasswordVisibility}
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm text-black/70 hover:text-black transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-6 px-8 pb-12">
            <Button 
              type="submit" 
              className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-2xl font-medium text-base transition-all duration-300 hover:scale-105" 
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Sesión
            </Button>
            
            <div className="text-center text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="text-black font-medium hover:underline transition-colors">
                Regístrate aquí
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
});

LoginForm.displayName = "LoginForm";