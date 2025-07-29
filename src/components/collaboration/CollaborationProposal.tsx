import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Calendar, DollarSign, Clock, Target, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DatePicker } from '@/components/ui/date-picker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  categories: string[];
  followers: number;
  rating: number;
  priceRange: { min: number; max: number };
}

interface CollaborationProposalProps {
  creator: Creator;
  onSubmit: (proposal: CollaborationProposalData) => void;
  onCancel: () => void;
  className?: string;
}

const proposalSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  budget: z.number().min(100, 'El presupuesto mínimo es $100'),
  deliverables: z.array(z.string()).min(1, 'Debe seleccionar al menos un entregable'),
  timeline: z.number().min(1, 'El timeline debe ser de al menos 1 día'),
  deadline: z.date().refine(date => date > new Date(), 'La fecha límite debe ser futura'),
  requirements: z.string().optional(),
  collaboration_type: z.enum(['sponsored_post', 'product_review', 'brand_ambassador', 'event_coverage', 'content_creation', 'other']),
  payment_terms: z.enum(['upfront', '50_50', 'on_completion', 'milestone_based']),
  usage_rights: z.enum(['social_media_only', 'website_usage', 'advertising_rights', 'full_rights']),
  exclusivity: z.boolean(),
  revisions_included: z.number().min(0).max(5),
  additional_notes: z.string().optional()
});

export type CollaborationProposalData = z.infer<typeof proposalSchema>;

const DELIVERABLE_OPTIONS = [
  { id: 'instagram_post', label: 'Post de Instagram', icon: '📷' },
  { id: 'instagram_story', label: 'Historia de Instagram', icon: '📱' },
  { id: 'instagram_reel', label: 'Reel de Instagram', icon: '🎥' },
  { id: 'tiktok_video', label: 'Video de TikTok', icon: '🎵' },
  { id: 'youtube_video', label: 'Video de YouTube', icon: '▶️' },
  { id: 'blog_post', label: 'Artículo de blog', icon: '📝' },
  { id: 'product_photos', label: 'Fotos de producto', icon: '📸' },
  { id: 'testimonial', label: 'Testimonial', icon: '💬' }
];

const COLLABORATION_TYPES = [
  { value: 'sponsored_post', label: 'Post patrocinado' },
  { value: 'product_review', label: 'Reseña de producto' },
  { value: 'brand_ambassador', label: 'Embajador de marca' },
  { value: 'event_coverage', label: 'Cobertura de evento' },
  { value: 'content_creation', label: 'Creación de contenido' },
  { value: 'other', label: 'Otro' }
];

const PAYMENT_TERMS = [
  { value: 'upfront', label: 'Pago por adelantado' },
  { value: '50_50', label: '50% adelantado, 50% al completar' },
  { value: 'on_completion', label: 'Pago al finalizar' },
  { value: 'milestone_based', label: 'Basado en hitos' }
];

const USAGE_RIGHTS = [
  { value: 'social_media_only', label: 'Solo redes sociales' },
  { value: 'website_usage', label: 'Uso en sitio web' },
  { value: 'advertising_rights', label: 'Derechos publicitarios' },
  { value: 'full_rights', label: 'Derechos completos' }
];

