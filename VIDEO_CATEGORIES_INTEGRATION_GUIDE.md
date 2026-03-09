# Video Categories Integration - Complete Guide

## Overview
This document provides a comprehensive guide for the integration of 32 video categories into N3uralia360's existing environments gallery system.

## Implementation Status

### ✅ Completed
1. **Database Setup** - 32 video categories seeded into Supabase `categories` table
2. **Component Updates** - `environments-page-client.tsx` updated to fetch and display video categories
3. **API Endpoints** - Created endpoints for category fetching and video uploads
4. **Upload Flow** - Video upload system with category selection and Backblaze path generation
5. **Admin Panel** - `/admin/videos` page with category-based upload interface

## Architecture Overview

### Database Schema
```
categories table:
├── id (UUID)
├── name (String) - Category name
├── description (Text) - Category description
└── created_at (Timestamp)

images table (modified):
├── id (UUID)
├── title (String)
├── file_path (String) - VIDS/Categories/[PARENT]/[CATEGORY]/[FILENAME]
├── original_url (String) - Backblaze URL
├── image_format (String) - 'video'
├── content_category (String) - 'video'
├── category_id (UUID) - Foreign key to categories
├── active (Boolean)
└── created_at (Timestamp)
```

### 32 Video Categories

**NATURE (4)**
- Ocean-Surreal
- Ocean-Underwater-Life
- Insects
- Beads

**CULTURE (14)**
- Turkey, Japan, Halloween, Indonesia-Tribes, Thailand, Australia
- Indonesian-Temples, Africa, Chile-Tribes, Argentina-Rio
- Korea, Galleries, Vietnam-Theatre, India-Taj-Mahal

**MYTHIC (2)**
- Mythic-Indonesia
- Mythic-Chile

**ART (11)**
- Bosch-Graspher, Faces, Golden-Objects, Shapes, Children
- Architecture, Silver-Techno, Bifi-Geometry, Tunnels, Uncategorized

## User Journey: Video Upload & Display

### Step 1: Admin Uploads Video
1. Navigate to `/admin/videos`
2. Select category from grouped dropdown
3. Enter video title
4. Select video file (MP4, WebM, MOV, etc.)
5. Click "Upload Video"

### Step 2: System Processing
1. API validates file is video format
2. Maps category to parent folder (Nature/Culture/Mythic/Art)
3. Generates Backblaze path: `VIDS/Categories/[PARENT]/[CATEGORY]/[FILENAME]`
4. Creates database record with:
   - Title
   - File path
   - Category ID
   - Format: 'video'
   - Content category: 'video'

### Step 3: Upload to Backblaze
1. API returns suggested Backblaze path
2. Admin uses Backblaze B2 web interface to:
   - Navigate to folder structure
   - Upload video file to exact path
3. Video becomes accessible via public URL

### Step 4: User Browsing Gallery
1. User visits `/environments` page
2. Component fetches 32 video categories from `/api/categories/all`
3. Categories appended to existing Nature/Culture/Mythic/Art sections
4. User sees new video categories in navigation carousel
5. User clicks video thumbnail → navigates to `/environments/[id]`
6. Video detail page loads with player and related videos

## API Endpoints

### GET /api/categories/all
Fetches all 32 video categories from database
```json
{
  "success": true,
  "categories": [
    { "id": "uuid", "name": "Ocean-Surreal", "description": "..." },
    ...
  ],
  "total": 32
}
```

### POST /api/videos/upload
Uploads video and creates database record
```json
{
  "success": true,
  "video": { "id": "...", "title": "...", ... },
  "uploadPath": "VIDS/Categories/Nature/Ocean-Surreal/video.mp4",
  "message": "Video uploaded successfully..."
}
```

## File Structure

### New Files Created
- `/app/api/categories/all/route.ts` - Fetch all categories
- `/app/api/videos/upload/route.ts` - Handle video uploads
- `/components/admin-video-upload.tsx` - Admin upload interface
- `/scripts/seed-video-categories.sql` - Database migration
- `/BACKBLAZE_VIDEO_CATEGORIES.md` - Backblaze organization guide

### Updated Files
- `/components/environments-page-client.tsx` - Added category fetching logic
- `/app/admin/videos/page.tsx` - Replaced with category-based interface

## Testing Checklist

### Database
- [ ] Verify 32 categories in `categories` table
- [ ] Check category names match expected values
- [ ] Confirm descriptions are populated

### Frontend
- [ ] Load `/environments` page
- [ ] Verify new video categories appear in Nature/Culture/Mythic/Art sections
- [ ] Test category navigation (click carousel arrows)
- [ ] Verify responsive design on mobile/tablet

### Admin Interface
- [ ] Navigate to `/admin/videos`
- [ ] Verify all 32 categories appear in dropdown
- [ ] Upload test video successfully
- [ ] Confirm database record created
- [ ] Verify Backblaze path is correct format

### Integration
- [ ] Upload video to Backblaze at provided path
- [ ] Verify video appears in gallery
- [ ] Click video thumbnail
- [ ] Verify video plays in detail view
- [ ] Test related videos from same category
- [ ] Confirm video persists after page refresh

## Backblaze Setup Instructions

1. **Create Folder Structure**
   ```
   VIDS/Categories/
   ├── Nature/ (Ocean-Surreal, Ocean-Underwater-Life, Insects, Beads)
   ├── Culture/ (14 categories)
   ├── Mythic/ (Mythic-Indonesia, Mythic-Chile)
   └── Art/ (11 categories)
   ```

2. **Set Public Access**
   - Ensure all folders/files are publicly readable
   - Get public URL format from B2 interface

3. **Upload Workflow**
   - Use web interface or Backblaze CLI
   - Upload to exact path specified by admin panel

## Performance Considerations

- **Category Fetching**: Lightweight query, minimal overhead
- **Video Files**: Stored in Backblaze, no storage cost on servers
- **Database**: Only metadata stored, small record size
- **Caching**: Consider caching category list in future for performance

## Security Notes

- Admin page at `/admin/videos` - add authentication middleware if not present
- File validation: Only accepts video MIME types
- Category validation: Ensures category exists before creating record
- Database queries: Parameterized to prevent SQL injection

## Future Enhancements

1. **Bulk Upload** - Upload multiple videos at once
2. **Category Management** - Create/edit categories from admin panel
3. **Video Metadata** - Add duration, resolution, file size to database
4. **Analytics** - Track video views and engagement
5. **Transcoding** - Auto-transcode videos to multiple formats
6. **Thumbnails** - Auto-generate video thumbnails
7. **Tags** - Add tags within categories for better organization

## Troubleshooting

### Categories Not Appearing
- Check database for seeded categories
- Verify `/api/categories/all` returns data
- Check browser console for fetch errors

### Upload Fails
- Verify file is valid video format
- Check category exists in database
- Check Backblaze credentials in environment

### Videos Not Playing
- Verify Backblaze URL format is correct
- Check file uploaded to Backblaze at exact path
- Verify Backblaze files are publicly readable
- Check browser console for CORS errors

## Support & Documentation

- Backblaze Organization: `/BACKBLAZE_VIDEO_CATEGORIES.md`
- Database Migration: `/scripts/seed-video-categories.sql`
- Admin Component: `/components/admin-video-upload.tsx`
- API Docs: Check individual route.ts files for comments
