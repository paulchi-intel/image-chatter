const CHAT_IMAGE_DB_NAME = "image-chatter-assets";
const CHAT_IMAGE_STORE_NAME = "chat-images";

const UI = {
  image: document.getElementById("viewerImage"),
  imageName: document.getElementById("imageName"),
  message: document.getElementById("viewerMessage"),
  status: document.getElementById("viewerStatus")
};

function viewerText(key) {
  const language = navigator.language?.toLowerCase() || "en";
  const isTraditionalChinese = language === "zh-tw" || language === "zh-hk";
  const isSimplifiedChinese = language.startsWith("zh") && !isTraditionalChinese;
  const translations = {
    loading: isTraditionalChinese ? "正在載入圖片…" : isSimplifiedChinese ? "正在加载图片…" : "Loading image…",
    missingId: isTraditionalChinese ? "找不到圖片識別碼。" : isSimplifiedChinese ? "找不到图片标识符。" : "The image id is missing.",
    notFound: isTraditionalChinese ? "找不到這張圖片，可能已被清除。" : isSimplifiedChinese ? "找不到这张图片，可能已被清除。" : "This image could not be found. It may have been cleared.",
    invalid: isTraditionalChinese ? "圖片資料格式無效。" : isSimplifiedChinese ? "图片数据格式无效。" : "The stored image data is invalid.",
    failed: isTraditionalChinese ? "無法載入圖片。" : isSimplifiedChinese ? "无法加载图片。" : "Unable to load the image."
  };
  return translations[key] || "";
}

function showMessage(text) {
  UI.message.textContent = text;
  UI.message.hidden = false;
  UI.image.classList.remove("ready");
}

function openImageDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CHAT_IMAGE_DB_NAME, 1);
    request.addEventListener("upgradeneeded", () => {
      if (!request.result.objectStoreNames.contains(CHAT_IMAGE_STORE_NAME)) {
        request.result.createObjectStore(CHAT_IMAGE_STORE_NAME, { keyPath: "id" });
      }
    });
    request.addEventListener("success", () => resolve(request.result), { once: true });
    request.addEventListener("error", () => reject(request.error || new Error("Unable to open image storage")), { once: true });
  });
}

async function loadImageAsset(imageId) {
  const db = await openImageDb();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(CHAT_IMAGE_STORE_NAME, "readonly")
        .objectStore(CHAT_IMAGE_STORE_NAME).get(imageId);
      request.addEventListener("success", () => resolve(request.result || null), { once: true });
      request.addEventListener("error", () => reject(request.error), { once: true });
    });
  } finally {
    db.close();
  }
}

async function initializeViewer() {
  showMessage(viewerText("loading"));
  const imageId = new URLSearchParams(location.search).get("imageId")?.trim();
  if (!imageId) {
    showMessage(viewerText("missingId"));
    return;
  }

  try {
    const image = await loadImageAsset(imageId);
    if (!image) {
      showMessage(viewerText("notFound"));
      return;
    }
    if (!/^data:image\/(png|jpeg|webp|gif);base64,/i.test(image.dataUrl || "")) {
      showMessage(viewerText("invalid"));
      return;
    }

    const name = image.name || "Image Chatter";
    document.title = name;
    UI.imageName.textContent = name;
    UI.image.alt = name;
    UI.image.addEventListener("load", () => {
      UI.status.textContent = `${UI.image.naturalWidth} × ${UI.image.naturalHeight}`;
      UI.message.hidden = true;
      UI.image.classList.add("ready");
    }, { once: true });
    UI.image.addEventListener("error", () => showMessage(viewerText("failed")), { once: true });
    UI.image.src = image.dataUrl;
  } catch (error) {
    console.error("[Image Chatter] Image viewer failed:", error);
    showMessage(viewerText("failed"));
  }
}

initializeViewer();
