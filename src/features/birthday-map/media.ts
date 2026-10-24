/** Swap any image or video under `root` that fails to load for a quiet notice. */
export function attachMediaFallback(root: ParentNode, message: string): void {
  root.querySelectorAll<HTMLImageElement | HTMLVideoElement>('img, video').forEach((el) =>
    el.addEventListener(
      'error',
      () => {
        const notice = document.createElement('p');
        notice.className = 'media-missing';
        notice.textContent = message;
        el.replaceWith(notice);
      },
      { once: true },
    ),
  );
}
