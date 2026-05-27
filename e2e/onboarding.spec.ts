import { expect, test } from "@playwright/test";

const MATCHING_ENDPOINT = "**/api/get-matching-scores";

test.describe("Onboarding form", () => {
  test("completes all three steps and redirects to the map", async ({
    page,
  }) => {
    // The submit handler POSTs to the matching backend, which is not running
    // in CI — stub it so the flow can reach the redirect.
    let postedPayload: Record<string, unknown> | null = null;
    await page.route(MATCHING_ENDPOINT, async (route) => {
      postedPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/onboarding");

    await expect(
      page.getByRole("group", { name: "Fill to find the best fit" }),
    ).toBeVisible();

    // --- Step 1: KiTas / Schulen / Unis ---
    await page.locator("#kitas-ja").click();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    // --- Step 2: age + profession ---
    const ageInput = page.getByLabel("Wie alt bist du?*");
    await expect(ageInput).toBeVisible();
    await ageInput.fill("28");
    await page.locator("#profession-angestellter").click();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    // --- Step 3: going out + central living ---
    await expect(page.locator("#goout-ja")).toBeVisible();
    await page.locator("#goout-ja").click();
    await page.locator("#central-nein").click();

    await page.getByRole("button", { name: "Submit" }).click();

    // The redirect to /map confirms a successful submission.
    await page.waitForURL("**/map");
    await expect(page).toHaveURL(/\/map$/);

    // Sanity-check the payload the form sent to the backend.
    expect(postedPayload).toMatchObject({
      needsKitasSchoolsUnis: true,
      age: 28,
      profession: "angestellter",
      goesToBarsClubs: true,
      wantsCentralLiving: false,
    });
  });

  test("blocks advancing past step 1 until a choice is made", async ({
    page,
  }) => {
    await page.goto("/onboarding");

    await page.getByRole("button", { name: "Next", exact: true }).click();

    await expect(
      page.getByText("Please fill all required fields."),
    ).toBeVisible();
  });
});
