var u=".tref",g=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="24" height="24">
  <rect x="6" y="6" width="88" height="88" rx="12" ry="12" fill="#2D1B4E" stroke="#5CCCCC" stroke-width="5"/>
  <g transform="translate(50 50) scale(0.022) translate(-1125 -1125)">
    <g transform="translate(0,2250) scale(1,-1)" fill="#5CCCCC">
      <path d="M1515 2244 c-66 -10 -144 -38 -220 -77 -67 -35 -106 -67 -237 -195 -155 -152 -188 -195 -188 -247 0 -41 30 -95 64 -116 39 -24 113 -25 146 -3 14 9 90 81 170 160 183 181 216 199 350 199 83 0 103 -4 155 -28 78 -36 146 -104 182 -181 24 -53 28 -73 28 -151 0 -137 -21 -175 -199 -355 -79 -80 -151 -156 -160 -170 -39 -59 -8 -162 58 -194 81 -38 113 -22 284 147 165 163 230 252 268 370 24 71 28 99 28 202 0 106 -3 130 -28 200 -91 261 -310 428 -579 439 -50 3 -105 2 -122 0z"/>
      <path d="M1395 1585 c-17 -9 -189 -174 -382 -368 -377 -378 -383 -385 -362 -461 21 -76 87 -116 166 -101 33 6 80 49 386 353 191 191 358 362 369 381 26 42 28 109 4 146 -39 59 -118 81 -181 50z"/>
      <path d="M463 1364 c-47 -24 -323 -310 -365 -379 -20 -33 -49 -96 -64 -140 -24 -69 -28 -96 -28 -195 0 -127 14 -190 66 -294 63 -126 157 -220 284 -284 104 -52 167 -66 294 -66 99 0 126 4 195 28 44 15 107 44 140 64 65 39 348 309 371 354 41 78 -10 184 -96 203 -61 13 -98 -11 -256 -166 -186 -183 -222 -204 -359 -204 -77 0 -98 4 -147 27 -79 37 -142 98 -181 177 -29 59 -32 74 -32 156 0 136 21 174 199 355 79 80 150 156 159 170 23 33 22 107 -2 146 -35 57 -115 79 -178 48z"/>
    </g>
  </g>
</svg>`,c="application/vnd.tref+json",y="data:image/svg+xml,"+encodeURIComponent(g);function b(i){if(!i||typeof i!="object")return!1;let e=i;return!(e.v!==1||typeof e.id!="string"||!e.id.startsWith("sha256:")||typeof e.content!="string"||!e.meta||typeof e.meta!="object")}var d=class{#e;constructor(e){if(!b(e))throw new Error("Invalid TREF block");this.#e=e}get block(){return this.#e}get id(){return this.#e.id}get shortId(){return this.#e.id.replace("sha256:","").slice(0,8)}get content(){return this.#e.content}toJSON(e={}){return e.pretty?JSON.stringify(this.#e,null,2):JSON.stringify(this.#e)}getFilename(){return this.#e.id.replace("sha256:","")+u}toBlob(){return new Blob([this.toJSON()],{type:c})}toDataURL(){let e=this.toJSON(),t=btoa(unescape(encodeURIComponent(e)));return`data:${c};base64,${t}`}toObjectURL(){return URL.createObjectURL(this.toBlob())}async copyToClipboard(){await navigator.clipboard.writeText(this.toJSON())}async copyContentToClipboard(){await navigator.clipboard.writeText(this.#e.content)}getDragData(){let e=this.toJSON();return[{type:c,data:e},{type:"application/json",data:e},{type:"text/plain",data:e}]}setDragData(e){for(let{type:t,data:a}of this.getDragData())e.setData(t,a)}toHTML(e={}){let{interactive:t=!0}=e,n=t?`<div class="tref-actions" role="group" aria-label="Block actions">
          <button class="tref-action" data-action="copy-content" title="Copy content" aria-label="Copy content to clipboard"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
          <button class="tref-action" data-action="copy-json" title="Copy JSON" aria-label="Copy JSON to clipboard"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1"></path><path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1"></path><circle cx="12" cy="12" r="1" fill="currentColor"></circle><circle cx="8" cy="12" r="1" fill="currentColor"></circle><circle cx="16" cy="12" r="1" fill="currentColor"></circle></svg></button>
          <button class="tref-action" data-action="download" title="Download .tref" aria-label="Download as .tref file"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button>
        </div>`:"";return`<div class="tref-wrapper" data-tref-id="${this.#e.id}">
  <span class="tref-icon"
        role="button"
        aria-label="TREF block - drag to share"
        tabindex="0"
        draggable="true"
        title="Drag to share">${g}</span>
  ${n}
