import os
import logging
from google import genai
from google.genai import types
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception

logger = logging.getLogger(__name__)


class GeminiQuotaError(Exception):
    """Raised when Gemini returns 429 / RESOURCE_EXHAUSTED — never silently swallowed."""
    pass


SYSTEM_PROMPT = """You are EduMentor AI — a friendly, knowledgeable, and practical academic advisor
for university students. You help students improve their academic performance.

You can help with ANY academic question including:
- Creating personalised study plans and timetables
- Exam and test preparation strategies
- Time management and scheduling
- Motivation and dealing with procrastination
- Stress, anxiety, and mental wellbeing
- Note-taking techniques
- Understanding grades and predictions
- Assignment writing tips
- Subject-specific study advice
- Sleep, nutrition, and focus tips for studying

Guidelines:
- Be warm, supportive, and encouraging at all times.
- Give SPECIFIC, ACTIONABLE advice — never vague motivation.
- When asked to CREATE something (a plan, timetable, schedule) — actually create it with clear structure.
- When asked a HOW question — give numbered steps.
- Use the student's actual data (attendance, test scores, assignment score, study hours) when given —
  reference their specific numbers rather than speaking generically.
- Keep responses focused: 4 to 8 sentences or a short structured list.
- If the student has a FAIL prediction, be direct about urgency but stay positive.
- If the student has a PASS prediction, encourage improvement.
- Never mention Google, Gemini, or that you are an AI language model.
- Respond as their dedicated personal academic advisor named EduMentor AI."""


