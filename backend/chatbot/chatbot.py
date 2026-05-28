import os
from openai import OpenAI

SYSTEM_PROMPT = """You are an AI academic advisor for university students.
Your job is to help students improve their academic performance based on their
predicted pass/fail result and the data they submitted (attendance, test scores,
assignment scores, and study hours).

Guidelines:
- Be supportive, practical, and encouraging at all times.
- Give specific, actionable advice — not vague motivation.
- Keep responses concise: 3 to 6 sentences or a short numbered list.
- If the student has a FAIL prediction, be direct about the urgency but stay positive.
- If the student has a PASS prediction, encourage them to maintain and improve further.
- If no prediction context is given, give general academic advice.
- Do not mention that you are an AI language model or reference OpenAI.
- Respond as if you are their personal academic advisor."""

FALLBACK_ADVICE = {
    "FAIL": (
        "You are currently at academic risk. Focus on three things immediately: "
        "increase your daily study hours to at least 3-4 hours, aim for above 85% "
        "attendance, and review your weakest topics from your internal tests. "
        "Would you like specific advice on any of these areas?"
    ),
    "PASS": (
        "Your performance is on track — well done! To maintain this, keep your "
        "attendance consistent, do not reduce your study hours, and start your "
        "exam revision at least 3 weeks early. Is there a specific subject or "
        "skill you want to strengthen further?"
    ),
    "default": (
        "I am here to help you improve your academic performance. You can ask me "
        "about study techniques, how to improve your attendance, how to prepare "
        "for internal tests, or how to manage your time effectively. "
        "What would you like help with?"
    ),
}


def _get_openai_client():
    """
    Dynamically initializes the OpenAI client at runtime.
    Ensures environment variables loaded by load_dotenv() are properly picked up.
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return None
    return OpenAI(api_key=api_key)


def generate_advice(message: str, prediction: str | None) -> str:
    """
    Generate academic advice using OpenAI GPT.
    Falls back to rule-based advice if the API call fails or the key is missing.
    """
    client = _get_openai_client()
    if not client:
        print("OpenAI API error: OPENAI_API_KEY environment variable is missing or empty.")
        return _fallback_advice(message, prediction)

    context = ""
    if prediction == "FAIL":
        context = "The student's latest academic prediction is FAIL — they are at risk of not passing."
    elif prediction == "PASS":
        context = "The student's latest academic prediction is PASS — they are currently on track."

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": f"{context}\n\nStudent message: {message}" if context else message
                },
            ],
            max_tokens=250,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"OpenAI API runtime error: {e}")
        return _fallback_advice(message, prediction)


def _fallback_advice(message: str, prediction: str | None) -> str:
    """
    Rule-based fallback used when the OpenAI API is unavailable.
    Checks for broad multi-keyword intent groups to give intelligent advice.
    """
    message_lower = message.lower()

    # Intent groups mapped to comprehensive advice strings
    intent_responses = {
        ("attendance", "absent", "missed", "class"): (
            "To improve attendance, set a daily alarm well before class and track your progress. "
            "If you have missed classes, get notes from a classmate the same day, review the material, "
            "and speak to your lecturer for support."
        ),
        ("study", "hours", "learn", "pomodoro", "technique"): (
            "Effective study strategies include active recall and spaced repetition. Aim for 3-4 "
            "focused hours per day using the Pomodoro technique (25 minutes of work, 5 minutes break) "
            "to maintain deep concentration."
        ),
        ("test", "score", "grade", "mark", "fail", "assignment"): (
            "To improve your grades, review every question you got wrong on tests and understand why. "
            "Read assignment criteria carefully before starting, plan your answers, and visit your "
            "lecturer during office hours for targeted help."
        ),
        ("exam", "revision", "prepare", "eat", "food", "diet", "sleep"): (
            "Start exam prep 3 weeks early. Prioritize sleep and eat balanced, brain-healthy foods "
            "(like nuts, fish, and whole grains) before tests to keep energy steady. Practice past "
            "papers under timed conditions without notes."
        ),
        ("timetable", "schedule", "routine", "manage", "time", "calendar"): (
            "To build a solid timetable, block out your fixed class times first, then add dedicated "
            "3-hour study slots for each subject. Keep a digital calendar to track deadlines and "
            "break large tasks into small, daily pieces."
        ),
        ("motivation", "lazy", "procrastinate", "focus", "start"): (
            "Break your goals into small daily targets so progress feels visible. Study with a friend "
            "for accountability, reduce phone distractions, and reward yourself after completing a "
            "planned session."
        ),
        ("stress", "overwhelmed", "anxious", "mental", "tired", "burnout"): (
            "Academic stress is normal. Manage it by keeping a consistent sleep schedule, taking "
            "frequent short breaks, and talking to someone you trust. Your wellbeing always comes first; "
            "don't hesitate to reach out to campus counseling."
        ),
    }

    # Match any keyword inside the intent tuples
    for keywords, response in intent_responses.items():
        if any(keyword in message_lower for keyword in keywords):
            return response

    # Fallback to general prediction advice if no broad keywords match
    if prediction in FALLBACK_ADVICE:
        return FALLBACK_ADVICE[prediction]

    return FALLBACK_ADVICE["default"]
s