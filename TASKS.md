# Exercise 5 — Jira Implementation Strategy

## Team

| Member | Role |
|--------|------|
| Yona (YB) | Developer |
| Shalev (SA) | Developer |
| Ariel (AB) | Developer |

**Sprint duration:** ~2 weeks
**Status meetings:** minimum twice per week. Decisions and blockers must be logged in Jira activity.
**Branching:** every subtask gets its own feature branch named with the Jira issue key (e.g. `APC-200-1a-mongoose-install`). All merges to `main` via PR only. The person who opens a PR cannot approve it — all other team members must approve before merge.

---

## Parallel Start Protocol

This protocol defines what each developer does on Day 1 so no one is waiting.

**Yona — starts immediately, fully independent:**
Open Jira, create sprint, assign issues. Then begin `APC-200-1` (MongoDB connection). The entire backend epic has zero dependency on Shalev or Ariel.

**Shalev — one priority before anything else:**
Do `APC-210-1a` and `APC-210-1b` first (Expo init + install navigation). Push the branch. Ping Ariel. Only then continue to `APC-210-1c`, `APC-210-1d`, and the auth screens. Shalev's only blocking commit is the project scaffold — get it out within the first 2-3 hours of Day 1.

**Ariel — starts Day 1 in parallel with Shalev:**
While Shalev initializes the project, Ariel writes `mobile/src/services/api.js` as a plain JavaScript file (it is just `fetch()` calls — no native dependencies, no project required to write it). Also write `RestaurantCard.jsx`, `ProductCard.jsx`, `OrderCard.jsx`, and `CartContext.jsx` as standalone files. Once Shalev pushes the scaffold (same day), Ariel pulls it and drops his files in.

**Shared interface contract (30-minute team sync on Day 1):**
Agree on the exact function signatures in `api.js` and the shape of `AuthContext` (`{ token, userId, username, isLoggedIn, login(), logout() }`). Both Shalev and Ariel code against these interfaces. Ariel stubs `useAuth()` as `() => ({ token: null, isLoggedIn: false })` until Shalev's real `AuthContext` is merged — this means Ariel is never blocked on auth to build UI.

---

## Goals

1. Migrate the Node.js backend from in-memory arrays to persistent MongoDB storage using Mongoose.
2. Build a React Native mobile app that mirrors the Ex4 web app functionality with a mobile-appropriate Wolt-inspired design.
3. Update Docker Compose to include a MongoDB service alongside the existing stack.
4. Produce a GitHub Wiki documenting the full system: environment setup, auth flows, and CRUD demo with screenshots.

---

## Roadmap

```
Week 1
  Day 1 (all parallel)
    Yona:   APC-200-1 (mongoose install + db.js + env config)
    Shalev: APC-210-1a/1b  ← PUSH scaffold immediately so Ariel can pull
    Ariel:  APC-210-2 (write api.js standalone) + component stubs

  Day 2-3
    Yona:   APC-200-2 (User model) + APC-200-3 (Restaurant + Product models)
    Shalev: APC-210-1c/1d + APC-211-1 (Register screen)
    Ariel:  APC-220-1 (Home screen) + APC-220-2 (Search)

  Day 4-5
    Yona:   APC-200-4 (Order model) + APC-200-5 (seed)
    Shalev: APC-211-2 (Login + AuthContext)
    Ariel:  APC-221-1 (Restaurant detail + CartContext)

Week 2
  Day 1-2
    Yona:   APC-230-1 (Docker + mongo service + README update)
    Shalev: APC-212-1 (Profile + theme + bottom tabs)
    Ariel:  APC-222-1 (Cart modal + place order)

  Day 3-4
    Yona:   APC-230-2 (Wiki pages + screenshots)
    Shalev: integration testing / PR reviews
    Ariel:  APC-223-1 (Order history + detail modal)

  Day 5
    All: Final integration test, merge all PRs, close sprint
```

---

## Blocked-by summary

| Issue | Blocked by | Owner |
|-------|------------|-------|
| APC-200-2 | APC-200-1 | Yona |
| APC-200-3 | APC-200-1 | Yona |
| APC-200-4 | APC-200-3 | Yona |
| APC-200-5 | APC-200-3 | Yona |
| APC-210-1b | APC-210-1a | Shalev |
| APC-210-1c | APC-210-1b | Shalev |
| APC-210-1d | APC-210-1c | Shalev |
| APC-210-2 | APC-210-1a (project must exist to wire in, can be written before) | Ariel |
| APC-211-1 | APC-210-1c, APC-210-2 | Shalev |
| APC-211-2 | APC-211-1 | Shalev |
| APC-212-1 | APC-211-2 | Shalev |
| APC-220-1 | APC-210-1d, APC-210-2 | Ariel |
| APC-220-2 | APC-220-1 | Ariel |
| APC-221-1 | APC-220-1 | Ariel |
| APC-222-1 | APC-221-1 | Ariel |
| APC-223-1 | APC-210-2 | Ariel |
| APC-230-1 | APC-200-1 | Yona |
| APC-230-2 | APC-230-1, APC-212-1, APC-223-1 | Yona |

**Cross-developer dependencies (the only ones that matter for blocking):**
- Ariel waits ~2-3 hours on Day 1 for `APC-210-1a/1b` (Shalev). Ariel uses this time to write `api.js` standalone.
- Ariel uses `AuthContext` stub until `APC-211-2` (Shalev) is merged. He wires the real context in `APC-222-1c` (place order) and `APC-223-1b` (orders screen) — both of which come late in week 1, giving Shalev enough time.
- Yona's backend is fully independent throughout the sprint.

---

---

## EPIC APC-200 — MongoDB Backend Migration

**Description:** Replace all four in-memory model arrays (users, restaurants, products, orders) with Mongoose-backed MongoDB collections. The REST API surface (routes, controllers, response shapes) must remain exactly the same so no client code changes are needed after migration.

**Assigned to:** Yona
**Blocked by:** none — starts Day 1, runs the full sprint independently

---

### User Story APC-200-1

**Name:** As a developer, I want a MongoDB connection and shared Mongoose configuration so all models can connect to the same database.

**Description:** Set up Mongoose in the Node.js server. Read `MONGODB_URI` from `process.env` (via `web/config.js`). Connect once at server startup and log success or exit with an error if connection fails. Add `MONGODB_URI` to `.env.example` and to the `web` service environment in `docker-compose.yml`. No individual model file should contain its own connection logic — one connection, shared everywhere.

**Assigned to:** Yona
**Blocked by:** none

| Subtask | Description | Assigned |
|---------|-------------|----------|
| APC-200-1a | Install `mongoose` via `npm install mongoose` inside `web/`. Verify it appears in `web/package.json`. | Yona |
| APC-200-1b | Create `web/db.js`. Call `mongoose.connect(process.env.MONGODB_URI)`. On success log `"MongoDB connected"`. On error log `"FATAL: MongoDB connection failed"` and call `process.exit(1)`. Export the connect function so `server.js` can await it. | Yona |
| APC-200-1c | In `web/server.js`, require `web/db.js` and call its connect function before `app.listen`. The server must not accept requests until the database is ready. | Yona |
| APC-200-1d | Add `MONGODB_URI=mongodb://127.0.0.1:27017/wolt` to `.env.example`. In `docker-compose.yml`, add `MONGODB_URI=mongodb://mongo:27017/wolt` to the `web` service environment block. Also add `MONGODB_URI` to `web/config.js` alongside the existing keys. | Yona |

