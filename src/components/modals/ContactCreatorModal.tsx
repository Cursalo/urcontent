import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  MessageCircle, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Clock,
  Star,
  Target,
  Users,
  Camera,
  Video,
  Image as ImageIcon,
  X,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ContactCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    specialties: string[];
    rate: { min: number; max: number };
    urScore: number;
  };
}

const deliverableTypes = [
  { value: "instagram_post", label: "Instagram Post", icon: ImageIcon },
  { value: "instagram_story", label: "Instagram Stories", icon: Camera },
  { value: "instagram_reel", label: "Instagram Reel", icon: Video },
  { value: "youtube_video", label: "YouTube Video", icon: Video },
  { value: "tiktok_video", label: "TikTok Video", icon: Video },
  { value: "blog_post", label: "Blog Post", icon: ImageIcon },
  { value: "event_coverage", label: "Event Coverage", icon: Camera },
  { value: "product_unboxing", label: "Product Unboxing", icon: Camera }
];

const campaignTypes = [
  { value: "product_review", label: "Product Review" },
  { value: "brand_awareness", label: "Brand Awareness" },
  { value: "product_launch", label: "Product Launch" },
  { value: "event_promotion", label: "Event Promotion" },
  { value: "seasonal_campaign", label: "Seasonal Campaign" },
  { value: "user_generated_content", label: "User Generated Content" }
];

