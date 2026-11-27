/**
 * Tests du composant NotificationsBell (cloche de notifications).
 * Radix Popover nécessite pointer events : setup.ts charge jest-dom.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NotificationsBell } from "../notifications-bell";
import { notify, clearNotifications } from "@/lib/notify";

// Popover de Radix : portal + animation — on stubbe le positionnement.
vi.mock("@/components/ui/popover", async () => {
  const actual =
    await vi.importActual<typeof import("@/components/ui/popover")>("@/components/ui/popover");
  return actual;
});

describe("NotificationsBell", () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearNotifications();
    vi.clearAllMocks();
  });

  it("affiche le badge de non-lues après une notification", async () => {
    notify.error("Stock critique", "Produit X sous le seuil");

    render(<NotificationsBell />);

    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  it("ouvre le panneau : liste + bouton Vider présents, pas de bouton Tester", async () => {
    notify.info("Information test");

    render(<NotificationsBell />);

    // Ouvre le popover
    fireEvent.click(screen.getByTitle("Notifications"));

    await waitFor(() => {
      expect(screen.getByText("Information test")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /vider/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /tester/i })).not.toBeInTheDocument();
  });

  it("Vider supprime toutes les notifications", async () => {
    notify.info("a");
    notify.info("b");
    render(<NotificationsBell />);

    fireEvent.click(screen.getByTitle("Notifications"));
    await waitFor(() => expect(screen.getByText("a")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /vider/i }));
    await waitFor(() => {
      expect(screen.queryByText("a")).not.toBeInTheDocument();
      expect(screen.queryByText("b")).not.toBeInTheDocument();
    });
  });

  it("aucune notification : état vide affiché, Vider désactivé", async () => {
    render(<NotificationsBell />);
    fireEvent.click(screen.getByTitle("Notifications"));

    await waitFor(() => {
      expect(screen.getByText(/aucune notification/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /vider/i })).toBeDisabled();
  });
});