---

### User Story APC-200-2

**Name:** As a developer, I want the user model backed by MongoDB so registrations and logins persist across server restarts.

**Description:** Replace the in-memory array in `web/models/userModel.js` with a Mongoose schema and model. Keep every field name identical (`username`, `password`, `name`, `phone`, `address`, `profileImage`) so no controller code needs to change except adding `await`. All four helper functions (`create`, `findByUsername`, `findById`, `validateLogin`) must keep the same signatures but become async. Update `userController.js` and `tokenController.js` to `await` every model call and wrap each handler in `try/catch`.

**Assigned to:** Yona
**Blocked by:** APC-200-1

| Subtask | Description | Assigned |
|---------|-------------|----------|
| APC-200-2a | Define `UserSchema` with fields: `username` (String, unique, required, trim), `password` (String, required), `name` (String, required, trim), `phone` (String, default `""`), `address` (String, default `""`), `profileImage` (String, default `null`). Export `mongoose.model('User', UserSchema)`. | Yona |
| APC-200-2b | Rewrite model helpers as async functions. `create(userData)` → `new User(userData).save()`. `findByUsername(username)` → `User.findOne({ username })`. `findById(id)` → `User.findById(id)`. `validateLogin(username, password)` → find user then compare hashed password (use the existing `manualHash` logic). | Yona |
| APC-200-2c | Update `web/controllers/userController.js` and `web/controllers/tokenController.js`. Add `async` to every handler function. Add `await` before every model call. Wrap each handler body in `try/catch` and call `next(err)` in the catch block to let the existing error handler respond with 500. | Yona |

---

### User Story APC-200-3

**Name:** As a developer, I want restaurant and product models backed by MongoDB so all CRUD operations persist.

**Description:** Replace `web/models/restaurantModel.js` and `web/models/productModel.js` with Mongoose models. Restaurant schema includes: `name`, `description`, `cuisine`, `rating`, `location` (`{ x, y }`), `image`, `ownerId`. Product schema includes: `restaurantId`, `name`, `description`, `price`, `image`. All controller files that touch these models must be updated to use `async/await`. The `getProducts` endpoint must still merge standalone `Product` documents with embedded menu items from the restaurant document.

**Assigned to:** Yona
**Blocked by:** APC-200-1

| Subtask | Description | Assigned |
|---------|-------------|----------|
| APC-200-3a | Define `RestaurantSchema` in `web/models/restaurantModel.js`. Fields: `name` (required), `description`, `cuisine`, `rating` (Number), `location` (`{ x: Number, y: Number }`), `image`, `ownerId` (String). Export `mongoose.model('Restaurant', RestaurantSchema)`. | Yona |
| APC-200-3b | Define `ProductSchema` in `web/models/productModel.js`. Fields: `restaurantId` (String, required), `name` (required), `price` (Number, required), `description`, `image`. Export `mongoose.model('Product', ProductSchema)`. | Yona |
| APC-200-3c | Rewrite all model helpers in both files as async. `getAll()` → `Restaurant.find()`. `getById(id)` → `Restaurant.findById(id)`. `create(ownerId, data)` → `new Restaurant({...data, ownerId}).save()`. `update(id, ownerId, data)` → `Restaurant.findOneAndUpdate({_id: id, ownerId}, data, {new: true})`. `remove(id)` → `Restaurant.findByIdAndDelete(id)`. Same pattern for `ProductModel`. | Yona |
| APC-200-3d | Update `web/controllers/restaurantController.js` and `web/controllers/productController.js`. Add `async` to every handler. `await` every model call. Wrap in `try/catch` with `next(err)`. In `getProducts`, merge `Product.find({restaurantId: id})` results with `restaurant.menu` array (keep existing merge logic, just make it async). | Yona |

---

### User Story APC-200-4

**Name:** As a developer, I want the order model backed by MongoDB so order history persists.

**Description:** Replace `web/models/orderModel.js` with a Mongoose model. Schema: `userId` (String, required), `restaurantId` (String, required), `items` (array of `{ productId: String, quantity: Number }`), `status` (String, default `"pending"`), timestamps (auto-created by Mongoose `{ timestamps: true }`). Update `web/controllers/orderController.js` with async model calls.

**Assigned to:** Yona
**Blocked by:** APC-200-3

| Subtask | Description | Assigned |
|---------|-------------|----------|
| APC-200-4a | Define `OrderSchema` with the fields above. Add `{ timestamps: true }` as the schema options so `createdAt` and `updatedAt` are managed by Mongoose. Export `mongoose.model('Order', OrderSchema)`. Rewrite helpers (`create`, `getAll`, `getById`, `update`, `remove`) as async using Mongoose methods. | Yona |
| APC-200-4b | Update `web/controllers/orderController.js`. Add `async` to every handler. `await` every model call. Wrap in `try/catch` with `next(err)`. `getAll` must filter by `userId` (from `req.userId` set by auth middleware). | Yona |

---

### User Story APC-200-5

**Name:** As a developer, I want the MongoDB database seeded with default restaurants on first run so the app always has data without manual setup.

**Description:** After the Mongoose connection is established on server startup, check if the `restaurants` collection is empty. If it is, read `web/data/restaurants.json` and insert all entries. This replaces the old `fs.readFileSync` approach. The seed must be idempotent — running it multiple times must not create duplicates.

**Assigned to:** Yona
**Blocked by:** APC-200-3

| Subtask | Description | Assigned |
|---------|-------------|----------|
| APC-200-5a | In `web/db.js` (or a separate `web/seed.js` called from `db.js`), after `mongoose.connect()` resolves: call `Restaurant.countDocuments()`. If the count is 0, read `data/restaurants.json`, call `Restaurant.insertMany(data)`, and log `"Seeded N restaurants"`. If count > 0, skip and log `"DB already has data, skipping seed"`. | Yona |
| APC-200-5b | Remove the `fs.readFileSync` import and `loadInitialRestaurants()` call from `web/models/restaurantModel.js`. The in-memory `restaurants` array and everything that depended on it is now replaced by the Mongoose model. Keep `data/restaurants.json` in the repo as the seed source. | Yona |

---

---

## EPIC APC-210 — React Native Project Scaffold

**Description:** Initialize the Expo project, install navigation, and create the folder structure and placeholder screens that every other epic builds on. `APC-210-1` (project init + nav) is owned by Shalev. `APC-210-2` (API service) is owned by Ariel and can be written in parallel as a standalone file before even pulling the project.

---

### User Story APC-210-1 — Project Init and Navigation

**Name:** As a developer, I want an Expo project initialized with React Navigation so all screens have a place to live.

