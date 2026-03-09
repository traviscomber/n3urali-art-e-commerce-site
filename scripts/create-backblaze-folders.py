#!/usr/bin/env python3
"""
Create all 32 video category folders in Backblaze B2
Uses B2 API to create the folder structure for video categories
"""

import os
import json
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Backblaze B2 credentials
APPLICATION_KEY_ID = os.getenv('BACKBLAZE_API_KEY')
APPLICATION_KEY = os.getenv('BACKBLAZE_APPLICATION_KEY')
BUCKET_NAME = os.getenv('BACKBLAZE_BUCKET_NAME', 'Neuraliart')

# 32 Video categories organized by parent category
CATEGORIES = {
    'Nature': ['Ocean-Surreal', 'Ocean-Underwater-Life', 'Insects', 'Beads'],
    'Culture': ['Turkey', 'Japan', 'Halloween', 'Indonesia-Tribes', 'Thailand', 'Australia', 
                'Indonesian-Temples', 'Africa', 'Chile-Tribes', 'Argentina-Rio', 'Korea', 
                'Galleries', 'Vietnam-Theatre', 'India-Taj-Mahal'],
    'Mythic': ['Mythic-Indonesia', 'Mythic-Chile'],
    'Art': ['Bosch-Graspher', 'Faces', 'Golden-Objects', 'Shapes', 'Children', 'Architecture', 
            'Silver-Techno', 'Bifi-Geometry', 'Tunnels', 'Uncategorized']
}

def get_b2_auth_token():
    """Authenticate with Backblaze B2 API"""
    auth_url = 'https://api.backblazeb2.com/b2api/v2/b2_authorize_account'
    
    try:
        response = requests.get(
            auth_url,
            auth=(APPLICATION_KEY_ID, APPLICATION_KEY)
        )
        response.raise_for_status()
        auth_data = response.json()
        return auth_data
    except requests.exceptions.RequestException as e:
        print(f'❌ Authentication failed: {e}')
        return None

def get_bucket_id(auth_data):
    """Get the bucket ID from account info"""
    account_id = auth_data['accountId']
    api_url = auth_data['apiUrl']
    auth_token = auth_data['authorizationToken']
    
    url = f'{api_url}/b2api/v2/b2_list_buckets'
    headers = {'Authorization': auth_token}
    params = {'accountId': account_id}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        buckets = response.json()['buckets']
        
        for bucket in buckets:
            if bucket['bucketName'] == BUCKET_NAME:
                return bucket['bucketId']
        
        print(f'❌ Bucket "{BUCKET_NAME}" not found')
        return None
    except requests.exceptions.RequestException as e:
        print(f'❌ Failed to get bucket ID: {e}')
        return None

def create_folder(auth_data, bucket_id, folder_path):
    """Create a folder in B2 by uploading an empty marker file"""
    account_id = auth_data['accountId']
    api_url = auth_data['apiUrl']
    auth_token = auth_data['authorizationToken']
    
    # Get upload URL
    url = f'{api_url}/b2api/v2/b2_get_upload_url'
    headers = {'Authorization': auth_token}
    data = {'bucketId': bucket_id}
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        upload_info = response.json()
        
        # Create .folder_marker file to represent folder
        marker_file = f'{folder_path}/.folder_marker'
        
        upload_url = upload_info['uploadUrl']
        upload_token = upload_info['authorizationToken']
        
        file_headers = {
            'Authorization': upload_token,
            'X-Bz-File-Name': marker_file,
            'Content-Type': 'text/plain',
            'X-Bz-Content-Sha1': 'da39a3ee5e6b4b0d3255bfef95601890afd80709',  # SHA1 of empty string
        }
        
        response = requests.post(
            upload_url,
            headers=file_headers,
            data=b''
        )
        response.raise_for_status()
        return True
    except requests.exceptions.RequestException as e:
        print(f'⚠️  Failed to create folder {folder_path}: {e}')
        return False

def main():
    print('🚀 Starting Backblaze folder creation...\n')
    
    # Check credentials
    if not APPLICATION_KEY_ID or not APPLICATION_KEY:
        print('❌ Error: Missing Backblaze credentials')
        print('   Set BACKBLAZE_API_KEY and BACKBLAZE_APPLICATION_KEY environment variables')
        return
    
    print(f'📦 Bucket: {BUCKET_NAME}')
    print(f'🔑 Using Application Key: {APPLICATION_KEY_ID[:10]}...\n')
    
    # Authenticate
    print('🔐 Authenticating with Backblaze...')
    auth_data = get_b2_auth_token()
    if not auth_data:
        return
    print('✅ Authentication successful\n')
    
    # Get bucket ID
    print('📍 Getting bucket ID...')
    bucket_id = get_bucket_id(auth_data)
    if not bucket_id:
        return
    print(f'✅ Bucket ID: {bucket_id}\n')
    
    # Create all folders
    total_folders = sum(len(subs) for subs in CATEGORIES.values())
    created = 0
    failed = 0
    
    print(f'📁 Creating {total_folders} folders...\n')
    
    for parent, subcategories in CATEGORIES.items():
        print(f'📂 {parent}:')
        for subcategory in subcategories:
            folder_path = f'VIDS/Categories/{parent}/{subcategory}'
            
            if create_folder(auth_data, bucket_id, folder_path):
                print(f'   ✅ {folder_path}')
                created += 1
            else:
                print(f'   ❌ {folder_path}')
                failed += 1
        print()
    
    # Summary
    print('=' * 60)
    print(f'📊 Summary:')
    print(f'   Total folders: {total_folders}')
    print(f'   Created: {created}')
    print(f'   Failed: {failed}')
    
    if failed == 0:
        print('\n✨ All folders created successfully!')
    else:
        print(f'\n⚠️  {failed} folders failed to create')

if __name__ == '__main__':
    main()
