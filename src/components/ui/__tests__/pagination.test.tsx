import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "../pagination";

describe("Pagination", () => {
  const defaultProps = {
    page: 1,
    pageSize: 20,
    total: 100,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
  };

  it("should render correct range info", () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText(/1–20 sur 100 résultats/)).toBeInTheDocument();
  });

  it("should use singular for 1 result", () => {
    render(<Pagination {...defaultProps} page={1} pageSize={20} total={1} />);
    expect(screen.getByText(/1–1 sur 1 résultat/)).toBeInTheDocument();
  });

  it("should show 'Aucun résultat' when total is 0", () => {
    render(<Pagination {...defaultProps} total={0} />);
    expect(screen.getByText("Aucun résultat")).toBeInTheDocument();
  });

  it("should display current page / total pages", () => {
    render(<Pagination {...defaultProps} page={2} total={100} />);
    // page 2 / totalPages = ceil(100/20) = 5
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
  });

  it("should disable previous button on first page", () => {
    render(<Pagination {...defaultProps} page={1} />);
    const buttons = screen.getAllByRole("button");
    const prevButton = buttons[0];
    expect(prevButton).toBeDisabled();
  });

  it("should disable next button on last page", () => {
    render(<Pagination {...defaultProps} page={5} total={100} />);
    const buttons = screen.getAllByRole("button");
    const nextButton = buttons[buttons.length - 1];
    expect(nextButton).toBeDisabled();
  });

  it("should call onPageChange with previous page", () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} page={3} onPageChange={onPageChange} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("should call onPageChange with next page", () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} page={3} onPageChange={onPageChange} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[buttons.length - 1]);

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("should show correct range on page 2", () => {
    render(<Pagination {...defaultProps} page={2} />);
    expect(screen.getByText(/21–40 sur 100 résultats/)).toBeInTheDocument();
  });

  it("should show correct range on last partial page", () => {
    render(<Pagination {...defaultProps} page={3} pageSize={20} total={55} />);
    expect(screen.getByText(/41–55 sur 55 résultats/)).toBeInTheDocument();
  });

  it("should handle single page", () => {
    render(<Pagination {...defaultProps} page={1} total={5} />);
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
  });

  it("should render page size label", () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText("Lignes")).toBeInTheDocument();
  });
});
