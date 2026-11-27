/**
 * Compresse une image côté client avant upload.
 *
 * Redimensionne et convertit en WebP pour réduire la taille,
 * améliorer les performances de chargement et économiser
 * de l'espace de stockage.
 *
 * @param file - Le fichier image d'origine
 * @param maxWidth - Largeur maximale en pixels (défaut: 1200)
 * @param quality - Qualité WebP (0-1, défaut: 0.82)
 * @returns Un Promise<File> de l'image compressée au format WebP
 *
 * @example
 * ```tsx
 * const compressed = await compressImage(photoFile, 800, 0.8);
 * // Utiliser compressed pour l'upload Supabase
 * ```
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.82,
): Promise<File> {
  // Ne pas compresser si ce n'est pas une image
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // Créer un bitmap à partir du fichier
  const bitmap = await createImageBitmap(file);

  // Calculer les nouvelles dimensions
  let { width, height } = bitmap;
  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  // Dessiner sur un canvas pour la compression
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file; // Fallback si canvas non supporté
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Convertir en blob WebP
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(
      (b) => resolve(b),
      "image/webp",
      quality,
    );
  });

  if (!blob) {
    return file; // Fallback si conversion échoue
  }

  // Créer un nouveau File avec l'extension .webp
  const fileName = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], fileName, { type: "image/webp" });
}
