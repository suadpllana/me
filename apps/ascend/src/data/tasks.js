// ── DEADLINE ──
export const DEADLINE_DATE = "2027-07-01T00:00:00";
export const DEADLINE_LABEL = "1 JULY 2027";
// When the journey began — used to gauge whether you're on pace. Pacing
// assumes a steady, linear effort from START_DATE to DEADLINE_DATE.
export const START_DATE = "2026-06-22T00:00:00";

// Task types:
//   { type: 'check' }                       → simple done/not done toggle
//   { type: 'progress', target: <number> }  → countable, +1 / -1, auto-completes at target
//   { type: 'checklist', target: <number> } → expandable accordion of named sub-items
//                                             you add/check off yourself. `target`
//                                             is only a starting goal; the real goal
//                                             grows to match however many items you
//                                             add. Completes when every item is
//                                             checked (and you've added at least
//                                             `target` of them).
//        stored value shape: { items: [{ id, name }], checked: { [itemId]: true } }

export const CATEGORIES = [
  {
    id: "religion",
    name: "Spirituality",
    icon: "✨",
    accent: "#fbbf24",
    tagline: "Forge the spirit",
    tasks: [
      { id: "rel_morning_prayer", type: "check", daily: true, name: "Morning prayer streak" },
      { id: "rel_evening_prayer", type: "check", daily: true, name: "Evening prayer streak" },
      { id: "rel_read_bible", type: "check", name: "Read the Bible" },
      { id: "rel_church", type: "check", name: "Attend church every Sunday" },
      { id: "rel_fast", type: "check", name: "Fast regularly" },
      { id: "rel_tv_show", type: "check", name: "Watch the chosen TV show" },
      {
        id: "rel_cut_sins",
        type: "checklist",
        target: 3,
        name: "Cut the 7 deadly sins",
        defaultItems: [
          "Pride — thinking you're above others, not admitting fault, letting ego rule",
          "Envy — resenting others' success, comparing yourself constantly",
          "Wrath — losing control, damaging relationships through anger",
          "Sloth — procrastinating on things you know you should do, spiritual laziness",
          "Greed — making money your god, never being satisfied, hoarding",
          "Gluttony — no discipline with food, drink, or consumption",
          "Lust — pornography, objectifying people, giving in to sexual sin",
        ],
      },
      {
        id: "rel_help",
        type: "checklist",
        target: 7,
        name: "Practice the 7 Christian virtues",
        defaultItems: [
          "Humility — serve others, put God first, don't seek glory or praise for yourself",
          "Kindness — show compassion to strangers, enemies, and the poor as Jesus commanded",
          "Patience — endure hardship without bitterness, trust God's timing not your own",
          "Diligence — work faithfully with the gifts God gave you, don't waste your potential",
          "Generosity — give your time, money, and help freely without expecting anything back",
          "Temperance — practice self-control over your body, desires, and habits daily",
          "Chastity — keep purity of mind and body, honor relationships as God designed them",
        ],
      },
      {
        id: "rel_christianity_videos",
        type: "checklist",
        target: 10,
        name: "Study 10 Christianity debatable arguments",
        defaultItems: [
          "Trinity",
          "Did Jesus claim to be God",
          "The Resurrection of Jesus",
          "Altering of the Bible",
          "New Testament vs Old Testament rules",
          "Free Will vs All-Knowing God",
          "Why did God create humans",
          "The Problem of Evil (including Animal Suffering)",
          "Religion by Geography",
          "The Divine Hiddenness",
        ],
      },
    ],
  },
  {
    id: "money",
    name: "Money",
    icon: "💰",
    accent: "#34d399",
    tagline: "Build the empire",
    tasks: [
      { id: "mon_forge_500", type: "check", name: "ForgeKs" },
      { id: "mon_polymarket", type: "check", name: "Polymarket Bot" },
      { id: "mon_arbitrage", type: "check", name: "Arbitrage betting" },
      { id: "mon_gmaps_leads", type: "check", name: "Sell Datasets/Leads" },
      { id: "mon_bug_bounty", type: "check", name: "Bug Bounty Program" },
      { id: "mon_respondent", type: "check", name: "Respondent.io (get paid for research interviews)" },
      { id: "mon_frontend_job", type: "check", name: "Full-time frontend developer job" },
      { id: "mon_pi_network", type: "check", name: "Pi Network" },
      { id: "mon_cs2_cases", type: "check", name: "CS2 cases" },
      { id: "mon_ecfito", type: "check", name: "Ecfito" },
{ id: "mon_fortnite_accounts", type: "check", name: "Sell Fortnite accounts" },
      { id: "mon_usertesting", type: "check", name: "UserTesting" },
      { id: "mon_stake", type: "check", name: "Stake" },
      { id: "mon_revamp_portfolio", type: "check", name: "Revamp portfolio and lscorporation.online" },
  
      { id: "mon_u7buy", type: "check", name: "U7buy" },
          {
        id: "mon_upwork",
        type: "checklist",
        target: 3,
        name: "Work as a Freelancer",
        defaultItems: [
          "Upwork",
          "Freelancer",
          "Fiverr",
        ],
      },
      {
        id: "mon_hunt_sidehustles",
        type: "checklist",
        daily: true,
        target: 5,
        name: "Hunt side hustles ",
        defaultItems: [
          "Reddit: r/slavelabour, r/forhire, r/jobbit, r/freelance, r/hiring, r/freelance_for_hire",
          "Discord: r/forhire server, Freelance Hub, Devnet, Reactiflux jobs, Indie Hackers, /job, For Hire, Freelancer, Freelancer community, MarkitupX, Freelanzo",
          "X: “hiring developer”, “need a dev”, “looking for freelancer”, #hiring, #freelance",
          "Telegram: Freelance Jobs, Remote Jobs, Web Dev Jobs, Crypto Jobs, Upwork Alerts",
          "Facebook: freelance groups, web dev jobs, remote work, startup jobs, local biz groups",
          "Solvearn: browse coding gigs, new postings, open bounties, client requests, my proposals",
        ],
      },
      { id: "mon_ls_clients_3", type: "checklist", target: 3, name: "Get projects from Google Maps Scrapper" },
      { id: "mon_nanoblock_store", type: "check", name: "Nanoblock store" },
    ],
  },
  {
    id: "mind",
    name: "Mind",
    icon: "🧠",
    accent: "#a78bfa",
    tagline: "Sharpen the blade",
    tasks: [
      { id: "min_meditation", type: "check", daily: true, name: "Meditate" },
      { id: "min_communities", type: "check", name: "Search for cool communities in Discord and Reddit" },
      { id: "min_university", type: "check", name: "Finish university " },
      { id: "min_course", type: "check", name: "Complete freeCodeCamp \"Build & Deploy a SaaS\" course" },
      { id: "min_course_crypto", type: "check", name: "Complete MoneyZG \"Full Cryptocurrency Trading Course - From Beginner To Expert\" (YouTube)" },
        { id: "min_letterboxd", type: "check", name: "List my watched movies in Letterboxd" },
      { id: "min_worldcup_highlights", type: "check", name: "Watch highlights of every World Cup game" },
      { id: "min_panini", type: "check", name: "Finish Panini Sticker Album" },
      {
        id: "min_books",
        type: "checklist",
        target: 8,
        name: "Read books",
        defaultItems: [
          "Jam Mysliman — Ben Blushi",
          "The Prince — Niccolò Machiavelli",
          "The Myth of Sisyphus — Albert Camus",
          "Emotional Intelligence — Daniel Goleman",
          "Notes from Underground — Fyodor Dostoevsky",
          "Animal Farm — George Orwell",
          "The Bible",
          "Letters from a Stoic — Seneca",
        ],
      },
      {
        id: "min_films",
        type: "checklist",
        target: 20,
        name: "Watch Movies",
        defaultItems: [
          "Chronicle",
          "Capernaum",
          "Come and See",
          "Lawrence of Arabia",
          "Spirited Away",
          "Stalker",
          "A Separation",
          "Burning",
          "Bicycle Thieves",
          "Into the Wild",
          "Apocalypse Now",
          "Spring, Summer, Fall, Winter... and Spring",
          "Rashomon",
          "Silence",
          "Paradise Now",
          "Incendies",
          "In the Mood for Love",
          "Ex Machina",
          "Obsession",
          "Little Miss Sunshine",
        ],
      },
      {
        id: "min_tv",
        type: "checklist",
        target: 6,
        name: "Watch TV shows",
        defaultItems: [
          "The Sopranos",
          "True Detective",
          "Better Call Saul",
          "Dexter",
          "Mr. Robot",
          "The Chosen"
        ],
      },
      {
        id: "min_anime",
        type: "checklist",
        target: 8,
        name: "Watch anime series",
        defaultItems: [
          "Bungou Stray Dogs",
          "Cowboy Bebop",
          "JoJo's Bizarre Adventure",
          "Assassination Classroom",
          "Fullmetal Alchemist: Brotherhood",
          "Kingdom",
          "Another",
          "Steins;Gate",
        ],
      },
      {
        id: "min_games",
        type: "checklist",
        target: 9,
        name: "Play  games",
        defaultItems: [
          "Batman: Arkham City",
          "God of War: Ragnarök",
          "Ghost of Tsushima",
          "Kingdom Come: Deliverance 2",
          "The Witcher 3: Wild Hunt",
          "GTA 6",
          "Assassin's Creed: Origins",
          "Far Cry Primal",
          "Call of Duty: Modern Warfare 2",
        ],
      },
      {
        id: "min_documentaries",
        type: "checklist",
        target: 5,
        name: "Watch documentaries",
        defaultItems: [
          "The Social Dilemma",
          "Europa: The Last Battle",
          "Planet Earth I",
          "Planet Earth II",
          "Inside Job",
        ],
      },
      {
        id: "min_hobbies",
        type: "checklist",
        target: 4,
        name: "Master Hobbies",
        defaultItems: [
          "CS2",
          "Ping Pong",
          "Chess",
          "FIFA 26",
        ],
      },
      { id: "min_yt", type: "checklist", target: 60, name: "Watch educational YouTube video essays" },
      {
        id: "min_podcasts",
        type: "checklist",
        target: 10,
        name: "Listen to long-form podcasts",
        defaultItems: [
          "Ex-CIA Spy John Kiriakou on Israel, Double Agents, and Direct Energy Weapons",
          "Aristotle: The World's Greatest Philosopher?",
          "Is the AfD a threat to Germany? Mehdi Hasan & Maximilian Krah | Head to Head",
          "1 Psychiatrist & 20 Depressed People (ft. Dr. K) | Surrounded",
          "NVIDIA CEO Jensen Huang's Vision for the Future",
          "Your Brain: Who's in Control? | Full Documentary | NOVA | PBS",
          "Professor Jiang: World War 3 Is About To Begin, Let Me Explain!",
          "Andrew Tate x Jack Neel Podcast (2026 Interview)",
          "Alex O'Connor: Why You Feel Stuck in Life (#1 Question to Ask Yourself NOW)",
          "Christian Vs Muslim: Was Jesus Muslim?",
        ],
      },
    
    ],
  },
  {
    id: "body",
    name: "Body",
    icon: "⚔️",
    accent: "#f87171",
    tagline: "Temper the vessel",
    tasks: [
      { id: "bod_gym", type: "check", daily: true, name: "Gym 6x per week consistently" },
      { id: "bod_physique", type: "check", name: "Reach target physique goal" },
      {
        id: "bod_skincare",
        type: "checklist",
        daily: true,
        target: 11,
        name: "Looksmaxx",
        defaultItems: [
          "Mewing — tongue fully flat on palate (back third included), teeth lightly touching, lips sealed. Constant habit.",
          "Canthal Tilt Massage — index fingers at outer eye corners, pull upward/outward toward temples while slightly squinting. 30–60 sec.",
          "Eyelid Hooding Drill — forehead relaxed, slowly lower upper eyelid without raising brows. 15 reps × 3 sets.",
          "Neck Curls — lie flat, curl chin to chest, hold 1 sec, lower slowly. 3 sets × 25 reps.",
          "Cheeks Pinch — squeeze cheeks, make kissing face, hold 10 sec. 10 reps.",
          "Chin Tucks — pull chin straight back (not down), hold 10 sec. 15 reps.",
          "Eyebrows — spoolie brush upward and slightly outward every morning.",
          "Nasal Tip Lift — index finger under nose tip, push upward against resistance. 30 reps × 2 sets.",
          "Skincare — wash with gentle cleanser, apply moisturizer with SPF.",
          "Ice Roller — 90-sec ice roller or ice cube after skincare.",
          "Hair — matte clay pomade on slightly damp hair. Wash max 3×/week.",
        ],
      },
      { id: "bod_sleep_sched", type: "check",daily: true, name: "Sleep 8 hours in the same time each night" },
      {
        id: "min_supplements",
        type: "checklist",
        target: 3,
        name: "Take useful supplements",
        defaultItems: [
          "Magnesium Glycinate",
          "Vitamin D3",
          "Omega-3",
        ],
      },
      { id: "bod_water", type: "check", daily: true, name: "Drink 2L water" },
      { id: "bod_stretch", type: "check", daily: true, name: "Stretch" },
      { id: "bod_protein", type: "check", daily: true, name: "Hit protein target (164–182g at 91kg)" },
      { id: "bod_track_macros", type: "check", daily: true, name: "Track calories" },
      { id: "bod_minimize_processed", type: "check", daily: true, name: "Minimize sugar" },
      { id: "bod_cold_shower", type: "check", daily: true, name: "Cold shower" },
    ],
  },
  {
    id: "wishlist",
    name: "Wishlist",
    icon: "🛒",
    accent: "#38bdf8",
    tagline: "Claim the rewards",
    tasks: [
      { id: "wish_car", type: "check", name: "Car" },
      { id: "wish_phone", type: "check", name: "Phone" },
      { id: "wish_laptop", type: "check", name: "Laptop" },
      { id: "wish_ps5", type: "check", name: "PS5" },
      { id: "wish_cd_album", type: "check", name: "CD album" },
      { id: "wish_cups", type: "check", name: "2 cups" },
      { id: "wish_wallet", type: "check", name: "Wallet" },
      { id: "wish_logo_real_madrid", type: "check", name: "Logo with Real Madrid" },
      { id: "wish_logo_psg", type: "check", name: "Logo with PSG" },
      { id: "wish_rm_jersey", type: "check", name: "Real Madrid jersey" },
      { id: "wish_funko_naruto", type: "check", name: "2 Funko Pop Naruto toys" },
      { id: "wish_carpet", type: "check", name: "Carpet" },
      { id: "wish_fridge", type: "check", name: "Small fridge" },
      { id: "wish_bean_bags", type: "check", name: "2 bean bags" },
      { id: "wish_mirror", type: "check", name: "Mirror" },
      { id: "wish_room_parfume", type: "check", name: "Room parfume" },
      { id: "wish_lamps", type: "check", name: "Lamps" },
      { id: "wish_corner_shelf", type: "check", name: "Corner shelf" },
      { id: "wish_christian_cross", type: "check", name: "Christian cross" },
      { id: "wish_laptop_shelf", type: "check", name: "Shelf for laptop" },
      { id: "wish_door_poster", type: "check", name: "Poster for door" },
      { id: "wish_zoro_sword", type: "check", name: "Sword" },
      { id: "wish_skanderbeg_figure", type: "check", name: "Skanderbeg figure" },
      { id: "wish_funko_other", type: "check", name: "Other Funko Pop toys" },
      { id: "wish_240hz_monitor", type: "check", name: "240Hz Monitor" },
      { id: "wish_gaming_chair", type: "check", name: "Better Gaming Chair" },
      { id: "wish_laptop_holder", type: "check", name: "Laptop Holder" },
      { id: "wish_bible", type: "check", name: "The Bible" },
      { id: "wish_sea_salt_spray", type: "check", name: "Sea salt spray" },
      { id: "wish_phone_case", type: "check", name: "Phone case" },
      { id: "wish_joystick", type: "check", name: "Joystick" },
      { id: "wish_table_chair", type: "check", name: "Table with chair" },
      { id: "wish_tv_shelf", type: "check", name: "One small shelf above TV" },
      {
        id: "wish_supplements",
        type: "checklist",
        target: 3,
        name: "Supplements",
        defaultItems: [
          "Magnesium Glycinate",
          "Vitamin D3",
          "Omega-3",
        ],
      },
      { id: "wish_game_posters", type: "check", name: "Buy more game posters" },
    ],
  },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

// ── DAILY TASKS ──
// Daily tasks (task.daily === true) reset their progress at the start of each
// local day. We track which day we last reset on with a "day key" — the local
// calendar date as YYYY-MM-DD. When the current day key differs from the stored
// one, every daily task's progress is cleared (see resetDailyProgress).
export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Reset daily tasks at day rollover. For a simple check the whole value is
// removed; for a checklist we keep its `items` (the permanent source links) and
// only clear the `checked` map, so a daily checklist re-presents the same items
// unchecked each day. Returns the same reference when nothing changed.
export function resetDailyProgress(progress, dailyTaskIds) {
  let changed = false;
  const next = { ...progress };
  for (const id of dailyTaskIds) {
    if (!(id in next)) continue;
    const value = next[id];
    if (value && typeof value === "object" && Array.isArray(value.items)) {
      // Daily checklist: keep items, wipe checks (skip if already empty).
      if (value.checked && Object.keys(value.checked).length > 0) {
        next[id] = { items: value.items, checked: {} };
        changed = true;
      }
    } else {
      delete next[id];
      changed = true;
    }
  }
  return changed ? next : progress;
}

// Collect the ids of all daily tasks across built-in + custom + edited tasks.
// `customTasks` is the per-category custom task map; `taskEdits` lets a built-in
// task be turned daily (or un-daily) via an edit override.
export function collectDailyTaskIds({ customTasks = {}, taskEdits = {} } = {}) {
  const ids = new Set();
  const edits = taskEdits ?? {};
  for (const cat of CATEGORIES) {
    for (const t of cat.tasks) {
      const daily = "daily" in (edits[t.id] ?? {}) ? edits[t.id].daily : t.daily;
      if (daily) ids.add(t.id);
    }
  }
  for (const list of Object.values(customTasks)) {
    for (const t of list ?? []) {
      if (t.daily) ids.add(t.id);
    }
  }
  return ids;
}

// Build a category's effective task list: built-in tasks (minus any the user
// deleted, with name/type edits applied) plus the user's custom tasks. Used by
// both the category page and the dashboard so counts stay in sync.
//   customTasks: { [categoryId]: [task] }
//   hiddenTasks: { [taskId]: true }
//   taskEdits:   { [taskId]: { name?, type? } }
export function mergeCategoryTasks(baseCategory, { customTasks, hiddenTasks, taskEdits } = {}) {
  const edits = taskEdits ?? {};
  const hidden = hiddenTasks ?? {};
  const custom = (customTasks ?? {})[baseCategory.id] ?? [];

  const applyEdit = (t) => {
    const e = edits[t.id];
    if (!e) return t;
    const merged = { ...t, ...e };
    if (merged.type === "checklist" && merged.target == null) merged.target = 1;
    return merged;
  };

  const visibleBuiltIn = baseCategory.tasks
    .filter((t) => !hidden[t.id])
    .map(applyEdit);

  return { ...baseCategory, tasks: [...visibleBuiltIn, ...custom] };
}

// Flatten every effective task across all categories into a single list, each
// tagged with its category. Used by the Stats page and the completion logger,
// which need to resolve a task id → name/type/daily/category regardless of
// which category it lives in.
export function mergeAllTasks(opts = {}) {
  const out = [];
  for (const base of CATEGORIES) {
    const cat = mergeCategoryTasks(base, opts);
    for (const t of cat.tasks) {
      out.push({ ...t, categoryId: base.id });
    }
  }
  return out;
}

// Build the seeded value for a checklist's defaultItems.
function buildSeedValue(task) {
  return {
    items: task.defaultItems.map((name, i) => ({
      id: `seed_${task.id}_${i}`,
      name,
    })),
    checked: {},
  };
}

// (Removed: content-based seed migration. It could not tell a user edit from a
// stale default and overwrote edits on reload. Seeding is now one-shot — see
// seedDefaultItems below.)
/* removed
function isPristineSeed_REMOVED(task, value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.items)) return false;
  if (Object.values(value.checked ?? {}).some(Boolean)) return false;
  const seedPrefix = `seed_${task.id}_`;
  const allSeed = value.items.every((it) => it.id.startsWith(seedPrefix));
  if (!allSeed) return false;
  // Same set of names as the current defaults? → nothing to migrate.
  const current = task.defaultItems.join(" ");
  const stored = value.items.map((it) => it.name).join(" ");
  return current !== stored; // pristine AND out of date
}

*/

// Seed checklist tasks that declare `defaultItems`, but ONLY once per task and
// ONLY when it has no stored items yet. We never overwrite an existing item
// list. `seeded` is a persisted marker map ({ [taskId]: true }); once a task is
// marked we leave it alone forever, even if the user empties it.
// Returns { progress, seeded }; new object refs only when something changed.
export function seedDefaultItems(progress, seeded = {}, opts = {}) {
  let changed = false;
  const nextProgress = { ...progress };
  const nextSeeded = { ...seeded };
  for (const task of mergeAllTasks(opts)) {
    if (!task.defaultItems || task.type !== "checklist") continue;
    if (seeded[task.id]) continue; // already handled once — never touch again
    const value = nextProgress[task.id];
    const hasItems = value && typeof value === "object" && Array.isArray(value.items);
    if (!hasItems) nextProgress[task.id] = buildSeedValue(task);
    nextSeeded[task.id] = true; // mark seeded regardless, so it's one-shot
    changed = true;
  }
  return changed
    ? { progress: nextProgress, seeded: nextSeeded }
    : { progress, seeded };
}

// Human-readable date label, e.g. "28th of June 2026", from a YYYY-MM-DD key.
export function formatDayLabel(key) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";
  return `${day}${suffix} of ${month} ${y}`;
}

