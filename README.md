# PHCityRent — Property Discovery (Mobile)

A React Native property-discovery slice for PHCityRent: search verified rentals in Port
Harcourt, view them as a list or on a map, inspect a property, and save it for later.

Built for the PHCityRent Mobile Engineer take-home assessment. Shares its domain layer with
the web submission.

---

## Running it

**Requirements:** Node.js 20.19.4+ (developed on 24.21). No API keys, no accounts, no native build.

```bash
git clone <REPO_URL>
cd phcityrent-mobile
npm install
npx expo start
```

Then pick whichever is easiest:

| How | What to do |
|---|---|
| **Physical device** (recommended) | Install **Expo Go**, scan the QR code in the terminal |
| **Browser** | Press `w` — runs via react-native-web |
| **iOS Simulator** | Press `i` (requires Xcode) |
| **Android Emulator** | Press `a` (requires Android Studio) |

The app deliberately stays inside managed Expo Go — no custom native modules — so it runs
without a native toolchain.

```bash
npm test     # 17 tests
```

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | React Native 0.86 + Expo SDK 57 + TypeScript |
| Navigation | Expo Router (file-based) |
| Server state | TanStack React Query 5 |
| Local persistence | AsyncStorage |
| Images | `expo-image` |
| Icons | `@expo/vector-icons` |
| Data | Static TypeScript mock, 40 properties |
| Tests | Vitest |

---

## Architecture

```
src/
├── core/              Shared domain layer — no React, no React Native, no DOM
│   ├── types.ts           Property, SearchFilters, PropertyType
│   ├── queryKeys.ts       React Query cache key factory
│   ├── domains/pricing.ts Price breakdown + currency formatting
│   └── mock/properties.ts 40 mock properties
│
├── api/client.ts      Data access. Swap this file for a real API; nothing else changes.
│
├── app/               Expo Router routes — file path is the route
│   ├── _layout.tsx        Root stack + providers
│   ├── (tabs)/
│   │   ├── _layout.tsx    Tab bar
│   │   ├── index.tsx      Home
│   │   ├── search.tsx     Search (list + map modes)
│   │   └── saved.tsx      Saved
│   └── property/[id].tsx  Details — outside (tabs), so it pushes over the tab bar
│
├── components/        PropertyCard, PropertyImage, PropertyMapView, Wordmark
├── features/          useProperties, useProperty, SavedPropertiesProvider
├── hooks/             useDebouncedValue
└── theme.ts           Colour, spacing, radius and type tokens
```

### `core/` and `api/` are shared with the web submission, byte for byte

They contain no React, no DOM and no React Native imports, so they were copied across
unchanged — types, mock data, query keys, pricing rules and the data client. The 17 tests
came with them and pass in both projects without modification.

This is enforced rather than assumed: the test suite runs in a **Node** environment, so any
accidental browser or native dependency in those layers fails the build. That caught a real
bug during development — see AI disclosure.

### State: the right tool per kind

| Kind of state | Where it lives | Why |
|---|---|---|
| Server / async data | React Query | Caching, loading, retry and refetch handled for us |
| Search filters | Local `useState` in the Search screen | One screen owns them |
| Saved properties | Context + AsyncStorage | Read and written from four screens, must survive restart |
| Transient UI (image index, view mode) | Local `useState` | Never outlives the component |

Only saved-properties is global, and only because Expo Router keeps tab screens mounted —
independent hook instances would drift the moment you saved on one tab and switched to another.

### Ready for auth, push and real APIs

- **Real API:** replace `api/client.ts`. The query hooks, cache keys and screens are untouched.
- **Authentication:** `SavedPropertiesProvider` is the seam — swap AsyncStorage for
  authenticated API calls and nothing above it changes.
- **Secure tokens:** AsyncStorage holds only a list of saved property IDs, which is
  non-sensitive. Auth tokens would go in `expo-secure-store`, not here.
- **Push notifications:** no competing root-level provider, so `expo-notifications` slots
  into `app/_layout.tsx` alongside the existing providers.

---

## Features

- **Home** — persistent search bar that submits into Search, plus featured verified properties
- **Search** — location (debounced), price band, bedrooms, property type, verified-only
- **List / map toggle** — the same filtered results, two presentations
- **Property details** — swipeable gallery with counter, all-inclusive price breakdown,
  amenities, agent details with working `tel:` and `mailto:` actions
- **Saved** — save and unsave from any screen, persisted across app restarts
- **Pull-to-refresh** on both list screens

### Edge cases handled

| Case | Behaviour |
|---|---|
| Property with no images | Neutral "No photo available" placeholder |
| Image URL that fails to download | Same placeholder, tracked per URL so a different image is retried |
| Property with no coordinates | Omitted from the map, still listed; map caption reports the count |
| Missing description | Explanatory fallback text |
| Very long titles and addresses | `numberOfLines` clamping; full text preserved for screen readers |
| No search results | Empty state with guidance |
| No saved properties | Empty state, shown only after AsyncStorage has loaded |
| Search request fails | Error state with a retry button |

The mock data deliberately includes these: properties 7 and 23 have no images, 31 has no
coordinates, 12 has no description, and 4 and 19 have very long titles.

---

## Testing

```bash
npm test
```

**17 tests passing across 2 files** — the same suite as the web project, running unchanged.

