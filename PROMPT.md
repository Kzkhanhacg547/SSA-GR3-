# MASTER PROMPT
# Build Nihon Quest as a Real Production Web Application

You are the lead software architect, senior full-stack engineer, UI/UX designer, QA engineer, security engineer, and DevOps engineer for this project.

You are NOT being asked to create a demo, mockup, static prototype, landing page, or fake SaaS interface.

You must build **Nihon Quest as a real, functional, maintainable web application**.

The application must have real authentication, real users, persistent user data, real progress tracking, real database operations, real learning content, real business logic, proper error handling, and a production-ready architecture.

---

# 1. NON-NEGOTIABLE REQUIREMENT

The final result must behave like a real commercial web application.

Do NOT:

- use fake login
- use fake authentication
- store user accounts only in localStorage
- hard-code a fake username
- hard-code progress
- hard-code XP
- hard-code streak
- use fake leaderboard data
- use mock database calls in production features
- create buttons that do nothing
- create pages that only visually simulate functionality
- generate placeholder content and pretend it is complete
- use static mock data where persistent database data is required

If a feature cannot yet be implemented properly, clearly mark it as:

```text
NOT IMPLEMENTED
```

or provide a real fallback.

Never fake functionality.

---

# 2. PRODUCT

Product name:

**Nihon Quest**

Tagline:

> Learn Japanese. Explore Japan.

Core concept:

> The user is not simply studying Japanese.
> The user is progressing through Japan.

The application combines:

- Japanese language learning
- gamification
- real-world scenarios
- progression
- exploration
- AI assistance
- personal learning analytics

---

# 3. REAL USER ACCOUNT SYSTEM

The application MUST support real user accounts.

Implement:

## Registration

User can:

- create account
- enter email
- create password
- choose display name
- choose learning level
- choose learning goal
- choose daily learning target

Example:

```text
Create your account

Display name
Email
Password
Confirm password

[Create Account]
```

---

# 4. AUTHENTICATION

Implement secure authentication.

Required:

```text
Register
Login
Logout
Session persistence
Forgot password
Reset password
Email verification if supported
Protected routes
Session validation
```

Authentication must NOT be simulated.

Use an established authentication system such as:

- Supabase Auth
- Auth.js
- another secure production-ready provider

Choose ONE.

Do not build a custom password authentication system unless absolutely necessary.

---

# 5. USER PROFILE

Every account must have its own persistent profile.

Example:

```text
User
├── id
├── email
├── displayName
├── avatar
├── createdAt
├── learningLevel
├── learningGoal
├── dailyGoal
├── timezone
├── currentStreak
├── longestStreak
├── totalXP
├── level
└── lastActivityAt
```

Never use global variables for user state.

---

# 6. USER DATA IS ISOLATED

User A must NEVER see User B's:

- progress
- XP
- streak
- lessons
- review history
- achievements
- collection
- room
- AI conversations
- personal settings

All user-specific database queries MUST be scoped to the authenticated user.

Implement authorization checks.

Do not trust user IDs sent from the client.

---

# 7. DATABASE

Use a real persistent database.

Preferred:

```text
PostgreSQL
```

Possible managed solution:

```text
Supabase PostgreSQL
```

ORM:

```text
Prisma
```

or another strongly typed ORM.

Choose one architecture and use it consistently.

---

# 8. DATABASE SCHEMA

Design a proper relational schema.

Minimum entities:

```text
users
profiles

kana
kana_strokes

kanji
kanji_readings

vocabulary
vocabulary_examples

grammar
grammar_examples

lessons
lesson_items

exercises
exercise_options

user_progress
user_lesson_progress

review_items
review_history

daily_missions
user_daily_missions

achievements
user_achievements

journey_locations
user_journey_progress

scenarios
scenario_messages
scenario_choices
user_scenario_progress

collection_items
user_collection

room_items
user_room_items

ai_conversations
ai_messages
```

Use foreign keys.

Use indexes for frequently queried fields.

Use unique constraints where appropriate.

Use timestamps.

Do not duplicate user data unnecessarily.

---

# 9. DATABASE MIGRATIONS

Database changes MUST use migrations.

