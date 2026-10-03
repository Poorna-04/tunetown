# TuneTown State Map

| State                                       | Owner                                | Read by                                     | Changed by                                  | Persistence                       |
| ------------------------------------------- | ------------------------------------ | ------------------------------------------- | ------------------------------------------- | --------------------------------- |
| Product entities and list request state     | Redux catalogue slice                | Catalogue, details, related products, admin | Service thunks and admin actions            | Data service                      |
| Search, filters, sort, and page             | URL search parameters                | Catalogue controls and product grid         | Search and filter controls                  | URL                               |
| Cart entries                                | Redux shopping slice                 | Header, product details, cart, checkout     | Shopping actions and persistence middleware | Data service                      |
| Wishlist product IDs                        | Redux shopping slice                 | Product cards, details, wishlist            | Optimistic shopping actions and rollback    | Data service                      |
| Orders                                      | Data service and page-local state    | Confirmation and account orders             | Place and cancel service calls              | Data service                      |
| Current role                                | React Context                        | Header and admin guard                      | Role switch                                 | Data service                      |
| Delivery PIN                                | React Context                        | Header, details, cart, checkout             | PIN control                                 | Data service                      |
| Checkout step and fields                    | Checkout `useReducer`                | Address, payment, and review pages          | Checkout actions                            | None; draft restore belongs to L8 |
| Theme preference                            | React Context and document attribute | Entire document                             | Preferences page and system media query     | Data service                      |
| Admin search, sort, page, selection, delete | Admin products page state            | Store-manager product table                 | Table controls and five-second Undo timer   | None until delete expires         |
| Admin product fields                        | Native form and React 19 form action | Product add/edit page                       | Form inputs                                 | Data service after valid submit   |
| Gallery, tab, dialog, and field interaction | Component state                      | Owning component                            | Local controls                              | None                              |
| Developer service settings and log          | External service store               | Development panel                           | Development controls and service calls      | Development session               |

Derived totals, counts, filtered lists, rating summaries, order status, and delivery dates are calculated from source state rather than stored separately.
