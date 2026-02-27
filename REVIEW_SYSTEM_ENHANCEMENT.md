# Review System Enhancement - Purchase Verification & Artist Ratings

## Overview
Enhanced the review system to ensure only customers who have purchased and received an artwork can submit reviews. Additionally, added the ability for customers to rate both the artwork AND the artist.

## Key Changes Implemented

### 1. Backend Changes

#### Review Controller (`server/controllers/review.controller.js`)
- **Purchase Verification**: Updated `addReview` to verify that:
  - The customer has purchased the specific artwork
  - The order status is "delivered"
  - The customer hasn't already reviewed this artwork
- **Artist Rating**: Added support for `artist_rating` field (1-5 stars)
- **Updated Rating Calculation**: Artist ratings now calculated based on separate artist_rating values instead of artwork ratings
- **New Endpoint**: Added `canReviewArtwork` function to check if a user is eligible to review an artwork
  - Returns `canReview: true/false`
  - Provides reason if not eligible: 'not_purchased' or 'already_reviewed'

#### Review Routes (`server/routes/review.routes.js`)
- Added new route: `GET /reviews/can-review/:artworkId` to check review eligibility

#### Database Schema (`server/database/init-db.js`)
- Added `artist_rating` column to reviews table:
  ```sql
  artist_rating INT CHECK (artist_rating >= 1 AND artist_rating <= 5)
  ```

#### Database Migration (`server/database/add-artist-rating-column.js`)
- Created migration script to add `artist_rating` column to existing databases
- Includes safety check to prevent duplicate column creation
- Successfully executed on database

### 2. Frontend Changes

#### API Service (`client/src/services/api.js`)
- Updated `submitReview` to include `artist_rating` parameter
- Added new `canReviewArtwork(artworkId)` function to check review eligibility

#### Artwork Detail Page (`client/src/pages/ArtworkDetailPage.js`)
- **State Management**: Added new states:
  - `canReview`: Tracks if user can submit a review
  - `reviewCheckDone`: Ensures UI doesn't flash while checking eligibility
  - Updated `review` state to include `artistRating` field

- **Review Eligibility Check**: Added `checkReviewEligibility()` function
  - Called automatically when authenticated customer views artwork
  - Updates UI based on eligibility

- **Enhanced Review Form**:
  - Separated ratings for artwork and artist
  - Artwork Rating: 🎨 ⭐⭐⭐⭐⭐
  - Artist Rating: 👨‍🎨 ⭐⭐⭐⭐⭐
  - Updated placeholder text to prompt for both artwork and artist feedback
  - Form only displays if `canReview === true`

- **Informative Messages**:
  - Shows info message if user cannot review: "You can only review artworks you have purchased and received"
  - Success message after review submission

- **Review Display**:
  - Shows both artwork rating (🎨) and artist rating (👨‍🎨) in review list
  - Artist rating only displayed if provided

## User Experience Flow

### For Customers:
1. **Browse Artwork**: Customer views artwork detail page
2. **Purchase**: Customer purchases artwork
3. **Delivery**: Order must be marked as "delivered"
4. **Review Option Appears**: Review form becomes available on artwork page
5. **Submit Review**: Customer rates both artwork (1-5) and artist (1-5)
6. **One Review Per Purchase**: Cannot submit multiple reviews for same artwork

### Purchase Verification Logic:
```javascript
// Customer CAN review if:
- Has purchased the specific artwork (not just any artwork)
- Order status is "delivered"
- Has not already reviewed this artwork

// Customer CANNOT review if:
- Never purchased the artwork
- Order status is not "delivered" (pending, confirmed, shipped, cancelled)
- Already submitted a review for this artwork
```

## Database Structure

### Reviews Table (Updated):
```sql
CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  artwork_id INT NOT NULL,              -- Links to specific artwork
  customer_id INT NOT NULL,             -- Customer who wrote review
  order_id INT NOT NULL,                -- Verifies purchase
  rating INT NOT NULL,                  -- Artwork rating (1-5)
  artist_rating INT,                    -- Artist rating (1-5) - NEW
  comment TEXT,                         -- Review text
  created_at TIMESTAMP,
  UNIQUE KEY (order_id, customer_id)   -- Prevents duplicate reviews
)
```

## API Endpoints

### Review Endpoints:
- `POST /reviews` - Submit a review (requires authentication, customer role)
  - Body: `{ artwork_id, rating, artist_rating, comment }`
  - Validates purchase before accepting
  
- `GET /reviews/artwork/:artworkId` - Get all reviews for an artwork
  
- `GET /reviews/user/:userId` - Get all reviews by a user

- `GET /reviews/can-review/:artworkId` - Check if current user can review artwork (NEW)
  - Response: `{ canReview: true/false, reason?: string }`

## Rating Calculations

### Artwork Rating:
- Average of all `rating` values for that artwork
- Updates automatically when new review is submitted

### Artist Rating:
- Average of all `artist_rating` values from reviews where artist_rating is provided
- Only considers reviews for orders linked to that artist
- Updates automatically when new review with artist_rating is submitted

## Security Features

1. **Authentication Required**: Must be logged in to submit reviews
2. **Role-Based Access**: Only customers can submit reviews (not artists or admins)
3. **Purchase Verification**: Validates actual purchase of specific artwork
4. **Delivery Confirmation**: Order must be "delivered" status
5. **One Review Per Purchase**: Unique constraint prevents duplicate reviews
6. **Data Validation**: 
   - Ratings must be 1-5
   - Artwork ID must exist
   - Order must belong to requesting user

## Testing Instructions

1. **Start the servers**:
   ```bash
   # Backend
   node server/server.js
   
   # Frontend
   cd client
   npm start
   ```

2. **Test Purchase Verification**:
   - Login as a customer
   - Try to review an artwork you haven't purchased → Should show info message
   - Purchase an artwork
   - Change order status to "delivered" (as admin)
   - Review form should now appear on artwork detail page

3. **Test Rating System**:
   - Submit a review with both artwork and artist ratings
   - Verify ratings appear in review list with 🎨 and 👨‍🎨 icons
   - Check that artist rating updates on artist profile page

4. **Test Duplicate Prevention**:
   - Try to submit a second review for same artwork → Should show "already reviewed" message

## Files Modified

### Backend:
- `server/controllers/review.controller.js` - Enhanced review logic
- `server/routes/review.routes.js` - Added new route
- `server/database/init-db.js` - Updated schema
- `server/database/add-artist-rating-column.js` - Migration script (NEW)

### Frontend:
- `client/src/services/api.js` - Updated API calls
- `client/src/pages/ArtworkDetailPage.js` - Enhanced review UI

## Benefits

1. **Trust & Authenticity**: Only verified buyers can review
2. **Better Artist Feedback**: Separate ratings for artwork quality vs. artist service
3. **Prevents Spam**: Purchase requirement prevents fake reviews
4. **Fair Ratings**: Artist ratings based on actual customer experiences
5. **Transparency**: Clear indication of who can and cannot review

## Future Enhancements (Optional)

- Add review moderation system
- Allow customers to upload photos with reviews
- Add "helpful" votes on reviews
- Email notification to artist when reviewed
- Response system for artists to reply to reviews
