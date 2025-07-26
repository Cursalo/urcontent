import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { reservationsService, creditsService, type Offer, type BookingRequest } from "@/services";
import { toast } from "sonner";
import { 
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Star,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  QrCode,
  Instagram,
  Camera,
  MessageCircle
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BookingModalProps {
  offer: Offer;
  trigger: React.ReactNode;
  onBookingComplete?: (booking: any) => void;
}

export const BookingModal = ({ offer, trigger, onBookingComplete }: BookingModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'details' | 'confirmation' | 'success'>('details');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's credit balance
  const { data: userCredits = 0 } = useQuery({
    queryKey: ['user-credits', user?.id],
    queryFn: () => creditsService.getUserCreditBalance(user?.id!),
    enabled: !!user?.id && isOpen
  });
  
  // Form state
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [contentCommitment, setContentCommitment] = useState("");
  
  // Booking result
  const [bookingResult, setBookingResult] = useState<any>(null);

  const canAfford = userCredits >= offer.credit_cost;
  const isFormValid = selectedDate && selectedTime && instagramHandle && contentCommitment;

  // Create reservation mutation
  const createReservationMutation = useMutation({
    mutationFn: async (bookingData: BookingRequest) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // First create the reservation
      const reservation = await reservationsService.createReservation(user.id, bookingData);
      
      // Then process the credit transaction
      await creditsService.processReservationCredits(
        user.id,
        offer.id,
        offer.credit_cost,
        reservation.id
      );
      
      return reservation;
    },
    onSuccess: (reservation) => {
      setBookingResult(reservation);
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ['user-credits', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-reservations', user?.id] });
      toast.success("Reserva creada exitosamente");
      
      if (onBookingComplete) {
        onBookingComplete(reservation);
      }
    },
    onError: (error: any) => {
      console.error('Booking failed:', error);
      toast.error(error?.message || "Error al crear la reserva");
    }
  });

  const handleBooking = () => {
    if (!isFormValid || !selectedDate) return;

    const bookingData: BookingRequest = {
      offer_id: offer.id,
      scheduled_date: selectedDate.toISOString().split('T')[0],
      scheduled_time: selectedTime,
      guest_count: guestCount,
      special_requests: specialRequests || undefined,
      instagram_handle: instagramHandle,
      content_commitment: contentCommitment
    };

    createReservationMutation.mutate(bookingData);
  };

  const resetModal = () => {
    setStep('details');
    setSelectedDate(undefined);
    setSelectedTime("");
    setGuestCount(1);
    setSpecialRequests("");
    setInstagramHandle("");
    setContentCommitment("");
    setBookingResult(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (step === 'success') {
      setTimeout(resetModal, 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 'details' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Reservar Experiencia</DialogTitle>
              <DialogDescription>
                {offer.title} en {offer.venue?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Offer Summary */}
              <Card className="border border-gray-200 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={offer.images?.[0] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop"}
                      alt={offer.title}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-black mb-1">{offer.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{offer.venue?.name}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{offer.venue?.address || offer.venue?.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{offer.duration_minutes}min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{offer.venue?.rating || 0} ({offer.reservations?.length || 0})</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-bold text-lg">GRATIS</div>
                      <div className="text-gray-500 text-sm line-through">${offer.original_value}</div>
                      <Badge className="bg-black text-white mt-2">
                        {offer.credit_cost} créditos (depósito reembolsable)
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Credit Check */}
              {!canAfford && (
                <Card className="border border-red-200 bg-red-50 rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="font-medium text-red-800">Créditos insuficientes</div>
                        <div className="text-sm text-red-600">
                          Necesitas {offer.credit_cost} créditos, tienes {userCredits}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Date Selection */}
              <div className="space-y-3">
                <Label htmlFor="date">Fecha de la experiencia *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal rounded-2xl"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Selecciona una fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                      locale={es}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              <div className="space-y-3">
                <Label htmlFor="time">Horario disponible *</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Selecciona un horario" />
                  </SelectTrigger>
                  <SelectContent>
                    {offer.available_times?.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    )) || (
                      <SelectItem value="10:00">10:00</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Guest Count */}
              <div className="space-y-3">
                <Label htmlFor="guests">Número de invitados</Label>
                <Select value={guestCount.toString()} onValueChange={(value) => setGuestCount(parseInt(value))}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((count) => (
                      <SelectItem key={count} value={count.toString()}>
                        {count} {count === 1 ? 'persona' : 'personas'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Instagram Handle */}
              <div className="space-y-3">
                <Label htmlFor="instagram">Tu Instagram handle *</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="instagram"
                    placeholder="@tu_usuario"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    className="pl-10 rounded-2xl"
                  />
                </div>
              </div>

              {/* Content Commitment */}
              <div className="space-y-3">
                <Label htmlFor="content">Compromiso de contenido *</Label>
                <Select value={contentCommitment} onValueChange={setContentCommitment}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Selecciona el tipo de contenido" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="story">1 Instagram Story</SelectItem>
                    <SelectItem value="post">1 Instagram Post</SelectItem>
                    <SelectItem value="story_post">1 Story + 1 Post</SelectItem>
                    <SelectItem value="reel">1 Instagram Reel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Special Requests */}
              <div className="space-y-3">
                <Label htmlFor="requests">Solicitudes especiales (opcional)</Label>
                <Textarea
                  id="requests"
                  placeholder="Alergias, preferencias, ocasión especial..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="rounded-2xl"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-2xl"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => setStep('confirmation')}
                  disabled={!isFormValid || !canAfford}
                  className="flex-1 bg-black hover:bg-gray-800 text-white rounded-2xl"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'confirmation' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Confirmar Reserva</DialogTitle>
              <DialogDescription>
                Revisa los detalles antes de confirmar
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Booking Summary */}
              <Card className="border-2 border-black rounded-2xl">
                <CardHeader className="bg-black text-white rounded-t-2xl">
                  <CardTitle className="text-lg">Resumen de tu reserva</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experiencia:</span>
                      <span className="font-medium">{offer.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Venue:</span>
                      <span className="font-medium">{offer.venue?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium">
                        {selectedDate && format(selectedDate, "PPP", { locale: es })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Horario:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invitados:</span>
                      <span className="font-medium">{guestCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Instagram:</span>
                      <span className="font-medium">{instagramHandle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contenido:</span>
                      <span className="font-medium">
                        {contentCommitment === 'story' && '1 Instagram Story'}
                        {contentCommitment === 'post' && '1 Instagram Post'}
                        {contentCommitment === 'story_post' && '1 Story + 1 Post'}
                        {contentCommitment === 'reel' && '1 Instagram Reel'}
                      </span>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <div className="text-right">
                          <div className="text-green-600">GRATIS</div>
                          <div className="text-sm text-gray-500">
                            Depósito: {offer.credit_cost} créditos (se devuelven al check-in)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms */}
              <Card className="border border-gray-200 rounded-2xl bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-gray-600 mt-1" />
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-2">Términos de la reserva:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Los créditos se bloquean como depósito reembolsable</li>
                        <li>• El depósito se devuelve automáticamente al hacer check-in</li>
                        <li>• El contenido debe ser publicado dentro de 24hs</li>
                        <li>• Las menciones al venue son obligatorias</li>
                        <li>• Cancelaciones gratuitas hasta 4hs antes</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('details')}
                  className="flex-1 rounded-2xl"
                >
                  Volver
                </Button>
                <Button
                  onClick={handleBooking}
                  disabled={createReservationMutation.isPending}
                  className="flex-1 bg-black hover:bg-gray-800 text-white rounded-2xl"
                >
                  {createReservationMutation.isPending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmar Reserva
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'success' && bookingResult && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-green-600">¡Reserva Confirmada!</DialogTitle>
              <DialogDescription>
                Tu experiencia ha sido reservada exitosamente
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Success Message */}
              <Card className="border-2 border-green-200 bg-green-50 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    ¡Todo listo!
                  </h3>
                  <p className="text-green-700">
                    Recibirás una confirmación por email y un código QR para tu check-in.
                  </p>
                </CardContent>
              </Card>

              {/* QR Code */}
              <Card className="border border-gray-200 rounded-2xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Tu código QR</CardTitle>
                  <CardDescription>
                    Muestra este código al llegar al venue
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="w-32 h-32 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-gray-600" />
                  </div>
                  <div className="font-mono text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg inline-block">
                    {bookingResult?.qr_code || 'Generando QR...'}
                  </div>
                </CardContent>
              </Card>

              {/* Booking Details */}
              <Card className="border border-gray-200 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Detalles de tu reserva</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID de reserva:</span>
                    <span className="font-mono text-sm">{bookingResult?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span>{bookingResult?.scheduled_date && format(new Date(bookingResult.scheduled_date), "PPP", { locale: es })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Horario:</span>
                    <span>{bookingResult?.scheduled_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Créditos utilizados:</span>
                    <span>{bookingResult?.credits_used}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="border border-blue-200 bg-blue-50 rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Camera className="w-5 h-5 text-blue-600 mt-1" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-2">Próximos pasos:</p>
                      <ol className="space-y-1 text-xs list-decimal list-inside">
                        <li>Llega al venue 15 min antes de tu horario</li>
                        <li>Muestra tu código QR en recepción</li>
                        <li>Disfruta tu experiencia</li>
                        <li>Publica el contenido comprometido en 24hs</li>
                        <li>Etiqueta al venue y usa #URContentArg</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 rounded-2xl"
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    // TODO: Navigate to bookings page
                    handleClose();
                  }}
                  className="flex-1 bg-black hover:bg-gray-800 text-white rounded-2xl"
                >
                  Ver Mis Reservas
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};