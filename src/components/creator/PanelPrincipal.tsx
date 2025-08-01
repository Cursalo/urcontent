import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MetricaCard {
  titulo: string;
  valor: string;
  cambio: number;
  esCrecimiento: boolean;
  objetivo?: number;
  actual?: number;
  icono: React.ReactNode;
  color: string;
}

interface ProximaColaboracion {
  id: string;
  empresa: string;
  fecha: string;
  tipo: string;
  estado: 'pendiente' | 'en_progreso' | 'completada';
}

interface PanelPrincipalProps {
  metricas: MetricaCard[];
  datosIngresos: any[];
  proximasColaboraciones: ProximaColaboracion[];
  tareasPendientes: number;
}

export const PanelPrincipal: React.FC<PanelPrincipalProps> = ({
  metricas,
  datosIngresos,
  proximasColaboraciones,
  tareasPendientes
}) => {
  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const obtenerColorEstado = (estado: string) => {
    const colores = {
      pendiente: 'bg-gray-100 text-gray-900',
      en_progreso: 'bg-gray-200 text-gray-900',
      completada: 'bg-black text-white'
    };
    return colores[estado as keyof typeof colores] || 'bg-gray-100 text-gray-800';
  };

  const obtenerTextoEstado = (estado: string) => {
    const textos = {
      pendiente: 'Pendiente',
      en_progreso: 'En Progreso',
      completada: 'Completada'
    };
    return textos[estado as keyof typeof textos] || estado;
  };

  return (
    <div className="space-y-8">
      {/* Notificaciones Importantes */}
      {tareasPendientes > 0 && (
        <div className="bg-white border border-gray-200 rounded p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3">
            <AlertCircle className="w-5 h-5 text-gray-700 mt-0.5 flex-shrink-0"/>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Atención Requerida</h4>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Tienes {tareasPendientes} {tareasPendientes === 1 ? 'tarea pendiente' : 'tareas pendientes'} que requieren tu atención.
              </p>
            </div>
            <Button 
              size="sm"
              className="bg-black hover:bg-gray-800 text-white rounded w-full sm:w-auto"
            >
              Ver Tareas
            </Button>
          </div>
        </div>
      )}

      {/* Métricas Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metricas.map((metrica, index) => (
          <Card key={index} className="border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                  {metrica.icono}
                </div>
                <div className="flex items-center space-x-1">
                  {metrica.esCrecimiento ? (
                    <TrendingUp className="w-4 h-4 text-gray-700"/>
                  ) : (
                    <TrendingDown className="w-4 h-4 text-gray-700"/>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {Math.abs(metrica.cambio)}%
                  </span>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{metrica.valor}</h3>
              <p className="text-sm text-gray-500">{metrica.titulo}</p>
              
              {metrica.objetivo && metrica.actual && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Progreso</span>
                    <span>{Math.round((metrica.actual / metrica.objetivo) * 100)}%</span>
                  </div>
                  <Progress value={(metrica.actual / metrica.objetivo) * 100} className="h-2"/>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico de Ingresos y Próximas Colaboraciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Gráfico de Ingresos */}
        <div className="lg:col-span-2">
          <Card className="border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="bg-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Ingresos Mensuales</CardTitle>
                <select className="text-xs sm:text-sm border border-gray-200 rounded px-3 sm:px-4 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                  <option>Últimos 6 meses</option>
                  <option>Último año</option>
                  <option>Todo el tiempo</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] sm:h-[250px] lg:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={datosIngresos}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                    <XAxis 
                      dataKey="mes"
                      stroke="#666"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#666"
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip 
                      formatter={(value: any) => formatearMoneda(value)}
                      labelFormatter={(label) => `Mes: ${label}`}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e5e5',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Line 
                      type="monotone"
                      dataKey="ingresos"
                      stroke="#000"
                      strokeWidth={2}
                      dot={{ fill: '#000', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone"
                      dataKey="objetivo"
                      stroke="#666"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-black rounded-full"/>
                  <span className="text-xs sm:text-sm text-gray-600">Ingresos Reales</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-0.5 bg-gray-600" style={{ borderTop: '2px dashed #666' }} />
                  <span className="text-xs sm:text-sm text-gray-600">Objetivo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Próximas Colaboraciones */}
        <div>
          <Card className="border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-lg h-full">
            <CardHeader className="bg-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Próximas Colaboraciones</CardTitle>
                <Button 
                  variant="ghost"
                  size="sm"
                  className="text-sm hover:bg-gray-100 transition-colors rounded"
                >
                  Ver Todas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proximasColaboraciones.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
                    <p className="text-gray-500">No hay colaboraciones próximas</p>
                  </div>
                ) : (
                  proximasColaboraciones.slice(0, 4).map((colaboracion) => (
                    <div 
                      key={colaboracion.id}
                      className="flex items-start space-x-3 p-3 rounded hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-gray-600"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                          {colaboracion.empresa}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500">{colaboracion.tipo}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatearFecha(colaboracion.fecha)}</p>
                      </div>
                      <Badge className={`${obtenerColorEstado(colaboracion.estado)} text-xs`}>
                        {obtenerTextoEstado(colaboracion.estado)}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-black rounded p-8 text-white shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-semibold mb-2">Acciones Rápidas</h3>
            <p className="text-gray-300">Accede rápidamente a las funciones más utilizadas</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-gray-400"/>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded py-6 transition-all duration-300">
            <div className="text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2"/>
              <span className="text-sm">Programar Contenido</span>
            </div>
          </Button>
          <Button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded py-6 transition-all duration-300">
            <div className="text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2"/>
              <span className="text-sm">Ver Analytics</span>
            </div>
          </Button>
          <Button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded py-6 transition-all duration-300">
            <div className="text-center">
              <AlertCircle className="w-6 h-6 mx-auto mb-2"/>
              <span className="text-sm">Mensajes</span>
            </div>
          </Button>
          <Button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded py-6 transition-all duration-300">
            <div className="text-center">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2"/>
              <span className="text-sm">Tareas</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};