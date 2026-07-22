# Image Chatter

A Chrome extension for image analysis and image generation. Accepts GNAI API keys as its AI model source.

## Features

- Analyze PNG, JPEG, WebP, and GIF images up to 20 MB.
- Add up to ten analysis images through the composer button, drag and drop, or the clipboard.
- Analyze all attached images together, or run the same prompt once per image with two requests in parallel.
- Keep per-image result cards in the conversation and switch follow-up context between one image and the full batch.
- Collapse the analysis attachment tray to leave more room for reading the conversation.
- Quick prompts designed for charts and slides: summary, data extraction, trend analysis, insights, action items, and translation.
- Generate PNG or JPEG images with size and quality controls.
- Use up to ten PNG, JPEG, or WebP generation references per image tab, added from the picker, drag and drop, or the clipboard.
- Keep separate generation prompts, references, settings, and results in reorderable image tabs.
- Open generation reference thumbnails in deduplicated browser tabs and collapse their settings/reference tray when more preview space is needed.
- Fetch candidate model names from the Model column at `https://gpusw-docs.intel.com/services/gnai/models/#models`.
- Verify analysis models with a real minimal image request.
- Verify image-generation models through the authenticated GNAI `/models` catalog without generating a billable test image.
- Switch between side-panel and popup display modes.

## Install

Download the latest packaged version from [GitHub Releases](https://github.com/paulchi-intel/image-chatter/releases/latest), extract the ZIP, then:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose **Load unpacked**.
4. Select the extracted `image-chatter` directory.
5. Open Image Chatter and enter a GNAI API key.

## Update

Image Chatter checks the latest public GitHub Release at startup and shows a banner when a newer version is available. Update checks are cached for six hours, and dismissing the banner skips only that release version.

To update an unpacked installation:

1. Use the in-extension update banner or open [GitHub Releases](https://github.com/paulchi-intel/image-chatter/releases/latest).
2. Download and extract the latest `image-chatter-v*.zip`.
3. Replace the previously extracted extension files, keeping the same folder location.
4. Open `chrome://extensions` and click **Reload** on Image Chatter.

Extension conversations and settings are stored in Chrome storage and remain available when the same installed extension is reloaded.

## Publish a Release

1. Update `version` in `manifest.json` and commit the change.
2. Create and push a matching tag, for example `v1.1.0`.
3. The GitHub Actions release workflow validates the JavaScript, packages the extension, writes a SHA-256 checksum, and creates the GitHub Release automatically.

## Use

### Analyze

1. Add one or more images through the composer button, drag and drop, or the clipboard.
2. Choose **Combined analysis** for one response covering the full set, or **Per-image analysis** to apply the prompt separately to every image.
3. Choose an image-analysis model, then select a quick question or enter a custom question.
4. After sending, the composer attachment and prompt are cleared while the image remains in conversation context for text-only follow-up questions.
5. In per-image results, use **Follow up** on a card to focus on one image or **Compare all images** to restore the full-batch context.
6. Adding another image after a question starts a new image context while keeping earlier messages visible.

### Generate

1. Switch to **Generate**.
2. Select a verified generation model, size, quality, and output format.
3. Optionally add one or more reference images.
4. Enter a prompt and generate, cancel, download, regenerate, or reuse the result as a reference.
5. After sending, the prompt and references move into the user message and the generation composer is cleared for the next request.

## Model Verification

The model-selector action first reads the current GNAI documentation and lists the discovered model names. It then assigns one of these states:

- **Analysis**: a minimal PNG image request succeeded, or reached the model and was rate-limited.
- **Generation**: the documentation Model column contains a `gpt-image-*` model. The generic `/models` endpoint is not used because it can omit models served only by image endpoints.
- **No image support**: neither check passed.

Generation verification intentionally avoids creating a test image so refreshing the list does not incur image-generation cost.

## Files

- `manifest.json`: Chrome MV3 manifest and restricted GNAI/documentation host permissions.
- `background.js`: GNAI API bridge, documentation parsing, capability verification, and multimodal request conversion.
- `sidepanel.html`: Analyze and Generate workspaces.
- `sidepanel.js`: UI, tabs, image loading, quick prompts, model state, and downloads.
- `image-api.js`: GPT Image-compatible generation and reference-image edit requests with timeout and retry handling.

API keys and lightweight UI state are stored in `chrome.storage.local`. Attached analysis images are stored in IndexedDB so conversations and embedded-image Markdown exports survive extension reloads.
