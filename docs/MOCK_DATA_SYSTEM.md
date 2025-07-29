# Mock Data System Documentation

## Overview

The Content Weave mock data system provides a comprehensive, database-ready dataset that closely mirrors the production database schema. This system is designed for seamless migration to real database operations while providing rich, realistic data for development and testing.

## Architecture

### File Structure

```
src/
├── data/
│   ├── mockUsers.ts              # Core user data and interfaces
│   ├── mockBusinessProfiles.ts   # Business profile data
│   ├── mockCreatorProfiles.ts    # Creator profile data
│   ├── mockPortfolio.ts          # Portfolio items data
│   ├── mockCollaborations.ts     # Collaboration/campaign data
│   └── mockAnalytics.ts          # Analytics and metrics data
├── services/
│   └── mockDataService.ts        # Centralized data access service
└── lib/
    └── mockDataValidation.ts     # Data validation and integrity
```

## Key Features

### 1. Database-Ready Structure
- All data uses proper UUID formats
- ISO timestamp formats for dates
- Money amounts stored in cents (as in real databases)
- Consistent foreign key relationships
- PostgreSQL-compatible array and JSON fields

### 2. Rich Dataset
- **3 Creator profiles** with complete portfolios (22 portfolio items total)
- **4 Business profiles** from different industries
- **10 Collaborations** with various statuses and types
- **24 Analytics records** covering daily, weekly, and monthly data
- **Realistic performance metrics** and engagement data

### 3. Type Safety
- Full TypeScript interfaces for all data types
- Zod validation schemas for runtime type checking
- Referential integrity validation
- Comprehensive error handling

### 4. Easy Migration Path
- Field names match database schema exactly
- Proper data relationships and foreign keys
- Export functions for database seeding
- Validation helpers for data integrity

## Data Models

### Users
```typescript
interface MockUser {
  id: string;              // UUID format
  email: string;
  full_name: string;
  role: 'creator' | 'business' | 'admin';
  // ... additional fields
}
```

### Creator Profiles
```typescript
interface MockCreatorProfile {
  id: string;                    // UUID
  user_id: string;              // Foreign key to users
  bio: string;
  specialties: string[];        // Array field
  rating: number;               // 0-5 stars
  ur_score: number;            // 0-100 score
  instagram_followers: number;
  engagement_rate: number;     // Percentage
  min_collaboration_fee: number; // Cents
  // ... additional fields
}
```

### Business Profiles
```typescript
interface MockBusinessProfile {
  id: string;                    // UUID
  user_id: string;              // Foreign key to users
  company_name: string;
  industry: string;
  is_verified_business: boolean;
  campaign_budget_range: {
    min: number;                // Cents
    max: number;                // Cents
  };
  // ... additional fields
}
```

### Collaborations
```typescript
interface MockCollaboration {
  id: string;                   // UUID
  business_id: string;         // Foreign key
  creator_id: string;          // Foreign key
  status: 'proposed' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  compensation_amount: number; // Cents
  deliverables: {
    posts: number;
    stories: number;
    reels: number;
    videos: number;
    usage_rights: boolean;
  };
  // ... additional fields
}
```

## Usage Examples

### Basic Data Access

```typescript
import { mockDataService } from '@/services/mockDataService';

// Get creator dashboard data
const creatorData = await mockDataService.getCreatorDashboardData('creator-user-001');

// Search creators with filters
const creators = await mockDataService.getCreatorProfiles({
  specialties: ['Fashion', 'Lifestyle'],
  minRating: 4.0,
  minFollowers: 50000
});

// Get business analytics
const businessData = await mockDataService.getBusinessDashboardData('business-user-001');
```

### Advanced Queries

```typescript
// Get collaborations with complex filters
const collaborations = await mockDataService.getCollaborations({
  status: 'completed',
  platform: 'instagram',
  minBudget: 100000, // €1000 in cents
  startDate: '2024-06-01'
});

// Get analytics trends
const trends = await mockDataService.getAnalyticsTrends('creator-user-001');
console.log(trends.followerGrowth); // [1890, 2100, 2450]
console.log(trends.engagementRate); // [6.2, 7.1, 6.8]
```

### Data Validation

```typescript
import { MockDataValidator } from '@/lib/mockDataValidation';

// Validate individual records
const userValidation = MockDataValidator.validateUser(userData);
if (!userValidation.isValid) {
  console.error('User validation errors:', userValidation.errors);
}

// Validate entire dataset
const allData = await mockDataService.exportAllData();
const validation = MockDataValidator.validateAllMockData(allData);
if (!validation.isValid) {
  console.error('Data validation errors:', validation.errors);
}

// Check referential integrity
const integrityCheck = MockDataValidator.validateReferentialIntegrity(allData);
if (!integrityCheck.isValid) {
  console.error('Referential integrity errors:', integrityCheck.errors);
}
```

## Sample Data Overview

### Creators
1. **Sofia Martinez** (@sofia_creator)
   - Fashion & Lifestyle creator from Barcelona
   - 87,500 Instagram followers, 6.8% engagement
   - UR Score: 94, Rating: 4.9/5
   - 4+ portfolio items, €500-€2500 rate range

2. **Marco Rodriguez** (@marco_lifestyle)
   - Fitness & Technology creator from Madrid
   - 78,400 Instagram followers, 5.2% engagement
   - UR Score: 86, Rating: 4.7/5
   - €400-€1800 rate range

3. **Elena Garcia** (@elena_foodie)
   - Food & Travel creator from Valencia
   - 32,100 Instagram followers, 8.1% engagement
   - UR Score: 78, Rating: 4.5/5
   - €300-€1200 rate range

