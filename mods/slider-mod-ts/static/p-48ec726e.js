let e,t,n=!1;const l="undefined"!=typeof window?window:{},s=l.CSS,r=l.document||{head:{}},o={t:0,l:"",jmp:e=>e(),raf:e=>requestAnimationFrame(e),ael:(e,t,n,l)=>e.addEventListener(t,n,l),rel:(e,t,n,l)=>e.removeEventListener(t,n,l)},i=(()=>(r.head.attachShadow+"").indexOf("[native")>-1)(),c=e=>Promise.resolve(e),a=(()=>{try{return new CSSStyleSheet,!0}catch(e){}return!1})(),u=new WeakMap,f=e=>"sc-"+e,d={},p=e=>"object"==(e=typeof e)||"function"===e,m=(e,t,...n)=>{let l=null,s=!1,r=!1,o=[];const i=t=>{for(let n=0;n<t.length;n++)l=t[n],Array.isArray(l)?i(l):null!=l&&"boolean"!=typeof l&&((s="function"!=typeof e&&!p(l))&&(l+=""),s&&r?o[o.length-1].s+=l:o.push(s?$(null,l):l),r=s)};if(i(n),t){const e=t.className||t.class;e&&(t.class="object"!=typeof e?e:Object.keys(e).filter(t=>e[t]).join(" "))}const c=$(e,null);return c.o=t,o.length>0&&(c.u=o),c},$=(e,t)=>({t:0,p:e,s:t,$:null,u:null,o:null}),h={},w=(e,t,n,s,r,i)=>{if(n!==s){let a=V(e,t),u=t.toLowerCase();if("class"===t){const t=e.classList,l=b(n),r=b(s);t.remove(...l.filter(e=>e&&!r.includes(e))),t.add(...r.filter(e=>e&&!l.includes(e)))}else if("style"===t){for(const t in n)s&&null!=s[t]||(t.includes("-")?e.style.removeProperty(t):e.style[t]="");for(const t in s)n&&s[t]===n[t]||(t.includes("-")?e.style.setProperty(t,s[t]):e.style[t]=s[t])}else if("ref"===t)s&&s(e);else if(a||"o"!==t[0]||"n"!==t[1]){const l=p(s);if((a||l&&null!==s)&&!r)try{if(e.tagName.includes("-"))e[t]=s;else{let l=null==s?"":s;"list"===t?a=!1:null!=n&&e[t]==l||(e[t]=l)}}catch(c){}null==s||!1===s?e.removeAttribute(t):(!a||4&i||r)&&!l&&e.setAttribute(t,s=!0===s?"":s)}else t="-"===t[2]?t.slice(3):V(l,u)?u.slice(2):u[2]+t.slice(3),n&&o.rel(e,t,n,!1),s&&o.ael(e,t,s,!1)}},y=/\s/,b=e=>e?e.split(y):[],_=(e,t,n,l)=>{const s=11===t.$.nodeType&&t.$.host?t.$.host:t.$,r=e&&e.o||d,o=t.o||d;for(l in r)l in o||w(s,l,r[l],void 0,n,t.t);for(l in o)w(s,l,r[l],o[l],n,t.t)},g=(t,n,l)=>{let s,o,i=n.u[l],c=0;if(null!==i.s)s=i.$=r.createTextNode(i.s);else if(s=i.$=r.createElement(i.p),_(null,i,!1),null!=e&&s["s-si"]!==e&&s.classList.add(s["s-si"]=e),i.u)for(c=0;c<i.u.length;++c)o=g(t,i,c),o&&s.appendChild(o);return s},j=(e,n,l,s,r,o)=>{let i,c=e;for(c.shadowRoot&&c.tagName===t&&(c=c.shadowRoot);r<=o;++r)s[r]&&(i=g(null,l,r),i&&(s[r].$=i,c.insertBefore(i,n)))},v=(e,t,n,l,s)=>{for(;t<=n;++t)(l=e[t])&&(s=l.$,L(l),s.remove())},M=(e,t)=>e.p===t.p,S=(e,t)=>{const n=t.$=e.$,l=e.u,s=t.u,r=t.s;null===r?(_(e,t,!1),null!==l&&null!==s?((e,t,n,l)=>{let s,r=0,o=0,i=t.length-1,c=t[0],a=t[i],u=l.length-1,f=l[0],d=l[u];for(;r<=i&&o<=u;)null==c?c=t[++r]:null==a?a=t[--i]:null==f?f=l[++o]:null==d?d=l[--u]:M(c,f)?(S(c,f),c=t[++r],f=l[++o]):M(a,d)?(S(a,d),a=t[--i],d=l[--u]):M(c,d)?(S(c,d),e.insertBefore(c.$,a.$.nextSibling),c=t[++r],d=l[--u]):M(a,f)?(S(a,f),e.insertBefore(a.$,c.$),a=t[--i],f=l[++o]):(s=g(t&&t[o],n,o),f=l[++o],s&&c.$.parentNode.insertBefore(s,c.$));r>i?j(e,null==l[u+1]?null:l[u+1].$,n,l,o,u):o>u&&v(t,r,i)})(n,l,t,s):null!==s?(null!==e.s&&(n.textContent=""),j(n,null,t,s,0,s.length-1)):null!==l&&v(l,0,l.length-1)):e.s!==r&&(n.data=r)},L=e=>{e.o&&e.o.ref&&e.o.ref(null),e.u&&e.u.map(L)},R=(e,t,n)=>{const l=(e=>B(e).h)(e);return{emit:e=>U(l,t,{bubbles:!!(4&n),composed:!!(2&n),cancelable:!!(1&n),detail:e})}},U=(e,t,n)=>{const l=new CustomEvent(t,n);return e.dispatchEvent(l),l},k=(e,t)=>{t&&!e._&&t["s-p"].push(new Promise(t=>e._=t))},O=(e,t)=>{if(e.t|=16,4&e.t)return void(e.t|=512);const n=e.g,l=()=>C(e,n,t);return k(e,e.j),F(void 0,()=>te(l))},C=(n,l,s)=>{const o=n.h,c=o["s-rc"];s&&(e=>{const t=e.v,n=e.h,l=t.t,s=((e,t)=>{let n=f(t.M),l=J.get(n);if(e=11===e.nodeType?e:r,l)if("string"==typeof l){let t,s=u.get(e=e.head||e);s||u.set(e,s=new Set),s.has(n)||(t=r.createElement("style"),t.innerHTML=l,e.insertBefore(t,e.querySelector("link")),s&&s.add(n))}else e.adoptedStyleSheets.includes(l)||(e.adoptedStyleSheets=[...e.adoptedStyleSheets,l]);return n})(i&&n.shadowRoot?n.shadowRoot:n.getRootNode(),t);10&l&&(n["s-sc"]=s,n.classList.add(s+"-h"))})(n),((n,l)=>{const s=n.h,r=n.v,o=n.S||$(null,null),i=(e=>e&&e.p===h)(l)?l:m(null,null,l);t=s.tagName,r.L&&(i.o=i.o||{},r.L.map(([e,t])=>i.o[t]=s[e])),i.p=null,i.t|=4,n.S=i,i.$=o.$=s.shadowRoot||s,e=s["s-sc"],S(o,i)})(n,P(l)),n.t&=-17,n.t|=2,c&&(c.map(e=>e()),o["s-rc"]=void 0);{const e=o["s-p"],t=()=>x(n);0===e.length?t():(Promise.all(e).then(t),n.t|=4,e.length=0)}},P=e=>{try{e=e.render()}catch(t){z(t)}return e},x=e=>{const t=e.h,n=e.g,l=e.j;64&e.t||(e.t|=64,T(t),E(n,"componentDidLoad"),e.R(t),l||A()),e._&&(e._(),e._=void 0),512&e.t&&ee(()=>O(e,!1)),e.t&=-517},A=()=>{T(r.documentElement),ee(()=>U(l,"appload",{detail:{namespace:"range-slider"}}))},E=(e,t,n)=>{if(e&&e[t])try{return e[t](n)}catch(l){z(l)}},F=(e,t)=>e&&e.then?e.then(t):t(),T=e=>e.classList.add("hydrated"),H=(e,t,n)=>{if(t.U){const l=Object.entries(t.U),s=e.prototype;if(l.map(([e,[l]])=>{(31&l||2&n&&32&l)&&Object.defineProperty(s,e,{get(){return((e,t)=>B(this).k.get(t))(0,e)},set(n){((e,t,n,l)=>{const s=B(this),r=s.k.get(t),o=s.t,i=s.g;n=((e,t)=>null==e||p(e)?e:4&t?"false"!==e&&(""===e||!!e):2&t?parseFloat(e):1&t?e+"":e)(n,l.U[t][0]),8&o&&void 0!==r||n===r||(s.k.set(t,n),i&&2==(18&o)&&O(s,!1))})(0,e,n,t)},configurable:!0,enumerable:!0})}),1&n){const n=new Map;s.attributeChangedCallback=function(e,t,l){o.jmp(()=>{const t=n.get(e);this[t]=(null!==l||"boolean"!=typeof this[t])&&l})},e.observedAttributes=l.filter(([e,t])=>15&t[0]).map(([e,l])=>{const s=l[1]||e;return n.set(s,e),512&l[0]&&t.L.push([e,s]),s})}}return e},W=(e,t={})=>{const n=[],s=t.exclude||[],c=l.customElements,u=r.head,d=u.querySelector("meta[charset]"),p=r.createElement("style"),m=[];let $,h=!0;Object.assign(o,t),o.l=new URL(t.resourcesUrl||"./",r.baseURI).href,e.map(e=>e[1].map(t=>{const l={t:t[0],M:t[1],U:t[2],O:t[3]};l.U=t[2],l.L=[],!i&&1&l.t&&(l.t|=8);const r=l.M,u=class extends HTMLElement{constructor(e){super(e),N(e=this,l),1&l.t&&(i?e.attachShadow({mode:"open"}):"shadowRoot"in e||(e.shadowRoot=e))}connectedCallback(){$&&(clearTimeout($),$=null),h?m.push(this):o.jmp(()=>(e=>{if(0==(1&o.t)){const t=B(e),n=t.v,l=()=>{};if(!(1&t.t)){t.t|=1;{let n=e;for(;n=n.parentNode||n.host;)if(n["s-p"]){k(t,t.j=n);break}}n.U&&Object.entries(n.U).map(([t,[n]])=>{if(31&n&&e.hasOwnProperty(t)){const n=e[t];delete e[t],e[t]=n}}),(async(e,t,n,l,s)=>{if(0==(32&t.t)){t.t|=32;{if((s=I(n)).then){const e=()=>{};s=await s,e()}s.isProxied||(H(s,n,2),s.isProxied=!0);const e=()=>{};t.t|=8;try{new s(t)}catch(i){z(i)}t.t&=-9,e()}const e=f(n.M);if(!J.has(e)&&s.style){const t=()=>{};let l=s.style;8&n.t&&(l=await __sc_import_range_slider("./p-f5bab17b.js").then(t=>t.scopeCss(l,e,!1))),((e,t,n)=>{let l=J.get(e);a&&n?(l=l||new CSSStyleSheet,l.replace(t)):l=t,J.set(e,l)})(e,l,!!(1&n.t)),t()}}const r=t.j,o=()=>O(t,!0);r&&r["s-rc"]?r["s-rc"].push(o):o()})(0,t,n)}l()}})(this))}disconnectedCallback(){o.jmp(()=>{})}forceUpdate(){(()=>{{const e=B(this);e.h.isConnected&&2==(18&e.t)&&O(e,!1)}})()}componentOnReady(){return B(this).C}};l.P=e[0],s.includes(r)||c.get(r)||(n.push(r),c.define(r,H(u,l,1)))})),p.innerHTML=n+"{visibility:hidden}.hydrated{visibility:inherit}",p.setAttribute("data-styles",""),u.insertBefore(p,d?d.nextSibling:u.firstChild),h=!1,m.length?m.map(e=>e.connectedCallback()):o.jmp(()=>$=setTimeout(A,30))},q=new WeakMap,B=e=>q.get(e),D=(e,t)=>q.set(t.g=e,t),N=(e,t)=>{const n={t:0,h:e,v:t,k:new Map};return n.C=new Promise(e=>n.R=e),e["s-p"]=[],e["s-rc"]=[],q.set(e,n)},V=(e,t)=>t in e,z=e=>console.error(e),G=new Map,I=e=>{const t=e.M.replace(/-/g,"_"),n=e.P,l=G.get(n);return l?l[t]:__sc_import_range_slider(`./${n}.entry.js`).then(e=>(G.set(n,e),e[t]),z)},J=new Map,K=[],Q=[],X=(e,t)=>l=>{e.push(l),n||(n=!0,t&&4&o.t?ee(Z):o.raf(Z))},Y=e=>{for(let n=0;n<e.length;n++)try{e[n](performance.now())}catch(t){z(t)}e.length=0},Z=()=>{Y(K),Y(Q),(n=K.length>0)&&o.raf(Z)},ee=e=>c().then(e),te=X(Q,!0),ne=()=>s&&s.supports&&s.supports("color","var(--c)")?c():__sc_import_range_slider("./p-69b85284.js").then(()=>(o.A=l.__cssshim)?(!1).i():0),le=()=>{o.A=l.__cssshim;const e=Array.from(r.querySelectorAll("script")).find(e=>/\/range-slider(\.esm)?\.js($|\?|#)/.test(e.src)||"range-slider"===e.getAttribute("data-stencil-namespace")),t=e["data-opts"]||{};return"onbeforeload"in e&&!history.scrollRestoration?{then(){}}:(t.resourcesUrl=new URL(".",new URL(e.getAttribute("data-resources-url")||e.src,l.location.href)).href,se(t.resourcesUrl,e),l.customElements?c(t):__sc_import_range_slider("./p-2347dcb6.js").then(()=>t))},se=(e,t)=>{try{l.__sc_import_range_slider=Function("w",`return import(w);//${Math.random()}`)}catch(n){const s=new Map;l.__sc_import_range_slider=n=>{const o=new URL(n,e).href;let i=s.get(o);if(!i){const e=r.createElement("script");e.type="module",e.crossOrigin=t.crossOrigin,e.src=URL.createObjectURL(new Blob([`import * as m from '${o}'; window.__sc_import_range_slider.m = m;`],{type:"application/javascript"})),i=new Promise(t=>{e.onload=()=>{t(l.__sc_import_range_slider.m),e.remove()}}),s.set(o,i),r.head.appendChild(e)}return i}}};export{h as H,ne as a,W as b,R as c,m as h,le as p,D as r}