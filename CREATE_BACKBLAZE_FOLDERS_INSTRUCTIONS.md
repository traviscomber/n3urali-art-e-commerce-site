# How to Create Video Category Folders in Backblaze

The 32 video category folders are NOT created automatically. Follow these steps to create them:

## Option 1: Automated Script (Recommended)

### Prerequisites
1. Get your Backblaze B2 credentials:
   - Log in to your Backblaze B2 account
   - Go to App Keys section
   - Create an application key with permissions to write to files
   - Copy: `Application Key ID` and `Application Key`

2. Set environment variables:
```bash
export B2_APPLICATION_KEY_ID="your_key_id"
export B2_APPLICATION_KEY="your_application_key"
export B2_BUCKET_NAME="Neuraliart"
```

3. Run the script:
```bash
npx ts-node scripts/create-backblaze-folders.ts
```

This will automatically create all 32 folders:
- `VIDS/Categories/Nature/Ocean-Surreal/`
- `VIDS/Categories/Nature/Ocean-Underwater-Life/`
- `VIDS/Categories/Nature/Insects/`
- ... (and 29 more)

## Option 2: Manual Creation in Backblaze Web Interface

If you prefer manual creation, create these 32 folders in your Backblaze bucket:

### Nature (4 folders)
- `VIDS/Categories/Nature/Ocean-Surreal/`
- `VIDS/Categories/Nature/Ocean-Underwater-Life/`
- `VIDS/Categories/Nature/Insects/`
- `VIDS/Categories/Nature/Beads/`

### Culture (14 folders)
- `VIDS/Categories/Culture/Turkey/`
- `VIDS/Categories/Culture/Japan/`
- `VIDS/Categories/Culture/Halloween/`
- `VIDS/Categories/Culture/Indonesia-Tribes/`
- `VIDS/Categories/Culture/Thailand/`
- `VIDS/Categories/Culture/Australia/`
- `VIDS/Categories/Culture/Indonesian-Temples/`
- `VIDS/Categories/Culture/Africa/`
- `VIDS/Categories/Culture/Chile-Tribes/`
- `VIDS/Categories/Culture/Argentina-Rio/`
- `VIDS/Categories/Culture/Korea/`
- `VIDS/Categories/Culture/Galleries/`
- `VIDS/Categories/Culture/Vietnam-Theatre/`
- `VIDS/Categories/Culture/India-Taj-Mahal/`

### Mythic (2 folders)
- `VIDS/Categories/Mythic/Mythic-Indonesia/`
- `VIDS/Categories/Mythic/Mythic-Chile/`

### Art (11 folders)
- `VIDS/Categories/Art/Bosch-Graspher/`
- `VIDS/Categories/Art/Faces/`
- `VIDS/Categories/Art/Golden-Objects/`
- `VIDS/Categories/Art/Shapes/`
- `VIDS/Categories/Art/Children/`
- `VIDS/Categories/Art/Architecture/`
- `VIDS/Categories/Art/Silver-Techno/`
- `VIDS/Categories/Art/Bifi-Geometry/`
- `VIDS/Categories/Art/Tunnels/`
- `VIDS/Categories/Art/Uncategorized/`

## Uploading Videos

After folders are created, you can:

1. **Via Admin Panel**: Go to `/admin/videos` and use the category dropdown to upload
2. **Direct B2**: Upload files to the appropriate folder using Backblaze web interface
3. **Via API**: Use `/api/videos/upload` endpoint to programmatically upload

### Video Upload Example

```
Category: Art → Bosch-Graspher
File: my-art-video.mp4

Will be stored at:
https://f005.backblazeb2.com/file/Neuraliart/VIDS/Categories/Art/Bosch-Graspher/my-art-video.mp4
```

## Verify Folders Created

After running the script or creating folders manually, verify:

1. Log into Backblaze B2 dashboard
2. Navigate to your bucket (Neuraliart)
3. Check the VIDS/Categories/ path
4. Confirm all parent folders exist (Nature, Culture, Mythic, Art)
5. Confirm all 32 subcategory folders exist

## Troubleshooting

**Script fails with "Bucket not found"**
- Verify `B2_BUCKET_NAME` matches your actual bucket name
- Check your B2 credentials are correct

**Script fails with authorization error**
- Verify your B2 App Key has permission to write files
- Check the key hasn't expired

**Folders appear in Backblaze but not in admin panel**
- Refresh your browser
- Check that the categories exist in Supabase `categories` table
- Verify `/api/categories/all` endpoint is working

## Next Steps

Once folders are created:
1. Navigate to `/admin/videos`
2. Select a category from the dropdown
3. Upload a test video file
4. Video will be stored in the correct Backblaze folder
5. Appears automatically in the environments gallery
