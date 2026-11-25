import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const routes = [
  "/brief",
  "/demand-stock",
  "/production",
  "/expansion",
  "/options",
];
const noOverflow = async (page: import("@playwright/test").Page) =>
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
for (const width of [
  320, 375, 550, 551, 600, 768, 769, 820, 1100, 1101, 1280, 1920,
])
  test(`production layout at ${width}px, all routes and mobile touch targets`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("response", (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await noOverflow(page);
      if (width <= 768) {
        const undersized = await page
          .locator("button,select,summary,a.button")
          .evaluateAll((items) =>
            items
              .filter(
                (e) =>
                  e.getClientRects().length &&
                  getComputedStyle(e).visibility !== "hidden" &&
                  !e.closest("[inert]"),
              )
              .filter((e) => e.getBoundingClientRect().height < 43.9)
              .map(
                (e) => e.getAttribute("aria-label") ?? e.textContent?.trim(),
              ),
          );
        expect(undersized, route).toEqual([]);
      }
    }
    expect(errors).toEqual([]);
  });
for (const width of [320, 768, 1280])
  test(`200% text at ${width}px, all routes`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "32px";
      });
      await page.evaluate(() => document.fonts.ready);
      await noOverflow(page);
    }
  });
test("landscape navigation scrolls to every utility and traps keyboard focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await page.goto("/brief");
  const open = page.getByRole("button", { name: "Open navigation" });
  await open.click();
  const nav = page.getByRole("dialog", { name: "Planning navigation" });
  await expect(nav).toBeVisible();
  await expect(
    nav.getByRole("button", { name: "Close navigation" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    nav.getByRole("button", { name: "About this example" }),
  ).toBeFocused();
  await expect(
    nav.getByRole("button", { name: "Close navigation" }),
  ).toBeInViewport();
  await nav.getByRole("button", { name: "About this example" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Built around the decision in front of you",
    }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    nav.getByRole("button", { name: "About this example" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    nav.getByRole("button", { name: "Close navigation" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(open).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});
test("mobile navigation across all routes and resizing restores the desktop page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/brief?case=S5&runs=no&sku=FR-VB");
  for (const name of [
    "Demand & Stock",
    "Production Plan",
    "Retail Expansion",
    "Options & Cash",
    "Planning Brief",
  ]) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("link", { name, exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Open navigation" }),
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: "Scenario preset" }),
    ).toHaveValue("S5");
    await expect(page).toHaveURL(/runs=no&sku=FR-VB/);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await noOverflow(page);
  }
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.locator(".workspace")).not.toHaveAttribute("inert", "");
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(
    page.getByRole("link", { name: "Demand & Stock", exact: true }),
  ).toBeVisible();
});
test("route navigation resets scroll and focuses the new title", async ({
  page,
}) => {
  await page.goto("/brief");
  await page
    .getByRole("link", { name: "Review the opening", exact: true })
    .scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(100);
  await page
    .getByRole("link", { name: "Review the opening", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "What could the next opening require?",
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(0);
});
for (const width of [320, 768, 1440])
  test(`all drawers, tabs, catalogue and table alternatives at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/brief");
    await page.getByRole("button", { name: "What’s illustrative?" }).click();
    const sources = page.getByRole("dialog", { name: "Sources & assumptions" });
    for (const name of [
      "Business context",
      "Illustrative inputs",
      "Calculations",
    ]) {
      await sources.getByRole("tab", { name, exact: true }).click();
      expect(
        await sources.evaluate((e) => e.scrollWidth <= e.clientWidth),
      ).toBe(true);
    }
    await expect(sources).toHaveCSS(
      "width",
      width <= 768 ? `${width}px` : "520px",
    );
    await sources.getByRole("button", { name: "Close drawer" }).click();
    for (const name of ["This week’s review", "About this example"]) {
      if (width <= 768)
        await page.getByRole("button", { name: "Open navigation" }).click();
      await page
        .locator(".sidebar")
        .getByRole("button", { name, exact: true })
        .click();
      const dialog = page.getByRole("dialog").last();
      expect(await dialog.evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(
        true,
      );
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(axe.violations).toEqual([]);
      await dialog.getByRole("button", { name: "Close drawer" }).click();
      if (width <= 768)
        await page.getByRole("button", { name: "Close navigation" }).click();
    }
    await page.goto("/demand-stock");
    await page
      .getByRole("button", { name: "Public range and example selection" })
      .click();
    const catalogue = page.getByRole("dialog");
    await expect(catalogue.getByRole("row")).toHaveCount(6);
    await page.keyboard.press("Escape");
    await page.locator(".chart-table summary").click();
    await expect(page.locator(".chart-table table")).toBeVisible();
    await page
      .getByRole("combobox", { name: "Product", exact: true })
      .selectOption("FR-SC");
    await page
      .getByRole("combobox", { name: "History account", exact: true })
      .selectOption("AC-03");
    await expect(
      page.getByRole("combobox", { name: "Product", exact: true }),
    ).toHaveValue("FR-SC");
    await noOverflow(page);
  });
test("all eight scenarios on all five pages keep figures, selection and feasibility valid", async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const id of ["S0", "S1", "S2", "S3", "S4", "S5", "S6", "S7"])
    for (const runs of ["yes", "no"])
      for (const route of routes) {
        await page.goto(`${route}?case=${id}&runs=${runs}&sku=FR-SC`);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(
          page.getByRole("combobox", { name: "Scenario preset" }),
        ).toHaveValue(id);
        expect(await page.locator("main").innerText()).not.toMatch(
          /\bNaN\b|\bInfinity\b|\bundefined\b/,
        );
        if (
          runs === "no" &&
          route === "/production" &&
          !["S0", "S4"].includes(id)
        )
          await expect(
            page.getByRole("button", { name: "Preview Chocolate-only repeat" }),
          ).toBeDisabled();
      }
});
test("root, unknown routes, refresh and browser history retain URL state", async ({
  page,
}) => {
  await page.goto("/unknown?case=S7&runs=no&sku=FR-VB");
  await expect(page).toHaveURL(/\/brief\?case=S7&runs=no&sku=FR-VB/);
  await page
    .getByRole("combobox", { name: "Scenario preset" })
    .selectOption("S5");
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Scenario preset" }),
  ).toHaveValue("S5");
  await page.goBack();
  await expect(
    page.getByRole("combobox", { name: "Scenario preset" }),
  ).toHaveValue("S7");
  await page.goForward();
  await expect(
    page.getByRole("combobox", { name: "Scenario preset" }),
  ).toHaveValue("S5");
  await page.goto("/");
  await expect(page).toHaveURL(/\/brief\?case=S1&runs=yes/);
});

for (const width of [320, 600, 1280])
  test(`tooltips stay readable and dismissible at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 700 });
    await page.goto("/demand-stock");
    const buttons = page.locator(".tip-trigger");
    for (let i = 0; i < (await buttons.count()); i++) {
      await buttons.nth(i).focus();
      const tip = page.getByRole("tooltip");
      await expect(tip).toBeVisible();
      const box = await tip.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(700);
      await page.keyboard.press("Escape");
      await expect(page.getByRole("tooltip")).toHaveCount(0);
    }
  });

