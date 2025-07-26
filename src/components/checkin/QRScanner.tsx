import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { reservationsService, type Reservation } from "@/services";
import { toast } from "sonner";
import { 
  QrCode,
  Camera,
  CheckCircle,
  XCircle,
  Clock,
  User,
  MapPin,
  Star,
  AlertCircle,
  RefreshCw,
  Calendar,
  CreditCard,
  MessageCircle,
  FileText
} from "lucide-react";

interface QRScannerProps {
  venueId: string;
  onCheckInComplete?: (checkIn: any) => void;
}


export const QRScanner = ({ venueId, onCheckInComplete }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string>("");
  const [reservationDetails, setReservationDetails] = useState<Reservation | null>(null);
  const [scanError, setScanError] = useState<string>("");
  const [staffNotes, setStaffNotes] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const queryClient = useQueryClient();

  // QR code lookup mutation
  const lookupReservationMutation = useMutation({
    mutationFn: async (qrCode: string) => {
      const reservation = await reservationsService.getReservationByQRCode(qrCode);
      if (!reservation) {
        throw new Error("Código QR no válido o reserva no encontrada");
      }
      // Verify this reservation belongs to the current venue
      if (reservation.venue_id !== venueId) {
        throw new Error("Esta reserva no pertenece a este venue");
      }
      return reservation;
    },
    onSuccess: (reservation) => {
      setReservationDetails(reservation);
      setScanError("");
      toast.success("Reserva encontrada");
    },
    onError: (error: any) => {
      setScanError(error.message || "Error al buscar la reserva");
      setReservationDetails(null);
      toast.error(error.message || "Error al buscar la reserva");
    }
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (reservationId: string) => {
      return await reservationsService.checkInReservation(
        reservationId,
        staffNotes || undefined
      );
    },
    onSuccess: (updatedReservation) => {
      setReservationDetails(updatedReservation);
      queryClient.invalidateQueries({ queryKey: ['venue-reservations', venueId] });
      queryClient.invalidateQueries({ queryKey: ['today-reservations', venueId] });
      toast.success("Check-in realizado exitosamente");
      
      if (onCheckInComplete) {
        onCheckInComplete({
          reservationId: updatedReservation.id,
          venueId,
          checkInTime: updatedReservation.check_in_time,
          staffNotes,
          verifiedByVenue: true,
          status: 'checked_in'
        });
      }

      // Reset scanner after successful check-in
      setTimeout(() => {
        setReservationDetails(null);
        setScanResult("");
        setStaffNotes("");
      }, 3000);
    },
    onError: (error: any) => {
      setScanError("Error al procesar el check-in. Intenta nuevamente.");
      toast.error(error.message || "Error al procesar el check-in");
    }
  });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera for better QR scanning
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setIsScanning(true);
      setScanError("");
    } catch (error) {
      setScanError("No se pudo acceder a la cámara. Por favor, permite el acceso.");
      console.error('Camera access error:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualEntry = () => {
    const qrCode = scanResult.trim();
    if (!qrCode) {
      setScanError("Por favor ingresa un código QR válido");
      return;
    }

    lookupReservationMutation.mutate(qrCode);
  };

  const handleCheckIn = () => {
    if (!reservationDetails) return;
    checkInMutation.mutate(reservationDetails.id);
  };

  const getMembershipBadgeColor = (tier: string) => {
    const colors = {
      basic: "bg-gray-100 text-gray-800",
      premium: "bg-blue-100 text-blue-800", 
      vip: "bg-purple-100 text-purple-800"
    };
    return colors[tier as keyof typeof colors] || colors.basic;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      booked: { label: "Reservado", color: "bg-blue-100 text-blue-800", icon: Clock },
      confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-800", icon: Clock },
      checked_in: { label: "Check-in Exitoso", color: "bg-green-100 text-green-800", icon: CheckCircle },
      completed: { label: "Completado", color: "bg-green-100 text-green-800", icon: CheckCircle },
      no_show: { label: "No Show", color: "bg-red-100 text-red-800", icon: XCircle },
      cancelled: { label: "Cancelado", color: "bg-gray-100 text-gray-800", icon: XCircle }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.booked;
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Scanner Header */}
      <Card className="border border-gray-200 rounded-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center space-x-2">
            <QrCode className="w-6 h-6" />
            <span>Escanear QR - Check-in</span>
          </CardTitle>
          <CardDescription>
            Escanea el código QR del cliente para procesar su check-in
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Camera Scanner */}
      {!reservationDetails && (
        <Card className="border border-gray-200 rounded-3xl">
          <CardContent className="p-6">
            {!isScanning ? (
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl mx-auto flex items-center justify-center">
                  <Camera className="w-12 h-12 text-gray-400" />
                </div>
                <Button 
                  onClick={startCamera}
                  className="bg-black hover:bg-gray-800 text-white rounded-2xl px-8 py-3"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Iniciar Escáner
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-black rounded-2xl overflow-hidden">
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 border-4 border-white border-dashed rounded-2xl m-4 flex items-center justify-center">
                    <div className="text-white text-center">
                      <QrCode className="w-16 h-16 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-75">Centra el código QR en el marco</p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={stopCamera}
                  variant="outline"
                  className="w-full rounded-2xl"
                >
                  Detener Escáner
                </Button>
              </div>
            )}

            <Separator className="my-6" />

            {/* Manual Entry */}
            <div className="space-y-4">
              <Label htmlFor="qr-input" className="text-sm font-medium">
                O ingresa el código manualmente:
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="qr-input"
                  placeholder="QR-ABC123DEF456"
                  value={scanResult}
                  onChange={(e) => setScanResult(e.target.value)}
                  className="rounded-2xl"
                />
                <Button 
                  onClick={handleManualEntry}
                  disabled={lookupReservationMutation.isPending}
                  className="bg-black hover:bg-gray-800 text-white rounded-2xl px-6"
                >
                  {lookupReservationMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    "Buscar"
                  )}
                </Button>
              </div>
            </div>

            {/* Error Display */}
            {scanError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 text-sm">{scanError}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reservation Details */}
      {reservationDetails && (
        <Card className="border-2 border-black rounded-3xl">
          <CardHeader className="bg-black text-white rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Reserva Encontrada</CardTitle>
                <CardDescription className="text-gray-300">
                  ID: {reservationDetails.id}
                </CardDescription>
              </div>
              {getStatusBadge(reservationDetails.status)}
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Customer Info */}
            <div className="flex items-center space-x-4">
              <img 
                src={reservationDetails.user?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"}
                alt={reservationDetails.user?.full_name || "Usuario"}
                className="w-16 h-16 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-black">
                  {reservationDetails.user?.full_name || "Usuario"}
                </h3>
                <p className="text-gray-600">{reservationDetails.user?.email}</p>
                <Badge className="bg-blue-100 text-blue-800">
                  Miembro URContent
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Reservation Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Experiencia:</span>
                  <p className="font-medium">{reservationDetails.offer?.title}</p>
                </div>
                <div>
                  <span className="text-gray-600">Fecha:</span>
                  <p className="font-medium">{reservationDetails.scheduled_date}</p>
                </div>
                <div>
                  <span className="text-gray-600">Invitados:</span>
                  <p className="font-medium">{reservationDetails.guest_count}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Duración:</span>
                  <p className="font-medium">{reservationDetails.offer?.duration_minutes} min</p>
                </div>
                <div>
                  <span className="text-gray-600">Horario:</span>
                  <p className="font-medium">{reservationDetails.scheduled_time}</p>
                </div>
                <div>
                  <span className="text-gray-600">Créditos:</span>
                  <p className="font-medium">{reservationDetails.credits_used}</p>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {reservationDetails.special_requests && (
              <>
                <Separator />
                <div>
                  <span className="text-gray-600 text-sm">Solicitudes especiales:</span>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded-2xl">
                    {reservationDetails.special_requests}
                  </p>
                </div>
              </>
            )}

            {/* Content Commitment */}
            {reservationDetails.content_commitment && (
              <div className="bg-blue-50 p-4 rounded-2xl">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800 font-medium text-sm">Compromiso de contenido:</span>
                </div>
                <p className="text-blue-700 text-sm">{reservationDetails.content_commitment}</p>
              </div>
            )}

            {/* Staff Notes */}
            {['booked', 'confirmed'].includes(reservationDetails.status) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label htmlFor="staff-notes" className="text-sm font-medium">
                    Notas del staff (opcional):
                  </Label>
                  <Textarea
                    id="staff-notes"
                    placeholder="Observaciones, alergias detectadas, preferencias..."
                    value={staffNotes}
                    onChange={(e) => setStaffNotes(e.target.value)}
                    className="rounded-2xl"
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setReservationDetails(null);
                  setScanResult("");
                  setStaffNotes("");
                  setScanError("");
                }}
                className="flex-1 rounded-2xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Nueva Búsqueda
              </Button>

              {['booked', 'confirmed'].includes(reservationDetails.status) && (
                <Button
                  onClick={handleCheckIn}
                  disabled={checkInMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-2xl"
                >
                  {checkInMutation.isPending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmar Check-in
                    </>
                  )}
                </Button>
              )}

              {reservationDetails.status === 'checked_in' && (
                <div className="flex-1 bg-green-100 text-green-800 rounded-2xl px-4 py-3 text-center font-medium">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Check-in Completado
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions for Venue Staff */}
      <Card className="border border-gray-200 rounded-3xl">
        <CardContent className="p-6">
          <h3 className="font-semibold text-black mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="rounded-2xl p-4 h-auto flex flex-col items-center space-y-2"
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Ver Reservas del Día</span>
            </Button>
            <Button 
              variant="outline" 
              className="rounded-2xl p-4 h-auto flex flex-col items-center space-y-2"
            >
              <FileText className="w-6 h-6" />
              <span className="text-sm">Reportar Problema</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};