**Description:** Run `npx create-expo-app mobile` at the repo root. Install React Navigation. Create the two-level navigator: `AuthStack` (Login, Register) and `MainTabs` (Home, Orders, Profile). Create placeholder screen files. **Push the branch immediately after `1a` and `1b` are done so Ariel can pull.** Do not wait until the full navigator is polished before pushing.

**Assigned to:** Shalev
**Blocked by:** none — Day 1 first task

| Subtask | Description | Assigned |
|---------|-------------|----------|
| APC-210-1a | Run `npx create-expo-app mobile --template blank`. Add `mobile/node_modules/`, `.expo/`, and `mobile/.env` to `.gitignore`. **Push branch immediately.** This is the unblocking commit for Ariel. | Shalev |
| APC-210-1b | Install React Navigation dependencies: `@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/bottom-tabs`, `react-native-screens`, `react-native-safe-area-context`. Confirm versions are compatible with current Expo SDK. | Shalev |
| APC-210-1c | Create `mobile/src/navigation/AppNavigator.jsx`. Define `AuthStack` with Login and Register screens, and `MainTabs` with Home, Orders, Profile tabs. Root navigator switches between stacks based on `isLoggedIn` boolean (reads from `AuthContext` once it exists; hard-code `false` for now). | Shalev |
| APC-210-1d | Create all placeholder screen files under `mobile/src/screens/`: `LoginScreen.jsx`, `RegisterScreen.jsx`, `HomeScreen.jsx`, `RestaurantDetailScreen.jsx`, `OrdersScreen.jsx`, `ProfileScreen.jsx`. Each renders a `<View><Text>ScreenName</Text></View>` placeholder. | Shalev |

---

### User Story APC-210-2 — Shared API Service Module

**Name:** As a developer, I want a single `api.js` module so every screen calls the backend through a consistent, token-aware interface.

**Description:** Create `mobile/src/services/api.js`. This is plain JavaScript using `fetch()` — **write it as a standalone file on Day 1, even before pulling the project.** It exports: `setToken(token)`, `clearToken()`, and one async function per backend endpoint. The base URL is set from a config constant (use `http://10.0.2.2:3000` for Android emulator / `http://localhost:3000` for iOS). All functions that require auth attach `Authorization: Bearer <token>` automatically. All functions that fail throw an error carrying the server's `error` message string so the calling screen can display it directly.

**Assigned to:** Ariel
**Blocked by:** APC-210-1a (project must exist to wire it in, but it can be written before that)
**Day 1 task — write this file while waiting for Shalev to push the scaffold**

| Subtask | Description | Assigned |
|---------|-------------|----------|
| APC-210-2a | Create `mobile/src/services/api.js`. At the top define `BASE_URL` and a module-level `_token = null`. Export `setToken(token)` that sets `_token`. Export `clearToken()` that sets `_token = null`. Write a private `request(method, path, body)` helper that calls `fetch(BASE_URL + path, { method, headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': 'Bearer ' + _token }) }, body: body ? JSON.stringify(body) : undefined })`. If `response.ok` is false, parse the JSON and throw `new Error(data.error)`. | Ariel |
| APC-210-2b | Using the `request` helper, implement all endpoint functions: `register(data)` → `POST /api/users`. `login(data)` → `POST /api/tokens`. `fetchRestaurants()` → `GET /api/restaurants`. `fetchRestaurantById(id)` → `GET /api/restaurants/:id`. `fetchProducts(restaurantId)` → `GET /api/restaurants/:id/products`. `searchRestaurants(query)` → `GET /api/search/:query`. `fetchOrders()` → `GET /api/orders`. `fetchOrderById(id)` → `GET /api/orders/:id`. `createOrder(data)` → `POST /api/orders`. `fetchUserProfile(userId)` → `GET /api/users/:id`. | Ariel |
| APC-210-2c | Verify the error handling contract: for every function, a non-ok response must throw `new Error(json.error)` (not a raw HTTP error). Write two simple test calls at the bottom under `if (require.main === module)` — these can be run with `node api.js` to smoke-test the connection. Remove before final PR. | Ariel |

---

---

## EPIC APC-211 — React Native Auth Screens

**Description:** Login and Registration screens with client-side field validation, profile photo selection from the device image library, JWT storage in `AsyncStorage`, and an `AuthContext` that provides auth state to every screen.

**Assigned to:** Shalev
**Blocked by:** APC-210-1c (navigator must exist), APC-210-2 (api.js must exist)

---

### User Story APC-211-1

**Name:** As a new user, I want to register with a username, display name, password, and a profile photo chosen from my phone.

**Description:** `RegisterScreen.jsx` shows a profile image picker at the top (tapping it launches `expo-image-picker`; the selected image shows as a preview), then username, display name, password, and confirm-password fields. Validation runs on submit: all fields required, password min 8 characters with at least one uppercase, one lowercase, and one digit, confirm-password must match. Validation errors appear inline below the relevant field, not in a popup. On successful API response, navigate to `LoginScreen`. On server error (e.g. duplicate username), show the error message below the submit button.

**Assigned to:** Shalev
**Blocked by:** APC-210-1c, APC-210-2

| Subtask | Description | Assigned |
|---------|-------------|----------|
| APC-211-1a | Install `expo-image-picker`. Build the form layout: `KeyboardAvoidingView` > `ScrollView` > image picker section > four `TextInput` fields > submit `TouchableOpacity`. Use Wolt-inspired colors (primary blue `#009DE0`, white background, dark text). Style photo picker as a circular avatar placeholder with a camera icon overlay. | Shalev |
| APC-211-1b | Write a `validate(fields)` helper inside the file. Returns `{ field: 'errorMessage' }` map. Render each error message as a small red `<Text>` immediately below its input. Disable the submit button while any error is present. Show password requirements as grey hint text below the password field before the user starts typing. | Shalev |
| APC-211-1c | On "Choose Photo" press, call `ImagePicker.launchImageLibraryAsync({ mediaTypes: 'Images', base64: true, quality: 0.5 })`. If not cancelled, store `result.assets[0].base64` in state and render the image in the avatar circle. Pass `profileImage: 'data:image/jpeg;base64,' + base64String` in the registration body. | Shalev |
| APC-211-1d | On submit (after validation passes), call `api.register(formData)`. On `201`, navigate to `LoginScreen` and show a brief toast or alert "Account created — please log in". On error, display `err.message` in a red banner below the submit button. | Shalev |

---

### User Story APC-211-2

**Name:** As a returning user, I want to log in and be taken directly to the home screen. If I am already logged in on this device, I want to skip the login screen entirely.

**Description:** `LoginScreen.jsx` shows username and password fields and a login button with a link to Register below. On submit, call `POST /api/tokens`. On success, store `token`, `userId`, and `username` in `AsyncStorage` via `AuthContext.login()`, call `api.setToken(token)`, then switch the navigator to `MainTabs`. On error, show the server's message. On app startup, `AuthContext` reads from `AsyncStorage` and, if a token is found, switches directly to `MainTabs` without showing the login screen.

