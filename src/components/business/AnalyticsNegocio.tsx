import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
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
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Eye,
  Target,
  Calendar,
  Download,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Award,
  AlertCircle,
  Info
} from 'lucide-react';
import { businessMockData } from '@/data/businessMockData';

const AnalyticsNegocio: React.FC = () => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');
  const [vistaActiva, setVistaActiva] = useState('general');

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Formatear números
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  // Datos para el gráfico de radar (comparación con industria)
  const datosRadar = [
    {
      metrica: 'ROI',
      tuNegocio: 85,
      industria: 70,
      maximo: 100
    },
    {
      metrica: 'Engagement',
      tuNegocio: 90,
      industria: 65,
      maximo: 100
    },
    {
      metrica: 'Alcance',
      tuNegocio: 75,
      industria: 60,
      maximo: 100
    },
    {
      metrica: 'Conversión',
      tuNegocio: 80,
      industria: 55,
      maximo: 100
    },
    {
      metrica: 'Frecuencia',
      tuNegocio: 70,
      industria: 75,
      maximo: 100
    },
    {
      metrica: 'Satisfacción',
      tuNegocio: 95,
      industria: 70,
      maximo: 100
    }
  ];

  // Datos de conversión por canal
  const datosConversionCanal = [
    { canal: 'Instagram Stories', conversiones: 450, tasa: 4.2 },
    { canal: 'Instagram Posts', conversiones: 380, tasa: 3.8 },
    { canal: 'TikTok Videos', conversiones: 320, tasa: 5.1 },
    { canal: 'YouTube Shorts', conversiones: 280, tasa: 3.5 },
    { canal: 'Reels', conversiones: 420, tasa: 4.8 }
  ];

  // Colores para gráficos
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // KPIs principales
  const kpis = [
    {
      titulo: 'ROI Total',
      valor: '4.2x',
      cambio: { valor: 15.3, esPositivo: true },
      descripcion: 'Retorno sobre inversión',
      icono: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      titulo: 'Costo por Conversión',
      valor: formatCurrency(125),
      cambio: { valor: 8.2, esPositivo: false },
      descripcion: 'Promedio por conversión',
      icono: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      titulo: 'Tasa de Conversión',
      valor: '3.8%',
      cambio: { valor: 12.5, esPositivo: true },
      descripcion: 'De alcance a venta',
      icono: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      titulo: 'Engagement Rate',
      valor: '4.5%',
      cambio: { valor: 5.7, esPositivo: true },
      descripcion: 'Interacción promedio',
      icono: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-gray-900">Analytics del Negocio</h2>
          <p className="text-gray-500 mt-1">Análisis detallado del rendimiento de tus campañas</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Última semana</SelectItem>
              <SelectItem value="mes">Último mes</SelectItem>
              <SelectItem value="trimestre">Último trimestre</SelectItem>
              <SelectItem value="año">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-full hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 transform hover:scale-105">
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-lg transform transition-all duration-300 hover:scale-105">
            <Download className="w-4 h-4 mr-2" />
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="bg-white border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 overflow-hidden relative rounded-2xl">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/10 via-transparent to-pink-50/10 pointer-events-none" />
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${kpi.bgColor} shadow-sm transform transition-transform hover:scale-110`}>
                  <kpi.icono className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <div className="flex items-center space-x-1">
                  {kpi.cambio.esPositivo ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${kpi.cambio.esPositivo ? 'text-green-500' : 'text-red-500'}`}>
                    {kpi.cambio.valor}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{kpi.titulo}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.valor}</p>
                <p className="text-xs text-gray-400 mt-1">{kpi.descripcion}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs de análisis */}
      <Tabs value={vistaActiva} onValueChange={setVistaActiva} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-full p-1">
          <TabsTrigger value="general">Vista General</TabsTrigger>
          <TabsTrigger value="campanas">Por Campaña</TabsTrigger>
          <TabsTrigger value="creators">Por Creator</TabsTrigger>
          <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
        </TabsList>

        {/* Vista General */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de tendencias */}
            <Card className="border-gray-100 hover:border-purple-200 transition-all duration-300 hover:shadow-xl overflow-hidden relative rounded-2xl">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/10 via-transparent to-pink-50/10 pointer-events-none" />
              <CardHeader className="relative bg-gradient-to-r from-gray-50/50 to-transparent">
                <CardTitle className="text-lg font-medium">Tendencia de Inversión vs ROI</CardTitle>
                <CardDescription>Evolución mensual de tu inversión y retorno</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={businessMockData.rendimientoCampanas}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" stroke="#666" />
                    <YAxis yAxisId="left" stroke="#666" />
                    <YAxis yAxisId="right" orientation="right" stroke="#666" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="inversion"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6' }}
                      name="Inversión"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="roi"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: '#10B981' }}
                      name="ROI"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribución de inversión */}
            <Card className="border-gray-100 hover:border-purple-200 transition-all duration-300 hover:shadow-xl overflow-hidden relative rounded-2xl">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/10 via-transparent to-pink-50/10 pointer-events-none" />
              <CardHeader className="relative bg-gradient-to-r from-gray-50/50 to-transparent">
                <CardTitle className="text-lg font-medium">Distribución de Inversión</CardTitle>
                <CardDescription>Asignación por plataforma</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={businessMockData.distribucionPlataformas}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="valor"
                    >
                      {businessMockData.distribucionPlataformas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Métricas de conversión */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Análisis de Conversión por Canal</CardTitle>
              <CardDescription>Rendimiento de cada canal de marketing</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datosConversionCanal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="canal" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Bar dataKey="conversiones" fill="#3B82F6" radius={[8, 8, 0, 0]}>
                    {datosConversionCanal.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                {datosConversionCanal.map((canal, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <p className="text-xs text-gray-600">{canal.canal}</p>
                    </div>
                    <p className="text-lg font-semibold">{canal.tasa}%</p>
                    <p className="text-xs text-gray-500">Tasa conversión</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vista Por Campaña */}
        <TabsContent value="campanas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Rendimiento por Campaña</CardTitle>
              <CardDescription>Análisis detallado de cada campaña activa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {businessMockData.campanasActivas.map((campana) => (
                  <div key={campana.id} className="border border-gray-200 rounded-2xl p-6 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-300 transform hover:scale-[1.01] shadow-sm hover:shadow-xl">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{campana.nombre}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(campana.fechaInicio).toLocaleDateString('es-MX')} - {new Date(campana.fechaFin).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                      <Badge variant={campana.estado === 'en_progreso' ? 'default' : 'secondary'}>
                        {campana.estado === 'en_progreso' ? 'En Progreso' : 
                         campana.estado === 'revision' ? 'En Revisión' : 
                         'Planificación'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Inversión</p>
                        <p className="text-lg font-semibold">{formatCurrency(campana.gastado)}</p>
                        <Progress value={(campana.gastado / campana.presupuesto) * 100} className="h-1 mt-1" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Alcance</p>
                        <p className="text-lg font-semibold">{formatNumber(campana.metricas.alcance)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Engagement</p>
                        <p className="text-lg font-semibold">{campana.metricas.engagement}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Conversiones</p>
                        <p className="text-lg font-semibold">{campana.metricas.conversiones}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ROI</p>
                        <p className="text-lg font-semibold text-green-600">{campana.metricas.roi}x</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex -space-x-2">
                        {campana.creators.map((creator) => (
                          <div
                            key={creator.id}
                            className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center"
                          >
                            <span className="text-xs font-medium">{creator.nombre.charAt(0)}</span>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="rounded-full hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 transform hover:scale-105">
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vista Por Creator */}
        <TabsContent value="creators" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Rendimiento por Creator</CardTitle>
              <CardDescription>Análisis del desempeño de cada creator</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Creator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campañas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Alcance Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Engagement Promedio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ROI Promedio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Calificación
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {businessMockData.creatorsDestacados.map((creator) => (
                      <tr key={creator.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">{creator.nombre.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{creator.nombre}</p>
                              <p className="text-xs text-gray-500">{creator.categoria}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900">{creator.campanasCompletadas}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900">{formatNumber(creator.seguidores * 2)}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">{creator.engagement}%</p>
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-green-600">{creator.roi}x</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Award
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
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

        {/* Vista Benchmarking */}
        <TabsContent value="benchmarking" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Comparación con industria */}
            <Card className="border-gray-100 hover:border-purple-200 transition-all duration-300 hover:shadow-xl overflow-hidden relative rounded-2xl">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/10 via-transparent to-pink-50/10 pointer-events-none" />
              <CardHeader className="relative bg-gradient-to-r from-gray-50/50 to-transparent">
                <CardTitle className="text-lg font-medium">Comparación con la Industria</CardTitle>
                <CardDescription>Tu desempeño vs. promedio del sector</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={datosRadar}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="metrica" stroke="#666" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#666" />
                    <Radar
                      name="Tu Negocio"
                      dataKey="tuNegocio"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Promedio Industria"
                      dataKey="industria"
                      stroke="#EF4444"
                      fill="#EF4444"
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Métricas comparativas */}
            <Card className="border-gray-100 hover:border-purple-200 transition-all duration-300 hover:shadow-xl overflow-hidden relative rounded-2xl">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/10 via-transparent to-pink-50/10 pointer-events-none" />
              <CardHeader className="relative bg-gradient-to-r from-gray-50/50 to-transparent">
                <CardTitle className="text-lg font-medium">Métricas Comparativas</CardTitle>
                <CardDescription>Análisis detallado por métrica</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(businessMockData.benchmarkingIndustria).filter(([key]) => key !== 'tuNegocio').map(([metrica, valorIndustria]) => {
                  const valorNegocio = businessMockData.benchmarkingIndustria.tuNegocio[metrica as keyof typeof businessMockData.benchmarkingIndustria.tuNegocio] || 0;
                  const diferencia = ((valorNegocio - valorIndustria) / valorIndustria * 100);
                  
                  return (
                    <div key={metrica} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {metrica.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Tu negocio:</span>
                          <span className="text-sm font-semibold">
                            {typeof valorNegocio === 'number' && metrica.includes('roi') ? `${valorNegocio}x` :
                             typeof valorNegocio === 'number' && metrica.includes('inversion') ? formatCurrency(valorNegocio) :
                             valorNegocio}
                          </span>
                          <Badge variant={diferencia > 0 ? "default" : "destructive"}>
                            {diferencia > 0 ? '+' : ''}{diferencia.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gray-400 h-2 rounded-full absolute"
                            style={{ width: '50%' }}
                          />
                          <div
                            className={`h-2 rounded-full absolute ${diferencia > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ 
                              width: `${Math.min(Math.abs(diferencia), 50)}%`,
                              left: diferencia > 0 ? '50%' : `${50 - Math.min(Math.abs(diferencia), 50)}%`
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Promedio industria: {
                          typeof valorIndustria === 'number' && metrica.includes('roi') ? `${valorIndustria}x` :
                          typeof valorIndustria === 'number' && metrica.includes('inversion') ? formatCurrency(valorIndustria) :
                          valorIndustria
                        }
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Insights y recomendaciones */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-2xl shadow-xl transform hover:scale-[1.01] transition-transform duration-300 overflow-hidden relative">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-transparent to-purple-400/10 animate-pulse" />
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span>Insights y Recomendaciones</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3 bg-white/80 p-4 rounded-xl backdrop-blur-sm shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">ROI Superior al Promedio</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Tu ROI de 4.2x está 20% por encima del promedio de la industria. Mantén esta estrategia con los creators actuales.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 bg-white/80 p-4 rounded-xl backdrop-blur-sm shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Oportunidad de Mejora</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Considera aumentar tu presencia en TikTok. La plataforma muestra el mayor engagement (5.1%) en tus campañas.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 bg-white/80 p-4 rounded-xl backdrop-blur-sm shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Recomendación Estratégica</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Basado en tu rendimiento, podrías aumentar tu inversión en un 15-20% para maximizar el alcance manteniendo el ROI actual.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsNegocio;