#!/usr/bin/env python3
"""
Create THEATRE/Categories/ folder structure in Backblaze B2
Creates 32 equirectangular photo category folders
"""

import os
import json
import urllib.request
import urllib.error
import base64

# Backblaze B2 credentials
API_KEY = os.getenv('BACKBLAZE_API_KEY')
APP_KEY = os.getenv('BACKBLAZE_APPLICATION_KEY')
BUCKET_NAME = os.getenv('BACKBLAZE_BUCKET_NAME', 'Neuraliart')

# 32 Theatre photo categories
CATEGORIES = {
    'Nature': ['Ocean-Surreal', 'Ocean-Underwater-Life', 'Insects', 'Beads'],
    'Culture': ['Turkey', 'Japan', 'Halloween', 'Indonesia-Tribes', 'Thailand', 'Australia', 
                'Indonesian-Temples', 'Africa', 'Chile-Tribes', 'Argentina-Rio', 'Korea', 
                'Galleries', 'Vietnam-Theatre', 'India-Taj-Mahal'],
    'Mythic': ['Mythic-Indonesia', 'Mythic-Chile'],
    'Art': ['Bosch-Graspher', 'Faces', 'Golden-Objects', 'Shapes', 'Children', 'Architecture', 
            'Silver-Techno', 'Bifi-Geometry', 'Tunnels', 'Uncategorized']
}

def make_request(url, method='GET', headers=None, data=None):
    """Make HTTP request"""
    if headers is None:
        headers = {}
    
    try:
        if data is not None:
            data = json.dumps(data).encode('utf-8')
            headers['Content-Type'] = 'application/json'
        
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f'HTTP Error {e.code}: {error_body}')
        return None
    except Exception as e:
        print(f'Request error: {e}')
        return None

def get_b2_auth():
    """Authenticate with B2"""
    url = 'https://api.backblazeb2.com/b2api/v2/b2_authorize_account'
    credentials = f'{API_KEY}:{APP_KEY}'
    encoded = base64.b64encode(credentials.encode()).decode()
    headers = {'Authorization': f'Basic {encoded}'}
    
    response = make_request(url, 'GET', headers=headers)
    if not response:
        print('ERROR: Failed to authenticate with B2')
        return None
    return response

def get_bucket_id(auth):
    """Get bucket ID"""
    url = f"{auth['apiUrl']}/b2api/v2/b2_list_buckets"
    headers = {'Authorization': auth['authorizationToken']}
    data = {'accountId': auth['accountId']}
    
    response = make_request(url, 'POST', headers=headers, data=data)
    if not response or 'buckets' not in response:
        print('ERROR: Failed to list buckets')
        return None
    
    for bucket in response['buckets']:
        if bucket['bucketName'] == BUCKET_NAME:
            return bucket['bucketId']
    
    print(f'ERROR: Bucket {BUCKET_NAME} not found')
    return None

def create_folder(auth, bucket_id, folder_path):
    """Create folder by uploading marker file"""
    url = f"{auth['apiUrl']}/b2api/v2/b2_get_upload_url"
    headers = {'Authorization': auth['authorizationToken']}
    data = {'bucketId': bucket_id}
    
    upload_info = make_request(url, 'POST', headers=headers, data=data)
    if not upload_info:
        return False
    
    # Upload .folder_marker to create folder
    marker_file = f'{folder_path}/.folder_marker'
    file_headers = {
        'Authorization': upload_info['authorizationToken'],
        'X-Bz-File-Name': marker_file,
        'Content-Type': 'text/plain',
        'X-Bz-Content-Sha1': 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
    }
    
    try:
        req = urllib.request.Request(upload_info['uploadUrl'], data=b'', headers=file_headers, method='POST')
        with urllib.request.urlopen(req) as response:
            response.read()
            return True
    except Exception as e:
        print(f'Failed to create {folder_path}: {e}')
        return False

def main():
    print('Creating THEATRE/Categories/ folder structure in Backblaze...\n')
    
    if not API_KEY or not APP_KEY:
        print('ERROR: Missing BACKBLAZE_API_KEY or BACKBLAZE_APPLICATION_KEY')
        return
    
    # Authenticate
    print('Authenticating with B2...')
    auth = get_b2_auth()
    if not auth:
        return
    print('✓ Authenticated\n')
    
    # Get bucket ID
    print('Getting bucket ID...')
    bucket_id = get_bucket_id(auth)
    if not bucket_id:
        return
    print(f'✓ Got bucket ID\n')
    
    # Create folders
    total = sum(len(subs) for subs in CATEGORIES.values())
    created = 0
    failed = 0
    
    print(f'Creating {total} THEATRE folders:\n')
    
    for parent, subcategories in CATEGORIES.items():
        print(f'{parent}:')
        for subcategory in subcategories:
            folder_path = f'THEATRE/Categories/{parent}/{subcategory}'
            if create_folder(auth, bucket_id, folder_path):
                print(f'  ✓ {folder_path}')
                created += 1
            else:
                print(f'  ✗ {folder_path}')
                failed += 1
        print()
    
    print(f'\nSummary:')
    print(f'  Total: {total}')
    print(f'  Created: {created}')
    print(f'  Failed: {failed}')

if __name__ == '__main__':
    main()
