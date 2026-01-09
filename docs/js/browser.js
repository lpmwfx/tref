var E=".tref",h="application/vnd.tref+json",g=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="24" height="24">
  <rect x="6" y="6" width="88" height="88" rx="12" ry="12" fill="#2D1B4E" stroke="#5CCCCC" stroke-width="5"/>
  <g transform="translate(50 50) scale(0.022) translate(-1125 -1125)">
    <g transform="translate(0,2250) scale(1,-1)" fill="#5CCCCC">
      <path d="M1515 2244 c-66 -10 -144 -38 -220 -77 -67 -35 -106 -67 -237 -195 -155 -152 -188 -195 -188 -247 0 -41 30 -95 64 -116 39 -24 113 -25 146 -3 14 9 90 81 170 160 183 181 216 199 350 199 83 0 103 -4 155 -28 78 -36 146 -104 182 -181 24 -53 28 -73 28 -151 0 -137 -21 -175 -199 -355 -79 -80 -151 -156 -160 -170 -39 -59 -8 -162 58 -194 81 -38 113 -22 284 147 165 163 230 252 268 370 24 71 28 99 28 202 0 106 -3 130 -28 200 -91 261 -310 428 -579 439 -50 3 -105 2 -122 0z"/>
      <path d="M1395 1585 c-17 -9 -189 -174 -382 -368 -377 -378 -383 -385 -362 -461 21 -76 87 -116 166 -101 33 6 80 49 386 353 191 191 358 362 369 381 26 42 28 109 4 146 -39 59 -118 81 -181 50z"/>
      <path d="M463 1364 c-47 -24 -323 -310 -365 -379 -20 -33 -49 -96 -64 -140 -24 -69 -28 -96 -28 -195 0 -127 14 -190 66 -294 63 -126 157 -220 284 -284 104 -52 167 -66 294 -66 99 0 126 4 195 28 44 15 107 44 140 64 65 39 348 309 371 354 41 78 -10 184 -96 203 -61 13 -98 -11 -256 -166 -186 -183 -222 -204 -359 -204 -77 0 -98 4 -147 27 -79 37 -142 98 -181 177 -29 59 -32 74 -32 156 0 136 21 174 199 355 79 80 150 156 159 170 23 33 22 107 -2 146 -35 57 -115 79 -178 48z"/>
    </g>
  </g>
