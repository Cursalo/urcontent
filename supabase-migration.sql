-- URContent Database Migration Script
-- Run this in your Supabase SQL Editor to set up the complete database schema

-- First, create the necessary enums
CREATE TYPE user_role AS ENUM ('creator', 'business', 'admin');
CREATE TYPE venue_category AS ENUM ('beauty', 'wellness', 'fitness', 'restaurant', 'spa', 'salon');
CREATE TYPE membership_tier AS ENUM ('basic', 'premium', 'vip');
CREATE TYPE collaboration_status AS ENUM ('proposed', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extending Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role user_role DEFAULT 'creator',
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  timezone TEXT DEFAULT 'America/Argentina/Buenos_Aires',
  language TEXT DEFAULT 'es',
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status verification_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_profiles table
CREATE TABLE public.business_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT,
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  company_size TEXT,
  cuit TEXT,
  address TEXT,
  city TEXT DEFAULT 'Buenos Aires',
  phone TEXT,
  email TEXT,
  instagram_handle TEXT,
  contact_person TEXT,
  marketing_budget_range TEXT,
  preferred_creator_types TEXT[],
  brand_values TEXT[],
  target_audience JSONB,
  collaboration_history INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  is_verified_business BOOLEAN DEFAULT FALSE,
  venue_type venue_category,
  is_beauty_pass_partner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create creator_profiles table
CREATE TABLE public.creator_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  bio TEXT,
  instagram_handle TEXT,
  instagram_followers INTEGER DEFAULT 0,
  instagram_verified BOOLEAN DEFAULT FALSE,
  tiktok_handle TEXT,
  tiktok_followers INTEGER DEFAULT 0,
  youtube_handle TEXT,
  youtube_subscribers INTEGER DEFAULT 0,
  specialties TEXT[],
  content_categories TEXT[],
  location_preferences TEXT[],
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_collaborations INTEGER DEFAULT 0,
  ur_score INTEGER DEFAULT 0,
  portfolio_urls TEXT[],
  rate_per_post DECIMAL(10,2),
  rate_per_story DECIMAL(10,2),
  rate_per_reel DECIMAL(10,2),
  is_available BOOLEAN DEFAULT TRUE,
  public_slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create venues table
CREATE TABLE public.venues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT DEFAULT 'Buenos Aires',
  category venue_category NOT NULL,
  image_urls TEXT[],
  amenities TEXT[],
  opening_hours JSONB,
  contact_info JSONB,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create offers table
CREATE TABLE public.offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_urls TEXT[],
  credit_cost INTEGER NOT NULL,
  cash_price DECIMAL(10,2),
  duration_minutes INTEGER,
  max_capacity INTEGER DEFAULT 1,
  available_slots INTEGER,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  terms_conditions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create memberships table
CREATE TABLE public.memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tier membership_tier NOT NULL,
  credits_balance INTEGER DEFAULT 0,
  monthly_credits INTEGER DEFAULT 0,
  price_paid DECIMAL(10,2),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
  reservation_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status reservation_status DEFAULT 'pending',
  credits_used INTEGER,
  cash_paid DECIMAL(10,2),
  qr_code TEXT UNIQUE,
  special_requests TEXT,
  checkin_time TIMESTAMP WITH TIME ZONE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collaborations table
CREATE TABLE public.collaborations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.creator_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(10,2),
  platform_fee DECIMAL(10,2),
  deliverables TEXT[],
  timeline TEXT,
  status collaboration_status DEFAULT 'proposed',
  deadline TIMESTAMP WITH TIME ZONE,
  payment_terms TEXT,
  content_guidelines TEXT,
  brand_guidelines_url TEXT,
  proposal_message TEXT,
  response_message TEXT,
  final_rating INTEGER CHECK (final_rating >= 1 AND final_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit_transactions table
CREATE TABLE public.credit_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- Positive for credit, negative for debit
  transaction_type TEXT NOT NULL, -- 'purchase', 'refund', 'booking', 'checkin'
  description TEXT,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_submissions table
CREATE TABLE public.content_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES public.creator_profiles(id) ON DELETE CASCADE NOT NULL,
  collaboration_id UUID REFERENCES public.collaborations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_urls TEXT[] NOT NULL,
  submission_type TEXT NOT NULL, -- 'post', 'story', 'reel', 'video'
  platform TEXT NOT NULL, -- 'instagram', 'tiktok', 'youtube'
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  feedback TEXT,
  metrics JSONB, -- likes, views, engagement, etc.
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table for real-time messaging
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'image', 'file'
  attachment_urls TEXT[],
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_business_profiles_user_id ON public.business_profiles(user_id);
CREATE INDEX idx_creator_profiles_user_id ON public.creator_profiles(user_id);
CREATE INDEX idx_creator_profiles_public_slug ON public.creator_profiles(public_slug);
CREATE INDEX idx_venues_business_id ON public.venues(business_id);
CREATE INDEX idx_offers_venue_id ON public.offers(venue_id);
CREATE INDEX idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX idx_reservations_offer_id ON public.reservations(offer_id);
CREATE INDEX idx_collaborations_business_id ON public.collaborations(business_id);
CREATE INDEX idx_collaborations_creator_id ON public.collaborations(creator_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (true);

-- Business profiles policies
CREATE POLICY "Business profiles are viewable by everyone" ON public.business_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage their own business profile" ON public.business_profiles FOR ALL USING (auth.uid() = user_id);

-- Creator profiles policies
CREATE POLICY "Creator profiles are viewable by everyone" ON public.creator_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage their own creator profile" ON public.creator_profiles FOR ALL USING (auth.uid() = user_id);

-- Venues policies
CREATE POLICY "Venues are viewable by everyone" ON public.venues FOR SELECT USING (true);
CREATE POLICY "Business owners can manage their venues" ON public.venues FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.business_profiles 
    WHERE id = business_id AND user_id = auth.uid()
  )
);

-- Offers policies
CREATE POLICY "Offers are viewable by everyone" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Venue owners can manage their offers" ON public.offers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.venues v
    JOIN public.business_profiles bp ON v.business_id = bp.id
    WHERE v.id = venue_id AND bp.user_id = auth.uid()
  )
);