export const CollaborationProposal: React.FC<CollaborationProposalProps> = ({
  creator,
  onSubmit,
  onCancel,
  className = ''
}) => {
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [estimatedBudget, setEstimatedBudget] = useState<number>(creator.priceRange.min);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<CollaborationProposalData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: '',
      description: '',
      budget: creator.priceRange.min,
      deliverables: [],
      timeline: 7,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      requirements: '',
      collaboration_type: 'sponsored_post',
      payment_terms: '50_50',
      usage_rights: 'social_media_only',
      exclusivity: false,
      revisions_included: 2,
      additional_notes: ''
    }
  });

  const handleDeliverableChange = (deliverable: string, checked: boolean) => {
    const newDeliverables = checked
      ? [...selectedDeliverables, deliverable]
      : selectedDeliverables.filter(d => d !== deliverable);
    
    setSelectedDeliverables(newDeliverables);
    form.setValue('deliverables', newDeliverables);
    
    // Adjust budget estimate based on deliverables
    const basePrice = creator.priceRange.min;
    const multiplier = newDeliverables.length * 0.5 + 1;
    setEstimatedBudget(Math.round(basePrice * multiplier));
    form.setValue('budget', Math.round(basePrice * multiplier));
  };

  const handleSubmit = async (data: CollaborationProposalData) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      onSubmit(data);
      toast({
        title: 'Propuesta enviada',
        description: `Tu propuesta ha sido enviada a ${creator.name}. Te notificaremos cuando responda.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Hubo un problema al enviar la propuesta. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
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
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={creator.avatar} alt={creator.name} />
                <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">Propuesta de colaboración</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Para: <strong>{creator.name}</strong></span>
                  <span>@{creator.username}</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{creator.followers.toLocaleString()} seguidores</span>
                  </div>
                </div>
                <div className="flex gap-1 mt-2">
                  {creator.categories.map(category => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Información básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título de la colaboración *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Promoción de nueva línea de skincare"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collaboration_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de colaboración *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COLLABORATION_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción del proyecto *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe en detalle qué necesitas, tu marca, objetivos, audiencia objetivo, etc."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Proporciona toda la información relevante para ayudar al creator a entender tu proyecto.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Deliverables */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Entregables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="deliverables"
                  render={() => (
                    <FormItem>
                      <FormLabel>Qué necesitas que cree el creator? *</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                        {DELIVERABLE_OPTIONS.map(deliverable => (
                          <div key={deliverable.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={deliverable.id}
                              checked={selectedDeliverables.includes(deliverable.id)}
                              onCheckedChange={(checked) => 
                                handleDeliverableChange(deliverable.id, checked as boolean)
                              }
                            />
                            <Label 
                              htmlFor={deliverable.id} 
                              className="text-sm cursor-pointer flex items-center gap-2"
                            >
                              <span>{deliverable.icon}</span>
                              {deliverable.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Budget & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Presupuesto y cronograma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Presupuesto (ARS) *</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input
                              type="number"
                              min={creator.priceRange.min}
                              max={creator.priceRange.max * 3}
                              {...field}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                field.onChange(value);
                                setEstimatedBudget(value);
                              }}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Mín: {formatCurrency(creator.priceRange.min)}</span>
                              <span>Sugerido: {formatCurrency(estimatedBudget)}</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duración del proyecto (días) *</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Slider
                              value={[field.value]}
                              onValueChange={([value]) => field.onChange(value)}
                              min={1}
                              max={30}
                              step={1}
                              className="w-full"
                            />
                            <div className="text-center text-sm font-medium">
                              {field.value} día{field.value !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha límite *</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          onDateChange={field.onChange}
                          placeholder="Seleccionar fecha"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="payment_terms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Términos de pago</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAYMENT_TERMS.map(term => (
                              <SelectItem key={term.value} value={term.value}>
                                {term.label}
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
                    name="revisions_included"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Revisiones incluidas</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5].map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num === 0 ? 'Sin revisiones' : `${num} revision${num > 1 ? 'es' : ''}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Rights & Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Derechos y requisitos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="usage_rights"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Derechos de uso del contenido</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {USAGE_RIGHTS.map(right => (
                            <SelectItem key={right.value} value={right.value}>
                              {right.label}
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
                  name="exclusivity"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Exclusividad en la categoría
                        </FormLabel>
                        <FormDescription>
                          El creator no podrá trabajar con competidores durante el proyecto
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requisitos especiales</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Menciona cualquier requisito específico: estilo, colores de marca, hashtags obligatorios, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additional_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas adicionales</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Cualquier información adicional que consideres relevante..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Budget Summary Alert */}
            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertDescription>
                <strong>Resumen del presupuesto:</strong> {formatCurrency(estimatedBudget)} por {selectedDeliverables.length} entregable{selectedDeliverables.length !== 1 ? 's' : ''} en {form.watch('timeline')} día{form.watch('timeline') !== 1 ? 's' : ''}.
                {estimatedBudget < creator.priceRange.min && (
                  <span className="text-destructive ml-2">
                    Este presupuesto está por debajo del rango recomendado para este creator.
                  </span>
                )}
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || selectedDeliverables.length === 0}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Enviando propuesta...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar propuesta
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

export default CollaborationProposal;