**Assigned to:** Shalev
**Blocked by:** APC-211-1

| Subtask | Description | Assigned |
|---------|-------------|----------|
| APC-211-2a | Create `mobile/src/contexts/AuthContext.jsx`. On mount, call `AsyncStorage.multiGet(['token', 'userId', 'username'])`. If all values exist, set auth state immediately (this prevents the login screen flash). Expose `login(token, userId, username)` that calls `api.setToken(token)`, writes to `AsyncStorage`, and sets state. Expose `logout()` that calls `api.clearToken()`, calls `AsyncStorage.multiRemove(...)`, and clears state. Export `useAuth()` hook for easy consumption. | Shalev |
| APC-211-2b | Build `LoginScreen.jsx`. On submit validate both fields are non-empty. Call `api.login({ username, password })`. Extract `token` from response. Decode `userId` from the JWT payload (split on `.`, base64-decode middle segment, parse JSON, read `.sub`). Call `AuthContext.login(token, userId, username)`. On error, show `err.message` in a red banner. Add a "Don't have an account? Register" link at the bottom. | Shalev |
| APC-211-2c | Update `AppNavigator.jsx` to consume `useAuth()`. Replace the hard-coded `false` from `APC-210-1c` with `auth.isLoggedIn`. The navigator now switches between `AuthStack` and `MainTabs` reactively whenever `isLoggedIn` changes. | Shalev |

---

---

## EPIC APC-212 — React Native Profile, Theme, and Bottom Navigation

**Description:** Bottom tab navigation bar with icons, a Profile screen showing the logged-in user's avatar and name, a dark/light theme toggle backed by `AsyncStorage`, and a logout button that returns the user to the login screen.

**Assigned to:** Shalev
**Blocked by:** APC-211-2

---

### User Story APC-212-1

**Name:** As a logged-in user, I want a bottom navigation bar with Home, Orders, and Profile tabs, and a profile screen where I can see my account info, toggle the theme, and log out.

**Description:** The tab bar shows icons for each tab. The active tab icon and label use the Wolt primary blue. `ProfileScreen` fetches `GET /api/users/:id` using `auth.userId`, displays the circular avatar (from `profileImage` or a default placeholder), full name, and username. A `Switch` component toggles dark/light mode. A prominent logout button calls `auth.logout()`.

**Assigned to:** Shalev
**Blocked by:** APC-211-2

| Subtask | Description | Assigned |
|---------|-------------|----------|
| APC-212-1a | Update `AppNavigator.jsx`. Configure `BottomTabNavigator` with three tabs: Home, Orders, Profile. Import icons from `@expo/vector-icons` (Ionicons: `home`, `receipt`, `person`). Set `tabBarActiveTintColor: '#009DE0'`. Set `tabBarStyle` with a white background and subtle top border. | Shalev |
| APC-212-1b | Build `ProfileScreen.jsx`. On mount, call `api.fetchUserProfile(auth.userId)`. Render: circular avatar (100×100, `borderRadius: 50`) showing `profileImage` or a grey placeholder, `name` as large bold text, `@username` in grey below. Add `Switch` for theme and a red "Log Out" `TouchableOpacity`. On logout call `auth.logout()` — `AuthContext` handles navigation. | Shalev |
| APC-212-1c | Create `mobile/src/contexts/ThemeContext.jsx`. On mount read `theme` from `AsyncStorage` (default `"light"`). Expose `theme` and `toggleTheme()`. Create `mobile/src/theme.js` exporting a `colors(theme)` function returning `{ background, card, text, subtext, primary, border }` for both modes. Import and apply these in every screen and component — no hardcoded color values anywhere. | Shalev |

---

---

## EPIC APC-220 — React Native Home Screen and Search

**Description:** The home screen lists all restaurants as scrollable cards fetched from the API. Includes a search bar that queries the backend and shows results grouped into restaurants and menu items. A horizontal cuisine filter filters the list client-side without an extra API call.

**Assigned to:** Ariel
**Blocked by:** APC-210-1d (placeholder screens must exist), APC-210-2 (api.js must exist)

---

### User Story APC-220-1

**Name:** As a user, I want to see all restaurants on the home screen displayed as visual cards I can tap to open.

**Description:** `HomeScreen.jsx` calls `GET /api/restaurants` on mount (JWT attached if logged in so the server can order by distance). Renders a `FlatList` of `RestaurantCard` components. Each card shows the restaurant image banner, name, cuisine tag, and star rating. A loading spinner appears while fetching. An empty state message appears if the list is empty. Tapping a card navigates to `RestaurantDetailScreen` passing the `id` as a route param.

**Assigned to:** Ariel
**Blocked by:** APC-210-1d, APC-210-2

| Subtask | Description | Assigned |
|---------|-------------|----------|
| APC-220-1a | Create `mobile/src/components/RestaurantCard.jsx`. Props: `restaurant` object, `onPress`. Renders: full-width `Image` (height 140, `borderRadius: 12`), restaurant `name` in bold, cuisine tag in a small badge, star rating rendered as text (`"★ 4.5"`). Wrap in `TouchableOpacity` that calls `onPress`. Apply `ThemeContext` colors for background and text. | Ariel |
| APC-220-1b | Build `HomeScreen.jsx`. On mount, call `api.fetchRestaurants()`. Manage `loading`, `error`, and `restaurants` state. Render `ActivityIndicator` while loading. Render `FlatList` with `RestaurantCard` items and `keyExtractor={item => item._id || item.id}`. On press, navigate to `RestaurantDetailScreen` with `{ restaurantId: item._id }`. | Ariel |
| APC-220-1c | Add a horizontal `ScrollView` of cuisine filter pills above the `FlatList`. Pills: "All", then unique cuisine values from the restaurant list. On press, filter the displayed list client-side with `restaurants.filter(r => r.cuisine === selected)`. "All" clears the filter. Highlight the selected pill with `backgroundColor: '#009DE0'` and white text. | Ariel |

---

### User Story APC-220-2

**Name:** As a user, I want to type a search query and see matching restaurants and menu items listed below.

**Description:** A `TextInput` search bar is pinned above the restaurant list. When the user types (debounced 300ms), call `GET /api/search/:query`. Show a `SectionList` with two sections: "Restaurants" and "Menu Items". Each restaurant result navigates to `RestaurantDetailScreen`. Each menu item result navigates to its parent restaurant's detail screen. Pressing the `X` clear button resets the search and shows the full list again.

**Assigned to:** Ariel
**Blocked by:** APC-220-1