export const ContactCreatorModal = ({ isOpen, onClose, creator }: ContactCreatorModalProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Campaign Details
    campaignName: "",
    campaignType: "",
    description: "",
    objectives: "",
    
    // Deliverables
    deliverables: [] as string[],
    quantity: 1,
    
    // Timeline
    startDate: null as Date | null,
    deadline: null as Date | null,
    
    // Budget
    budget: creator.rate.min,
    negotiable: true,
    
    // Additional Info
    brandName: "",
    website: "",
    productInfo: "",
    hashtags: "",
    mentions: "",
    additionalRequirements: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleDeliverable = (deliverable: string) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.includes(deliverable)
        ? prev.deliverables.filter(d => d !== deliverable)
        : [...prev.deliverables, deliverable]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Close modal after showing success
    setTimeout(() => {
      setIsSubmitted(false);
      setStep(1);
      onClose();
    }, 3000);
  };

  const canProceedToNext = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return formData.campaignName && formData.campaignType && formData.description;
      case 2:
        return formData.deliverables.length > 0;
      case 3:
        return formData.startDate && formData.deadline;
      case 4:
        return formData.budget > 0;
      default:
        return true;
    }
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-black mb-4">
              ¡Propuesta Enviada!
            </h3>
            <p className="text-gray-600 mb-6">
              Tu propuesta ha sido enviada a {creator.name}. Te notificaremos cuando responda.
            </p>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-sm text-gray-700">
                <strong>Tiempo de respuesta promedio:</strong> 24-48 horas
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-100 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={creator.avatar} alt={creator.name} />
                <AvatarFallback>{creator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-light text-black">
                  Propuesta para {creator.name}
                </DialogTitle>
                <DialogDescription className="text-lg">
                  {creator.username} • URScore: {creator.urScore}
                </DialogDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-light text-black">
                ${creator.rate.min} - ${creator.rate.max}
              </div>
              <div className="text-gray-500 text-sm">Tarifa sugerida</div>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 py-6">
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step >= stepNumber 
                  ? 'bg-black text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 5 && (
                <div className={`w-12 h-0.5 mx-2 transition-colors ${
                  step > stepNumber ? 'bg-black' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Step 1: Campaign Overview */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-black mb-4">Detalles de la Campaña</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="campaignName">Nombre de la Campaña *</Label>
                    <Input
                      id="campaignName"
                      placeholder="Ej: Lanzamiento Producto Verano 2024"
                      value={formData.campaignName}
                      onChange={(e) => setFormData(prev => ({...prev, campaignName: e.target.value}))}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="campaignType">Tipo de Campaña *</Label>
                    <Select value={formData.campaignType} onValueChange={(value) => setFormData(prev => ({...prev, campaignType: value}))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Selecciona el tipo de campaña" />
                      </SelectTrigger>
                      <SelectContent>
                        {campaignTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción de la Campaña *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe qué quieres lograr con esta campaña, el tono, estilo y mensaje clave..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                      className="mt-2 min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="objectives">Objetivos Específicos</Label>
                    <Textarea
                      id="objectives"
                      placeholder="Ej: Incrementar awareness de marca, generar 1000 visitas al sitio web, obtener 500 interacciones..."
                      value={formData.objectives}
                      onChange={(e) => setFormData(prev => ({...prev, objectives: e.target.value}))}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Deliverables */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-black mb-4">Entregables</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Selecciona los tipos de contenido *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      {deliverableTypes.map((deliverable) => (
                        <Card
                          key={deliverable.value}
                          className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                            formData.deliverables.includes(deliverable.value)
                              ? 'bg-black text-white border-black'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleDeliverable(deliverable.value)}
                        >
                          <div className="text-center">
                            <deliverable.icon className="w-6 h-6 mx-auto mb-2" />
                            <div className="text-sm font-medium">{deliverable.label}</div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="quantity">Cantidad Total de Piezas</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({...prev, quantity: Math.max(1, prev.quantity - 1)}))}
                        className="rounded-full"
                      >
                        -
                      </Button>
                      <span className="text-xl font-medium w-16 text-center">{formData.quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({...prev, quantity: prev.quantity + 1}))}
                        className="rounded-full"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Timeline */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-black mb-4">Timeline</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Fecha de Inicio *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-2"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.startDate ? format(formData.startDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.startDate || undefined}
                          onSelect={(date) => setFormData(prev => ({...prev, startDate: date || null}))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>Fecha de Entrega *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-2"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.deadline ? format(formData.deadline, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.deadline || undefined}
                          onSelect={(date) => setFormData(prev => ({...prev, deadline: date || null}))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6 mt-6">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Recomendación de Timeline</h4>
                      <p className="text-blue-700 text-sm">
                        Para obtener los mejores resultados, recomendamos dar al menos 7-10 días para la creación de contenido de calidad.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Budget */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-black mb-4">Presupuesto</h3>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="budget">Presupuesto Propuesto *</Label>
                    <div className="relative mt-2">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="budget"
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData(prev => ({...prev, budget: Number(e.target.value)}))}
                        className="pl-10"
                        min={creator.rate.min}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 text-sm">
                      <span className="text-gray-500">Rango sugerido: ${creator.rate.min} - ${creator.rate.max}</span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="negotiable"
                          checked={formData.negotiable}
                          onChange={(e) => setFormData(prev => ({...prev, negotiable: e.target.checked}))}
                          className="rounded"
                        />
                        <Label htmlFor="negotiable" className="text-sm">Presupuesto negociable</Label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-medium text-gray-900 mb-3">Desglose Estimado</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Costo base por entregable</span>
                        <span>${Math.round(formData.budget / formData.quantity)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cantidad de piezas</span>
                        <span>{formData.quantity}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>Total</span>
                        <span>${formData.budget}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Additional Information */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-black mb-4">Información Adicional</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brandName">Nombre de la Marca</Label>
                      <Input
                        id="brandName"
                        placeholder="Tu marca o empresa"
                        value={formData.brandName}
                        onChange={(e) => setFormData(prev => ({...prev, brandName: e.target.value}))}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Sitio Web</Label>
                      <Input
                        id="website"
                        placeholder="https://tumarca.com"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({...prev, website: e.target.value}))}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="productInfo">Información del Producto/Servicio</Label>
                    <Textarea
                      id="productInfo"
                      placeholder="Describe el producto o servicio que quieres promocionar..."
                      value={formData.productInfo}
                      onChange={(e) => setFormData(prev => ({...prev, productInfo: e.target.value}))}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hashtags">Hashtags Requeridos</Label>
                      <Input
                        id="hashtags"
                        placeholder="#tumarca #producto #sponsored"
                        value={formData.hashtags}
                        onChange={(e) => setFormData(prev => ({...prev, hashtags: e.target.value}))}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mentions">Menciones Requeridas</Label>
                      <Input
                        id="mentions"
                        placeholder="@tumarca @producto"
                        value={formData.mentions}
                        onChange={(e) => setFormData(prev => ({...prev, mentions: e.target.value}))}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="additionalRequirements">Requerimientos Adicionales</Label>
                    <Textarea
                      id="additionalRequirements"
                      placeholder="Cualquier información adicional, estilo específico, elementos que deben incluirse, etc..."
                      value={formData.additionalRequirements}
                      onChange={(e) => setFormData(prev => ({...prev, additionalRequirements: e.target.value}))}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="rounded-full px-6"
          >
            Anterior
          </Button>

          <div className="text-sm text-gray-500">
            Paso {step} de 5
          </div>

          {step < 5 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceedToNext(step)}
              className="bg-black hover:bg-gray-800 text-white rounded-full px-6"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-black hover:bg-gray-800 text-white rounded-full px-6"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar Propuesta
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};