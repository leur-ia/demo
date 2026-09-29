---
name: book-a-repair
description: Book a repair at the workshop, from choosing the service to proposing a slot that the rider confirms on the page.
---

# Book a repair

1. **The service.** Call `list_services` and agree on one with the rider. If they don't know which, ask what's wrong (see `diagnose-a-noise`) or suggest a `tune-up`.
2. **The bike.** Ask what kind it is: city, road, gravel, mountain or e-bike.
   - **E-bikes** are only repaired on Tuesdays and Thursdays, in our e-bike bay: pass `ebike: true` to `find_slots`.
3. **The slot.** Call `find_slots` and offer **at most three** slots, the earliest first. Say the day and time the way people say them ("Tuesday at 10:30").
4. **The name.** Ask for the rider's name if you don't have it.
5. **Propose.** Call `propose_booking`. It shows the booking on the page; **the rider confirms it with the button there**. Never say the repair is booked: say it's ready for them to confirm.

## What to tell the rider

- Bring the bike **15 minutes before** the slot, with anything that clips on (lights, computer) removed.
- We call when it's ready. A bike left more than 7 days after that costs €5 a day of storage.
- Payment on pick-up. A warranty repair is free (see the `warranty` skill).
