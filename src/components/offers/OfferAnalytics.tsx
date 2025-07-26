import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  CreditCard,
  Star,
  Clock,
  MapPin,
  DollarSign,
  BarChart3,
  Download,
  RefreshCw,
  Filter,
  Eye,
  UserCheck,
  Heart,
  MessageCircle,
  Share2,
  Target
} from "lucide-react";

interface OfferPerformanceData {
  offerId: string;
  offerTitle: string;
  totalBookings: number;
  totalCreditsRedeemed: number;
  totalValueGenerated: number;
  averageRating: number;
  conversionRate: number;
  popularTimeSlots: { time: string; bookings: number }[];
  membershipBreakdown: { tier: string; count: number; percentage: number }[];
  monthlyTrend: { month: string; bookings: number; credits: number; value: number }[];
  weeklyTrend: { day: string; bookings: number }[];
  satisfactionScore: number;
  repeatBookingRate: number;
  noShowRate: number;
  cancellationRate: number;
  averageLeadTime: number; // days in advance bookings are made
  peakHours: string[];
  seasonalTrends: { season: string; bookings: number }[];
}

interface OfferAnalyticsProps {
  offers: {
    id: string;
    title: string;
    status: string;
    membershipTier: string;
    totalBookings: number;
    credits: number;
  }[];
  performanceData: OfferPerformanceData[];
  venueId: string;
}

