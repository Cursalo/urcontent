# Content Weave Platform API Reference

## Overview

The Content Weave API provides comprehensive endpoints for managing content creators, businesses, collaborations, payments, and platform operations. The API follows RESTful conventions and uses Supabase as the backend infrastructure.

## Table of Contents

1. [Authentication](#authentication)
2. [Base URLs](#base-urls)
3. [Common Patterns](#common-patterns)
4. [Authentication Endpoints](#authentication-endpoints)
5. [User Management](#user-management)
6. [Creator Profiles](#creator-profiles)
7. [Business Profiles](#business-profiles)
8. [Collaborations](#collaborations)
9. [Venues & Offers](#venues--offers)
10. [Reservations](#reservations)
11. [Payments & Transactions](#payments--transactions)
12. [Messaging](#messaging)
13. [Notifications](#notifications)
14. [Analytics](#analytics)
15. [File Upload](#file-upload)
16. [Error Handling](#error-handling)
17. [Rate Limiting](#rate-limiting)
18. [Webhooks](#webhooks)

## Authentication

The Content Weave API uses JWT (JSON Web Tokens) for authentication via Supabase Auth.

### Authentication Flow
```http
POST /auth/v1/token
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Authorization Header
All authenticated requests must include the JWT token:
```http
Authorization: Bearer <jwt_token>
```

### User Roles
- `creator`: Content creator accounts
- `business`: Business accounts  
- `admin`: Platform administrators

## Base URLs

| Environment | Base URL |
|------------|----------|
| Production | `https://api.contentweave.com` |
| Staging | `https://staging-api.contentweave.com` |
| Development | `http://localhost:8080` |

## Common Patterns

### Request Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
Accept: application/json
```

### Response Format
```json
{
  "data": {},
  "error": null,
  "status": 200,
  "statusText": "OK"
}
```

### Error Response
```json
{
  "data": null,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  },
  "status": 400,
  "statusText": "Bad Request"
}
```

### Pagination
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

## Authentication Endpoints

### Sign Up
Create a new user account.

```http
POST /auth/v1/signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "userData": {
    "full_name": "John Doe",
    "role": "creator"
  }
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "creator"
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token"
    }
  }
}
```

### Sign In
Authenticate existing user.

```http
POST /auth/v1/token
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Sign Out
Invalidate user session.

```http
POST /auth/v1/logout
Authorization: Bearer <jwt_token>
```

### Refresh Token
Get new access token using refresh token.

```http
POST /auth/v1/token?grant_type=refresh_token
```

**Request Body:**
```json
{
  "refresh_token": "refresh_token"
}
```

### Password Reset
Request password reset email.

```http
POST /auth/v1/recover
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

## User Management

### Get Current User
Get authenticated user information.

```http
GET /rest/v1/users?select=*&id=eq.{user_id}
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "creator",
      "avatar_url": "https://...",
      "is_verified": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Update User Profile
Update user information.

```http
PATCH /rest/v1/users?id=eq.{user_id}
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "full_name": "John Smith",
  "avatar_url": "https://...",
  "phone": "+1234567890",
  "location": "New York, NY"
}
```

### Delete User Account
Permanently delete user account.

```http
DELETE /rest/v1/users?id=eq.{user_id}
Authorization: Bearer <jwt_token>
```

## Creator Profiles

### Get Creator Profile
Retrieve creator profile information.

```http
GET /rest/v1/creator_profiles?select=*&user_id=eq.{user_id}
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "bio": "Content creator specializing in beauty and lifestyle",
      "specialties": ["beauty", "lifestyle", "fashion"],
      "instagram_handle": "@johndoe",
      "instagram_followers": 50000,
      "instagram_verified": true,
      "tiktok_handle": "@johndoe",
      "youtube_handle": "johndoe",
      "portfolio_url": "https://...",
      "min_collaboration_fee": 500,
      "max_collaboration_fee": 2000,
      "collaboration_types": ["sponsored_post", "story", "reel"],
      "audience_demographics": {
        "age_ranges": ["18-24", "25-34"],
        "gender_split": {"female": 70, "male": 30},
        "top_locations": ["Buenos Aires", "CABA", "Córdoba"]
      },
      "engagement_rate": 4.5,
      "ur_score": 850,
      "average_rating": 4.8,
      "is_available": true,
      "membership_tier": "premium"
    }
  ]
}
```

### Update Creator Profile
Update creator profile information.

```http
PATCH /rest/v1/creator_profiles?user_id=eq.{user_id}
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "bio": "Updated bio",
  "specialties": ["beauty", "wellness", "fitness"],
  "min_collaboration_fee": 600,
  "max_collaboration_fee": 2500,
  "is_available": false
}
```

### Search Creators
Search and filter creators.

```http
GET /rest/v1/creator_profiles?select=*,users(full_name,avatar_url)&specialties=cs.{beauty}&instagram_followers=gte.10000&order=ur_score.desc&limit=20
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `specialties=cs.{specialty}`: Filter by specialty (case-sensitive)
- `instagram_followers=gte.{number}`: Minimum followers
- `engagement_rate=gte.{number}`: Minimum engagement rate
- `ur_score=gte.{number}`: Minimum UR score
- `membership_tier=eq.{tier}`: Filter by membership tier
- `order={field}.{direction}`: Sort results
- `limit={number}`: Limit results (max 100)
- `offset={number}`: Pagination offset

## Business Profiles

### Get Business Profile
Retrieve business profile information.

```http
GET /rest/v1/business_profiles?select=*&user_id=eq.{user_id}
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "company_name": "Beauty Brand Co",
      "industry": "Beauty & Cosmetics",
      "description": "Premium beauty products for modern consumers",
      "website_url": "https://beautybrand.com",
      "logo_url": "https://...",
      "company_size": "51-200",
      "cuit": "20-12345678-9",
      "address": "Av. Corrientes 1234, CABA",
      "contact_person": "Jane Smith",
      "marketing_budget_range": "$10,000-$50,000",
      "preferred_creator_types": ["beauty", "lifestyle"],
      "brand_values": ["sustainability", "inclusivity", "innovation"],
      "target_audience": {
        "age_ranges": ["25-34", "35-44"],
        "interests": ["beauty", "skincare", "wellness"]
      },
      "collaboration_history": 25,
      "average_rating": 4.6,
      "is_verified_business": true,
      "is_beauty_pass_partner": true
    }
  ]
}
```

### Update Business Profile
Update business profile information.

```http
PATCH /rest/v1/business_profiles?user_id=eq.{user_id}
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "description": "Updated company description",
  "marketing_budget_range": "$20,000-$100,000",
  "preferred_creator_types": ["beauty", "lifestyle", "fitness"],
  "brand_values": ["sustainability", "innovation", "authenticity"]
}
```

## Collaborations

### Create Collaboration
Create a new collaboration proposal.

```http
POST /rest/v1/collaborations
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "business_id": "uuid",
  "creator_id": "uuid",
  "title": "Summer Beauty Campaign",
  "description": "Promote our new summer skincare line",
  "requirements": "Must create 3 Instagram posts and 5 stories",
  "deliverables": ["instagram_post", "instagram_story", "tiktok_video"],
  "compensation_amount": 1500,
  "compensation_type": "fixed",
  "collaboration_type": "sponsored_content",
  "deadline": "2024-06-30T23:59:59Z",
  "platform": "instagram",
  "content_guidelines": "Use bright, summery aesthetics",
  "brand_mentions_required": true,
  "hashtags_required": ["#SummerGlow", "#BeautyBrand"],
  "approval_required": true,
  "contract_terms": "Standard collaboration terms apply"
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "status": "proposed",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Collaborations
Retrieve user's collaborations.

```http
GET /rest/v1/collaborations?select=*,business_profiles(company_name),creator_profiles(users(full_name))&or=(business_id.eq.{user_business_id},creator_id.eq.{user_creator_id})&order=created_at.desc
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status=eq.{status}`: Filter by status
- `collaboration_type=eq.{type}`: Filter by type
- `deadline=gte.{date}`: Filter by deadline
- `order={field}.{direction}`: Sort results

### Update Collaboration Status
Update collaboration status (accept/reject/complete).

```http
PATCH /rest/v1/collaborations?id=eq.{collaboration_id}
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "status": "accepted",
  "creator_response": "Excited to work on this project!",
  "accepted_at": "2024-01-01T00:00:00Z"
}
```

### Get Collaboration Details
Get detailed collaboration information.

```http
GET /rest/v1/collaborations?select=*,business_profiles(*,users(full_name,avatar_url)),creator_profiles(*,users(full_name,avatar_url))&id=eq.{collaboration_id}
Authorization: Bearer <jwt_token>
```

## Venues & Offers

### Get Venues
Retrieve available venues.

```http
GET /rest/v1/venues?select=*,business_profiles(company_name,logo_url)&is_active=eq.true&order=created_at.desc
```

**Query Parameters:**
- `category=eq.{category}`: Filter by venue category
- `city=eq.{city}`: Filter by city
- `is_verified=eq.true`: Only verified venues
- `partner_since=gte.{date}`: Partner since date

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "business_profile_id": "uuid",
      "name": "Luxury Spa Downtown",
      "category": "spa",
      "description": "Premium spa services in the heart of the city",
      "address": "Av. Alvear 1234, CABA",
      "city": "Buenos Aires",
      "province": "CABA",
      "latitude": -34.5922,
      "longitude": -58.3742,
      "phone": "+54 11 1234-5678",
      "email": "info@luxuryspa.com",
      "website_url": "https://luxuryspa.com",
      "instagram_handle": "@luxuryspa",
      "operating_hours": {
        "monday": "09:00-20:00",
        "tuesday": "09:00-20:00",
        "wednesday": "09:00-20:00",
        "thursday": "09:00-20:00",
        "friday": "09:00-21:00",
        "saturday": "08:00-21:00",
        "sunday": "10:00-19:00"
      },
      "amenities": ["wifi", "parking", "accessible", "credit_cards"],
      "images": ["https://...", "https://..."],
      "average_rating": 4.7,
      "total_reviews": 245,
      "is_verified": true,
      "is_active": true
    }
  ]
}
```

### Get Venue Offers
Retrieve offers for a specific venue.

```http
GET /rest/v1/offers?select=*&venue_id=eq.{venue_id}&is_active=eq.true&valid_until=gte.{current_date}&order=created_at.desc
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "venue_id": "uuid",
      "title": "Relaxing Massage Session",
      "description": "60-minute full body massage with premium oils",
      "type": "service",
      "category": "spa",
      "original_value_ars": 8000,
      "credit_cost": 40,
      "min_membership_tier": "basic",
      "max_redemptions_per_month": 2,
      "total_capacity": 20,
      "duration_minutes": 60,
      "available_days": [1, 2, 3, 4, 5],
      "available_time_slots": ["10:00", "14:00", "16:00", "18:00"],
      "advance_booking_hours": 24,
      "cancellation_hours": 4,
      "special_requirements": "Please arrive 10 minutes early",
      "content_requirements": {
        "instagram_story": true,
        "instagram_post": false,
        "min_hashtags": 3,
        "required_hashtags": ["#LuxurySpa", "#BeautyPass"]
      },
      "images": ["https://...", "https://..."],
      "is_featured": false,
      "is_active": true,
      "valid_from": "2024-01-01T00:00:00Z",
      "valid_until": "2024-12-31T23:59:59Z"
    }
  ]
}
```

### Create Offer
Create a new venue offer (business users only).

```http
POST /rest/v1/offers
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "venue_id": "uuid",
  "title": "Facial Treatment Special",
  "description": "Deep cleansing facial with organic products",
  "type": "service",
  "category": "beauty",
  "original_value_ars": 6000,
  "credit_cost": 30,
  "min_membership_tier": "premium",
  "duration_minutes": 90,
  "available_days": [1, 2, 3, 4, 5, 6],
  "available_time_slots": ["10:00", "12:00", "15:00", "17:00"],
  "advance_booking_hours": 48,
  "cancellation_hours": 6
}
```

## Reservations

### Create Reservation
Book a venue offer using credits.

```http
POST /rest/v1/reservations
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "offer_id": "uuid",
  "venue_id": "uuid",
  "credits_used": 40,
  "scheduled_date": "2024-06-15",
  "scheduled_time": "14:00",
  "guest_count": 1,
  "special_requests": "Please use unscented products due to allergies"
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "status": "confirmed",
      "qr_code": "base64_encoded_qr_code",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get User Reservations
Retrieve user's reservations.

```http
GET /rest/v1/reservations?select=*,offers(title,category),venues(name,address,phone)&user_id=eq.{user_id}&order=scheduled_date.desc
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status=eq.{status}`: Filter by reservation status
- `scheduled_date=gte.{date}`: Upcoming reservations
- `venue_id=eq.{venue_id}`: Filter by venue

### Check-in to Reservation
Check-in using QR code or venue verification.

```http
POST /rest/v1/venue_checkins
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "reservation_id": "uuid",
  "venue_id": "uuid",
  "check_in_method": "qr_code",
  "location_data": {
    "latitude": -34.5922,
    "longitude": -58.3742,
    "accuracy": 10
  }
}
```

### Cancel Reservation
Cancel a reservation and refund credits.

```http
PATCH /rest/v1/reservations?id=eq.{reservation_id}
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "status": "cancelled",
  "cancelled_at": "2024-01-01T00:00:00Z"
}
```

### Submit Content for Reservation
Upload content after completing reservation.

```http
PATCH /rest/v1/reservations?id=eq.{reservation_id}
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "content_submitted": true,
  "content_urls": ["https://instagram.com/p/xyz", "https://..."],
  "completed_at": "2024-01-01T00:00:00Z"
}
```

## Payments & Transactions

### Create Payment Intent
Create a payment intent for membership or credits.

```http
POST /functions/v1/create-payment
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "type": "membership",
  "tier": "premium",
  "amount": 2999,
  "currency": "ARS",
  "description": "Premium membership subscription",
  "metadata": {
    "user_id": "uuid",
    "membership_duration": "monthly"
  }
}
```

**Response:**
```json
{
  "data": {
    "preference_id": "123456789",
    "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=123456789",
    "sandbox_init_point": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=123456789"
  }
}
```

### Get Payment Status
Check payment status.

```http
GET /rest/v1/transactions?select=*&external_payment_id=eq.{payment_id}
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "collaboration_id": null,
      "payer_id": "uuid",
      "payee_id": null,
      "amount": 2999,
      "currency": "ARS",
      "status": "completed",
      "payment_method": "credit_card",
      "external_payment_id": "123456789",
      "platform_fee": 299,
      "net_amount": 2700,
      "description": "Premium membership subscription",
      "created_at": "2024-01-01T00:00:00Z",
      "completed_at": "2024-01-01T00:01:30Z"
    }
  ]
}
```

### Get Transaction History
Retrieve user's transaction history.

```http
GET /rest/v1/transactions?select=*&or=(payer_id.eq.{user_id},payee_id.eq.{user_id})&order=created_at.desc&limit=50
Authorization: Bearer <jwt_token>
```

### Process Webhook
Handle MercadoPago payment notifications (internal endpoint).

```http
POST /functions/v1/mercadopago-webhook
Content-Type: application/json
X-Signature: <signature>

{
  "id": 123456789,
  "live_mode": true,
  "type": "payment",
  "date_created": "2024-01-01T00:01:30.000Z",
  "application_id": 987654321,
  "user_id": 456789123,
  "version": 1,
  "api_version": "v1",
  "action": "payment.updated",
  "data": {
    "id": "123456789"
  }
}
```

## Messaging

### Get Conversations
Retrieve user's conversations.

```http
GET /rest/v1/conversations?select=*,creator_profiles(users(full_name,avatar_url)),business_profiles(company_name,logo_url,users(full_name,avatar_url))&or=(creator_id.eq.{user_id},business_id.eq.{user_id})&order=last_message_at.desc
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "collaboration_id": "uuid",
      "creator_id": "uuid",
      "business_id": "uuid",
      "last_message_at": "2024-01-01T12:30:00Z",
      "is_archived": false,
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### Get Messages
Retrieve messages for a conversation.

```http
GET /rest/v1/messages?select=*,users(full_name,avatar_url)&conversation_id=eq.{conversation_id}&order=created_at.asc&limit=50
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "conversation_id": "uuid",
      "sender_id": "uuid",
      "content": "Hello! I'm interested in your collaboration proposal.",
      "message_type": "text",
      "attachment_url": null,
      "is_read": true,
      "created_at": "2024-01-01T10:15:00Z"
    }
  ]
}
```

### Send Message
Send a message in a conversation.

```http
POST /rest/v1/messages
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "conversation_id": "uuid",
  "content": "Thank you for your interest! Let's discuss the details.",
  "message_type": "text",
  "attachment_url": null
}
```

### Mark Messages as Read
Mark conversation messages as read.

```http
PATCH /rest/v1/messages?conversation_id=eq.{conversation_id}&sender_id=neq.{current_user_id}
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "is_read": true
}
```

### Create Conversation
Start a new conversation (auto-created when first message is sent).

```http
POST /rest/v1/conversations
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "collaboration_id": "uuid",
  "creator_id": "uuid",
  "business_id": "uuid"
}
```

## Notifications

### Get Notifications
Retrieve user notifications.

```http
GET /rest/v1/notifications?select=*&user_id=eq.{user_id}&order=created_at.desc&limit=50
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `is_read=eq.false`: Unread notifications only
- `type=eq.{type}`: Filter by notification type

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "New Collaboration Proposal",
      "message": "Beauty Brand Co has sent you a collaboration proposal",
      "type": "collaboration_proposal",
      "reference_id": "uuid",
      "reference_type": "collaboration",
      "is_read": false,
      "action_url": "/collaborations/uuid",
      "created_at": "2024-01-01T14:30:00Z"
    }
  ]
}
```

### Mark Notification as Read
Mark a notification as read.

```http
PATCH /rest/v1/notifications?id=eq.{notification_id}
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "is_read": true
}
```

### Mark All Notifications as Read
Mark all user notifications as read.

```http
PATCH /rest/v1/notifications?user_id=eq.{user_id}
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "is_read": true
}
```

## Analytics

### Get Creator Analytics
Retrieve creator performance analytics.

```http
GET /rest/v1/user_analytics?select=*&user_id=eq.{user_id}&metric_type=in.(collaborations_completed,total_earnings,average_rating)&order=date.desc&limit=30
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "metric_type": "collaborations_completed",
      "metric_value": 5,
      "date": "2024-01-01",
      "metadata": {
        "breakdown": {
          "instagram_posts": 3,
          "instagram_stories": 8,
          "tiktok_videos": 2
        }
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Business Analytics
Retrieve business performance analytics.

```http
GET /functions/v1/business-analytics
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `business_id`: Business profile ID
- `start_date`: Start date for analytics
- `end_date`: End date for analytics
- `metrics`: Comma-separated list of metrics

**Response:**
```json
{
  "data": {
    "collaborations": {
      "total": 25,
      "completed": 22,
      "in_progress": 2,
      "cancelled": 1
    },
    "spending": {
      "total_amount": 45000,
      "average_per_collaboration": 2045,
      "currency": "ARS"
    },
    "performance": {
      "average_rating": 4.6,
      "response_rate": 85.5,
      "completion_rate": 91.7
    },
    "creators": {
      "total_worked_with": 15,
      "repeat_collaborations": 7,
      "top_performing": [
        {
          "creator_id": "uuid",
          "name": "Jane Doe",
          "collaborations": 4,
          "average_rating": 4.9
        }
      ]
    }
  }
}
```

### Get Platform Statistics
Retrieve platform-wide statistics (admin only).

```http
GET /functions/v1/platform-stats
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "data": {
    "users": {
      "total": 1250,
      "creators": 890,
      "businesses": 340,
      "admins": 20,
      "growth_rate": 12.5
    },
    "collaborations": {
      "total": 5670,
      "active": 234,
      "completed": 4890,
      "success_rate": 86.2
    },
    "revenue": {
      "total_volume": 2450000,
      "platform_fees": 245000,
      "currency": "ARS"
    },
    "engagement": {
      "daily_active_users": 450,
      "weekly_active_users": 1100,
      "monthly_active_users": 1800
    }
  }
}
```

## File Upload

### Upload Avatar
Upload user avatar image.

```http
POST /storage/v1/object/avatars/{user_id}
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <image_file>
```

**Response:**
```json
{
  "Key": "avatars/uuid/avatar.jpg",
  "message": "Upload successful"
}
```

### Upload Portfolio Media
Upload portfolio images/videos for creators.

```http
POST /storage/v1/object/portfolio/{creator_id}
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <media_file>
```

### Upload Venue Images
Upload venue images for businesses.

```http
POST /storage/v1/object/venues/{venue_id}
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <image_file>
```

### Get File URL
Get public URL for uploaded file.

```http
GET /storage/v1/object/public/{bucket}/{path}
```

**Response:**
```json
{
  "publicURL": "https://supabase.co/storage/v1/object/public/avatars/uuid/avatar.jpg"
}
```

## Error Handling

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_REQUEST` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "status": 422
}
```

### Common Error Scenarios

#### Authentication Errors
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "JWT token is invalid or expired"
  },
  "status": 401
}
```

