#!/usr/bin/env python3
"""Setup script for initializing the AthNexus Vector Database."""

from __future__ import annotations

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Add backend to path
sys.path.insert(0, str(BASE_DIR))


def setup_vector_db() -> None:
    """Initialize and setup the vector database."""
    print("=" * 60)
    print("AthNexus Vector Database Setup")
    print("=" * 60)
    print()

    try:
        from vector_db import initialize_vector_db, get_collection_stats

        print("Initializing vector database with sample data...")
        print()

        results = initialize_vector_db()

        print("✓ Vector database initialization complete!")
        print()
        print("Documents added per collection:")
        for collection, count in results.items():
            print(f"  • {collection}: {count} documents")

        print()
        print("Collection statistics:")
        stats = get_collection_stats()
        for collection, info in stats.items():
            doc_count = info.get("document_count", 0)
            print(f"  • {collection}: {doc_count} documents indexed")

        print()
        print("=" * 60)
        print("Setup Complete!")
        print("=" * 60)
        print()
        print("The vector database is now ready for use.")
        print("Start the backend server with: python main.py")
        print()

    except ImportError as e:
        print(f"✗ Error: Missing required package: {e}")
        print()
        print("Please install dependencies first:")
        print("  pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"✗ Error during setup: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    setup_vector_db()
