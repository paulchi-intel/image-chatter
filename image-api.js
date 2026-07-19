(function () {
  "use strict";

  const BASE_URL = "https://gnai.intel.com/api/providers/openai/v1";
  const DEFAULT_MODEL = "gpt-image-2";
  const DEFAULT_TIMEOUT_MS = 900000;
  const DEFAULT_RETRIES = 3;
  const DEFAULT_RETRY_DELAY_MS = 10000;

  class ImageAPIError extends Error {
    constructor(message, details = {}) {
      super(message);
      this.name = "ImageAPIError";
      Object.assign(this, details);
    }
  }

  function sleep(ms, signal) {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException("Image generation cancelled", "AbortError"));
        return;
      }
      const timeoutId = setTimeout(done, ms);
      signal?.addEventListener("abort", abort, { once: true });

      function cleanup() {
        clearTimeout(timeoutId);
        signal?.removeEventListener("abort", abort);
      }
      function done() {
        cleanup();
        resolve();
      }
      function abort() {
        cleanup();
        reject(new DOMException("Image generation cancelled", "AbortError"));
      }
    });
  }

  function decodeBase64(base64, mimeType) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
  }

  async function readError(response) {
    const text = await response.text().catch(() => "");
    let data = null;
    try {
      data = JSON.parse(text);
    } catch (_error) {
      // Keep the text fallback for HTML/proxy errors.
    }
    const apiError = data?.error || {};
    return {
      status: response.status,
      code: apiError.code || null,
      message: apiError.message || text || response.statusText || "Request failed",
      raw: text
    };
  }

  function retryDelay(response, attempt) {
    const retryAfter = Number(response.headers.get("Retry-After"));
    if (Number.isFinite(retryAfter) && retryAfter >= 0) {
      return retryAfter * 1000;
    }
    return Math.min(DEFAULT_RETRY_DELAY_MS * (2 ** attempt), 60000);
  }

  function makeRequestBody({ model, prompt, size, quality, format, references }) {
    const common = {
      model,
      prompt,
      size,
      quality,
      output_format: format,
      n: 1
    };

    if (references.length === 0) {
      return {
        path: "/images/generations",
        body: JSON.stringify(common),
        contentType: "application/json"
      };
    }

    const form = new FormData();
    Object.entries(common).forEach(([key, value]) => form.append(key, String(value)));
    references.forEach((file) => form.append("image[]", file, file.name));
    return { path: "/images/edits", body: form, contentType: null };
  }

  async function requestOnce({ apiKey, body, contentType, path, timeoutMs, signal }) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort("timeout"), timeoutMs);
    const relayAbort = () => controller.abort("cancelled");
    signal?.addEventListener("abort", relayAbort, { once: true });

    const headers = { Authorization: `Bearer ${apiKey}` };
    if (contentType) headers["Content-Type"] = contentType;

    try {
      return await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers,
        body,
        signal: controller.signal
      });
    } catch (error) {
      if (controller.signal.aborted) {
        if (signal?.aborted || controller.signal.reason === "cancelled") {
          throw new ImageAPIError("Image generation cancelled", { code: "cancelled" });
        }
        throw new ImageAPIError(
          `Image request timed out after ${Math.round(timeoutMs / 1000)} seconds`,
          { code: "timeout" }
        );
      }
      throw new ImageAPIError(error.message || String(error), { code: "network_error" });
    } finally {
      clearTimeout(timeoutId);
      signal?.removeEventListener("abort", relayAbort);
    }
  }

  async function generateImage(options) {
    const {
      apiKey,
      model = DEFAULT_MODEL,
      prompt,
      size = "1024x1024",
      quality = "auto",
      format = "png",
      references = [],
      timeoutMs = DEFAULT_TIMEOUT_MS,
      retries = DEFAULT_RETRIES,
      signal,
      onRetry
    } = options || {};

    if (!apiKey?.trim() || apiKey.trim().startsWith("pak_")) {
      throw new ImageAPIError("A GNAI API key is required; ExpertGPT keys are not supported");
    }
    if (!/^gpt-image-[a-z0-9._-]+$/i.test(model)) {
      throw new ImageAPIError("Select a verified GNAI image-generation model");
    }
    if (!prompt?.trim()) throw new ImageAPIError("Image prompt is required");
    if (!["png", "jpeg"].includes(format)) {
      throw new ImageAPIError("GNAI output format must be png or jpeg");
    }

    const request = makeRequestBody({ model, prompt: prompt.trim(), size, quality, format, references });
    let response;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      response = await requestOnce({ apiKey, ...request, timeoutMs, signal });
      if (response.ok) break;

      const error = await readError(response);
      if (response.status !== 429 || attempt >= retries) {
        throw new ImageAPIError(`HTTP ${response.status}: ${error.message}`, error);
      }

      const delayMs = retryDelay(response, attempt);
      onRetry?.({ attempt: attempt + 2, total: retries + 1, delayMs, error });
      await sleep(delayMs, signal);
    }

    const result = await response.json().catch(() => null);
    const image = result?.data?.[0];
    if (!image) throw new ImageAPIError("Image API returned no image data");

    const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
    let blob;
    if (image.b64_json) {
      blob = decodeBase64(image.b64_json, mimeType);
    } else if (image.url) {
      const download = await fetch(image.url, { signal });
      if (!download.ok) throw new ImageAPIError(`Image download failed (${download.status})`);
      blob = await download.blob();
    } else {
      throw new ImageAPIError("Image API response has no b64_json or url");
    }

    return {
      blob,
      mimeType: blob.type || mimeType,
      format,
      revisedPrompt: image.revised_prompt || ""
    };
  }

  window.ImageChatterImageAPI = {
    generateImage,
    decodeBase64,
    ImageAPIError,
    DEFAULT_TIMEOUT_MS,
    DEFAULT_RETRIES,
    DEFAULT_MODEL
  };
})();
