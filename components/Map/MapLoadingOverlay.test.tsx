import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import MapLoadingOverlay from "./MapLoadingOverlay";

describe("MapLoadingOverlay", () => {
  it("renders the loading label", () => {
    render(<MapLoadingOverlay />);
    expect(screen.getByText("Loading Hamburg…")).toBeInTheDocument();
  });
});
