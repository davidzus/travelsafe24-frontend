import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MapControls from "./MapControls";

describe("MapControls", () => {
  it("renders the title and filter button", () => {
    render(
      <MapControls
        selectedTypesCount={0}
        isLoadingPois={false}
        onOpenFilter={() => {}}
      />,
    );
    expect(screen.getByText("Hamburg District Match")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /POI Filter/i }),
    ).toBeInTheDocument();
  });

  it("hides the count badge when no types are selected", () => {
    render(
      <MapControls
        selectedTypesCount={0}
        isLoadingPois={false}
        onOpenFilter={() => {}}
      />,
    );
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("shows the selected count badge", () => {
    render(
      <MapControls
        selectedTypesCount={3}
        isLoadingPois={false}
        onOpenFilter={() => {}}
      />,
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calls onOpenFilter when the button is clicked", async () => {
    const onOpenFilter = vi.fn();
    render(
      <MapControls
        selectedTypesCount={1}
        isLoadingPois={false}
        onOpenFilter={onOpenFilter}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /POI Filter/i }));
    expect(onOpenFilter).toHaveBeenCalledOnce();
  });
});
