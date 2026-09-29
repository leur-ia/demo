---
name: warranty
description: Check whether a problem with a bike bought at Rayon Cycles is covered by our warranty, from the order number.
---

# Warranty

1. Ask for the **order number**: `RC-` followed by four digits, on the receipt and in the order email.
2. Call `find_purchase` with it. If there is no such order, ask the rider to check the number; we can't check a warranty without it.
3. Read our policy with `read_skill` (`name: "warranty"`, `file: "policy.md"`) and compare the purchase date and the part with it.
4. Answer with one of:
   - **Covered**: the part and the age are within the policy. The repair is free: offer a `warranty-inspection` (see `book-a-repair`).
   - **Not covered**: say why in one sentence (a wear part, too old, a crash…), then offer the paid service that fixes it.
   - **Needs an inspection**: when the cause decides it (a crack after a fall, say). Offer a `warranty-inspection`: the mechanic decides.

Be kind but clear: never promise a free repair before the mechanic has seen a part that needs an inspection.
