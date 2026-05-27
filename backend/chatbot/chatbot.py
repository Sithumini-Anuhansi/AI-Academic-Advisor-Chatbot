import os
from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

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


def generate_advice(message: str, prediction: str | None) -> str:
    """
    Generate academic advice using OpenAI GPT.
    Falls back to rule-based advice if the API call fails.
    """
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
        print(f"OpenAI API error: {e}")
        return _fallback_advice(message, prediction)


def _fallback_advice(message: str, prediction: str | None) -> str:
    """
    Rule-based fallback used when the OpenAI API is unavailable.
    Checks for keywords in the message to return relevant advice.
    """
    message_lower = message.lower()

    keyword_responses = {
        "attendance": (
            "To improve attendance, set a daily alarm well before class, "
            "track your attendance weekly, and speak to your lecturer if "
            "personal issues are making it hard to attend consistently."
        ),
        "absent": (
            "If you have been missing classes, try to get notes from a classmate "
            "the same day and review the material before the next session. "
            "Talk to your lecturer — they can often provide extra support."
        ),
        "study": (
            "Effective study strategies include active recall (closing your notes "
            "and writing down what you remember), spaced repetition (reviewing "
            "after 1 day, 3 days, and 1 week), and practising past papers under "
            "timed conditions."
        ),
        "hours": (
            "Aim for at least 3-4 focused study hours per day. Use the Pomodoro "
            "technique — 25 minutes of focused work followed by a 5 minute break "
            "— to maintain concentration without burning out."
        ),
        "test": (
            "To improve test scores, review every question you got wrong and "
            "understand why. Make a list of weak topics and dedicate extra time "
            "to them. Visit your lecturer during office hours for targeted help."
        ),
        "exam": (
            "Start your exam preparation at least 3 weeks early. Create a revision "
            "timetable covering all topics, prioritise high-weightage areas, and "
            "practise past papers under real exam conditions — timed and without notes."
        ),
        "assignment": (
            "Treat every assignment as exam practice. Read the marking criteria "
            "carefully before you start, plan your answer before writing, and "
            "leave time to proofread before submission."
        ),
        "motivation": (
            "Break your goals into small daily targets so progress feels visible. "
            "Study with a friend or group for accountability, and reward yourself "
            "after completing a planned study session."
        ),
        "stress": (
            "Academic stress is normal — manage it by keeping a consistent sleep "
            "schedule, taking short breaks between study sessions, and talking to "
            "someone you trust if things feel overwhelming. Your wellbeing comes first."
        ),
    }

    for keyword, response in keyword_responses.items():
        if keyword in message_lower:
            return response

    if prediction in FALLBACK_ADVICE:
        return FALLBACK_ADVICE[prediction]

    return FALLBACK_ADVICE["default"]