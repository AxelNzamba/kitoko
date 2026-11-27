import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../use-debounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("should keep initial value until delay passes", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    act(() => {
      vi.advanceTimersByTime(100);
    });
    // Should still be "hello" after 100ms
    expect(result.current).toBe("hello");
  });

  it("should update value after delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "hello", delay: 300 } },
    );

    // Change value
    rerender({ value: "world", delay: 300 });

    // After 300ms, the value should update
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("world");
  });

  it("should reset timer if value changes before delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "a", delay: 300 } },
    );

    rerender({ value: "ab", delay: 300 });

    // Advance 200ms (not enough for the 2nd update)
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should still show "a" because the timer was reset
    expect(result.current).toBe("a");

    // Change again
    rerender({ value: "abc", delay: 300 });

    // Advance 300ms from the last change
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("abc");
  });

  it("should work with numbers", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 0 } },
    );

    rerender({ value: 42 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe(42);
  });

  it("should work with objects (by reference)", () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 2 };

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: obj1 } },
    );

    rerender({ value: obj2 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(obj2);
  });

  it("should use default delay of 300ms", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: "first" } },
    );

    rerender({ value: "second" });

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("first");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("second");
  });

  it("should clean up timeout on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

    const { result, rerender, unmount } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } },
    );

    rerender({ value: "updated" });
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