| Subtask | Description | Assigned |
|---------|-------------|----------|
| APC-220-2a | Add a `TextInput` with a search icon and a clear button to the top of `HomeScreen.jsx`. On change, set `query` state and start a 300ms `setTimeout` (cancel the previous one with `clearTimeout`). When the timeout fires, call `api.searchRestaurants(query)` and set `searchResults` state. Show `ActivityIndicator` inline while the request is in flight. | Ariel |
| APC-220-2b | When `searchResults` is set, render a `SectionList` instead of the `FlatList`. Two sections: `{ title: 'Restaurants', data: searchResults.restaurants }` and `{ title: 'Menu Items', data: searchResults.products }`. Each row renders name + short description. Tap on restaurant row navigates to `RestaurantDetailScreen`. Tap on product row navigates to `RestaurantDetailScreen` with the product's `restaurantId`. | Ariel |
| APC-220-2c | The clear (`X`) button inside the search bar is visible when `query.length > 0`. Pressing it sets `query = ''` and `searchResults = null`, which returns the view to the `FlatList` + cuisine filter layout. | Ariel |

---

---

## EPIC APC-221 — React Native Restaurant Detail, Menu, and Cart

**Description:** The restaurant detail screen shows the restaurant's header and full menu. Users add items to a cart managed by `CartContext`. A floating cart button appears at the bottom when the cart has items, opening the cart modal. `CartContext` enforces single-restaurant carts.

**Assigned to:** Ariel
**Blocked by:** APC-220-1

---

### User Story APC-221-1

**Name:** As a user, I want to view a restaurant's menu and add items to my cart.

**Description:** `RestaurantDetailScreen.jsx` receives `restaurantId` from navigation params. Fetches restaurant info and its products in parallel using `Promise.all`. Renders a banner header (image, name, cuisine, rating, description) above a `FlatList` of `ProductCard` components. Each card has a "+" button that calls `CartContext.addItem`. A floating "View Cart (N items)" button appears at the bottom of the screen whenever `cartCount > 0`.

**Assigned to:** Ariel
**Blocked by:** APC-210-2, APC-220-1

| Subtask | Description | Assigned |
|---------|-------------|----------|
| APC-221-1a | Create `mobile/src/components/ProductCard.jsx`. Props: `product`, `onAdd`. Renders: product image (or placeholder), name in bold, description in grey, price in bold, and a "+" circle button on the right. Use `ThemeContext` colors. `onAdd` is called with the product object when "+" is pressed. | Ariel |
| APC-221-1b | Build `RestaurantDetailScreen.jsx`. On mount, call `Promise.all([api.fetchRestaurantById(id), api.fetchProducts(id)])`. Set `restaurant` and `products` state. Render a fixed header (not part of the list scroll) with the restaurant image and info, then a `FlatList` of `ProductCard` items. Handle `loading` and `error` states. | Ariel |
| APC-221-1c | Create `mobile/src/contexts/CartContext.jsx`. State: `{ restaurantId: null, items: [] }` where each item is `{ productId, name, price, quantity }`. Expose: `addItem(product, restaurantId)` — if `restaurantId` differs from stored one, call `Alert.alert("Start new cart?", "Adding this item will clear your current cart.", ...)` before replacing. `removeItem(productId)`. `incrementItem(productId)`. `decrementItem(productId)` — removes if quantity reaches 0. `clearCart()`. Computed `cartCount` (total quantity). Computed `cartTotal` (sum of price × quantity). | Ariel |
| APC-221-1d | In `RestaurantDetailScreen.jsx`, add a floating `TouchableOpacity` button fixed at the bottom (absolute position, margin 16px, `borderRadius: 12`, blue background). It reads `"View Cart (N items)"` using `cartCount`. Visible only when `cartCount > 0`. On press, sets `cartVisible` state to true, which renders a `CartModal` component (built in APC-222). | Ariel |

---

---

## EPIC APC-222 — React Native Cart Modal and Order Placement

**Description:** A modal (bottom sheet style) showing the full cart with quantity controls and a grand total. A "Place Order" button calls `POST /api/orders`. Requires the user to be logged in. Shows a success alert on placement and clears the cart.

**Assigned to:** Ariel
**Blocked by:** APC-221-1

Note on auth dependency: `APC-222-1c` (place order) reads `auth.token` from `useAuth()`. By the time this subtask is in progress (week 2), Shalev's `APC-211-2` (AuthContext) will be merged. If it is not yet merged, stub `useAuth` locally as `() => ({ token: null, isLoggedIn: false })` and wire the real one at merge time.

---

### User Story APC-222-1

**Name:** As a logged-in user, I want to review my cart contents and place an order in one tap.

**Description:** `CartModal.jsx` is a `Modal` that slides up from the bottom. It shows a scrollable list of cart items (name, unit price, `−` quantity `+` controls, row total), a divider, and a grand total at the bottom. A "Place Order" button sends `POST /api/orders`. If the user is not logged in, the button shows "Log in to place an order" and is disabled. On success, clear the cart, close the modal, and show `Alert.alert("Order placed!")`. On error, show the error inline.

**Assigned to:** Ariel
**Blocked by:** APC-221-1c

| Subtask | Description | Assigned |
|---------|-------------|----------|
| APC-222-1a | Create `mobile/src/components/CartModal.jsx`. Use React Native `Modal` with `animationType="slide"`. Inside, render a drag handle, title "Your Cart", a `FlatList` of cart items, a total row, and the place-order button. Apply `ThemeContext` colors throughout. Include an `X` close button in the header. | Ariel |
| APC-222-1b | Each cart item row shows: item name, unit price, `TouchableOpacity` `−` button, quantity text, `TouchableOpacity` `+` button, row total (`price × quantity`). `−` calls `CartContext.decrementItem(productId)`. `+` calls `CartContext.incrementItem(productId)`. The grand total line below the list reads from `CartContext.cartTotal`. | Ariel |
| APC-222-1c | The "Place Order" button checks `auth.isLoggedIn` from `useAuth()`. If false, show the disabled state. If true, on press call `api.createOrder({ restaurantId: cart.restaurantId, items: cart.items.map(i => ({ productId: i.productId, quantity: i.quantity })) })`. On `201` call `clearCart()`, close modal, and show `Alert.alert("Order placed!", "Your order has been received.")`. On error, show `err.message` below the button in red. | Ariel |

---

---

## EPIC APC-223 — React Native Order History and Detail

**Description:** The Orders tab shows all past orders for the logged-in user. Each order shows restaurant, date, status badge, and item count. Tapping opens a detail modal with all items, quantities, and the current status. Unauthenticated users see a login prompt.

**Assigned to:** Ariel
**Blocked by:** APC-210-2

Note: This epic has minimal dependency on other epics. `APC-223-1a` (OrderCard component) can be started immediately alongside `APC-220-1` — it is a standalone visual component.

---

### User Story APC-223-1

**Name:** As a logged-in user, I want to see my order history and view the full details of any past order.

**Description:** `OrdersScreen.jsx` is the Orders tab. If `auth.isLoggedIn` is false, render a centered "Log in to see your orders" message with a button that navigates to `LoginScreen`. If logged in, fetch `GET /api/orders` on mount. Render a `FlatList` of `OrderCard` components sorted by `createdAt` descending. Tapping an order opens `OrderDetailModal`.

**Assigned to:** Ariel
**Blocked by:** APC-210-2

