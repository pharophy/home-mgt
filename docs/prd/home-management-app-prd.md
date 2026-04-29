# Home Management App PRD

Last updated: 2026-04-25

## 1. Product Summary

Build a tablet-first home management app for parents of a 4-year-old that helps the child participate in household life through simple chores, routines, and visible contributions.

This is not primarily a family calendar product. It is a `parent-guided participation system` that makes a preschooler feel helpful, gives parents less reminding to do, and turns daily household tasks into repeatable, age-appropriate rituals.

Working name: `Home Mgt`

## 2. Problem

Parents of 4-year-olds usually want their child to help at home, but existing tools have a poor fit:

- Generic task apps assume literacy, long attention spans, and independent execution.
- Family wall calendars are optimized for scheduling, not preschool participation.
- Paper chore charts are visible, but hard to update, easy to ignore, and disconnected from parent workflows.
- Parents end up carrying the full mental load of prompting, remembering, and translating tasks into kid-friendly language.

The result is repetitive nagging, inconsistent routines, low child ownership, and missed opportunities to build confidence through simple household contribution.

## 3. Vision

Create the best software-first home participation app for preschool households:

- `Clear for a 4-year-old` with icons, pictures, and very short steps
- `Practical for parents` with quick setup, recurring flows, and approval controls
- `Visible in the home` on a shared tablet in the kitchen, playroom, or hallway
- `Motivating without over-gamifying` so contribution feels meaningful, not manipulative
- `Developmentally realistic` for short attention spans, emerging independence, and heavy parent scaffolding

## 4. Target Users

Primary users:

- Parents or guardians of a 4-year-old
- Households trying to build everyday helping habits
- Parents who want calmer mornings, transitions, and cleanup time

Secondary users:

- Grandparents, babysitters, and nannies following the same routines
- Siblings who may also appear in the household model later

## 5. User and Child Reality

The product must reflect what many 4-year-olds can typically handle:

- They often like being a helper.
- They can follow simple multi-step directions, but not long abstract task lists.
- They benefit from routine, repetition, praise, and immediate feedback.
- They may not read yet, so the interface cannot depend on text comprehension.
- They still need adult supervision and setup for most chores.

This means the app should optimize for:

- 1 to 3 step tasks
- heavy use of icons, images, and audio
- parent-led setup with child-facing execution
- immediate visible completion feedback

## 6. Jobs To Be Done

1. When my child resists helping, I want a predictable visual routine so I do less verbal prompting.
2. When I am teaching chores, I want to break them into tiny steps my 4-year-old can understand.
3. When my child helps, I want them to feel proud and see that they contributed to the household.
4. When another caregiver is on duty, I want them to follow the same household expectations without needing me to explain everything again.
5. When our day is chaotic, I want a simple "what does my child do next?" screen that keeps transitions moving.

## 7. Goals

Product goals:

- Help parents establish 3 to 5 repeatable household participation habits for a 4-year-old.
- Reduce verbal reminding during common friction points like morning prep, cleanup, and bedtime.
- Make chores and routines feel legible and achievable to a preschooler.
- Give parents lightweight progress visibility without adding administrative overhead.

Business goals:

- Own a differentiated wedge inside home management by starting with early childhood household participation.
- Create a strong foundation for later expansion into broader family routines, scheduling, and household operations.

## 8. Non-Goals For MVP

- Full family calendar platform
- Complex household planning for older kids
- Budgeting
- Smart home controls
- Deep AI automation
- Independent child use without adult guidance
- School/admin document management

## 9. Product Principles

1. Parent-configured, child-executed.
2. Pictures and symbols before text.
3. Tiny steps beat broad chores.
4. Participation matters more than perfect completion.
5. Reinforcement should feel warm and immediate.
6. The app should reduce parent prompting, not become another thing for parents to manage.

## 10. Core User Scenarios

### Scenario A: Morning routine

A parent opens the tablet and taps the child profile. The 4-year-old sees a simple sequence like:

- get dressed
- put pajamas in hamper
- bring cup to sink
- put shoes by door

Each step uses an icon, optional photo, and tap-to-complete interaction.

### Scenario B: Cleanup time

After playtime, the tablet switches to a "help put the room back" flow with 2 to 4 tiny tasks such as:

- books on shelf
- blocks in bin
- stuffed animals in basket

### Scenario C: Mealtime helper

The child is assigned "big kid helper" tasks such as:

- carry napkins to table
- put spoons out
- throw away own trash

### Scenario D: Parent approval

Parent confirms completed steps, gives praise, and optionally awards stars or unlocks a reward ritual like choosing the bedtime book.

## 11. MVP Scope

### 11.1 Household Model

- Single household
- 1 or more parent/caregiver accounts
- 1 child profile as the primary user
- Optional additional child profiles later, but not required in the first iteration

### 11.2 Child Profile

- Name
- Avatar or photo
- Preferred color
- Age band preset: `4-year-old`
- Optional motivators: stickers, favorite themes, reward preferences

### 11.3 Routines

Core MVP pillar.

- Morning routine
- Cleanup routine
- Mealtime helper routine
- Bedtime routine
- Custom parent-created routine

Each routine supports:

- 1 to 8 ordered steps
- icon or photo per step
- optional short parent text label
- optional audio cue
- estimated duration
- recurring schedule

### 11.4 Chores

Chores in MVP should be simple and age-appropriate:

- put toys away
- carry clothes to hamper
- wipe table with help
- feed pet with supervision
- bring napkins to table
- put books back

Capabilities:

- one-time or recurring chores
- assign to child
- optional parent approval
- optional points/stars
- completion history

### 11.5 Parent Dashboard

- today's routines
- today's chores
- what was completed
- what needed help
- streaks or simple consistency indicators
- quick-edit actions for tomorrow

### 11.6 Child-Facing Tablet View

- one active routine or chore at a time
- giant tap targets
- progress dots or tiles
- completion celebration
- minimal reading required

### 11.7 Rewards

Keep this lightweight in MVP:

- stars or stickers
- simple reward goals
- non-monetary reward suggestions

Examples:

- choose the next song
- pick bedtime book
- choose family dance break

### 11.8 Caregiver Mode

- read-only or limited-edit access for another adult
- can run routines and mark completions
- cannot change household settings unless permitted

## 11.9 Current MVP Build Status

The current implemented MVP in this repository now includes:

- parent mode for child profile setup, routine creation, chore creation, caregiver creation, and daily dashboard review
- child tablet mode with one active step or chore at a time
- routine step progression with completion recording
- child-friendly chore completion with pending-approval handling
- configurable gentle celebration mode
- caregiver mode for opening the child plan and recording progress
- parent-only protection around household settings and other admin controls

Still intentionally lightweight in the current build:

- routine authoring is optimized around a single first step in the UI, even though the underlying model supports ordered steps
- caregiver setup is local account creation/invite-style entry, not external auth or email delivery
- media uploads are represented as URLs rather than a full upload pipeline

## 12. What We Are Explicitly Not Building First

- meal planning as a primary pillar
- broad schedule aggregation
- grocery workflows
- parent inbox for school email
- complex gamification economy
- marketplace or shopping integrations

These can return later only if they support the core participation use case.

## 13. UX Requirements

### Child-facing design

- every step must be understandable without reading
- support icons, photos, and optional recorded parent voice
- no dense lists
- no more than one main action per screen
- success state should be immediate and warm

### Parent-facing design

- creating a new chore should take under 30 seconds
- routine templates should be faster than writing from scratch
- editing should be possible from phone
- tablet should feel glanceable and stable in shared home spaces

### Accessibility and developmental fit

- high contrast
- large targets
- simple consistent navigation
- forgiving interactions
- no punitive language

## 14. Functional Requirements

1. Parents can create one or more routines for a 4-year-old.
2. Parents can create recurring chores with pictures/icons.
3. Parents can mark a task as requiring approval or auto-complete.
4. Children can complete steps from a shared tablet with one tap per step.
5. Parents can upload or choose icons/photos for tasks.
6. Parents can assign stars/stickers to routines or chores.
7. Caregivers can access the child's current plan without full admin rights.
8. The system can show today's current child routine in a dedicated tablet mode.
9. Parents can view completion history by day and by routine.
10. Parents can enable gentle celebration effects and disable overstimulating ones.

## 15. Success Metrics

Activation:

- parent creates child profile
- parent activates at least 1 routine
- parent adds at least 3 steps to a routine
- household uses tablet mode at least once in first 24 hours

Engagement:

- weekly active households
- average routines completed per week
- average chores completed per week
- percentage of households using at least one recurring routine
- caregiver usage rate

Outcome metrics:

- self-reported reduction in verbal reminders
- self-reported increase in child participation
- completion consistency for core routines
- parent satisfaction with "ease of getting my child to help"

## 16. Risks

- Parents may expect too much independence from a 4-year-old.
- Over-gamification can make helping feel transactional.
- Too much parent setup will kill adoption.
- Tablet interactions can become overstimulating if the UX is too flashy.
- A generic home-management feature set can dilute the core preschool use case.

## 17. Recommended Release Strategy

Phase 1:

- child profile
- routines
- chores
- caregiver mode
- stars/stickers
- tablet mode

Phase 1 status in repo:

- implemented

Phase 2:

- richer reward system
- parent voice prompts
- photo-based custom steps
- more nuanced progress reporting

Phase 3:

- extend to ages 5 to 7
- household calendar light integration
- sibling coordination
- AI-assisted routine/chore suggestions

## 18. Suggested Technical Direction

This repo already uses React and Node. Product direction should be:

- React app optimized for mounted tablet and phone companion use
- Node API for households, child profiles, routines, chores, rewards, and caregiver access
- persistent structured storage for households, child profiles, routines, chores, completions, rewards, caregivers, and household settings
- media storage for child-safe icons and uploaded photos as a later enhancement
- PWA support for tablet installation and quick wake/resume behavior

Rationale:

- fastest path to a shared-tablet product
- no hardware lock-in
- phone and tablet can share the same core product model

Current implementation note:

- the repository currently uses JSON-backed persistence on the server for MVP delivery and testability
- the domain shape is intended to remain compatible with a future relational database migration

## 19. Open Questions

1. Should the first version support only one child profile to keep the UX opinionated?
2. Should rewards be visible to the child by default, or primarily parent-controlled?
3. Do parents want recorded voice prompts from themselves?
4. Should the product lean more toward routines or standalone chores on the home screen?
5. How much customization is necessary before templates become clutter?

## 20. Source Notes

This PRD is informed by:

- current home-management platform research in [Competitive landscape](../research/home-management-platform-landscape.md)
- age-appropriate chores guidance from HealthyChildren.org
- developmental milestone guidance from the CDC for 4-year-olds