Never manually assume that the production database matches the local schema.

Whenever schema changes:

```text
Modify schema
↓
Create migration
↓
Apply migration
↓
Test
```

---

# 10. SEED DATA

Provide a real seed system.

Seed:

- Hiragana
- Katakana
- Dakuten
- Handakuten
- Combination sounds
- basic Kanji
- vocabulary
- grammar
- lessons
- exercises
- scenarios
- achievements
- journey locations

Seed data must be deterministic.

Running seed multiple times should not create uncontrolled duplicates.

---

# 11. LEARNING CONTENT

Content is separate from UI.

Do NOT put Japanese vocabulary directly inside React components.

Bad:

```tsx
<div>食べる</div>
```

Preferred:

```text
Database
 ↓
API / Server
 ↓
Feature service
 ↓
UI
```

Learning content must be reusable across:

- lessons
- quizzes
- review
- search
- AI
- journey
- analytics

---

# 12. PERSONAL PROGRESS

Every learning action must update the correct user's progress.

Examples:

```text
User learns あ
↓
database records progress

User completes lesson
↓
lesson progress updated

User answers quiz
↓
exercise history recorded

User reviews vocabulary
↓
SRS updated

User completes mission
↓
mission status updated

User earns XP
↓
user profile updated
```

Refreshing the browser MUST NOT reset progress.

Logging out and logging back in MUST preserve progress.

Logging in from another device MUST retrieve the same account data.

---

# 13. XP SYSTEM

XP must be stored persistently.

Do not calculate total XP only from temporary frontend state.

Create an XP transaction/history system if appropriate.

Example:

```text
xp_transactions

id
userId
amount
reason
referenceId
createdAt
```

Reasons:

```text
LESSON_COMPLETE
QUIZ_COMPLETE
REVIEW
LISTENING
WRITING
SPEAKING
MISSION_COMPLETE
SCENARIO_COMPLETE
ACHIEVEMENT
```

Prevent accidental duplicate rewards.

---

# 14. LEVEL SYSTEM

Level calculation must be deterministic.

Create a dedicated service:

```text
calculateLevel(totalXP)
```

Do not duplicate level formulas across components.

---

# 15. STREAK SYSTEM

Streak must be based on actual activity dates.

Track:

```text
currentStreak
longestStreak
lastActivityDate
```

Respect user's timezone.

Do not use server UTC blindly when calculating daily streaks.

Handle:

- same-day activity
- next-day activity
- missed day
- timezone
- first activity

---

# 16. DAILY MISSIONS

Daily missions must be generated for the actual authenticated user.

Example:

```text
User logs in
↓
Check today's mission
↓
If exists:
    load it
Else:
    generate it
↓
Save to database
```

Mission completion must be persistent.

Do not recreate a new mission every page refresh.

---

# 17. REVIEW / SRS

Implement real spaced repetition.

Each user has their own review state.

Example:

```text
review_items

userId
contentType
contentId
ease
interval
repetitions
dueAt
lastReviewedAt
```

Review result:

```text
Again
Hard
Good
Easy
```

The algorithm must update persistent state.

---

# 18. LEARNING SESSION

A lesson should be a real transaction-like flow.

Example:

```text
Start Lesson
↓
Load lesson
↓
Load exercises
↓
User answers
↓
Record answers
↓
Calculate score
↓
Update progress
↓
Award XP
↓
Update streak
↓
Update mission
↓
Unlock achievement if applicable
↓
Save completion
```

Do not award XP multiple times if the user reloads the completion page.

---

# 19. IDEMPOTENCY

Important actions must be safe against duplicate requests.

Examples:

```text
Complete lesson
Award XP
Unlock achievement
Complete mission
Unlock journey location
```

A user refreshing a page must NOT receive:

```text
+100 XP
+100 XP
+100 XP
+100 XP
```

Implement idempotent server-side operations where necessary.

---

# 20. API ARCHITECTURE

Use proper API/server actions.

Separate:

```text
Authentication
Content
Learning
Progress
Gamification
Review
Journey
Scenarios
AI
```

Do not create one giant API endpoint.

Validate incoming data using:

```text
Zod
```

or equivalent.