FALLBACK_RESPONSES = {
    ("attendance", "absent", "missing class", "skip class", "miss class"): (
        "Improving attendance starts with removing barriers. Set an alarm 60 minutes "
        "before class, lay out your materials the night before, and track your attendance "
        "weekly. If personal issues are affecting you, speak to your lecturer early — "
        "they can often arrange support or catch-up materials."
    ),
    ("study plan", "timetable", "schedule", "study schedule", "weekly plan", "categoris", "categori"): (
        "Here is a sample daily study plan you can adapt:\n\n"
        "Morning (2 hours):\n"
        "  0:00-0:25  Theory review (read notes / slides)\n"
        "  0:25-0:30  Break\n"
        "  0:30-0:55  Active recall (close notes, write what you remember)\n"
        "  0:55-1:00  Break\n"
        "  1:00-1:25  Past question practice\n"
        "  1:25-2:00  Review wrong answers and fill gaps\n\n"
        "Evening (1.5 hours):\n"
        "  Review today's lecture notes within 24 hours\n"
        "  Write a 3-sentence summary of each topic in your own words\n\n"
        "Rotate subjects daily so no topic goes more than 2 days without review."
    ),
    ("internal test", "prepare for test", "prepare for exam", "test prep", "exam prep"): (
        "To prepare for internal tests:\n\n"
        "1. Review your lecture notes and highlight key concepts.\n"
        "2. Close your notes and write everything you remember (active recall).\n"
        "3. Attempt past questions under timed conditions.\n"
        "4. Review every wrong answer — understand why, not just what the right answer is.\n"
        "5. Summarise weak topics on a single revision sheet.\n"
        "6. Get 8 hours of sleep the night before — cramming the night before backfires."
    ),
    ("active recall", "flashcard", "spaced repetition", "revision technique", "study technique", "how to study"): (
        "The most effective study techniques are:\n\n"
        "1. Active recall — close your notes and write everything you remember. Check and fill gaps.\n"
        "2. Spaced repetition — review after 1 day, 3 days, 1 week, and 2 weeks.\n"
        "3. Past papers — under timed, exam conditions, no notes.\n"
        "4. The Feynman technique — explain the concept out loud as if teaching a 10-year-old.\n\n"
        "Re-reading notes is the least effective method — replace it with these."
    ),
    ("procrastinat", "lazy", "cant start", "can't start", "no motivation", "motivat", "start studying"): (
        "To overcome procrastination:\n\n"
        "1. Use the 2-minute rule — commit to studying for just 2 minutes. Starting is the hardest part.\n"
        "2. Remove your phone from the room entirely, not just face-down.\n"
        "3. Break the task into the smallest possible step.\n"
        "4. Study with a friend or in a library — environment and accountability help enormously.\n"
        "5. Reward yourself after each completed session, not before."
    ),
    ("focus", "concentrate", "distract", "phone", "social media"): (
        "To improve focus:\n\n"
        "1. Use the Pomodoro technique — 25 minutes fully focused, 5 minutes break.\n"
        "2. Put your phone in a different room. Out of sight is out of mind.\n"
        "3. Use website blockers (Cold Turkey or Freedom) during study sessions.\n"
        "4. Study in a library or dedicated space, not your bedroom.\n"
        "5. Stay hydrated — even mild dehydration reduces concentration noticeably."
    ),
    ("stress", "overwhelmed", "anxious", "anxiety", "panic", "burnout", "too much"): (
        "Feeling overwhelmed is very common — here is how to manage it:\n\n"
        "1. Write down every task on your mind — getting it out of your head reduces anxiety.\n"
        "2. Pick just one task from that list and do only that. One thing at a time.\n"
        "3. Take a 10-minute walk — physical movement resets your stress response.\n"
        "4. Keep a consistent sleep schedule — sleep deprivation magnifies stress.\n"
        "5. Talk to someone you trust, or visit your campus counselling service."
    ),
    ("sleep", "tired", "fatigue", "energy", "eat", "food", "diet", "nutrition"): (
        "Your brain performs best when your body is looked after:\n\n"
        "Sleep: Aim for 7-8 hours on a consistent schedule. A good night's sleep before "
        "an exam beats cramming until 2am every time.\n\n"
        "Nutrition: Eat a proper meal before studying. Brain-friendly foods include eggs, "
        "nuts, oily fish, blueberries, and whole grains. Avoid high-sugar snacks that "
        "cause energy crashes. Stay hydrated throughout the day."
    ),
    ("time management", "manage time", "deadline", "late submission", "planning"): (
        "For better time management:\n\n"
        "1. Every Sunday, write out all deadlines and tasks for the coming week.\n"
        "2. Block study sessions in your calendar like fixed appointments.\n"
        "3. Use the rule of 3 — identify the 3 most important tasks each day and do those first.\n"
        "4. Build in buffer time — unexpected things always happen.\n"
        "5. For assignments, aim to finish 2 days early to allow proofreading."
    ),
    ("assignment", "essay", "report", "submit", "write", "writing"): (
        "For assignments and essays:\n\n"
        "1. Read the brief and marking rubric carefully before writing a single word.\n"
        "2. Plan your structure — introduction, key points, conclusion — before drafting.\n"
        "3. Write a rough first draft without worrying about perfection.\n"
        "4. Revise and improve the draft the next day with fresh eyes.\n"
        "5. Proofread for grammar, citations, and word count before submitting.\n"
        "6. Submit at least one day early to avoid last-minute technical issues."
    ),
    ("prediction", "predict", "pass", "fail", "result", "confidence"): (
        "Your prediction is based on five factors: attendance, Internal Test 1, "
        "Internal Test 2, assignment score, and daily study hours. To improve your "
        "prediction, focus on whichever of these five factors is currently your weakest. "
        "Would you like specific advice on any one of them?"
    ),
    ("help", "advice", "tip", "suggest", "what should", "how do i", "how can i", "what can"): (
        "I can help you with:\n\n"
        "- Study plans and revision timetables\n"
        "- Exam and test preparation\n"
        "- Managing procrastination and motivation\n"
        "- Dealing with stress and exam anxiety\n"
        "- Time management and deadlines\n"
        "- Improving attendance\n"
        "- Understanding your pass/fail prediction\n\n"
        "Just ask me anything — be as specific as you like!"
    ),
}

