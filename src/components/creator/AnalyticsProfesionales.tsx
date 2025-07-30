import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  Clock,
  Calendar,
  Download,
  Instagram,
  Youtube,
  Video,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsDonutChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';

interface MetricaPorPlataforma {
  plataforma: string;
  seguidores: number;
  crecimiento: number;
  engagementRate: number;
  alcancePromedio: number;
  mejorHorario: string;
}

interface AnalyticsProfesionalesProps {
  metricasPorPlataforma: MetricaPorPlataforma[];
  datosEngagement: any[];
  datosAudiencia: any[];
  mejoresPublicaciones: any[];
}

export const AnalyticsProfesionales: React.FC<AnalyticsProfesionalesProps> = ({
  metricasPorPlataforma,
  datosEngagement,
  datosAudiencia,
  mejoresPublicaciones
}) => {
  const [periodo, setPeriodo] = useState('7d');
  const [plataformaSeleccionada, setPlataformaSeleccionada] = useState('todas');

  const formatearNumero = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const obtenerIconoPlataforma = (plataforma: string) => {
    const iconos = {
      instagram: <Instagram className="w-5 h-5" />,
      youtube: <Youtube className="w-5 h-5" />,
      tiktok: <Video className="w-5 h-5" />
    };
    return iconos[plataforma.toLowerCase() as keyof typeof iconos] || <Activity className="w-5 h-5" />;
  };

  const COLORES = ['#000000', '#4B5563', '#9CA3AF', '#D1D5DB'];

  // Datos para el gráfico de radar de rendimiento
  const datosRadar = [
    { metrica: 'Alcance', valor: 85, valorCompleto: 100 },
    { metrica: 'Engagement', valor: 92, valorCompleto: 100 },
    { metrica: 'Crecimiento', valor: 78, valorCompleto: 100 },
    { metrica: 'Consistencia', valor: 88, valorCompleto: 100 },
    { metrica: 'Calidad', valor: 95, valorCompleto: 100 },
    { metrica: 'Conversión', valor: 72, valorCompleto: 100 }
  ];

  // Datos de distribución de audiencia
  const datosDistribucionEdad = [
    { nombre: '13-17', valor: 12, porcentaje: 12 },
    { nombre: '18-24', valor: 35, porcentaje: 35 },
    { nombre: '25-34', valor: 28, porcentaje: 28 },
    { nombre: '35-44', valor: 15, porcentaje: 15 },
    { nombre: '45+', valor: 10, porcentaje: 10 }
  ];

  const datosDistribucionGenero = [
    { nombre: 'Mujeres', valor: 62, color: '#E91E63' },
    { nombre: 'Hombres', valor: 35, color: '#2196F3' },
    { nombre: 'Otros', valor: 3, color: '#9C27B0' }
  ];

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Analytics Profesionales</h2>
          <p className="text-gray-500 mt-1">Análisis detallado de tu rendimiento en redes sociales</p>
        </div>
        <div className="flex gap-3">
          <Select value={plataformaSeleccionada} onValueChange={setPlataformaSeleccionada}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Plataforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="1y">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-full">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas por plataforma */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricasPorPlataforma.map((metrica, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    {obtenerIconoPlataforma(metrica.plataforma)}
                  </div>
                  <CardTitle className="text-lg capitalize">{metrica.plataforma}</CardTitle>
                </div>
                <Badge variant={metrica.crecimiento > 0 ? "default" : "secondary"}>
                  {metrica.crecimiento > 0 ? '+' : ''}{metrica.crecimiento}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Seguidores</span>
                  <span className="font-semibold">{formatearNumero(metrica.seguidores)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Engagement Rate</span>
                  <span className="font-semibold">{metrica.engagementRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Alcance Promedio</span>
                  <span className="font-semibold">{formatearNumero(metrica.alcancePromedio)}</span>
                </div>
              </div>
              <div className="pt-3 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Mejor horario: <span className="font-medium text-gray-900">{metrica.mejorHorario}</span></span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs con diferentes vistas de analytics */}
      <Tabs defaultValue="engagement" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="audiencia">Audiencia</TabsTrigger>
          <TabsTrigger value="rendimiento">Rendimiento</TabsTrigger>
          <TabsTrigger value="contenido">Contenido Top</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de engagement temporal */}
            <Card>
              <CardHeader>
                <CardTitle>Evolución del Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={datosEngagement}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="fecha" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="engagement" 
                        stroke="#000" 
                        fill="#000" 
                        fillOpacity={0.1} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Métricas de engagement */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Interacción</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="text-gray-700">Me gusta promedio</span>
                    </div>
                    <span className="font-semibold text-lg">2.3K</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-blue-500" />
                      <span className="text-gray-700">Comentarios promedio</span>
                    </div>
                    <span className="font-semibold text-lg">156</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Share2 className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Compartidos promedio</span>
                    </div>
                    <span className="font-semibold text-lg">89</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-purple-500" />
                      <span className="text-gray-700">Impresiones promedio</span>
                    </div>
                    <span className="font-semibold text-lg">15.7K</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audiencia" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Distribución por edad */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Edad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={datosDistribucionEdad}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="nombre" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="valor" fill="#000" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Distribución por género */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Género</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsDonutChart>
                      <Pie
                        data={datosDistribucionGenero}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="valor"
                      >
                        {datosDistribucionGenero.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsDonutChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-2xl font-bold">100%</p>
                      <p className="text-sm text-gray-500">Total</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {datosDistribucionGenero.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-gray-600">{item.nombre}</span>
                      </div>
                      <span className="text-sm font-medium">{item.valor}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ubicaciones principales */}
            <Card>
              <CardHeader>
                <CardTitle>Ubicaciones Principales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { ciudad: 'Ciudad de México', porcentaje: 35 },
                    { ciudad: 'Guadalajara', porcentaje: 18 },
                    { ciudad: 'Monterrey', porcentaje: 15 },
                    { ciudad: 'Puebla', porcentaje: 12 },
                    { ciudad: 'Tijuana', porcentaje: 8 },
                    { ciudad: 'Otras', porcentaje: 12 }
                  ].map((ubicacion, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{ubicacion.ciudad}</span>
                        <span className="text-sm font-medium">{ubicacion.porcentaje}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-black rounded-full h-2"
                          style={{ width: `${ubicacion.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rendimiento" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar de rendimiento */}
            <Card>
              <CardHeader>
                <CardTitle>Puntuación de Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={datosRadar}>
                      <PolarGrid strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="metrica" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Actual" dataKey="valor" stroke="#000" fill="#000" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Benchmarking */}
            <Card>
              <CardHeader>
                <CardTitle>Comparación con la Industria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metrica: 'Engagement Rate', tuValor: 6.8, promedio: 3.5 },
                    { metrica: 'Crecimiento Mensual', tuValor: 12.5, promedio: 5.2 },
                    { metrica: 'Alcance por Post', tuValor: 15000, promedio: 8000 },
                    { metrica: 'Tasa de Conversión', tuValor: 3.2, promedio: 1.8 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{item.metrica}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">Promedio: {typeof item.promedio === 'number' && item.promedio > 1000 ? formatearNumero(item.promedio) : `${item.promedio}%`}</span>
                          <span className="font-semibold">Tú: {typeof item.tuValor === 'number' && item.tuValor > 1000 ? formatearNumero(item.tuValor) : `${item.tuValor}%`}</span>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gray-400 rounded-full h-2 absolute"
                            style={{ width: `${(item.promedio / Math.max(item.tuValor, item.promedio)) * 100}%` }}
                          />
                          <div 
                            className="bg-black rounded-full h-2 absolute"
                            style={{ width: `${(item.tuValor / Math.max(item.tuValor, item.promedio)) * 100}%` }}
                          />
                        </div>
                      </div>
                      {item.tuValor > item.promedio && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <TrendingUp className="w-3 h-3" />
                          <span>{((item.tuValor - item.promedio) / item.promedio * 100).toFixed(0)}% por encima del promedio</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contenido" className="space-y-6 mt-6">
          {/* Grid de mejores publicaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mejoresPublicaciones.map((publicacion, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img 
                    src={publicacion.imagen} 
                    alt={publicacion.titulo}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-black text-white">
                      #{index + 1} Mejor
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{publicacion.titulo}</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <Eye className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                      <p className="text-xs text-gray-500">Alcance</p>
                      <p className="text-sm font-semibold">{formatearNumero(publicacion.alcance)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <Heart className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                      <p className="text-xs text-gray-500">Me gusta</p>
                      <p className="text-sm font-semibold">{formatearNumero(publicacion.likes)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <MessageCircle className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                      <p className="text-xs text-gray-500">Comentarios</p>
                      <p className="text-sm font-semibold">{publicacion.comentarios}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};