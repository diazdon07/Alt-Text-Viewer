const style = document.createElement('style');
style.textContent = `
div.alt-replacement{
    position: absolute;
    display: none;
    flex-direction: column;
    top: 0;
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
}
div.alt-replacement p{
    font-size: .9rem;
    font-weight: 400;
    text-align: center;
    font-style: normal;
    margin: 0px;
    color: whitesmoke;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    background: radial-gradient(circle,rgba(43, 58, 117, 0.5) 0%, rgba(0, 0, 0, 0.8) 100%);
}
`;
document.head.appendChild(style);

let altElements = document.querySelectorAll('div[alt], img[alt], svg');

function checkAltText() {
    altElements.forEach(element => {
        let tag = element.tagName.toLowerCase();
        let div = document.createElement('div');
        let altValue = element.getAttribute('alt');
        let tooltipValue = element.getAttribute('title');
        let titleEl = element.querySelector('title');
        let altText = titleEl ? titleEl.textContent : null;

        div.className = 'alt-replacement';

        switch(tag) {
            case 'img':
                div.innerHTML = `
                    ${altValue ? `<p>Alt Text: <span>${altValue}</span></p>` : `<p style="color:red;">No Alt Text.</p>`}
                    ${tooltipValue ? `<p>Tooltip: <span>${tooltipValue}</span></p>` : `<p style="color:red;">No Tooltip.</p>`}
                `;
                break;
            case 'svg':
                div.innerHTML = `
                    ${altText ? `<p>Alt Text: <span>${altText}</span></p>` : `<p style="color:red;">No Alt Text (title tag missing).</p>`}
                `;
                break;
            case 'div':
              div.innerHTML = `
                  ${altValue ? `<p>Alt Text: <span>${altValue}</span></p>` : `<p style="color:red;">No Alt Text.</p>`}
                  ${tooltipValue ? `<p>Tooltip: <span>${tooltipValue}</span></p>` : `<p style="color:red;">No Tooltip.</p>`}
              `;
                break;
        }

        element.parentNode.insertBefore(div, element.nextSibling);
    });
}

checkAltText();

chrome.storage.sync.get("toggle", (data) => {
  alttextToggle(data.toggle === "on");
});
  
chrome.runtime.onMessage.addListener((message) => {
  alttextToggle(message.action === "on");
});

function alttextToggle(on){
  let targetElement = document.querySelectorAll('div.alt-replacement');

  targetElement.forEach(data => {
    if(on){
      data.style.display = "flex";
    } else {
      data.style.display = "none";
    }
  });
}