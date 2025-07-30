import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Search, Filter, Plus, Calendar, DollarSign, Users, TrendingUp, 
  MessageCircle, Star, Eye, Clock, CheckCircle, XCircle, AlertCircle, 
  MoreHorizontal, Edit, Trash2, ExternalLink, Loader2 
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";

const statusConfig = {
  proposed: { label: "Propuesta", color: "bg-gray-100 text-gray-900", icon: Clock },
  accepted: { label: "Aceptada", color: "bg-gray-100 text-gray-900", icon: CheckCircle },
  in_progress: { label: "En Progreso", color: "bg-gray-100 text-gray-900", icon: TrendingUp },
  completed: { label: "Completada", color: "bg-gray-100 text-gray-900", icon: CheckCircle },
  cancelled: { label: "Cancelada", color: "bg-gray-100 text-gray-900", icon: XCircle }
};

const CampaignManagement = () => {
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsOverview, setStatsOverview] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    totalSpent: 0,
    avgRating: 0,
    totalReach: 0
  });

  // Filter campaigns based on search and status
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.creator_profile?.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || campaign.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-20 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400"/>
            <p className="text-gray-600">Cargando campañas...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-20 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-700 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="rounded">
              Reintentar
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h1 className="text-4xl font-light text-black mb-4">
                Gestión de <span className="font-semibold">Campañas</span>
              </h1>
              <p className="text-xl text-gray-600">
                Administra y monitorea todas tus colaboraciones en un solo lugar
              </p>
            </div>
            <Link to="/marketplace">
              <Button className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded font-medium mt-4 md:mt-0">
                <Plus className="w-5 h-5 mr-2"/>
                Nueva Campaña
              </Button>
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            <Card className="bg-white border border-gray-100 rounded p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-gray-700"/>
                </div>
                <div>
                  <div className="text-2xl font-light text-black">{statsOverview.totalCampaigns}</div>
                  <div className="text-gray-500 text-sm">Campañas Totales</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white border border-gray-100 rounded p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-gray-700"/>
                </div>
                <div>
                  <div className="text-2xl font-light text-black">{statsOverview.activeCampaigns}</div>
                  <div className="text-gray-500 text-sm">Activas</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white border border-gray-100 rounded p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-gray-700"/>
                </div>
                <div>
                  <div className="text-2xl font-light text-black">${statsOverview.totalSpent.toLocaleString()}</div>
                  <div className="text-gray-500 text-sm">Invertido</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white border border-gray-100 rounded p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center">
                  <Eye className="w-6 h-6 text-gray-700"/>
                </div>
                <div>
                  <div className="text-2xl font-light text-black">{(statsOverview.totalReach / 1000).toFixed(0)}K</div>
                  <div className="text-gray-500 text-sm">Alcance Total</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white border border-gray-100 rounded p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center">
                  <Star className="w-6 h-6 text-gray-700"/>
                </div>
                <div>
                  <div className="text-2xl font-light text-black">{statsOverview.avgRating.toFixed(1)}</div>
                  <div className="text-gray-500 text-sm">Rating Prom.</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"/>
                <Input
                  placeholder="Buscar campañas o creadores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 rounded border-gray-200"
                />
              </div>
            </div>
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
              <TabsList className="bg-gray-100 rounded p-1">
                <TabsTrigger value="all" className="rounded data-[state=active]:bg-black data-[state=active]:text-white">
                  Todas
                </TabsTrigger>
                <TabsTrigger value="proposed" className="rounded data-[state=active]:bg-black data-[state=active]:text-white">
                  Propuestas
                </TabsTrigger>
                <TabsTrigger value="accepted" className="rounded data-[state=active]:bg-black data-[state=active]:text-white">
                  Aceptadas
                </TabsTrigger>
                <TabsTrigger value="in_progress" className="rounded data-[state=active]:bg-black data-[state=active]:text-white">
                  En Progreso
                </TabsTrigger>
                <TabsTrigger value="completed" className="rounded data-[state=active]:bg-black data-[state=active]:text-white">
                  Completadas
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Empty State */}
          {filteredCampaigns.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-gray-400"/>
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">No se encontraron campañas</h3>
              <p className="text-gray-600 mb-6">Ajusta los filtros o crea tu primera campaña</p>
              <Link to="/marketplace">
                <Button className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded">
                  <Plus className="w-5 h-5 mr-2"/>
                  Crear Primera Campaña
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CampaignManagement;