import re
import json
from datetime import datetime

def extract_form_data(user_prompt: str, tool_calls: list = None):
    """
    Extract travel form data (city, dates, checklist) from user prompt.
    
    Args:
        user_prompt: The raw text input from the user.
        tool_calls: Optional list of tool calls from the LLM.
        
    Returns:
        dict: A dictionary containing extracted city, dates, and checklist items.
    """
    form_data = {
        "city": "",
        "startDate": "",
        "endDate": "",
        "checklist": {}
    }
    
    # 1. Extract city
    # Priority 1: From tool calls
    if tool_calls:
        for tool_call in tool_calls:
            function_args = json.loads(tool_call.function.arguments)
            if "city" in function_args:
                form_data["city"] = function_args["city"].lower()
                break
    
    # Priority 2: From regex (fallback or when no tool calls)
    if not form_data["city"]:
        cities = ['New York', 'Paris', 'London', 'Tokyo', 'Barcelona', 'Berlin', 'Rome', 'Sydney', 'Dubai', 'Mumbai', 'Toronto']
        for city in cities:
            if re.search(r'\b' + re.escape(city) + r'\b', user_prompt, re.IGNORECASE):
                form_data["city"] = city.lower()
                break
                
    # 2. Extract dates
    # Support ranges and single dates
    date_part = r'(?:\d{1,2}(?:st|nd|rd|th)?\s+\w+|\w+\s+\d{1,2}(?:st|nd|rd|th)?)'
    date_part_yr = r'(?:' + date_part + r'\s+\d{4}|\d{4}-\d{2}-\d{2})'
    sep = r'(?:\s+(?:to|til|till|until|and|-|–|—)\s+|\s*[-–—]\s*)'
    
    range_patterns = [
        r'from\s+(' + date_part_yr + r')' + sep + r'(' + date_part_yr + r')',
        r'from\s+(' + date_part + r')' + sep + r'(' + date_part + r')',
        r'between\s+(' + date_part + r')' + sep + r'(' + date_part + r')',
        r'(' + date_part_yr + r')' + sep + r'(' + date_part_yr + r')',
        r'(' + date_part + r')' + sep + r'(' + date_part + r')',
        r'(\d{4}-\d{2}-\d{2})\s*(?:to|til|till|until|-|–|—)\s*(\d{4}-\d{2}-\d{2})'
    ]
    
    single_patterns = [
        r'(?:on|at|by|around)\s+(' + date_part_yr + r')',
        r'(?:on|at|by|around)\s+(' + date_part + r')',
        r'\b(\d{4}-\d{2}-\d{2})\b'
    ]
    
    date_formats = [
        '%d %b %Y', '%d %B %Y', '%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%d %b', '%d %B', '%b %d', '%B %d'
    ]

    def parse_date(date_str):
        if not date_str:
            return None
        clean_str = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', date_str, flags=re.IGNORECASE)
        for fmt in date_formats:
            try:
                dt = datetime.strptime(clean_str, fmt)
                if dt.year == 1900:
                    now = datetime.now()
                    dt = dt.replace(year=now.year)
                return dt
            except ValueError:
                continue
        return None

    # Check ranges first
    for pattern in range_patterns:
        match = re.search(pattern, user_prompt, re.IGNORECASE)
        if match:
            start_dt = parse_date(match.group(1))
            end_dt = parse_date(match.group(2))
            if start_dt: form_data["startDate"] = start_dt.strftime('%Y-%m-%d')
            if end_dt: form_data["endDate"] = end_dt.strftime('%Y-%m-%d')
            if form_data["startDate"]: break

    # If no start date found, check single dates
    if not form_data["startDate"]:
        for pattern in single_patterns:
            match = re.search(pattern, user_prompt, re.IGNORECASE)
            if match:
                dt = parse_date(match.group(1))
                if dt:
                    form_data["startDate"] = dt.strftime('%Y-%m-%d')
                    break

    # 3. Extract checklist items
    checklist_keywords = {
        'passport': r'\b(?:passport|passports)\b',
        'visa': r'\b(?:visa|visas)\b',
        'tickets': r'\b(?:ticket|tickets|flight)\b',
        'hotel': r'\b(?:hotel|accommodation|booking)\b',
        'luggage': r'\b(?:luggage|baggage|bags?)\b',
        'insurance': r'\b(?:insurance)\b',
        'currency': r'\b(?:currency|money|cash)\b',
        'medications': r'\b(?:medication|medicine|pills)\b'
    }
    
    for item_id, pattern in checklist_keywords.items():
        if re.search(pattern, user_prompt, re.IGNORECASE):
            if re.search(r'\b(?:have|has|taken|packed|got|obtained|ready|done|check|checked)\b.*' + pattern, user_prompt, re.IGNORECASE) or \
               re.search(pattern + r'.*\b(?:taken|packed|got|obtained|ready|done|check|checked|is\s+set)\b', user_prompt, re.IGNORECASE):
                form_data["checklist"][item_id] = True
            
    return form_data
