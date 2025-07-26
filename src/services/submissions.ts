import { supabase } from '@/integrations/supabase/client';
import { notificationService } from './notifications';

export interface ContentSubmission {
  id: string;
  collaboration_id?: string;
  reservation_id?: string;
  creator_id: string;
  business_id: string;
  submission_url: string;
  status: 'pending_review' | 'approved' | 'rejected';
  rejection_reason?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface CreateSubmissionData {
  collaboration_id?: string;
  reservation_id?: string;
  creator_id: string;
  business_id: string;
  submission_url: string;
}

export interface ReviewSubmissionData {
  status: 'approved' | 'rejected';
  rejection_reason?: string;
}

/**
 * Submit content for review
 */
export const submitContentForReview = async (submissionData: CreateSubmissionData): Promise<ContentSubmission> => {
  const { data, error } = await supabase
    .from('content_submissions')
    .insert([submissionData])
    .select(`
      *,
      creator:users!content_submissions_creator_id_fkey(
        creator_profiles(username)
      )
    `)
    .single();

  if (error) {
    console.error('Error submitting content:', error);
    throw new Error('Failed to submit content for review');
  }

  // Send notification to business
  try {
    const creatorName = data.creator?.creator_profiles?.username || 'Creator';
    const contentType = submissionData.collaboration_id ? 'collaboration' : 'experience';
    
    await notificationService.notifyContentSubmitted(
      submissionData.business_id,
      creatorName,
      data.id,
      contentType
    );
  } catch (notificationError) {
    console.error('Error sending notification:', notificationError);
    // Don't throw here as the submission was successful
  }

  return data;
};

/**
 * Get all submissions for a business
 */
export const getSubmissionsForBusiness = async (businessId: string): Promise<ContentSubmission[]> => {
  const { data, error } = await supabase
    .from('content_submissions')
    .select(`
      *,
      creator:users!content_submissions_creator_id_fkey(
        id,
        email,
        creator_profiles(username, instagram_handle)
      ),
      collaboration:collaborations(title, campaign_title),
      reservation:reservations(
        scheduled_date,
        offer:offers(title)
      )
    `)
    .eq('business_id', businessId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching business submissions:', error);
    throw new Error('Failed to fetch submissions');
  }

  return data || [];
};

/**
 * Get all submissions for a creator
 */
export const getSubmissionsForCreator = async (creatorId: string): Promise<ContentSubmission[]> => {
  const { data, error } = await supabase
    .from('content_submissions')
    .select(`
      *,
      business:users!content_submissions_business_id_fkey(
        id,
        email,
        business_profiles(company_name)
      ),
      collaboration:collaborations(title, campaign_title),
      reservation:reservations(
        scheduled_date,
        offer:offers(title),
        venue:venues(name)
      )
    `)
    .eq('creator_id', creatorId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching creator submissions:', error);
    throw new Error('Failed to fetch submissions');
  }

  return data || [];
};

/**
 * Review a content submission
 */
export const reviewSubmission = async (
  submissionId: string,
  reviewData: ReviewSubmissionData
): Promise<ContentSubmission> => {
  const { data, error } = await supabase
    .from('content_submissions')
    .update(reviewData)
    .eq('id', submissionId)
    .select(`
      *,
      creator:users!content_submissions_creator_id_fkey(id)
    `)
    .single();

  if (error) {
    console.error('Error reviewing submission:', error);
    throw new Error('Failed to review submission');
  }

  // Send notification to creator
  try {
    const contentType = data.collaboration_id ? 'collaboration' : 'experience';
    const isApproved = reviewData.status === 'approved';
    
    await notificationService.notifyContentReviewed(
      data.creator_id,
      isApproved,
      data.id,
      contentType,
      reviewData.rejection_reason
    );
  } catch (notificationError) {
    console.error('Error sending notification:', notificationError);
    // Don't throw here as the review was successful
  }

  return data;
};

/**
 * Get submissions for a specific collaboration
 */
export const getSubmissionsForCollaboration = async (collaborationId: string): Promise<ContentSubmission[]> => {
  const { data, error } = await supabase
    .from('content_submissions')
    .select('*')
    .eq('collaboration_id', collaborationId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching collaboration submissions:', error);
    throw new Error('Failed to fetch collaboration submissions');
  }

  return data || [];
};

/**
 * Get submissions for a specific reservation
 */
export const getSubmissionsForReservation = async (reservationId: string): Promise<ContentSubmission[]> => {
  const { data, error } = await supabase
    .from('content_submissions')
    .select('*')
    .eq('reservation_id', reservationId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching reservation submissions:', error);
    throw new Error('Failed to fetch reservation submissions');
  }

  return data || [];
};