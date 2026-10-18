"use client";

import { useEffect, useState } from "react";

export function LeaderboardBackground({
  src,
  loading,
}: {
  src?: string | null;
  loading: boolean;
}) {
  const [background, setBackground] = useState<{
    layers: [string | undefined, string | undefined];
    active: number | null;
  }>({ layers: [undefined, undefined], active: null });

  useEffect(() => {
    if (!src) {
      if (!loading) {
        setBackground((previous) => ({ ...previous, active: null }));
      }
      return;
    }

    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => {
      setBackground((previous) => {
        if (
          previous.active !== null &&
          previous.layers[previous.active] === src
        ) {
          return previous;
        }
        const active = previous.active === 0 ? 1 : 0;
        const layers: [string | undefined, string | undefined] = [
          ...previous.layers,
        ];
        layers[active] = src;
        return { layers, active };
      });
    };
    image.src = src;
    return () => {
      image.onload = null;
    };
  }, [src, loading]);

  return background.layers.map((image, index) => (
    <div
      key={index}
      className={
        background.active === index
          ? "personal-backdrop is-visible"
          : "personal-backdrop"
      }
      aria-hidden="true"
      style={{
        backgroundImage: image ? `url(${JSON.stringify(image)})` : undefined,
      }}
    />
  ));
}