| Subtask | Description | Assigned |
|---------|-------------|----------|
| APC-223-1a | Create `mobile/src/components/OrderCard.jsx`. Props: `order`, `onPress`. Renders: restaurant name (or ID if name is not stored on the order), formatted creation date, status badge (`pending` = amber background, `confirmed` = green, `cancelled` = red, white text), item count `"N items"`. Wrap in `TouchableOpacity` calling `onPress`. Can be written standalone on Day 1. | Ariel |
| APC-223-1b | Build `OrdersScreen.jsx`. On mount, check `auth.isLoggedIn`. If false, render unauthenticated state. If true, call `api.fetchOrders()`. Manage `loading`, `error`, `orders` state. Render `FlatList` with `OrderCard`. On card press, set `selectedOrder` state and render `OrderDetailModal`. | Ariel |
| APC-223-1c | Create `mobile/src/components/OrderDetailModal.jsx`. Props: `order`, `onClose`. Renders: restaurant name or ID, formatted date, status badge, a list of items (each showing `productId` and `quantity`), and a calculated total (sum of `item.price × quantity` — if price is not stored on the order, show item count only and note "prices may vary"). Include a "Close" button. | Ariel |

---

---

## EPIC APC-230 — Docker, Wiki, and Final Integration

**Description:** Add the MongoDB service to Docker Compose, update README, and write the GitHub Wiki pages with screenshots demonstrating the entire system running end-to-end.

**Assigned to:** Yona
**Blocked by:** APC-200-5 (MongoDB stack complete), APC-212-1 (profile/auth complete), APC-223-1 (orders screen complete)

---

### User Story APC-230-1

**Name:** As a TA, I want to run `docker compose up` once and have the entire backend stack start, including MongoDB with seeded data.

**Description:** Add a `mongo` service to `docker-compose.yml` using the official `mongo:7` image with a named volume for persistence. Make the `web` service `depends_on` mongo. Pass `MONGODB_URI` through environment. Update `README.md` with the new startup steps and instructions for pointing the React Native app at the Dockerised backend.

**Assigned to:** Yona
**Blocked by:** APC-200-1d (env var config must be in place)

| Subtask | Description | Assigned |
|---------|-------------|----------|
| APC-230-1a | Add to `docker-compose.yml`: a `mongo` service with `image: mongo:7`, `volumes: [mongo_data:/data/db]`, and port `27017:27017`. Add `volumes: mongo_data:` at the bottom of the compose file. Make the `web` service `depends_on: [server, mongo]`. | Yona |
| APC-230-1b | Run `docker compose up` locally. Verify: C++ server starts, MongoDB starts, web server connects to MongoDB and logs `"MongoDB connected"`, seed runs and logs restaurant count, React web client loads and shows seeded restaurants. Fix any issues found. | Yona |
| APC-230-1c | Update `README.md`. Replace old startup instructions with the new `docker compose up` steps that include MongoDB. Add a section "Running the React Native app" with instructions to set `BASE_URL` in `mobile/src/services/api.js` to `http://10.0.2.2:3000` (Android) or `http://localhost:3000` (iOS), then `cd mobile && npx expo start`. | Yona |

---

### User Story APC-230-2

**Name:** As a TA, I want a GitHub Wiki with step-by-step documentation and screenshots showing the full system working.

**Description:** Create a `wiki/` folder at the repo root. Write four pages: system setup, auth flows, restaurant/product CRUD, and order flow. Every page must include terminal output and screenshots. Show both the web client and the React Native app where applicable.

**Assigned to:** Yona
**Blocked by:** APC-230-1, APC-212-1, APC-223-1

| Subtask | Description | Assigned |
|---------|-------------|----------|
| APC-230-2a | Create `wiki/01-setup.md`. Document: prerequisites (Docker, Node, Expo CLI), clone steps, `.env` setup from `.env.example`, and `docker compose up`. Include the expected terminal output showing all services healthy. Add a screenshot of the web client home screen after seed. | Yona |
| APC-230-2b | Create `wiki/02-auth.md`. Document the registration flow with screenshots: fill in the form → image picker in use → validation error state (weak password, duplicate username) → success. Then the login flow: login → home screen. Show both web and mobile side by side if possible. | Yona |
| APC-230-2c | Create `wiki/03-crud.md`. Document: open Owner panel (web) → create a restaurant → add a product to it → verify it appears in the home screen on both web and mobile. Include screenshots of each step. Also show edit and delete flows. | Yona |
| APC-230-2d | Create `wiki/04-orders.md`. Document: browse restaurants → tap a restaurant → add items to cart → place order → view in order history → tap order to see detail modal. Show from the mobile app. Include screenshots at each step. | Yona |

---

---

## Issue Backlog (Flat Reference Table)

