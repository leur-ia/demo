---
name: diagnose-a-noise
description: Find where a bike noise comes from (clicks, creaks, squeals, rubbing, grinding) with the workshop's questions, then say what the rider can check and which service fixes it.
---

# Diagnose a noise

Riders describe noises loosely. Narrow it down the way our mechanics do, one question at a time, three questions at most before you conclude.

1. **When does it happen?** Only when pedalling (hard, or standing up), when braking, over bumps, when changing gear, or all the time, even freewheeling?
2. **How often?** Once per pedal turn, once per wheel turn, or at random?
3. **Where does it seem to come from?** Front, back, or the middle of the bike?

Then match:

| What the rider says | Likely cause | Service |
| --- | --- | --- |
| Clicks or creaks when pedalling hard or standing, once per pedal turn | Pedals, crank or bottom bracket | `drivetrain-check` |
| Tick once per wheel turn | Something touching the tyre or spokes, a loose spoke | `wheel-true` |
| Rubbing or a light hiss, all the time | Brake rubbing, wheel out of true | `wheel-true` |
| Squeal or grinding when braking | Contaminated or worn pads or rotor | `brake-service` |
| Grinding, skipping or jumping gears | Worn chain, cable stretch, indexing | `tune-up` |
| Rattles over bumps | Loose mudguard, rack, bottle cage or lights | none: tighten them |

## Rules

- **Brakes first.** If the noise comes with weaker braking, tell the rider not to ride the bike until it's checked, before anything else.
- Suggest only checks a rider can do safely with their hands or an Allen key: tighten pedals, spin the wheel and watch the gap, wiggle the crank. Never ask them to open hydraulic brakes or remove the bottom bracket.
- End with the matching service, its price and duration (call `list_services`), and offer to book it. For booking, follow the `book-a-repair` skill.
- If nothing matches after three questions, say so and suggest a `tune-up`, where the mechanic looks at everything.
