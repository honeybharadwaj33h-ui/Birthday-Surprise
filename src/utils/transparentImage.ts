import { useEffect, useState } from 'react';

const transparentCache = new Map<string, string>();

/**
 * Removes an outer solid white studio background (#FFFFFF) from a generated 3D image
 * using edge-connected flood fill with soft anti-aliased edge feathering.
 * Preserves pure white highlights inside the subject (such as eye catchlights).
 */
export function removeWhiteBackground(src: string): Promise<string> {
  const cached = transparentCache.get(src);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        const visited = new Uint8Array(w * h);
        const isNearWhite = (idx: number) => {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          // High brightness & low saturation -> white/off-white backdrop
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          return min > 224 && max - min < 26;
        };

        // BFS flood-fill starting from all 4 image edges
        const queue = new Int32Array(w * h);
        let head = 0;
        let tail = 0;

        const enqueue = (x: number, y: number) => {
          const pos = y * w + x;
          if (visited[pos]) return;
          if (!isNearWhite(pos * 4)) return;
          visited[pos] = 1;
          queue[tail++] = pos;
        };

        for (let x = 0; x < w; x++) {
          enqueue(x, 0);
          enqueue(x, h - 1);
        }
        for (let y = 0; y < h; y++) {
          enqueue(0, y);
          enqueue(w - 1, y);
        }

        while (head < tail) {
          const pos = queue[head++];
          const px = pos % w;
          const py = (pos - px) / w;
          const idx = pos * 4;

          // Fully transparent background pixel
          data[idx + 3] = 0;

          if (px > 0) enqueue(px - 1, py);
          if (px < w - 1) enqueue(px + 1, py);
          if (py > 0) enqueue(px, py - 1);
          if (py < h - 1) enqueue(px, py + 1);
        }

        // Soft 1-pixel anti-alias feather pass along the silhouette edge
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const pos = y * w + x;
            if (visited[pos]) continue;
            const touchesBg =
              visited[pos - 1] ||
              visited[pos + 1] ||
              visited[pos - w] ||
              visited[pos + w];
            if (touchesBg) {
              const idx = pos * 4;
              const lum = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
              if (lum > 195) {
                const factor = Math.max(0, Math.min(1, (245 - lum) / 50));
                data[idx + 3] = Math.round(data[idx + 3] * factor);
              }
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const resultUrl = canvas.toDataURL('image/png');
        transparentCache.set(src, resultUrl);
        resolve(resultUrl);
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

export function useTransparentImages(sources: string[]): Record<string, string> {
  const [map, setMap] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const s of sources) {
      initial[s] = transparentCache.get(s) || s;
    }
    return initial;
  });

  useEffect(() => {
    let active = true;
    Promise.all(
      sources.map(async (s) => [s, await removeWhiteBackground(s)] as const)
    ).then((entries) => {
      if (!active) return;
      const next: Record<string, string> = {};
      for (const [orig, cutout] of entries) {
        next[orig] = cutout;
      }
      setMap(next);
    });
    return () => {
      active = false;
    };
  }, [sources.join('|')]);

  return map;
}
