import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { compressImage } from "../image";

/**
 * Crée un fichier image factice pour les tests.
 */
function createMockFile(name: string, type: string, size: number = 1024): File {
  const blob = new Blob(["x".repeat(size)], { type });
  return new File([blob], name, { type });
}

/**
 * Mock partiel de createImageBitmap.
 * Les tests d'image ont besoin d'un environnement qui supporte
 * Canvas, sinon on teste les chemins de fallback.
 */
function mockCanvas(
  canvasElement: HTMLCanvasElement,
  simulateFailure: boolean = false,
) {
  if (simulateFailure) {
    vi.spyOn(canvasElement, "getContext").mockReturnValue(null);
    return;
  }

  const mockCtx = {
    drawImage: vi.fn(),
    canvas: canvasElement,
  } as unknown as CanvasRenderingContext2D;

  vi.spyOn(canvasElement, "getContext").mockReturnValue(mockCtx);

  vi.spyOn(canvasElement, "toBlob").mockImplementation(
    (callback: ((blob: Blob | null) => void) | null) => {
      if (callback) {
        const blob = new Blob(["fake-webp-data"], { type: "image/webp" });
        callback(blob);
      }
    },
  );
}

describe("compressImage", () => {
  beforeEach(() => {
    // Mock createImageBitmap par défaut
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockResolvedValue({
        width: 1920,
        height: 1080,
        close: vi.fn(),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should return the original file if it's not an image", async () => {
    const file = createMockFile("test.pdf", "application/pdf");
    const result = await compressImage(file);
    expect(result).toBe(file);
  });

  it("should return the original file if canvas context is not available", async () => {
    const file = createMockFile("test.jpg", "image/jpeg");
    // Simuler un canvas sans contexte
    vi.stubGlobal("document", {
      createElement: vi.fn().mockReturnValue({
        width: 0,
        height: 0,
        getContext: vi.fn().mockReturnValue(null),
        toBlob: vi.fn(),
      }),
    });

    const result = await compressImage(file);
    expect(result).toBe(file);
  });

  it("should compress a JPEG image and return a WebP file", async () => {
    const file = createMockFile("test.jpg", "image/jpeg", 50000);

    // Simuler un canvas fonctionnel
    const canvasElement = document.createElement("canvas");
    mockCanvas(canvasElement);

    vi.stubGlobal("document", {
      createElement: vi.fn().mockReturnValue(canvasElement),
    });

    const result = await compressImage(file);

    expect(result).toBeInstanceOf(File);
    expect(result.type).toBe("image/webp");
    expect(result.name).toBe("test.webp");
  });

  it("should resize image if width exceeds maxWidth", async () => {
    const file = createMockFile("large.jpg", "image/jpeg", 100000);

    const canvasElement = document.createElement("canvas");
    mockCanvas(canvasElement);

    vi.stubGlobal("document", {
      createElement: vi.fn().mockReturnValue(canvasElement),
    });

    await compressImage(file, 800, 0.8);

    // Vérifier que le canvas a été redimensionné
    expect(canvasElement.width).toBe(800);
    // 1080 * 800 / 1920 = 450
    expect(canvasElement.height).toBe(450);
  });

  it("should not resize image if width is within maxWidth", async () => {
    const file = createMockFile("small.jpg", "image/jpeg", 10000);

    // Mock avec une petite image
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockResolvedValue({
        width: 640,
        height: 480,
        close: vi.fn(),
      }),
    );

    const canvasElement = document.createElement("canvas");
    mockCanvas(canvasElement);

    vi.stubGlobal("document", {
      createElement: vi.fn().mockReturnValue(canvasElement),
    });

    await compressImage(file, 1200, 0.82);

    // Dimensions d'origine conservées (640 <= 1200)
    expect(canvasElement.width).toBe(640);
    expect(canvasElement.height).toBe(480);
  });

  it("should use default parameters when not provided", async () => {
    const file = createMockFile("test.png", "image/png", 20000);

    const canvasElement = document.createElement("canvas");
    mockCanvas(canvasElement);

    vi.stubGlobal("document", {
      createElement: vi.fn().mockReturnValue(canvasElement),
    });

    const result = await compressImage(file);

    expect(result).toBeInstanceOf(File);
    expect(result.type).toBe("image/webp");
  });

  it("should return original file if toBlob returns null", async () => {
    const file = createMockFile("test.jpg", "image/jpeg", 10000);

    const canvasElement = document.createElement("canvas");
    const mockCtx = {
      drawImage: vi.fn(),
      canvas: canvasElement,
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(canvasElement, "getContext").mockReturnValue(mockCtx);
    vi.spyOn(canvasElement, "toBlob").mockImplementation(
      (callback: ((blob: Blob | null) => void) | null) => {
        if (callback) callback(null); // Simule un échec
      },
    );

    vi.stubGlobal("document", {
      createElement: vi.fn().mockReturnValue(canvasElement),
    });

    const result = await compressImage(file);
    expect(result).toBe(file);
  });
});