Never trust client-provided:

```text
userId
XP
level
achievement
completion status
```

These must be calculated/verified server-side.

---

# 21. SECURITY

Implement:

- secure authentication
- authorization
- input validation
- SQL injection protection through ORM
- XSS protection
- CSRF protection where applicable
- rate limiting for sensitive APIs
- secure cookies/session handling
- environment variables for secrets
- no API keys in frontend
- server-side AI API calls
- safe error messages

Never expose:

```text
DATABASE_URL
AI_API_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
```

to the browser.

---

# 22. PROTECTED ROUTES

Unauthenticated user:

```text
/
 /login
 /register
 /forgot-password
```

Authenticated user:

```text
/app
/app/learn
/app/practice
/app/review
/app/journey
/app/survival
/app/profile
/app/settings
```

If unauthenticated user accesses protected route:

```text
redirect → login
```

If authenticated user accesses login/register:

```text
redirect → app
```

---

# 23. USER SETTINGS

Persistent settings:

```text
language
theme
sound
notifications
dailyGoal
timezone
learningLevel
learningGoal
```

Theme:

```text
Light
Dark
System
```

Settings must be stored per user where appropriate.

---

# 24. ACCOUNT MANAGEMENT

User must be able to:

```text
Change display name
Change avatar
Change password
Change learning goal
Change daily goal
Change timezone
Logout
Delete account
```

Account deletion must actually remove/anonymize user-owned data according to the chosen database/auth architecture.

Do not merely hide the account.

---

# 25. LEARNING DASHBOARD

Dashboard must load data from the authenticated user.

Example:

```text
こんにちは, {real user name}

🔥 {real streak}

LEVEL {real level}

{real XP} / {next level XP}

Today's Mission
{real mission progress}

Review
{real review count}

Journey
{real unlocked locations}
```

Never use:

```text
Kz
12 days
820 XP
```

as permanent hard-coded values.

Those can only exist as seed/demo account data during development.

---

# 26. KANA LAB

Build a real learning system.

Each Kana is a database entity.

Each character has:

```text
character
script
romaji
ipa
mora
row
column
audio
strokeData
exampleWords
```

Supported:

```text
Hiragana
Katakana
Dakuten
Handakuten
Combination sounds
Small kana
Long vowels
Special sounds
```

---

# 27. PRONUNCIATION

Use reliable Japanese pronunciation data.

Each pronunciation record must be validated.

Support:

```text
Japanese
Romaji
IPA
Audio
Mora
```

Do not invent IPA.

Use standard Hepburn romanization where appropriate.

---

# 28. AUDIO

Audio must actually play.

Support:

```text
Play
Pause
Replay
Slow
Normal
```

Handle unavailable audio gracefully.

Never display a fake audio button that does nothing.

---

# 29. WRITING PRACTICE

Use a real canvas.

Support:

```text
Draw
Clear
Undo
Check
Retry
```

Stroke order data must be stored separately.

MVP may use rule-based stroke comparison.

Do not claim AI handwriting recognition unless it is actually implemented.

---

# 30. QUIZ ENGINE

Quiz questions must be generated from real content.

Support:

```text
Multiple choice
Typing
Listening
Kana recognition
Kana → Romaji
Romaji → Kana
Meaning → Japanese
Japanese → Meaning
```

Save results.

Calculate:

```text
score
accuracy
correctCount
incorrectCount
timeSpent
```

---

# 31. VOCABULARY

Real database-backed vocabulary.

Fields:

```text
word
kana
kanji
romaji
meaning
partOfSpeech
jlptLevel
audio
examples
tags
```

---

# 32. KANJI

Support:

```text
Kanji
Meaning
On'yomi
Kun'yomi
Stroke count
Stroke order
JLPT level
Vocabulary
Examples
```

---

# 33. GRAMMAR

Grammar entities:

```text
title
level
meaning
structure
examples
commonMistakes
relatedGrammar
```

---

# 34. JAPAN JOURNEY

Journey progression must be stored per user.

Example:

```text
Tokyo
Kyoto
Osaka
Hiroshima
Hokkaido
Kyushu
Okinawa
```

A location can be:

```text
LOCKED
AVAILABLE
IN_PROGRESS
COMPLETED
```

Unlock requirements must be evaluated server-side.

---

# 35. SURVIVAL MODE

Build a real scenario engine.

Scenario structure:

```text
Scenario
 ├── messages
 ├── choices
 ├── expected outcomes
 ├── vocabulary
 ├── grammar
 └── rewards
```

Support branching conversations.

User progress must persist.

---

# 36. AI SENSEI

AI is OPTIONAL.

The core application must work without AI.

Architecture:

```text
AIProvider
├── OllamaProvider
├── OpenRouterProvider
├── GeminiProvider
└── OpenAIProvider
```

Only configured providers should be enabled.

---

# 37. AI COST CONTROL

Do not call AI for deterministic operations.

AI should be used for:

```text
Grammar explanation
Sentence correction
Roleplay
Personalized exercises
Conversation
```

Do NOT use AI for:

```text
XP
Streak
SRS
Kana lookup
Quiz scoring
Database operations
Navigation
```

---

# 38. AI CONVERSATION STORAGE

If user is logged in, optionally persist:

```text
conversation
messages
createdAt
provider
model
```

User must only access their own AI conversations.

---

# 39. AI FAILURE HANDLING

If AI unavailable:

```text
AI Sensei is temporarily unavailable.

Your core lessons are still available.
```

Do not crash the entire application.

---

# 40. OFFLINE SUPPORT

The application should continue working for cached educational content where possible.

Offline-capable:

```text
Kana
basic lessons
cached vocabulary
review queue
```

Online-dependent:

```text
AI
cloud sync
advanced speech services
```

---

# 41. PWA

Eventually support:

```text
Install app
Offline shell
Cached learning content
App icon
Splash screen
Mobile experience
```

---

# 42. RESPONSIVE APP

Do NOT simply shrink desktop.

Design separate layouts for:

```text
Mobile
Tablet
Desktop
```

The primary learning experience must be comfortable on mobile.

---

# 43. REAL LOADING STATES

Every async page must have loading UI.

Examples:

```text
Skeleton
Spinner
Progressive loading
```

Never leave blank white space while data loads.

---

# 44. REAL ERROR STATES

Every network/database operation must handle failure.

Example:

```text
Something went wrong.

Your progress is safe.

[Retry]
```

Never show raw stack traces to users.

---

# 45. EMPTY STATES

Example:

```text
No reviews yet.

Complete your first lesson
and your review queue will appear here.
```

---

# 46. TOAST / FEEDBACK

Use meaningful feedback:

```text
Lesson completed
+50 XP

Achievement unlocked

Tokyo unlocked

Settings saved
```

Do not spam notifications.

---

# 47. ACCESSIBILITY

Support:

- keyboard navigation
- focus states
- screen readers
- semantic HTML
- ARIA where needed
- reduced motion
- accessible audio controls
- accessible forms
- sufficient contrast

---

# 48. PERFORMANCE

Do not load everything on initial page load.

Lazy load:

```text
audio
maps
large images
advanced AI components
heavy visualizations
```

Optimize:

```text
images
fonts
JavaScript
database queries
API responses
```

---

# 49. OBSERVABILITY

Add structured logging.

Log:

```text
error
warning
important server events
```

Never log:

```text
password
session token
API key
private user data
```

---

# 50. ANALYTICS

Track useful product events:

```text
signup
login
lesson_started
lesson_completed
exercise_completed
kana_practiced
review_completed
mission_completed
journey_unlocked
scenario_completed
speaking_started
```

Analytics must respect privacy.

---

# 51. ADMIN / CONTENT MANAGEMENT

Design architecture so educational content can eventually be managed without editing React code.

Future admin:

```text
Admin
├── Kana
├── Kanji
├── Vocabulary
├── Grammar
├── Lessons
├── Exercises
└── Scenarios
```

MVP may use seed scripts, but architecture must not prevent an admin CMS later.

---

# 52. ENVIRONMENT MANAGEMENT

Create:

```text
.env.example
```

Never commit real secrets.

Example:

```text
DATABASE_URL=
AUTH_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OLLAMA_BASE_URL=
OPENROUTER_API_KEY=
```

