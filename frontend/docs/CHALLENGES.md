# TuneTown Challenges

Three Level-ups were selected from different modules: L2 from Module 2, L3 from Module 3, and L8 from Module 5.

## L2: Unreliable search

- **Problem:** With search delays between 0 and 2 seconds, an older request can finish last and replace the results for the shopper's newest text.
- **Reproduction:** Start a search for `guitar`, immediately start another for `tabla`, then resolve the `tabla` request first and the `guitar` request last. Without a latest-request check, the final grid incorrectly shows guitars.
- **Fix:** The catalogue slice stores the newest Redux request ID and ignores fulfilled or rejected actions belonging to an older request. Search input remains debounced so rapid typing does not create a request per key.
- **Proof:** `catalogueSlice.test.js` resolves two searches out of order and proves that only the `tabla` product remains. The test passes.

## L3: Fast product browsing

- **Problem:** A shopper can open another product while reviews, related products, recently viewed data, or stock refresh work is still pending for the previous product.
- **Reproduction:** Set a noticeable developer delay, open one product, and quickly open a related product before the first page finishes. The URL and all visible information must describe the second product, and the first page must stop updating.
- **Fix:** The detail content is keyed by the URL product ID, its direct product request is aborted on cleanup, late supporting results are ignored after cleanup, and the 30-second stock timer is cleared. The service-event subscription also unsubscribes when the page changes.
- **Proof:** Manual navigation with delayed calls showed the product in the URL throughout; leaving the route removed the old timer and subscription. Lint and the production build pass with every effect cleanup present.

## L8: Half-filled checkout

- **Problem:** Leaving checkout previously discarded typed address and payment-choice fields.
- **Reproduction:** Add an item, enter a name on the Address step, and click the Cart link. Return to checkout and observe whether the name is still present. Card number, expiry, and CVV must never return.
- **Fix:** Checkout loads a safe draft before showing the form. When the shopper tries to leave checkout, a confirmation asks whether to leave and saves the reducer state before navigation. Returning restores ordinary fields, while card fields are removed before service logging and storage. A completed order clears the draft.
- **Proof:** A browser check entered `Asha Rao`, accepted the leave confirmation, returned from Cart, and found `Asha Rao` restored. Unit tests prove restored card fields are empty and the service never persists them.

## Step 19: Mentor bug hunt

Pending. This step requires the mentor-provided branch containing 10 seeded bugs. Symptoms, root causes, fixes, and AI review notes will be recorded here after that branch is supplied; no bug-hunt results have been invented.
