import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import MapLegend from "./MapLegend";

describe("MapLegend", () => {
  it("renders the match score scale labels", () => {
    render(<MapLegend />);
    expect(screen.getByText("Match score")).toBeInTheDocument();
    expect(screen.getByText("Low")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });
});
