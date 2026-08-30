#!/usr/bin/env python3
"""
MongoDB Collection Setup Script for Pharmacy Stock & Expiry Tracker
Reads credentials from .env file and creates all collections with indexes.
"""

import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING, DESCENDING, TEXT
from pymongo.errors import ConnectionFailure, OperationFailure

def load_env():
    """Load environment variables from .env file."""
    # Try current directory first, then parent directory
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if not os.path.exists(env_path):
        env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    
    if not os.path.exists(env_path):
        print(f"Error: .env file not found in {os.path.dirname(__file__)} or parent directory")
        sys.exit(1)
    
    load_dotenv(env_path, override=True)
    
    uri = os.getenv('MONGODB_URI')
    db_name = os.getenv('MONGODB_DB_NAME')
    
    if not uri or not db_name:
        print("Error: MONGODB_URI and MONGODB_DB_NAME must be set in .env file")
        sys.exit(1)
    
    return uri, db_name

def connect_mongo(uri):
    """Connect to MongoDB Atlas."""
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("Successfully connected to MongoDB Atlas")
        return client
    except ConnectionFailure as e:
        print(f"Error connecting to MongoDB: {e}")
        sys.exit(1)

def create_collections_and_indexes(db):
    """Create all collections with indexes."""
    
    collections_config = {
        'users': {
            'indexes': [
                {'keys': [('email', ASCENDING)], 'options': {'unique': True}},
                {'keys': [('role', ASCENDING)]},
                {'keys': [('shopId', ASCENDING)]},
            ]
        },
        'shops': {
            'indexes': [
                {'keys': [('shopName', ASCENDING)]},
                {'keys': [('gstNumber', ASCENDING)]},
            ]
        },
        'medicines': {
            'indexes': [
                {'keys': [('vendorId', ASCENDING)]},
                {'keys': [('shopId', ASCENDING)]},
                {'keys': [('expiryDate', ASCENDING)]},
                {'keys': [('name', TEXT), ('genericName', TEXT)]},
                {'keys': [('quantityInStock', ASCENDING)]},
                {'keys': [('medicineType', ASCENDING)]},
                {'keys': [('quantityUnit', ASCENDING)]},
                {'keys': [('medicineSystem', ASCENDING)]},
                {'keys': [('codeNumber', ASCENDING)], 'options': {'unique': True}},
                {'keys': [('manufactureDate', ASCENDING)]},
            ]
        },
        'orders': {
            'indexes': [
                {'keys': [('customerId', ASCENDING)]},
                {'keys': [('orderDate', DESCENDING)]},
            ]
        },
        'order_items': {
            'indexes': [
                {'keys': [('orderId', ASCENDING)]},
                {'keys': [('medicineId', ASCENDING)]},
            ]
        },
        'payments': {
            'indexes': [
                {'keys': [('vendorId', ASCENDING)]},
                {'keys': [('paymentDate', DESCENDING)]},
            ]
        },
        'vendor_payments': {
            'indexes': [
                {'keys': [('vendorId', ASCENDING)]},
                {'keys': [('paymentDate', DESCENDING)]},
            ]
        },
        'expiry_logs': {
            'indexes': [
                {'keys': [('expiryDate', ASCENDING)]},
                {'keys': [('vendorId', ASCENDING)]},
                {'keys': [('status', ASCENDING)]},
            ]
        },
        'alternatives': {
            'indexes': [
                {'keys': [('originalMedicineId', ASCENDING)]},
                {'keys': [('alternativeMedicineId', ASCENDING)]},
            ]
        },
        'notifications': {
            'indexes': [
                {'keys': [('userId', ASCENDING)]},
                {'keys': [('isRead', ASCENDING)]},
                {'keys': [('createdAt', DESCENDING)]},
            ]
        },
        'supplies': {
            'indexes': [
                {'keys': [('medicineId', ASCENDING)]},
                {'keys': [('supplierId', ASCENDING)]},
                {'keys': [('supplyDate', DESCENDING)]},
                {'keys': [('batchNumber', ASCENDING)]},
            ]
        },
        'cart_items': {
            'indexes': [
                {'keys': [('userId', ASCENDING)]},
                {'keys': [('medicineId', ASCENDING)]},
            ]
        }
    }
    
    existing_collections = db.list_collection_names()
    
    for collection_name, config in collections_config.items():
        if collection_name not in existing_collections:
            print(f"Collection will be created on first insert: {collection_name}")
        else:
            print(f"Collection already exists: {collection_name}")
        
        # Create indexes (this also creates the collection if it doesn't exist)
        collection = db[collection_name]
        for index in config['indexes']:
            keys = index['keys']
            options = index.get('options', {})
            try:
                collection.create_index(keys, **options)
                print(f"  Created index on {collection_name}: {keys}")
            except OperationFailure as e:
                print(f"  Index may already exist on {collection_name}: {keys} - {e}")

def main():
    uri, db_name = load_env()
    client = connect_mongo(uri)
    
    db = client[db_name]
    print(f"Using database: {db_name}")
    
    create_collections_and_indexes(db)
    
    print("\nSetup complete!")
    print(f"Database: {db_name}")
    print(f"Collections: {db.list_collection_names()}")
    
    client.close()

if __name__ == '__main__':
    main()
