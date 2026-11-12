"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

import { optimizeImageUrl } from "@/components/catalog/catalog-helpers";

export interface GalleryImage {
  src: string;
  alt: string;
}

interface GalleryCopy {
  showPhoto: (index: number) => string;
  previousPhoto: string;
  nextPhoto: string;
  zoom: string;
  closeZoom: string;
}

const ZOOM_SCALE = 2.5;

function scrollToIndex(container: HTMLDivElement | null, index: number, smooth = true) {
  if (!container) return;
  container.scrollTo({ left: container.clientWidth * index, behavior: smooth ? "smooth" : "auto" });
}

/** Keeps the active index in sync while the user swipes a scroll-snap carousel. */
function useSnapIndex(onChange: (index: number) => void) {
  const frame = useRef<number | null>(null);

  return useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const container = event.currentTarget;
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const width = container.clientWidth || 1;
        onChange(Math.round(container.scrollLeft / width));
      });
    },
    [onChange],
  );
}

function ZoomViewer({
  images,
  startIndex,
  onOpenChange,
  onIndexChange,
  copy,
  title,
}: {
  images: GalleryImage[];
  startIndex: number;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
  copy: GalleryCopy;
  title: string;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const zoomPaneRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(startIndex);
  const [zoom, setZoom] = useState<{ index: number; x: number; y: number } | null>(null);

  // Mounted only while open: jump to the photo that was tapped, once.
  const [initialIndex] = useState(startIndex);
  useEffect(() => {
    const id = requestAnimationFrame(() => scrollToIndex(trackRef.current, initialIndex, false));
    return () => cancelAnimationFrame(id);
  }, [initialIndex]);

  // Centre the zoomed pane on the point that was tapped.
  useEffect(() => {
    const pane = zoomPaneRef.current;
    if (!zoom || !pane) return;
    pane.scrollTo({
      left: zoom.x * pane.scrollWidth - pane.clientWidth / 2,
      top: zoom.y * pane.scrollHeight - pane.clientHeight / 2,
    });
  }, [zoom]);

  const handleScroll = useSnapIndex(
    useCallback(
      (next: number) => {
        setIndex(next);
        onIndexChange(next);
      },
      [onIndexChange],
    ),
  );

  function go(direction: -1 | 1) {
    const next = (index + direction + images.length) % images.length;
    setZoom(null);
    scrollToIndex(trackRef.current, next);
  }

  function toggleZoom(event: MouseEvent<HTMLButtonElement>, imageIndex: number) {
    if (zoom) {
      setZoom(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setZoom({
      index: imageIndex,
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    });
  }

  return (
    <Dialog.Root open onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-[var(--app-overlay)] backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-0 z-[80] flex flex-col bg-white outline-none"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") go(-1);
            if (event.key === "ArrowRight") go(1);
          }}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <Dialog.Description className="sr-only">{copy.zoom}</Dialog.Description>

          <div className="flex items-center justify-between gap-3 border-b border-[var(--app-border)] px-4 py-3">
            <span className="text-sm font-medium text-[var(--app-text-muted)]">
              {index + 1} / {images.length}
            </span>
            <Dialog.Close
              className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--app-border)] bg-white text-[var(--app-text-soft)] hover:bg-[var(--app-surface)]"
              aria-label={copy.closeZoom}
            >
              <X className="size-5" />
            </Dialog.Close>
          </div>

          <div
            ref={trackRef}
            onScroll={handleScroll}
            className={`flex min-h-0 flex-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              zoom ? "overflow-x-hidden" : "overflow-x-auto"
            }`}
          >
            {images.map((image, imageIndex) => {
              const isZoomed = zoom?.index === imageIndex;

              return (
                <div key={image.src} className="relative h-full min-w-full snap-center">
                  <div
                    ref={isZoomed ? zoomPaneRef : undefined}
                    className={`h-full w-full ${isZoomed ? "overflow-auto" : "overflow-hidden"}`}
                  >
                    <button
                      type="button"
                      onClick={(event) => toggleZoom(event, imageIndex)}
                      className={`relative block ${isZoomed ? "cursor-zoom-out" : "h-full w-full cursor-zoom-in"}`}
                      style={
                        isZoomed
                          ? { width: `${ZOOM_SCALE * 100}%`, height: `${ZOOM_SCALE * 100}%` }
                          : undefined
                      }
                      aria-label={image.alt}
                    >
                      <Image
                        src={optimizeImageUrl(image.src, 2000)}
                        alt={image.alt}
                        fill
                        sizes={isZoomed ? `${ZOOM_SCALE * 100}vw` : "100vw"}
                        className="object-contain p-2 sm:p-6"
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {images.length > 1 ? (
            <div className="flex items-center justify-center gap-3 border-t border-[var(--app-border)] p-3">
              <button
                type="button"
                onClick={() => go(-1)}
                className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface)]"
                aria-label={copy.previousPhoto}
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-surface)]"
                aria-label={copy.nextPhoto}
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ProductGallery({
  images,
  selectedSrc,
  title,
  copy,
}: {
  images: GalleryImage[];
  /** When this changes (e.g. a variant is picked), the carousel jumps to that image. */
  selectedSrc?: string | null;
  title: string;
  copy: GalleryCopy;
}) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const thumbsRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const handleScroll = useSnapIndex(setActiveIndex);

  useEffect(() => {
    if (!selectedSrc) return;
    const index = images.findIndex((image) => image.src === selectedSrc);
    if (index >= 0) scrollToIndex(carouselRef.current, index);
  }, [selectedSrc, images]);

  // Keep the active thumbnail visible in the strip.
  useEffect(() => {
    const strip = thumbsRef.current;
    const thumb = strip?.children[activeIndex] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    strip.scrollTo({ left: thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2, behavior: "smooth" });
  }, [activeIndex]);

  function go(direction: -1 | 1) {
    scrollToIndex(carouselRef.current, (activeIndex + direction + images.length) % images.length);
  }

  if (images.length === 0) return null;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-[var(--app-border)] bg-white shadow-sm">
      <div
        ref={carouselRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-roledescription="carousel"
      >
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setZoomOpen(true)}
            className="relative flex h-[22rem] min-w-full cursor-zoom-in snap-center items-center justify-center bg-[var(--app-surface)] sm:h-[32rem]"
            aria-label={`${image.alt}. ${copy.zoom}`}
          >
            <Image
              src={optimizeImageUrl(image.src, 1200)}
              alt={image.alt}
              fill
              // First photo is the LCP element: fetch it immediately at high priority; the rest stay lazy.
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              sizes="(max-width: 1023px) 100vw, 728px"
              className="object-contain p-4 sm:p-8"
            />
          </button>
        ))}
      </div>

      <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-[var(--app-text-soft)] shadow-sm">
        <ZoomIn className="size-3.5" />
        {copy.zoom}
      </span>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-3 top-[11rem] hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--app-border)] bg-white/90 text-[var(--app-text)] opacity-0 shadow-md backdrop-blur transition-opacity hover:bg-white group-hover:opacity-100 focus-visible:opacity-100 sm:top-[16rem] md:flex"
            aria-label={copy.previousPhoto}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-3 top-[11rem] hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--app-border)] bg-white/90 text-[var(--app-text)] opacity-0 shadow-md backdrop-blur transition-opacity hover:bg-white group-hover:opacity-100 focus-visible:opacity-100 sm:top-[16rem] md:flex"
            aria-label={copy.nextPhoto}
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-xs">
            {activeIndex + 1} / {images.length}
          </div>

          <div
            ref={thumbsRef}
            className="flex gap-2 overflow-x-auto border-t border-[var(--app-border)] p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((image, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => scrollToIndex(carouselRef.current, index)}
                  aria-label={copy.showPhoto(index + 1)}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative size-16 shrink-0 overflow-hidden rounded-xl border bg-[var(--app-surface)] transition-all ${
                    isActive
                      ? "border-[var(--app-primary)] ring-2 ring-[var(--app-primary-soft)]"
                      : "border-[var(--app-border)] hover:border-[var(--app-text-faint)]"
                  }`}
                >
                  <Image src={optimizeImageUrl(image.src, 240)} alt={image.alt} fill sizes="64px" className="object-cover" />
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {zoomOpen ? (
        <ZoomViewer
          images={images}
          startIndex={activeIndex}
          onOpenChange={setZoomOpen}
          onIndexChange={(index) => {
            setActiveIndex(index);
            scrollToIndex(carouselRef.current, index, false);
          }}
          copy={copy}
          title={title}
        />
      ) : null}
    </div>
  );
}
