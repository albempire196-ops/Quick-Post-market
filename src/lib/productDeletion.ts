import { supabase } from "@/integrations/supabase/client";

interface ProductDeletionTarget {
  id: string;
  image_url?: string | null;
  media_urls?: string[] | null;
}

const PRODUCT_MEDIA_MARKERS = [
  "/storage/v1/object/public/product-media/",
  "/storage/v1/object/sign/product-media/",
  "/storage/v1/object/authenticated/product-media/",
];

const extractStoragePath = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const pathname = decodeURIComponent(parsedUrl.pathname);

    for (const marker of PRODUCT_MEDIA_MARKERS) {
      const markerIndex = pathname.indexOf(marker);
      if (markerIndex >= 0) {
        return pathname.slice(markerIndex + marker.length);
      }
    }
  } catch {
    return null;
  }

  return null;
};

const getUniqueMediaPaths = (target: ProductDeletionTarget) => {
  const mediaUrls = Array.isArray(target.media_urls) ? target.media_urls : [];
  const allUrls = [...mediaUrls, target.image_url].filter((value): value is string => Boolean(value));

  return [...new Set(allUrls.map(extractStoragePath).filter((value): value is string => Boolean(value)))];
};

export const deleteProductWithMedia = async (target: ProductDeletionTarget) => {
  const mediaPaths = getUniqueMediaPaths(target);

  if (mediaPaths.length) {
    const { error: storageError } = await supabase.storage.from("product-media").remove(mediaPaths);
    if (storageError) throw storageError;
  }

  const { error: productError } = await supabase.from("products").delete().eq("id", target.id);
  if (productError) throw productError;
};