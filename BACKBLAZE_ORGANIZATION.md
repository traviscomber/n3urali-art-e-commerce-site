# Backblaze Storage Organization Guide

## Folder Structure

```
Neuraliart/
├── PICS/
│   ├── Environments/
│   ├── Realities/
│   ├── Studio/
│   └── [other image categories]
└── VIDS/
    ├── Theatre/
    ├── Environments/
    ├── Studio/
    └── [other video categories]
```

## URL Format

### Picture URLs
```
https://f005.backblazeb2.com/file/Neuraliart/PICS/[CATEGORY]/[FILENAME].jpg
```

### Video URLs
```
https://f005.backblazeb2.com/file/Neuraliart/VIDS/[CATEGORY]/[FILENAME].mov
```

## Database Storage

In the `images` table, store:

1. **file_path**: Relative path from Neuraliart root
   - Example: `PICS/Environments/dome-01.jpg`
   - Example: `VIDS/Theatre/WebBackdrop360-4.mov`

2. **original_url**: Full Backblaze URL
   - For images: Points to PICS folder
   - For videos: Points to VIDS folder

3. **image_format**: Specifies type
   - `standard` for regular images
   - `equirectangular` for 360° panoramas
   - `video` for video files

4. **content_category**: Categorizes content
   - `theatre`, `environments`, `studio`, `realities`, etc.

## Insertion Examples

### Standard Image
```sql
INSERT INTO images (
  id, title, file_path, original_url, 
  image_format, content_category, active
) VALUES (
  gen_random_uuid(),
  'Dome Environments',
  'PICS/Environments/dome-01.jpg',
  'https://f005.backblazeb2.com/file/Neuraliart/PICS/Environments/dome-01.jpg',
  'standard',
  'environments',
  true
);
```

### Theatre Video (360°)
```sql
INSERT INTO images (
  id, title, file_path, original_url,
  image_format, content_category, active
) VALUES (
  gen_random_uuid(),
  'Immersive Worlds',
  'VIDS/Theatre/WebBackdrop360-4.mov',
  'https://f005.backblazeb2.com/file/Neuraliart/VIDS/Theatre/WebBackdrop360-4.mov',
  'equirectangular',
  'theatre',
  true
);
```

## Benefits of This Structure

1. **Clear Organization**: Easy to find files in Backblaze
2. **Scalability**: Easy to add new categories
3. **Database Efficiency**: Can filter by folder path
4. **API Flexibility**: Can generate URLs programmatically from file_path
5. **Backup-friendly**: Easier to organize backups

## Migration Path

When uploading new content:
1. Create folder in Backblaze (PICS/[CATEGORY] or VIDS/[CATEGORY])
2. Upload files to appropriate folder
3. Add entries to images table with correct file_path and original_url
4. Admin panel will automatically display them correctly
