import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  submitContentForReview,
  getSubmissionsForCollaboration,
  getSubmissionsForReservation,
  type ContentSubmission,
} from '@/services/submissions';

interface ContentSubmissionProps {
  collaborationId?: string;
  reservationId?: string;
  businessId: string;
  title: string;
}

export function ContentSubmission({
  collaborationId,
  reservationId,
  businessId,
  title,
}: ContentSubmissionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryKey = collaborationId
    ? ['submissions', 'collaboration', collaborationId]
    : ['submissions', 'reservation', reservationId];

  const { data: submissions = [], isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      collaborationId
        ? getSubmissionsForCollaboration(collaborationId)
        : getSubmissionsForReservation(reservationId!),
    enabled: !!(collaborationId || reservationId),
  });

  const submitMutation = useMutation({
    mutationFn: submitContentForReview,
    onSuccess: () => {
      toast.success('Content submitted for review!');
      setSubmissionUrl('');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: () => {
      toast.error('Failed to submit content. Please try again.');
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionUrl.trim() || !user?.id) return;

    setIsSubmitting(true);
    submitMutation.mutate({
      collaboration_id: collaborationId,
      reservation_id: reservationId,
      creator_id: user.id,
      business_id: businessId,
      submission_url: submissionUrl.trim(),
    });
  };

  const getStatusIcon = (status: ContentSubmission['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending_review':
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: ContentSubmission['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Submission</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Submission - {title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Submit new content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="submission-url" className="block text-sm font-medium mb-2">
              Social Media Post URL
            </label>
            <Input
              id="submission-url"
              type="url"
              placeholder="https://instagram.com/p/... or https://tiktok.com/@..."
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-600 mt-1">
              Paste the URL of your social media post showcasing this collaboration or experience.
            </p>
          </div>
          <Button
            type="submit"
            disabled={!submissionUrl.trim() || isSubmitting}
            className="w-full sm:w-auto"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Content'}
          </Button>
        </form>

        {/* Submission history */}
        {submissions.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Submission History</h4>
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(submission.status)}
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {submission.submission_url}
                    </p>
                    <p className="text-xs text-gray-500">
                      Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                      {submission.reviewed_at && (
                        <span>
                          {' '}• Reviewed {new Date(submission.reviewed_at).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                    {submission.status === 'rejected' && submission.rejection_reason && (
                      <p className="text-sm text-red-600 mt-1">
                        Reason: {submission.rejection_reason}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(submission.submission_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}