#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data.
# The testing data must be entered in yaml format Below is the data structure:
#
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Build Cosmic Blueprint — a Next.js full-stack astrology web app that:
   1. Calculates a user's natal chart from name, birth date/time, and location.
   2. Uses Nominatim for geocoding (free, no API key).
   3. Computes accurate planetary positions using astronomy-engine (J2000 ecliptic of date), whole-sign houses, ascendant/MC, and major aspects.
   4. Generates personalized AI reports via Emergent LLM key (GPT-4o through https://integrations.emergentagent.com/llm/v1).
   5. Offers 13 distinct report types + a $49.99 bundle.
   6. Real Stripe (test mode) payment for non-admin users; admins (admin@cosmicblueprint.com / Admin@2026) get free access.
   7. Passwordless magic-link sign-in via Resend (10-minute MongoDB TTL tokens).
   8. Subscribe form to save birth data for future use.
   9. Demo mode with celebrity charts (Einstein, Beyoncé, Gandhi).
   10. PDF download of reports via html2pdf.js.
   11. Modern minimal UI with shadcn/ui + Tailwind, interactive natal wheel SVG + planet cards.

backend:
  - task: "GET /api - health check"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "low"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Returns JSON { message, version }. Verified via curl."
  - task: "GET /api/report-types"
    implemented: true
    working: true
    file: "lib/reports.js + route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Returns 13 reports + bundle. Verified via curl."
      - working: true
        agent: "testing"
        comment: "✅ Verified: Returns 200 with 13 reports + bundle object. All report metadata present."
  - task: "POST /api/geocode (Nominatim)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Free Nominatim geocoding (OpenStreetMap). No API key. Sends User-Agent header per usage policy."
      - working: true
        agent: "testing"
        comment: "✅ Verified: POST /api/geocode with 'London, UK' returns 200 with results array containing lat/lng coordinates (51.5074456, -0.1277653)."
  - task: "POST /api/chart (natal chart computation)"
    implemented: true
    working: true
    file: "lib/natalChart.js + route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Uses astronomy-engine geocentric ecliptic-of-date longitudes for 10 planets, Meeus formula for LST/Asc/MC, whole-sign houses, major aspects with orbs. Tested with Beyoncé birth data."
      - working: true
        agent: "testing"
        comment: "✅ Verified: POST /api/chart returns 200 with complete chart: 10 planets, 12 houses, ascendant, midheaven, 16 aspects. Edge case tested: chart without time returns 10 planets with ascendant=null."
  - task: "POST /api/demo-chart (celebrity charts)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Einstein, Beyoncé, Gandhi celebrity birth data + computed chart."
      - working: true
        agent: "testing"
        comment: "✅ Verified: POST /api/demo-chart with id='beyonce' returns 200 with celebrity data and complete natal chart."
  - task: "POST /api/auth/admin/login (bcrypt)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js + lib/auth.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Email/password admin login. Admin seeded on startup from ADMIN_EMAIL/ADMIN_PASSWORD env vars. Sets JWT HttpOnly cookie."
      - working: true
        agent: "testing"
        comment: "✅ Verified: POST /api/auth/admin/login with correct credentials (admin@cosmicblueprint.com/Admin@2026) returns 200, sets cosmic_session cookie, user.role='admin'. Wrong password correctly returns 401."
  - task: "POST /api/auth/magic/request (Resend)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js + lib/email.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Generates 32-byte random token, hashes with SHA-256, stores in MongoDB with 10-min TTL, sends magic link via Resend. Returns devLink in non-prod for testing."
      - working: true
        agent: "testing"
        comment: "✅ Verified: POST /api/auth/magic/request with email returns 200 with {ok: true, devLink: '...'} containing token. Token extraction successful."
  - task: "POST /api/auth/magic/consume"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Atomic findOneAndDelete on token hash, age check, creates/finds user, sets JWT session cookie."
      - working: true
        agent: "testing"
        comment: "✅ Verified: POST /api/auth/magic/consume with valid token returns 200, creates user with role='user', sets cosmic_session cookie. Token is single-use: second attempt correctly returns 400."
  - task: "POST /api/reports/generate (GPT-4o via Emergent LLM key)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js + lib/llm.js + lib/reports.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Uses OpenAI SDK with Emergent LLM key & base URL https://integrations.emergentagent.com/llm/v1. Verified Emergent LLM endpoint with simple test call (returned 'COSMIC'). Requires auth + ownership (admin bypass). Saves report doc to MongoDB."
      - working: true
        agent: "testing"
        comment: "✅ Verified: POST /api/reports/generate with admin session returns 200 with report {id, reportType, content (936 words), chart}. Regular user without purchase correctly returns 402 'Payment required'. LLM integration working correctly."
  - task: "POST /api/stripe/checkout (real Stripe test mode)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js + lib/stripe.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Creates Stripe Checkout Session for individual reports ($9.99) or bundle ($49.99). Admin bypass marks purchase as paid directly. Pre-records pending purchase with birthData."
      - working: true
        agent: "testing"
        comment: "✅ Verified: POST /api/stripe/checkout with admin session returns URL with 'source=admin' (bypass working). Regular user returns valid Stripe checkout URL (https://checkout.stripe.com/...). Unauthenticated request correctly returns 401."
  - task: "POST /api/stripe/verify (session retrieve)"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Retrieves session by ID; marks purchase as paid if payment_status='paid'. Backup to webhook for dev (where webhooks may not be wired)."
  - task: "POST /api/stripe/webhook"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Verifies signature using STRIPE_WEBHOOK_SECRET if set. In dev with no secret, accepts unsigned events. Updates purchase to paid on checkout.session.completed."
  - task: "POST /api/subscribe"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "low"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Upserts subscription with email + name + birthData."
      - working: true
        agent: "testing"
        comment: "✅ Verified: POST /api/subscribe with email, name, birthData returns 200 with {ok: true}."
  - task: "GET /api/auth/me, /api/reports, /api/reports/[id], /api/purchases"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Auth/me returns current user. Reports list shows user's reports (admin sees all). GET report by id enforces ownership."
      - working: true
        agent: "testing"
        comment: "✅ Verified: GET /api/auth/me returns current user with correct role (admin/user). GET /api/purchases returns 13 purchases for admin. POST /api/auth/logout clears session correctly (subsequent /auth/me returns {user: null})."

frontend:
  - task: "Landing page with hero, form, demo, reports catalog"
    implemented: true
    working: true
    file: "components/cosmic-app.js + app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Verified via screenshot: hero loads, form renders, Beyoncé demo loads natal wheel."
      - working: true
        agent: "testing"
        comment: "✅ PASSED - Hero headline visible, both CTA buttons present, form has exactly 4 fields (name, date, time, place - NO timezone field), demo section with 3 celebrity buttons visible. Report prices correctly varied ($4.99 to $24.99), bundle at $49.99 with line-through $170.87."
  - task: "Interactive natal wheel SVG"
    implemented: true
    working: true
    file: "components/natal-wheel.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Renders zodiac signs, houses, planets with glyphs, aspect lines, Asc/MC markers."
      - working: true
        agent: "testing"
        comment: "✅ PASSED - Natal wheel SVG renders correctly with planets, zodiac signs, and aspect lines. Demo chart (Beyoncé) loads successfully. User chart generation works with 10 planet cards and Major Aspects section visible."
  - task: "Chart generation with location geocoding"
    implemented: true
    working: false
    file: "components/cosmic-app.js (LocationInput component)"
    stuck_count: 1
    priority: "high"
    needs_retesting: true
    status_history:
      - working: false
        agent: "testing"
        comment: "❌ CRITICAL - Geocoding API returns 502 error. When typing 'London' in birth place field, dropdown never appears. Direct API test shows: POST /api/geocode returns {status: 502, data: {error: 'geocoding failed'}}. This blocks location selection and prevents timezone/Ascendant/Midheaven data from being calculated. Chart still generates but without location-dependent features."
  - task: "Timezone badge and Ascendant/Midheaven cards display"
    implemented: true
    working: false
    file: "components/cosmic-app.js (ChartDisplay component)"
    stuck_count: 1
    priority: "high"
    needs_retesting: true
    status_history:
      - working: false
        agent: "testing"
        comment: "❌ FAILED - Timezone badge not visible in chart header (expected '🕒 Europe/London (UTC+1.00)'). Ascendant/Midheaven summary cards not rendering (0 fuchsia border cards found). Root cause: geocoding API failure prevents location coordinates from being available, so timezone and Asc/MC cannot be calculated. Chart without location shows 0 Ascendant elements."
  - task: "Admin login and authentication"
    implemented: true
    working: true
    file: "components/cosmic-app.js (AuthDialog component)"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "testing"
        comment: "✅ PASSED - Admin login successful with admin@cosmicblueprint.com / Admin@2026. Admin badge (🛡 Admin) displays in nav, admin email visible, 'Admin: all reports free' badge shows in reports section. Modal opens/closes correctly, Admin tab switching works."
  - task: "Admin report generation"
    implemented: true
    working: false
    file: "components/cosmic-app.js (generateReport function)"
    stuck_count: 1
    priority: "high"
    needs_retesting: true
    status_history:
      - working: false
        agent: "testing"
        comment: "❌ FAILED - Admin sees 'Generate' buttons (green) for owned reports and 'Unlock' buttons for non-owned reports. Clicking 'Generate' button does not produce report content (report article not visible after 6 seconds). Note: Admin already owns 13 reports from backend testing, so buttons correctly show 'Generate' not 'Generate free'. Issue is report generation itself failing."
  - task: "Subscribe form"
    implemented: true
    working: true
    file: "components/cosmic-app.js (SubscribeSection component)"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "testing"
        comment: "✅ PASSED - Subscribe form accepts email (sub@example.com), submits successfully, shows '✓ You're subscribed' success message."
  - task: "Magic link consume page"
    implemented: true
    working: "NA"
    file: "app/auth/magic/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Calls /api/auth/magic/consume with token from URL, redirects to home on success."
      - working: "NA"
        agent: "testing"
        comment: "⚠️ PARTIAL TEST - Magic link request works (devLink returned), but full flow test incomplete due to modal selector issues. Backend tests confirmed magic link consumption works correctly. Frontend integration needs manual verification."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus:
    - "Chart generation with location geocoding"
    - "Timezone badge and Ascendant/Midheaven cards display"
    - "Admin report generation"
  stuck_tasks:
    - "POST /api/geocode (Nominatim)" - Returns 502 error, blocking location selection
    - "Admin report generation" - Generate button doesn't produce report content
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      Built Cosmic Blueprint full-stack. Backend uses a single catch-all route at /app/api/[[...path]]/route.js dispatching to multiple handlers. Admin seed runs on first request.
      Test credentials:
        Admin login: admin@cosmicblueprint.com / Admin@2026 (POST /api/auth/admin/login)
        Stripe test card: 4242 4242 4242 4242 (any future expiry/CVC)
        Magic link: any email; dev response includes "devLink" you can curl directly to /api/auth/magic/consume
      All 21 backend tests previously passed.
  - agent: "main"
    message: |
      UPDATE — added auto-timezone resolution. The client no longer needs to send tzOffsetHours.
       - /api/chart now accepts only { date, time, lat, lng }
       - /api/reports/generate and /api/stripe/checkout normalize birthData (resolve tz if not given)
       - Frontend form no longer shows the TZ field
      The backend correctly handles historical timezones (NYC 1990 = EDT -4, Einstein Ulm 1879 = LMT +0:53).
      Priced reports tiered: $4.99 (Monthly) → $24.99 (Natal Chart); bundle = $49.99.
      Ready for FRONTEND testing now (user approved).

  - agent: "testing"
    message: |
      ✅ BACKEND TESTING COMPLETE - ALL 21 TESTS PASSED
      
      Comprehensive backend API testing completed at https://cosmic-blueprint-dev.preview.emergentagent.com/api
      
      Test Results Summary:
      - ✅ GET /api - Health check (200, message + version)
      - ✅ GET /api/report-types - Returns 13 reports + bundle
      - ✅ POST /api/geocode - Nominatim geocoding working (London, UK → lat/lng)
      - ✅ POST /api/chart - Natal chart computation (10 planets, 12 houses, ascendant, midheaven, 16 aspects)
      - ✅ POST /api/chart (no time) - Edge case: returns planets only, ascendant=null
      - ✅ POST /api/demo-chart - Celebrity charts (Beyoncé)
      - ✅ POST /api/auth/admin/login - Admin login with correct password (sets cookie, role=admin)
      - ✅ POST /api/auth/admin/login - Wrong password correctly returns 401
      - ✅ GET /api/auth/me - Session verification working for admin and regular users
      - ✅ POST /api/auth/magic/request - Magic link generation (returns devLink with token)
      - ✅ POST /api/auth/magic/consume - Token consumption (creates user, sets session, role=user)
      - ✅ POST /api/auth/magic/consume - Token reuse correctly rejected with 400 (single-use verified)
      - ✅ POST /api/stripe/checkout (admin) - Admin bypass working (URL contains source=admin)
      - ✅ POST /api/stripe/checkout (regular user) - Returns valid Stripe checkout URL
      - ✅ POST /api/stripe/checkout (no auth) - Correctly returns 401
      - ✅ GET /api/purchases - Admin sees 13 purchases (all report types)
      - ✅ POST /api/reports/generate (admin) - Report generation working (936 words, within 800-1400 range)
      - ✅ POST /api/reports/generate (regular user, no purchase) - Correctly returns 402 "Payment required"
      - ✅ POST /api/subscribe - Subscription working (returns {ok: true})
      - ✅ POST /api/auth/logout - Session clearing working (subsequent /auth/me returns {user: null})
      
      Critical Integrations Verified:
      - ✅ Emergent LLM (GPT-4o) - Report generation successful with proper word count
      - ✅ Nominatim Geocoding - Free geocoding service working
      - ✅ Stripe Test Mode - Checkout session creation working for regular users
      - ✅ MongoDB - All CRUD operations working (users, tokens, purchases, reports, subscriptions)
      - ✅ JWT Session Management - Cookie-based auth working correctly
      - ✅ bcrypt Password Hashing - Admin authentication secure
      
      Edge Cases Tested:
      - ✅ Chart computation without time (planets only)
      - ✅ Magic link token single-use enforcement
      - ✅ Admin bypass for Stripe checkout
      - ✅ Payment requirement enforcement for regular users
      - ✅ Unauthenticated request rejection
      
      All backend endpoints are working correctly. No critical issues found.

  - agent: "testing"
    message: |
      🔍 FRONTEND TESTING COMPLETE - 3 CRITICAL ISSUES FOUND
      
      Comprehensive Playwright testing completed at https://cosmic-blueprint-dev.preview.emergentagent.com/
      Viewport: 1440x900, Admin credentials: admin@cosmicblueprint.com / Admin@2026
      
      ✅ PASSING FLOWS (5/6):
      A. Landing page render - All elements present, 4 fields only (no timezone), demo buttons visible
      B. Demo chart flow - Beyoncé chart loads with natal wheel SVG
      C. Chart generation - Works with/without location, 10 planet cards + Major Aspects display
      D. Admin login - Successful, badge displays, "Admin: all reports free" badge visible
      F. Subscribe form - Email submission works, success message displays
      
      ❌ CRITICAL ISSUES (3):
      
      1. **GEOCODING API FAILURE (502 Bad Gateway)**
         - POST /api/geocode returns: {status: 502, data: {error: 'geocoding failed'}}
         - Location dropdown never appears when typing "London"
         - Blocks user from selecting birth location
         - Root cause: Nominatim API down, rate-limited, or network issue
         - Impact: Users cannot enter location, preventing timezone/Asc/MC calculation
      
      2. **TIMEZONE BADGE & ASC/MC CARDS MISSING**
         - Expected: "🕒 Europe/London (UTC+1.00)" badge in chart header
         - Actual: 0 timezone badge elements found
         - Expected: Ascendant/Midheaven summary cards (fuchsia border)
         - Actual: 0 Ascendant elements, 0 fuchsia border cards
         - Root cause: Geocoding failure → no lat/lng → no timezone/Asc/MC data
         - Chart without location shows same issue (0 Ascendant elements)
      
      3. **ADMIN REPORT GENERATION NOT WORKING**
         - Admin sees correct buttons: "Generate" (green) for owned reports, "Unlock" for non-owned
         - Clicking "Generate" button does not produce report content
         - Report article not visible after 6 seconds wait
         - Backend logs show: POST /api/reports/generate 200 in 8257ms (successful)
         - Issue appears to be frontend not displaying the generated report
      
      ⚠️ PARTIAL TEST:
      E. Magic link flow - Request works (devLink returned), but full flow test incomplete due to modal selector issues. Backend tests confirmed consumption works.
      
      📊 VERIFICATION DATA:
      - Report prices: 11 unique prices from $4.99 to $24.99 ✓
      - Highest: $24.99 (Natal Chart Reading) ✓
      - Lowest: $4.99 (Monthly Horoscope) ✓
      - Bundle: $49.99 with line-through $170.87 ✓
      - Admin owns 13 reports (from backend testing) ✓
      - Console error: "Failed to load resource: 502" on geocode endpoint
      
      Screenshots saved to /tmp/:
      - 01_landing_page.png - Hero, form, demo section
      - 02_demo_beyonce.png - Beyoncé natal wheel
      - 06_admin_login_form.png - Admin login modal
      - 07_admin_logged_in.png - Admin badge in nav
      - 11_subscribe_success.png - Subscribe success state
      - 12_chart_details.png - Chart with natal wheel (no timezone badge)
      - 13_chart_planets.png - Planet cards and aspects
      - 14_admin_reports.png - Report cards with Generate buttons
      - 17_chart_no_location.png - Chart without location (no Asc/MC)
      
      PRIORITY FIXES NEEDED:
      1. Fix geocoding API 502 error (check Nominatim connectivity, rate limits, error handling)
      2. Debug admin report generation display issue (backend returns 200, frontend doesn't show content)
      3. Verify timezone/Asc/MC calculation works once geocoding is fixed
