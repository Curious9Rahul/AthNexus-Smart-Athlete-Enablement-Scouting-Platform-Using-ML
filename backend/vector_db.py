"""Vector Database for RAG Chatbot using Chroma and Sentence Transformers."""

from __future__ import annotations

import os
import uuid
from pathlib import Path
from typing import Any

import chromadb

BASE_DIR = Path(__file__).resolve().parent
VECTOR_DB_DIR = BASE_DIR / "vector_db"
DATA_DIR = BASE_DIR / "data"

# Initialize Chroma client with persistent storage
chroma_client = chromadb.PersistentClient(path=str(VECTOR_DB_DIR))

# Collection names for different domains
EVENTS_COLLECTION = "sports_events"
ACADEMICS_COLLECTION = "college_academics"
TRAINING_COLLECTION = "training_guides"
NUTRITION_COLLECTION = "nutrition_advice"


def get_or_create_collection(name: str) -> Any:
    """Get or create a Chroma collection."""
    return chroma_client.get_or_create_collection(
        name=name,
        metadata={"hnsw:space": "cosine"},
    )


def clear_all_collections() -> None:
    """Clear all vector database collections."""
    try:
        chroma_client.delete_collection(name=EVENTS_COLLECTION)
    except Exception:
        pass
    try:
        chroma_client.delete_collection(name=ACADEMICS_COLLECTION)
    except Exception:
        pass
    try:
        chroma_client.delete_collection(name=TRAINING_COLLECTION)
    except Exception:
        pass
    try:
        chroma_client.delete_collection(name=NUTRITION_COLLECTION)
    except Exception:
        pass


def add_documents_to_collection(
    collection_name: str, documents: list[str], metadatas: list[dict[str, Any]] | None = None
) -> int:
    """Add documents to a collection with their embeddings.

    Args:
        collection_name: Name of the Chroma collection
        documents: List of document texts to add
        metadatas: Optional list of metadata dicts for each document

    Returns:
        Number of documents added
    """
    if not documents:
        return 0

    collection = get_or_create_collection(collection_name)

    # Generate unique IDs for documents
    ids = [str(uuid.uuid4()) for _ in documents]

    # If no metadata provided, create empty metadata
    if metadatas is None:
        metadatas = [{} for _ in documents]

    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
    )

    return len(documents)


def search_collection(
    collection_name: str, query: str, top_k: int = 4
) -> list[dict[str, Any]]:
    """Search a collection for documents similar to the query.

    Args:
        collection_name: Name of the Chroma collection
        query: Query text
        top_k: Number of top results to return

    Returns:
        List of search results with content and scores
    """
    collection = get_or_create_collection(collection_name)

    results = collection.query(
        query_texts=[query],
        n_results=top_k,
    )

    if not results or not results["documents"] or not results["documents"][0]:
        return []

    output = []
    for i, doc in enumerate(results["documents"][0]):
        distance = results["distances"][0][i] if results["distances"] else 0
        # Convert distance to similarity score (1 - distance for cosine)
        similarity = 1 - distance if distance else 0
        metadata = results["metadatas"][0][i] if results["metadatas"] else {}

        output.append(
            {
                "content": doc,
                "metadata": metadata,
                "similarity_score": round(max(0, similarity), 4),
            }
        )

    return output


def search_all_collections(query: str, top_k: int = 3) -> list[dict[str, Any]]:
    """Search all collections and return combined results.

    Args:
        query: Query text
        top_k: Number of top results per collection

    Returns:
        Combined list of search results from all collections
    """
    all_results = []

    for collection_name in [EVENTS_COLLECTION, ACADEMICS_COLLECTION, TRAINING_COLLECTION, NUTRITION_COLLECTION]:
        results = search_collection(collection_name, query, top_k)
        for result in results:
            result["collection"] = collection_name
            all_results.append(result)

    # Sort by similarity score and return top results overall
    all_results.sort(key=lambda x: x["similarity_score"], reverse=True)
    return all_results[:top_k * 2]


