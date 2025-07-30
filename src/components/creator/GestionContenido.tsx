import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Eye, Upload, Grid, List, Filter, Plus, Image as ImageIcon, Video, FileText, Instagram, Youtube } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContenidoItem {
  id: string;
  titulo: string;
  tipo: 'imagen' | 'video' | 'carrusel' | 'texto';
  plataforma: 'instagram' | 'tiktok' | 'youtube' | 'todas';
  estado: 'borrador' | 'programado' | 'publicado';
  fechaPublicacion?: string;
  miniatura?: string;
  vistas?: number;
  engagement?: number;
}

interface GestionContenidoProps {
  contenidos: ContenidoItem[];
}

export const GestionContenido: React.FC<GestionContenidoProps> = ({ contenidos }) => {
  const [vista, setVista] = useState<'grid' | 'list'>('grid');
  const [filtroPlataforma, setFiltroPlataforma] = useState<string>('todas');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');

  const formatearFecha = (fecha: string) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(fecha));
  };

  const obtenerIconoTipo = (tipo: string) => {
    const iconos = {
      imagen: <ImageIcon className="w-4 h-4" />,
      video: <Video className="w-4 h-4" />,
      carrusel: <Grid className="w-4 h-4" />,
      texto: <FileText className="w-4 h-4" />
    };
    return iconos[tipo as keyof typeof iconos] || <FileText className="w-4 h-4" />;
  };

  const obtenerIconoPlataforma = (plataforma: string) => {
    const iconos = {
      instagram: <Instagram className="w-4 h-4" />,
      youtube: <Youtube className="w-4 h-4" />,
      tiktok: <Video className="w-4 h-4" />,
      todas: <Grid className="w-4 h-4" />
    };
    return iconos[plataforma as keyof typeof iconos] || <Grid className="w-4 h-4" />;
  };

  const obtenerColorEstado = (estado: string) => {
    const colores = {
      borrador: 'bg-gray-100 text-gray-800',
      programado: 'bg-blue-100 text-blue-800',
      publicado: 'bg-green-100 text-green-800'
    };
    return colores[estado as keyof typeof colores] || 'bg-gray-100 text-gray-800';
  };

  const obtenerTextoEstado = (estado: string) => {
    const textos = {
      borrador: 'Borrador',
      programado: 'Programado',
      publicado: 'Publicado'
    };
    return textos[estado as keyof typeof textos] || estado;
  };

  const contenidosFiltrados = contenidos.filter(item => {
    const cumplePlataforma = filtroPlataforma === 'todas' || item.plataforma === filtroPlataforma;
    const cumpleEstado = filtroEstado === 'todos' || item.estado === filtroEstado;
    const cumpleBusqueda = item.titulo.toLowerCase().includes(busqueda.toLowerCase());
    return cumplePlataforma && cumpleEstado && cumpleBusqueda;
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="biblioteca" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
          <TabsTrigger value="biblioteca" className="text-xs sm:text-sm">Biblioteca</TabsTrigger>
          <TabsTrigger value="calendario" className="text-xs sm:text-sm">Calendario</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs sm:text-sm">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="biblioteca" className="space-y-6">
          {/* Barra de herramientas */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Buscar contenido..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Select value={filtroPlataforma} onValueChange={setFiltroPlataforma}>
                  <SelectTrigger className="w-[120px] sm:w-[140px]">
                    <SelectValue placeholder="Plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="w-[120px] sm:w-[140px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="borrador">Borradores</SelectItem>
                    <SelectItem value="programado">Programados</SelectItem>
                    <SelectItem value="publicado">Publicados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setVista('grid')}
                  className={vista === 'grid' ? 'bg-gray-100' : ''}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setVista('list')}
                  className={vista === 'list' ? 'bg-gray-100' : ''}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Button className="bg-black hover:bg-gray-800 text-white rounded-full text-sm">
                <Upload className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Subir Contenido</span>
                <span className="sm:hidden">Subir</span>
              </Button>
            </div>
          </div>

          {/* Vista de contenidos */}
          {vista === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {contenidosFiltrados.map((item) => (
                <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {item.miniatura ? (
                      <img 
                        src={item.miniatura} 
                        alt={item.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {obtenerIconoTipo(item.tipo)}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Badge className={obtenerColorEstado(item.estado)}>
                        {obtenerTextoEstado(item.estado)}
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-4 text-white text-sm">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {item.vistas || 0}
                        </span>
                        <span>{item.engagement || 0}% engagement</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-900 truncate mb-2">{item.titulo}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {obtenerIconoPlataforma(item.plataforma)}
                      <span className="capitalize">{item.plataforma}</span>
                      {item.fechaPublicacion && (
                        <>
                          <span>•</span>
                          <span>{formatearFecha(item.fechaPublicacion)}</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {contenidosFiltrados.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.miniatura ? (
                          <img 
                            src={item.miniatura} 
                            alt={item.titulo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {obtenerIconoTipo(item.tipo)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{item.titulo}</h3>
                          <Badge className={obtenerColorEstado(item.estado)}>
                            {obtenerTextoEstado(item.estado)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            {obtenerIconoPlataforma(item.plataforma)}
                            <span className="capitalize">{item.plataforma}</span>
                          </span>
                          {item.fechaPublicacion && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatearFecha(item.fechaPublicacion)}
                            </span>
                          )}
                          {item.vistas !== undefined && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {item.vistas} vistas
                            </span>
                          )}
                          {item.engagement !== undefined && (
                            <span>{item.engagement}% engagement</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          Estadísticas
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendario" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Publicaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Calendario de contenido próximamente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { nombre: 'Post de Instagram', tipo: 'imagen', plataforma: 'instagram' },
              { nombre: 'Reel de Instagram', tipo: 'video', plataforma: 'instagram' },
              { nombre: 'Video de TikTok', tipo: 'video', plataforma: 'tiktok' },
              { nombre: 'Short de YouTube', tipo: 'video', plataforma: 'youtube' },
              { nombre: 'Carrusel de Instagram', tipo: 'carrusel', plataforma: 'instagram' },
              { nombre: 'Story de Instagram', tipo: 'imagen', plataforma: 'instagram' }
            ].map((template, index) => (
              <Card key={index} className="hover:shadow-md transition-all duration-300 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {obtenerIconoTipo(template.tipo)}
                    </div>
                    {obtenerIconoPlataforma(template.plataforma)}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">{template.nombre}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Template optimizado para {template.plataforma}
                  </p>
                  <Button className="w-full" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Usar Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};