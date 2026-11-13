from pymongo import MongoClient
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')

ATLAS_URI = os.getenv('MONGODB_URI_ATLAS', 'mongodb+srv://goandstudyadmin:goandstudyadmin@goandstudycluster.4jz25t7.mongodb.net/?appName=goandstudycluster')
LOCAL_URI = os.getenv('MONGODB_URI_LOCAL', 'mongodb://localhost:27017/Pharmacy')
DB_NAME = os.getenv('MONGODB_DB_NAME', 'Pharmacy')

COLLECTIONS = [
    'users', 'shops', 'medicines', 'orders', 'orderitems',
    'cartitems', 'supplies', 'vendors', 'vendorpayments',
    'payments', 'notifications', 'expirylogs', 'alternatives'
]

def connect(uri):
    return MongoClient(uri, serverSelectionTimeoutMS=5000)

def migrate_collection(src_db, dst_db, collection_name, clear_dst=False):
    src_col = src_db[collection_name]
    dst_col = dst_db[collection_name]
    
    count = src_col.count_documents({})
    print(f"  Migrating {collection_name}: {count} documents...")
    
    if clear_dst:
        dst_col.delete_many({})
        print(f"    Cleared local collection")
    
    if count == 0:
        print(f"    Skipped (empty)")
        return 0
    
    docs = list(src_col.find({}))
    if docs:
        dst_col.insert_many(docs, ordered=False)
        print(f"    Inserted {len(docs)} documents")
        return len(docs)
    return 0

def main():
    print("🚀 Starting Atlas -> Local migration...")
    print(f"   Atlas: {ATLAS_URI.split('@')[0]}@***")
    print(f"   Local: {LOCAL_URI}")
    print(f"   DB: {DB_NAME}\n")
    
    atlas_client = None
    local_client = None
    
    try:
        atlas_client = connect(ATLAS_URI)
        atlas_client.server_info()
        print("✅ Connected to Atlas")
        
        local_client = connect(LOCAL_URI)
        local_client.server_info()
        print("✅ Connected to Local MongoDB\n")
        
        atlas_db = atlas_client[DB_NAME]
        local_db = local_client[DB_NAME]
        
        total = 0
        for col in COLLECTIONS:
            migrated = migrate_collection(atlas_db, local_db, col, clear_dst=True)
            total += migrated
        
        print(f"\n{'='*50}")
        print(f"✅ Migration complete! Total documents: {total}")
        print(f"{'='*50}")
        print("\nYou can now switch to college mode:")
        print("  .\\switch-db.bat college")
        print("  npm run dev")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
    finally:
        if atlas_client:
            atlas_client.close()
        if local_client:
            local_client.close()

if __name__ == '__main__':
    main()
