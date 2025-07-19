
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, MoreVertical, Edit, Trash, Eye, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { serverURL } from '@/constants';
import axios from 'axios';
import CourseUploader from '@/components/CourseUploader';

const AdminCourses = () => {

  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);

  // Filtered data using memoization for better performance
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return data.filter((course) => {
      const nameMatch = course.mainTopic?.toLowerCase().includes(query);
      const userMatch = course.user?.toLowerCase().includes(query);
      const categoryMatch = course.category?.toLowerCase().includes(query);
      const instructorMatch = course.instructor?.toLowerCase().includes(query);
      return nameMatch || userMatch || categoryMatch || instructorMatch;
    });
  }, [data, searchQuery]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const postURL = serverURL + `/api/getcourses`;
      const response = await axios.get(postURL);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setShowUploader(false);
    fetchCourses(); // Recargar los cursos después de subir uno nuevo
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground mt-1">Manage your course catalog</p>
        </div>
        <Button onClick={() => setShowUploader(true)} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Subir Curso JSON
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>All Courses</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search courses..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ?
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                </TableRow>
              </TableBody>
              :
              <TableBody>
                {filteredData.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{course.mainTopic}</span>
                        {course.isJsonCourse && course.instructor && (
                          <span className="text-xs text-muted-foreground">
                            Por: {course.instructor}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        course.type === 'json_course' ? 'default' : 
                        course.type !== 'text & image course' ? 'secondary' : 'outline'
                      }>
                        {course.type === 'json_course' ? 'JSON Course' : 
                         course.type !== 'text & image course' ? 'Video' : 'Image'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {course.category ? (
                        <Badge variant="outline">{course.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={course.completed === true ? 'default' : 'secondary'}>
                        {course.completed === true ? 'Completed' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>{course.user}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {course.date ? new Date(course.date).toLocaleDateString('es-ES') : '-'}
                    </TableCell>
                  </TableRow>
                ))}

                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Search className="h-8 w-8 mb-2" />
                        <p>No courses match your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            }
          </Table>
        </CardContent>
      </Card>

      {/* Modal para subir curso JSON */}
      <Dialog open={showUploader} onOpenChange={setShowUploader}>
        <DialogContent className="max-w-none w-[95vw] max-h-[90vh] overflow-y-auto">
          <CourseUploader 
            onUploadSuccess={handleUploadSuccess}
            onClose={() => setShowUploader(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourses;
