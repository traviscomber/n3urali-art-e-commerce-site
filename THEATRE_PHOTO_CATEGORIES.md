# Theatre Photo Categories System

## Overview

The theatre photo system mirrors the video categories structure but for equirectangular panoramic images used in Theatre Mode. This creates a unified categorization system across all content types.

## Architecture

### Structure
- **32 theatre photo categories** organized into **4 parent categories**
- Each category maps directly to the corresponding video category
- All stored with prefix `Theatre-` in the database for clear identification
- Theatre Mode automatically fetches and groups these images

### Parent Categories

#### 1. Nature (4 categories)
- Theatre-Ocean-Surreal
- Theatre-Ocean-Underwater-Life
- Theatre-Insects
- Theatre-Beads

#### 2. Culture (14 categories)
- Theatre-Turkey
- Theatre-Japan
- Theatre-Halloween
- Theatre-Indonesia-Tribes
- Theatre-Thailand
- Theatre-Australia
- Theatre-Indonesian-Temples
- Theatre-Africa
- Theatre-Chile-Tribes
- Theatre-Argentina-Rio
- Theatre-Korea
- Theatre-Galleries
- Theatre-Vietnam-Theatre
- Theatre-India-Taj-Mahal

#### 3. Mythic (2 categories)
- Theatre-Mythic-Indonesia
- Theatre-Mythic-Chile

#### 4. Art (11 categories)
- Theatre-Bosch-Graspher
- Theatre-Faces
- Theatre-Golden-Objects
- Theatre-Shapes
- Theatre-Children
- Theatre-Architecture
- Theatre-Silver-Techno
- Theatre-Bifi-Geometry
- Theatre-Tunnels
- Theatre-Uncategorized

## File Structure

### Backblaze Organization
```
VIDS/Categories/Theatre/
├── Nature/
│   ├── Ocean-Surreal/
│   ├── Ocean-Underwater-Life/
│   ├── Insects/
│   └── Beads/
├── Culture/
│   ├── Turkey/
│   ├── Japan/
│   ├── ... (12 more)
├── Mythic/
│   ├── Mythic-Indonesia/
│   └── Mythic-Chile/
└── Art/
    ├── Bosch-Graspher/
    ├── Faces/
    ├── ... (9 more)
```

### Database Schema
Theatre photos are stored in the existing `images` table with:
- `image_format = 'equirectangular'`
- `content_category` = one of the 32 theatre category names (e.g., 'Theatre-Ocean-Surreal')
- `active = true` to be visible in Theatre Mode

## Admin Interface

### Access
- Navigate to `/admin/theatre-photos`
- Requires authentication

### Features

#### 1. Backblaze Folder Setup
- One-click button to create all 32 folders
- Progress tracking with success/failure reporting
- Automatic folder organization into parent categories

#### 2. Photo Upload
- Select category from dropdown (grouped by parent category)
- Upload equirectangular image (PNG, JPG, TIFF, WebP)
- Optional title and description
- Auto-upload to correct Backblaze path
- Database recording with category tagging

#### 3. Preview
- View uploaded photo immediately
- Preview in Theatre Mode to verify panoramic display

## APIs

### GET `/api/categories/theatre/all`
Fetches all 32 theatre photo categories from database, grouped by parent category.

**Response:**
```json
{
  "success": true,
  "categories": [array of all categories],
  "grouped": {
    "nature": [...],
    "culture": [...],
    "mythic": [...],
    "art": [...]
  }
}
```

### POST `/api/theatre-photos/upload`
Uploads equirectangular photo to Backblaze and records in database.

**Parameters:**
- `file` - Image file (multipart)
- `category` - Category name (e.g., 'Theatre-Ocean-Surreal')
- `title` - Optional image title
- `description` - Optional image description

**Response:**
```json
{
  "success": true,
  "image": {id, title, content_category},
  "downloadUrl": "https://...",
  "backblazePath": "VIDS/Categories/Theatre/..."
}
```

### POST `/api/admin/backblaze/create-theatre-folders`
Creates all 32 theatre photo folders in Backblaze.

**Response:**
```json
{
  "success": true,
  "summary": {
    "total": 32,
    "created": 32,
    "failed": 0
  },
  "results": {
    "success": [...],
    "failed": [...]
  }
}
```

## Theatre Mode Integration

### How Theatre Mode Uses Categories

1. **Fetching**: Theatre page queries equirectangular images grouped by category
2. **Display**: Shows first image from each category as tiles
3. **Grouping**: Related images (same category) auto-rotate every 30 seconds
4. **Tagging**: Images tagged with category for automatic grouping

### Related Images
When viewing a theatre photo:
- First tag (primary tag) represents the subcategory
- All images with the same primary tag rotate automatically
- Creates cohesive thematic experiences

## Workflow

### 1. Initial Setup
```bash
# Database migration (already seeded)
SELECT * FROM categories WHERE name LIKE 'Theatre-%'

# Create folders via admin
Go to /admin/theatre-photos
Click "Create 32 Theatre Photo Folders"
```

### 2. Upload Photos
```bash
# Go to admin page
/admin/theatre-photos

# Select category → Upload image → Auto-saves to Backblaze & database
```

### 3. View in Theatre Mode
```bash
# Theatre Mode automatically includes new photos
/theatre

# Photos appear grouped by category
# Auto-rotates related images every 30 seconds in fullscreen
```

## Best Practices

### Image Requirements
- **Format**: Equirectangular/panoramic projection
- **Resolution**: Minimum 4096x2048 for best quality
- **Aspect Ratio**: Must be 2:1 (standard equirectangular)
- **File Size**: Optimize for web (200MB max)

### Naming Convention
- Use descriptive titles
- Include location/subject in description
- Tags (primary tag) should match category for auto-grouping

### Organization
- Upload one image per visit or batch similar images
- Keep related images in the same category for auto-rotation
- Use descriptions to help viewers understand context

## Troubleshooting

### Folder Creation Fails
- Check Backblaze credentials in environment variables
- Verify bucket exists and is accessible
- Check B2 account permissions

### Upload Not Appearing
- Verify `active = true` in database
- Check image_format is 'equirectangular'
- Ensure category name is correct (Theatre-X format)
- Clear browser cache and refresh Theatre Mode

### Auto-Rotation Not Working
- Ensure images in same category have matching primary tags
- Check that at least 2 images exist in category
- Verify images are not in fullscreen viewer (only rotates when open)

## File References
- Database: `scripts/seed-theatre-photo-categories.sql`
- APIs: `/app/api/theatre-photos/upload`, `/app/api/categories/theatre/all`, `/app/api/admin/backblaze/create-theatre-folders`
- Components: `admin-theatre-photo-upload.tsx`, `create-theatre-folders-button.tsx`
- Admin Page: `/app/admin/theatre-photos/page.tsx`
- Theatre Integration: `/app/theatre/page.tsx`, `/components/theatre-player-client.tsx`