-- Memberships policies
CREATE POLICY "Users can view their own memberships" ON public.memberships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own memberships" ON public.memberships FOR ALL USING (auth.uid() = user_id);

-- Reservations policies
CREATE POLICY "Users can view their own reservations" ON public.reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own reservations" ON public.reservations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Business owners can view reservations for their offers" ON public.reservations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.offers o
    JOIN public.venues v ON o.venue_id = v.id
    JOIN public.business_profiles bp ON v.business_id = bp.id
    WHERE o.id = offer_id AND bp.user_id = auth.uid()
  )
);

-- Collaborations policies
CREATE POLICY "Users can view collaborations they're part of" ON public.collaborations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.business_profiles WHERE id = business_id AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.creator_profiles WHERE id = creator_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Business users can create collaborations" ON public.collaborations FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.business_profiles WHERE id = business_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can update collaborations they're part of" ON public.collaborations FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.business_profiles WHERE id = business_id AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.creator_profiles WHERE id = creator_id AND user_id = auth.uid()
  )
);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Credit transactions policies
CREATE POLICY "Users can view their own transactions" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- Content submissions policies
CREATE POLICY "Creators can view their own submissions" ON public.content_submissions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.creator_profiles WHERE id = creator_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Creators can manage their own submissions" ON public.content_submissions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.creator_profiles WHERE id = creator_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Business users can view submissions for their collaborations" ON public.content_submissions FOR SELECT USING (
  collaboration_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.collaborations c
    JOIN public.business_profiles bp ON c.business_id = bp.id
    WHERE c.id = collaboration_id AND bp.user_id = auth.uid()
  )
);

-- Messages policies
CREATE POLICY "Users can view messages they sent or received" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update messages they sent" ON public.messages FOR UPDATE USING (auth.uid() = sender_id);

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to generate unique slugs for creator profiles
CREATE OR REPLACE FUNCTION generate_creator_slug(creator_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from creator name
  base_slug := lower(trim(regexp_replace(creator_name, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  
  -- Ensure uniqueness
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.creator_profiles WHERE public_slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_business_profiles_updated_at BEFORE UPDATE ON public.business_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_creator_profiles_updated_at BEFORE UPDATE ON public.creator_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON public.venues FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_collaborations_updated_at BEFORE UPDATE ON public.collaborations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;