| Issue | Type | Title | Owner | Blocked by |
|-------|------|--------|-------|------------|
| APC-200 | Epic | MongoDB Backend Migration | Yona | — |
| APC-200-1 | Story | MongoDB connection + Mongoose config | Yona | — |
| APC-200-1a | Subtask | Install mongoose, add to package.json | Yona | — |
| APC-200-1b | Subtask | Create web/db.js with connect + error exit | Yona | APC-200-1a |
| APC-200-1c | Subtask | Require db.js in server.js before listen | Yona | APC-200-1b |
| APC-200-1d | Subtask | MONGODB_URI in .env.example, config.js, docker-compose | Yona | APC-200-1b |
| APC-200-2 | Story | User model to MongoDB | Yona | APC-200-1 |
| APC-200-2a | Subtask | UserSchema definition + model export | Yona | APC-200-1 |
| APC-200-2b | Subtask | Async model helpers (create, find, validate) | Yona | APC-200-2a |
| APC-200-2c | Subtask | Async userController + tokenController | Yona | APC-200-2b |
| APC-200-3 | Story | Restaurant + product models to MongoDB | Yona | APC-200-1 |
| APC-200-3a | Subtask | RestaurantSchema + model export | Yona | APC-200-1 |
| APC-200-3b | Subtask | ProductSchema + model export | Yona | APC-200-1 |
| APC-200-3c | Subtask | Async model helpers for both | Yona | APC-200-3a, APC-200-3b |
| APC-200-3d | Subtask | Async restaurant + product controllers | Yona | APC-200-3c |
| APC-200-4 | Story | Order model to MongoDB | Yona | APC-200-3 |
| APC-200-4a | Subtask | OrderSchema + async helpers | Yona | APC-200-3 |
| APC-200-4b | Subtask | Async orderController | Yona | APC-200-4a |
| APC-200-5 | Story | Seed MongoDB on first run | Yona | APC-200-3 |
| APC-200-5a | Subtask | Idempotent seed in db.js startup hook | Yona | APC-200-3 |
| APC-200-5b | Subtask | Remove fs.readFileSync from restaurantModel | Yona | APC-200-5a |
| APC-210 | Epic | React Native Project Scaffold | Shalev / Ariel | — |
| APC-210-1 | Story | RN project init + navigation | Shalev | — |
| APC-210-1a | Subtask | Expo init + .gitignore — PUSH IMMEDIATELY | Shalev | — |
| APC-210-1b | Subtask | Install React Navigation dependencies | Shalev | APC-210-1a |
| APC-210-1c | Subtask | AppNavigator (AuthStack + MainTabs) | Shalev | APC-210-1b |
| APC-210-1d | Subtask | Placeholder screen files | Shalev | APC-210-1c |
| APC-210-2 | Story | Shared API service module | Ariel | APC-210-1a |
| APC-210-2a | Subtask | api.js base + request helper + setToken | Ariel | APC-210-1a |
| APC-210-2b | Subtask | All endpoint functions | Ariel | APC-210-2a |
| APC-210-2c | Subtask | Error contract + smoke test | Ariel | APC-210-2b |
| APC-211 | Epic | RN Auth Screens | Shalev | APC-210-1c |
| APC-211-1 | Story | Register screen with photo picker | Shalev | APC-210-1c, APC-210-2 |
| APC-211-1a | Subtask | Form layout + expo-image-picker install | Shalev | APC-210-1c, APC-210-2 |
| APC-211-1b | Subtask | Client-side validation + inline errors | Shalev | APC-211-1a |
| APC-211-1c | Subtask | Image picker + base64 preview | Shalev | APC-211-1a |
| APC-211-1d | Subtask | Submit to API + success/error display | Shalev | APC-211-1b, APC-211-1c |
| APC-211-2 | Story | Login screen + AuthContext | Shalev | APC-211-1 |
| APC-211-2a | Subtask | AuthContext with AsyncStorage + hooks | Shalev | APC-211-1 |
| APC-211-2b | Subtask | LoginScreen form + API call | Shalev | APC-211-2a |
| APC-211-2c | Subtask | Navigator switches on auth state | Shalev | APC-211-2b |
| APC-212 | Epic | RN Profile, Theme, Bottom Nav | Shalev | APC-211-2 |
| APC-212-1 | Story | Bottom tab nav + profile screen + theme | Shalev | APC-211-2 |
| APC-212-1a | Subtask | BottomTabNavigator with icons | Shalev | APC-211-2 |
| APC-212-1b | Subtask | ProfileScreen with avatar + logout | Shalev | APC-212-1a |
| APC-212-1c | Subtask | ThemeContext + theme.js color constants | Shalev | APC-212-1a |
| APC-220 | Epic | RN Home Screen and Search | Ariel | APC-210-1d |
| APC-220-1 | Story | Restaurant list with cards | Ariel | APC-210-1d, APC-210-2 |
| APC-220-1a | Subtask | RestaurantCard component | Ariel | APC-210-2 |
| APC-220-1b | Subtask | HomeScreen fetch + FlatList | Ariel | APC-220-1a |
| APC-220-1c | Subtask | Cuisine filter pills | Ariel | APC-220-1b |
| APC-220-2 | Story | Search bar + grouped results | Ariel | APC-220-1 |
| APC-220-2a | Subtask | Search TextInput + debounce + API call | Ariel | APC-220-1 |
| APC-220-2b | Subtask | SectionList search results | Ariel | APC-220-2a |
| APC-220-2c | Subtask | Clear search button behavior | Ariel | APC-220-2b |
| APC-221 | Epic | RN Restaurant Detail, Menu, Cart | Ariel | APC-220-1 |
| APC-221-1 | Story | Restaurant detail + menu + CartContext | Ariel | APC-210-2, APC-220-1 |
| APC-221-1a | Subtask | ProductCard component | Ariel | APC-220-1 |
| APC-221-1b | Subtask | RestaurantDetailScreen parallel fetch + render | Ariel | APC-221-1a |
| APC-221-1c | Subtask | CartContext (add, remove, increment, decrement, clear) | Ariel | APC-221-1b |
| APC-221-1d | Subtask | Floating cart button with item count badge | Ariel | APC-221-1c |
| APC-222 | Epic | RN Cart Modal and Order Placement | Ariel | APC-221-1 |
| APC-222-1 | Story | Cart modal + place order | Ariel | APC-221-1c |
| APC-222-1a | Subtask | CartModal layout (slide-up modal) | Ariel | APC-221-1c |
| APC-222-1b | Subtask | Quantity controls + dynamic total | Ariel | APC-222-1a |
| APC-222-1c | Subtask | Place Order API call + auth check + success/error | Ariel | APC-222-1b |
| APC-223 | Epic | RN Order History and Detail | Ariel | APC-210-2 |
| APC-223-1 | Story | Orders list + order detail modal | Ariel | APC-210-2 |
| APC-223-1a | Subtask | OrderCard component — can start Day 1 | Ariel | — |
| APC-223-1b | Subtask | OrdersScreen fetch + list + unauthenticated state | Ariel | APC-223-1a |
| APC-223-1c | Subtask | OrderDetailModal | Ariel | APC-223-1b |
| APC-230 | Epic | Docker, Wiki, Final Integration | Yona | APC-200-5, APC-212-1, APC-223-1 |
| APC-230-1 | Story | Docker Compose with MongoDB | Yona | APC-200-1d |
| APC-230-1a | Subtask | Add mongo service + volume to docker-compose | Yona | APC-200-1d |
| APC-230-1b | Subtask | Full docker compose up integration test | Yona | APC-230-1a |
| APC-230-1c | Subtask | Update README with new Docker + RN steps | Yona | APC-230-1b |
| APC-230-2 | Story | GitHub Wiki documentation + screenshots | Yona | APC-230-1 |
| APC-230-2a | Subtask | wiki/01-setup.md (setup + docker output) | Yona | APC-230-1 |
| APC-230-2b | Subtask | wiki/02-auth.md (register + login screenshots) | Yona | APC-230-2a |
| APC-230-2c | Subtask | wiki/03-crud.md (restaurant + product CRUD screenshots) | Yona | APC-230-2b |
| APC-230-2d | Subtask | wiki/04-orders.md (cart + order flow screenshots) | Yona | APC-230-2c |

---

## Workload Summary

| Member | Epics | Stories | Subtasks | Can start Day 1 without waiting |
|--------|-------|---------|----------|---------------------------------|
| Yona | APC-200, APC-230 | 7 | 21 | Yes — backend is fully independent |
| Shalev | APC-210-1, APC-211, APC-212 | 5 | 15 | Yes — project init is his first task |
| Ariel | APC-210-2, APC-220, APC-221, APC-222, APC-223 | 6 | 20 | Yes — api.js and OrderCard need no project |

**Total: 7 Epics, 18 User Stories, 56 Subtasks**

Cross-developer blocking is reduced to a single handoff: Shalev pushes the Expo scaffold (APC-210-1a) within the first few hours of Day 1. After that, Ariel drops his pre-written files in and both work independently.

---

---

---

## Jira Backlog (add these to Jira — one item per row)

This section is the minimal Jira-ready version of the full plan above. Each Epic, User Story, and Task here maps directly to the detailed work described in this file. Add exactly these items to Jira — do not add the individual subtasks from the sections above, as those live here in TASKS.md.

**5 Epics · 10 User Stories · 16 Tasks**

---

### Epic APC-E1 — MongoDB Backend Migration

> Migrate all four in-memory server models to MongoDB using Mongoose so data persists across restarts. Assigned to Yona.