#### Validation Errors
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Required fields are missing",
    "details": {
      "missing_fields": ["email", "password"]
    }
  },
  "status": 422
}
```

#### Resource Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Collaboration not found or access denied"
  },
  "status": 404
}
```

## Rate Limiting

### Rate Limits

| Endpoint Category | Requests/Minute | Burst Limit |
|------------------|-----------------|-------------|
| Authentication | 10 | 20 |
| Read Operations | 100 | 200 |
| Write Operations | 30 | 60 |
| File Uploads | 5 | 10 |
| Analytics | 20 | 40 |

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

### Rate Limit Exceeded Response
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "details": {
      "limit": 100,
      "remaining": 0,
      "reset": 1609459200
    }
  },
  "status": 429
}
```

## Webhooks

### MercadoPago Payment Webhook
Receive payment status updates from MercadoPago.

```http
POST /functions/v1/mercadopago-webhook
Content-Type: application/json
X-Signature: <signature>
```

**Payload:**
```json
{
  "id": 123456789,
  "live_mode": true,
  "type": "payment",
  "date_created": "2024-01-01T00:01:30.000Z",
  "action": "payment.updated",
  "data": {
    "id": "payment_id"
  }
}
```

### Webhook Verification
Verify webhook signature for security.

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## SDK and Libraries

### JavaScript/TypeScript SDK
```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database'

