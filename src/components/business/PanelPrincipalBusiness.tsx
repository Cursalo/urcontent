import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Target,
  Eye,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Star
} from 'lucide-react';
import { businessMockData } from '@/data/businessMockData';

const PanelPrincipalBusiness: React.FC = () => {
  const {
    metricas,
    rendimientoCampanas,
    distribucionPlataformas,
    campanasActivas,
    creatorsDestacados,
    calendarioCampanas
  } = businessMockData;

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

  // Calcular cambios porcentuales
  const calcularCambio = (actual: number, anterior: number) => {
    const cambio = ((actual - anterior) / anterior) * 100;
    return {
      valor: Math.abs(cambio).toFixed(1),
      esPositivo: cambio >= 0
    };
  };

  // Métricas principales con configuración
  const metricasConfig = [
    {
      titulo: 'Inversión Total',
      valor: formatCurrency(metricas.inversionTotal),
      cambio: calcularCambio(metricas.inversionMes, 38000),
      descripcion: 'Este mes',
      icono: DollarSign,
      valorSecundario: formatCurrency(metricas.inversionMes)
    },
    {
      titulo: 'Campañas Activas',
      valor: metricas.campanasActivas.toString(),
      cambio: { valor: '2', esPositivo: true },
      descripcion: 'En progreso',
      icono: Target,
      valorSecundario: `${metricas.campanasCompletadas} completadas`
    },
    {
      titulo: 'Alcance Total',
      valor: formatNumber(metricas.alcanceTotal),
      cambio: calcularCambio(metricas.alcanceMes, 520000),
      descripcion: 'Este mes',
      icono: Eye,
      valorSecundario: formatNumber(metricas.alcanceMes)
    },
    {
      titulo: 'ROI Promedio',
      valor: `${metricas.promedioROI}x`,
      cambio: { valor: '0.4', esPositivo: true },
      descripcion: 'vs. mes anterior',
      icono: TrendingUp,
      valorSecundario: `${metricas.tasaConversion}% conversión`
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header con acciones rápidas */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-gray-900">Panel Principal</h1>
          <p className="text-gray-500 mt-1">Resumen de tu actividad de marketing con creators</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="rounded">
            <Calendar className="w-4 h-4 mr-2"/>
            Ver Calendario
          </Button>
          <Button className="bg-black hover:bg-gray-800 text-white rounded">
            <Plus className="w-4 h-4 mr-2"/>
            Nueva Campaña
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricasConfig.map((metrica, index) => (
          <Card key={index} className="bg-white border border-gray-200 rounded hover:border-gray-400 transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                  <metrica.icono className="w-6 h-6 text-gray-700"/>
                </div>
                <div className="flex items-center space-x-1">
                  {metrica.cambio.esPositivo ? (
                    <ArrowUpRight className="w-4 h-4 text-gray-600"/>
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-gray-600"/>
                  )}
                  <span className="text-sm font-medium text-gray-600">
                    {metrica.cambio.valor}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{metrica.titulo}</p>
                <p className="text-2xl font-semibold text-gray-900 mb-1">{metrica.valor}</p>
                <p className="text-xs text-gray-500">
                  {metrica.valorSecundario} • {metrica.descripcion}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos y análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de inversión vs retorno */}
        <div className="lg:col-span-2">
          <Card className="bg-white border border-gray-200 rounded">
            <CardHeader>
              <CardTitle className="text-xl font-medium text-gray-900">Inversión vs Alcance</CardTitle>
              <CardDescription>Evolución mensual de tu inversión y resultados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={rendimientoCampanas}>
                  <defs>
                    <linearGradient id="colorInversion" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#000" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorAlcance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#666" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#666" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="mes" stroke="#666"/>
                  <YAxis stroke="#666"/>
                  <Tooltip
                    formatter={(value: any, name: string) => {
                      if (name === 'inversion') return [formatCurrency(value), 'Inversión'];
                      if (name === 'alcance') return [formatNumber(value), 'Alcance'];
                      return [value, name];
                    }}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="inversion"
                    stroke="#000"
                    fillOpacity={1}
                    fill="url(#colorInversion)"
                  />
                  <Area
                    type="monotone"
                    dataKey="alcance"
                    stroke="#666"
                    fillOpacity={1}
                    fill="url(#colorAlcance)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Distribución por plataforma */}
        <Card className="bg-white border border-gray-200 rounded">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-gray-900">Mix de Plataformas</CardTitle>
            <CardDescription>Distribución de campañas activas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {distribucionPlataformas.map((plataforma, index) => {
                const grayShades = ['#000', '#333', '#666', '#999'];
                const color = grayShades[index % grayShades.length];
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-sm font-medium text-gray-700">{plataforma.nombre}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{plataforma.valor}%</span>
                    </div>
                    <Progress value={plataforma.valor} className="h-2"/>
                    <p className="text-xs text-gray-500">{plataforma.campanasActivas} campañas activas</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campañas activas y Creators destacados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campañas activas */}
        <Card className="bg-white border border-gray-200 rounded">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-medium text-gray-900">Campañas Activas</CardTitle>
                <CardDescription>Progreso y estado actual</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="rounded">
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {campanasActivas.slice(0, 3).map((campana) => (
              <div key={campana.id} className="space-y-3 p-4 bg-gray-50 rounded">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{campana.nombre}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatCurrency(campana.gastado)} de {formatCurrency(campana.presupuesto)}
                    </p>
                  </div>
                  <Badge 
                    className={
                      campana.estado === 'en_progreso' ? 'bg-black text-white' :
                      campana.estado === 'revision' ? 'bg-gray-500 text-white' :
                      'bg-gray-200 text-gray-700'
                    }
                  >
                    {campana.estado === 'en_progreso' ? 'En Progreso' :
                     campana.estado === 'revision' ? 'En Revisión' :
                     'Planificación'}
                  </Badge>
                </div>
                <Progress value={campana.progreso} className="h-2"/>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {campana.creators.slice(0, 3).map((creator) => (
                      <Avatar key={creator.id} className="w-8 h-8 border-2 border-white">
                        <AvatarImage src={creator.avatar} />
                        <AvatarFallback>{creator.nombre.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {campana.creators.length > 3 && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                        +{campana.creators.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1"/>
                      {formatNumber(campana.metricas.alcance)}
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1"/>
                      {campana.metricas.roi}x ROI
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Creators destacados */}
        <Card className="bg-white border border-gray-200 rounded">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-medium text-gray-900">Creators Destacados</CardTitle>
                <CardDescription>Con los que has trabajado</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="rounded">
                Buscar más
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {creatorsDestacados.slice(0, 3).map((creator) => (
              <div key={creator.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded transition-colors">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={creator.avatar} />
                    <AvatarFallback>{creator.nombre.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{creator.nombre}</h4>
                      {creator.verificado && (
                        <CheckCircle className="w-4 h-4 text-gray-500"/>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {creator.categoria} • {formatNumber(creator.seguidores)} seguidores
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-gray-700">
                    <Star className="w-4 h-4 fill-current"/>
                    <span className="text-sm font-medium">{creator.roi}</span>
                  </div>
                  <p className="text-xs text-gray-500">{creator.campanasCompletadas} campañas</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Próximos eventos y recordatorios */}
      <Card className="bg-black text-white rounded">
        <CardHeader>
          <CardTitle className="text-xl font-light">Próximos Eventos</CardTitle>
          <CardDescription className="text-gray-300">No pierdas ninguna fecha importante</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {calendarioCampanas.map((evento) => (
              <div key={evento.id} className="bg-white/10 backdrop-blur-sm rounded p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded flex items-center justify-center bg-white/20">
                    {evento.tipo === 'inicio' ? <Clock className="w-5 h-5 text-white"/> :
                     evento.tipo === 'revision' ? <AlertCircle className="w-5 h-5 text-white"/> :
                     <CheckCircle className="w-5 h-5 text-white"/>}
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {new Date(evento.fecha).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </Badge>
                </div>
                <h4 className="font-medium text-white mb-1">{evento.titulo}</h4>
                <p className="text-sm text-gray-300">{evento.campana}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between p-4 bg-white/5 rounded">
            <div>
              <p className="font-medium">¿Listo para tu próxima campaña?</p>
              <p className="text-sm text-gray-300 mt-1">Encuentra los mejores creators para tu marca</p>
            </div>
            <Button className="bg-white text-black hover:bg-gray-100 rounded">
              Explorar Creators
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PanelPrincipalBusiness;