CONTEXT_FALLBACK = {
    "FAIL": (
        "You are currently at academic risk. The three most impactful things to do right now: "
        "increase daily study hours to at least 3-4 hours, attend every remaining class, and "
        "review your weakest topics from your internal tests immediately. "
        "What specific area would you like help with?"
    ),
    "PASS": (
        "Your performance is on track — well done! To maintain and improve: keep attendance "
        "above 85%, maintain your study hours, and begin exam revision at least 3 weeks early. "
        "Is there a specific area you want to strengthen?"
    ),
    "default": (
        "I am EduMentor AI — your personal academic advisor. Ask me anything: study plans, "
        "exam preparation, time management, stress, motivation, or how to improve your grades. "
        "The more specific your question, the more tailored my advice will be."
    ),
}


def _is_quota_error(exc: Exception) -> bool:
    msg = str(exc).upper()
    return "429" in str(exc) or "RESOURCE_EXHAUSTED" in msg or "QUOTA" in msg


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=8),
    retry=retry_if_exception(lambda e: not _is_quota_error(e)),
    reraise=True,
)
def _call_gemini(client, contents):
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            max_output_tokens=350,
            temperature=0.7,
        ),
        contents=contents,
    )
    if not response.text:
        raise ValueError("Gemini returned an empty response")
    return response.text.strip()


def _build_context_string(student_context: dict) -> str:
    return (
        f"Student's latest data — Attendance: {student_context['attendance']}%, "
        f"Internal Test 1: {student_context['test1']}/40, "
        f"Internal Test 2: {student_context['test2']}/40, "
        f"Assignment: {student_context['assignment']}/10, "
        f"Daily study hours: {student_context['study_hours']}, "
        f"Prediction: {student_context['prediction']} "
        f"(confidence: {student_context['confidence']}%).\n\n"
    )


def generate_advice(message: str, student_context: dict | None, history: list | None = None) -> dict:
    """
    student_context: {
        prediction, confidence, attendance, test1, test2, assignment, study_hours
    } or None if the student has no prediction history yet.

    history: list of {"role": "user"|"model", "text": str} — the last few turns
    of the conversation, sent so follow-up questions stay contextual.

    Returns:
        {"message": str, "source": "ai" | "fallback"}
    Raises:
        GeminiQuotaError if Gemini quota/rate limit is exceeded.
    """
    api_key    = os.environ.get("GEMINI_API_KEY", "").strip()
    prediction = student_context.get("prediction") if student_context else None

    if not api_key:
        logger.warning("GEMINI_API_KEY not set — using fallback.")
        return {"message": _fallback_advice(message, prediction), "source": "fallback"}

    context = _build_context_string(student_context) if student_context else ""

    contents = []
    for turn in (history or []):
        role = turn.get("role", "user")
        text = turn.get("text", "")
        if text:
            contents.append({"role": role, "parts": [{"text": text}]})

    contents.append({
        "role": "user",
        "parts": [{"text": f"{context}Student message: {message}"}],
    })

    try:
        client = genai.Client(api_key=api_key)
        text = _call_gemini(client, contents)
        return {"message": text, "source": "ai"}

    except GeminiQuotaError:
        raise
    except Exception as e:
        if _is_quota_error(e):
            logger.error("Gemini quota exceeded: %s", e)
            raise GeminiQuotaError(str(e)) from e
        logger.warning("Gemini failed after retries, using fallback: %s", e)
        return {"message": _fallback_advice(message, prediction), "source": "fallback"}


def _fallback_advice(message: str, prediction: str | None) -> str:
    message_lower = message.lower()

    for keywords, response in FALLBACK_RESPONSES.items():
        if any(kw in message_lower for kw in keywords):
            return response

    if prediction == "FAIL":
        return CONTEXT_FALLBACK["FAIL"]
    elif prediction == "PASS":
        return CONTEXT_FALLBACK["PASS"]

    return CONTEXT_FALLBACK["default"]