import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DollarSign, 
  Calendar, 
  MessageCircle, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MoreVertical,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Colaboracion {
  id: string;
  empresa: string;
  titulo: string;
  valor: number;
  fechaEntrega: string;
  entregables: string[];
  prioridad: 'alta' | 'media' | 'baja';
  avatarEmpresa?: string;
  mensajesSinLeer?: number;
  progreso: number;
}

interface ColumnaKanban {
  id: string;
  titulo: string;
  colaboraciones: Colaboracion[];
  color: string;
}

interface ColaboracionesKanbanProps {
  columnas: ColumnaKanban[];
}

export const ColaboracionesKanban: React.FC<ColaboracionesKanbanProps> = ({ columnas: columnasIniciales }) => {
  const [columnas, setColumnas] = useState(columnasIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<string | null>(null);

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
    const hoy = new Date();
    const diasRestantes = Math.ceil((date.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes < 0) {
      return { texto: `Vencido hace ${Math.abs(diasRestantes)} días`, urgente: true };
    } else if (diasRestantes === 0) {
      return { texto: 'Vence hoy', urgente: true };
    } else if (diasRestantes === 1) {
      return { texto: 'Vence mañana', urgente: true };
    } else if (diasRestantes <= 7) {
      return { texto: `Vence en ${diasRestantes} días`, urgente: true };
    } else {
      return { 
        texto: new Intl.DateTimeFormat('es-MX', {
          day: 'numeric',
          month: 'short'
        }).format(date),
        urgente: false 
      };
    }
  };

  const obtenerColorPrioridad = (prioridad: string) => {
    const colores = {
      alta: 'bg-red-100 text-red-800',
      media: 'bg-yellow-100 text-yellow-800',
      baja: 'bg-green-100 text-green-800'
    };
    return colores[prioridad as keyof typeof colores] || 'bg-gray-100 text-gray-800';
  };

  const obtenerTextoPrioridad = (prioridad: string) => {
    const textos = {
      alta: 'Alta',
      media: 'Media',
      baja: 'Baja'
    };
    return textos[prioridad as keyof typeof textos] || prioridad;
  };

  const handleDragStart = (e: React.DragEvent, colaboracionId: string, columnaOrigen: string) => {
    e.dataTransfer.setData('colaboracionId', colaboracionId);
    e.dataTransfer.setData('columnaOrigen', columnaOrigen);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, columnaDestino: string) => {
    e.preventDefault();
    const colaboracionId = e.dataTransfer.getData('colaboracionId');
    const columnaOrigen = e.dataTransfer.getData('columnaOrigen');

    if (columnaOrigen === columnaDestino) return;

    setColumnas((prevColumnas) => {
      const nuevasColumnas = [...prevColumnas];
      const columnaOrigenObj = nuevasColumnas.find(col => col.id === columnaOrigen);
      const columnaDestinoObj = nuevasColumnas.find(col => col.id === columnaDestino);

      if (columnaOrigenObj && columnaDestinoObj) {
        const colaboracion = columnaOrigenObj.colaboraciones.find(c => c.id === colaboracionId);
        if (colaboracion) {
          columnaOrigenObj.colaboraciones = columnaOrigenObj.colaboraciones.filter(c => c.id !== colaboracionId);
          columnaDestinoObj.colaboraciones.push(colaboracion);
        }
      }

      return nuevasColumnas;
    });
  };

  const colaboracionesFiltradas = columnas.map(columna => ({
    ...columna,
    colaboraciones: columna.colaboraciones.filter(colaboracion => {
      const cumpleBusqueda = colaboracion.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                            colaboracion.empresa.toLowerCase().includes(busqueda.toLowerCase());
      const cumpleFiltro = !filtroActivo || colaboracion.prioridad === filtroActivo;
      return cumpleBusqueda && cumpleFiltro;
    })
  }));

  return (
    <div className="space-y-6">
      {/* Barra de herramientas */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar colaboraciones..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Prioridad</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFiltroActivo(null)}>
                Todas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFiltroActivo('alta')}>
                Alta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFiltroActivo('media')}>
                Media
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFiltroActivo('baja')}>
                Baja
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button className="bg-black hover:bg-gray-800 text-white rounded-full">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Colaboración
        </Button>
      </div>

      {/* Tablero Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto">
        {colaboracionesFiltradas.map((columna) => (
          <div 
            key={columna.id}
            className="bg-gray-50 rounded-2xl p-4 min-w-[300px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, columna.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{columna.titulo}</h3>
              <Badge variant="secondary" className="bg-white">
                {columna.colaboraciones.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {columna.colaboraciones.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No hay colaboraciones</p>
                </div>
              ) : (
                columna.colaboraciones.map((colaboracion) => {
                  const fechaInfo = formatearFecha(colaboracion.fechaEntrega);
                  return (
                    <Card
                      key={colaboracion.id}
                      className="cursor-move hover:shadow-md transition-all duration-200"
                      draggable
                      onDragStart={(e) => handleDragStart(e, colaboracion.id, columna.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={colaboracion.avatarEmpresa} />
                              <AvatarFallback>{colaboracion.empresa.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{colaboracion.empresa}</p>
                              <p className="text-xs text-gray-500">{colaboracion.titulo}</p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuItem>Marcar como completada</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Cancelar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Valor</span>
                            <span className="font-semibold text-gray-900">{formatearMoneda(colaboracion.valor)}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <Badge className={obtenerColorPrioridad(colaboracion.prioridad)}>
                              {obtenerTextoPrioridad(colaboracion.prioridad)}
                            </Badge>
                            <span className={`text-xs flex items-center gap-1 ${fechaInfo.urgente ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                              <Calendar className="w-3 h-3" />
                              {fechaInfo.texto}
                            </span>
                          </div>

                          {colaboracion.entregables.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FileText className="w-3 h-3" />
                              {colaboracion.entregables.length} entregables
                            </div>
                          )}

                          {colaboracion.mensajesSinLeer && colaboracion.mensajesSinLeer > 0 && (
                            <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                              <MessageCircle className="w-3 h-3" />
                              {colaboracion.mensajesSinLeer} mensajes sin leer
                            </div>
                          )}

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Progreso</span>
                              <span className="font-medium">{colaboracion.progreso}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-black rounded-full h-2 transition-all duration-300"
                                style={{ width: `${colaboracion.progreso}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" className="flex-1">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Chat
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <FileText className="w-3 h-3 mr-1" />
                            Detalles
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};