Only include variables actually used by the implementation.

---

# 53. DEVELOPMENT ENVIRONMENTS

Support:

```text
Development
Test
Production
```

Do not use production database for local testing.

---

# 54. TESTING

Implement:

## Unit tests

For:

```text
XP
Level
Streak
SRS
Quiz scoring
Unlock logic
```

## Integration tests

For:

```text
Authentication
Database
Progress
Lesson completion
XP
Mission
Review
```

## E2E tests

Critical user flow:

```text
Register
↓
Login
↓
Onboarding
↓
Learn Kana
↓
Complete lesson
↓
Earn XP
↓
Review
↓
Unlock Journey
↓
Logout
↓
Login again
↓
Verify progress persists
```

---

# 55. AUTHENTICATION E2E TEST

At minimum:

```text
Create user A
Create user B

User A creates progress
User B creates different progress

Verify:
User A cannot access B's data
User B cannot access A's data
```

This is mandatory.

---

# 56. DATABASE TEST

Verify:

```text
Refresh page
→ data persists

Logout
→ data persists

Login from another browser
→ data persists
```

---

# 57. PRODUCTION BUILD CHECK

Before declaring the project complete:

```text
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

Fix all errors.

No known TypeScript errors.

No known runtime errors.

No critical console errors.

No broken routes.

No dead buttons.

---

# 58. UI QA

Check every page:

```text
Desktop
Tablet
Mobile
Dark mode
Light mode
Loading
Error
Empty
Authenticated
Unauthenticated
```

---

# 59. SECURITY QA

Verify:

```text
Unauthenticated API access
Unauthorized user access
User ID manipulation
Invalid input
Missing fields
Malformed requests
Rate limits
Secret exposure
```

---

# 60. NO FAKE DATA POLICY

During development, seed data is allowed.

But clearly distinguish:

```text
Seed content
Production user data
Test fixtures
```

Do not accidentally ship:

```text
Demo User
Demo Progress
Fake Leaderboard
Fake Statistics
```

as production data.

---

# 61. DESIGN SYSTEM

Create reusable:

```text
Button
Card
Modal
Dialog
Input
Select
Progress
Badge
Tabs
Toast
Skeleton
Avatar
AudioPlayer
KanaCard
KanjiCard
VocabularyCard
ExerciseCard
XPBar
StreakCard
JourneyNode
AchievementCard
```

Do not duplicate similar UI components.

---

# 62. UI QUALITY BAR

The UI should feel:

```text
Premium
Modern
Japanese
Educational
Friendly
Focused
```

Not:

```text
Template
Generic SaaS
AI-generated dashboard
Overly childish
Overly anime
Overly neon
```

---

# 63. MOBILE FIRST LEARNING

Learning should be comfortable with one hand.

Prioritize:

```text
Large Kana
Large buttons
Easy audio controls
Swipe-friendly flashcards
Simple quiz interactions
Readable Japanese typography
```

---

# 64. USER JOURNEY

New user:

```text
Landing
 ↓
Register
 ↓
Onboarding
 ↓
Personalized starting point
 ↓
Daily Mission
 ↓
Kana lesson
 ↓
Practice
 ↓
Reward
 ↓
Japan Journey
 ↓
Return tomorrow
```

Existing user:

```text
Login
 ↓
Dashboard
 ↓
Continue Learning
 ↓
Review
 ↓
Mission
 ↓
Journey
```

---

# 65. RETENTION

Retention should come from genuine progress.

Use:

```text
Streak
Daily Mission
Progress
Journey
Collection
Achievements
Review
```

Do not use dark patterns.

---

# 66. REAL PRODUCT PRINCIPLE

The application must always answer:

> What should I do next?

Every user session should have a clear next action.

---

# 67. IMPLEMENTATION ORDER

Do NOT build everything simultaneously.

Use this order:

```text
PHASE 0
Repository audit

PHASE 1
Architecture
Database
Authentication
Design system
App shell

PHASE 2
Onboarding
User profile
Settings

PHASE 3
Kana Lab
Hiragana
Katakana
Pronunciation
Audio
Stroke order

