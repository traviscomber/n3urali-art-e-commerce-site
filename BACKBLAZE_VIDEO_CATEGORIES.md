# Backblaze Video Categories Organization

## Overview
This document outlines the folder structure for organizing 32 video categories in Backblaze, mapped to 4 parent categories (Nature, Culture, Mythic, Art).

## Backblaze Folder Structure

```
Neuraliart/VIDS/Categories/
├── Nature/
│   ├── Ocean-Surreal/
│   ├── Ocean-Underwater-Life/
│   ├── Insects/
│   └── Beads/
├── Culture/
│   ├── Turkey/
│   ├── Japan/
│   ├── Halloween/
│   ├── Indonesia-Tribes/
│   ├── Thailand/
│   ├── Australia/
│   ├── Indonesian-Temples/
│   ├── Africa/
│   ├── Chile-Tribes/
│   ├── Argentina-Rio/
│   ├── Korea/
│   ├── Galleries/
│   ├── Vietnam-Theatre/
│   └── India-Taj-Mahal/
├── Mythic/
│   ├── Mythic-Indonesia/
│   └── Mythic-Chile/
└── Art/
    ├── Bosch-Graspher/
    ├── Faces/
    ├── Golden-Objects/
    ├── Shapes/
    ├── Children/
    ├── Architecture/
    ├── Silver-Techno/
    ├── Bifi-Geometry/
    ├── Tunnels/
    └── Uncategorized/
```

## URL Format for Videos

```
https://f005.backblazeb2.com/file/Neuraliart/VIDS/Categories/[PARENT]/[SUBCATEGORY]/[FILENAME].mov
```

### Examples:
- `https://f005.backblazeb2.com/file/Neuraliart/VIDS/Categories/Nature/Ocean-Surreal/ocean-01.mov`
- `https://f005.backblazeb2.com/file/Neuraliart/VIDS/Categories/Culture/Japan/temple-360.mov`
- `https://f005.backblazeb2.com/file/Neuraliart/VIDS/Categories/Art/Architecture/dome-experience.mov`

## Database Integration

### File Path Storage
Store in `images.file_path`:
```
VIDS/Categories/[PARENT]/[SUBCATEGORY]/[FILENAME].mov
```

Example entries:
- `VIDS/Categories/Nature/Ocean-Surreal/ocean-01.mov`
- `VIDS/Categories/Culture/Japan/temple-360.mov`
- `VIDS/Categories/Art/Bosch-Graspher/surreal-01.mov`

### SQL Insertion Template

```sql
INSERT INTO images (
  id, title, file_path, original_url,
  image_format, content_category, category_id, active
) VALUES (
  gen_random_uuid(),
  'Video Title Here',
  'VIDS/Categories/Nature/Ocean-Surreal/ocean-01.mov',
  'https://f005.backblazeb2.com/file/Neuraliart/VIDS/Categories/Nature/Ocean-Surreal/ocean-01.mov',
  'video',
  'video',
  (SELECT id FROM categories WHERE name = 'Ocean-Surreal'),
  true
);
```

## Category Mapping

### NATURE (4 categories)
- Ocean-Surreal
- Ocean-Underwater-Life
- Insects
- Beads

### CULTURE (14 categories)
- Turkey
- Japan
- Halloween
- Indonesia-Tribes
- Thailand
- Australia
- Indonesian-Temples
- Africa
- Chile-Tribes
- Argentina-Rio
- Korea
- Galleries
- Vietnam-Theatre
- India-Taj-Mahal

### MYTHIC (2 categories)
- Mythic-Indonesia
- Mythic-Chile

### ART (11 categories)
- Bosch-Graspher
- Faces
- Golden-Objects
- Shapes
- Children
- Architecture
- Silver-Techno
- Bifi-Geometry
- Tunnels
- Uncategorized

## Upload Workflow

1. **Create Folders** in Backblaze B2 following the structure above
2. **Upload Videos** to appropriate subcategory folder
3. **Add to Database** using the SQL template above, referencing the correct category_id
4. **Verify** videos appear in environments gallery via existing video player flow

## Integration with Existing Flow

- Videos follow the same click-to-showcase flow as environments
- Existing `/environments/[id]` page displays videos from any category
- Same `environment-video-detail-client.tsx` component handles video playback
- Admin panel can filter by category when managing videos
- No new pages needed - videos integrate seamlessly

## Notes

- Parent folder names (Nature, Culture, Mythic, Art) are organizational only - database uses specific subcategory names
- All 32 categories must be seeded in database before uploading videos
- Videos stored with `image_format: 'video'` and `content_category: 'video'`
- Use existing category_id foreign key to link videos to categories table
