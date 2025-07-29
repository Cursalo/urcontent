# Role-Based Dashboard Testing Guide

## 🚀 Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:** http://localhost:8080

## 🧪 Test Scenarios

### Test 1: Creator Dashboard Access

1. Navigate to `/login`
2. **Login credentials:**
   - Email: `creator@urcontent.com`
   - Password: `creator123`

3. **Expected Result:**
   - ✅ Redirected to `/dashboard`
   - ✅ CreatorDashboard component loads
   - ✅ Navigation shows: Dashboard, My Profile, Collaborations, Analytics, Settings
   - ✅ Quick action button: "Add Content"
   - ✅ Avatar has pink-to-purple gradient
   - ✅ Role badge shows "creator"

4. **Verify Features:**
   - Monthly earnings display
   - Active collaborations counter
   - URScore with breakdown
   - Portfolio showcase carousel
   - Recent collaborations table
   - Upcoming deadlines sidebar

### Test 2: Business Dashboard Access

1. Navigate to `/login` (or logout first)
2. **Login credentials:**
   - Email: `venue@urcontent.com`
   - Password: `venue123`

3. **Expected Result:**
   - ✅ Redirected to `/dashboard`
   - ✅ BusinessDashboard component loads
   - ✅ Navigation shows: Dashboard, Find Creators, My Campaigns, Analytics, Settings
   - ✅ Quick action button: "New Campaign"
   - ✅ Avatar has blue-to-indigo gradient  
   - ✅ Role badge shows "business"

4. **Verify Features:**
   - Campaign ROI tracking
   - Active campaigns management
   - Creator recommendations grid
   - Performance charts (reach, engagement)
   - Quick actions sidebar
   - Upcoming milestones

### Test 3: Admin Dashboard Access

1. Navigate to `/login` (or logout first)
2. **Login credentials:**
   - Email: `admin@urcontent.com`
   - Password: `admin123`

3. **Expected Result:**
   - ✅ Redirected to `/dashboard`
   - ✅ AdminDashboard component loads
   - ✅ Navigation shows: Overview, Analytics, Users, Collaborations, Settings
   - ✅ No quick action button (admin doesn't need creator/business actions)
   - ✅ Avatar has yellow-to-orange gradient
   - ✅ Role badge shows "admin"

4. **Verify Features:**
   - Platform statistics (total users, revenue, collaborations)
   - User growth charts
   - System status monitoring
   - Recent users table
   - Recent collaborations table
   - Industry distribution chart

## 🔍 Navigation Testing

### Test 4: Role-Based Navigation

For each logged-in user type, verify:

1. **Main navigation menu items** are role-appropriate
2. **Quick action buttons** match the user type
3. **User dropdown menu** shows correct role
4. **Avatar styling** matches role (color gradients)
5. **Mobile navigation** works correctly

### Test 5: Authentication State Testing

1. **Unauthenticated access:**
   - Navigate to `/dashboard` without logging in
   - ✅ Should redirect to `/login`

2. **Protected route access:**
   - Try accessing dashboard pages directly
   - ✅ Should redirect to login if not authenticated

3. **Logout functionality:**
   - Click logout from user dropdown
   - ✅ Should clear session and redirect to login

## 📱 Mobile Responsive Testing

### Test 6: Mobile Dashboard Access

1. **Resize browser** to mobile width (< 768px)
2. **Test mobile navigation:**
   - Hamburger menu should appear
   - Mobile navigation should show role-appropriate items
   - User dropdown should work on mobile

3. **Test dashboard layouts:**
   - All dashboards should be responsive
   - Charts should resize properly
   - Tables should be scrollable horizontally if needed

## 🎯 Console Debugging

### Test 7: Debug Information

With browser console open, verify:

1. **Role detection logs:**
   ```
   Dashboard role detection: {
     profileRole: "creator",
     userMetadataRole: "creator", 
     finalRole: "creator",
     userId: "creator-user-001",
     userEmail: "creator@urcontent.com"
   }
   ```

2. **Routing logs:**
   ```
   Routing to CreatorDashboard
   ```

3. **Navigation logs:**
   ```
   DashboardNav role detection: {
     profileRole: "creator",
     userMetadataRole: "creator",
     finalRole: "creator"
   }
   ```

## 🚨 Error Testing

### Test 8: Edge Cases

1. **Invalid login:**
   - Try logging in with wrong credentials
   - ✅ Should show error message

2. **Session expiration:**
   - Mock sessions expire after 1 hour
   - ✅ Should redirect to login when expired

3. **Role fallback:**
   - If role detection fails, should default to creator dashboard

## ✅ Checklist

### Creator User (`creator@urcontent.com`)
- [ ] Login successful
- [ ] CreatorDashboard loads
- [ ] Navigation shows creator-specific items
- [ ] "Add Content" button visible
- [ ] Pink-purple avatar gradient
- [ ] Real data in stats cards
- [ ] Portfolio carousel functional
- [ ] Charts render correctly

### Business User (`venue@urcontent.com`)
- [ ] Login successful
- [ ] BusinessDashboard loads
- [ ] Navigation shows business-specific items
- [ ] "New Campaign" button visible
- [ ] Blue-indigo avatar gradient
- [ ] Campaign management interface
- [ ] Creator recommendations visible
- [ ] ROI analytics functional

### Admin User (`admin@urcontent.com`)
- [ ] Login successful
- [ ] AdminDashboard loads
- [ ] Navigation shows admin-specific items
- [ ] Crown icon in role badge
- [ ] Yellow-orange avatar gradient
- [ ] Platform-wide statistics
- [ ] User management interface
- [ ] System health monitoring

### General Functionality
- [ ] Role-based routing works
- [ ] Protected routes redirect properly
- [ ] Logout functionality works
- [ ] Mobile responsive design
- [ ] Console debug logs appear
- [ ] No JavaScript errors
- [ ] All navigation links work
- [ ] User dropdown menus functional

## 🎉 Success Criteria

If all tests pass, you have successfully implemented:

✅ **Complete role-based dashboard system**
✅ **Proper authentication flow**
✅ **Role-specific navigation**
✅ **Visual role indicators**
✅ **Mobile responsive design**
✅ **Error handling and fallbacks**
✅ **Production-ready user experience**

The implementation handles all requirements for the 3 mock user types with proper dashboard access control.