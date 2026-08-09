"""
Data Sanitization Utility
Strips malicious tags and characters before storage to prevent XSS and SQL injection.
"""
import re
import html

class Sanitizer:
    @staticmethod
    def sanitize_text(text: str) -> str:
        if not text:
            return text
            
        # 1. Strip script tags completely (including content)
        text = re.sub(r'<script.*?>.*?</script>', '', text, flags=re.IGNORECASE | re.DOTALL)
        
        # 2. Strip standard HTML tags but keep content
        text = re.sub(r'<[^>]+>', '', text)
        
        # 3. Escape HTML entities (e.g., converts < to &lt;)
        text = html.escape(text)
        
        # 4. Remove common SQL injection markers or escape them
        # (Though parameterized queries via SQLAlchemy handle real SQLi, it's good defense-in-depth)
        sql_chars = ["'", '"', ";", "--", "/*", "*/"]
        for char in sql_chars:
            text = text.replace(char, f"&#{ord(char[0])};" if len(char) == 1 else "")
            
        return text.strip()