export const OfferAnalytics = ({ offers, performanceData, venueId }: OfferAnalyticsProps) => {
  const [selectedOffer, setSelectedOffer] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for analytics
  const mockAnalyticsData = {
    totalOffers: offers.length,
    activeOffers: offers.filter(o => o.status === 'active').length,
    totalBookings: performanceData.reduce((sum, data) => sum + data.totalBookings, 0),
    totalRevenue: performanceData.reduce((sum, data) => sum + data.totalValueGenerated, 0),
    averageRating: 4.7,
    conversionRate: 12.3,
    topPerformingOffers: performanceData
      .sort((a, b) => b.totalBookings - a.totalBookings)
      .slice(0, 5),
    membershipDistribution: [
      { name: 'Basic', value: 35, color: '#64748B' },
      { name: 'Premium', value: 45, color: '#3B82F6' },
      { name: 'VIP', value: 20, color: '#8B5CF6' }
    ],
    bookingTrends: [
      { month: 'Ene', bookings: 45, revenue: 67500 },
      { month: 'Feb', bookings: 52, revenue: 78000 },
      { month: 'Mar', bookings: 61, revenue: 91500 },
      { month: 'Abr', bookings: 48, revenue: 72000 },
      { month: 'May', bookings: 67, revenue: 100500 },
      { month: 'Jun', bookings: 73, revenue: 109500 }
    ],
    timeSlotPopularity: [
      { time: '10:00', bookings: 23 },
      { time: '14:00', bookings: 31 },
      { time: '16:00', bookings: 28 },
      { time: '18:00', bookings: 19 },
      { time: '20:00', bookings: 15 }
    ],
    weeklyPattern: [
      { day: 'Lun', bookings: 12 },
      { day: 'Mar', bookings: 18 },
      { day: 'Mié', bookings: 22 },
      { day: 'Jue', bookings: 25 },
      { day: 'Vie', bookings: 31 },
      { day: 'Sáb', bookings: 38 },
      { day: 'Dom', bookings: 21 }
    ]
  };

  const getOfferStatus = (status: string) => {
    const statusConfig = {
      active: { label: "Activa", className: "bg-green-100 text-green-800" },
      paused: { label: "Pausada", className: "bg-yellow-100 text-yellow-800" },
      inactive: { label: "Inactiva", className: "bg-gray-100 text-gray-800" }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-black">
            Analytics de <span className="font-semibold">Ofertas</span>
          </h2>
          <p className="text-gray-600">
            Métricas detalladas y análisis de rendimiento de tus experiencias
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
              <SelectItem value="1y">1 año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-2xl">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" className="rounded-2xl">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="border border-gray-200 rounded-3xl">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-light text-black mb-1">{mockAnalyticsData.totalOffers}</div>
            <div className="text-gray-600 text-sm">Total Ofertas</div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-3xl">
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <div className="text-2xl font-light text-black mb-1">{mockAnalyticsData.totalBookings}</div>
            <div className="text-gray-600 text-sm">Total Reservas</div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-3xl">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <div className="text-2xl font-light text-black mb-1">{formatCurrency(mockAnalyticsData.totalRevenue)}</div>
            <div className="text-gray-600 text-sm">Valor Total</div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-3xl">
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
            <div className="text-2xl font-light text-black mb-1">{mockAnalyticsData.averageRating}</div>
            <div className="text-gray-600 text-sm">Rating Promedio</div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-3xl">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <div className="text-2xl font-light text-black mb-1">{mockAnalyticsData.conversionRate}%</div>
            <div className="text-gray-600 text-sm">Conversión</div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-3xl">
          <CardContent className="p-6 text-center">
            <UserCheck className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <div className="text-2xl font-light text-black mb-1">{mockAnalyticsData.activeOffers}</div>
            <div className="text-gray-600 text-sm">Ofertas Activas</div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-gray-100 rounded-2xl p-1">
          <TabsTrigger value="overview" className="rounded-xl">Resumen</TabsTrigger>
          <TabsTrigger value="performance" className="rounded-xl">Rendimiento</TabsTrigger>
          <TabsTrigger value="patterns" className="rounded-xl">Patrones</TabsTrigger>
          <TabsTrigger value="members" className="rounded-xl">Miembros</TabsTrigger>
          <TabsTrigger value="optimization" className="rounded-xl">Optimización</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Booking Trends */}
            <Card className="border border-gray-200 rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Tendencia de Reservas</span>
                </CardTitle>
                <CardDescription>Reservas y valor generado por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockAnalyticsData.bookingTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value as number) : value,
                        name === 'bookings' ? 'Reservas' : 'Valor'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="bookings" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.6} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Performing Offers */}
            <Card className="border border-gray-200 rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Top Ofertas</span>
                </CardTitle>
                <CardDescription>Ofertas más populares por reservas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalyticsData.topPerformingOffers.map((offer, index) => (
                    <div key={offer.offerId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
                      <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-black">{offer.offerTitle}</p>
                        <p className="text-sm text-gray-600">
                          {offer.totalBookings} reservas • {formatCurrency(offer.totalValueGenerated)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{offer.averageRating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Individual Offer Performance */}
            <Card className="lg:col-span-2 border border-gray-200 rounded-3xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Rendimiento por Oferta</CardTitle>
                    <CardDescription>Compara el rendimiento de todas tus ofertas</CardDescription>
                  </div>
                  <Select value={selectedOffer} onValueChange={setSelectedOffer}>
                    <SelectTrigger className="w-48 rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las ofertas</SelectItem>
                      {offers.map((offer) => (
                        <SelectItem key={offer.id} value={offer.id}>
                          {offer.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {offers.slice(0, 6).map((offer) => (
                    <div key={offer.id} className="p-4 border border-gray-200 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm truncate">{offer.title}</h4>
                        {getOfferStatus(offer.status)}
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reservas:</span>
                          <span className="font-medium">{offer.totalBookings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Créditos:</span>
                          <span className="font-medium">{offer.credits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tier:</span>
                          <Badge className="text-xs" variant="outline">
                            {offer.membershipTier}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={offers.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="title" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalBookings" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card className="border border-gray-200 rounded-3xl">
              <CardHeader>
                <CardTitle>Métricas Clave</CardTitle>
                <CardDescription>Indicadores de rendimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-light text-green-600 mb-1">94.2%</div>
                    <div className="text-sm text-gray-600">Tasa de Satisfacción</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-light text-blue-600 mb-1">87.5%</div>
                    <div className="text-sm text-gray-600">Tasa de Finalización</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87.5%' }}></div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-light text-purple-600 mb-1">23%</div>
                    <div className="text-sm text-gray-600">Tasa de Repetición</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-light text-orange-600 mb-1">4.7</div>
                    <div className="text-sm text-gray-600">Días Promedio Reserva</div>
                    <div className="text-xs text-gray-500 mt-1">Anticipación promedio</div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-light text-red-600 mb-1">5.8%</div>
                    <div className="text-sm text-gray-600">Tasa de No-Show</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '5.8%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time Slot Popularity */}
            <Card className="border border-gray-200 rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Horarios Más Populares</span>
                </CardTitle>
                <CardDescription>Distribución de reservas por horario</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockAnalyticsData.timeSlotPopularity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Patterns */}
            <Card className="border border-gray-200 rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Patrón Semanal</span>
                </CardTitle>
                <CardDescription>Reservas por día de la semana</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockAnalyticsData.weeklyPattern}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="bookings" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Membership Distribution */}
            <Card className="border border-gray-200 rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Distribución de Membresías</span>
                </CardTitle>
                <CardDescription>Tipos de miembros que usan tus ofertas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockAnalyticsData.membershipDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {mockAnalyticsData.membershipDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Member Insights */}
            <Card className="border border-gray-200 rounded-3xl">
              <CardHeader>
                <CardTitle>Insights de Miembros</CardTitle>
                <CardDescription>Comportamiento y preferencias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                    <div>
                      <p className="font-medium text-blue-800">Miembros VIP</p>
                      <p className="text-sm text-blue-600">Reservan 3.2x más que Basic</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">20%</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl">
                    <div>
                      <p className="font-medium text-purple-800">Miembros Premium</p>
                      <p className="text-sm text-purple-600">Mayor tasa de repetición</p>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">45%</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="font-medium text-gray-800">Miembros Basic</p>
                      <p className="text-sm text-gray-600">Prefieren horarios matutinos</p>
                    </div>
                    <div className="text-2xl font-bold text-gray-600">35%</div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-black mb-3">Tendencias de Comportamiento</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reservas fin de semana:</span>
                        <span className="font-medium">68% más populares</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tiempo promedio sesión:</span>
                        <span className="font-medium">78 minutos</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Invitados promedio:</span>
                        <span className="font-medium">1.4 personas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommendations */}
            <Card className="border border-gray-200 rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Recomendaciones</span>
                </CardTitle>
                <CardDescription>Sugerencias para mejorar el rendimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-2xl">
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="font-medium text-green-800">Aumenta horarios de fin de semana</p>
                        <p className="text-sm text-green-600">
                          68% más demanda los sábados. Considera agregar más slots.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                    <div className="flex items-start space-x-3">
                      <Star className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="font-medium text-blue-800">Promociona ofertas VIP</p>
                        <p className="text-sm text-blue-600">
                          Los miembros VIP tienen 94% de satisfacción vs 87% general.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-yellow-600 mt-1" />
                      <div>
                        <p className="font-medium text-yellow-800">Optimiza horario 14:00-16:00</p>
                        <p className="text-sm text-yellow-600">
                          Baja ocupación en estas horas. Considera ofertas especiales.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                    <div className="flex items-start space-x-3">
                      <Users className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="font-medium text-purple-800">Programa de fidelización</p>
                        <p className="text-sm text-purple-600">
                          23% de repetición indica oportunidad para programa de lealtad.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Forecasting */}
            <Card className="border border-gray-200 rounded-3xl">
              <CardHeader>
                <CardTitle>Proyección de Rendimiento</CardTitle>
                <CardDescription>Estimaciones para los próximos 30 días</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center p-4 bg-gray-50 rounded-2xl">
                    <div className="text-3xl font-light text-black mb-2">127</div>
                    <div className="text-sm text-gray-600">Reservas Estimadas</div>
                    <div className="flex items-center justify-center space-x-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">+18% vs mes anterior</span>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-2xl">
                    <div className="text-3xl font-light text-black mb-2">{formatCurrency(190500)}</div>
                    <div className="text-sm text-gray-600">Valor Estimado</div>
                    <div className="flex items-center justify-center space-x-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">+22% vs mes anterior</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-black mb-3">Factores de Crecimiento</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Temporada alta (verano)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Nuevos miembros VIP</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Mejoras en rating</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Import Trophy icon
const Trophy = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

export default OfferAnalytics;