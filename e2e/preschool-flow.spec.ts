import { expect, test } from "@playwright/test";

const allDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
] as const;

test("parent/admin can create activities and complete one with server-backed celebration imagery", async ({
  page
}) => {
  await page.goto("/");

  await page.getByLabel("Child name").fill("Milo");
  await page.getByLabel("Avatar or photo URL").fill("https://example.com/milo.png");
  await page.getByLabel("Interest themes").fill("race cars, energetic blue cartoon dogs");
  await page.getByRole("button", { name: "Save child profile" }).click();

  await expect(page.getByText("Ready for today's plan")).toBeVisible();

  await page.getByRole("button", { name: "Activities" }).click();
  await expect(page.getByLabel("Activity name")).toBeEnabled();
  await page.getByLabel("Activity name").fill("Carry napkins");
  await page.getByRole("button", { name: "Generate instructional image" }).click();
  await expect(page.getByAltText("Instructional image preview")).toBeVisible();
  await page.getByRole("checkbox", { name: "Monday activity" }).click();
  await page.getByRole("button", { name: "Save activity" }).click();

  await page.getByRole("button", { name: "Overview" }).click();
  const carryNapkinsCell = page.getByRole("button", { name: /^Toggle Carry napkins for /i });
  await carryNapkinsCell.click();

  await expect(carryNapkinsCell).toContainText("Completed");
  await expect(
    page
      .getByText(/creating image|image unavailable/i)
      .or(page.getByAltText("Celebration image for Carry napkins"))
  ).toBeVisible();
});

test("child-facing tablet execution stays separate and can complete a step-based activity", async ({
  page
}) => {
  await page.goto("/");

  await page.getByLabel("Child name").fill("Milo");
  await page.getByRole("button", { name: "Save child profile" }).click();

  await page.getByRole("button", { name: "Activities" }).click();
  await expect(page.getByLabel("Activity name")).toBeEnabled();
  await page.getByLabel("Activity name").fill("Morning helper");
  await page.getByLabel("Step 1 label").fill("Get dressed");
  for (const day of allDays) {
    await page.getByRole("checkbox", { name: `${day} activity` }).click();
  }
  await page.getByRole("button", { name: "Save activity" }).click();

  await page.getByRole("button", { name: "Tablet" }).click();
  await expect(page.getByLabel("Child name")).toHaveCount(0);
  await expect(page.getByText("Get dressed")).toBeVisible();
  await page.getByRole("button", { name: "I did it" }).click();
  await expect(page.getByText("Morning helper complete")).toBeVisible();
});
