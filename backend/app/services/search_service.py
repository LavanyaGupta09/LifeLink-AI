import asyncio
from typing import List
from duckduckgo_search import DDGS

async def fetch_healthline_context(symptoms: List[str]) -> str:
    """
    Executes a web search on Healthline.com for the given symptoms.
    Returns a concatenated string of the top snippets.
    """
    if not symptoms:
        return "No symptoms provided."
        
    query = f"site:healthline.com {' '.join(symptoms)}"
    try:
        with DDGS() as ddgs:
            results = ddgs.text(query, max_results=3)
            
        if not results:
            return "No specific healthline context found."
            
        snippets = [f"{r.get('title', '')}: {r.get('body', '')}" for r in results]
        return " | ".join(snippets)
    except Exception as e:
        print(f"Healthline search failed: {e}")
        return "Live search unavailable at the moment."
