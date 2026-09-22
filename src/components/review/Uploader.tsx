/*
  After Hourz — optional multi-file UPLOADER for the guided interview.

  UPLOAD CONTRACT (must match /api/review/upload):
    POST /api/review/upload  multipart/form-data { file, category, reviewSessionId }
    200 -> { ok:true, assetId, category, filename, status:"stored" }

  Behavior:
    - Multi-file "Add Photos": drag/drop + a real (accessible) <input type=file multiple>
      hidden under custom plaque styling; taps open the OS/mobile picker.
    - Thumbnails with per-file status: uploading -> added -> failed (with Retry).
      A retry re-sends ONLY that file and never drops the others.
    - Remove / Add more at any time. Successful asset refs are lifted to the draft
      (persist across Back/Continue) and included in submission.assets.
    - Plain "optional / you can send these later" copy + a short privacy line.
    - Large videos are NOT uploaded here — the copy points to "Paste a video link".

  The browser NEVER sees R2/object keys; it only holds the returned assetId + filename.
*/
import { useCallback, useId, useRef, useState } from 'react';
import type { AssetRef } from '../../lib/review/schema';

const UPLOAD_ENDPOINT = '/api/review/upload';

/** One in-flight or finished upload item shown as a thumbnail. */
interface UploadItem {
  localId: string;
  file: File | null; // kept for retry; cleared once added to free memory
  filename: string;
  previewUrl: string | null; // object URL for image thumbnails
  status: 'uploading' | 'added' | 'failed';
  assetId?: string; // set when added
  error?: string;
}

