import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const routes = [
  "/brief",
  "/demand-stock",
  "/production",
  "/expansion",
  "/options",
];
for (const width of [1440, 1024, 768, 390, 360])
  for (const route of routes)
    test(`${route} at ${width}: disclosure, no overflow, axe and screenshot`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      page.on("requestfailed", (r) => errors.push(r.url()));
      const external: string[] = [];
      page.on("request", (r) => {
        if (
          !new URL(r.url()).hostname.match(/127\.0\.0\.1|localhost|vercel\.app/)
        )
          external.push(r.url());
      });
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(
        page.getByText("Planning snapshot · 30 Nov 2026"),
      ).toBeVisible();
      await expect(
        page.getByText(
          "Illustrative planning example. Operating numbers and selected production flavours are synthetic.",
        ),
      ).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
      expect(external).toEqual([]);
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(axe.violations).toEqual([]);
      await page.screenshot({
        path: `test-results/screenshots/${route.slice(1)}-${width}.png`,
        fullPage: true,
      });
    });
test("live success sequence and independent-run feasibility across all routes", async ({
  page,
}) => {
  await page.goto("/brief");
  await page.getByRole("link", { name: "Compare the options" }).click();
  await expect(
    page
      .locator(".comparison-section")
      .getByText("Central demand · W5 opening", { exact: true }),
  ).toBeVisible();
  await page.locator(".option-card").nth(1).getByRole("button").click();
  await expect(
    page.getByRole("combobox", { name: "Scenario preset" }),
  ).toHaveValue("S2");
  await page.getByRole("button", { name: "Assume no", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Scenario preset" }),
  ).toHaveValue("S2");
  await expect(
    page.getByText("Unavailable under this assumption", { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".option-card").nth(1).getByRole("button"),
  ).toBeDisabled();
  await page.getByRole("link", { name: "Planning Brief", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Your next production decision",
  );
  await expect(
    page.getByText("Comparison only · infeasible under this assumption", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText("CAD 4,800", { exact: false })).toHaveCount(0);
  await page
    .getByRole("link", { name: "Production Plan", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Preview Chocolate-only repeat" }),
  ).toBeDisabled();
  await expect(page.getByText("CAD 4,800", { exact: false })).toHaveCount(0);
  await page
    .getByRole("link", { name: "Retail Expansion", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Opening case", exact: true })
    .selectOption("S7");
  await expect(page.getByRole("status")).toHaveText(
    "Opening case selected. Earlier scenario changes have been reset.",
  );
  await expect(page).toHaveURL(/runs=no/);
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Scenario preset" }),
  ).toHaveValue("S7");
  await page
    .getByRole("button", { name: "Reset to proposed expansion" })
    .click();
  await expect(page).toHaveURL(/case=S1&runs=yes/);
});
test("drawers trap focus, close with Escape and return focus", async ({
  page,
}) => {
  await page.goto("/brief");
  const trigger = page.getByRole("button", { name: "What’s illustrative?" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.getByRole("tab", { name: "Calculations", exact: true }).click();
  await page
    .locator("summary")
    .filter({ hasText: "Orders consuming forecast" })
    .click();
  await expect(
    page.getByText("Use the larger of the existing forecast", { exact: false }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
test("stress case keeps central comparison and visual layers leave ledger unchanged", async ({
  page,
}) => {
  await page.goto("/options");
  await page
    .getByRole("button", { name: /S5 · Stronger existing demand/ })
    .click();
  await expect(page.locator(".option-card").nth(1)).toContainText("CAD 19,920");
  await page.getByRole("link", { name: "Demand & Stock", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Scenario preset" }),
  ).toHaveValue("S5");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "What is moving—and what is available?",
  );
  const before = await page.locator("table").last().innerText();
  await page
    .getByRole("checkbox", { name: "New-store", exact: true })
    .uncheck();
  expect(await page.locator("table").last().innerText()).toBe(before);
  await page
    .getByRole("combobox", { name: "History account", exact: true })
    .selectOption("AC-02");
  expect(await page.locator("table").last().innerText()).toBe(before);
});

for (const id of ["S0", "S1", "S2", "S3", "S4", "S5", "S6", "S7"])
  test(`${id}: Brief never proposes an infeasible selective repeat`, async ({
    page,
  }) => {
    await page.goto(`/brief?case=${id}&runs=no`);
    await expect(
      page.getByRole("combobox", { name: "Scenario preset" }),
    ).toHaveValue(id);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("CAD 4,800", { exact: false })).toHaveCount(0);
    if (!["S0", "S4"].includes(id))
      await expect(
        page.getByText("Unavailable under this assumption", { exact: true }),
      ).toBeVisible();
  });

test("mobile drawer returns focus to its visible navigation trigger", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/brief");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const trigger = page.getByRole("button", {
    name: "Sources & assumptions",
    exact: true,
  });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(trigger).toBeVisible();
  await expect(trigger).toBeFocused();
});