| File | Covers |
|---|---|
| `src/core/domains/pricing.test.ts` | Breakdown composition; that displayed lines sum to the displayed total; that this holds for all 40 properties; currency formatting |
| `src/api/client.test.ts` | Each filter in isolation, filters combined, case-insensitive partial location matching, empty results, single-property lookup including not-found |

The environment is `node`, not `jsdom` or `jest-expo`, because these layers have no React
Native dependency. That is deliberate — it makes the shared-core boundary something the
build verifies rather than a claim in a README.

**Not covered:** component rendering. That would need `jest-expo` and a different runner;
with the time available I prioritised covering logic that can be silently wrong over
asserting that components mount.

---

## Key decisions

**A designed map mode rather than `react-native-maps`.** The spec permits "a map
implementation, map placeholder, or clearly designed map mode using mocked coordinates".
`react-native-maps` requires a Google Maps API key on Android — committing one to a public
repository is an automatic red flag — and it pushes the project out of Expo Go, meaning a
reviewer would need Xcode or Android Studio to run anything. The map mode plots each
property by normalising its coordinates against the bounds of the current result set, and
labels itself honestly as a schematic. Spatial relationships are real; the basemap is not.

**The web submission uses real Leaflet.** Same product decision, different constraints: on
the web there was no API key, no native build and no reviewer friction.

**`FlatList` everywhere, with `memo` on the card.** `FlatList` virtualises by default, so
only visible rows render. `PropertyCard` is wrapped in `memo`, and `toggleSave` takes an id
rather than being a per-row closure — a fresh arrow function each render would change the
prop identity and defeat memoisation entirely.

**Home submits into Search rather than filtering in place.** The Home search field is
transient: you type, you submit, it is discarded. Search owns the filter state. Two inputs
bound to one concept is a synchronisation bug waiting to happen.

**Details sits outside the `(tabs)` group.** That placement is what makes it push over the
tab bar with a native back button rather than rendering inside a tab. Navigation hierarchy
comes from file structure here, not code.

---

## Tradeoffs

**Plain `StyleSheet`, no UI library.** The spec mandates none (unlike the web brief, which
required Chakra). Adding one would have cost setup time; instead `theme.ts` holds colour,
spacing, radius and type tokens, and every screen composes from it — so consistency is
structural rather than remembered.

**Filters are chips, not dropdowns.** Six dropdowns is a poor mobile pattern. Horizontal
chip rows show the options and the current selection at a glance with no modal.

**Saved properties read from the mock directly** rather than through React Query. The saved
IDs are local; hydrating them needs no network call or cache entry. Behind a real API this
would become its own query hook.

---

## Known limitations

- **No component tests.** Logic is well covered; rendering is not.
- **No offline cache.** React Query holds results in memory only; a cold start with no
  network shows the error state. `@tanstack/query-async-storage-persister` would fix it.
- **The map is schematic, not geographic.** No panning, zooming or clustering.
- **Save has no pending or failure state.** AsyncStorage writes are effectively instant, so
  there is nothing to wait on. Behind an API this would become an optimistic mutation with
  rollback — the provider is already the right seam.
- **Pull-to-refresh is not on Saved**, because that screen reads local storage rather than a
  query. There is nothing to refetch.
- **Expo Router's typed-route generation** picks up non-route modules under `src/`, producing
  spurious entries in the generated types. Cosmetic; properly fixed by moving shared code
  outside the router's scan path.
- **Not tested on a physical iOS device.** Verified on Android via Expo Go and in the browser.

---

## What I would do with more time

1. Component tests with `jest-expo`, covering the save flow and filter interactions end to end.
2. Offline persistence for React Query, so a cold start shows cached results.
3. A real map behind an environment-injected key, with clustering — once key management
   exists and the app has moved beyond Expo Go.
4. Skeleton placeholders instead of spinners, matching the card layout.
5. Reanimated transitions on the gallery and card presses.
6. An accessibility pass with a screen reader on both platforms; labels and touch targets are
   in place but have not been verified with VoiceOver or TalkBack.

---

## AI disclosure

**Tool used:** Claude (Anthropic), via Claude Code, throughout.

I have tried to be precise rather than give a blanket statement, because "typed by me" and
"authored by me" are not always the same thing.

**Written by the model, reviewed and kept by me:** the screens and components in this
project were largely model-supplied. I directed the structure, made the product decisions,
questioned the output, and rejected or changed parts of it — removing the category pills
from Home, making the hero persistent, and replacing a static search pill with a real
submitting input were all my calls, made against the model's initial suggestions.

**Shared with the web project:** `core/` and `api/` were written during the web build and
copied here unchanged.

**Where the model corrected me, and where I corrected it:**

- A browser-only `window.location` check was introduced into the shared API client during
  web development. The Node-environment test suite caught it immediately — a dependency that
  would have crashed this app on its first fetch.
- Several bugs came from code landing incompletely: an unused `isActive` parameter in the web
  map, a `viewMode` state with no toggle wired to it here. TypeScript passed in both cases;
  unused variables and parameters are legal. Type checking catches wrong types, not missing
  wiring.

**I can explain and modify any part of this codebase**, which is what I understand the
requirement to be.

---

## Assumptions

- Rental prices are annual, as is standard in the Nigerian market.
- "All-Inclusive" means the quoted figure covers base rent, service charge and agency fee, so
  a tenant sees the true cost upfront rather than discovering additional charges at signing.
- Coordinates are mocked but plausible for the named Port Harcourt neighbourhoods.
- No authentication: saved properties are per-device, held in AsyncStorage.