const supabase = createClient<Database>(
  'https://xmtjzfnddkuxdertnriq.supabase.co',
  'your_anon_key'
)

// Usage example
const { data: creators, error } = await supabase
  .from('creator_profiles')
  .select('*, users(full_name, avatar_url)')
  .eq('is_available', true)
  .gte('instagram_followers', 10000)
  .order('ur_score', { ascending: false })
  .limit(20)
```

### React Hooks
```typescript
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Custom hook for fetching collaborations
export function useCollaborations(userId: string) {
  return useQuery({
    queryKey: ['collaborations', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaborations')
        .select('*, business_profiles(company_name)')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    }
  })
}
```

## Testing

### API Testing
```javascript
// Example test using Jest
describe('Authentication API', () => {
  test('should authenticate user with valid credentials', async () => {
    const response = await fetch('/auth/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    })
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.access_token).toBeDefined()
  })
})
```

### Postman Collection
A comprehensive Postman collection is available with all API endpoints, including:
- Environment variables for different stages
- Pre-request scripts for authentication
- Test scripts for response validation
- Example requests for all endpoints

## Support

For API support and questions:
- 📧 API Support: api-support@contentweave.com
- 📚 Documentation: [docs.contentweave.com/api](https://docs.contentweave.com/api)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/your-username/content-weave/issues)
- 💬 Community: [Discord](https://discord.gg/contentweave)

---

**Content Weave API** - Powering creator-business collaborations through robust, secure, and scalable APIs.