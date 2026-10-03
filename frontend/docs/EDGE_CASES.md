# TuneTown Edge Cases

Edge cases will be added and verified throughout implementation. Each entry must be marked `handled`, `fixed`, or `not applicable` and include its evidence.

| ID  | Module       | Edge case                                            | Status  | Evidence                                                                                    |
| --- | ------------ | ---------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| E01 | Data service | Stored JSON is malformed or has the wrong schema     | Handled | Service falls back to original data; automated test                                         |
| E02 | Data service | A requested product ID does not exist                | Handled | `404` automated service test                                                                |
| E03 | Data service | An order requests more units than current stock      | Handled | `409` automated service test                                                                |
| E04 | Catalogue    | Product has `discountPercentage: 0`                  | Planned | Product-card test                                                                           |
| E05 | Catalogue    | Product omits `discountPercentage`                   | Planned | Product-card test                                                                           |
| E06 | Catalogue    | Product image is missing or broken                   | Planned | Image-fallback test                                                                         |
| E07 | Checkout     | Repeated submission uses the same submission ID      | Handled | Idempotent order automated test                                                             |
| E08 | Reviews      | Shopper submits a second review for one product      | Handled | Duplicate review returns `409` in automated test                                            |
| E09 | Checkout     | Draft contains card number, expiry, or CVV           | Handled | Service removes all card fields before persistence; automated test                          |
| E10 | Catalogue    | Filter controls overflow the sidebar at tablet width | Fixed   | Controls use shrinkable grid columns and fill only the available sidebar width              |
| E11 | Checkout     | Submit address or card fields with invalid formats   | Handled | Errors are announced and focus moves to the first invalid field; automated validation tests |
| E12 | Checkout     | Browser goes offline before placing an order         | Handled | Native online-status hook shows a banner and disables Place order; hook test                |
| E13 | Checkout     | Stock falls below a cart quantity before ordering    | Handled | One fresh stock call per item stops the order and lists shortages                           |
| E14 | Checkout     | Place order is clicked or submitted repeatedly       | Handled | A submission lock and stable submission ID combine with service idempotency                 |
| E15 | Checkout     | Mock card details could be persisted                 | Handled | Card fields remain in reducer memory and are excluded from the order payload                |
| E16 | Confirmation | Confirmation URL has no matching persisted order     | Handled | Browser verification confirms redirect to Home                                              |
| E17 | Confirmation | Cancellation occurs after the 60-second window       | Handled | Live countdown hides the button at zero and the service also rejects late cancellation      |
| E18 | Preferences  | Theme and delivery PIN are saved separately          | Handled | Preference service merges partial updates; automated test                                   |
| E19 | Preferences  | System color scheme changes while the app is open    | Handled | Theme provider listens to `matchMedia` changes                                              |
| E20 | Admin        | Manager chooses several replacement images           | Handled | Each old preview object URL is revoked and the final blob is stored in IndexedDB            |
| E21 | Admin        | Manager changes from editing product A to product B  | Handled | Route ID and loaded product key create a fresh form                                         |
| E22 | Admin        | Manager clicks Undo during the five-second delay     | Handled | Clearing the pending deletion cancels the timer before any service delete occurs            |
| E23 | Admin        | Manager leaves a changed form without saving         | Handled | Router blocker and `beforeunload` warning protect unsaved changes                           |