test("production preview, receipt delay and all opening choices complete their actions", async ({
  page,
}) => {
  await page.goto("/production");
  await page
    .getByRole("button", { name: "Preview Chocolate-only repeat" })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Scenario preset" }),
  ).toHaveValue("S2");
  await expect(page.locator(".timeline")).toContainText(
    "Modelled repeat receipt",
  );
  await page
    .getByRole("button", { name: "Test a later first receipt" })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Scenario preset" }),
  ).toHaveValue("S6");
  await expect(
    page.getByText("270 packs temporarily unfulfilled in W4", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Assume no", exact: true }).click();
  await page
    .getByRole("link", { name: "Retail Expansion", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "What could the next opening require?",
  );
  for (const id of ["S0", "S1", "S7"]) {
    await page
      .getByRole("combobox", { name: "Opening case", exact: true })
      .selectOption(id);
    await expect(
      page.getByRole("combobox", { name: "Scenario preset" }),
    ).toHaveValue(id);
    await expect(page).toHaveURL(/runs=no/);
  }
});

test("all chart tables open and wide chart/table regions scroll with the keyboard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  for (const route of ["/demand-stock", "/expansion", "/options"]) {
    await page.goto(route);
    const details = page.locator(".chart-table");
    for (let i = 0; i < (await details.count()); i++) {
      await details.nth(i).locator("summary").click();
      await expect(details.nth(i).locator("table")).toBeVisible();
    }
    const chart = page.locator(".chart-scroll").first();
    await chart.focus();
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(() => chart.evaluate((e) => e.scrollLeft))
      .toBeGreaterThan(0);
    await noOverflow(page);
  }
  await page.goto("/demand-stock");
  const table = page.locator(".table-scroll").last();
  await table.focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => table.evaluate((e) => e.scrollLeft))
    .toBeGreaterThan(0);
  await expect(table.locator("tbody th").first()).toHaveCSS(
    "position",
    "sticky",
  );
});