</svg>`,k=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="24" height="24">
  <rect x="6" y="6" width="88" height="88" rx="12" ry="12" fill="#2D1B4E" stroke="#ef4444" stroke-width="5"/>
  <g transform="translate(50 50) scale(0.022) translate(-1125 -1125)">
    <g transform="translate(0,2250) scale(1,-1)" fill="#6b7280">
      <path d="M1515 2244 c-66 -10 -144 -38 -220 -77 -67 -35 -106 -67 -237 -195 -155 -152 -188 -195 -188 -247 0 -41 30 -95 64 -116 39 -24 113 -25 146 -3 14 9 90 81 170 160 183 181 216 199 350 199 83 0 103 -4 155 -28 78 -36 146 -104 182 -181 24 -53 28 -73 28 -151 0 -137 -21 -175 -199 -355 -79 -80 -151 -156 -160 -170 -39 -59 -8 -162 58 -194 81 -38 113 -22 284 147 165 163 230 252 268 370 24 71 28 99 28 202 0 106 -3 130 -28 200 -91 261 -310 428 -579 439 -50 3 -105 2 -122 0z"/>
      <path d="M1395 1585 c-17 -9 -189 -174 -382 -368 -377 -378 -383 -385 -362 -461 21 -76 87 -116 166 -101 33 6 80 49 386 353 191 191 358 362 369 381 26 42 28 109 4 146 -39 59 -118 81 -181 50z"/>
      <path d="M463 1364 c-47 -24 -323 -310 -365 -379 -20 -33 -49 -96 -64 -140 -24 -69 -28 -96 -28 -195 0 -127 14 -190 66 -294 63 -126 157 -220 284 -284 104 -52 167 -66 294 -66 99 0 126 4 195 28 44 15 107 44 140 64 65 39 348 309 371 354 41 78 -10 184 -96 203 -61 13 -98 -11 -256 -166 -186 -183 -222 -204 -359 -204 -77 0 -98 4 -147 27 -79 37 -142 98 -181 177 -29 59 -32 74 -32 156 0 136 21 174 199 355 79 80 150 156 159 170 23 33 22 107 -2 146 -35 57 -115 79 -178 48z"/>
    </g>
  </g>
  <line x1="25" y1="25" x2="75" y2="75" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/>
  <line x1="75" y1="25" x2="25" y2="75" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/>
</svg>`,w="data:image/svg+xml,"+encodeURIComponent(g);function C(i){if(!i||typeof i!="object")return!1;let e=i;return!(e.v!==1||typeof e.id!="string"||!e.id.startsWith("sha256:")||typeof e.content!="string"||!e.meta||typeof e.meta!="object")}var b=`
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
`;var f=class{#e;constructor(e){if(!C(e))throw new Error("Invalid TREF block");this.#e=e}get block(){return this.#e}get id(){return this.#e.id}get shortId(){return this.#e.id.replace("sha256:","").slice(0,8)}get content(){return this.#e.content}toJSON(e={}){return e.pretty?JSON.stringify(this.#e,null,2):JSON.stringify(this.#e)}getFilename(){return this.#e.id.replace("sha256:","")+E}toBlob(){return new Blob([this.toJSON()],{type:h})}toDataURL(){let e=this.toJSON(),t=btoa(unescape(encodeURIComponent(e)));return`data:${h};base64,${t}`}toObjectURL(){return URL.createObjectURL(this.toBlob())}async copyToClipboard(){await navigator.clipboard.writeText(this.toJSON())}async copyContentToClipboard(){await navigator.clipboard.writeText(this.#e.content)}async validate(){let e=this.#e.content,o=new TextEncoder().encode(e),s=await crypto.subtle.digest("SHA-256",o),r=`sha256:${Array.from(new Uint8Array(s)).map(n=>n.toString(16).padStart(2,"0")).join("")}`,a=this.#e.id;return r===a?{valid:!0}:{valid:!1,expected:r,actual:a}}getDragData(){let e=this.toJSON();return[{type:h,data:e},{type:"application/json",data:e},{type:"text/plain",data:e}]}setDragData(e){for(let{type:t,data:o}of this.getDragData())e.setData(t,o)}toHTML(e={}){let{interactive:t=!0}=e,r=t?`<div class="tref-actions" role="group" aria-label="Block actions">
          <button class="tref-action" data-action="copy-content" title="Copy content" aria-label="Copy content to clipboard"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
          <button class="tref-action" data-action="copy-json" title="Copy JSON" aria-label="Copy JSON to clipboard"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1"></path><path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1"></path><circle cx="12" cy="12" r="1" fill="currentColor"></circle><circle cx="8" cy="12" r="1" fill="currentColor"></circle><circle cx="16" cy="12" r="1" fill="currentColor"></circle></svg></button>
          <button class="tref-action" data-action="download" title="Download .tref" aria-label="Download as .tref file"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button>
          <button class="tref-action" data-action="history" title="Version history" aria-label="Show version history"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg></button>
        </div>`:"";return`<div class="tref-wrapper" data-tref-id="${this.#e.id}">
  <span class="tref-icon"
        role="button"
        aria-label="TREF block - drag to share"
        tabindex="0"
        draggable="true"
        title="Drag to share">${g}</span>
  ${r}
</div>`}#r(e){let t=e.querySelector(".tref-icon");t&&(t.innerHTML=k,t.setAttribute("title","Invalid - content has been modified"),t.setAttribute("aria-label","Invalid TREF block - content has been modified"));let o=e.querySelector(".tref-actions");if(o){let s=document.createElement("span");s.className="tref-warning",s.textContent="Modified content",s.setAttribute("title","SHA-256 hash does not match - content was changed"),o.insertBefore(s,o.firstChild)}e.classList.add("tref-invalid")}#t(e){let t=e.querySelector(".tref-actions");if(t){let o=t.classList.contains("tref-actions-visible");if(t.classList.toggle("tref-actions-visible",!o),!o){let s=t.querySelector("button");s&&s.focus()}}}#o(e){let t=e.querySelector(".tref-copied-popup");t&&t.remove();let o=document.createElement("div");o.className="tref-copied-popup",o.textContent="Copied \u2713",o.setAttribute("role","status"),o.setAttribute("aria-live","polite"),e.appendChild(o),setTimeout(()=>{o.remove()},1500)}async#i(e,t){let o=document.querySelector(".tref-history-popup");o&&o.remove();let s=await fetch(e);if(!s.ok)throw new Error("Failed to load history");let v=(await s.json()).versions||[],r=this.#e.id,a=v.map(d=>{let y=d.id===r,I=d.id.replace("sha256:","").slice(0,8);return`<li class="tref-history-item${y?" tref-history-current":""}">
          <span class="tref-history-version">v${d.v}</span>
          <span class="tref-history-date">${d.date}</span>
          <code class="tref-history-id">${I}</code>
          ${y?'<span class="tref-history-badge">current</span>':""}
        </li>`}).join(""),n=document.createElement("div");n.className="tref-history-popup",n.innerHTML=`
      <div class="tref-history-header">
        <span>Version History</span>
        <button class="tref-history-close" aria-label="Close">&times;</button>
      </div>
      <ul class="tref-history-list">${a}</ul>
    `;let c=t.getBoundingClientRect();n.style.position="fixed",n.style.top=`${c.bottom+8}px`,n.style.left=`${c.left}px`,document.body.appendChild(n),n.querySelector(".tref-history-close")?.addEventListener("click",()=>{n.remove()});let l=d=>{n.contains(d.target)||(n.remove(),document.removeEventListener("click",l))};setTimeout(()=>document.addEventListener("click",l),0);let x=d=>{d.key==="Escape"&&(n.remove(),document.removeEventListener("keydown",x))};document.addEventListener("keydown",x)}attachEvents(e,t={}){let{validateOnAttach:o=!0}=t,s=e.querySelector(".tref-icon");if(o&&this.validate().then(r=>{r.valid||this.#r(e)}),s){let r=s;r.addEventListener("dragstart",c=>{let l=c;l.dataTransfer&&(this.setDragData(l.dataTransfer),l.dataTransfer.effectAllowed="copy")}),r.addEventListener("keydown",c=>{(c.key==="Enter"||c.key===" ")&&(c.preventDefault(),this.#t(e))});let a,n=!1;r.addEventListener("touchstart",()=>{n=!1,a=setTimeout(()=>{n=!0,r.classList.add("touch-selected"),this.copyToClipboard().then(()=>{this.#o(e)}).catch(()=>{}),setTimeout(()=>{r.classList.remove("touch-selected")},300)},300)}),r.addEventListener("touchend",c=>{clearTimeout(a),n||(c.preventDefault(),this.#t(e)),n=!1}),r.addEventListener("touchcancel",()=>{clearTimeout(a),r.classList.remove("touch-selected"),n=!1})}let p=e.querySelector(".tref-actions");if(p){let r=p;e.addEventListener("mouseenter",()=>{r.style.left="50%",r.style.right="auto",r.style.transform="translateX(-50%)",r.style.top="100%",r.style.bottom="auto",requestAnimationFrame(()=>{let a=r.getBoundingClientRect(),n=window.innerWidth,c=window.innerHeight,l=8;a.left<l?(r.style.left="0",r.style.transform="none"):a.right>n-l&&(r.style.left="auto",r.style.right="0",r.style.transform="none"),a.bottom>c-l&&(r.style.top="auto",r.style.bottom="100%",r.style.marginTop="0",r.style.marginBottom="4px")})})}let v=async r=>{r.stopPropagation();let a=r.currentTarget,n=a.dataset.action,c=a.innerHTML,l='<svg class="tref-icon-success" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',x='<svg class="tref-icon-error" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';try{if(n==="copy-content")await this.copyContentToClipboard(),a.innerHTML=l;else if(n==="copy-json")await this.copyToClipboard(),a.innerHTML=l;else if(n==="download"){let d=this.toObjectURL(),y=document.createElement("a");y.href=d,y.download=this.getFilename(),y.click(),URL.revokeObjectURL(d),a.innerHTML=l}else if(n==="history"){let d=e.dataset.history;if(d)await this.#i(d,e);else throw new Error("No history URL");return}setTimeout(()=>{a.innerHTML=c},1e3)}catch{a.innerHTML=x,setTimeout(()=>{a.innerHTML=c},1e3)}};e.querySelectorAll(".tref-action").forEach(r=>{r.addEventListener("click",a=>{v(a)})})}static getStyles(){return`${b}
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
.tref-wrapper:hover .tref-actions,
.tref-actions.tref-actions-visible {
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
/* Invalid block warning */
.tref-invalid .tref-icon { opacity: 0.8; }
.tref-warning {
  font-size: 11px;
  color: var(--tref-error);
  padding: 4px 8px;
  background: var(--tref-receiver-error-bg);
  border-radius: 4px;
  white-space: nowrap;
}
/* History popup */
.tref-history-popup {
  background: var(--tref-menu-bg);
  border-radius: 8px;
  box-shadow: var(--tref-menu-shadow);
  min-width: 220px;
  max-width: 300px;
  z-index: 1000;
  font-family: system-ui, sans-serif;
  font-size: 13px;
}
.tref-history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid var(--tref-menu-hover);
  font-weight: 600;
  color: var(--tref-menu-text);
}
.tref-history-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--tref-menu-text);
  padding: 0 4px;
  line-height: 1;
}
.tref-history-close:hover { color: var(--tref-error); }
.tref-history-list {
  list-style: none;
  margin: 0;
  padding: 8px 0;
}
.tref-history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  color: var(--tref-menu-text);
}
.tref-history-item:hover {
  background: var(--tref-menu-hover);
}
.tref-history-current {
  background: var(--tref-receiver-active-bg);
}
.tref-history-version {
  font-weight: 600;
  color: var(--tref-accent);
}
.tref-history-date {
  color: var(--tref-receiver-text);
}
.tref-history-id {
  font-family: monospace;
  font-size: 11px;
  background: var(--tref-menu-hover);
  padding: 2px 4px;
  border-radius: 3px;
}
.tref-history-badge {
  font-size: 10px;
  background: var(--tref-accent);
  color: #fff;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: auto;
}
/* Touch selection state */
.tref-icon.touch-selected {
  box-shadow: 0 0 0 3px var(--tref-accent);
  transform: scale(1.1);
  border-radius: 6px;
}
/* Copied popup */
.tref-copied-popup {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--tref-success);
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  animation: tref-fade-out 1.5s ease-out forwards;
  z-index: 1000;
}
@keyframes tref-fade-out {
  0%, 70% { opacity: 1; }
  100% { opacity: 0; }
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
}
`}};function T(i){return new f(i)}var u=class{#e;#r;#t;#o;constructor(e,t={}){this.#e=e,this.#r=t.onReceive||(()=>{}),this.#t=t.onError||(()=>{}),this.#o=t.compact||!1,this.#i()}#i(){let e=this.#e;e.classList.add("tref-receiver"),this.#o&&e.classList.add("tref-receiver-compact"),e.setAttribute("role","region"),e.setAttribute("aria-label","Drop zone for TREF blocks"),e.setAttribute("aria-dropeffect","copy"),e.addEventListener("dragover",t=>{t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect="copy"),e.classList.add("tref-receiver-active")}),e.addEventListener("dragleave",()=>{e.classList.remove("tref-receiver-active")}),e.addEventListener("drop",t=>{if(t.preventDefault(),e.classList.remove("tref-receiver-active"),!t.dataTransfer){this.#t(new Error("No data"));return}let o=m(t.dataTransfer);o?(e.classList.add("tref-receiver-success"),setTimeout(()=>e.classList.remove("tref-receiver-success"),1e3),this.#r(o)):(e.classList.add("tref-receiver-error"),setTimeout(()=>e.classList.remove("tref-receiver-error"),1e3),this.#t(new Error("Invalid TREF data")))}),this.#n()}#n(){let e=this.#e;if(!window.matchMedia("(pointer: coarse)").matches)return;let o=!1,s;e.addEventListener("click",()=>{o?(clearTimeout(s),navigator.clipboard.readText().then(p=>{let v=m(p);if(v)this.#r(v),e.classList.remove("touch-ready"),e.classList.add("tref-receiver-success"),setTimeout(()=>{e.classList.remove("tref-receiver-success")},1e3);else throw new Error("Invalid TREF data in clipboard")}).catch(p=>{this.#t(p instanceof Error?p:new Error("Clipboard read failed")),e.classList.remove("touch-ready"),e.classList.add("tref-receiver-error"),setTimeout(()=>{e.classList.remove("tref-receiver-error")},1e3)}).finally(()=>{o=!1})):(o=!0,e.classList.add("touch-ready"),s=setTimeout(()=>{o=!1,e.classList.remove("touch-ready")},3e3))})}get element(){return this.#e}showBlock(e){this.#e.innerHTML=e.toHTML(),this.#e.classList.add("tref-receiver-has-block")}clear(){this.#e.innerHTML=this.#e.dataset.placeholder||"Drop TREF here",this.#e.classList.remove("tref-receiver-has-block")}static getStyles(){return`${b}
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
  position: relative;
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
/* Touch ready state */
.tref-receiver.touch-ready {
  border-color: var(--tref-accent);
  background: rgba(92, 204, 204, 0.15);
  border-style: solid;
}
.tref-receiver.touch-ready::after {
  content: "Tap to paste";
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--tref-accent);
  color: #2D1B4E;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  animation: tref-pulse 1s ease-in-out infinite;
}
@keyframes tref-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
/* Touch devices - larger hit areas */
@media (pointer: coarse) {
  .tref-receiver-compact {
    width: 48px;
    height: 48px;
    min-height: 48px;
  }
  .tref-receiver {
    min-height: 60px;
  }
}
`}};function m(i){try{let e;if(typeof i=="string")e=i;else if(i&&typeof i.getData=="function")e=i.getData(h)||i.getData("application/json")||i.getData("text/plain");else return null;if(!e)return null;let t=JSON.parse(e);return new f(t)}catch{return null}}var L=!1;function A(){return f.getStyles()+`
`+u.getStyles()}function D(){if(L||typeof document>"u")return;if(document.getElementById("tref-auto-styles")){L=!0;return}let i=document.createElement("style");i.id="tref-auto-styles",i.textContent=A(),document.head.appendChild(i),L=!0}D();async function H(i){let e=new TextEncoder,t=await crypto.subtle.digest("SHA-256",e.encode(i));return Array.from(new Uint8Array(t)).map(o=>o.toString(16).padStart(2,"0")).join("")}async function S(i){return`sha256:${await H(i)}`}function R(i,e={}){let t={v:1,content:i,meta:{created:new Date().toISOString(),license:e.license||"CC-BY-4.0"}};return e.author&&(t.meta.author=e.author),e.refs&&e.refs.length>0&&(t.refs=e.refs),e.parent&&(t.parent=e.parent),t}async function _(i,e={}){let t=R(i,e),o=await S(i);return{...t,id:o}}async function M(i,e,t={}){return _(e,{...t,license:t.license||i.meta.license,parent:i.id})}async function N(i){let e=await S(i.content);return i.id===e}function F(){return f.getStyles()+u.getStyles()}typeof window<"u"&&(window.TREF={TrefWrapper:f,TrefReceiver:u,publish:_,derive:M,validate:N,createDraft:R,wrap:T,unwrap:m,getStyles:F,TREF_ICON_SVG:g,TREF_ICON_DATA_URL:w,TREF_MIME_TYPE:h});export{w as TREF_ICON_DATA_URL,g as TREF_ICON_SVG,h as TREF_MIME_TYPE,u as TrefReceiver,f as TrefWrapper,R as createDraft,M as derive,F as getStyles,_ as publish,m as unwrap,N as validate,T as wrap};
//# sourceMappingURL=tref-block.js.map