def get_collection_stats() -> dict[str, Any]:
    """Get statistics about all collections."""
    stats = {}

    for collection_name in [EVENTS_COLLECTION, ACADEMICS_COLLECTION, TRAINING_COLLECTION, NUTRITION_COLLECTION]:
        try:
            collection = get_or_create_collection(collection_name)
            count = collection.count()
            stats[collection_name] = {"document_count": count}
        except Exception as e:
            stats[collection_name] = {"error": str(e), "document_count": 0}

    return stats


def initialize_vector_db() -> dict[str, int]:
    """Initialize the vector database with sample data.

    Returns:
        Dictionary with counts of documents added per collection
    """
    results = {"sports_events": 0, "college_academics": 0, "training_guides": 0, "nutrition": 0}

    # Sports Events Collection
    sports_events = [
        {
            "content": "NCAA D1 Football - National Championship: The College Football Playoff Championship is held annually in January. Athletes compete for scholarships and professional opportunities.",
            "metadata": {"source": "sports_events", "category": "football", "level": "NCAA D1"},
        },
        {
            "content": "Inter-University Basketball Championship: Held annually in December, this championship brings together top college basketball teams from across the country for competitive play.",
            "metadata": {"source": "sports_events", "category": "basketball", "level": "inter-university"},
        },
        {
            "content": "Maharashtra State Football Trials: Under-21 players have the opportunity to participate in state-level trials held in Pune.",
            "metadata": {"source": "sports_events", "category": "football", "level": "state"},
        },
        {
            "content": "All India Athletics Championships: National athletics meet held annually featuring track and field events for college and university athletes.",
            "metadata": {"source": "sports_events", "category": "athletics", "level": "national"},
        },
        {
            "content": "National Cricket Tournament: Inter-university cricket championship featuring T20 and ODI format matches.",
            "metadata": {"source": "sports_events", "category": "cricket", "level": "national"},
        },
        {
            "content": "Swimming Championships: Annual competitive swimming event for college athletes with events in freestyle, backstroke, breaststroke, and butterfly.",
            "metadata": {"source": "sports_events", "category": "swimming", "level": "university"},
        },
    ]

    academics_docs = [
        {
            "content": "College Admission Requirements: Most universities require a minimum 3.0 GPA, standardized test scores (SAT/ACT), and demonstration of academic excellence. Athletes should maintain a balance between sports and academics.",
            "metadata": {"source": "college_academics", "topic": "admission", "level": "undergraduate"},
        },
        {
            "content": "NCAA Academic Eligibility: Student-athletes must maintain a minimum cumulative GPA of 2.3 and complete specific core courses to remain eligible for competition.",
            "metadata": {"source": "college_academics", "topic": "eligibility", "level": "NCAA"},
        },
        {
            "content": "Balancing Athletics and Studies: Student-athletes should dedicate time to both their sport and academics. Recommended study schedule: 2 hours of study for every 1 hour of class time.",
            "metadata": {"source": "college_academics", "topic": "time_management", "level": "general"},
        },
        {
            "content": "Scholarship Opportunities: Athletes with exceptional talent and academic records may receive full or partial scholarships covering tuition, room, board, and books.",
            "metadata": {"source": "college_academics", "topic": "financial_aid", "level": "scholarship"},
        },
        {
            "content": "College Rankings and Selection: Research universities based on academic reputation, athletic programs, coaching quality, and campus facilities. Visit campuses and speak with current athletes.",
            "metadata": {"source": "college_academics", "topic": "college_selection", "level": "general"},
        },
        {
            "content": "GPA Requirements for Athletes: Division 1 athletes need a minimum 2.3 GPA, Division 2 needs 2.2 GPA. Always aim higher to ensure academic progress and career opportunities beyond sports.",
            "metadata": {"source": "college_academics", "topic": "gpa_requirements", "level": "NCAA"},
        },
    ]

    training_docs = [
        {
            "content": "High-Intensity Interval Training (HIIT): Alternate between intense exercise bursts and recovery periods. Example: 30-second sprints followed by 90-second walks, repeated 8 times. Effective for improving cardiovascular fitness.",
            "metadata": {"source": "training_guides", "exercise_type": "cardio", "difficulty": "advanced"},
        },
        {
            "content": "Strength Training for Athletes: 3-4 sessions per week focusing on compound movements like squats, deadlifts, and bench press. Rest 48 hours between sessions for the same muscle groups.",
            "metadata": {"source": "training_guides", "exercise_type": "strength", "difficulty": "intermediate"},
        },
        {
            "content": "Flexibility and Mobility Work: Dedicate 15-20 minutes daily to stretching and mobility exercises. Include dynamic stretches before training and static stretches after. Improves range of motion and reduces injury risk.",
            "metadata": {"source": "training_guides", "exercise_type": "flexibility", "difficulty": "beginner"},
        },
        {
            "content": "Sport-Specific Training for Football: Focus on lateral movements, acceleration drills, and footwork. Include cone drills, ladder drills, and agility work 2-3 times weekly.",
            "metadata": {"source": "training_guides", "sport": "football", "exercise_type": "agility"},
        },
        {
            "content": "Basketball Training Program: Develop ball handling, shooting accuracy, and court positioning. Practice free throws, three-pointers, dribbling drills, and defensive movements daily.",
            "metadata": {"source": "training_guides", "sport": "basketball", "exercise_type": "sport-specific"},
        },
    ]

    nutrition_docs = [
        {
            "content": "Pre-Competition Nutrition: Eat 2-3 hours before competition. Include 40-60g carbs, 15-25g protein, and minimal fiber/fat. Examples: pasta with chicken, rice with lean meat, or peanut butter sandwich.",
            "metadata": {"source": "nutrition", "meal_type": "pre_competition", "timing": "2-3 hours before"},
        },
        {
            "content": "Post-Workout Recovery Nutrition: Within 30-60 minutes after exercise, consume carbs and protein (3:1 or 4:1 ratio). Example: chocolate milk, banana with peanut butter, or protein shake with fruit.",
            "metadata": {"source": "nutrition", "meal_type": "post_workout", "timing": "0-1 hour after"},
        },
        {
            "content": "Hydration Guidelines: Drink 16-20 oz of water 2-3 hours before exercise, 8-10 oz 15-20 minutes before, and 7-10 oz every 10-20 minutes during exercise lasting over 60 minutes.",
            "metadata": {"source": "nutrition", "topic": "hydration", "duration": "during exercise"},
        },
        {
            "content": "Daily Nutrition for Athletes: Consume 1.6-2.2g of protein per kg of body weight. Include complex carbs (60% of calories), healthy fats (20%), and colorful vegetables for micronutrients.",
            "metadata": {"source": "nutrition", "topic": "daily_intake", "macronutrient": "balanced"},
        },
        {
            "content": "Injury Recovery Nutrition: Increase anti-inflammatory foods like berries, fatty fish, leafy greens, and turmeric. Ensure adequate protein (1.8-2.2g per kg) for tissue repair.",
            "metadata": {"source": "nutrition", "topic": "injury_recovery", "focus": "anti-inflammatory"},
        },
    ]

    # Add all documents to their respective collections
    results["sports_events"] = add_documents_to_collection(
        EVENTS_COLLECTION,
        [doc["content"] for doc in sports_events],
        [doc["metadata"] for doc in sports_events],
    )

    results["college_academics"] = add_documents_to_collection(
        ACADEMICS_COLLECTION,
        [doc["content"] for doc in academics_docs],
        [doc["metadata"] for doc in academics_docs],
    )

    results["training_guides"] = add_documents_to_collection(
        TRAINING_COLLECTION,
        [doc["content"] for doc in training_docs],
        [doc["metadata"] for doc in training_docs],
    )

    results["nutrition"] = add_documents_to_collection(
        NUTRITION_COLLECTION,
        [doc["content"] for doc in nutrition_docs],
        [doc["metadata"] for doc in nutrition_docs],
    )

    return results