### Businesses
1. **Restaurant La Plaza** - Food & Beverage (Madrid)
2. **Bella Fashion** - Sustainable Fashion (Barcelona)
3. **Paradise Resort** - Luxury Hospitality (Palma)
4. **GlowUp Cosmetics** - Natural Beauty (Valencia)

### Collaboration Examples
- **Completed**: Mediterranean Summer Menu (€1200, 285% ROI)
- **In Progress**: Sustainable Fashion Campaign (€2000)
- **Accepted**: Luxury Resort Experience (€3500)
- **Proposed**: Natural Skincare Review (€800)

## Migration to Real Database

### 1. Data Export
```typescript
// Export all data for database seeding
const allData = await mockDataService.exportAllData();
console.log('Users:', allData.users.length);
console.log('Creator Profiles:', allData.creatorProfiles.length);
console.log('Business Profiles:', allData.businessProfiles.length);
console.log('Portfolio Items:', allData.portfolioItems.length);
console.log('Collaborations:', allData.collaborations.length);
console.log('Analytics:', allData.analytics.length);
```

### 2. Database Schema Compatibility
The mock data is designed to match PostgreSQL/Supabase schema:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  full_name VARCHAR NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- ... additional fields
);

-- Creator profiles table
CREATE TABLE creator_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  bio TEXT NOT NULL,
  specialties TEXT[] NOT NULL,
  rating DECIMAL(2,1),
  ur_score INTEGER CHECK (ur_score >= 0 AND ur_score <= 100),
  min_collaboration_fee INTEGER, -- cents
  max_collaboration_fee INTEGER, -- cents
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- ... additional fields
);
```

### 3. Data Seeding Script Example
```typescript
// Database seeding example
async function seedDatabase() {
  const mockData = await mockDataService.exportAllData();
  
  // Validate before import
  const validation = MockDataValidator.validateAllMockData(mockData);
  if (!validation.isValid) {
    throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
  }
  
  // Import to database
  await supabase.from('users').insert(mockData.users);
  await supabase.from('creator_profiles').insert(mockData.creatorProfiles);
  await supabase.from('business_profiles').insert(mockData.businessProfiles);
  await supabase.from('portfolio_items').insert(mockData.portfolioItems);
  await supabase.from('collaborations').insert(mockData.collaborations);
  await supabase.from('user_analytics').insert(mockData.analytics);
  
  console.log('Database seeded successfully!');
}
```

## Testing and Development

### 1. Authentication Testing
```typescript
// Test login with mock users
const result = await mockDataService.signIn('sofia.martinez@example.com', 'creator123');
if (result) {
  console.log('Logged in as:', result.user.full_name);
  console.log('Session token:', result.session.access_token);
}
```

### 2. Dashboard Testing
```typescript
// Test creator dashboard
const dashboard = await mockDataService.getCreatorDashboardData('creator-user-001');
console.log(`Total earnings: €${dashboard.metrics.totalEarnings / 100}`);
console.log(`Active collaborations: ${dashboard.metrics.activeCollaborations}`);
```

### 3. Performance Testing
```typescript
// Test data retrieval performance
console.time('Get all creators');
const creators = await mockDataService.getCreatorProfiles();
console.timeEnd('Get all creators');

console.time('Filter creators');
const filteredCreators = await mockDataService.getCreatorProfiles({
  specialties: ['Fashion'],
  minRating: 4.5
});
console.timeEnd('Filter creators');
```

## Best Practices

### 1. Always Use the Service Layer
```typescript
// ✅ Good - Use centralized service
import { mockDataService } from '@/services/mockDataService';
const data = await mockDataService.getCreatorProfiles();

// ❌ Bad - Direct data import
import { mockCreatorProfiles } from '@/data/mockCreatorProfiles';
```

### 2. Validate Data Operations
```typescript
// ✅ Good - Validate before operations
const validation = MockDataValidator.validateCreatorProfile(newProfile);
if (validation.isValid) {
  await mockDataService.createCreatorProfile(newProfile);
}

// ❌ Bad - No validation
await mockDataService.createCreatorProfile(newProfile);
```

### 3. Use TypeScript Types
```typescript
// ✅ Good - Proper typing
import { MockCreatorProfile } from '@/data/mockUsers';
const profile: MockCreatorProfile = await mockDataService.getCreatorProfile(id);

// ❌ Bad - No typing
const profile = await mockDataService.getCreatorProfile(id);
```

## Error Handling

The mock data service includes comprehensive error handling:

```typescript
try {
  const data = await mockDataService.getCreatorDashboardData('invalid-id');
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Creator not found');
  } else if (error.code === 'VALIDATION_ERROR') {
    console.log('Data validation failed:', error.details);
  } else {
    console.log('Unexpected error:', error.message);
  }
}
```

## Performance Considerations

1. **Data Loading**: All data is loaded in memory for fast access
2. **Filtering**: Efficient client-side filtering with optimized algorithms
3. **Caching**: Results are cached when appropriate
4. **Memory Usage**: ~2MB total memory footprint for all mock data

## Contributing

When adding new mock data:

1. Follow the existing data structure patterns
2. Use realistic, professional content
3. Maintain referential integrity
4. Add validation schemas
5. Update documentation
6. Test with validation functions

## Future Enhancements

- [ ] Real-time data updates simulation
- [ ] More complex analytics calculations
- [ ] Additional business industries
- [ ] Multi-language content support
- [ ] Advanced filtering capabilities
- [ ] Performance metrics tracking

---

This mock data system provides a robust foundation for development while ensuring a smooth transition to production database operations. The combination of realistic data, type safety, and validation makes it an ideal solution for building and testing the Creator Dashboard functionality.