// Number of checked items in a checklist task's stored value.
export function checklistCount(state) {
  if (!state || !state.checked) return 0;
  return Object.values(state.checked).filter(Boolean).length;
}

// The live goal for a checklist: starts at `target`, but grows so it always
// covers however many items you've added (add a 9th book → goal becomes 9).
// Floored at 1 so a checklist can never be "complete" with zero checked items
// (guards against a stray target: 0 with no items).
export function checklistGoal(task, state) {
  const itemCount = state?.items?.length ?? 0;
  return Math.max(1, task.target ?? 1, itemCount);
}

// A task counts as complete when:
//   check     → state === true OR state === "no-profit" (completed but earned nothing)
//   progress  → state (count) >= target
//   checklist → checked items >= goal (all items checked, ≥ target of them)
export function isTaskComplete(task, state) {
  if (task.type === "progress") return (state ?? 0) >= task.target;
  if (task.type === "checklist") return checklistCount(state) >= checklistGoal(task, state);
  return state === true || state === "no-profit";
}

// Category completion %  (each task weighted equally)
export function categoryProgress(category, progress) {
  const total = category.tasks.length;
  if (!total) return 0;
  const done = category.tasks.reduce(
    (n, t) => n + (isTaskComplete(t, progress[t.id]) ? 1 : 0),
    0
  );
  return Math.round((done / total) * 100);
}