</div>`}#t(e){let t=e.querySelector(".tref-actions");if(t){let a=t,r=a.style.opacity==="1";if(a.style.opacity=r?"0":"1",!r){let o=a.querySelector("button");o&&o.focus()}}}attachEvents(e){let t=e.querySelector(".tref-icon");if(t){let r=t;r.addEventListener("dragstart",n=>{let s=n;s.dataTransfer&&(this.setDragData(s.dataTransfer),s.dataTransfer.effectAllowed="copy")}),r.addEventListener("keydown",n=>{(n.key==="Enter"||n.key===" ")&&(n.preventDefault(),this.#t(e))}),r.addEventListener("touchend",n=>{r.dataset.dragging||(n.preventDefault(),this.#t(e))});let o;r.addEventListener("touchstart",()=>{o=setTimeout(()=>{r.dataset.dragging="true",r.style.transform="scale(1.15)"},500)}),r.addEventListener("touchend",()=>{clearTimeout(o),delete r.dataset.dragging,r.style.transform=""}),r.addEventListener("touchcancel",()=>{clearTimeout(o),delete r.dataset.dragging,r.style.transform=""})}let a=async r=>{r.stopPropagation();let o=r.currentTarget,n=o.dataset.action,s=o.innerHTML,l='<svg class="tref-icon-success" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',v='<svg class="tref-icon-error" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';try{if(n==="copy-content")await this.copyContentToClipboard(),o.innerHTML=l;else if(n==="copy-json")await this.copyToClipboard(),o.innerHTML=l;else if(n==="download"){let p=this.toObjectURL(),f=document.createElement("a");f.href=p,f.download=this.getFilename(),f.click(),URL.revokeObjectURL(p),o.innerHTML=l}setTimeout(()=>{o.innerHTML=s},1e3)}catch{o.innerHTML=v,setTimeout(()=>{o.innerHTML=s},1e3)}};e.querySelectorAll(".tref-action").forEach(r=>{r.addEventListener("click",o=>{a(o)})})}static getStyles(){return`
:root {
  --tref-accent: #5CCCCC;
  --tref-accent-hover: #8B5CF6;
  --tref-success: #10B981;
  --tref-error: #ef4444;
  --tref-menu-bg: #ffffff;
  --tref-menu-text: #374151;
  --tref-menu-hover: #f3f4f6;
  --tref-menu-shadow: 0 4px 12px rgba(0,0,0,0.15);
  --tref-receiver-bg: #f9fafb;
  --tref-receiver-text: #6b7280;
  --tref-receiver-active-bg: #f3e8ff;
  --tref-receiver-success-bg: #ecfdf5;
  --tref-receiver-error-bg: #fef2f2;
  --tref-receiver-block-bg: #ffffff;
}
.dark {
  --tref-menu-bg: #1f2937;
  --tref-menu-text: #e5e7eb;
  --tref-menu-hover: #374151;
  --tref-menu-shadow: 0 4px 12px rgba(0,0,0,0.4);
  --tref-receiver-bg: #1f2937;
  --tref-receiver-text: #9ca3af;
  --tref-receiver-active-bg: #3b2d5e;
  --tref-receiver-success-bg: #064e3b;
  --tref-receiver-error-bg: #450a0a;
  --tref-receiver-block-bg: #111827;
}
.tref-wrapper {
  display: inline-block;
  position: relative;
}
.tref-icon {
  display: inline-flex;
  width: 32px;
  height: 32px;
  cursor: grab;
  transition: transform 0.15s;
}
.tref-icon:hover { transform: scale(1.1); }
.tref-icon:active { cursor: grabbing; }
.tref-icon svg { width: 100%; height: 100%; }
.tref-actions {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  background: var(--tref-menu-bg);
  border-radius: 6px;
  box-shadow: var(--tref-menu-shadow);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s, visibility 0.15s;
  z-index: 100;
  margin-top: 4px;
}
.tref-wrapper:hover .tref-actions {
  opacity: 1;
  visibility: visible;
}
.tref-action {
  background: transparent;
  border: none;
  outline: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--tref-menu-text);
  transition: background 0.15s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.tref-action svg {
  width: 16px;
  height: 16px;
}
.tref-action:hover { background: var(--tref-menu-hover); }
.tref-action:focus { outline: none; }
.tref-action:focus-visible {
  outline: 2px solid var(--tref-accent);
  outline-offset: 1px;
}
.tref-icon:focus { outline: none; }
.tref-icon:focus-visible {
  outline: 2px solid var(--tref-accent);
  outline-offset: 2px;
  border-radius: 4px;
}
.tref-icon-success { color: var(--tref-success); }
.tref-icon-error { color: var(--tref-error); }
`}},h=class{#e;#t;#r;#o;constructor(e,t={}){this.#e=e,this.#t=t.onReceive||(()=>{}),this.#r=t.onError||(()=>{}),this.#o=t.compact||!1,this.#i()}#i(){let e=this.#e;e.classList.add("tref-receiver"),this.#o&&e.classList.add("tref-receiver-compact"),e.setAttribute("role","region"),e.setAttribute("aria-label","Drop zone for TREF blocks"),e.setAttribute("aria-dropeffect","copy"),e.addEventListener("dragover",t=>{t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect="copy"),e.classList.add("tref-receiver-active")}),e.addEventListener("dragleave",()=>{e.classList.remove("tref-receiver-active")}),e.addEventListener("drop",t=>{if(t.preventDefault(),e.classList.remove("tref-receiver-active"),!t.dataTransfer){this.#r(new Error("No data"));return}let a=w(t.dataTransfer);a?(e.classList.add("tref-receiver-success"),setTimeout(()=>e.classList.remove("tref-receiver-success"),1e3),this.#t(a)):(e.classList.add("tref-receiver-error"),setTimeout(()=>e.classList.remove("tref-receiver-error"),1e3),this.#r(new Error("Invalid TREF data")))})}get element(){return this.#e}showBlock(e){this.#e.innerHTML=e.toHTML(),this.#e.classList.add("tref-receiver-has-block")}clear(){this.#e.innerHTML=this.#e.dataset.placeholder||"Drop TREF here",this.#e.classList.remove("tref-receiver-has-block")}static getStyles(){return`
.tref-receiver {
  border: 2px dashed var(--tref-accent);
  border-radius: 8px;
  padding: 20px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tref-receiver-text);
  background: var(--tref-receiver-bg);
  transition: all 0.2s;
}
.tref-receiver-active {
  border-color: var(--tref-accent-hover);
  background: var(--tref-receiver-active-bg);
  color: var(--tref-accent-hover);
}
.tref-receiver-success {
  border-color: var(--tref-success);
  background: var(--tref-receiver-success-bg);
}
.tref-receiver-error {
  border-color: var(--tref-error);
  background: var(--tref-receiver-error-bg);
}
.tref-receiver-has-block {
  border-style: solid;
  background: var(--tref-receiver-block-bg);
}
.tref-receiver-compact {
  width: 32px;
  height: 32px;
  min-height: 32px;
  padding: 0;
  border-radius: 4px;
}
/* Touch devices - larger hit areas */
@media (pointer: coarse) {
  .tref-icon {
    min-width: 44px;
    min-height: 44px;
  }
  .tref-action {
    min-width: 44px;
    min-height: 44px;
    padding: 10px;
  }
  .tref-receiver-compact {
    width: 48px;
    height: 48px;
    min-height: 48px;
  }
}
`}};function x(i){return new d(i)}function w(i){try{let e;if(typeof i=="string")e=i;else if(i&&typeof i.getData=="function")e=i.getData(c)||i.getData("application/json")||i.getData("text/plain");else return null;return e?x(JSON.parse(e)):null}catch{return null}}export{y as TREF_ICON_DATA_URL,g as TREF_ICON_SVG,c as TREF_MIME_TYPE,h as TrefReceiver,d as TrefWrapper,w as unwrap,x as wrap};
//# sourceMappingURL=tref-block.js.map
