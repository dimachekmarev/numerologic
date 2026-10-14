import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../../dist/server/index.js";
import { localDatabase } from "../local-db.mjs";
import { profile, daily, reduce, today } from "../engine.mjs";

function fixture(preview = true) {
  const env = {
      DB: localDatabase(),
      PREVIEW_MODE: preview ? "true" : "false",
      ASSETS: { fetch: () => new Response("") },
      APP_ORIGIN: "https://numerologic.example",
    },
    users = [];
  function client() {
    let cookie = "";
    const c = {
      async call(path, method = "GET", body, override = {}) {
        const req = new Request(env.APP_ORIGIN + path, {
          method,
          headers: {
            "Content-Type": "application/json",
            "X-Numerologic-Client": "web",
            Cookie: cookie,
            ...override,
          },
          ...(method !== "GET" ? { body: JSON.stringify(body || {}) } : {}),
        });
        const r = await worker.fetch(req, env, {}),
          value = r.headers.get("Content-Type")?.includes("application/pdf")
            ? new Uint8Array(await r.arrayBuffer())
            : await r.json();
        const set = r.headers.get("Set-Cookie");
        if (set) cookie = set.split(";")[0];
        return { status: r.status, value, headers: r.headers };
      },
      async setup(email) {
        await c.call("/api/auth/session", "POST");
        await c.call("/api/quiz/complete", "POST", {
          name: "Анна",
          birth_date: "1995-05-02",
          focus: "Ясность",
        });
        if (email)
          assert.equal(
            (
              await c.call("/api/auth/register", "POST", {
                email,
                password: "secure-pass-123",
              })
            ).status,
            200,
          );
        return c;
      },
    };
    users.push(c);
    return c;
  }
  return { env, client, close: () => env.DB.close() };
}
const orderBody = (key = "request-key-123", slug = "boundaries") => ({
  product_slug: slug,
  customer: { name: "Анна", birth_date: "1995-05-02", focus: "Ясность" },
  addons: [],
  consent: true,
  request_key: key,
});
test("periods reduce to 1–9; profile preserves masters and validates dates", () => {
  assert.equal(reduce(11), 2);
  assert.equal(reduce(22), 4);
  assert.equal(reduce(33), 6);
  assert.equal(profile("Дмитрий", "1984-05-02", "2026-10-07").life_path, 11);
  for (const birth of ["2025-02-30", "2030-01-01", "1899-01-01", "bad"])
    assert.throws(() => profile("Анна", birth));
});
test("daily symbols remain deterministic and change with calendar", async () => {
  const u = { id: 1, name: "Анна", birth_date: "1995-05-02" };
  assert.deepEqual(await daily(u, "2026-10-07"), await daily(u, "2026-10-07"));
  assert.notDeepEqual(
    await daily(u, "2026-10-07"),
    await daily(u, "2026-10-08"),
  );
});
test("sessions are HttpOnly; registration, logout and login preserve data", async () => {
  const f = fixture(),
    c = f.client(),
    s = await c.call("/api/auth/session", "POST");
  assert.match(s.headers.get("Set-Cookie"), /HttpOnly/);
  assert.match(s.headers.get("Set-Cookie"), /Secure/);
  await c.setup("login@example.com");
  await c.call("/api/journal", "POST", {
    day: today(),
    mood: 4,
    text: "Запись",
  });
  await c.call("/api/auth/logout", "POST");
  assert.equal((await c.call("/api/dashboard")).status, 401);
  assert.equal(
    (
      await c.call("/api/auth/login", "POST", {
        email: "login@example.com",
        password: "incorrect-pass",
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await c.call("/api/auth/login", "POST", {
        email: "login@example.com",
        password: "secure-pass-123",
      })
    ).status,
    200,
  );
  assert.equal(
    (await c.call("/api/dashboard")).value.entries[0].text,
    "Запись",
  );
  f.close();
});
test("journal upsert is private and only accepts real past dates", async () => {
  const f = fixture(),
    a = await f.client().setup(),
    b = await f.client().setup();
  const body = { day: today(), mood: 3, text: "Private" };
  assert.equal((await a.call("/api/journal", "POST", body)).status, 200);
  await a.call("/api/journal", "POST", { ...body, text: "Updated" });
  assert.equal((await a.call("/api/dashboard")).value.entries.length, 1);
  assert.deepEqual((await b.call("/api/dashboard")).value.entries, []);
  assert.equal(
    (await a.call("/api/journal", "POST", { ...body, mood: 8 })).status,
    422,
  );
  assert.equal(
    (await a.call("/api/journal", "POST", { ...body, day: "2099-01-01" }))
      .status,
    422,
  );
  f.close();
});
test("goals enforce ownership and appear in calendar", async () => {
  const f = fixture(),
    a = await f.client().setup(),
    b = await f.client().setup();
  const g = (
    await a.call("/api/goals", "POST", { title: "Один шаг", due: today() })
  ).value;
  assert.equal((await b.call("/api/goals/" + g.id, "DELETE")).status, 404);
  assert.equal(
    (await b.call("/api/goals", "POST", { ...g, title: "Changed" })).status,
    404,
  );
  const calendar = await a.call("/api/calendar?month=" + today().slice(0, 7));
  assert.equal(
    calendar.value.days.find((d) => d.date === today()).goals[0].title,
    "Один шаг",
  );
  assert.equal((await a.call("/api/calendar?month=2026-99")).status, 422);
  f.close();
});
test("checkout rejects guests, missing consent and unsupported addons", async () => {
  const f = fixture(),
    a = await f.client().setup();
  assert.equal(
    (await a.call("/api/checkout/create", "POST", orderBody())).status,
    403,
  );
  await a.call("/api/auth/register", "POST", {
    email: "buy@example.com",
    password: "secure-pass-123",
  });
  assert.equal(
    (
      await a.call("/api/checkout/create", "POST", {
        ...orderBody(),
        consent: false,
      })
    ).status,
    422,
  );
  assert.equal(
    (
      await a.call("/api/checkout/create", "POST", {
        ...orderBody(),
        addons: ["fake"],
      })
    ).status,
    422,
  );
  f.close();
});
test("orders use server prices, deduplicate requests and reject changed payloads", async () => {
  const f = fixture(),
    a = await f.client().setup("prices@example.com");
  const body = { ...orderBody(), amount: 1 };
  const r = await a.call("/api/checkout/create", "POST", body),
    next = await a.call("/api/checkout/create", "POST", body);
  assert.equal(r.value.total_amount, 550);
  assert.equal(r.value.order_id, next.value.order_id);
  assert.equal(
    (
      await a.call("/api/checkout/create", "POST", {
        ...body,
        customer: { ...body.customer, name: "Другое" },
      })
    ).status,
    409,
  );
  f.close();
});
test("test order fulfillment is idempotent; reports and PDF are private", async () => {
  const f = fixture(),
    a = await f.client().setup("owner@example.com"),
    b = await f.client().setup();
  const order = (await a.call("/api/checkout/create", "POST", orderBody()))
    .value;
  const result = await a.call("/api/checkout/mock-success", "POST", {
    order_id: order.order_id,
  });
  assert.equal(result.status, 200);
  await a.call("/api/checkout/mock-success", "POST", {
    order_id: order.order_id,
  });
  assert.equal((await a.call("/api/dashboard")).value.reports.length, 1);
  assert.equal((await b.call("/api/orders/" + order.order_id)).status, 404);
  assert.equal(
    (await b.call("/api/reports/" + result.value.report_id)).status,
    404,
  );
  assert.equal(
    (await b.call("/api/reports/" + result.value.report_id + "/pdf")).status,
    404,
  );
  const pdf = await a.call("/api/reports/" + result.value.report_id + "/pdf");
  assert.equal(pdf.status, 200);
  assert.equal(new TextDecoder().decode(pdf.value.slice(0, 5)), "%PDF-");
  f.close();
});
test("practice access, progress and club expiry survive reloads", async () => {
  const f = fixture(),
    a = await f.client().setup("practice@example.com");
  let p = (await a.call("/api/practices/boundaries")).value;
  assert.equal(p.days.length, 1);
  assert.equal(
    (
      await a.call("/api/progress", "POST", {
        slug: "boundaries",
        index: 1,
        done: true,
      })
    ).status,
    403,
  );
  const order = (
    await a.call(
      "/api/checkout/create",
      "POST",
      orderBody("club-request-key", "club"),
    )
  ).value;
  await a.call("/api/checkout/mock-success", "POST", {
    order_id: order.order_id,
  });
  p = (await a.call("/api/practices/boundaries")).value;
  assert.equal(p.days.length, 7);
  await a.call("/api/progress", "POST", {
    slug: "boundaries",
    index: 0,
    done: true,
  });
  assert.deepEqual(
    (await a.call("/api/practices/boundaries")).value.completed,
    [0],
  );
  assert.equal((await a.call("/api/dashboard")).value.club, true);
  const r = await f.env.DB.prepare(
    "SELECT id,data FROM cloud_records WHERE kind=?",
  )
    .bind("membership")
    .first();
  await f.env.DB.prepare("UPDATE cloud_records SET data=? WHERE id=?")
    .bind(
      JSON.stringify({
        ...JSON.parse(r.data),
        expires: "2020-01-01T00:00:00Z",
      }),
      r.id,
    )
    .run();
  assert.equal((await a.call("/api/dashboard")).value.club, false);
  f.close();
});
test("disabled payments cannot be confirmed with a success-page request", async () => {
  const f = fixture(false),
    a = await f.client().setup("disabled@example.com");
  assert.equal((await a.call("/api/config")).value.test_mode, false);
  assert.equal(
    (await a.call("/api/checkout/create", "POST", orderBody())).status,
    503,
  );
  assert.equal(
    (await a.call("/api/checkout/mock-success", "POST", { order_id: 1 }))
      .status,
    403,
  );
  f.close();
});
test("CSRF is rejected and analytics omit personal fields", async () => {
  const f = fixture(),
    a = await f.client().setup();
  assert.equal(
    (
      await a.call(
        "/api/goals",
        "POST",
        { title: "x", due: today() },
        { Origin: "https://attacker.example" },
      )
    ).status,
    403,
  );
  await a.call("/api/events", "POST", {
    event: "quiz_completed",
    properties: {
      product: "club",
      name: "Secret",
      birth: "1984-05-02",
      text: "Private",
    },
  });
  const r = await f.env.DB.prepare(
    "SELECT data FROM cloud_records WHERE kind=?",
  )
    .bind("event")
    .first();
  assert.deepEqual(JSON.parse(r.data).properties, { product: "club" });
  f.close();
});
test("export contains all entries; account deletion removes private records and sessions", async () => {
  const f = fixture(),
    a = await f.client().setup("delete@example.com");
  for (let i = 1; i <= 65; i++)
    await a.call("/api/journal", "POST", {
      day: new Date(Date.UTC(2020, 0, i)).toISOString().slice(0, 10),
      mood: 3,
      text: "Entry " + i,
    });
  assert.equal((await a.call("/api/export")).value.entries.length, 65);
  await a.call("/api/me", "DELETE");
  assert.equal((await a.call("/api/me")).status, 401);
  const count = await f.env.DB.prepare(
    "SELECT COUNT(*) AS n FROM cloud_records",
  ).first();
  assert.equal(count.n, 0);
  assert.equal(
    (
      await a.call("/api/auth/login", "POST", {
        email: "delete@example.com",
        password: "secure-pass-123",
      })
    ).status,
    401,
  );
  f.close();
});

test("master numbers 11/22/33 survive in the API, names and PDF", async () => {
  const f = fixture(false),
    a = await f.client().setup();
  for (const [birth, expected] of [
    ["1984-05-02", 11],
    ["1990-01-02", 22],
    ["1995-08-01", 33],
  ]) {
    const p = (
      await a.call("/api/quiz/complete", "POST", {
        name: "Дмитрий",
        birth_date: birth,
        focus: "Ясность",
      })
    ).value.profile;
    assert.equal(p.life_path, expected);
    assert.equal(typeof p.meaning, "string");
    assert.equal(p.arithmetic.includes("undefined"), false);
    assert.ok(p.year >= 1 && p.year <= 9);
    assert.ok(p.month >= 1 && p.month <= 9);
  }
  const pdf = await a.call("/api/profile/pdf");
  assert.equal(pdf.status, 200);
  assert.equal(new TextDecoder().decode(pdf.value.slice(0, 5)), "%PDF-");
  f.close();
});
test("registration rotates guest session and stores only a recovery digest", async () => {
  const f = fixture(false),
    a = f.client();
  const guest = await a.call("/api/auth/session", "POST"),
    cookie = guest.headers.get("Set-Cookie").split(";")[0];
  const r = await a.call("/api/auth/register", "POST", {
    email: "recover@example.com",
    password: "secure-pass-123",
  });
  assert.match(r.value.recovery_code, /^[a-f0-9]{64}$/);
  assert.notEqual(r.headers.get("Set-Cookie").split(";")[0], cookie);
  assert.equal(
    (await a.call("/api/me", "GET", null, { Cookie: cookie })).status,
    401,
  );
  const row = await f.env.DB.prepare(
    "SELECT data FROM cloud_records WHERE kind='security'",
  ).first();
  assert.equal(row.data.includes(r.value.recovery_code), false);
  assert.equal(
    JSON.stringify((await a.call("/api/export")).value).includes(
      r.value.recovery_code,
    ),
    false,
  );
  f.close();
});
test("recovery is one use, changes password, revokes devices and preserves personal records", async () => {
  const f = fixture(false),
    a = await f.client().setup(),
    b = f.client();
  const r = (
    await a.call("/api/auth/register", "POST", {
      email: "reset@example.com",
      password: "secure-pass-123",
    })
  ).value;
  await a.call("/api/journal", "POST", {
    day: today(),
    mood: 4,
    text: "Keep this",
  });
  await b.call("/api/auth/login", "POST", {
    email: r.email,
    password: "secure-pass-123",
  });
  assert.equal(
    (
      await b.call("/api/auth/reset-password", "POST", {
        email: r.email,
        password: "different-pass",
        recovery_code: "a".repeat(64),
      })
    ).status,
    400,
  );
  const reset = await a.call("/api/auth/reset-password", "POST", {
    email: r.email,
    password: "different-pass",
    recovery_code: r.recovery_code.match(/.{1,8}/g).join(" "),
  });
  assert.equal(reset.status, 200);
  assert.notEqual(reset.value.recovery_code, r.recovery_code);
  assert.equal((await b.call("/api/me")).status, 401);
  assert.equal(
    (
      await b.call("/api/auth/login", "POST", {
        email: r.email,
        password: "secure-pass-123",
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await b.call("/api/auth/login", "POST", {
        email: r.email,
        password: "different-pass",
      })
    ).status,
    200,
  );
  assert.equal(
    (await b.call("/api/journal")).value.entries[0].text,
    "Keep this",
  );
  assert.equal(
    (
      await b.call("/api/auth/reset-password", "POST", {
        email: r.email,
        password: "another-pass",
        recovery_code: r.recovery_code,
      })
    ).status,
    400,
  );
  f.close();
});
test("changing password requires current secret and revokes other devices", async () => {
  const f = fixture(false),
    a = await f.client().setup("change@example.com"),
    b = f.client();
  await b.call("/api/auth/login", "POST", {
    email: "change@example.com",
    password: "secure-pass-123",
  });
  assert.equal(
    (
      await a.call("/api/auth/change-password", "POST", {
        current_password: "wrong-password",
        password: "new-password123",
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await a.call("/api/auth/change-password", "POST", {
        current_password: "secure-pass-123",
        password: "new-password123",
      })
    ).status,
    200,
  );
  assert.equal((await a.call("/api/me")).status, 200);
  assert.equal((await b.call("/api/me")).status, 401);
  assert.equal(
    (
      await a.call("/api/auth/recovery-code", "POST", {
        password: "new-password123",
      })
    ).status,
    200,
  );
  f.close();
});
test("trial needs an account, opens materials without fake payment and cannot be renewed", async () => {
  const f = fixture(false),
    a = await f.client().setup();
  assert.equal((await a.call("/api/trial", "POST")).status, 403);
  await a.call("/api/auth/register", "POST", {
    email: "trial@example.com",
    password: "secure-pass-123",
  });
  const t = (await a.call("/api/trial", "POST")).value;
  assert.equal(t.active, true);
  assert.equal((await a.call("/api/trial", "POST")).value.expires, t.expires);
  assert.equal(
    (await a.call("/api/practices/boundaries")).value.days.length,
    7,
  );
  assert.equal(
    (
      await a.call("/api/progress", "POST", {
        slug: "boundaries",
        index: 2,
        done: true,
      })
    ).status,
    200,
  );
  const r = (await a.call("/api/materials", "POST", { slug: "deep-reading" }))
    .value;
  assert.ok(r.id);
  assert.equal(
    (await a.call("/api/materials", "POST", { slug: "deep-reading" })).value.id,
    r.id,
  );
  assert.equal(
    (await a.call("/api/checkout/create", "POST", orderBody())).status,
    503,
  );
  const old = await f.env.DB.prepare(
    "SELECT id FROM cloud_records WHERE kind='trial'",
  ).first();
  await f.env.DB.prepare("UPDATE cloud_records SET data=? WHERE id=?")
    .bind(JSON.stringify({ expires: "2020-01-01T00:00:00Z" }), old.id)
    .run();
  assert.equal((await a.call("/api/trial", "POST")).value.active, false);
  assert.equal(
    (
      await a.call("/api/progress", "POST", {
        slug: "boundaries",
        index: 2,
        done: false,
      })
    ).status,
    403,
  );
  assert.equal(
    (await a.call("/api/materials", "POST", { slug: "year-forecast" })).status,
    403,
  );
  assert.equal((await a.call("/api/reports/" + r.id)).status, 200);
  f.close();
});
test("trial reports and partners are isolated and idempotent", async () => {
  const f = fixture(false),
    a = await f.client().setup("pair@example.com"),
    b = await f.client().setup("other@example.com");
  await a.call("/api/trial", "POST");
  const partner = { name: "Дмитрий", birth_date: "1984-05-02" },
    r = (
      await a.call("/api/materials", "POST", { slug: "compatibility", partner })
    ).value;
  assert.match(r.content, /путь 11/);
  assert.equal((await b.call("/api/reports/" + r.id)).status, 404);
  assert.equal((await b.call("/api/reports/" + r.id + "/pdf")).status, 404);
  assert.equal(
    (await a.call("/api/materials", "POST", { slug: "compatibility", partner }))
      .value.id,
    r.id,
  );
  const changed = (
    await a.call("/api/materials", "POST", {
      slug: "compatibility",
      partner: { ...partner, name: "Дима" },
    })
  ).value;
  assert.notEqual(changed.id, r.id);
  assert.equal(
    (await a.call("/api/materials", "POST", { slug: "compatibility" })).status,
    422,
  );
  f.close();
});
test("first free practice is trackable; later days need access and strict boolean", async () => {
  const f = fixture(false),
    a = await f.client().setup();
  assert.equal(
    (
      await a.call("/api/progress", "POST", {
        slug: "boundaries",
        index: 0,
        done: true,
      })
    ).status,
    200,
  );
  assert.deepEqual(
    (await a.call("/api/practices/boundaries")).value.completed,
    [0],
  );
  assert.equal(
    (
      await a.call("/api/progress", "POST", {
        slug: "boundaries",
        index: 1,
        done: true,
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await a.call("/api/progress", "POST", {
        slug: "boundaries",
        index: 0,
        done: "false",
      })
    ).status,
    422,
  );
  f.close();
});
test("journal pagination, whole-history search, single-date editing and removal are private", async () => {
  const f = fixture(false),
    a = await f.client().setup(),
    b = await f.client().setup();
  for (let i = 1; i <= 65; i++)
    await a.call("/api/journal", "POST", {
      day: new Date(Date.UTC(2020, 0, i)).toISOString().slice(0, 10),
      mood: 3,
      text: i === 1 ? "Oldest needle" : "Entry " + i,
    });
  const page = (await a.call("/api/journal?page=4")).value;
  assert.equal(page.total, 65);
  assert.equal(page.entries.length, 5);
  assert.equal((await a.call("/api/journal?search=needle")).value.total, 1);
  assert.equal(
    (await a.call("/api/journal/2020-01-01")).value.text,
    "Oldest needle",
  );
  assert.equal((await b.call("/api/journal/2020-01-01")).value, null);
  await b.call("/api/journal/2020-01-01", "DELETE");
  assert.equal((await a.call("/api/journal?page=1")).value.total, 65);
  await a.call("/api/journal/2020-01-01", "DELETE");
  assert.equal((await a.call("/api/journal?search=needle")).value.total, 0);
  assert.equal((await a.call("/api/journal?page=0")).status, 422);
  f.close();
});
test("weekly summary measures seven calendar days and real steps", async () => {
  const f = fixture(false),
    a = await f.client().setup();
  await a.call("/api/journal", "POST", {
    day: "2020-01-01",
    mood: 1,
    text: "Old",
  });
  await a.call("/api/journal", "POST", {
    day: today(),
    mood: 4,
    text: "Today",
    done: true,
  });
  await a.call("/api/goals", "POST", {
    title: "Done",
    due: today(),
    done: true,
  });
  const d = (await a.call("/api/weekly")).value;
  assert.equal(d.entries, 1);
  assert.equal(d.steps, 1);
  assert.equal(d.average_mood, 4);
  assert.equal(d.goals_done, 1);
  assert.equal(d.streak, 1);
  assert.deepEqual(d.moods, [0, 0, 0, 1, 0]);
  f.close();
});
test("guided exercises point to existing practices; absent AI never invents a reply", async () => {
  const f = fixture(false),
    a = await f.client().setup("reflect@example.com");
  for (const focus of ["clarity", "boundaries", "dialogue", "focus"]) {
    const r = (await a.call("/api/reflection", "POST", { focus })).value;
    assert.equal(r.mode, "guided");
    assert.equal((await a.call("/api/practices/" + r.practice)).status, 200);
  }
  assert.equal(
    (await a.call("/api/reflection", "POST", { focus: "fake" })).status,
    422,
  );
  await a.call("/api/trial", "POST");
  assert.equal(
    (await a.call("/api/assistant", "POST", { message: "Hello" })).status,
    503,
  );
  assert.deepEqual((await a.call("/api/assistant/history")).value, []);
  f.close();
});

test("AI provider adapter preserves history, caches a daily reply and enforces ten successful requests", async () => {
  const f = fixture(false),
    a = await f.client().setup("ai@example.com");
  await a.call("/api/trial", "POST");
  f.env.AI_API_KEY = "local-adapter-test";
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (_url, options) => {
    calls++;
    const payload = JSON.parse(options.body);
    assert.equal(payload.messages.at(-1).role, "user");
    return new Response(
      JSON.stringify({
        choices: [{ message: { content: "Запишите один небольшой шаг." } }],
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  };
  try {
    const first = await a.call("/api/insight", "POST");
    assert.equal(first.status, 200);
    assert.equal(first.value.remaining, 9);
    assert.equal((await a.call("/api/insight", "POST")).value.cached, true);
    assert.equal(calls, 1);
    for (let i = 0; i < 9; i++)
      assert.equal(
        (await a.call("/api/assistant", "POST", { message: "Вопрос " + i }))
          .status,
        200,
      );
    assert.equal(
      (await a.call("/api/assistant", "POST", { message: "Лишний вопрос" }))
        .status,
      429,
    );
    assert.equal((await a.call("/api/assistant/history")).value.length, 20);
  } finally {
    globalThis.fetch = original;
    f.close();
  }
});
test("failed provider does not consume a message or save an invented conversation", async () => {
  const f = fixture(false),
    a = await f.client().setup("ai-error@example.com");
  await a.call("/api/trial", "POST");
  f.env.AI_API_KEY = "local-adapter-test";
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response("{}", {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    assert.equal(
      (await a.call("/api/assistant", "POST", { message: "Вопрос" })).status,
      502,
    );
    assert.deepEqual((await a.call("/api/assistant/history")).value, []);
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "Ответ провайдера" } }],
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    assert.equal(
      (await a.call("/api/assistant", "POST", { message: "Повтор" })).value
        .remaining,
      9,
    );
  } finally {
    globalThis.fetch = original;
    f.close();
  }
});

test("Sites identity preserves the same account with blocked cookies and isolates another identity", async () => {
  const f = fixture(false),
    a = f.client(),
    b = f.client(),
    headers = {
      Cookie: "",
      "oai-authenticated-user-id": "trusted-site-user-a",
    };
  const first = await a.call("/api/auth/session", "POST", {}, headers);
  assert.match(
    first.headers.get("Set-Cookie"),
    /SameSite=None; Secure; Partitioned/,
  );
  const again = await a.call("/api/auth/session", "POST", {}, headers);
  assert.equal(again.value.id, first.value.id);
  assert.equal(
    (
      await a.call(
        "/api/quiz/complete",
        "POST",
        { name: "Анна", birth_date: "1995-05-02", focus: "Ясность" },
        headers,
      )
    ).status,
    200,
  );
  assert.equal((await a.call("/api/today", "GET", null, headers)).status, 200);
  await a.call(
    "/api/journal",
    "POST",
    { day: today(), mood: 4, text: "Persistent without cookie" },
    headers,
  );
  await b.call(
    "/api/auth/session",
    "POST",
    {},
    { Cookie: "", "oai-authenticated-user-id": "trusted-site-user-b" },
  );
  assert.equal(
    (
      await b.call("/api/journal", "GET", null, {
        Cookie: "",
        "oai-authenticated-user-id": "trusted-site-user-b",
      })
    ).value.total,
    0,
  );
  assert.equal(
    (await a.call("/api/journal", "GET", null, headers)).value.total,
    1,
  );
  await a.call("/api/auth/logout", "POST", {}, headers);
  assert.equal((await a.call("/api/me", "GET", null, headers)).status, 401);
  f.close();
});
test("scheduled rituals persist edits, respect days and isolate completions", async () => {
  const f = fixture(false),
    a = await f.client().setup(),
    b = await f.client().setup();
  const day = new Date(today() + "T12:00:00Z").getUTCDay();
  const h = (
    await a.call("/api/habits", "POST", { title: "Pause", days: [day] })
  ).value;
  assert.ok(h.id);
  assert.equal(
    (
      await a.call("/api/habits/check", "POST", {
        id: h.id,
        day: today(),
        done: true,
      })
    ).status,
    200,
  );
  assert.equal(
    (await a.call("/api/rituals")).value.habits[0].completed_total,
    1,
  );
  assert.equal(
    (
      await b.call("/api/habits/check", "POST", {
        id: h.id,
        day: today(),
        done: true,
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await a.call("/api/habits", "POST", {
        id: h.id,
        title: "New title",
        days: [day],
      })
    ).value.id,
    h.id,
  );
  assert.equal((await a.call("/api/rituals")).value.habits.length, 1);
  assert.equal((await a.call("/api/monthly")).value.habit_marks, 1);
  await a.call("/api/habits/" + h.id, "DELETE");
  assert.deepEqual((await a.call("/api/rituals")).value.habits, []);
  f.close();
});
test("30 day route opens only by entitlement; catalogue uses updated prices", async () => {
  const f = fixture(false),
    a = await f.client().setup("route@example.com");
  assert.equal((await a.call("/api/products/club")).value.product.price, 1190);
  assert.equal(
    (await a.call("/api/products/deep-reading")).value.product.price,
    2790,
  );
  assert.equal(
    (await a.call("/api/practices/self-discovery-30")).value.days.length,
    1,
  );
  await a.call("/api/trial", "POST");
  assert.equal(
    (await a.call("/api/practices/self-discovery-30")).value.days.length,
    30,
  );
  assert.equal(
    (
      await a.call("/api/progress", "POST", {
        slug: "self-discovery-30",
        index: 29,
        done: true,
      })
    ).status,
    200,
  );
  f.close();
});

test("English reports switch language and exports include retention data", async () => {
  const f = fixture(false);
  try {
    const c = await f.client().setup("english-reports@example.com");
    assert.equal((await c.call("/api/trial", "POST")).status, 200);
    const en = await c.call(
      "/api/materials",
      "POST",
      { slug: "deep-reading" },
      { "Accept-Language": "en" },
    );
    assert.equal(en.status, 200);
    assert.match(en.value.content, /Seven-day plan/);
    assert.doesNotMatch(en.value.content, /План на семь дней/);
    const ru = await c.call("/api/reports/" + en.value.id);
    assert.match(ru.value.content, /План на семь дней/);
    const switched = await c.call(
      "/api/reports/" + en.value.id,
      "GET",
      undefined,
      { "Accept-Language": "en" },
    );
    assert.match(switched.value.content, /Seven-day plan/);
    const pdf = await c.call("/api/reports/" + en.value.id + "/pdf?lang=en");
    assert.equal(pdf.status, 200);
    assert.equal(new TextDecoder().decode(pdf.value.slice(0, 5)), "%PDF-");
    const h = await c.call("/api/habits", "POST", {
      title: "A quiet moment",
      days: [0, 1, 2, 3, 4, 5, 6],
    });
    assert.equal((await c.call("/api/habits/check", "POST", { id: h.value.id, day: today(), done: true })).status, 200);
    const exported = await c.call("/api/export");
    assert.equal(exported.value.habits.length, 1);
    assert.equal(exported.value.habit_marks.length, 1);
  } finally {
    f.close();
  }
});
