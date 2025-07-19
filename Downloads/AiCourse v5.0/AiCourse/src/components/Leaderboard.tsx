import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Crown, Zap, BookOpen, Target, Flame, User } from 'lucide-react';
import axios from 'axios';
import { serverURL } from '@/constants';

interface LeaderboardUser {
  _id: string;
  mName: string;
  email: string;
  xp: number;
  level: number;
  totalCoursesCompleted: number;
  totalLessonsCompleted: number;
  streak: number;
  avatar?: string;
}

interface LeaderboardProps {
  className?: string;
  currentUserId?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ className = "", currentUserId }) => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'xp' | 'courses' | 'streak'>('xp');

  const fetchLeaderboard = async (type: 'xp' | 'courses' | 'streak') => {
    try {
      setLoading(true);
      const response = await axios.get(`${serverURL}/api/leaderboard?type=${type}`);
      if (response.data.success) {
        setUsers(response.data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(selectedType);
  }, [selectedType]);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-muted-foreground font-bold">#{position}</span>;
    }
  };

  const getRankBadge = (position: number) => {
    if (position <= 3) {
      const colors = {
        1: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
        2: 'bg-gradient-to-r from-gray-300 to-gray-500',
        3: 'bg-gradient-to-r from-amber-400 to-amber-600'
      };
      return colors[position as keyof typeof colors];
    }
    return 'bg-muted';
  };

  const getDisplayValue = (user: LeaderboardUser) => {
    switch (selectedType) {
      case 'xp': return `${user.xp.toLocaleString()} XP`;
      case 'courses': return `${user.totalCoursesCompleted} cursos`;
      case 'streak': return `${user.streak} días`;
      default: return '';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'xp': return <Zap className="h-4 w-4" />;
      case 'courses': return <BookOpen className="h-4 w-4" />;
      case 'streak': return <Flame className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(10)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const topThree = users.slice(0, 3);
  const restOfUsers = users.slice(3);
  const currentUserRank = users.findIndex(u => u._id === currentUserId) + 1;

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Clasificación
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="xp" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Experiencia
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Cursos
              </TabsTrigger>
              <TabsTrigger value="streak" className="flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Rachas
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedType} className="mt-6">
              {/* Top 3 Podio */}
              {topThree.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-center">🏆 Top 3</h3>
                  <div className="flex justify-center items-end space-x-4">
                    {/* Segundo lugar */}
                    {topThree[1] && (
                      <div className="text-center">
                        <div className="relative mb-2">
                          <Avatar className="h-16 w-16 mx-auto border-4 border-gray-300">
                            <AvatarImage src={topThree[1].avatar} />
                            <AvatarFallback>
                              {topThree[1].mName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-2 -right-2 bg-gray-300 rounded-full p-1">
                            <Medal className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3 h-20 flex flex-col justify-center">
                          <p className="font-semibold text-sm">{topThree[1].mName}</p>
                          <p className="text-xs text-muted-foreground">
                            {getDisplayValue(topThree[1])}
                          </p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Nivel {topThree[1].level}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Primer lugar */}
                    <div className="text-center">
                      <div className="relative mb-2">
                        <Avatar className="h-20 w-20 mx-auto border-4 border-yellow-400">
                          <AvatarImage src={topThree[0].avatar} />
                          <AvatarFallback>
                            {topThree[0].mName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-3 -right-1 bg-yellow-400 rounded-full p-2">
                          <Crown className="h-5 w-5 text-yellow-800" />
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg p-4 h-24 flex flex-col justify-center">
                        <p className="font-bold">{topThree[0].mName}</p>
                        <p className="text-sm text-yellow-800">
                          {getDisplayValue(topThree[0])}
                        </p>
                        <Badge className="bg-yellow-500 text-yellow-900 text-xs mt-1">
                          Nivel {topThree[0].level}
                        </Badge>
                      </div>
                    </div>

                    {/* Tercer lugar */}
                    {topThree[2] && (
                      <div className="text-center">
                        <div className="relative mb-2">
                          <Avatar className="h-16 w-16 mx-auto border-4 border-amber-400">
                            <AvatarImage src={topThree[2].avatar} />
                            <AvatarFallback>
                              {topThree[2].mName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-2 -right-2 bg-amber-400 rounded-full p-1">
                            <Award className="h-4 w-4 text-amber-800" />
                          </div>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 h-20 flex flex-col justify-center">
                          <p className="font-semibold text-sm">{topThree[2].mName}</p>
                          <p className="text-xs text-muted-foreground">
                            {getDisplayValue(topThree[2])}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            Nivel {topThree[2].level}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Lista del resto de usuarios */}
              <div className="space-y-2">
                {restOfUsers.map((user, index) => {
                  const position = index + 4;
                  const isCurrentUser = user._id === currentUserId;
                  
                  return (
                    <div 
                      key={user._id}
                      className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                        isCurrentUser 
                          ? 'bg-primary/10 border-2 border-primary/20' 
                          : 'bg-muted/30 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(position)}
                      </div>
                      
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.mName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <p className={`font-medium ${isCurrentUser ? 'text-primary' : ''}`}>
                          {user.mName}
                          {isCurrentUser && <span className="text-xs ml-2">(Tú)</span>}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Nivel {user.level}</span>
                          <span>•</span>
                          <span>{user.totalLessonsCompleted} lecciones</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">{getDisplayValue(user)}</div>
                        {user.streak > 0 && selectedType !== 'streak' && (
                          <div className="flex items-center gap-1 text-xs text-orange-600">
                            <Flame className="h-3 w-3" />
                            {user.streak}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Posición del usuario actual si no está en el top */}
              {currentUserId && currentUserRank > 10 && (
                <div className="mt-6 p-4 bg-primary/5 rounded-lg border">
                  <p className="text-center text-sm text-muted-foreground mb-2">
                    Tu posición actual
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <span className="font-bold">#{currentUserRank}</span>
                    <span>•</span>
                    <span>{getDisplayValue(users.find(u => u._id === currentUserId)!)}</span>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard; 