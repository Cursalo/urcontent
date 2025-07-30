import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar,
} from 'recharts';
import {
  Users, DollarSign, TrendingUp, TrendingDown, Activity, Globe, Calendar,
  ArrowUp, ArrowDown, AlertTriangle, CheckCircle, Clock, Zap, Target,
  Award, ShoppingCart, CreditCard, UserCheck, UserX, MessageCircle, Star,
} from "lucide-react";

export const PanelControlAdmin = () => {
  // Datos de métricas principales
  const metricsData = [
    {
      title: "Usuarios Totales",
      value: "25.847",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      details: { nuevosHoy: 45, activosHoy: 1234, promedioSesion: "8.5 min" }
    },
    {
      title: "Ingresos del Mes",
      value: "$2.485.320",
      subValue: "MXN",
      change: "+18.2%",
      trend: "up",
      icon: DollarSign,
      details: { ingresosBrutos: "$16.568.800", comision: "15%", transacciones: 847 }
    },
    {
      title: "Colaboraciones Activas",
      value: "2.340",
      change: "+25.3%",
      trend: "up",
      icon: MessageCircle,
      details: { completadasHoy: 23, enProgreso: 156, pendientesRevision: 12 }
    },
    {
      title: "Tasa de Éxito",
      value: "96.8%",
      change: "+2.1%",
      trend: "up",
      icon: Target,
      details: { aTiempo: "94.2%", calidad: "98.5%", satisfaccion: "97.3%" }
    }
  ];

  // Datos de crecimiento por hora (últimas 24 horas)
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hora: `${i}:00`,
    usuarios: Math.floor(Math.random() * 500) + 300,
    ingresos: Math.floor(Math.random() * 5000) + 2000,
    colaboraciones: Math.floor(Math.random() * 50) + 20,
  }));

  // Distribución geográfica
  const geoData = [
    { region: 'Ciudad de México', usuarios: 8420, porcentaje: 32.6, ingresos: 845000 },
    { region: 'Guadalajara', usuarios: 4230, porcentaje: 16.4, ingresos: 425000 },
    { region: 'Monterrey', usuarios: 3850, porcentaje: 14.9, ingresos: 395000 },
    { region: 'Puebla', usuarios: 2100, porcentaje: 8.1, ingresos: 210000 },
    { region: 'Tijuana', usuarios: 1850, porcentaje: 7.2, ingresos: 185000 },
    { region: 'Otras', usuarios: 5397, porcentaje: 20.8, ingresos: 425320 },
  ];

  // Performance del sistema
  const systemPerformance = [
    { nombre: 'API Gateway', valor: 99.98, status: 'optimal' },
    { nombre: 'Base de Datos', valor: 99.95, status: 'optimal' },
    { nombre: 'CDN', valor: 99.99, status: 'optimal' },
    { nombre: 'Servidor Web', valor: 99.87, status: 'optimal' },
    { nombre: 'Cache', valor: 98.5, status: 'good' },
  ];

  // Actividad reciente
  const recentActivity = [
    { tipo: 'nuevo_usuario', mensaje: 'María García se registró como creadora', tiempo: 'Hace 2 min', icono: UserCheck, color: 'text-gray-600' },
    { tipo: 'colaboracion', mensaje: 'Nueva colaboración: TechStore x Carlos Tech', tiempo: 'Hace 5 min', icono: MessageCircle, color: 'text-gray-600' },
    { tipo: 'pago', mensaje: 'Pago procesado: $15,500 MXN', tiempo: 'Hace 8 min', icono: CreditCard, color: 'text-gray-600' },
    { tipo: 'alerta', mensaje: 'Disputa abierta en colaboración #8834', tiempo: 'Hace 15 min', icono: AlertTriangle, color: 'text-gray-700' },
    { tipo: 'verificacion', mensaje: 'Fitness Pro verificado exitosamente', tiempo: 'Hace 20 min', icono: CheckCircle, color: 'text-gray-600' },
  ];

  // Top performers
  const topPerformers = [
    { nombre: 'Carlos Tech', tipo: 'Creador', colaboraciones: 31, ingresos: '$58,900', rating: 4.9 },
    { nombre: 'María García', tipo: 'Creadora', colaboraciones: 23, ingresos: '$45,200', rating: 4.9 },
    { nombre: 'Café Central', tipo: 'Negocio', colaboraciones: 12, gastos: '$28,500', rating: 4.7 },
    { nombre: 'Laura Fashion', tipo: 'Creadora', colaboraciones: 26, ingresos: '$41,600', rating: 4.7 },
  ];

  const COLORS = ['#000', '#333', '#666', '#999', '#ccc', '#eee'];

  return (
    <div className="space-y-6">
      {/* Alertas del Sistema */}
      <div className="bg-white border border-gray-200 rounded p-4 shadow-sm">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-gray-700 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Alertas del Sistema</h4>
            <p className="text-sm text-gray-600 mt-1">
              3 disputas pendientes de revisión • Actualización de sistema programada para el domingo 2:00 AM
            </p>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsData.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-gray-400">
            <CardHeader className="pb-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gray-100 rounded">
                  <metric.icon className="w-6 h-6 text-gray-700" />
                </div>
                <Badge 
                  variant={metric.trend === 'up' ? 'default' : 'destructive'} 
                  className={`flex items-center space-x-1 rounded ${
                    metric.trend === 'up' ? 'bg-black text-white' : 'bg-gray-500 text-white'
                  }`}
                >
                  {metric.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  <span>{metric.change}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-3xl font-bold">{metric.value}</p>
                  {metric.subValue && <p className="text-sm text-gray-500">{metric.subValue}</p>}
                </div>
                <p className="text-sm text-gray-600">{metric.title}</p>
                <div className="pt-3 border-t space-y-1">
                  {Object.entries(metric.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-500 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()
                          .replace('nuevos Hoy', 'Nuevos hoy')
                          .replace('activos Hoy', 'Activos hoy')
                          .replace('promedio Sesion', 'Promedio sesión')
                          .replace('ingresos Brutos', 'Ingresos brutos')
                          .replace('comision', 'Comisión')
                          .replace('transacciones', 'Transacciones')
                          .replace('completadas Hoy', 'Completadas hoy')
                          .replace('en Progreso', 'En progreso')
                          .replace('pendientes Revision', 'Pendientes revisión')
                          .replace('a Tiempo', 'A tiempo')
                          .replace('calidad', 'Calidad')
                          .replace('satisfaccion', 'Satisfacción')}:
                      </span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos de Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad en Tiempo Real */}
        <Card className="border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Actividad en Tiempo Real (24h)</span>
              </span>
              <Badge variant="outline" className="animate-pulse rounded bg-white border-gray-300">
                <span className="w-2 h-2 bg-gray-600 rounded-full mr-2 animate-pulse"></span>
                En vivo
              </Badge>
            </CardTitle>
            <CardDescription>Usuarios activos e ingresos por hora</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorUsuarios" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#000" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#666" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#666" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === 'usuarios' ? value : `$${value.toLocaleString('es-MX')}`,
                    name === 'usuarios' ? 'Usuarios' : 'Ingresos'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="usuarios"
                  stroke="#000"
                  fillOpacity={1}
                  fill="url(#colorUsuarios)"
                />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#666"
                  fillOpacity={1}
                  fill="url(#colorIngresos)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución Geográfica */}
        <Card className="border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Distribución Geográfica</span>
            </CardTitle>
            <CardDescription>Usuarios e ingresos por región</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={geoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ region, porcentaje }) => `${region}: ${porcentaje}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="porcentaje"
                >
                  {geoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {geoData.map((region, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                    />
                    <span>{region.region}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">{region.usuarios.toLocaleString('es-MX')} usuarios</span>
                    <span className="font-medium">${region.ingresos.toLocaleString('es-MX')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance y Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Salud del Sistema */}
        <Card className="border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Salud del Sistema</span>
            </CardTitle>
            <CardDescription>Monitoreo de infraestructura</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemPerformance.map((system, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{system.nombre}</span>
                    <span className="font-medium">{system.valor}%</span>
                  </div>
                  <Progress value={system.valor} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card className="border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Actividad Reciente</span>
            </CardTitle>
            <CardDescription>Últimas acciones en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <activity.icono className={`w-5 h-5 mt-0.5 ${activity.color}`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{activity.mensaje}</p>
                    <p className="text-xs text-gray-500">{activity.tiempo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Mejores Usuarios</span>
            </CardTitle>
            <CardDescription>Usuarios más activos del mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-black text-white' :
                      index === 1 ? 'bg-gray-700 text-white' :
                      index === 2 ? 'bg-gray-500 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{performer.nombre}</p>
                      <p className="text-xs text-gray-500">{performer.tipo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {performer.ingresos || performer.gastos}
                    </p>
                    <div className="flex items-center space-x-1 text-xs">
                      <Star className="w-3 h-3 text-gray-600 fill-current" />
                      <span>{performer.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};