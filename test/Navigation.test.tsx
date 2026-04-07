// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Navigation from "../src/components/Navigation";
import type { Page } from "../src/components/Navigation";

vi.mock("../src/components/Navigation.css", () => ({}));

describe("Navigation", () => {
  const onNavigate = vi.fn();

  beforeEach(() => onNavigate.mockClear());

  it("renders all five navigation items", () => {
    render(<Navigation onNavigate={onNavigate} />);
    expect(screen.getByText("BIlls")).toBeInTheDocument();
    expect(screen.getByText("Friends")).toBeInTheDocument();
    expect(screen.getByText("Tribes")).toBeInTheDocument();
    expect(screen.getByText("Returns")).toBeInTheDocument();
    expect(screen.getByText("Summary")).toBeInTheDocument();
  });

  const cases: [string, Page][] = [
    ["BIlls", "home"],
    ["Friends", "friends"],
    ["Tribes", "groups"],
    ["Returns", "returns"],
    ["Summary", "stats"],
  ];

  it.each(cases)(
    'clicking "%s" calls onNavigate with "%s"',
    async (label, page) => {
      render(<Navigation onNavigate={onNavigate} />);
      await userEvent.click(screen.getByText(label));
      expect(onNavigate).toHaveBeenCalledOnce();
      expect(onNavigate).toHaveBeenCalledWith(page);
    },
  );

  it("does not call onNavigate before any click", () => {
    render(<Navigation onNavigate={onNavigate} />);
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
