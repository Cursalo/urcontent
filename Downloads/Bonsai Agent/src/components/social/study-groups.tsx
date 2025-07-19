'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Target, 
  MessageCircle,
  Video,
  BookOpen,
  Star,
  Crown,
  UserPlus,
  Settings,
  MoreVertical,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StudyGroup {
  id: string
  name: string
  description: string
  category: 'math' | 'reading' | 'writing' | 'general'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  members: StudyGroupMember[]
  maxMembers: number
  isPrivate: boolean
  meetingSchedule?: {
    day: string
    time: string
    timezone: string
    duration: number
  }
  goals: string[]
  tags: string[]
  createdAt: Date
  lastActivity: Date
  averageScore?: number
  totalStudyHours?: number
  upcomingSession?: {
    date: Date
    topic: string
    type: 'video' | 'chat' | 'practice'
  }
}

export interface StudyGroupMember {
  id: string
  name: string
  avatar?: string
  role: 'owner' | 'moderator' | 'member'
  joinedAt: Date
  level: number
  currentScore?: number
  contributionScore: number
  isOnline: boolean
  lastSeen: Date
}

interface StudyGroupsProps {
  currentUserId: string
  userGroups: StudyGroup[]
  recommendedGroups: StudyGroup[]
  onJoinGroup: (groupId: string) => void
  onLeaveGroup: (groupId: string) => void
  onCreateGroup: (group: Partial<StudyGroup>) => void
}

const categoryColors = {
  math: 'bg-blue-100 text-blue-800',
  reading: 'bg-green-100 text-green-800',
  writing: 'bg-purple-100 text-purple-800',
  general: 'bg-gray-100 text-gray-800'
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
}

export function StudyGroups({
  currentUserId,
  userGroups,
  recommendedGroups,
  onJoinGroup,
  onLeaveGroup,
  onCreateGroup
}: StudyGroupsProps) {
  const [view, setView] = useState<'my-groups' | 'discover' | 'create'>('my-groups')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const filteredGroups = recommendedGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || group.category === filterCategory
    const matchesDifficulty = filterDifficulty === 'all' || group.difficulty === filterDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Study Groups</h1>
          <p className="text-muted-foreground">
            Join collaborative study sessions and learn with peers
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={view === 'my-groups' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('my-groups')}
        >
          <Users className="w-4 h-4 mr-2" />
          My Groups ({userGroups.length})
        </Button>
        <Button
          variant={view === 'discover' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('discover')}
        >
          <Search className="w-4 h-4 mr-2" />
          Discover
        </Button>
      </div>

      {/* My Groups View */}
      {view === 'my-groups' && (
        <div className="space-y-4">
          {userGroups.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Study Groups Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Join your first study group to start collaborating with peers
                </p>
                <Button onClick={() => setView('discover')}>
                  <Search className="w-4 h-4 mr-2" />
                  Discover Groups
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {userGroups.map(group => (
                <StudyGroupCard
                  key={group.id}
                  group={group}
                  currentUserId={currentUserId}
                  isMember={true}
                  onAction={(action) => {
                    if (action === 'leave') onLeaveGroup(group.id)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Discover Groups View */}
      {view === 'discover' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="math">Math</option>
                <option value="reading">Reading</option>
                <option value="writing">Writing</option>
                <option value="general">General</option>
              </select>
              
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredGroups.map(group => (
              <StudyGroupCard
                key={group.id}
                group={group}
                currentUserId={currentUserId}
                isMember={false}
                onAction={(action) => {
                  if (action === 'join') onJoinGroup(group.id)
                }}
              />
            ))}
          </div>
          
          {filteredGroups.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Groups Found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('')
                  setFilterCategory('all')
                  setFilterDifficulty('all')
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateForm && (
        <CreateGroupForm
          onSubmit={(group) => {
            onCreateGroup(group)
            setShowCreateForm(false)
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  )
}

function StudyGroupCard({
  group,
  currentUserId,
  isMember,
  onAction
}: {
  group: StudyGroup
  currentUserId: string
  isMember: boolean
  onAction: (action: 'join' | 'leave' | 'view') => void
}) {
  const memberCount = group.members.length
  const isOwner = group.members.find(m => m.id === currentUserId)?.role === 'owner'
  const canJoin = !isMember && memberCount < group.maxMembers
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">{group.name}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className={categoryColors[group.category]}>
                {group.category}
              </Badge>
              <Badge variant="outline" className={difficultyColors[group.difficulty]}>
                {group.difficulty}
              </Badge>
              {group.isPrivate && (
                <Badge variant="outline">Private</Badge>
              )}
            </div>
          </div>
          
          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {memberCount}/{group.maxMembers}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {group.description}
        </p>
        
        {/* Member Avatars */}
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {group.members.slice(0, 4).map((member) => (
              <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="text-xs">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {memberCount > 4 && (
              <div className="w-8 h-8 border-2 border-background bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                +{memberCount - 4}
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </div>
        </div>
        
        {/* Stats */}
        {group.averageScore && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Average Score:</span>
            <span className="font-medium">{group.averageScore}</span>
          </div>
        )}
        
        {/* Upcoming Session */}
        {group.upcomingSession && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Next Session</div>
                <div className="text-xs text-muted-foreground">
                  {group.upcomingSession.topic}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {group.upcomingSession.date.toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {group.upcomingSession.date.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex space-x-2">
          {isMember ? (
            <>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => onAction('view')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Open Group
              </Button>
              {!isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAction('leave')}
                >
                  Leave
                </Button>
              )}
            </>
          ) : (
            <Button
              variant={canJoin ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => onAction(canJoin ? 'join' : 'view')}
              disabled={!canJoin && memberCount >= group.maxMembers}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {canJoin ? 'Join Group' : memberCount >= group.maxMembers ? 'Full' : 'View'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CreateGroupForm({
  onSubmit,
  onCancel
}: {
  onSubmit: (group: Partial<StudyGroup>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general' as const,
    difficulty: 'intermediate' as const,
    maxMembers: 10,
    isPrivate: false,
    goals: [] as string[],
    tags: [] as string[]
  })
  
  const [goalInput, setGoalInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      id: Date.now().toString(),
      members: [],
      createdAt: new Date(),
      lastActivity: new Date()
    })
  }
  
  const addGoal = () => {
    if (goalInput.trim() && !formData.goals.includes(goalInput.trim())) {
      setFormData(prev => ({
        ...prev,
        goals: [...prev.goals, goalInput.trim()]
      }))
      setGoalInput('')
    }
  }
  
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Create Study Group</CardTitle>
          <CardDescription>
            Start a new study group and invite others to join your learning journey
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Math Mastery Group"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  required
                >
                  <option value="general">General</option>
                  <option value="math">Math</option>
                  <option value="reading">Reading</option>
                  <option value="writing">Writing</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your study group's purpose and goals..."
                rows={3}
                required
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxMembers">Max Members</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min="2"
                  max="50"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Create Group
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}