**User Story APC-E1-S1:** As a developer, I want a Mongoose connection and async user model so user registrations and logins persist.

| Task | Description | Assigned |
|------|-------------|----------|
| APC-E1-S1-T1 | Set up Mongoose (`web/db.js`), connect on server startup, add `MONGODB_URI` to env config and Docker Compose, define `UserSchema`, rewrite model helpers as async. | Yona |
| APC-E1-S1-T2 | Update `userController.js` and `tokenController.js` to `await` model calls and handle errors with `try/catch`. | Yona |

**User Story APC-E1-S2:** As a developer, I want Restaurant, Product, and Order models backed by MongoDB so all CRUD data and order history persist.

| Task | Description | Assigned |
|------|-------------|----------|
| APC-E1-S2-T1 | Define `RestaurantSchema` and `ProductSchema`, rewrite their model helpers as async, update restaurant and product controllers. Seed default restaurants from `data/restaurants.json` on first run. | Yona |
| APC-E1-S2-T2 | Define `OrderSchema` with timestamps, rewrite order model helpers as async, update `orderController.js`. | Yona |

---

### Epic APC-E2 — React Native App Foundation

> Initialize the Expo project, set up navigation, implement authentication screens, and build the shared API service. Assigned to Shalev (project + auth) and Ariel (API service).

**User Story APC-E2-S1:** As a developer, I want an Expo project with React Navigation so all screens have a home.

| Task | Description | Assigned |
|------|-------------|----------|
| APC-E2-S1-T1 | Initialize `mobile/` with `create-expo-app`, install React Navigation, create `AppNavigator` with `AuthStack` (Login, Register) and `MainTabs` (Home, Orders, Profile), add placeholder screen files. Push scaffold immediately on completion. | Shalev |
| APC-E2-S1-T2 | Create `mobile/src/services/api.js` — shared HTTP service with `setToken`, `clearToken`, and one async function per backend endpoint. All functions attach Bearer token and throw descriptive errors on failure. | Ariel |

**User Story APC-E2-S2:** As a user, I want to register with a profile photo and log in, with my session persisted on the device.

| Task | Description | Assigned |
|------|-------------|----------|
| APC-E2-S2-T1 | Build `RegisterScreen` with image picker (`expo-image-picker`), client-side validation (password strength, required fields, confirm-password match), and API integration. | Shalev |
| APC-E2-S2-T2 | Build `LoginScreen`, implement `AuthContext` with JWT storage in `AsyncStorage` (auto-login on startup), and wire the navigator to switch between Auth and Main stacks based on login state. | Shalev |

---

### Epic APC-E3 — React Native Core Screens

> Home screen with restaurant browsing and search, restaurant detail with full menu, CartContext. Assigned to Ariel.

**User Story APC-E3-S1:** As a user, I want to browse restaurants, filter by cuisine, and search by name or menu item on the home screen.

| Task | Description | Assigned |
|------|-------------|----------|
| APC-E3-S1-T1 | Build `HomeScreen` with a `FlatList` of `RestaurantCard` components fetched from the API, horizontal cuisine filter pills, and navigation to `RestaurantDetailScreen`. | Ariel |
| APC-E3-S1-T2 | Add a debounced search bar to `HomeScreen` that calls `GET /api/search/:query` and renders results in a `SectionList` grouped into restaurants and menu items. | Ariel |

**User Story APC-E3-S2:** As a user, I want to view a restaurant's menu and add items to a cart.

| Task | Description | Assigned |
|------|-------------|----------|
| APC-E3-S2-T1 | Build `RestaurantDetailScreen` (parallel fetch of restaurant + products, banner header, `FlatList` of `ProductCard` components with "+" buttons). | Ariel |
| APC-E3-S2-T2 | Implement `CartContext` (add, remove, increment, decrement, clear, single-restaurant enforcement) and a floating cart button with item count badge on the detail screen. | Ariel |

---

### Epic APC-E4 — React Native Commerce and Profile

> Cart modal with order placement, order history screen, profile screen with theme and logout. Assigned to Ariel (cart + orders) and Shalev (profile + theme).

**User Story APC-E4-S1:** As a logged-in user, I want to review my cart, place an order, and view my order history.

| Task | Description | Assigned |
|------|-------------|----------|
| APC-E4-S1-T1 | Build `CartModal` (slide-up, quantity controls, dynamic total, "Place Order" button that calls `POST /api/orders` and shows success/error feedback). | Ariel |
| APC-E4-S1-T2 | Build `OrdersScreen` with `FlatList` of `OrderCard` (status badge, date, item count) and `OrderDetailModal` showing items and status. Show login prompt for unauthenticated users. | Ariel |

**User Story APC-E4-S2:** As a user, I want a profile screen showing my account info, a dark/light theme toggle, and a logout button.

| Task | Description | Assigned |
|------|-------------|----------|
| APC-E4-S2-T1 | Configure `BottomTabNavigator` with icons, build `ProfileScreen` (avatar, name, username fetched from API, logout button), implement `ThemeContext` with `AsyncStorage` persistence and a shared `theme.js` color constants file. | Shalev |

---

### Epic APC-E5 — Infrastructure and Documentation

> Add MongoDB to Docker Compose and write GitHub Wiki pages documenting the full system. Assigned to Yona.

**User Story APC-E5-S1:** As a TA, I want the full backend stack (C++ server, Node server, MongoDB) to start with a single `docker compose up`.

| Task | Description | Assigned |
|------|-------------|----------|
| APC-E5-S1-T1 | Add `mongo:7` service with named volume to `docker-compose.yml`, set `depends_on` on the web service, update `README.md` with new startup steps and React Native run instructions. | Yona |

**User Story APC-E5-S2:** As a TA, I want GitHub Wiki pages showing the full system running with screenshots.

| Task | Description | Assigned |
|------|-------------|----------|
| APC-E5-S2-T1 | Write `wiki/01-setup.md` (docker startup + expected output) and `wiki/02-auth.md` (register + login flows with validation error screenshots, web and mobile). | Yona |
| APC-E5-S2-T2 | Write `wiki/03-crud.md` (restaurant + product CRUD screenshots) and `wiki/04-orders.md` (cart → place order → order history screenshots from mobile). | Yona |

---

## Process Rules (from Ex5 requirements)

- Every subtask gets its own feature branch named with the Jira issue key.
- PRs must be approved by all other team members before merging to `main`.
- Jira status lifecycle: `To Do` → `In Progress` → `Code Review` → `Done`. Move to `Code Review` when the PR is opened. Move to `Done` after the PR is merged.
- Status meeting notes, blockers, and sprint decisions must be logged in Jira activity — not just in chat.
- No sensitive data (real passwords, API keys, JWT tokens) anywhere in the codebase, README, Wiki, or Jira.
- Do not commit `node_modules` or `mobile/node_modules`.
- Only free, legal, open-source libraries. No library not covered in course materials without explicit forum approval.
- Each developer works from their own machine with their own Git account. No co-authoring from a shared machine.