PHASE 4
Lessons
Exercises
Quiz
Vocabulary

PHASE 5
Progress
XP
Level
Streak
SRS
Daily Missions

PHASE 6
Japan Journey
Achievements
Collection

PHASE 7
Survival Mode

PHASE 8
AI Sensei

PHASE 9
Speaking

PHASE 10
PWA
Performance
Accessibility
Security
Production QA
```

---

# 68. AFTER EVERY PHASE

The coding agent MUST:

```text
1. Run application
2. Run tests
3. Run typecheck
4. Run lint
5. Check database
6. Check authentication
7. Inspect UI
8. Fix errors
9. Update documentation
10. Commit stable state
```

Do not move to the next phase while the current phase is broken.

---

# 69. GIT WORKFLOW

Use meaningful commits:

```text
feat: add authentication
feat: add user onboarding
feat: add kana learning
feat: add quiz engine
feat: add SRS
feat: add gamification
feat: add Japan journey
feat: add survival mode
feat: add AI sensei

fix: ...
refactor: ...
test: ...
```

Never use:

```text
final-final-REAL-final-v2
```

---

# 70. DOCUMENTATION

Maintain:

```text
README.md
ARCHITECTURE.md
DATABASE.md
API.md
DEVELOPMENT.md
ENVIRONMENT.md
ROADMAP.md
```

README must explain:

- project
- features
- stack
- setup
- environment
- database
- seed
- development
- testing
- deployment

---

# 71. AI AGENT BEHAVIOR

Before modifying code:

```text
Inspect first.
Understand second.
Plan third.
Code fourth.
Test fifth.
```

Never blindly overwrite existing architecture.

Reuse existing code where appropriate.

Do not create duplicate systems.

---

# 72. WHEN SOMETHING IS AMBIGUOUS

Do not invent major architecture decisions silently.

For minor implementation details:

Use sensible defaults.

For major decisions involving:

- database
- authentication
- payments
- data deletion
- security
- deployment

Document the decision in:

```text
ARCHITECTURE.md
```

---

# 73. DEFINITION OF REAL WEB APP

The project is NOT considered a real application if:

```text
Login only changes screen
Progress resets after refresh
User data is stored only in localStorage
Buttons are decorative
Database is absent
Authentication is fake
AI response is hard-coded
XP is hard-coded
Streak is hard-coded
Journey is hard-coded
```

The project IS considered a real application when:

```text
Users can create accounts
Users can authenticate
Users have isolated data
Data persists
Learning progress persists
XP persists
Streak persists
Review persists
Lessons persist
Achievements persist
Journey progress persists
Settings persist
The application survives refresh/logout/login
```

---

# 74. FINAL ACCEPTANCE TEST

Create a fresh account.

Complete onboarding.

Learn several Hiragana.

Complete a lesson.

Answer exercises.

Earn XP.

Verify XP in database.

Refresh browser.

Verify XP remains.

Logout.

Login again.

Verify:

```text
Profile
XP
Level
Progress
Streak
Review queue
Mission
Journey
```

all remain correct.

Create a second account.

Verify the second account has independent progress.

Attempt unauthorized access to the first user's data.

Verify access is denied.

Test the application on mobile.

Test dark mode.

Test network failure.

Test missing audio.

Test AI unavailable.

Test invalid form input.

Test expired session.

Only after all tests pass may the application be considered MVP complete.

---

# 75. FINAL COMMAND

Build this project as a **real production-oriented web application**, not a visual prototype.

Start by inspecting the existing repository.

Do not immediately write code.

First provide a concise:

1. Repository audit
2. Current architecture
3. Missing infrastructure
4. Proposed implementation plan
5. Database strategy
6. Authentication strategy
7. Phase 1 tasks

Then begin implementation.

Build incrementally.

Use real persistent data.

Use real authentication.

Use real authorization.

Use real business logic.

Use real tests.

Use real error handling.

Make the product beautiful, but functionality comes first.

The final experience should feel like a polished Japanese learning product, not an AI-generated frontend demo.

**Core product philosophy:**

> Learn Japanese.
>
> Practice Japanese.
>
> Explore Japan.
>
> Build your own journey.