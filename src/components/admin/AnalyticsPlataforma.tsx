import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Treemap,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  ShoppingCart,
  Globe,
  Calendar,
  Download,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart as PieChartIcon,
  Map,
  Target,
  Award,
  Zap,
  Clock,
  Percent,
  CreditCard,
  UserCheck,
  MessageCircle,
  Star,
  Eye,
  Share2,
  Heart,
  Filter,
} from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

export const AnalyticsPlataforma = () => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('30d');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [vistaActiva, setVistaActiva] = useState('general');

  // KPIs principales
  const kpis = [
    {
      titulo: 'Revenue Total',
      valor: '$2,485,320',
      cambio: '+18.2%',
      trending: 'up',
      subtitulo: 'MXN este mes',
      meta: { actual: 2485320, objetivo: 2800000 },
      comparacion: { periodo: 'vs mes anterior', valor: '$2,102,450' }
    },
    {
      titulo: 'GMV (Gross Merchandise Value)',
      valor: '$16,568,800',
      cambio: '+22.4%',
      trending: 'up',
      subtitulo: 'Valor total transaccionado',
      meta: { actual: 16568800, objetivo: 18000000 },
      comparacion: { periodo: 'vs mes anterior', valor: '$13,542,300' }
    },
    {
      titulo: 'Ticket Promedio',
      valor: '$1,872',
      cambio: '+5.3%',
      trending: 'up',
      subtitulo: 'Por colaboración',
      meta: { actual: 1872, objetivo: 2000 },
      comparacion: { periodo: 'vs mes anterior', valor: '$1,778' }
    },
    {
      titulo: 'LTV (Lifetime Value)',
      valor: '$12,450',
      cambio: '+8.7%',
      trending: 'up',
      subtitulo: 'Valor por usuario',
      meta: { actual: 12450, objetivo: 15000 },
      comparacion: { periodo: 'vs mes anterior', valor: '$11,453' }
    },
  ];

  // Datos de crecimiento mensual
  const datosRevenue = [
    { mes: 'Ene', revenue: 1875000, gmv: 12500000, transacciones: 624, ticketPromedio: 1803 },
    { mes: 'Feb', revenue: 2175000, gmv: 14500000, transacciones: 753, ticketPromedio: 1925 },
    { mes: 'Mar', revenue: 2520000, gmv: 16800000, transacciones: 894, ticketPromedio: 1879 },
    { mes: 'Abr', revenue: 2925000, gmv: 19500000, transacciones: 1053, ticketPromedio: 1851 },
    { mes: 'May', revenue: 3375000, gmv: 22500000, transacciones: 1234, ticketPromedio: 1823 },
    { mes: 'Jun', revenue: 3900000, gmv: 26000000, transacciones: 1426, ticketPromedio: 1823 },
    { mes: 'Jul', revenue: 4275000, gmv: 28500000, transacciones: 1547, ticketPromedio: 1842 },
  ];

  // Análisis por categoría
  const categorias = [
    { nombre: 'Restaurantes', revenue: 695890, porcentaje: 28, crecimiento: 12.5, colaboraciones: 2847 },
    { nombre: 'Fitness', revenue: 546770, porcentaje: 22, crecimiento: 18.3, colaboraciones: 2234 },
    { nombre: 'Moda', revenue: 447358, porcentaje: 18, crecimiento: 25.7, colaboraciones: 1829 },
    { nombre: 'Tecnología', revenue: 372798, porcentaje: 15, crecimiento: 32.1, colaboraciones: 1523 },
    { nombre: 'Belleza', revenue: 198826, porcentaje: 8, crecimiento: 15.8, colaboraciones: 813 },
    { nombre: 'Viajes', revenue: 124266, porcentaje: 5, crecimiento: 22.4, colaboraciones: 508 },
    { nombre: 'Otros', revenue: 99413, porcentaje: 4, crecimiento: 8.9, colaboraciones: 406 },
  ];

  // Métricas de usuarios
  const metricsUsuarios = {
    adquisicion: [
      { canal: 'Orgánico', usuarios: 8420, porcentaje: 32.6, costo: 0 },
      { canal: 'Redes Sociales', usuarios: 6230, porcentaje: 24.1, costo: 12500 },
      { canal: 'Referencias', usuarios: 4850, porcentaje: 18.8, costo: 0 },
      { canal: 'Paid Search', usuarios: 3100, porcentaje: 12.0, costo: 8900 },
      { canal: 'Email', usuarios: 2100, porcentaje: 8.1, costo: 3200 },
      { canal: 'Directo', usuarios: 1147, porcentaje: 4.4, costo: 0 },
    ],
    retencion: [
      { mes: 'Mes 0', porcentaje: 100 },
      { mes: 'Mes 1', porcentaje: 85 },
      { mes: 'Mes 2', porcentaje: 72 },
      { mes: 'Mes 3', porcentaje: 65 },
      { mes: 'Mes 4', porcentaje: 58 },
      { mes: 'Mes 5', porcentaje: 52 },
      { mes: 'Mes 6', porcentaje: 48 },
    ],
    engagement: [
      { metrica: 'Sesiones/Usuario', valor: 3.4 },
      { metrica: 'Páginas/Sesión', valor: 5.2 },
      { metrica: 'Duración Promedio', valor: '8:34' },
      { metrica: 'Tasa de Rebote', valor: '23.5%' },
      { metrica: 'Usuarios Activos Diarios', valor: '2,847' },
      { metrica: 'Usuarios Activos Mensuales', valor: '18,234' },
    ]
  };

  // Performance por región
  const regiones = [
    { region: 'CDMX', revenue: 845320, usuarios: 8420, conversiones: 3.2, ticketPromedio: 2150 },
    { region: 'Guadalajara', revenue: 422660, usuarios: 4230, conversiones: 2.8, ticketPromedio: 1980 },
    { region: 'Monterrey', revenue: 397425, usuarios: 3850, conversiones: 3.5, ticketPromedio: 2280 },
    { region: 'Puebla', revenue: 198712, usuarios: 2100, conversiones: 2.5, ticketPromedio: 1750 },
    { region: 'Tijuana', revenue: 174169, usuarios: 1850, conversiones: 2.9, ticketPromedio: 1920 },
    { region: 'Cancún', revenue: 149228, usuarios: 1520, conversiones: 3.8, ticketPromedio: 2450 },
    { region: 'Otros', revenue: 297806, usuarios: 3877, conversiones: 2.2, ticketPromedio: 1650 },
  ];

  // Análisis de colaboraciones
  const colaboracionesAnalytics = {
    estados: [
      { estado: 'Completadas', cantidad: 6507, porcentaje: 73.5 },
      { estado: 'Activas', cantidad: 1426, porcentaje: 16.1 },
      { estado: 'Pendientes', cantidad: 534, porcentaje: 6.0 },
      { estado: 'Disputadas', cantidad: 267, porcentaje: 3.0 },
      { estado: 'Canceladas', cantidad: 113, porcentaje: 1.3 },
    ],
    duracionPromedio: [
      { tipo: 'Express (1-3 días)', porcentaje: 15, duracion: '2.1 días' },
      { tipo: 'Estándar (4-7 días)', porcentaje: 45, duracion: '5.3 días' },
      { tipo: 'Extendida (8-14 días)', porcentaje: 30, duracion: '10.2 días' },
      { tipo: 'Larga (15+ días)', porcentaje: 10, duracion: '18.5 días' },
    ],
    satisfaccion: {
      creadores: 4.7,
      negocios: 4.5,
      nps: 72,
    }
  };

  // Datos para el treemap de categorías
  const treemapData = categorias.map(cat => ({
    name: cat.nombre,
    size: cat.revenue,
    growth: cat.crecimiento,
  }));

  // Colores para gráficos
  const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString('es-MX')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Plataforma</h2>
          <p className="text-gray-600">Análisis detallado del rendimiento y métricas clave</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Download className="w-4 h-4 mr-2" />
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{kpi.titulo}</span>
                <Badge 
                  variant={kpi.trending === 'up' ? 'default' : 'destructive'}
                  className="flex items-center space-x-1"
                >
                  {kpi.trending === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  <span>{kpi.cambio}</span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-3xl font-bold">{kpi.valor}</p>
                  <p className="text-sm text-gray-500">{kpi.subtitulo}</p>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Meta: ${kpi.meta.objetivo.toLocaleString('es-MX')}</span>
                    <span>{Math.round((kpi.meta.actual / kpi.meta.objetivo) * 100)}%</span>
                  </div>
                  <Progress value={(kpi.meta.actual / kpi.meta.objetivo) * 100} className="h-2" />
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">{kpi.comparacion.periodo}</p>
                  <p className="text-sm font-medium">{kpi.comparacion.valor}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs de Analytics */}
      <Tabs value={vistaActiva} onValueChange={setVistaActiva} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="colaboraciones">Colaboraciones</TabsTrigger>
          <TabsTrigger value="geografico">Geográfico</TabsTrigger>
        </TabsList>

        {/* Tab General */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendencia de Revenue y GMV */}
            <Card>
              <CardHeader>
                <CardTitle>Evolución de Revenue y GMV</CardTitle>
                <CardDescription>Comparación mensual de ingresos y valor transaccionado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={datosRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="gmv" fill="#8B5CF6" name="GMV" opacity={0.8} />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#EC4899" name="Revenue" strokeWidth={3} />
                    <Line yAxisId="right" type="monotone" dataKey="ticketPromedio" stroke="#10B981" name="Ticket Promedio" strokeWidth={2} strokeDasharray="5 5" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribución por Categorías */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue por Categoría</CardTitle>
                <CardDescription>Contribución de cada categoría al revenue total</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={categorias}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ nombre, porcentaje }) => `${nombre}: ${porcentaje}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {categorias.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-MX')}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {categorias.slice(0, 4).map((cat, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                        <span>{cat.nombre}</span>
                      </div>
                      <span className="font-medium">${(cat.revenue / 1000).toFixed(0)}k</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas de Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
              <CardDescription>Indicadores clave de rendimiento de la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
                    <Percent className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold">15%</p>
                  <p className="text-sm text-gray-500">Tasa de Comisión</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold">96.8%</p>
                  <p className="text-sm text-gray-500">Tasa de Éxito</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold">5.3</p>
                  <p className="text-sm text-gray-500">Días Promedio</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-3">
                    <Star className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold">4.6</p>
                  <p className="text-sm text-gray-500">Rating Promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Revenue */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Crecimiento por Categoría */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Crecimiento de Revenue por Categoría</CardTitle>
                <CardDescription>Comparación de crecimiento mensual por industria</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categorias} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="nombre" type="category" width={100} />
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Bar dataKey="crecimiento" fill="#10B981">
                      {categorias.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.crecimiento > 20 ? '#10B981' : entry.crecimiento > 10 ? '#F59E0B' : '#EF4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Categorías */}
            <Card>
              <CardHeader>
                <CardTitle>Top Categorías</CardTitle>
                <CardDescription>Por revenue generado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categorias.slice(0, 5).map((cat, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{cat.nombre}</span>
                        <span className="text-sm text-gray-500">${(cat.revenue / 1000).toFixed(0)}k</span>
                      </div>
                      <Progress value={cat.porcentaje} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{cat.colaboraciones} colaboraciones</span>
                        <span className="text-green-600">+{cat.crecimiento}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Proyecciones */}
          <Card>
            <CardHeader>
              <CardTitle>Proyección de Revenue</CardTitle>
              <CardDescription>Estimación para los próximos 3 meses basada en tendencias actuales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-sm text-gray-500">Agosto 2024</p>
                  <p className="text-2xl font-bold text-purple-600">$4,702,500</p>
                  <p className="text-sm text-green-600">+10% estimado</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Septiembre 2024</p>
                  <p className="text-2xl font-bold text-purple-600">$5,172,750</p>
                  <p className="text-sm text-green-600">+10% estimado</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Octubre 2024</p>
                  <p className="text-2xl font-bold text-purple-600">$5,690,025</p>
                  <p className="text-sm text-green-600">+10% estimado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Usuarios */}
        <TabsContent value="usuarios" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Canales de Adquisición */}
            <Card>
              <CardHeader>
                <CardTitle>Canales de Adquisición</CardTitle>
                <CardDescription>Origen de nuevos usuarios</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metricsUsuarios.adquisicion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="canal" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usuarios" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">CAC Promedio:</span>
                    <span className="font-medium">$18.50 MXN</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Conversión Promedio:</span>
                    <span className="font-medium">3.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Curva de Retención */}
            <Card>
              <CardHeader>
                <CardTitle>Curva de Retención</CardTitle>
                <CardDescription>Retención de usuarios por cohorte mensual</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metricsUsuarios.retencion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Line type="monotone" dataKey="porcentaje" stroke="#EC4899" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Retención Día 1:</p>
                    <p className="font-medium">85%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Retención Día 30:</p>
                    <p className="font-medium">65%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas de Engagement */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Engagement</CardTitle>
              <CardDescription>Comportamiento y actividad de usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {metricsUsuarios.engagement.map((metric, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">{metric.valor}</p>
                    <p className="text-xs text-gray-500">{metric.metrica}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Colaboraciones */}
        <TabsContent value="colaboraciones" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Estados de Colaboraciones */}
            <Card>
              <CardHeader>
                <CardTitle>Estados de Colaboraciones</CardTitle>
                <CardDescription>Distribución actual</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={colaboracionesAnalytics.estados}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="cantidad"
                    >
                      {colaboracionesAnalytics.estados.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {colaboracionesAnalytics.estados.map((estado, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span>{estado.estado}</span>
                      </div>
                      <span className="font-medium">{estado.cantidad} ({estado.porcentaje}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Duración de Colaboraciones */}
            <Card>
              <CardHeader>
                <CardTitle>Duración Promedio</CardTitle>
                <CardDescription>Tiempo de completación</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {colaboracionesAnalytics.duracionPromedio.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{item.tipo}</span>
                        <span className="text-sm font-medium">{item.duracion}</span>
                      </div>
                      <Progress value={item.porcentaje} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Satisfacción */}
            <Card>
              <CardHeader>
                <CardTitle>Índices de Satisfacción</CardTitle>
                <CardDescription>Calificaciones promedio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-2">
                      <Star className="w-8 h-8 text-yellow-600 fill-current" />
                    </div>
                    <p className="text-3xl font-bold">{colaboracionesAnalytics.satisfaccion.creadores}</p>
                    <p className="text-sm text-gray-500">Satisfacción Creadores</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-2">
                      <Store className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold">{colaboracionesAnalytics.satisfaccion.negocios}</p>
                    <p className="text-sm text-gray-500">Satisfacción Negocios</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2">
                      <Award className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold">{colaboracionesAnalytics.satisfaccion.nps}</p>
                    <p className="text-sm text-gray-500">Net Promoter Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Geográfico */}
        <TabsContent value="geografico" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Región</CardTitle>
              <CardDescription>Análisis detallado de métricas por ubicación geográfica</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Mapa de calor simulado */}
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <Map className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Mapa de calor interactivo</p>
                  <p className="text-sm text-gray-400">Visualización geográfica de actividad</p>
                </div>

                {/* Tabla de regiones */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">Región</th>
                        <th className="text-right py-3">Revenue</th>
                        <th className="text-right py-3">Usuarios</th>
                        <th className="text-right py-3">Conversión</th>
                        <th className="text-right py-3">Ticket Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regiones.map((region, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 font-medium">{region.region}</td>
                          <td className="text-right py-3">${region.revenue.toLocaleString('es-MX')}</td>
                          <td className="text-right py-3">{region.usuarios.toLocaleString('es-MX')}</td>
                          <td className="text-right py-3">{region.conversiones}%</td>
                          <td className="text-right py-3">${region.ticketPromedio.toLocaleString('es-MX')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};