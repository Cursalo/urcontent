import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Store, QrCode, Calendar, Users, TrendingUp, Settings, Plus, Edit, Trash2, Eye, Clock,
  MapPin, Star, CreditCard, CheckCircle, AlertCircle, BarChart3, DollarSign, UserCheck,
  Camera, Bell, Filter, Search, Download, RefreshCw
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const VenueDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Mock data for now since services may not be available
  const currentVenue = {
    id: "venue-1",
    name: "Spa Relax URContent",
    description: "Un oasis de tranquilidad en el corazón de Buenos Aires",
    address: "Av. Santa Fe 1234, CABA",
    rating: 4.8,
    verified: true,
    images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop"],
    opening_hours: "09:00 - 21:00",
    category: "spa"
  };

  const offers = [
    {
      id: "1",
      title: "Masaje Relajante Completo",
      description: "Masaje de cuerpo completo con aceites esenciales",
      credits: 2,
      originalValue: 15000,
      duration: 90,
      membershipTier: "premium",
      status: "active",
      totalBookings: 45
    },
    {
      id: "2", 
      title: "Facial Hidratante",
      description: "Tratamiento facial profundo con productos naturales",
      credits: 1,
      originalValue: 8000,
      duration: 60,
      membershipTier: "basic",
      status: "active",
      totalBookings: 32
    }
  ];

  const reservations = [
    {
      id: "1",
      memberName: "María González",
      memberUsername: "@maria.g",
      memberAvatar: "https://images.unsplash.com/photo-1494790108755-2616b79d21de?w=100&h=100&fit=crop",
      membershipTier: "premium",
      offerTitle: "Masaje Relajante Completo",
      scheduledDate: "2024-01-15",
      scheduledTime: "14:00",
      status: "confirmed",
      creditsUsed: 2,
      guestCount: 1
    },
    {
      id: "2",
      memberName: "Ana López",
      memberUsername: "@ana.lopez",
      memberAvatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
      membershipTier: "basic",
      offerTitle: "Facial Hidratante",
      scheduledDate: "2024-01-15",
      scheduledTime: "16:30",
      status: "completed",
      creditsUsed: 1,
      guestCount: 1
    }
  ];

  const stats = {
    totalBookings: 8,
    activeOffers: 2,
    todayRevenue: 45000,
    avgRating: 4.8,
    monthlyBookings: 127,
    creditsRedeemed: 89
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Activa", className: "bg-gray-100 text-gray-900" },
      paused: { label: "Pausada", className: "bg-gray-100 text-gray-900" },
      inactive: { label: "Inactiva", className: "bg-gray-100 text-gray-800" },
      confirmed: { label: "Confirmada", className: "bg-gray-100 text-gray-900" },
      checked_in: { label: "Check-in", className: "bg-gray-100 text-gray-900" },
      completed: { label: "Completada", className: "bg-gray-100 text-gray-900" },
      no_show: { label: "No Show", className: "bg-gray-100 text-gray-900" }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getMembershipBadge = (tier: string) => {
    const tierConfig = {
      basic: { label: "Basic", className: "bg-gray-100 text-gray-800" },
      premium: { label: "Premium", className: "bg-gray-100 text-gray-900" },
      vip: { label: "VIP", className: "bg-gray-100 text-gray-900" }
    };
    const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.basic;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-light text-black mb-2">
                  Panel de <span className="font-semibold">Venue</span>
                </h1>
                <p className="text-gray-600">
                  Gestiona tu negocio en URContent Argentina
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={() => setShowQRScanner(true)}
                  className="bg-black hover:bg-gray-800 text-white rounded px-6"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Escanear QR
                </Button>
                <Button variant="outline" className="rounded px-6">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración
                </Button>
              </div>
            </div>
          </div>

          {/* Venue Info Card */}
          <Card className="mb-8 border border-gray-200 rounded">
            <CardContent className="p-6">
              <div className="flex items-start space-x-6">
                <img 
                  src={currentVenue.images[0]} 
                  alt={currentVenue.name}
                  className="w-24 h-24 rounded object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-semibold text-black">{currentVenue.name}</h2>
                    {currentVenue.verified && (
                      <Badge className="bg-gray-100 text-gray-900">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{currentVenue.address}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-gray-400 fill-current" />
                      <span>{currentVenue.rating} (127 reseñas)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{currentVenue.opening_hours}</span>
                    </div>
                  </div>
                  <p className="text-gray-600">{currentVenue.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <Card className="border border-gray-200 rounded">
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                <div className="text-2xl font-light text-black mb-1">{stats.totalBookings}</div>
                <div className="text-gray-600 text-sm">Reservas Hoy</div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 rounded">
              <CardContent className="p-6 text-center">
                <Store className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                <div className="text-2xl font-light text-black mb-1">{stats.activeOffers}</div>
                <div className="text-gray-600 text-sm">Ofertas Activas</div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 rounded">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                <div className="text-2xl font-light text-black mb-1">${stats.todayRevenue.toLocaleString()}</div>
                <div className="text-gray-600 text-sm">Valor Hoy</div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 rounded">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                <div className="text-2xl font-light text-black mb-1">{stats.avgRating}</div>
                <div className="text-gray-600 text-sm">Rating Promedio</div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 rounded">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                <div className="text-2xl font-light text-black mb-1">{stats.monthlyBookings}</div>
                <div className="text-gray-600 text-sm">Este Mes</div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 rounded">
              <CardContent className="p-6 text-center">
                <CreditCard className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                <div className="text-2xl font-light text-black mb-1">{stats.creditsRedeemed}</div>
                <div className="text-gray-600 text-sm">Créditos Canjeados</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded p-1 mb-8">
              <TabsTrigger value="overview" className="rounded">Resumen</TabsTrigger>
              <TabsTrigger value="offers" className="rounded">Ofertas</TabsTrigger>
              <TabsTrigger value="reservations" className="rounded">Reservas</TabsTrigger>
              <TabsTrigger value="analytics" className="rounded">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Reservations */}
                <Card className="border border-gray-200 rounded">
                  <CardHeader>
                    <CardTitle className="text-xl">Reservas Recientes</CardTitle>
                    <CardDescription>
                      Últimas reservas de miembros URContent
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reservations.map((reservation) => (
                      <div key={reservation.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded">
                        <img 
                          src={reservation.memberAvatar} 
                          alt={reservation.memberName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium text-black truncate">{reservation.memberName}</p>
                            {getMembershipBadge(reservation.membershipTier)}
                          </div>
                          <p className="text-sm text-gray-600">{reservation.offerTitle}</p>
                          <p className="text-xs text-gray-500">
                            {reservation.scheduledDate} • {reservation.scheduledTime}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(reservation.status)}
                          <p className="text-xs text-gray-500 mt-1">{reservation.creditsUsed} créditos</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Active Offers */}
                <Card className="border border-gray-200 rounded">
                  <CardHeader>
                    <CardTitle className="text-xl">Ofertas Activas</CardTitle>
                    <CardDescription>
                      Tus experiencias disponibles para miembros
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {offers.filter(o => o.status === 'active').map((offer) => (
                      <div key={offer.id} className="p-4 bg-gray-50 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-black">{offer.title}</h4>
                          {getStatusBadge(offer.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-500">{offer.credits} créditos</span>
                            <span className="text-gray-500">{offer.duration}min</span>
                            {getMembershipBadge(offer.membershipTier)}
                          </div>
                          <span className="text-gray-700 font-medium">{offer.totalBookings} reservas</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Offers Tab */}
            <TabsContent value="offers" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-light text-black">
                  Gestión de <span className="font-semibold">Ofertas</span>
                </h2>
                <Button className="bg-black hover:bg-gray-800 text-white rounded px-6">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Oferta
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map((offer) => (
                  <Card key={offer.id} className="border border-gray-200 rounded">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-black">{offer.title}</h3>
                        {getStatusBadge(offer.status)}
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {offer.description}
                      </p>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Créditos:</span>
                          <span className="font-medium">{offer.credits}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Valor original:</span>
                          <span className="font-medium">${offer.originalValue}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Duración:</span>
                          <span className="font-medium">{offer.duration}min</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Membresía:</span>
                          {getMembershipBadge(offer.membershipTier)}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Total reservas:</span>
                          <span className="font-medium text-gray-700">{offer.totalBookings}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1 rounded">
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" className="rounded px-3">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Reservations Tab */}
            <TabsContent value="reservations" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-light text-black">
                  Gestión de <span className="font-semibold">Reservas</span>
                </h2>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="rounded px-6">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                  <Button variant="outline" className="rounded px-6">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
              <Card className="border border-gray-200 rounded">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 font-medium text-gray-700">Miembro</th>
                          <th className="text-left p-4 font-medium text-gray-700">Experiencia</th>
                          <th className="text-left p-4 font-medium text-gray-700">Fecha & Hora</th>
                          <th className="text-left p-4 font-medium text-gray-700">Créditos</th>
                          <th className="text-left p-4 font-medium text-gray-700">Estado</th>
                          <th className="text-left p-4 font-medium text-gray-700">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservations.map((reservation) => (
                          <tr key={reservation.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={reservation.memberAvatar} 
                                  alt={reservation.memberName}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                  <p className="font-medium text-black">{reservation.memberName}</p>
                                  <p className="text-sm text-gray-600">{reservation.memberUsername}</p>
                                  {getMembershipBadge(reservation.membershipTier)}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="font-medium text-black">{reservation.offerTitle}</p>
                              <p className="text-sm text-gray-600">
                                {reservation.guestCount} {reservation.guestCount === 1 ? 'persona' : 'personas'}
                              </p>
                            </td>
                            <td className="p-4">
                              <p className="font-medium text-black">{reservation.scheduledDate}</p>
                              <p className="text-sm text-gray-600">{reservation.scheduledTime}</p>
                            </td>
                            <td className="p-4">
                              <Badge className="bg-black text-white">
                                {reservation.creditsUsed} créditos
                              </Badge>
                            </td>
                            <td className="p-4">
                              {getStatusBadge(reservation.status)}
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" className="rounded">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {reservation.status === 'confirmed' && (
                                  <Button size="sm" className="bg-gray-700 hover:bg-gray-800 text-white rounded">
                                    <UserCheck className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <h2 className="text-2xl font-light text-black">
                Analytics & <span className="font-semibold">Reportes</span>
              </h2>
              <Card className="border border-gray-200 rounded">
                <CardHeader>
                  <CardTitle>Rendimiento del Mes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total reservas:</span>
                      <span className="font-semibold text-2xl text-gray-700">127</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Valor generado:</span>
                      <span className="font-semibold text-2xl text-gray-700">$1,234,500</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Créditos canjeados:</span>
                      <span className="font-semibold text-2xl text-gray-700">567</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VenueDashboard;