function newLocalId(): string {
  return `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isImage(file: File): boolean {
  return file.type.startsWith('image/');
}

export interface UploaderProps {
  /** Which ASSET_CATEGORIES bucket these files belong to. */
  category: AssetRef['category'];
  /** Stable session id from the draft (links uploads to the eventual submission). */
  reviewSessionId: string;
  /** Existing asset refs for THIS category (from the draft) so thumbnails persist. */
  value: AssetRef[];
  /** Called whenever the set of successfully-stored assets for this category changes. */
  onChange: (assets: AssetRef[]) => void;
  /** Button label, e.g. "Add Photos" / "Add a File". */
  addLabel?: string;
  /** Short line under the dropzone (optional-ness is always implied). */
  hint?: React.ReactNode;
}

export function Uploader({
  category,
  reviewSessionId,
  value,
  onChange,
  addLabel = 'Add Photos',
  hint,
}: UploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  // Transient UI items (uploading/failed) that aren't yet — or won't be — in `value`.
  const [items, setItems] = useState<UploadItem[]>([]);
  // Track the current committed assets in a ref so async handlers append correctly.
  const valueRef = useRef<AssetRef[]>(value);
  valueRef.current = value;

  const commitAdd = useCallback(
    (ref: AssetRef) => {
      const next = [...valueRef.current, ref];
      valueRef.current = next;
      onChange(next);
    },
    [onChange],
  );

  const commitRemove = useCallback(
    (assetId: string) => {
      const next = valueRef.current.filter((a) => a.assetId !== assetId);
      valueRef.current = next;
      onChange(next);
    },
    [onChange],
  );

  const doUpload = useCallback(
    async (localId: string, file: File) => {
      setItems((prev) =>
        prev.map((it) =>
          it.localId === localId ? { ...it, status: 'uploading', error: undefined } : it,
        ),
      );
      try {
        const form = new FormData();
        form.append('file', file);
        form.append('category', category);
        form.append('reviewSessionId', reviewSessionId);
        const res = await fetch(UPLOAD_ENDPOINT, { method: 'POST', body: form });
        const data = (await res.json().catch(() => null)) as
          { ok: true; assetId: string; filename: string } | { ok: false; error?: string } | null;
        if (!res.ok || !data || data.ok !== true || !data.assetId) {
          const msg =
            (data && 'error' in data && data.error) ||
            "That file didn't go through. Tap retry to try again.";
          setItems((prev) =>
            prev.map((it) =>
              it.localId === localId ? { ...it, status: 'failed', error: msg } : it,
            ),
          );
          return;
        }
        // Success — lift to the draft, keep the thumbnail, drop the File to free memory.
        commitAdd({ assetId: data.assetId, category, filename: data.filename });
        setItems((prev) =>
          prev.map((it) =>
            it.localId === localId
              ? { ...it, status: 'added', assetId: data.assetId, file: null, error: undefined }
              : it,
          ),
        );
      } catch {
        setItems((prev) =>
          prev.map((it) =>
            it.localId === localId
              ? {
                  ...it,
                  status: 'failed',
                  error: "That file didn't go through. Check your connection and tap retry.",
                }
              : it,
          ),
        );
      }
    },
    [category, reviewSessionId, commitAdd],
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      for (const file of list) {
        const localId = newLocalId();
        const previewUrl = isImage(file) ? URL.createObjectURL(file) : null;
        setItems((prev) => [
          ...prev,
          { localId, file, filename: file.name, previewUrl, status: 'uploading' },
        ]);
        void doUpload(localId, file);
      }
    },
    [doUpload],
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length) addFiles(e.target.files);
      // reset so the same file can be re-picked
      e.target.value = '';
    },
    [addFiles],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const retry = useCallback(
    (localId: string) => {
      const it = items.find((i) => i.localId === localId);
      if (it?.file) void doUpload(localId, it.file);
    },
    [items, doUpload],
  );

  const removeItem = useCallback(
    (it: UploadItem) => {
      if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
      if (it.assetId) commitRemove(it.assetId);
      setItems((prev) => prev.filter((i) => i.localId !== it.localId));
    },
    [commitRemove],
  );

  // Thumbnails: transient items (uploading/failed) + any committed assets that have no
  // live thumbnail item (e.g. restored from a saved draft) shown as filename chips.
  const shownAssetIds = new Set(items.filter((i) => i.assetId).map((i) => i.assetId));
  const restored = value.filter((a) => !shownAssetIds.has(a.assetId));

  // Uploads are baked on only when the deploy enables them (PUBLIC_UPLOADS_ENABLED=1).
  // While file storage isn't available, the questionnaire still works — we just invite
  // Anthony to send photos later instead of showing a picker that can't store anything.
  const uploadsEnabled = import.meta.env.PUBLIC_UPLOADS_ENABLED === '1';
  if (!uploadsEnabled) {
    return (
      <p className="rv-uploader__later">
        No need to add anything here — you can text or email us your photos and files anytime
        after you submit, and we&rsquo;ll add them for you.
      </p>
    );
  }

  return (
    <div className="rv-uploader">
      <div
        className={`rv-dropzone${dragging ? ' is-dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          id={inputId}
          className="rv-file-input"
          type="file"
          accept="image/*,application/pdf,.csv,.xlsx"
          multiple
          onChange={onInputChange}
        />
        <label htmlFor={inputId} className="ah-btn ah-btn--ghost rv-add-btn">
          {addLabel}
        </label>
        <p className="rv-dropzone-hint">
          Drag photos here, or tap to choose from your phone or computer.
        </p>
      </div>

      {(items.length > 0 || restored.length > 0) && (
        <ul className="rv-thumbs" aria-label="Added files">
          {items.map((it) => (
            <li
              key={it.localId}
              className={`rv-thumb rv-thumb--${it.status}`}
              aria-label={`${it.filename} — ${
                it.status === 'added' ? 'added' : it.status === 'uploading' ? 'uploading' : 'failed'
              }`}
            >
              <div className="rv-thumb-media">
                {it.previewUrl ? (
                  <img src={it.previewUrl} alt="" className="rv-thumb-img" />
                ) : (
                  <span className="rv-thumb-doc" aria-hidden="true">
                    FILE
                  </span>
                )}
                {it.status === 'uploading' && (
                  <span className="rv-thumb-status rv-thumb-status--uploading">Uploading…</span>
                )}
                {it.status === 'added' && (
                  <span className="rv-thumb-status rv-thumb-status--added" aria-hidden="true">
                    ✓
                  </span>
                )}
                {it.status === 'failed' && (
                  <span className="rv-thumb-status rv-thumb-status--failed" aria-hidden="true">
                    !
                  </span>
                )}
              </div>
              <div className="rv-thumb-name" title={it.filename}>
                {it.filename}
              </div>
              {it.status === 'failed' && (
                <>
                  <p className="rv-thumb-error">{it.error}</p>
                  <div className="rv-thumb-actions">
                    <button
                      type="button"
                      className="rv-thumb-btn"
                      onClick={() => retry(it.localId)}
                    >
                      Retry
                    </button>
                    <button
                      type="button"
                      className="rv-thumb-btn rv-thumb-btn--danger"
                      onClick={() => removeItem(it)}
                    >
                      Remove
                    </button>
                  </div>
                </>
              )}
              {it.status !== 'failed' && (
                <div className="rv-thumb-actions">
                  <button
                    type="button"
                    className="rv-thumb-btn rv-thumb-btn--danger"
                    onClick={() => removeItem(it)}
                    disabled={it.status === 'uploading'}
                  >
                    Remove
                  </button>
                </div>
              )}
            </li>
          ))}

          {restored.map((a) => (
            <li
              key={a.assetId}
              className="rv-thumb rv-thumb--added"
              aria-label={`${a.filename} — added`}
            >
              <div className="rv-thumb-media">
                <span className="rv-thumb-doc" aria-hidden="true">
                  FILE
                </span>
                <span className="rv-thumb-status rv-thumb-status--added" aria-hidden="true">
                  ✓
                </span>
              </div>
              <div className="rv-thumb-name" title={a.filename}>
                {a.filename}
              </div>
              <div className="rv-thumb-actions">
                <button
                  type="button"
                  className="rv-thumb-btn rv-thumb-btn--danger"
                  onClick={() => commitRemove(a.assetId)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="rv-upload-note">
        {hint ?? 'Totally optional — you can send these to us later if it’s easier.'}
      </p>
      <p className="rv-upload-privacy">
        Your files are private to us for building your site. We don’t share them.
      </p>
    </div>
  );
}
