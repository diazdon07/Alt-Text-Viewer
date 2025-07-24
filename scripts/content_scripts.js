const style = document.createElement('style');
style.textContent = `
div.alt-replacement {
    position: absolute;
    display: flex;
    flex-direction: column;
    top: 0;
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
}
div.alt-replacement p {
    font-size: 16px !important;
    line-height: normal;
    font-weight: 400;
    text-align: center;
    font-style: normal;
    margin: 0px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    background: radial-gradient(circle, rgba(43, 58, 117, 0.9) 0%, rgba(0, 0, 0, 1) 100%);
    padding: 1% 5%;
    font-family: poppins, Sans-Serif;
    min-width: 200px !important;
    max-width: 700px !important;
}
`;
document.head.appendChild(style);

function getLabelledByText(id) {
    if (!id) return null;
    const el = document.getElementById(id);
    return el ? el.textContent.trim() : null;
}

function checkAltText() {
    const altElements = document.querySelectorAll('img, svg, input[type="image"]');

    // Helper: get text from aria-labelledby (supports multiple IDs)
    function getLabelledByText(ids) {
        if (!ids) return null;
        return ids
            .split(' ')
            .map(id => {
                const el = document.getElementById(id);
                return el ? el.textContent.trim() : '';
            })
            .filter(Boolean)
            .join(' ');
    }

    // Helper: check if any selectors exist in DOM
    const hasElement = (selectorList) => {
        return selectorList.some(sel => document.querySelector(sel));
    };

    // Detect if it's a Duda site
    const dudaSelectors = [
        '#dm',
        '.dmRespRow',
        '.dmWidget',
        '.dmInner',
        'script[src*="duda"]'
    ];
    const isDuda = hasElement(dudaSelectors);

    // Loop through target elements
    altElements.forEach(element => {
        const tag = element.tagName.toLowerCase();
        const parentTag = element.parentElement?.tagName?.toLowerCase() || '';

        // Prevent duplicate overlay
        const existingOverlay = element.nextElementSibling;
        if (existingOverlay && existingOverlay.classList.contains('alt-replacement')) {
            return;
        }

        // Create overlay
        const div = document.createElement('div');
        div.className = 'alt-replacement';

        const altValue = element.getAttribute('alt');
        const ariaLabel = element.getAttribute('aria-label');
        const ariaLabelledBy = element.getAttribute('aria-labelledby');
        const labelledByText = getLabelledByText(ariaLabelledBy);
        const tooltipValue = element.getAttribute('title');

        let svgTitleText = null;
        if (tag === 'svg') {
            const titleEl = element.querySelector('title');
            if (titleEl) svgTitleText = titleEl.textContent.trim();
        }

        const altText = altValue || ariaLabel || labelledByText;
        const tooltipText = tooltipValue || svgTitleText;

        const isDudaSpecialImg =
            isDuda &&
            tag === 'img' &&
            (
                parentTag === 'a' ||
                element.getAttribute('data-grab') === 'slide-media'
            );

        // Custom handling for SVG
        if (tag === 'svg') {
            div.innerHTML = `
                ${altText ? `<p><span style="color: white;">Alt Text:</span><br><span style="color: white;">${altText}</span></p>` : `<p style="color:#F44336;">No Alt Text.</p>`}
                ${tooltipText ? `<p><span style="color: white;">Tooltip:</span><br><span style="color: white;">${tooltipText}</span></p>` : `<p style="color:#F44336;">No Tooltip.</p>`}
            `;
        }
        // Special handling for Duda image links
        else if (isDudaSpecialImg) {
            div.innerHTML = `
                ${altText ? `<p><span style="color: white;">Alt Text:</span><br><span style="color: white;">${altText}</span></p>` : `<p style="color:#F44336;">No Alt Text.</p>`}
            `;
        }
        // Default handling
        else {
            div.innerHTML = `
                ${altText ? `<p><span style="color: white;">Alt Text:</span><br><span style="color: white;">${altText}</span></p>` : `<p style="color:#F44336;">No Alt Text.</p>`}
                ${tooltipText ? `<p><span style="color: white;">Tooltip:</span><br><span style="color: white;">${tooltipText}</span></p>` : `<p style="color:#F44336;">No Tooltip.</p>`}
            `;
        }

        // Insert the overlay after the element
        if (element.parentNode) {
            element.parentNode.insertBefore(div, element.nextSibling);
        }
    });
}


function removeAltReplacements() {
    document.querySelectorAll('.alt-replacement').forEach(el => el.remove());
}

let observer;
let debounceTimeout;

function startObserver() {
    observer = new MutationObserver(mutations => {
        let relevantMutation = false;
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && !node.classList?.contains('alt-replacement')) {
                    relevantMutation = true;
                }
            });
            mutation.removedNodes.forEach(node => {
                if (node.nodeType === 1 && !node.classList?.contains('alt-replacement')) {
                    relevantMutation = true;
                }
            });
        });

        if (relevantMutation) {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                removeAltReplacements();
                checkAltText();
            }, 300);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function stopObserver() {
    if (observer) observer.disconnect();
}

function alttextToggle(on) {
    if (on) {
        checkAltText();
        startObserver();
    } else {
        stopObserver();
        removeAltReplacements();
    }
}

// Initial state from storage
chrome.storage.sync.get("toggle", (data) => {
    alttextToggle(data.toggle === "on");
});

// Listen for messages to toggle overlays
chrome.runtime.onMessage.addListener((message) => {
    alttextToggle(message.action === "on");
});
