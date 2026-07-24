/**
 * Uploads a base64 data-URL image to a private bucket and returns its
 * storage path (not a URL — the bucket is private, so callers must generate
 * a signed URL via `getSignedUrl` when they need to display it).
 * If the input is already a storage path (e.g. re-submission without
 * changing this image), it's returned unchanged.
 */
export declare function uploadDataUrlToStorage(bucket: string, dataUrl: string, userId: string, label: string): Promise<string>;
/** Generates a short-lived signed URL for a stored document path in the given bucket. */
export declare function getSignedUrl(bucket: string, path: string | null | undefined): Promise<string | undefined>;
/** Resolves signed URLs for multiple stored document paths in the same bucket, in parallel. */
export declare function getSignedUrls<K extends string>(bucket: string, paths: Record<K, string | null | undefined>): Promise<Record<K, string | undefined>>;
/** Uploads a base64 image for a pipeline task completion to the task-images bucket. */
export declare function uploadTaskImage(dataUrl: string, userId: string, label: string): Promise<string>;
/** Signed URL for a stored task-completion image. */
export declare function getSignedTaskImageUrl(path: string | null | undefined): Promise<string | undefined>;
/** Backwards-compatible KYC-specific helpers (kept for existing call sites). */
export declare function uploadKycImage(dataUrl: string, userId: string, label: string): Promise<string>;
export declare function getSignedKycUrl(path: string | null | undefined): Promise<string | undefined>;
export declare function getSignedKycUrls<K extends string>(paths: Record<K, string | null | undefined>): Promise<Record<K, string | undefined>>;
//# sourceMappingURL=storage.d.ts.map