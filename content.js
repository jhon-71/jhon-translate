// Flag to prevent multiple injections
if (!window.jhonTranslateInjected) {
  window.jhonTranslateInjected = true;

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "START_TRANSLATE") {
      startTranslation(request.targetLang);
    }
  });

  let hoveredElement = null;
  const selectors = 'p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote';

  document.addEventListener('mouseover', (e) => {
    if (e.target && e.target.closest) {
      hoveredElement = e.target.closest(selectors);
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target && e.target.closest && e.target.closest(selectors) === hoveredElement) {
      hoveredElement = null;
    }
  });

  document.addEventListener('keydown', (e) => {
    // 扩展更新后，如果网页没刷新，旧的 content.js 会变成孤儿脚本，chrome API 会失效
    if (!chrome.runtime || !chrome.runtime.id) return;

    // 全文翻译：Alt + A (Option + A on Mac)
    if (e.altKey && e.code === 'KeyA') {
      e.preventDefault();
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['targetLang'], (result) => {
          const targetLang = result.targetLang || 'zh-CN';
          startTranslation(targetLang);
        });
      }
      return;
    }

    // 单段悬停翻译：'Alt' (Option key on Mac)
    if (e.key === 'Alt' && hoveredElement) {
      // 忽略直接停留在翻译结果上的情况
      if (hoveredElement.classList.contains('jhon-translate-result')) {
        return;
      }

      // 如果已经翻译过了，则执行“取消翻译/隐藏翻译”操作（Toggle）
      if (hoveredElement.dataset.jhonTranslated) {
        const nextEl = hoveredElement.nextElementSibling;
        if (nextEl && nextEl.classList.contains('jhon-translate-result')) {
          nextEl.remove();
        }
        delete hoveredElement.dataset.jhonTranslated;
        return;
      }
      
      const text = hoveredElement.innerText?.trim();
      if (!text || text.length < 2 || /^[\d\s.,!?@#\$%\^&\*\(\)\-_=\+\[\]\{\}\\|;:'"<>\/`~]+$/.test(text)) {
        return;
      }

      hoveredElement.dataset.jhonTranslated = "true";
      
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['targetLang'], (result) => {
          const targetLang = result.targetLang || 'zh-CN';
          processElement(hoveredElement, text, targetLang);
        });
      }
    }
  });

  async function startTranslation(targetLang) {
    // 如果整个页面已经翻译过了，再次触发则清除所有翻译（Toggle Off）
    if (document.body.dataset.pageTranslated) {
      document.querySelectorAll('.jhon-translate-result').forEach(el => el.remove());
      document.querySelectorAll('[data-jhon-translated="true"]').forEach(el => delete el.dataset.jhonTranslated);
      delete document.body.dataset.pageTranslated;
      return;
    }

    // 标记页面已整体翻译
    document.body.dataset.pageTranslated = "true";

    // Select common block elements containing text
    const selectors = 'p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote';
    const elements = document.querySelectorAll(selectors);

    // Limit concurrency to avoid slamming the API
    const concurrencyLimit = 3;
    let activePromises = [];

    for (let el of elements) {
      // Skip if already translated
      if (el.dataset.jhonTranslated || el.classList.contains('jhon-translate-result')) {
        continue;
      }

      // Get text, trim it
      const text = el.innerText?.trim();
      
      // Basic filter: skip empty or very short strings, or purely numeric/symbol strings
      if (!text || text.length < 2 || /^[\d\s.,!?@#\$%\^&\*\(\)\-_=\+\[\]\{\}\\|;:'"<>\/`~]+$/.test(text)) {
        continue;
      }

      // Mark as translated so we don't process it again
      el.dataset.jhonTranslated = "true";

      const p = processElement(el, text, targetLang);
      activePromises.push(p);
      p.finally(() => {
        const idx = activePromises.indexOf(p);
        if (idx !== -1) activePromises.splice(idx, 1);
      });

      if (activePromises.length >= concurrencyLimit) {
        await Promise.race(activePromises);
      }
    }
  }

  async function processElement(el, text, targetLang) {
    try {
      const response = await new Promise((resolve) => {
        try {
          chrome.runtime.sendMessage(
            { action: "TRANSLATE_TEXT", text: text, targetLang: targetLang },
            (res) => {
              if (chrome.runtime.lastError) {
                // Ignore connection errors if context invalidated
                resolve(null);
              } else {
                resolve(res);
              }
            }
          );
        } catch(e) {
          resolve(null);
        }
      });

      if (response && response.translated) {
        injectTranslation(el, response.translated);
      }
    } catch (e) {
      console.error("Jhon Translate error on element:", el, e);
    }
  }

  function injectTranslation(originalElement, translatedText) {
    // Create the container for the translated text
    // Using a span with display block or a div depending on parent
    const resultNode = document.createElement('div');
    resultNode.classList.add('jhon-translate-result');
    resultNode.textContent = translatedText;

    // Apply "Immersive" style (like original)
    resultNode.style.color = '#666'; // Dimmed color
    resultNode.style.marginTop = '4px';
    resultNode.style.marginBottom = '8px';
    resultNode.style.fontSize = '0.95em';
    resultNode.style.lineHeight = '1.5';
    // Match the original alignment
    const computedStyle = window.getComputedStyle(originalElement);
    resultNode.style.textAlign = computedStyle.textAlign;

    // Insert after the original element
    originalElement.insertAdjacentElement('afterend', resultNode);
  }
}