// Number of completed tasks in a category
export function categoryDoneCount(category, progress) {
  return category.tasks.reduce(
    (n, t) => n + (isTaskComplete(t, progress[t.id]) ? 1 : 0),
    0
  );
}

// Sub-task–aware counting. A checklist task contributes one unit per item it
// tracks (its live goal) rather than a single unit, so "Read books" with 8
// books counts as 8 toward the total and however many are checked toward done.
// check/progress tasks still count as one unit each.
//   check     → done 0/1, total 1
//   progress  → total = target, done = min(count, target)
//   checklist → total = goal (grows with items), done = checked count (capped)
export function taskUnitCount(task, state) {
  if (task.type === "progress") {
    const total = Math.max(1, task.target ?? 1);
    return { done: Math.min(state ?? 0, total), total };
  }
  if (task.type === "checklist") {
    const total = checklistGoal(task, state);
    return { done: Math.min(checklistCount(state), total), total };
  }
  const done = state === true || state === "no-profit" ? 1 : 0;
  return { done, total: 1 };
}

// Category counts that weight each task by its number of sub-tasks.
// Returns { done, total, pct } — pct rounded to a whole percent.
export function categoryUnitProgress(category, progress) {
  let done = 0;
  let total = 0;
  for (const t of category.tasks) {
    const c = taskUnitCount(t, progress[t.id]);
    done += c.done;
    total += c.total;
  }
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

// ── PACING ──
// Are you on track to finish everything by the deadline? Compares your actual
// completion against the steady pace expected between START_DATE and
// DEADLINE_DATE. Returns the numbers a UI needs to say "ahead / behind".
export function computePace({ totalTasks, totalDone, now = Date.now() }) {
  const start = new Date(START_DATE).getTime();
  const end = new Date(DEADLINE_DATE).getTime();

  const totalMs = Math.max(1, end - start);
  const elapsedMs = Math.min(Math.max(0, now - start), totalMs);
  const remainingMs = Math.max(0, end - now);

  const DAY = 86400000;
  const MONTH = DAY * 30.437; // avg month length

  const daysLeft = Math.ceil(remainingMs / DAY);
  const monthsLeft = remainingMs / MONTH;

  // Where a steady effort would put you by now, vs. where you actually are.
  const timeElapsedFrac = elapsedMs / totalMs; // 0..1
  const expectedDone = Math.round(timeElapsedFrac * totalTasks);
  const expectedPct = Math.round(timeElapsedFrac * 100);
  // Floor (not round) so it matches the journey % shown elsewhere and never
  // reads 100% before everything is actually done.
  const actualPct = !totalTasks
    ? 0
    : totalDone >= totalTasks
    ? 100
    : Math.floor((totalDone * 100) / totalTasks);

  const remainingTasks = Math.max(0, totalTasks - totalDone);
  // Pace needed from now on to still finish on time.
  const perMonthNeeded = monthsLeft > 0 ? remainingTasks / monthsLeft : remainingTasks;
  const perWeekNeeded = remainingTasks / Math.max(remainingMs / (DAY * 7), 1e-9);

  const deltaPct = actualPct - expectedPct; // + ahead, − behind
  let status = "on-track";
  if (deltaPct >= 5) status = "ahead";
  else if (deltaPct <= -5) status = "behind";

  const finished = remainingTasks === 0;
  const overdue = remainingMs === 0 && !finished;

  return {
    actualPct,
    expectedPct,
    expectedDone,
    deltaPct,
    status, // "ahead" | "on-track" | "behind"
    finished,
    overdue,
    daysLeft,
    monthsLeft,
    remainingTasks,
    perMonthNeeded,
    perWeekNeeded,
  };
}
