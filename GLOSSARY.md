# Kury

An app for a backyard chicken keeper to record the evening closing of the coop and the daily egg count, and to judge whether the egg count is reasonable for the flock size and season.

## Flock

**Flock**:
The configured set of birds the keeper owns, expressed as a number of hens and a number of roosters. Individual birds are not tracked.
_Avoid_: Herd, coop (the coop is the building, not the birds)

**Hen**:
A female chicken in the flock; the only birds counted toward egg expectations.
_Avoid_: Chicken (ambiguous: covers roosters too), layer

**Rooster**:
A male chicken in the flock. A flock may have zero, one or more.
_Avoid_: Cock, cockerel

## Daily record

**Day Entry**:
The single record for one calendar day, holding that day's Closing and Egg Count, plus the Flock as it was on that day. Either part may be filled in independently and edited later, including for past days.
_Avoid_: Log, report

**Closing**:
The evening check where the keeper records how many hens and roosters are in the coop before shutting it.
_Avoid_: Lock-up, check-in, headcount

**Shortfall**:
The difference between the Flock and the birds counted at Closing, when fewer birds were counted. A Shortfall does not change the Flock.
_Avoid_: Loss, missing count

**Egg Count**:
The total number of eggs collected on a given day.
_Avoid_: Harvest, yield

## Egg evaluation

**Laying Rate**:
The expected fraction of hens that lay an egg on a given day, determined by the month of the year.
_Avoid_: Productivity, efficiency

**Expected Eggs**:
The number of eggs expected on a day: the number of hens in that day's Flock (not those counted at Closing) multiplied by the Laying Rate for that month.

**Egg Rating**:
The verdict comparing the Egg Count to Expected Eggs: poor, normal or great.
_Avoid_: Score, grade
