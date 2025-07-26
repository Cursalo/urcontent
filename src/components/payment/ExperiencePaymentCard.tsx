import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Calendar as CalendarIcon, 
  CreditCard,
  Gift,
  Sparkles,
  CheckCircle,
  Crown
} from 'lucide-react';
import { PaymentButton } from './PaymentButton';
import { formatCurrency } from '@/lib/mercadopago';

interface Experience {
  id: string;
  title: string;
  description: string;
  venue: string;
  location: string;
  duration: string;
  capacity: number;
  price: number;
  credits: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  images: string[];
  membershipTier: 'basic' | 'premium' | 'vip' | 'all';
  availability: Date[];
  timeSlots: string[];
}

interface ExperiencePaymentCardProps {
  experience: Experience;
  onBookingSuccess?: (bookingId: string) => void;
}

export const ExperiencePaymentCard: React.FC<ExperiencePaymentCardProps> = ({
  experience,
  onBookingSuccess
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credits' | 'cash'>('credits');

  const getMembershipBadge = (tier: string) => {
    const badges = {
      basic: { label: 'Básico', color: 'bg-blue-100 text-blue-800' },
      premium: { label: 'Premium', color: 'bg-purple-100 text-purple-800' },
      vip: { label: 'Solo VIP', color: 'bg-yellow-100 text-yellow-800' },
      all: { label: 'Todos', color: 'bg-gray-100 text-gray-800' }
    };
    
    const badge = badges[tier as keyof typeof badges] || badges.all;
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  const getMembershipIcon = (tier: string) => {
    switch (tier) {
      case 'vip':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'premium':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      default:
        return <Gift className="w-4 h-4 text-blue-600" />;
    }
  };

  const totalPrice = experience.price * guests;
  const totalCredits = experience.credits * guests;

  const handleBookingSuccess = (paymentId: string) => {
    onBookingSuccess?.(paymentId);
  };

  const isBookingComplete = selectedDate && selectedTime && guests > 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Experience Image */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
        {experience.images.length > 0 ? (
          <img 
            src={experience.images[0]} 
            alt={experience.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-75">Imagen no disponible</p>
            </div>
          </div>
        )}
        
        {/* Membership Badge */}
        <div className="absolute top-4 left-4">
          {getMembershipBadge(experience.membershipTier)}
        </div>
        
        {/* Rating */}
        <div className="absolute top-4 right-4 bg-black/70 rounded-full px-3 py-1 text-white text-sm flex items-center">
          <Star className="w-4 h-4 fill-current text-yellow-400 mr-1" />
          {experience.rating.toFixed(1)} ({experience.reviewCount})
        </div>
      </div>

      {/* Experience Details */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {experience.title}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {experience.description}
            </p>
          </div>
          <div className="ml-4">
            {getMembershipIcon(experience.membershipTier)}
          </div>
        </div>

        {/* Experience Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{experience.venue} • {experience.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>{experience.duration}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span>Hasta {experience.capacity} personas</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {experience.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {experience.credits} créditos
                </div>
                <div className="text-xs text-gray-500">o</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(experience.price)}
                </div>
                <div className="text-xs text-gray-500">por persona</div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Reservar Experiencia
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Reservar: {experience.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Experience Summary */}
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Gift className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{experience.title}</h4>
                    <p className="text-sm text-gray-600">{experience.venue}</p>
                    <div className="flex items-center mt-1">
                      <Clock className="w-4 h-4 mr-1 text-gray-500" />
                      <span className="text-sm text-gray-600">{experience.duration}</span>
                    </div>
                  </div>
                  {getMembershipBadge(experience.membershipTier)}
                </div>
              </Card>

              {/* Date Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Selecciona una fecha
                </Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => 
                    date < new Date() || 
                    !experience.availability.some(d => 
                      d.toDateString() === date.toDateString()
                    )
                  }
                  className="rounded-md border mx-auto"
                />
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Horario disponible
                  </Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un horario" />
                    </SelectTrigger>
                    <SelectContent>
                      {experience.timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Guest Count */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Número de personas
                </Label>
                <Select value={guests.toString()} onValueChange={(value) => setGuests(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: experience.capacity }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1} {i === 0 ? 'persona' : 'personas'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Método de pago
                </Label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credits"
                      checked={paymentMethod === 'credits'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center">
                        <Gift className="w-4 h-4 mr-2 text-blue-600" />
                        Usar {totalCredits} créditos
                      </div>
                      <div className="text-sm text-gray-600">
                        Usa tus créditos de membresía
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Recomendado</Badge>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-green-600" />
                        Pagar {formatCurrency(totalPrice)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Pago directo con tarjeta
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Solicitudes especiales (opcional)
                </Label>
                <Textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Alergias, preferencias dietéticas, ocasiones especiales..."
                  rows={3}
                />
              </div>

              {/* Booking Summary */}
              <Card className="p-4 bg-green-50 border-green-200">
                <h4 className="font-medium text-gray-900 mb-3">Resumen de la reserva</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experiencia:</span>
                    <span className="font-medium">{experience.title}</span>
                  </div>
                  {selectedDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium">
                        {selectedDate.toLocaleDateString('es-AR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  )}
                  {selectedTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Horario:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Personas:</span>
                    <span className="font-medium">{guests}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg pt-2 border-t border-green-200">
                    <span>Total:</span>
                    <span className="text-green-600">
                      {paymentMethod === 'credits' 
                        ? `${totalCredits} créditos` 
                        : formatCurrency(totalPrice)
                      }
                    </span>
                  </div>
                </div>
              </Card>

              {/* Booking Button */}
              {paymentMethod === 'cash' ? (
                <PaymentButton
                  amount={totalPrice}
                  description={`${experience.title} - ${guests} persona${guests > 1 ? 's' : ''}`}
                  paymentType="experience"
                  userId="temp-user-id"
                  userEmail="user@example.com"
                  userName="Usuario"
                  metadata={{
                    experience_id: experience.id,
                    selected_date: selectedDate?.toISOString(),
                    selected_time: selectedTime,
                    guests,
                    special_requests: specialRequests,
                    venue: experience.venue,
                    duration: experience.duration
                  }}
                  onSuccess={handleBookingSuccess}
                  disabled={!isBookingComplete}
                  variant="gradient"
                  size="lg"
                  className="w-full"
                />
              ) : (
                <Button
                  onClick={() => {
                    // Handle credits payment
                    if (isBookingComplete) {
                      handleBookingSuccess('credits-booking-' + Date.now());
                    }
                  }}
                  disabled={!isBookingComplete}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Confirmar Reserva con Créditos
                </Button>
              )}

              {!isBookingComplete && (
                <p className="text-center text-sm text-gray-500">
                  Completa todos los campos para continuar
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};