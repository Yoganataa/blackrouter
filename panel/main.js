(()=>{var B="openchamber.sdk",H=1;var cr=`
:root {
  --oc-scrollbar-thumb: color-mix(in srgb, var(--oc-muted, currentColor) 40%, transparent);
  --oc-scrollbar-thumb-hover: color-mix(in srgb, var(--oc-muted, currentColor) 65%, transparent);
  scrollbar-gutter: stable;
}
* {
  scrollbar-width: thin;
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  * { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  :root::-webkit-scrollbar, body::-webkit-scrollbar { background: var(--oc-bg, inherit); }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: var(--oc-scrollbar-thumb);
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  * { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;var dr=128,lr=65536;var on=["file","directory","other","missing"],ur=(e)=>Boolean(e&&"sessionId"in e),fr=(e)=>Boolean(e&&"sent"in e&&!("sessionId"in e));var $t=500,Lt=32000,sn=16000,an=128,cn=200,dn=2000,ln=16000,pn=80,un=200,fn=16000;var mn=2000;var mr=20000,Ut=1024,Gt=2000000;var Dt=64000,jt=8000,hr=4000;var gr=90000;var hn=999,zt=500,gn=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED"],yn=["stopped","starting","ready","failed"],no=new Set(gn),bn=(e)=>no.has(e),xn=(e)=>e&&bn(e)?e:"HOST_REJECTED",Qe=(e)=>{if(e===void 0)return!1;if(e===null||e===!0||e===!1)return!0;if(String(e)===e)return!0;if(Number(e)===e)return Number.isFinite(e);if(Array.isArray(e))return e.every(Qe);if(Object(e)===e)return Object.values(e).every(Qe);return!1},vn=(e)=>Qe(e)&&JSON.stringify(e).length<=fn,nn=(e)=>e?.trim().slice(0,un)??"",Ze=(e)=>{let t=e.id.trim().slice(0,an),r=e.title.trim().slice(0,cn),n=e.url.trim().slice(0,dn),o=e.text?.trim().slice(0,ln),s=e.author?.trim().slice(0,pn),a=e.kind==="pull"?"pull":"issue",c={providerId:e.providerId.trim(),id:t,title:r||t,url:n,kind:a};if(o)c.text=o;if(s)c.author=s;if(a==="pull"){let d=nn(e.branches?.head),u=nn(e.branches?.base);if(d&&u)c.branches={head:d,base:u}}if(vn(e.data))c.data=e.data;return c},yr=(e)=>{let t=Ze(e);if(e.projectId)t.projectId=e.projectId;if(e.navigation)t.navigation=e.navigation;if(e.worktree)t.worktree=e.worktree;return t},br=(e)=>{let t={text:e.text.trim().slice(0,sn)};if(e.send)t.send=!0;return t},xr=(e)=>{if(e===null||!Number.isFinite(e))return null;return Math.min(hn,Math.max(0,Math.round(e)))};var et=(e)=>e.length>0&&e.length<=Ut&&!e.includes("\x00")&&!e.includes("\\");var Bt=(e)=>{if(!e.startsWith("/")||e.includes("\x00")||e.includes("\\")||e.includes("://"))return!1;if(e.length>mn)return!1;return!e.split("/").some((r)=>r==="."||r==="..")},oo=new Set(yn),vr=(e)=>Boolean(e&&"status"in e&&oo.has(String(e.status))&&!("body"in e)),Ht=(e)=>Boolean(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),_r=(e)=>Boolean(e&&"content"in e&&String(e.content)===e.content),kr=(e)=>Boolean(e&&"written"in e&&e.written===!0),Sr=(e)=>Boolean(e&&"entries"in e&&Array.isArray(e.entries)),so=new Set(on),Tr=(e)=>Boolean(e&&"kind"in e&&"size"in e&&so.has(String(e.kind))&&Number.isFinite(e.size)),wr=(e)=>Boolean(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),ao=new Set(["workspace","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action"]),io=(e)=>Object(e)===e?e:null,pr=(e)=>String(e)===e&&e.length>0,co=(e)=>{if(!pr(e.id))return null;if(e.ok===!0){let t={channel:B,v:H,type:"result",id:e.id,ok:!0};if(Object(e.payload)===e.payload)t.payload=e.payload;return t}if(e.ok===!1&&pr(e.error))return{channel:B,v:H,type:"result",id:e.id,ok:!1,error:e.error,code:xn(pr(e.code)?e.code:void 0)};return null},Er=(e)=>{let t=io(e);if(!t||t.channel!==B||t.v!==H)return null;if(t.type==="result")return co(t);if(!ao.has(String(t.type))||Object(t.payload)!==t.payload)return null;return t};class M extends Error{code;constructor(e,t){super(t);this.name="HostRequestError",this.code=e}}var _n=()=>Promise.reject(new M("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),Vt=()=>Promise.reject(new M("BAD_PATH",`File path must be 1 to ${Ut} characters without NUL or backslash.`)),X=(e)=>(e.value+=1,`oc-${e.value}`),Ar=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new M("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let r=e.acceptSource??((i)=>i===t.parent),n=e.requestTimeoutMs??mr,o=new Set,s=new Set,a=new Set,c=new Set,d=new Set,u=new Set,b=new Set,Y=null,j=null,K=new Map,k=new Map,E=!1,x={value:0},w=null,z=null,pe=(i)=>{if(!i)return null;return{sessionId:i.id,phase:i.busy?"started":"completed"}},me=(i)=>{t.parent.postMessage(i,"*")},W=(i,l)=>{for(let A of i)try{A(l)}catch(I){console.error(I)}},_e=(i)=>{if(!(i instanceof MessageEvent))return;if(!r(i.source))return;let l=Er(i.data);if(!l)return;if(l.type==="workspace"){let I=k.get(l.payload.subscriptionId);if(I)W([I],l.payload.snapshot);return}if(l.type==="ready"){if(w=l.payload,z=pe(l.payload.session),W(o,l.payload),W(s,l.payload.directory),W(a,l.payload.session),z)W(c,z);W(d,l.payload.connection),W(u,l.payload.settings),W(b,l.payload.item);return}if(l.type==="directory"){if(w)w={...w,directory:l.payload.directory};W(s,l.payload.directory);return}if(l.type==="session"){if(w)w={...w,session:l.payload.session};if(!l.payload.session)z=null;else if(z?.sessionId!==l.payload.session.id)z=pe(l.payload.session);W(a,l.payload.session);return}if(l.type==="session-lifecycle"){z=l.payload,W(c,l.payload);return}if(l.type==="connection"){if(w)w={...w,connection:l.payload.connection};W(d,l.payload.connection);return}if(l.type==="settings"){if(w)w={...w,settings:l.payload.settings};W(u,l.payload.settings);return}if(l.type==="item"){if(w)w={...w,item:l.payload.item};W(b,l.payload.item);return}if(l.type==="action"){let I=(N)=>{if(!E)me({channel:B,v:H,type:"action-result",id:l.id,payload:N})},V=j;if(!V){I({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>V(l.payload)).then(()=>I({ok:!0}),(N)=>{let ie=(N instanceof Error?N.message:String(N)).trim();I({ok:!1,error:(ie||"Action failed.").slice(0,zt)})});return}if(l.type==="resolve"){let I=(N)=>{me({channel:B,v:H,type:"resolve-result",id:l.id,payload:N})},V=Y;if(!V){I({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>V(l.payload)).then((N)=>I({item:N?Ze(N):null}),(N)=>{let ie=(N instanceof Error?N.message:String(N)).trim();I({error:(ie||"Command failed.").slice(0,zt)})});return}let A=K.get(l.id);if(!A)return;if(clearTimeout(A.timer),K.delete(l.id),l.ok){A.resolve(l.payload);return}A.reject(new M(l.code,l.error))};t.addEventListener("message",_e),me({channel:B,v:H,type:"hello"});let q=(i,l=n)=>{if(E||t.parent===t)return Promise.reject(new M("HOST_UNAVAILABLE","No host frame. This page is not in an iframe."));return new Promise((A,I)=>{let V=setTimeout(()=>{K.delete(i.id),I(new M("HOST_TIMEOUT","Host did not answer in time."))},l);K.set(i.id,{resolve:A,reject:I,timer:V}),me(i)})},P=(i)=>q(i).then(()=>{return}),m={channel:B,v:H},v=(i,l=1024)=>{if(!i.trim()||i.length>l)throw new M("HOST_REJECTED",`Identity must contain 1 to ${l} characters.`)},se=async(i)=>{if(i.kind!=="projects")v(i.projectId);let l=await q({...m,type:"workspace-read",id:X(x),payload:i});if(!l||!("kind"in l)||!("state"in l)||l.kind!==i.kind)throw new M("HOST_REJECTED","Host did not return workspace data.");return l},ue=async(i,l)=>{if(i.kind!=="projects")v(i.projectId);let A=X(x);k.set(A,l);try{await P({...m,type:"workspace-subscribe",id:X(x),payload:{subscriptionId:A,query:i}})}catch(I){if(k.delete(A),!E)me({...m,type:"workspace-unsubscribe",id:X(x),payload:{subscriptionId:A}});throw I}return()=>{if(!k.delete(A)||E)return;me({...m,type:"workspace-unsubscribe",id:X(x),payload:{subscriptionId:A}})}},ae=async(i)=>{if("key"in i&&(i.key.length===0||i.key.length>dr))throw new M("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(i.op==="set"&&!Qe(i.value))throw new M("HOST_REJECTED","Storage values must be JSON.");if(i.op==="set"&&new TextEncoder().encode(JSON.stringify(i.value)).length>lr)throw new M("HOST_REJECTED","Storage value exceeds 64 KiB.");let l=await q({...m,type:"storage",id:X(x),payload:i});if(!l||!("storage"in l)||l.op!==i.op)throw new M("HOST_REJECTED","Host did not return storage data.");return l};return{onAction:(i)=>(j=i,()=>{if(j===i)j=null}),listProjects:async()=>{let i=await se({kind:"projects"});if(i.kind!=="projects")throw new M("HOST_REJECTED","Expected projects.");return i},listWorktrees:async(i)=>{let l=await se({kind:"worktrees",projectId:i});if(l.kind!=="worktrees")throw new M("HOST_REJECTED","Expected worktrees.");return l},listSessions:async(i)=>{let l=await se({kind:"sessions",projectId:i});if(l.kind!=="sessions")throw new M("HOST_REJECTED","Expected sessions.");return l},onProjects:(i)=>ue({kind:"projects"},(l)=>{if(l.kind==="projects")i(l)}),onWorktrees:(i,l)=>ue({kind:"worktrees",projectId:i},(A)=>{if(A.kind==="worktrees")l(A)}),onSessions:(i,l)=>ue({kind:"sessions",projectId:i},(A)=>{if(A.kind==="sessions")l(A)}),openSession:async(i)=>{v(i),await P({...m,type:"open-session",id:X(x),payload:{sessionId:i}})},storage:{get:async(i)=>{let l=await ae({op:"get",key:i});return l.op==="get"&&l.found?l.value:void 0},set:async(i,l)=>{await ae({op:"set",key:i,value:l})},delete:async(i)=>{await ae({op:"delete",key:i})},keys:async()=>{let i=await ae({op:"keys"});if(i.op!=="keys")throw new M("HOST_REJECTED","Expected storage keys.");return i.keys}},onReady:(i)=>{if(o.add(i),w)i(w);return()=>{o.delete(i)}},onDirectory:(i)=>{if(s.add(i),w)i(w.directory);return()=>{s.delete(i)}},onSession:(i)=>{if(a.add(i),w)i(w.session);return()=>{a.delete(i)}},onSessionLifecycle:(i)=>{if(c.add(i),z)i(z);return()=>{c.delete(i)}},onConnection:(i)=>{if(d.add(i),w)i(w.connection);return()=>{d.delete(i)}},onSettings:(i)=>{if(u.add(i),w)i(w.settings);return()=>{u.delete(i)}},onItem:(i)=>{if(b.add(i),w)i(w.item);return()=>{b.delete(i)}},onResolve:(i)=>(Y=i,()=>{if(Y===i)Y=null}),toast:(i)=>{let l=i.message.trim();if(!l||l.length>$t)return Promise.reject(new M("HOST_REJECTED",`Toast message must contain 1 to ${$t} characters.`));if(i.copy&&i.copy!==!0&&(!i.copy.text.length||i.copy.text.length>Lt))return Promise.reject(new M("HOST_REJECTED",`Toast copy text must contain 1 to ${Lt} characters.`));return P({channel:B,v:H,type:"toast",id:X(x),payload:{...i,message:l}})},openUrl:(i)=>P({channel:B,v:H,type:"open-url",id:X(x),payload:{url:i}}),openSurface:(i)=>P({channel:B,v:H,type:"open-surface",id:X(x),payload:{surfaceId:i}}),writeClipboard:(i)=>P({channel:B,v:H,type:"clipboard-write",id:X(x),payload:{text:i}}),compose:(i)=>P({channel:B,v:H,type:"compose",id:X(x),payload:i}),attach:(i)=>P({channel:B,v:H,type:"attach",id:X(x),payload:Ze(i)}),startSession:async(i)=>{if(i.projectId!==void 0)v(i.projectId);let l=i.worktree;if(l&&l!==!0)if(l.kind==="existing")v(l.directory);else{if(l.name!==void 0)v(l.name,200);if(l.baseBranch!==void 0)v(l.baseBranch,200)}let A=await q({channel:B,v:H,type:"start-session",id:X(x),payload:yr(i)},e.requestTimeoutMs??180000);if(!ur(A))throw new M("HOST_REJECTED","Host did not return a session.");return A},prompt:(i)=>q({channel:B,v:H,type:"prompt",id:X(x),payload:br(i)}).then((l)=>{if(!fr(l))throw new M("HOST_REJECTED","Host did not return a prompt result.");return l}),sessionLink:(i)=>P({channel:B,v:H,type:"session-link",id:X(x),payload:Ze(i)}),close:()=>P({channel:B,v:H,type:"close",id:X(x)}),oauthStart:()=>P({channel:B,v:H,type:"oauth-start",id:X(x)}),oauthDisconnect:()=>P({channel:B,v:H,type:"oauth-disconnect",id:X(x)}),request:(i)=>(Bt(i.path)?q({channel:B,v:H,type:"request",id:X(x),payload:i}):_n()).then((l)=>{if(!Ht(l))throw new M("HOST_REJECTED","Host request result was empty.");return l}),serviceRequest:(i)=>(Bt(i.path)?q({channel:B,v:H,type:"service-request",id:X(x),payload:i}):_n()).then((l)=>{if(!Ht(l))throw new M("HOST_REJECTED","Host service request result was empty.");return l}),serviceStatus:()=>q({channel:B,v:H,type:"service-status",id:X(x)}).then((i)=>{if(!vr(i))throw new M("HOST_REJECTED","Host did not return service status.");return i}),readFile:(i)=>(et(i)?q({channel:B,v:H,type:"file-read",id:X(x),payload:{path:i}}):Vt()).then((l)=>{if(!_r(l))throw new M("HOST_REJECTED","Host did not return file content.");return l}),writeFile:(i,l)=>{if(!et(i))return Vt();if(l.length>Gt)return Promise.reject(new M("FILE_TOO_LARGE",`Content is over ${Gt} characters.`));return q({channel:B,v:H,type:"file-write",id:X(x),payload:{path:i,content:l}}).then((A)=>{if(!kr(A))throw new M("HOST_REJECTED","Host did not confirm the write.");return A})},listDir:(i)=>(et(i)?q({channel:B,v:H,type:"file-list",id:X(x),payload:{path:i}}):Vt()).then((l)=>{if(!Sr(l))throw new M("HOST_REJECTED","Host did not return directory entries.");return l}),stat:(i)=>(et(i)?q({channel:B,v:H,type:"file-stat",id:X(x),payload:{path:i}}):Vt()).then((l)=>{if(!Tr(l))throw new M("HOST_REJECTED","Host did not return file status.");return l}),generate:(i)=>{let l=i.prompt.trim(),A=i.system?.trim();if(l.length===0||l.length>Dt)return Promise.reject(new M("HOST_REJECTED",`Prompt must be 1 to ${Dt} characters.`));if(A!==void 0&&(A.length===0||A.length>jt))return Promise.reject(new M("HOST_REJECTED",`System prompt must be 1 to ${jt} characters.`));let I=i.maxOutputTokens===void 0?void 0:Math.min(hr,Math.max(1,Math.floor(i.maxOutputTokens)));if(I!==void 0&&!Number.isFinite(I))return Promise.reject(new M("HOST_REJECTED","maxOutputTokens must be a number."));let V={prompt:l};if(A!==void 0)V.system=A;if(I!==void 0)V.maxOutputTokens=I;return q({channel:B,v:H,type:"generate",id:X(x),payload:V},e.requestTimeoutMs??gr).then((N)=>{if(!wr(N))throw new M("HOST_REJECTED","Host did not return generated text.");return N})},setBadge:(i)=>P({channel:B,v:H,type:"badge",id:X(x),payload:{count:xr(i)}}),dispose:()=>{for(let i of k.keys())me({...m,type:"workspace-unsubscribe",id:X(x),payload:{subscriptionId:i}});k.clear(),E=!0,Y=null,j=null,t.removeEventListener("message",_e);for(let i of K.values())clearTimeout(i.timer),i.reject(new M("HOST_UNAVAILABLE","Host client was disposed."));K.clear(),o.clear(),s.clear(),a.clear(),c.clear(),d.clear(),u.clear(),b.clear()}}};var lo=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],kn=(e,t)=>{t.style.colorScheme=e.mode;for(let[r,n]of lo)t.style.setProperty(r,e.tokens[n]);t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size","0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},Cr=(e,t)=>{if(kn(e.theme,t),t.dataset)t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode};var tt=(e)=>{while(e.firstChild)e.removeChild(e.firstChild)},te=(e)=>{let t=document.getElementById("oc-sdk-ui-style");if(t instanceof HTMLStyleElement){if(t.textContent!==e)t.textContent=e;return}let r=document.createElement("style");r.id="oc-sdk-ui-style",r.textContent=e,document.head.appendChild(r)},R=(e,t)=>{let r=document.createElement(e);if(t)r.className=t;return r},Oe=(e)=>{let t=R("button",e);return t.type="button",t},de=(e,t)=>{let r=t??"";if(e.textContent!==r)e.textContent=r},rt=(e,t,r)=>{if(r===void 0||r===null||r==="")e.removeAttribute(t);else if(e.getAttribute(t)!==r)e.setAttribute(t,r)};var po={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},Q=(e,t)=>`var(--${e}, var(--oc-${po[e]}, ${t}))`,Ve=Q("surface-background","transparent"),Ft=Q("surface-elevated","transparent"),gt=Q("surface-elevated-foreground","inherit"),yt=Q("surface-foreground","inherit"),re=Q("surface-muted-foreground","gray"),uo=Q("surface-muted","transparent"),we=Q("interactive-border","currentColor"),ke=Q("interactive-hover","transparent"),Fe=Q("interactive-active","transparent"),Rr=Q("interactive-selection","transparent"),Pr=Q("interactive-selection-foreground","inherit"),wn=Q("interactive-focus-ring","currentColor"),Ae=Q("primary","currentColor"),Or=Q("primary-text","inherit"),Ir=Q("error-text","inherit"),fo=Q("font-sans","inherit"),Nr=Q("font-mono","monospace"),Sn=Q("radius","9px"),le=(e,t,r="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${r})`,Tn=`box-shadow: 0 0 0 2px ${wn};`,Xt=(e)=>{let t=Q(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${Q(`${e}-text`,"inherit")}; }`},ne=`
${cr}
.oc-sdk { box-sizing: border-box; color: ${yt}; font-family: ${fo}; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }
.oc-sdk :focus-visible { outline: none; ${Tn} }
.oc-sdk-mono { font-family: ${Nr}; }
.oc-sdk-muted { color: ${re}; }
${Xt("success")}${Xt("warning")}${Xt("error")}${Xt("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${Ae}; --oc-sdk-tone-text: ${Or}; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 36px; padding: 0 14px; border: 1px solid transparent; border-radius: ${Sn}; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="sm"] { height: 32px; padding: 0 10px; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { height: 24px; padding: 0 8px; font-size: 0.75rem; border-radius: 6px; }
.oc-sdk-btn[data-variant="default"] { color: ${Or}; background: ${le(Ae,10,Ve)}; border-color: ${le(Ae,12)}; }
.oc-sdk-btn[data-variant="default"]:hover { background: ${le(Ae,16,Ve)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${le(Ae,22,Ve)}; }
.oc-sdk-btn[data-variant="secondary"] { background: ${uo}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${ke}, ${ke}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${Fe}, ${Fe}); }
.oc-sdk-btn[data-variant="outline"] { background: ${Ft}; color: ${gt}; border-color: ${we}; }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${ke}, ${ke}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${Fe}, ${Fe}); }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${ke}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${Fe}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${Q("status-error","red")}; color: ${Ir}; background: ${le("var(--oc-sdk-tone)",7,Ve)}; border-color: ${le("var(--oc-sdk-tone)",12)}; }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${le("var(--oc-sdk-tone)",9,Ve)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${le("var(--oc-sdk-tone)",11,Ve)}; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: 14px; height: 14px; }

.oc-sdk-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; color: ${re}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Ir}; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: 36px; padding: 0 12px; border: 0; border-radius: ${Sn}; background: ${Ft}; color: ${gt}; font-size: 0.875rem; line-height: 1.45; appearance: none; box-shadow: inset 0 0 0 1px ${le(we,60)}; transition: background 150ms ease-out, box-shadow 150ms ease-out; }
textarea.oc-sdk-input { height: auto; padding: 8px 12px; resize: vertical; }
.oc-sdk-input::placeholder { color: ${re}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${ke}, ${ke}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { box-shadow: inset 0 0 0 2px ${wn}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input { box-shadow: inset 0 0 0 1px ${Q("status-error","red")}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { box-shadow: inset 0 0 0 2px ${Q("status-error","red")}; }
.oc-sdk-input[data-mono="true"] { font-family: ${Nr}; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: 34px; padding-right: 34px; }
.oc-sdk-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: ${re}; pointer-events: none; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${Ae}; }
.oc-sdk-search-clear { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; color: ${re}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }
.oc-sdk-search-clear:hover { background: ${ke}; color: ${yt}; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: 6px; width: 100%; min-width: 0; height: 32px; padding: 0 8px 0 10px; border: 1px solid ${we}; border-radius: 6px; background: ${Ft}; color: ${gt}; font-size: 0.8125rem; text-align: left; transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${ke}, ${ke}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${Fe}, ${Fe}); }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-value[data-empty="true"] { color: ${re}; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; color: ${re}; }
.oc-sdk-popup { --surface-foreground: ${gt}; position: fixed; z-index: 50; display: flex; flex-direction: column; gap: 2px; min-width: 160px; max-width: calc(100vw - 16px); max-height: min(320px, calc(100vh - 16px)); overflow: auto; padding: 4px; border: 1px solid ${le(we,60)}; border-radius: 12px; background: ${Ft}; color: ${gt}; box-shadow: 0 8px 24px ${le(yt,12)}; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: 2px 2px 4px; }
.oc-sdk-popup-search .oc-sdk-input { height: 32px; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; border-radius: 8px; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option[data-active="true"] { background: ${ke}; }
.oc-sdk-option[aria-selected="true"] { background: ${Rr}; color: ${Pr}; }
.oc-sdk-option[data-destructive="true"] { color: ${Ir}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${le(Q("status-error","red"),10)}; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; color: ${re}; }
.oc-sdk-option-check { flex: 0 0 auto; width: 12px; }
.oc-sdk-popup-empty { padding: 8px; font-size: 0.8125rem; color: ${re}; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: 8px; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; margin-top: 3px; border: 1px solid ${we}; border-radius: 4px; color: ${Ae}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${le(Ae,65,we)}; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: 36px; height: 20px; border-radius: 9999px; background: ${we}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 9999px; background: ${Ve}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${Ae}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${Tn} }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; color: ${re}; }

.oc-sdk-tabs { display: inline-flex; gap: 2px; padding: 2px; border-radius: 10px; max-width: 100%; overflow: auto; }
.oc-sdk-tabs[data-track="true"] { background: ${le(yt,4)}; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border: 1px solid transparent; border-radius: 8px; font-size: 0.8125rem; font-weight: 500; color: ${re}; white-space: nowrap; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${yt}; }
.oc-sdk-tab[aria-selected="true"] { color: ${Pr}; background: ${Rr}; border-color: ${we}; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; color: ${re}; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: 1px 6px; border-radius: 9999px; font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; background: ${ke}; color: ${re}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${le("var(--oc-sdk-tone)",15)}; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; border-radius: 6px; text-align: left; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${ke}; }
.oc-sdk-row[aria-selected="true"] { background: ${Rr}; color: ${Pr}; }
.oc-sdk-row-lead { flex: 0 0 auto; width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: ${Nr}; font-size: 0.75rem; color: ${re}; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; color: ${re}; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; color: ${re}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { padding: 16px 8px; text-align: center; font-size: 0.8125rem; color: ${re}; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 40px 16px; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; color: ${re}; }
.oc-sdk-empty-action { margin-top: 12px; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: ${re}; }
.oc-sdk-spinner-ring { width: 16px; height: 16px; border: 2px solid ${we}; border-top-color: ${Ae}; border-radius: 9999px; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: 12px; height: 12px; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: 12px; padding: 8px 12px; border: 1px solid ${le("var(--oc-sdk-tone)",40)}; border-radius: 8px; background: ${le("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { font-size: 0.8125rem; color: ${re}; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: 8px; width: 100%; margin: 8px 0; font-size: 0.75rem; color: ${re}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; background: ${le(we,40)}; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: 4px 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; color: ${re}; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: 6px; border-radius: 9999px; background: ${we}; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; border-radius: 9999px; background: var(--oc-sdk-tone, ${Ae}); transform-origin: left; transition: transform 200ms ease-out; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text a { color: ${Or}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { display: block; max-width: 100%; margin: 8px 0; border-radius: 8px; border: 1px solid ${le(we,60)}; }
`;var mo=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},je=(e,t)=>{te(ne);let r=t,n=Oe("oc-sdk oc-sdk-btn"),o=mo(),s=document.createElement("span");n.append(s),e.append(n);let a=()=>{if(n.dataset.variant=r.variant??"default",n.dataset.size=r.size??"default",n.disabled=Boolean(r.disabled)||Boolean(r.loading),n.dataset.loading=r.loading?"true":"false",n.setAttribute("aria-busy",r.loading?"true":"false"),r.loading&&o.parentNode!==n)n.prepend(o);else if(!r.loading&&o.parentNode===n)o.remove();de(s,r.label)},c=()=>{if(r.disabled||r.loading)return;r.onClick()};return n.addEventListener("click",c),a(),{update:(d)=>{r={...r,...d},a()},dispose:()=>{n.removeEventListener("click",c),n.remove()}}};var be=(e,t)=>{te(ne);let r=t,n=R("label","oc-sdk oc-sdk-field"),o=R("span","oc-sdk-field-label"),s=r.multiline?R("textarea","oc-sdk-input"):R("input","oc-sdk-input"),a=R("span","oc-sdk-field-note");n.append(o,s,a),e.append(n);let c=()=>{if(de(o,r.label),o.hidden=!r.label,s instanceof HTMLInputElement)s.type=r.password?"password":"text";else s.rows=r.rows??3;if(s.value!==r.value)s.value=r.value;s.disabled=Boolean(r.disabled),rt(s,"placeholder",r.placeholder),s.dataset.mono=r.mono?"true":"false";let u=Boolean(r.error);n.dataset.invalid=u?"true":"false",s.setAttribute("aria-invalid",u?"true":"false");let b=r.error??r.helper??"";de(a,b),a.hidden=b===""},d=()=>{r.onChange(s.value)};return s.addEventListener("input",d),c(),{update:(u)=>{r={...r,...u},c()},dispose:()=>{s.removeEventListener("input",d),n.remove()}}};var ho={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},Kt=(e,t,r)=>{let n=document.createElementNS("http://www.w3.org/2000/svg","svg");if(n.setAttribute("viewBox","0 0 24 24"),n.setAttribute("width",String(t)),n.setAttribute("height",String(t)),n.setAttribute("aria-hidden","true"),n.setAttribute("fill","currentColor"),r)n.setAttribute("class",r);let o=document.createElementNS("http://www.w3.org/2000/svg","path");return o.setAttribute("d",ho[e]),n.append(o),n};var nt=(e,t="vertical")=>{let[r,n]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];if(e.key===r||e.ctrlKey&&e.key.toLowerCase()==="n")return"next";if(e.key===n||e.ctrlKey&&e.key.toLowerCase()==="p")return"previous";if(e.key==="Home")return"first";if(e.key==="End")return"last";return null},ot=(e,t,r)=>{let n=e.filter((d)=>!d.disabled);if(n.length===0)return null;let o=n[0],s=n[n.length-1];if(r==="first"||!o||!s)return o?.id??null;if(r==="last")return s.id;let a=n.findIndex((d)=>d.id===t);if(a===-1)return r==="next"?o.id:s.id;return n[Math.min(n.length-1,Math.max(0,a+(r==="next"?1:-1)))]?.id??null};var En=(e,t,r)=>{te(ne);let n=t,o=Oe("oc-sdk oc-sdk-check");o.setAttribute("role",r);let s=R("span",r==="switch"?"oc-sdk-check-thumb":"oc-sdk-check-box");if(r==="checkbox")s.append(Kt("check",12));let a=R("span","oc-sdk-check-text"),c=R("span","oc-sdk-check-label"),d=R("span","oc-sdk-check-desc");a.append(c,d),o.append(s,a),e.append(o);let u=()=>{o.setAttribute("aria-checked",n.checked?"true":"false"),o.disabled=Boolean(n.disabled),de(c,n.label),de(d,n.description),d.hidden=!n.description},b=()=>{if(!n.disabled)n.onChange(!n.checked)};return o.addEventListener("click",b),u(),{update:(Y)=>{n={...n,...Y},u()},dispose:()=>{o.removeEventListener("click",b),o.remove()}}},Mr=(e,t)=>En(e,t,"checkbox"),$r=(e,t)=>En(e,t,"switch");var Lr=(e,t)=>{te(ne);let r=t,n=R("div","oc-sdk oc-sdk-tabs");n.setAttribute("role","tablist"),e.append(n);let o=()=>{tt(n),n.dataset.track=r.trackBackground?"true":"false";for(let a of r.items){let c=Oe("oc-sdk-tab");c.setAttribute("role","tab");let d=a.id===r.activeId;c.setAttribute("aria-selected",d?"true":"false"),c.tabIndex=d?0:-1,c.dataset.id=a.id;let u=R("span");if(u.textContent=a.label,c.append(u),a.count!==void 0){let b=R("span","oc-sdk-tab-count");b.textContent=String(a.count),c.append(b)}c.addEventListener("click",()=>{if(a.id!==r.activeId)r.onChange(a.id)}),n.append(c)}},s=(a)=>{let c=nt(a,"horizontal");if(!c)return;let d=ot(r.items,r.activeId,c);if(d&&d!==r.activeId){a.preventDefault(),r.onChange(d);let u=n.querySelector(`[data-id="${CSS.escape(d)}"]`);if(u instanceof HTMLElement)u.focus()}};return n.addEventListener("keydown",s),o(),{update:(a)=>{r={...r,...a},o()},dispose:()=>{n.removeEventListener("keydown",s),n.remove()}}};var bt=(e,t)=>{te(ne);let r=t,n=R("div","oc-sdk oc-sdk-empty"),o=R("h2","oc-sdk-empty-title"),s=R("p","oc-sdk-empty-body"),a=R("div","oc-sdk-empty-action");n.append(o,s,a),e.append(n);let c=null,d=()=>{if(de(o,r.title),de(s,r.body),s.hidden=!r.body,a.hidden=!r.action,!r.action){c?.dispose(),c=null;return}let u={label:r.action.label,onClick:r.action.onClick};if(c)c.update(u);else c=je(a,{...u,variant:"outline",size:"sm"})};return d(),{update:(u)=>{r={...r,...u},d()},dispose:()=>{c?.dispose(),c=null,n.remove()}}};var Ur=(e,t={})=>{te(ne);let r=t,n=R("span","oc-sdk oc-sdk-spinner");n.setAttribute("role","status");let o=R("span","oc-sdk-spinner-ring");o.setAttribute("aria-hidden","true");let s=R("span");n.append(o,s),e.append(n);let a=()=>{n.dataset.size=r.size??"default",de(s,r.label),s.hidden=!r.label,n.setAttribute("aria-label",r.label??"Loading")};return a(),{update:(c)=>{r={...r,...c},a()},dispose:()=>{n.remove()}}};var Se=(e,t)=>{te(ne);let r=t,n=R("div","oc-sdk oc-sdk-banner"),o=R("div","oc-sdk-banner-text"),s=R("div","oc-sdk-banner-title"),a=R("div","oc-sdk-banner-body"),c=R("div","oc-sdk-banner-action");o.append(s,a),n.append(o,c),e.append(n);let d=null,u=()=>{if(n.dataset.tone=r.tone,n.setAttribute("role",r.tone==="error"||r.tone==="warning"?"alert":"status"),de(s,r.title),de(a,r.body),a.hidden=!r.body,c.hidden=!r.action,!r.action){d?.dispose(),d=null;return}let b={label:r.action.label,onClick:r.action.onClick};if(d)d.update(b);else d=je(c,{...b,variant:"outline",size:"xs"})};return u(),{update:(b)=>{r={...r,...b},u()},dispose:()=>{d?.dispose(),d=null,n.remove()}}};var L;(function(e){e.assertEqual=(o)=>{};function t(o){}e.assertIs=t;function r(o){throw Error()}e.assertNever=r,e.arrayToEnum=(o)=>{let s={};for(let a of o)s[a]=a;return s},e.getValidEnumValues=(o)=>{let s=e.objectKeys(o).filter((c)=>typeof o[o[c]]!=="number"),a={};for(let c of s)a[c]=o[c];return e.objectValues(a)},e.objectValues=(o)=>e.objectKeys(o).map(function(s){return o[s]}),e.objectKeys=typeof Object.keys==="function"?(o)=>Object.keys(o):(o)=>{let s=[];for(let a in o)if(Object.prototype.hasOwnProperty.call(o,a))s.push(a);return s},e.find=(o,s)=>{for(let a of o)if(s(a))return a;return},e.isInteger=typeof Number.isInteger==="function"?(o)=>Number.isInteger(o):(o)=>typeof o==="number"&&Number.isFinite(o)&&Math.floor(o)===o;function n(o,s=" | "){return o.map((a)=>typeof a==="string"?`'${a}'`:a).join(s)}e.joinValues=n,e.jsonStringifyReplacer=(o,s)=>{if(typeof s==="bigint")return s.toString();return s}})(L||(L={}));var An;(function(e){e.mergeShapes=(t,r)=>({...t,...r})})(An||(An={}));var g=L.arrayToEnum(["string","nan","number","integer","float","boolean","date","bigint","symbol","function","undefined","null","array","object","unknown","promise","void","never","map","set"]),$e=(e)=>{switch(typeof e){case"undefined":return g.undefined;case"string":return g.string;case"number":return Number.isNaN(e)?g.nan:g.number;case"boolean":return g.boolean;case"function":return g.function;case"bigint":return g.bigint;case"symbol":return g.symbol;case"object":if(Array.isArray(e))return g.array;if(e===null)return g.null;if(e.then&&typeof e.then==="function"&&e.catch&&typeof e.catch==="function")return g.promise;if(typeof Map<"u"&&e instanceof Map)return g.map;if(typeof Set<"u"&&e instanceof Set)return g.set;if(typeof Date<"u"&&e instanceof Date)return g.date;return g.object;default:return g.unknown}};var f=L.arrayToEnum(["invalid_type","invalid_literal","custom","invalid_union","invalid_union_discriminator","invalid_enum_value","unrecognized_keys","invalid_arguments","invalid_return_type","invalid_date","invalid_string","too_small","too_big","invalid_intersection_types","not_multiple_of","not_finite"]);class Te extends Error{get errors(){return this.issues}constructor(e){super();this.issues=[],this.addIssue=(r)=>{this.issues=[...this.issues,r]},this.addIssues=(r=[])=>{this.issues=[...this.issues,...r]};let t=new.target.prototype;if(Object.setPrototypeOf)Object.setPrototypeOf(this,t);else this.__proto__=t;this.name="ZodError",this.issues=e}format(e){let t=e||function(o){return o.message},r={_errors:[]},n=(o)=>{for(let s of o.issues)if(s.code==="invalid_union")s.unionErrors.map(n);else if(s.code==="invalid_return_type")n(s.returnTypeError);else if(s.code==="invalid_arguments")n(s.argumentsError);else if(s.path.length===0)r._errors.push(t(s));else{let a=r,c=0;while(c<s.path.length){let d=s.path[c];if(c!==s.path.length-1)a[d]=a[d]||{_errors:[]};else a[d]=a[d]||{_errors:[]},a[d]._errors.push(t(s));a=a[d],c++}}};return n(this),r}static assert(e){if(!(e instanceof Te))throw Error(`Not a ZodError: ${e}`)}toString(){return this.message}get message(){return JSON.stringify(this.issues,L.jsonStringifyReplacer,2)}get isEmpty(){return this.issues.length===0}flatten(e=(t)=>t.message){let t={},r=[];for(let n of this.issues)if(n.path.length>0){let o=n.path[0];t[o]=t[o]||[],t[o].push(e(n))}else r.push(e(n));return{formErrors:r,fieldErrors:t}}get formErrors(){return this.flatten()}}Te.create=(e)=>new Te(e);var vo=(e,t)=>{let r;switch(e.code){case f.invalid_type:if(e.received===g.undefined)r="Required";else r=`Expected ${e.expected}, received ${e.received}`;break;case f.invalid_literal:r=`Invalid literal value, expected ${JSON.stringify(e.expected,L.jsonStringifyReplacer)}`;break;case f.unrecognized_keys:r=`Unrecognized key(s) in object: ${L.joinValues(e.keys,", ")}`;break;case f.invalid_union:r="Invalid input";break;case f.invalid_union_discriminator:r=`Invalid discriminator value. Expected ${L.joinValues(e.options)}`;break;case f.invalid_enum_value:r=`Invalid enum value. Expected ${L.joinValues(e.options)}, received '${e.received}'`;break;case f.invalid_arguments:r="Invalid function arguments";break;case f.invalid_return_type:r="Invalid function return type";break;case f.invalid_date:r="Invalid date";break;case f.invalid_string:if(typeof e.validation==="object")if("includes"in e.validation){if(r=`Invalid input: must include "${e.validation.includes}"`,typeof e.validation.position==="number")r=`${r} at one or more positions greater than or equal to ${e.validation.position}`}else if("startsWith"in e.validation)r=`Invalid input: must start with "${e.validation.startsWith}"`;else if("endsWith"in e.validation)r=`Invalid input: must end with "${e.validation.endsWith}"`;else L.assertNever(e.validation);else if(e.validation!=="regex")r=`Invalid ${e.validation}`;else r="Invalid";break;case f.too_small:if(e.type==="array")r=`Array must contain ${e.exact?"exactly":e.inclusive?"at least":"more than"} ${e.minimum} element(s)`;else if(e.type==="string")r=`String must contain ${e.exact?"exactly":e.inclusive?"at least":"over"} ${e.minimum} character(s)`;else if(e.type==="number")r=`Number must be ${e.exact?"exactly equal to ":e.inclusive?"greater than or equal to ":"greater than "}${e.minimum}`;else if(e.type==="bigint")r=`Number must be ${e.exact?"exactly equal to ":e.inclusive?"greater than or equal to ":"greater than "}${e.minimum}`;else if(e.type==="date")r=`Date must be ${e.exact?"exactly equal to ":e.inclusive?"greater than or equal to ":"greater than "}${new Date(Number(e.minimum))}`;else r="Invalid input";break;case f.too_big:if(e.type==="array")r=`Array must contain ${e.exact?"exactly":e.inclusive?"at most":"less than"} ${e.maximum} element(s)`;else if(e.type==="string")r=`String must contain ${e.exact?"exactly":e.inclusive?"at most":"under"} ${e.maximum} character(s)`;else if(e.type==="number")r=`Number must be ${e.exact?"exactly":e.inclusive?"less than or equal to":"less than"} ${e.maximum}`;else if(e.type==="bigint")r=`BigInt must be ${e.exact?"exactly":e.inclusive?"less than or equal to":"less than"} ${e.maximum}`;else if(e.type==="date")r=`Date must be ${e.exact?"exactly":e.inclusive?"smaller than or equal to":"smaller than"} ${new Date(Number(e.maximum))}`;else r="Invalid input";break;case f.custom:r="Invalid input";break;case f.invalid_intersection_types:r="Intersection results could not be merged";break;case f.not_multiple_of:r=`Number must be a multiple of ${e.multipleOf}`;break;case f.not_finite:r="Number must be finite";break;default:r=t.defaultError,L.assertNever(e)}return{message:r}},ze=vo;var _o=ze;function xt(){return _o}var Jt=(e)=>{let{data:t,path:r,errorMaps:n,issueData:o}=e,s=[...r,...o.path||[]],a={...o,path:s};if(o.message!==void 0)return{...o,path:s,message:o.message};let c="",d=n.filter((u)=>!!u).slice().reverse();for(let u of d)c=u(a,{data:t,defaultError:c}).message;return{...o,path:s,message:c}};function h(e,t){let r=xt(),n=Jt({issueData:t,data:e.data,path:e.path,errorMaps:[e.common.contextualErrorMap,e.schemaErrorMap,r,r===ze?void 0:ze].filter((o)=>!!o)});e.common.issues.push(n)}class he{constructor(){this.value="valid"}dirty(){if(this.value==="valid")this.value="dirty"}abort(){if(this.value!=="aborted")this.value="aborted"}static mergeArray(e,t){let r=[];for(let n of t){if(n.status==="aborted")return S;if(n.status==="dirty")e.dirty();r.push(n.value)}return{status:e.value,value:r}}static async mergeObjectAsync(e,t){let r=[];for(let n of t){let o=await n.key,s=await n.value;r.push({key:o,value:s})}return he.mergeObjectSync(e,r)}static mergeObjectSync(e,t){let r={};for(let n of t){let{key:o,value:s}=n;if(o.status==="aborted")return S;if(s.status==="aborted")return S;if(o.status==="dirty")e.dirty();if(s.status==="dirty")e.dirty();if(o.value!=="__proto__"&&(typeof s.value<"u"||n.alwaysSet))r[o.value]=s.value}return{status:e.value,value:r}}}var S=Object.freeze({status:"aborted"}),st=(e)=>({status:"dirty",value:e}),ge=(e)=>({status:"valid",value:e}),Gr=(e)=>e.status==="aborted",Dr=(e)=>e.status==="dirty",Xe=(e)=>e.status==="valid",vt=(e)=>typeof Promise<"u"&&e instanceof Promise;var y;(function(e){e.errToObj=(t)=>typeof t==="string"?{message:t}:t||{},e.toString=(t)=>typeof t==="string"?t:t?.message})(y||(y={}));class Ce{constructor(e,t,r,n){this._cachedPath=[],this.parent=e,this.data=t,this._path=r,this._key=n}get path(){if(!this._cachedPath.length)if(Array.isArray(this._key))this._cachedPath.push(...this._path,...this._key);else this._cachedPath.push(...this._path,this._key);return this._cachedPath}}var Cn=(e,t)=>{if(Xe(t))return{success:!0,data:t.value};else{if(!e.common.issues.length)throw Error("Validation failed but no issues detected.");return{success:!1,get error(){if(this._error)return this._error;let r=new Te(e.common.issues);return this._error=r,this._error}}}};function C(e){if(!e)return{};let{errorMap:t,invalid_type_error:r,required_error:n,description:o}=e;if(t&&(r||n))throw Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);if(t)return{errorMap:t,description:o};return{errorMap:(a,c)=>{let{message:d}=e;if(a.code==="invalid_enum_value")return{message:d??c.defaultError};if(typeof c.data>"u")return{message:d??n??c.defaultError};if(a.code!=="invalid_type")return{message:c.defaultError};return{message:d??r??c.defaultError}},description:o}}class O{get description(){return this._def.description}_getType(e){return $e(e.data)}_getOrReturnCtx(e,t){return t||{common:e.parent.common,data:e.data,parsedType:$e(e.data),schemaErrorMap:this._def.errorMap,path:e.path,parent:e.parent}}_processInputParams(e){return{status:new he,ctx:{common:e.parent.common,data:e.data,parsedType:$e(e.data),schemaErrorMap:this._def.errorMap,path:e.path,parent:e.parent}}}_parseSync(e){let t=this._parse(e);if(vt(t))throw Error("Synchronous parse encountered promise.");return t}_parseAsync(e){let t=this._parse(e);return Promise.resolve(t)}parse(e,t){let r=this.safeParse(e,t);if(r.success)return r.data;throw r.error}safeParse(e,t){let r={common:{issues:[],async:t?.async??!1,contextualErrorMap:t?.errorMap},path:t?.path||[],schemaErrorMap:this._def.errorMap,parent:null,data:e,parsedType:$e(e)},n=this._parseSync({data:e,path:r.path,parent:r});return Cn(r,n)}"~validate"(e){let t={common:{issues:[],async:!!this["~standard"].async},path:[],schemaErrorMap:this._def.errorMap,parent:null,data:e,parsedType:$e(e)};if(!this["~standard"].async)try{let r=this._parseSync({data:e,path:[],parent:t});return Xe(r)?{value:r.value}:{issues:t.common.issues}}catch(r){if(r?.message?.toLowerCase()?.includes("encountered"))this["~standard"].async=!0;t.common={issues:[],async:!0}}return this._parseAsync({data:e,path:[],parent:t}).then((r)=>Xe(r)?{value:r.value}:{issues:t.common.issues})}async parseAsync(e,t){let r=await this.safeParseAsync(e,t);if(r.success)return r.data;throw r.error}async safeParseAsync(e,t){let r={common:{issues:[],contextualErrorMap:t?.errorMap,async:!0},path:t?.path||[],schemaErrorMap:this._def.errorMap,parent:null,data:e,parsedType:$e(e)},n=this._parse({data:e,path:r.path,parent:r}),o=await(vt(n)?n:Promise.resolve(n));return Cn(r,o)}refine(e,t){let r=(n)=>{if(typeof t==="string"||typeof t>"u")return{message:t};else if(typeof t==="function")return t(n);else return t};return this._refinement((n,o)=>{let s=e(n),a=()=>o.addIssue({code:f.custom,...r(n)});if(typeof Promise<"u"&&s instanceof Promise)return s.then((c)=>{if(!c)return a(),!1;else return!0});if(!s)return a(),!1;else return!0})}refinement(e,t){return this._refinement((r,n)=>{if(!e(r))return n.addIssue(typeof t==="function"?t(r,n):t),!1;else return!0})}_refinement(e){return new Me({schema:this,typeName:T.ZodEffects,effect:{type:"refinement",refinement:e}})}superRefine(e){return this._refinement(e)}constructor(e){this.spa=this.safeParseAsync,this._def=e,this.parse=this.parse.bind(this),this.safeParse=this.safeParse.bind(this),this.parseAsync=this.parseAsync.bind(this),this.safeParseAsync=this.safeParseAsync.bind(this),this.spa=this.spa.bind(this),this.refine=this.refine.bind(this),this.refinement=this.refinement.bind(this),this.superRefine=this.superRefine.bind(this),this.optional=this.optional.bind(this),this.nullable=this.nullable.bind(this),this.nullish=this.nullish.bind(this),this.array=this.array.bind(this),this.promise=this.promise.bind(this),this.or=this.or.bind(this),this.and=this.and.bind(this),this.transform=this.transform.bind(this),this.brand=this.brand.bind(this),this.default=this.default.bind(this),this.catch=this.catch.bind(this),this.describe=this.describe.bind(this),this.pipe=this.pipe.bind(this),this.readonly=this.readonly.bind(this),this.isNullable=this.isNullable.bind(this),this.isOptional=this.isOptional.bind(this),this["~standard"]={version:1,vendor:"zod",validate:(t)=>this["~validate"](t)}}optional(){return Ne.create(this,this._def)}nullable(){return Be.create(this,this._def)}nullish(){return this.nullable().optional()}array(){return Ie.create(this)}promise(){return lt.create(this,this._def)}or(e){return wt.create([this,e],this._def)}and(e){return Et.create(this,e,this._def)}transform(e){return new Me({...C(this._def),schema:this,typeName:T.ZodEffects,effect:{type:"transform",transform:e}})}default(e){let t=typeof e==="function"?e:()=>e;return new Pt({...C(this._def),innerType:this,defaultValue:t,typeName:T.ZodDefault})}brand(){return new Hr({typeName:T.ZodBranded,type:this,...C(this._def)})}catch(e){let t=typeof e==="function"?e:()=>e;return new Ot({...C(this._def),innerType:this,catchValue:t,typeName:T.ZodCatch})}describe(e){return new this.constructor({...this._def,description:e})}pipe(e){return rr.create(this,e)}readonly(){return It.create(this)}isOptional(){return this.safeParse(void 0).success}isNullable(){return this.safeParse(null).success}}var ko=/^c[^\s-]{8,}$/i,So=/^[0-9a-z]+$/,To=/^[0-9A-HJKMNP-TV-Z]{26}$/i,wo=/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i,Eo=/^[a-z0-9_-]{21}$/i,Ao=/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,Co=/^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/,Ro=/^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i,Po="^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$",jr,Oo=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,Io=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,No=/^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,Mo=/^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,$o=/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,Lo=/^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,Rn="((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))",Uo=new RegExp(`^${Rn}$`);function Pn(e){let t="[0-5]\\d";if(e.precision)t=`${t}\\.\\d{${e.precision}}`;else if(e.precision==null)t=`${t}(\\.\\d+)?`;let r=e.precision?"+":"?";return`([01]\\d|2[0-3]):[0-5]\\d(:${t})${r}`}function Go(e){return new RegExp(`^${Pn(e)}$`)}function Do(e){let t=`${Rn}T${Pn(e)}`,r=[];if(r.push(e.local?"Z?":"Z"),e.offset)r.push("([+-]\\d{2}:?\\d{2})");return t=`${t}(${r.join("|")})`,new RegExp(`^${t}$`)}function jo(e,t){if((t==="v4"||!t)&&Oo.test(e))return!0;if((t==="v6"||!t)&&No.test(e))return!0;return!1}function zo(e,t){if(!Ao.test(e))return!1;try{let[r]=e.split(".");if(!r)return!1;let n=r.replace(/-/g,"+").replace(/_/g,"/").padEnd(r.length+(4-r.length%4)%4,"="),o=JSON.parse(atob(n));if(typeof o!=="object"||o===null)return!1;if("typ"in o&&o?.typ!=="JWT")return!1;if(!o.alg)return!1;if(t&&o.alg!==t)return!1;return!0}catch{return!1}}function Bo(e,t){if((t==="v4"||!t)&&Io.test(e))return!0;if((t==="v6"||!t)&&Mo.test(e))return!0;return!1}class Ue extends O{_parse(e){if(this._def.coerce)e.data=String(e.data);if(this._getType(e)!==g.string){let o=this._getOrReturnCtx(e);return h(o,{code:f.invalid_type,expected:g.string,received:o.parsedType}),S}let r=new he,n=void 0;for(let o of this._def.checks)if(o.kind==="min"){if(e.data.length<o.value)n=this._getOrReturnCtx(e,n),h(n,{code:f.too_small,minimum:o.value,type:"string",inclusive:!0,exact:!1,message:o.message}),r.dirty()}else if(o.kind==="max"){if(e.data.length>o.value)n=this._getOrReturnCtx(e,n),h(n,{code:f.too_big,maximum:o.value,type:"string",inclusive:!0,exact:!1,message:o.message}),r.dirty()}else if(o.kind==="length"){let s=e.data.length>o.value,a=e.data.length<o.value;if(s||a){if(n=this._getOrReturnCtx(e,n),s)h(n,{code:f.too_big,maximum:o.value,type:"string",inclusive:!0,exact:!0,message:o.message});else if(a)h(n,{code:f.too_small,minimum:o.value,type:"string",inclusive:!0,exact:!0,message:o.message});r.dirty()}}else if(o.kind==="email"){if(!Ro.test(e.data))n=this._getOrReturnCtx(e,n),h(n,{validation:"email",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="emoji"){if(!jr)jr=new RegExp(Po,"u");if(!jr.test(e.data))n=this._getOrReturnCtx(e,n),h(n,{validation:"emoji",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="uuid"){if(!wo.test(e.data))n=this._getOrReturnCtx(e,n),h(n,{validation:"uuid",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="nanoid"){if(!Eo.test(e.data))n=this._getOrReturnCtx(e,n),h(n,{validation:"nanoid",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="cuid"){if(!ko.test(e.data))n=this._getOrReturnCtx(e,n),h(n,{validation:"cuid",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="cuid2"){if(!So.test(e.data))n=this._getOrReturnCtx(e,n),h(n,{validation:"cuid2",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="ulid"){if(!To.test(e.data))n=this._getOrReturnCtx(e,n),h(n,{validation:"ulid",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="url")try{new URL(e.data)}catch{n=this._getOrReturnCtx(e,n),h(n,{validation:"url",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="regex"){if(o.regex.lastIndex=0,!o.regex.test(e.data))n=this._getOrReturnCtx(e,n),h(n,{validation:"regex",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="trim")e.data=e.data.trim();else if(o.kind==="includes"){if(!e.data.includes(o.value,o.position))n=this._getOrReturnCtx(e,n),h(n,{code:f.invalid_string,validation:{includes:o.value,position:o.position},message:o.message}),r.dirty()}else if(o.kind==="toLowerCase")e.data=e.data.toLowerCase();else if(o.kind==="toUpperCase")e.data=e.data.toUpperCase();else if(o.kind==="startsWith"){if(!e.data.startsWith(o.value))n=this._getOrReturnCtx(e,n),h(n,{code:f.invalid_string,validation:{startsWith:o.value},message:o.message}),r.dirty()}else if(o.kind==="endsWith"){if(!e.data.endsWith(o.value))n=this._getOrReturnCtx(e,n),h(n,{code:f.invalid_string,validation:{endsWith:o.value},message:o.message}),r.dirty()}else if(o.kind==="datetime"){if(!Do(o).test(e.data))n=this._getOrReturnCtx(e,n),h(n,{code:f.invalid_string,validation:"datetime",message:o.message}),r.dirty()}else if(o.kind==="date"){if(!Uo.test(e.data))n=this._getOrReturnCtx(e,n),h(n,{code:f.invalid_string,validation:"date",message:o.message}),r.dirty()}else if(o.kind==="time"){if(!Go(o).test(e.data))n=this._getOrReturnCtx(e,n),h(n,{code:f.invalid_string,validation:"time",message:o.message}),r.dirty()}else if(o.kind==="duration"){if(!Co.test(e.data))n=this._getOrReturnCtx(e,n),h(n,{validation:"duration",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="ip"){if(!jo(e.data,o.version))n=this._getOrReturnCtx(e,n),h(n,{validation:"ip",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="jwt"){if(!zo(e.data,o.alg))n=this._getOrReturnCtx(e,n),h(n,{validation:"jwt",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="cidr"){if(!Bo(e.data,o.version))n=this._getOrReturnCtx(e,n),h(n,{validation:"cidr",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="base64"){if(!$o.test(e.data))n=this._getOrReturnCtx(e,n),h(n,{validation:"base64",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="base64url"){if(!Lo.test(e.data))n=this._getOrReturnCtx(e,n),h(n,{validation:"base64url",code:f.invalid_string,message:o.message}),r.dirty()}else L.assertNever(o);return{status:r.value,value:e.data}}_regex(e,t,r){return this.refinement((n)=>e.test(n),{validation:t,code:f.invalid_string,...y.errToObj(r)})}_addCheck(e){return new Ue({...this._def,checks:[...this._def.checks,e]})}email(e){return this._addCheck({kind:"email",...y.errToObj(e)})}url(e){return this._addCheck({kind:"url",...y.errToObj(e)})}emoji(e){return this._addCheck({kind:"emoji",...y.errToObj(e)})}uuid(e){return this._addCheck({kind:"uuid",...y.errToObj(e)})}nanoid(e){return this._addCheck({kind:"nanoid",...y.errToObj(e)})}cuid(e){return this._addCheck({kind:"cuid",...y.errToObj(e)})}cuid2(e){return this._addCheck({kind:"cuid2",...y.errToObj(e)})}ulid(e){return this._addCheck({kind:"ulid",...y.errToObj(e)})}base64(e){return this._addCheck({kind:"base64",...y.errToObj(e)})}base64url(e){return this._addCheck({kind:"base64url",...y.errToObj(e)})}jwt(e){return this._addCheck({kind:"jwt",...y.errToObj(e)})}ip(e){return this._addCheck({kind:"ip",...y.errToObj(e)})}cidr(e){return this._addCheck({kind:"cidr",...y.errToObj(e)})}datetime(e){if(typeof e==="string")return this._addCheck({kind:"datetime",precision:null,offset:!1,local:!1,message:e});return this._addCheck({kind:"datetime",precision:typeof e?.precision>"u"?null:e?.precision,offset:e?.offset??!1,local:e?.local??!1,...y.errToObj(e?.message)})}date(e){return this._addCheck({kind:"date",message:e})}time(e){if(typeof e==="string")return this._addCheck({kind:"time",precision:null,message:e});return this._addCheck({kind:"time",precision:typeof e?.precision>"u"?null:e?.precision,...y.errToObj(e?.message)})}duration(e){return this._addCheck({kind:"duration",...y.errToObj(e)})}regex(e,t){return this._addCheck({kind:"regex",regex:e,...y.errToObj(t)})}includes(e,t){return this._addCheck({kind:"includes",value:e,position:t?.position,...y.errToObj(t?.message)})}startsWith(e,t){return this._addCheck({kind:"startsWith",value:e,...y.errToObj(t)})}endsWith(e,t){return this._addCheck({kind:"endsWith",value:e,...y.errToObj(t)})}min(e,t){return this._addCheck({kind:"min",value:e,...y.errToObj(t)})}max(e,t){return this._addCheck({kind:"max",value:e,...y.errToObj(t)})}length(e,t){return this._addCheck({kind:"length",value:e,...y.errToObj(t)})}nonempty(e){return this.min(1,y.errToObj(e))}trim(){return new Ue({...this._def,checks:[...this._def.checks,{kind:"trim"}]})}toLowerCase(){return new Ue({...this._def,checks:[...this._def.checks,{kind:"toLowerCase"}]})}toUpperCase(){return new Ue({...this._def,checks:[...this._def.checks,{kind:"toUpperCase"}]})}get isDatetime(){return!!this._def.checks.find((e)=>e.kind==="datetime")}get isDate(){return!!this._def.checks.find((e)=>e.kind==="date")}get isTime(){return!!this._def.checks.find((e)=>e.kind==="time")}get isDuration(){return!!this._def.checks.find((e)=>e.kind==="duration")}get isEmail(){return!!this._def.checks.find((e)=>e.kind==="email")}get isURL(){return!!this._def.checks.find((e)=>e.kind==="url")}get isEmoji(){return!!this._def.checks.find((e)=>e.kind==="emoji")}get isUUID(){return!!this._def.checks.find((e)=>e.kind==="uuid")}get isNANOID(){return!!this._def.checks.find((e)=>e.kind==="nanoid")}get isCUID(){return!!this._def.checks.find((e)=>e.kind==="cuid")}get isCUID2(){return!!this._def.checks.find((e)=>e.kind==="cuid2")}get isULID(){return!!this._def.checks.find((e)=>e.kind==="ulid")}get isIP(){return!!this._def.checks.find((e)=>e.kind==="ip")}get isCIDR(){return!!this._def.checks.find((e)=>e.kind==="cidr")}get isBase64(){return!!this._def.checks.find((e)=>e.kind==="base64")}get isBase64url(){return!!this._def.checks.find((e)=>e.kind==="base64url")}get minLength(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e}get maxLength(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e}}Ue.create=(e)=>new Ue({checks:[],typeName:T.ZodString,coerce:e?.coerce??!1,...C(e)});function Ho(e,t){let r=(e.toString().split(".")[1]||"").length,n=(t.toString().split(".")[1]||"").length,o=r>n?r:n,s=Number.parseInt(e.toFixed(o).replace(".","")),a=Number.parseInt(t.toFixed(o).replace(".",""));return s%a/10**o}class it extends O{constructor(){super(...arguments);this.min=this.gte,this.max=this.lte,this.step=this.multipleOf}_parse(e){if(this._def.coerce)e.data=Number(e.data);if(this._getType(e)!==g.number){let o=this._getOrReturnCtx(e);return h(o,{code:f.invalid_type,expected:g.number,received:o.parsedType}),S}let r=void 0,n=new he;for(let o of this._def.checks)if(o.kind==="int"){if(!L.isInteger(e.data))r=this._getOrReturnCtx(e,r),h(r,{code:f.invalid_type,expected:"integer",received:"float",message:o.message}),n.dirty()}else if(o.kind==="min"){if(o.inclusive?e.data<o.value:e.data<=o.value)r=this._getOrReturnCtx(e,r),h(r,{code:f.too_small,minimum:o.value,type:"number",inclusive:o.inclusive,exact:!1,message:o.message}),n.dirty()}else if(o.kind==="max"){if(o.inclusive?e.data>o.value:e.data>=o.value)r=this._getOrReturnCtx(e,r),h(r,{code:f.too_big,maximum:o.value,type:"number",inclusive:o.inclusive,exact:!1,message:o.message}),n.dirty()}else if(o.kind==="multipleOf"){if(Ho(e.data,o.value)!==0)r=this._getOrReturnCtx(e,r),h(r,{code:f.not_multiple_of,multipleOf:o.value,message:o.message}),n.dirty()}else if(o.kind==="finite"){if(!Number.isFinite(e.data))r=this._getOrReturnCtx(e,r),h(r,{code:f.not_finite,message:o.message}),n.dirty()}else L.assertNever(o);return{status:n.value,value:e.data}}gte(e,t){return this.setLimit("min",e,!0,y.toString(t))}gt(e,t){return this.setLimit("min",e,!1,y.toString(t))}lte(e,t){return this.setLimit("max",e,!0,y.toString(t))}lt(e,t){return this.setLimit("max",e,!1,y.toString(t))}setLimit(e,t,r,n){return new it({...this._def,checks:[...this._def.checks,{kind:e,value:t,inclusive:r,message:y.toString(n)}]})}_addCheck(e){return new it({...this._def,checks:[...this._def.checks,e]})}int(e){return this._addCheck({kind:"int",message:y.toString(e)})}positive(e){return this._addCheck({kind:"min",value:0,inclusive:!1,message:y.toString(e)})}negative(e){return this._addCheck({kind:"max",value:0,inclusive:!1,message:y.toString(e)})}nonpositive(e){return this._addCheck({kind:"max",value:0,inclusive:!0,message:y.toString(e)})}nonnegative(e){return this._addCheck({kind:"min",value:0,inclusive:!0,message:y.toString(e)})}multipleOf(e,t){return this._addCheck({kind:"multipleOf",value:e,message:y.toString(t)})}finite(e){return this._addCheck({kind:"finite",message:y.toString(e)})}safe(e){return this._addCheck({kind:"min",inclusive:!0,value:Number.MIN_SAFE_INTEGER,message:y.toString(e)})._addCheck({kind:"max",inclusive:!0,value:Number.MAX_SAFE_INTEGER,message:y.toString(e)})}get minValue(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e}get maxValue(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e}get isInt(){return!!this._def.checks.find((e)=>e.kind==="int"||e.kind==="multipleOf"&&L.isInteger(e.value))}get isFinite(){let e=null,t=null;for(let r of this._def.checks)if(r.kind==="finite"||r.kind==="int"||r.kind==="multipleOf")return!0;else if(r.kind==="min"){if(t===null||r.value>t)t=r.value}else if(r.kind==="max"){if(e===null||r.value<e)e=r.value}return Number.isFinite(t)&&Number.isFinite(e)}}it.create=(e)=>new it({checks:[],typeName:T.ZodNumber,coerce:e?.coerce||!1,...C(e)});class ct extends O{constructor(){super(...arguments);this.min=this.gte,this.max=this.lte}_parse(e){if(this._def.coerce)try{e.data=BigInt(e.data)}catch{return this._getInvalidInput(e)}if(this._getType(e)!==g.bigint)return this._getInvalidInput(e);let r=void 0,n=new he;for(let o of this._def.checks)if(o.kind==="min"){if(o.inclusive?e.data<o.value:e.data<=o.value)r=this._getOrReturnCtx(e,r),h(r,{code:f.too_small,type:"bigint",minimum:o.value,inclusive:o.inclusive,message:o.message}),n.dirty()}else if(o.kind==="max"){if(o.inclusive?e.data>o.value:e.data>=o.value)r=this._getOrReturnCtx(e,r),h(r,{code:f.too_big,type:"bigint",maximum:o.value,inclusive:o.inclusive,message:o.message}),n.dirty()}else if(o.kind==="multipleOf"){if(e.data%o.value!==BigInt(0))r=this._getOrReturnCtx(e,r),h(r,{code:f.not_multiple_of,multipleOf:o.value,message:o.message}),n.dirty()}else L.assertNever(o);return{status:n.value,value:e.data}}_getInvalidInput(e){let t=this._getOrReturnCtx(e);return h(t,{code:f.invalid_type,expected:g.bigint,received:t.parsedType}),S}gte(e,t){return this.setLimit("min",e,!0,y.toString(t))}gt(e,t){return this.setLimit("min",e,!1,y.toString(t))}lte(e,t){return this.setLimit("max",e,!0,y.toString(t))}lt(e,t){return this.setLimit("max",e,!1,y.toString(t))}setLimit(e,t,r,n){return new ct({...this._def,checks:[...this._def.checks,{kind:e,value:t,inclusive:r,message:y.toString(n)}]})}_addCheck(e){return new ct({...this._def,checks:[...this._def.checks,e]})}positive(e){return this._addCheck({kind:"min",value:BigInt(0),inclusive:!1,message:y.toString(e)})}negative(e){return this._addCheck({kind:"max",value:BigInt(0),inclusive:!1,message:y.toString(e)})}nonpositive(e){return this._addCheck({kind:"max",value:BigInt(0),inclusive:!0,message:y.toString(e)})}nonnegative(e){return this._addCheck({kind:"min",value:BigInt(0),inclusive:!0,message:y.toString(e)})}multipleOf(e,t){return this._addCheck({kind:"multipleOf",value:e,message:y.toString(t)})}get minValue(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e}get maxValue(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e}}ct.create=(e)=>new ct({checks:[],typeName:T.ZodBigInt,coerce:e?.coerce??!1,...C(e)});class Yt extends O{_parse(e){if(this._def.coerce)e.data=Boolean(e.data);if(this._getType(e)!==g.boolean){let r=this._getOrReturnCtx(e);return h(r,{code:f.invalid_type,expected:g.boolean,received:r.parsedType}),S}return ge(e.data)}}Yt.create=(e)=>new Yt({typeName:T.ZodBoolean,coerce:e?.coerce||!1,...C(e)});class kt extends O{_parse(e){if(this._def.coerce)e.data=new Date(e.data);if(this._getType(e)!==g.date){let o=this._getOrReturnCtx(e);return h(o,{code:f.invalid_type,expected:g.date,received:o.parsedType}),S}if(Number.isNaN(e.data.getTime())){let o=this._getOrReturnCtx(e);return h(o,{code:f.invalid_date}),S}let r=new he,n=void 0;for(let o of this._def.checks)if(o.kind==="min"){if(e.data.getTime()<o.value)n=this._getOrReturnCtx(e,n),h(n,{code:f.too_small,message:o.message,inclusive:!0,exact:!1,minimum:o.value,type:"date"}),r.dirty()}else if(o.kind==="max"){if(e.data.getTime()>o.value)n=this._getOrReturnCtx(e,n),h(n,{code:f.too_big,message:o.message,inclusive:!0,exact:!1,maximum:o.value,type:"date"}),r.dirty()}else L.assertNever(o);return{status:r.value,value:new Date(e.data.getTime())}}_addCheck(e){return new kt({...this._def,checks:[...this._def.checks,e]})}min(e,t){return this._addCheck({kind:"min",value:e.getTime(),message:y.toString(t)})}max(e,t){return this._addCheck({kind:"max",value:e.getTime(),message:y.toString(t)})}get minDate(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e!=null?new Date(e):null}get maxDate(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e!=null?new Date(e):null}}kt.create=(e)=>new kt({checks:[],coerce:e?.coerce||!1,typeName:T.ZodDate,...C(e)});class Wt extends O{_parse(e){if(this._getType(e)!==g.symbol){let r=this._getOrReturnCtx(e);return h(r,{code:f.invalid_type,expected:g.symbol,received:r.parsedType}),S}return ge(e.data)}}Wt.create=(e)=>new Wt({typeName:T.ZodSymbol,...C(e)});class St extends O{_parse(e){if(this._getType(e)!==g.undefined){let r=this._getOrReturnCtx(e);return h(r,{code:f.invalid_type,expected:g.undefined,received:r.parsedType}),S}return ge(e.data)}}St.create=(e)=>new St({typeName:T.ZodUndefined,...C(e)});class Tt extends O{_parse(e){if(this._getType(e)!==g.null){let r=this._getOrReturnCtx(e);return h(r,{code:f.invalid_type,expected:g.null,received:r.parsedType}),S}return ge(e.data)}}Tt.create=(e)=>new Tt({typeName:T.ZodNull,...C(e)});class qt extends O{constructor(){super(...arguments);this._any=!0}_parse(e){return ge(e.data)}}qt.create=(e)=>new qt({typeName:T.ZodAny,...C(e)});class Ke extends O{constructor(){super(...arguments);this._unknown=!0}_parse(e){return ge(e.data)}}Ke.create=(e)=>new Ke({typeName:T.ZodUnknown,...C(e)});class Ge extends O{_parse(e){let t=this._getOrReturnCtx(e);return h(t,{code:f.invalid_type,expected:g.never,received:t.parsedType}),S}}Ge.create=(e)=>new Ge({typeName:T.ZodNever,...C(e)});class Qt extends O{_parse(e){if(this._getType(e)!==g.undefined){let r=this._getOrReturnCtx(e);return h(r,{code:f.invalid_type,expected:g.void,received:r.parsedType}),S}return ge(e.data)}}Qt.create=(e)=>new Qt({typeName:T.ZodVoid,...C(e)});class Ie extends O{_parse(e){let{ctx:t,status:r}=this._processInputParams(e),n=this._def;if(t.parsedType!==g.array)return h(t,{code:f.invalid_type,expected:g.array,received:t.parsedType}),S;if(n.exactLength!==null){let s=t.data.length>n.exactLength.value,a=t.data.length<n.exactLength.value;if(s||a)h(t,{code:s?f.too_big:f.too_small,minimum:a?n.exactLength.value:void 0,maximum:s?n.exactLength.value:void 0,type:"array",inclusive:!0,exact:!0,message:n.exactLength.message}),r.dirty()}if(n.minLength!==null){if(t.data.length<n.minLength.value)h(t,{code:f.too_small,minimum:n.minLength.value,type:"array",inclusive:!0,exact:!1,message:n.minLength.message}),r.dirty()}if(n.maxLength!==null){if(t.data.length>n.maxLength.value)h(t,{code:f.too_big,maximum:n.maxLength.value,type:"array",inclusive:!0,exact:!1,message:n.maxLength.message}),r.dirty()}if(t.common.async)return Promise.all([...t.data].map((s,a)=>n.type._parseAsync(new Ce(t,s,t.path,a)))).then((s)=>he.mergeArray(r,s));let o=[...t.data].map((s,a)=>n.type._parseSync(new Ce(t,s,t.path,a)));return he.mergeArray(r,o)}get element(){return this._def.type}min(e,t){return new Ie({...this._def,minLength:{value:e,message:y.toString(t)}})}max(e,t){return new Ie({...this._def,maxLength:{value:e,message:y.toString(t)}})}length(e,t){return new Ie({...this._def,exactLength:{value:e,message:y.toString(t)}})}nonempty(e){return this.min(1,e)}}Ie.create=(e,t)=>new Ie({type:e,minLength:null,maxLength:null,exactLength:null,typeName:T.ZodArray,...C(t)});function at(e){if(e instanceof oe){let t={};for(let r in e.shape){let n=e.shape[r];t[r]=Ne.create(at(n))}return new oe({...e._def,shape:()=>t})}else if(e instanceof Ie)return new Ie({...e._def,type:at(e.element)});else if(e instanceof Ne)return Ne.create(at(e.unwrap()));else if(e instanceof Be)return Be.create(at(e.unwrap()));else if(e instanceof De)return De.create(e.items.map((t)=>at(t)));else return e}class oe extends O{constructor(){super(...arguments);this._cached=null,this.nonstrict=this.passthrough,this.augment=this.extend}_getCached(){if(this._cached!==null)return this._cached;let e=this._def.shape(),t=L.objectKeys(e);return this._cached={shape:e,keys:t},this._cached}_parse(e){if(this._getType(e)!==g.object){let d=this._getOrReturnCtx(e);return h(d,{code:f.invalid_type,expected:g.object,received:d.parsedType}),S}let{status:r,ctx:n}=this._processInputParams(e),{shape:o,keys:s}=this._getCached(),a=[];if(!(this._def.catchall instanceof Ge&&this._def.unknownKeys==="strip")){for(let d in n.data)if(!s.includes(d))a.push(d)}let c=[];for(let d of s){let u=o[d],b=n.data[d];c.push({key:{status:"valid",value:d},value:u._parse(new Ce(n,b,n.path,d)),alwaysSet:d in n.data})}if(this._def.catchall instanceof Ge){let d=this._def.unknownKeys;if(d==="passthrough")for(let u of a)c.push({key:{status:"valid",value:u},value:{status:"valid",value:n.data[u]}});else if(d==="strict"){if(a.length>0)h(n,{code:f.unrecognized_keys,keys:a}),r.dirty()}else if(d==="strip");else throw Error("Internal ZodObject error: invalid unknownKeys value.")}else{let d=this._def.catchall;for(let u of a){let b=n.data[u];c.push({key:{status:"valid",value:u},value:d._parse(new Ce(n,b,n.path,u)),alwaysSet:u in n.data})}}if(n.common.async)return Promise.resolve().then(async()=>{let d=[];for(let u of c){let b=await u.key,Y=await u.value;d.push({key:b,value:Y,alwaysSet:u.alwaysSet})}return d}).then((d)=>he.mergeObjectSync(r,d));else return he.mergeObjectSync(r,c)}get shape(){return this._def.shape()}strict(e){return y.errToObj,new oe({...this._def,unknownKeys:"strict",...e!==void 0?{errorMap:(t,r)=>{let n=this._def.errorMap?.(t,r).message??r.defaultError;if(t.code==="unrecognized_keys")return{message:y.errToObj(e).message??n};return{message:n}}}:{}})}strip(){return new oe({...this._def,unknownKeys:"strip"})}passthrough(){return new oe({...this._def,unknownKeys:"passthrough"})}extend(e){return new oe({...this._def,shape:()=>({...this._def.shape(),...e})})}merge(e){return new oe({unknownKeys:e._def.unknownKeys,catchall:e._def.catchall,shape:()=>({...this._def.shape(),...e._def.shape()}),typeName:T.ZodObject})}setKey(e,t){return this.augment({[e]:t})}catchall(e){return new oe({...this._def,catchall:e})}pick(e){let t={};for(let r of L.objectKeys(e))if(e[r]&&this.shape[r])t[r]=this.shape[r];return new oe({...this._def,shape:()=>t})}omit(e){let t={};for(let r of L.objectKeys(this.shape))if(!e[r])t[r]=this.shape[r];return new oe({...this._def,shape:()=>t})}deepPartial(){return at(this)}partial(e){let t={};for(let r of L.objectKeys(this.shape)){let n=this.shape[r];if(e&&!e[r])t[r]=n;else t[r]=n.optional()}return new oe({...this._def,shape:()=>t})}required(e){let t={};for(let r of L.objectKeys(this.shape))if(e&&!e[r])t[r]=this.shape[r];else{let o=this.shape[r];while(o instanceof Ne)o=o._def.innerType;t[r]=o}return new oe({...this._def,shape:()=>t})}keyof(){return On(L.objectKeys(this.shape))}}oe.create=(e,t)=>new oe({shape:()=>e,unknownKeys:"strip",catchall:Ge.create(),typeName:T.ZodObject,...C(t)});oe.strictCreate=(e,t)=>new oe({shape:()=>e,unknownKeys:"strict",catchall:Ge.create(),typeName:T.ZodObject,...C(t)});oe.lazycreate=(e,t)=>new oe({shape:e,unknownKeys:"strip",catchall:Ge.create(),typeName:T.ZodObject,...C(t)});class wt extends O{_parse(e){let{ctx:t}=this._processInputParams(e),r=this._def.options;function n(o){for(let a of o)if(a.result.status==="valid")return a.result;for(let a of o)if(a.result.status==="dirty")return t.common.issues.push(...a.ctx.common.issues),a.result;let s=o.map((a)=>new Te(a.ctx.common.issues));return h(t,{code:f.invalid_union,unionErrors:s}),S}if(t.common.async)return Promise.all(r.map(async(o)=>{let s={...t,common:{...t.common,issues:[]},parent:null};return{result:await o._parseAsync({data:t.data,path:t.path,parent:s}),ctx:s}})).then(n);else{let o=void 0,s=[];for(let c of r){let d={...t,common:{...t.common,issues:[]},parent:null},u=c._parseSync({data:t.data,path:t.path,parent:d});if(u.status==="valid")return u;else if(u.status==="dirty"&&!o)o={result:u,ctx:d};if(d.common.issues.length)s.push(d.common.issues)}if(o)return t.common.issues.push(...o.ctx.common.issues),o.result;let a=s.map((c)=>new Te(c));return h(t,{code:f.invalid_union,unionErrors:a}),S}}get options(){return this._def.options}}wt.create=(e,t)=>new wt({options:e,typeName:T.ZodUnion,...C(t)});var Le=(e)=>{if(e instanceof At)return Le(e.schema);else if(e instanceof Me)return Le(e.innerType());else if(e instanceof Ct)return[e.value];else if(e instanceof Je)return e.options;else if(e instanceof Rt)return L.objectValues(e.enum);else if(e instanceof Pt)return Le(e._def.innerType);else if(e instanceof St)return[void 0];else if(e instanceof Tt)return[null];else if(e instanceof Ne)return[void 0,...Le(e.unwrap())];else if(e instanceof Be)return[null,...Le(e.unwrap())];else if(e instanceof Hr)return Le(e.unwrap());else if(e instanceof It)return Le(e.unwrap());else if(e instanceof Ot)return Le(e._def.innerType);else return[]};class Br extends O{_parse(e){let{ctx:t}=this._processInputParams(e);if(t.parsedType!==g.object)return h(t,{code:f.invalid_type,expected:g.object,received:t.parsedType}),S;let r=this.discriminator,n=t.data[r],o=this.optionsMap.get(n);if(!o)return h(t,{code:f.invalid_union_discriminator,options:Array.from(this.optionsMap.keys()),path:[r]}),S;if(t.common.async)return o._parseAsync({data:t.data,path:t.path,parent:t});else return o._parseSync({data:t.data,path:t.path,parent:t})}get discriminator(){return this._def.discriminator}get options(){return this._def.options}get optionsMap(){return this._def.optionsMap}static create(e,t,r){let n=new Map;for(let o of t){let s=Le(o.shape[e]);if(!s.length)throw Error(`A discriminator value for key \`${e}\` could not be extracted from all schema options`);for(let a of s){if(n.has(a))throw Error(`Discriminator property ${String(e)} has duplicate value ${String(a)}`);n.set(a,o)}}return new Br({typeName:T.ZodDiscriminatedUnion,discriminator:e,options:t,optionsMap:n,...C(r)})}}function zr(e,t){let r=$e(e),n=$e(t);if(e===t)return{valid:!0,data:e};else if(r===g.object&&n===g.object){let o=L.objectKeys(t),s=L.objectKeys(e).filter((c)=>o.indexOf(c)!==-1),a={...e,...t};for(let c of s){let d=zr(e[c],t[c]);if(!d.valid)return{valid:!1};a[c]=d.data}return{valid:!0,data:a}}else if(r===g.array&&n===g.array){if(e.length!==t.length)return{valid:!1};let o=[];for(let s=0;s<e.length;s++){let a=e[s],c=t[s],d=zr(a,c);if(!d.valid)return{valid:!1};o.push(d.data)}return{valid:!0,data:o}}else if(r===g.date&&n===g.date&&+e===+t)return{valid:!0,data:e};else return{valid:!1}}class Et extends O{_parse(e){let{status:t,ctx:r}=this._processInputParams(e),n=(o,s)=>{if(Gr(o)||Gr(s))return S;let a=zr(o.value,s.value);if(!a.valid)return h(r,{code:f.invalid_intersection_types}),S;if(Dr(o)||Dr(s))t.dirty();return{status:t.value,value:a.data}};if(r.common.async)return Promise.all([this._def.left._parseAsync({data:r.data,path:r.path,parent:r}),this._def.right._parseAsync({data:r.data,path:r.path,parent:r})]).then(([o,s])=>n(o,s));else return n(this._def.left._parseSync({data:r.data,path:r.path,parent:r}),this._def.right._parseSync({data:r.data,path:r.path,parent:r}))}}Et.create=(e,t,r)=>new Et({left:e,right:t,typeName:T.ZodIntersection,...C(r)});class De extends O{_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==g.array)return h(r,{code:f.invalid_type,expected:g.array,received:r.parsedType}),S;if(r.data.length<this._def.items.length)return h(r,{code:f.too_small,minimum:this._def.items.length,inclusive:!0,exact:!1,type:"array"}),S;if(!this._def.rest&&r.data.length>this._def.items.length)h(r,{code:f.too_big,maximum:this._def.items.length,inclusive:!0,exact:!1,type:"array"}),t.dirty();let o=[...r.data].map((s,a)=>{let c=this._def.items[a]||this._def.rest;if(!c)return null;return c._parse(new Ce(r,s,r.path,a))}).filter((s)=>!!s);if(r.common.async)return Promise.all(o).then((s)=>he.mergeArray(t,s));else return he.mergeArray(t,o)}get items(){return this._def.items}rest(e){return new De({...this._def,rest:e})}}De.create=(e,t)=>{if(!Array.isArray(e))throw Error("You must pass an array of schemas to z.tuple([ ... ])");return new De({items:e,typeName:T.ZodTuple,rest:null,...C(t)})};class Zt extends O{get keySchema(){return this._def.keyType}get valueSchema(){return this._def.valueType}_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==g.object)return h(r,{code:f.invalid_type,expected:g.object,received:r.parsedType}),S;let n=[],o=this._def.keyType,s=this._def.valueType;for(let a in r.data)n.push({key:o._parse(new Ce(r,a,r.path,a)),value:s._parse(new Ce(r,r.data[a],r.path,a)),alwaysSet:a in r.data});if(r.common.async)return he.mergeObjectAsync(t,n);else return he.mergeObjectSync(t,n)}get element(){return this._def.valueType}static create(e,t,r){if(t instanceof O)return new Zt({keyType:e,valueType:t,typeName:T.ZodRecord,...C(r)});return new Zt({keyType:Ue.create(),valueType:e,typeName:T.ZodRecord,...C(t)})}}class er extends O{get keySchema(){return this._def.keyType}get valueSchema(){return this._def.valueType}_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==g.map)return h(r,{code:f.invalid_type,expected:g.map,received:r.parsedType}),S;let n=this._def.keyType,o=this._def.valueType,s=[...r.data.entries()].map(([a,c],d)=>({key:n._parse(new Ce(r,a,r.path,[d,"key"])),value:o._parse(new Ce(r,c,r.path,[d,"value"]))}));if(r.common.async){let a=new Map;return Promise.resolve().then(async()=>{for(let c of s){let d=await c.key,u=await c.value;if(d.status==="aborted"||u.status==="aborted")return S;if(d.status==="dirty"||u.status==="dirty")t.dirty();a.set(d.value,u.value)}return{status:t.value,value:a}})}else{let a=new Map;for(let c of s){let{key:d,value:u}=c;if(d.status==="aborted"||u.status==="aborted")return S;if(d.status==="dirty"||u.status==="dirty")t.dirty();a.set(d.value,u.value)}return{status:t.value,value:a}}}}er.create=(e,t,r)=>new er({valueType:t,keyType:e,typeName:T.ZodMap,...C(r)});class dt extends O{_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==g.set)return h(r,{code:f.invalid_type,expected:g.set,received:r.parsedType}),S;let n=this._def;if(n.minSize!==null){if(r.data.size<n.minSize.value)h(r,{code:f.too_small,minimum:n.minSize.value,type:"set",inclusive:!0,exact:!1,message:n.minSize.message}),t.dirty()}if(n.maxSize!==null){if(r.data.size>n.maxSize.value)h(r,{code:f.too_big,maximum:n.maxSize.value,type:"set",inclusive:!0,exact:!1,message:n.maxSize.message}),t.dirty()}let o=this._def.valueType;function s(c){let d=new Set;for(let u of c){if(u.status==="aborted")return S;if(u.status==="dirty")t.dirty();d.add(u.value)}return{status:t.value,value:d}}let a=[...r.data.values()].map((c,d)=>o._parse(new Ce(r,c,r.path,d)));if(r.common.async)return Promise.all(a).then((c)=>s(c));else return s(a)}min(e,t){return new dt({...this._def,minSize:{value:e,message:y.toString(t)}})}max(e,t){return new dt({...this._def,maxSize:{value:e,message:y.toString(t)}})}size(e,t){return this.min(e,t).max(e,t)}nonempty(e){return this.min(1,e)}}dt.create=(e,t)=>new dt({valueType:e,minSize:null,maxSize:null,typeName:T.ZodSet,...C(t)});class _t extends O{constructor(){super(...arguments);this.validate=this.implement}_parse(e){let{ctx:t}=this._processInputParams(e);if(t.parsedType!==g.function)return h(t,{code:f.invalid_type,expected:g.function,received:t.parsedType}),S;function r(a,c){return Jt({data:a,path:t.path,errorMaps:[t.common.contextualErrorMap,t.schemaErrorMap,xt(),ze].filter((d)=>!!d),issueData:{code:f.invalid_arguments,argumentsError:c}})}function n(a,c){return Jt({data:a,path:t.path,errorMaps:[t.common.contextualErrorMap,t.schemaErrorMap,xt(),ze].filter((d)=>!!d),issueData:{code:f.invalid_return_type,returnTypeError:c}})}let o={errorMap:t.common.contextualErrorMap},s=t.data;if(this._def.returns instanceof lt){let a=this;return ge(async function(...c){let d=new Te([]),u=await a._def.args.parseAsync(c,o).catch((j)=>{throw d.addIssue(r(c,j)),d}),b=await Reflect.apply(s,this,u);return await a._def.returns._def.type.parseAsync(b,o).catch((j)=>{throw d.addIssue(n(b,j)),d})})}else{let a=this;return ge(function(...c){let d=a._def.args.safeParse(c,o);if(!d.success)throw new Te([r(c,d.error)]);let u=Reflect.apply(s,this,d.data),b=a._def.returns.safeParse(u,o);if(!b.success)throw new Te([n(u,b.error)]);return b.data})}}parameters(){return this._def.args}returnType(){return this._def.returns}args(...e){return new _t({...this._def,args:De.create(e).rest(Ke.create())})}returns(e){return new _t({...this._def,returns:e})}implement(e){return this.parse(e)}strictImplement(e){return this.parse(e)}static create(e,t,r){return new _t({args:e?e:De.create([]).rest(Ke.create()),returns:t||Ke.create(),typeName:T.ZodFunction,...C(r)})}}class At extends O{get schema(){return this._def.getter()}_parse(e){let{ctx:t}=this._processInputParams(e);return this._def.getter()._parse({data:t.data,path:t.path,parent:t})}}At.create=(e,t)=>new At({getter:e,typeName:T.ZodLazy,...C(t)});class Ct extends O{_parse(e){if(e.data!==this._def.value){let t=this._getOrReturnCtx(e);return h(t,{received:t.data,code:f.invalid_literal,expected:this._def.value}),S}return{status:"valid",value:e.data}}get value(){return this._def.value}}Ct.create=(e,t)=>new Ct({value:e,typeName:T.ZodLiteral,...C(t)});function On(e,t){return new Je({values:e,typeName:T.ZodEnum,...C(t)})}class Je extends O{_parse(e){if(typeof e.data!=="string"){let t=this._getOrReturnCtx(e),r=this._def.values;return h(t,{expected:L.joinValues(r),received:t.parsedType,code:f.invalid_type}),S}if(!this._cache)this._cache=new Set(this._def.values);if(!this._cache.has(e.data)){let t=this._getOrReturnCtx(e),r=this._def.values;return h(t,{received:t.data,code:f.invalid_enum_value,options:r}),S}return ge(e.data)}get options(){return this._def.values}get enum(){let e={};for(let t of this._def.values)e[t]=t;return e}get Values(){let e={};for(let t of this._def.values)e[t]=t;return e}get Enum(){let e={};for(let t of this._def.values)e[t]=t;return e}extract(e,t=this._def){return Je.create(e,{...this._def,...t})}exclude(e,t=this._def){return Je.create(this.options.filter((r)=>!e.includes(r)),{...this._def,...t})}}Je.create=On;class Rt extends O{_parse(e){let t=L.getValidEnumValues(this._def.values),r=this._getOrReturnCtx(e);if(r.parsedType!==g.string&&r.parsedType!==g.number){let n=L.objectValues(t);return h(r,{expected:L.joinValues(n),received:r.parsedType,code:f.invalid_type}),S}if(!this._cache)this._cache=new Set(L.getValidEnumValues(this._def.values));if(!this._cache.has(e.data)){let n=L.objectValues(t);return h(r,{received:r.data,code:f.invalid_enum_value,options:n}),S}return ge(e.data)}get enum(){return this._def.values}}Rt.create=(e,t)=>new Rt({values:e,typeName:T.ZodNativeEnum,...C(t)});class lt extends O{unwrap(){return this._def.type}_parse(e){let{ctx:t}=this._processInputParams(e);if(t.parsedType!==g.promise&&t.common.async===!1)return h(t,{code:f.invalid_type,expected:g.promise,received:t.parsedType}),S;let r=t.parsedType===g.promise?t.data:Promise.resolve(t.data);return ge(r.then((n)=>this._def.type.parseAsync(n,{path:t.path,errorMap:t.common.contextualErrorMap})))}}lt.create=(e,t)=>new lt({type:e,typeName:T.ZodPromise,...C(t)});class Me extends O{innerType(){return this._def.schema}sourceType(){return this._def.schema._def.typeName===T.ZodEffects?this._def.schema.sourceType():this._def.schema}_parse(e){let{status:t,ctx:r}=this._processInputParams(e),n=this._def.effect||null,o={addIssue:(s)=>{if(h(r,s),s.fatal)t.abort();else t.dirty()},get path(){return r.path}};if(o.addIssue=o.addIssue.bind(o),n.type==="preprocess"){let s=n.transform(r.data,o);if(r.common.async)return Promise.resolve(s).then(async(a)=>{if(t.value==="aborted")return S;let c=await this._def.schema._parseAsync({data:a,path:r.path,parent:r});if(c.status==="aborted")return S;if(c.status==="dirty")return st(c.value);if(t.value==="dirty")return st(c.value);return c});else{if(t.value==="aborted")return S;let a=this._def.schema._parseSync({data:s,path:r.path,parent:r});if(a.status==="aborted")return S;if(a.status==="dirty")return st(a.value);if(t.value==="dirty")return st(a.value);return a}}if(n.type==="refinement"){let s=(a)=>{let c=n.refinement(a,o);if(r.common.async)return Promise.resolve(c);if(c instanceof Promise)throw Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");return a};if(r.common.async===!1){let a=this._def.schema._parseSync({data:r.data,path:r.path,parent:r});if(a.status==="aborted")return S;if(a.status==="dirty")t.dirty();return s(a.value),{status:t.value,value:a.value}}else return this._def.schema._parseAsync({data:r.data,path:r.path,parent:r}).then((a)=>{if(a.status==="aborted")return S;if(a.status==="dirty")t.dirty();return s(a.value).then(()=>({status:t.value,value:a.value}))})}if(n.type==="transform")if(r.common.async===!1){let s=this._def.schema._parseSync({data:r.data,path:r.path,parent:r});if(!Xe(s))return S;let a=n.transform(s.value,o);if(a instanceof Promise)throw Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");return{status:t.value,value:a}}else return this._def.schema._parseAsync({data:r.data,path:r.path,parent:r}).then((s)=>{if(!Xe(s))return S;return Promise.resolve(n.transform(s.value,o)).then((a)=>({status:t.value,value:a}))});L.assertNever(n)}}Me.create=(e,t,r)=>new Me({schema:e,typeName:T.ZodEffects,effect:t,...C(r)});Me.createWithPreprocess=(e,t,r)=>new Me({schema:t,effect:{type:"preprocess",transform:e},typeName:T.ZodEffects,...C(r)});class Ne extends O{_parse(e){if(this._getType(e)===g.undefined)return ge(void 0);return this._def.innerType._parse(e)}unwrap(){return this._def.innerType}}Ne.create=(e,t)=>new Ne({innerType:e,typeName:T.ZodOptional,...C(t)});class Be extends O{_parse(e){if(this._getType(e)===g.null)return ge(null);return this._def.innerType._parse(e)}unwrap(){return this._def.innerType}}Be.create=(e,t)=>new Be({innerType:e,typeName:T.ZodNullable,...C(t)});class Pt extends O{_parse(e){let{ctx:t}=this._processInputParams(e),r=t.data;if(t.parsedType===g.undefined)r=this._def.defaultValue();return this._def.innerType._parse({data:r,path:t.path,parent:t})}removeDefault(){return this._def.innerType}}Pt.create=(e,t)=>new Pt({innerType:e,typeName:T.ZodDefault,defaultValue:typeof t.default==="function"?t.default:()=>t.default,...C(t)});class Ot extends O{_parse(e){let{ctx:t}=this._processInputParams(e),r={...t,common:{...t.common,issues:[]}},n=this._def.innerType._parse({data:r.data,path:r.path,parent:{...r}});if(vt(n))return n.then((o)=>({status:"valid",value:o.status==="valid"?o.value:this._def.catchValue({get error(){return new Te(r.common.issues)},input:r.data})}));else return{status:"valid",value:n.status==="valid"?n.value:this._def.catchValue({get error(){return new Te(r.common.issues)},input:r.data})}}removeCatch(){return this._def.innerType}}Ot.create=(e,t)=>new Ot({innerType:e,typeName:T.ZodCatch,catchValue:typeof t.catch==="function"?t.catch:()=>t.catch,...C(t)});class tr extends O{_parse(e){if(this._getType(e)!==g.nan){let r=this._getOrReturnCtx(e);return h(r,{code:f.invalid_type,expected:g.nan,received:r.parsedType}),S}return{status:"valid",value:e.data}}}tr.create=(e)=>new tr({typeName:T.ZodNaN,...C(e)});var Dc=Symbol("zod_brand");class Hr extends O{_parse(e){let{ctx:t}=this._processInputParams(e),r=t.data;return this._def.type._parse({data:r,path:t.path,parent:t})}unwrap(){return this._def.type}}class rr extends O{_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.common.async)return(async()=>{let o=await this._def.in._parseAsync({data:r.data,path:r.path,parent:r});if(o.status==="aborted")return S;if(o.status==="dirty")return t.dirty(),st(o.value);else return this._def.out._parseAsync({data:o.value,path:r.path,parent:r})})();else{let n=this._def.in._parseSync({data:r.data,path:r.path,parent:r});if(n.status==="aborted")return S;if(n.status==="dirty")return t.dirty(),{status:"dirty",value:n.value};else return this._def.out._parseSync({data:n.value,path:r.path,parent:r})}}static create(e,t){return new rr({in:e,out:t,typeName:T.ZodPipeline})}}class It extends O{_parse(e){let t=this._def.innerType._parse(e),r=(n)=>{if(Xe(n))n.value=Object.freeze(n.value);return n};return vt(t)?t.then((n)=>r(n)):r(t)}unwrap(){return this._def.innerType}}It.create=(e,t)=>new It({innerType:e,typeName:T.ZodReadonly,...C(t)});var jc={object:oe.lazycreate},T;(function(e){e.ZodString="ZodString",e.ZodNumber="ZodNumber",e.ZodNaN="ZodNaN",e.ZodBigInt="ZodBigInt",e.ZodBoolean="ZodBoolean",e.ZodDate="ZodDate",e.ZodSymbol="ZodSymbol",e.ZodUndefined="ZodUndefined",e.ZodNull="ZodNull",e.ZodAny="ZodAny",e.ZodUnknown="ZodUnknown",e.ZodNever="ZodNever",e.ZodVoid="ZodVoid",e.ZodArray="ZodArray",e.ZodObject="ZodObject",e.ZodUnion="ZodUnion",e.ZodDiscriminatedUnion="ZodDiscriminatedUnion",e.ZodIntersection="ZodIntersection",e.ZodTuple="ZodTuple",e.ZodRecord="ZodRecord",e.ZodMap="ZodMap",e.ZodSet="ZodSet",e.ZodFunction="ZodFunction",e.ZodLazy="ZodLazy",e.ZodLiteral="ZodLiteral",e.ZodEnum="ZodEnum",e.ZodEffects="ZodEffects",e.ZodNativeEnum="ZodNativeEnum",e.ZodOptional="ZodOptional",e.ZodNullable="ZodNullable",e.ZodDefault="ZodDefault",e.ZodCatch="ZodCatch",e.ZodPromise="ZodPromise",e.ZodBranded="ZodBranded",e.ZodPipeline="ZodPipeline",e.ZodReadonly="ZodReadonly"})(T||(T={}));var _=Ue.create,fe=it.create,zc=tr.create,Bc=ct.create,Re=Yt.create,Hc=kt.create,Vc=Wt.create,Fc=St.create,Vo=Tt.create,Xc=qt.create,Kc=Ke.create,Jc=Ge.create,Yc=Qt.create,Pe=Ie.create,{create:ee,strictCreate:Wc}=oe,Fo=wt.create,qc=Br.create,Qc=Et.create,Zc=De.create,Xo=Zt.create,ed=er.create,td=dt.create,rd=_t.create,nd=At.create,In=Ct.create,pt=Je.create,od=Rt.create,sd=lt.create,ad=Me.create,id=Ne.create,cd=Be.create,dd=Me.createWithPreprocess,ld=rr.create;var Vr=["http","vercel","cloudflare","deno","netlify"];var Mn=ee({id:_(),name:_(),type:pt(Vr),proxyUrl:_(),isActive:Re(),testStatus:pt(["active","error"]).nullable().optional(),lastTestedAt:fe().nullable().optional(),lastError:_().nullable().optional(),rateLimitedUntil:fe().nullable().optional()}),hd=ee({name:_().min(1),type:pt(Vr),proxyUrl:_().min(1),isActive:Re().optional()}),gd=ee({name:_().min(1).optional(),proxyUrl:_().min(1).optional(),isActive:Re().optional()}),yd=ee({accountId:_().min(1),apiToken:_().min(1),projectName:_().optional()}),bd=ee({vercelToken:_().min(1),projectName:_().optional()}),xd=ee({denoToken:_().min(1),orgDomain:_().min(1),projectName:_().optional()}),vd=ee({netlifyToken:_().min(1),projectName:_().optional()}),$n=ee({ok:Re(),status:fe().optional(),statusText:_().nullable().optional(),elapsedMs:fe().optional(),error:_().nullable().optional()}),Ln=["single","round-robin","random"],Ko=ee({version:In(1),port:fe().int().min(1024).max(65535),apiKey:_().min(8),upstream:_(),selectedModels:Pe(_()),proxyPools:Pe(Mn),proxyStrategy:pt(Ln).default("single"),activePoolId:_().nullable().optional(),stickyLimit:fe().int().min(1).max(100).default(1),rtkEnabled:Re().default(!0)}),_d=ee({port:fe().int().min(1024).max(65535).optional(),apiKey:_().min(1).optional(),selectedModels:Pe(_()).optional(),proxyPools:Pe(Mn).optional(),proxyStrategy:pt(Ln).optional(),activePoolId:_().nullable().optional(),stickyLimit:fe().int().min(1).max(100).optional(),rtkEnabled:Re().optional()}),kd=ee({modelId:_().min(1)}),Un=ee({ok:Re(),modelId:_(),elapsedMs:fe().int().nonnegative().optional(),reply:_().optional(),error:_().optional()}),Jo=ee({id:_(),name:_(),limit:ee({context:fe().optional(),output:fe().optional()}).optional(),capabilities:ee({tools:Re().optional(),input:Pe(_()).optional(),output:Pe(_()).optional()}).optional(),variants:Pe(ee({id:_(),settings:Xo(_(),Fo([_(),fe(),Re(),Vo()])).optional()})).optional()});var Yo=ee({at:fe(),method:_(),path:_(),model:_(),status:fe(),ms:fe(),poolName:_().optional()}),Wo=ee({providerId:_(),path:_(),installed:Re(),models:fe(),modelIds:Pe(_())}),xe=ee({running:Re(),routerError:_(),endpoint:_(),config:Ko,models:Pe(Jo),modelsFetchedAt:fe().nullable(),modelsError:_(),upstreamCount:fe(),registration:Wo,preview:_(),warnings:Pe(_()),requests:Pe(Yo)}),Gn=ee({kind:pt(Vr),code:_()}),Sd=ee({ok:In(!0)});class ut extends Error{code;constructor(e,t){super(t);this.name="ServiceError",this.code=e}}var qo=ee({error:ee({code:_(),message:_()})}),Qo=(e)=>{try{return JSON.parse(e)}catch{return null}},Dn=(e)=>{let t=async(r,n,o,s)=>{let a;try{a=await e.serviceRequest({method:r,path:n,body:s===void 0?void 0:JSON.stringify(s)})}catch(u){throw new ut("no-service",u instanceof M&&u.code==="NO_SERVICE"?"Allow the local service for this extension in Settings, Extensions.":"Could not reach the local service.")}let c=Qo(a.body);if(a.status>=400){let u=qo.safeParse(c);throw new ut(u.success?u.data.error.code:"unknown",u.success?u.data.error.message:"The local service refused the request.")}let d=o.safeParse(c);if(!d.success)throw new ut("bad-answer","The local service answered with something this panel does not understand.");return d.data};return{state:()=>t("GET","/state",xe),patchConfig:(r)=>t("PUT","/config",xe,r),rotateKey:()=>t("POST","/api-key/rotate",xe,{}),refreshModels:()=>t("POST","/models/refresh",xe,{}),testModel:(r)=>t("POST","/models/test",Un,{modelId:r}),register:()=>t("POST","/register",xe,{}),unregister:()=>t("POST","/unregister",xe,{}),relaySource:(r)=>t("GET",`/relays/${r}`,Gn),createProxyPool:(r)=>t("POST","/proxy-pools",xe,r),updateProxyPool:(r,n)=>t("PUT",`/proxy-pools/${r}`,xe,n),deleteProxyPool:(r)=>t("DELETE",`/proxy-pools/${r}`,xe),testProxyPool:(r)=>t("POST",`/proxy-pools/${r}/test`,$n,{}),deployCloudflare:(r)=>t("POST","/proxy-pools/cloudflare-deploy",xe,r),deployVercel:(r)=>t("POST","/proxy-pools/vercel-deploy",xe,r),deployDeno:(r)=>t("POST","/proxy-pools/deno-deploy",xe,r),deployNetlify:(r)=>t("POST","/proxy-pools/netlify-deploy",xe,r)}};var jn=(e)=>{let t=null,r="",n=!1,o=new Set,s=()=>{for(let u of o)u()},a=(u)=>u instanceof ut?u.message:u instanceof Error?u.message:String(u),c=async(u)=>{n=!0,s();try{t=await u(e),r=""}catch(b){r=a(b)}finally{n=!1,s()}};return{state:()=>t,error:()=>r,busy:()=>n,subscribe:(u)=>{o.add(u)},load:()=>c((u)=>u.state()),poll:async()=>{if(n)return;try{t=await e.state(),r="",s()}catch{}},run:c}};var zn=`
* { box-sizing: border-box; }
html, body {
  margin: 0;
  min-height: 100%;
  background: var(--oc-bg);
  color: var(--oc-fg);
  font-family: var(--oc-font);
  font-size: 13px;
  line-height: 1.5;
}
button, input, textarea { font: inherit; color: inherit; }
[hidden] { display: none !important; }

.br-root {
  max-width: 920px;
  margin: 0 auto;
  padding: 16px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Header */
.br-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--oc-border);
}
.br-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.br-logo-box {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: var(--oc-elevated);
  border: 1px solid var(--oc-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.br-header-titles {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.br-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.br-title-row h1 {
  margin: 0;
  font-size: 15px;
  font-weight: 650;
  letter-spacing: -0.015em;
  color: var(--oc-fg);
}
.br-header-sub {
  margin: 0;
  font-size: 11px;
  color: var(--oc-muted);
}
.br-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Status Badges */
.br-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid transparent;
  white-space: nowrap;
}
.br-badge-running {
  background: color-mix(in srgb, var(--oc-success) 12%, transparent);
  color: var(--oc-success-text);
  border-color: color-mix(in srgb, var(--oc-success) 24%, transparent);
}
.br-badge-stopped {
  background: color-mix(in srgb, var(--oc-error) 12%, transparent);
  color: var(--oc-error-text);
  border-color: color-mix(in srgb, var(--oc-error) 24%, transparent);
}
.br-badge-neutral {
  background: var(--oc-muted-surface);
  color: var(--oc-muted);
  border-color: var(--oc-border);
}
.br-badge-primary {
  background: color-mix(in srgb, var(--oc-primary) 12%, transparent);
  color: var(--oc-primary);
  border-color: color-mix(in srgb, var(--oc-primary) 24%, transparent);
}
.br-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.br-dot.on { background: var(--oc-success-text); }
.br-dot.off { background: var(--oc-error-text); }

/* Navigation Toolbar */
.br-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

/* Clean Cards */
.br-card {
  background: var(--oc-elevated, var(--oc-muted-surface));
  border: 1px solid var(--oc-border);
  border-radius: var(--oc-radius, 10px);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.br-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.br-card-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--oc-fg);
}
.br-card-desc {
  margin: 2px 0 0;
  font-size: 11.5px;
  color: var(--oc-muted);
}

/* KV Grid & Boxes */
.br-kv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 10px;
}
.br-kv-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--oc-bg);
  border: 1px solid var(--oc-border);
  border-radius: 8px;
  padding: 10px 12px;
}
.br-kv-label {
  font-size: 11px;
  color: var(--oc-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.br-kv-val {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}
.br-kv-text {
  font-family: var(--oc-mono);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--oc-fg);
}

/* Custom minimal buttons */
.br-btn {
  all: unset;
  box-sizing: border-box;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid var(--oc-border);
  background: var(--oc-bg);
  color: var(--oc-fg);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: background 0.12s ease;
}
.br-btn:hover:not(:disabled) {
  background: var(--oc-hover);
}
.br-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.br-btn.primary {
  background: var(--oc-primary);
  color: var(--oc-primary-fg);
  border-color: var(--oc-primary);
}
.br-btn.primary:hover:not(:disabled) {
  opacity: 0.9;
}
.br-btn.destructive {
  background: color-mix(in srgb, var(--oc-error) 12%, transparent);
  color: var(--oc-error-text);
  border-color: color-mix(in srgb, var(--oc-error) 24%, transparent);
}
.br-btn.destructive:hover:not(:disabled) {
  background: color-mix(in srgb, var(--oc-error) 20%, transparent);
}

/* Proxy Pool Items */
.br-strategy-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--oc-bg);
  border: 1px solid var(--oc-border);
  margin-bottom: 4px;
}
.br-strategy-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.br-strategy-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--oc-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.br-strategy-tabs {
  display: inline-flex;
  border: 1px solid var(--oc-border);
  border-radius: 6px;
  background: var(--oc-muted-surface);
  padding: 2px;
  gap: 2px;
}
.br-strategy-tab {
  all: unset;
  box-sizing: border-box;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--oc-muted);
  transition: all 0.12s ease;
}
.br-strategy-tab:hover {
  color: var(--oc-fg);
}
.br-strategy-tab.active {
  background: var(--oc-bg);
  color: var(--oc-fg);
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
}
.br-sticky-control {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--oc-muted);
}
.br-sticky-input {
  width: 44px;
  padding: 2px 6px;
  font-size: 11px;
  font-family: var(--oc-mono);
  text-align: center;
  border-radius: 4px;
  border: 1px solid var(--oc-border);
  background: var(--oc-bg);
  color: var(--oc-fg);
  outline: none;
}
.br-sticky-input:focus {
  border-color: var(--oc-focus);
}

.br-pool-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
}
.br-pool-card {
  border: 1px solid var(--oc-border);
  border-radius: 8px;
  background: var(--oc-bg);
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: border-color 0.15s ease;
}
.br-pool-card.active {
  border-color: var(--oc-primary);
  background: color-mix(in srgb, var(--oc-primary) 3%, var(--oc-bg));
}
.br-pool-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.br-pool-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.br-pool-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.br-pool-name {
  font-weight: 600;
  font-size: 12.5px;
  color: var(--oc-fg);
}
.br-pool-url {
  font-family: var(--oc-mono);
  font-size: 11px;
  color: var(--oc-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.br-pool-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* Deploy Form Box */
.br-deploy-box {
  border: 1px dashed var(--oc-border);
  border-radius: 8px;
  padding: 12px 14px;
  background: var(--oc-bg);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.br-deploy-nav {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--oc-border);
}
.br-deploy-tab {
  all: unset;
  box-sizing: border-box;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--oc-muted);
  background: transparent;
  transition: all 0.1s ease;
}
.br-deploy-tab.active {
  color: var(--oc-fg);
  background: var(--oc-muted-surface);
  font-weight: 600;
}

/* Model Search & List */
.br-search-input {
  width: 100%;
  box-sizing: border-box;
  font: inherit;
  font-size: 12px;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid var(--oc-border);
  background: var(--oc-bg);
  color: var(--oc-fg);
  outline: none;
}
.br-search-input:focus {
  border-color: var(--oc-focus);
}
.br-models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 8px;
  max-height: 440px;
  overflow-y: auto;
  padding: 2px;
}
.br-model-card {
  border: 1px solid var(--oc-border);
  border-radius: 7px;
  background: var(--oc-bg);
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  transition: all 0.12s ease;
}
.br-model-card:hover {
  background: var(--oc-hover);
}
.br-model-card.selected {
  border-color: var(--oc-primary);
  background: color-mix(in srgb, var(--oc-primary) 5%, var(--oc-bg));
}
.br-model-card-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.br-model-name {
  font-weight: 550;
  font-size: 12px;
  color: var(--oc-fg);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.br-model-id {
  font-family: var(--oc-mono);
  font-size: 10.5px;
  color: var(--oc-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.br-model-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* Recent Calls Feed */
.br-call-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--oc-border) 40%, transparent);
  font-size: 12px;
}
.br-call-row:last-child {
  border-bottom: none;
}
.br-call-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.br-call-name {
  font-family: var(--oc-mono);
  font-size: 11px;
  color: var(--oc-fg);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.br-call-ms {
  color: var(--oc-muted);
  font-size: 11px;
  font-family: var(--oc-mono);
  flex-shrink: 0;
}

/* OpenCode View */
.br-opencode-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 8px;
  background: var(--oc-bg);
  border: 1px solid var(--oc-border);
}
.br-opencode-desc {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.br-json-block {
  font-family: var(--oc-mono);
  font-size: 11px;
  line-height: 1.5;
  background: var(--oc-bg);
  border: 1px solid var(--oc-border);
  border-radius: 8px;
  padding: 10px 12px;
  margin: 0;
  max-height: 240px;
  overflow: auto;
  color: var(--oc-fg);
  white-space: pre-wrap;
  word-break: break-all;
}

/* General Layout Utilities */
.br-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.br-row.between {
  justify-content: space-between;
}
.br-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.br-mono {
  font-family: var(--oc-mono);
}
.br-muted {
  color: var(--oc-muted);
}
`;var p=(e,t="",r="")=>{let n=document.createElement(e);if(t)n.className=t;if(r)n.textContent=r;return n},Bn=(e,t="")=>{let r=p("div",`br-row ${t}`.trim());return e.append(r),r},He=(e,t="")=>{let r=p("div",`br-stack ${t}`.trim());return e.append(r),r},Ee=(e,t,r)=>{let n=p("section","br-card"),o=p("header","br-card-header"),s=p("div"),a=p("h3","br-card-title",t);if(s.append(a),r){let c=p("p","br-card-desc",r);s.append(c)}return o.append(s),n.append(o),e.append(n),{card:n,body:n}},J=(e,t,r,n="default")=>{let o=p("button",`br-btn ${n!=="default"?n:""}`.trim(),t);return o.type="button",o.addEventListener("click",r),e.append(o),o};var Zo=(e)=>e===null?"never":new Date(e).toLocaleTimeString(),Hn=(e)=>{if(e>=1e6){if(e===1e6||e===1048576)return"1M";let t=e/1e6;return`${t.toFixed(t%1===0?0:1)}M`}if(e>=1000){if(e%1000===0)return`${e/1000}k`;return`${Math.round(e/1024)}k`}return`${e}`},Vn=(e,t,r)=>{let n=He(document.createElement("div")),o="",s="",a=null,c={},d=(E)=>E.config.selectedModels.length>0?E.config.selectedModels:E.models.map((x)=>x.id),u=async(E)=>{o="",await e.run((x)=>x.patchConfig({selectedModels:E})),k()},b=(E,x,w)=>{let z=d(E);if(!w&&z.length<=1){o="Keep at least one free model selected so OpenCode has an endpoint to call.",k();return}let pe=w?[...z,x]:z.filter((me)=>me!==x);u(pe)},Y=(E)=>{u(E.models.map((x)=>x.id))},j=(E)=>{if(E.models.length>0)u([E.models[0].id])},K=async()=>{if(o="",await e.run((E)=>E.refreshModels()),e.error())await r.toast({kind:"error",message:e.error()});k()},k=()=>{n.replaceChildren();let E=e.state();if(!E)return;let{card:x}=Ee(n,"OpenCode Zen Free Catalog","Select the free models OpenCode and clients can call. Paid models are filtered out.");if(E.modelsError){let P=p("div");Se(P,{tone:"warning",title:"Could not refresh catalog",body:E.modelsError}),x.append(P)}if(o){let P=p("div");Se(P,{tone:"error",title:"Selection notice",body:o}),x.append(P)}if(E.models.length===0){bt(x,{title:"No free models detected",body:"Refresh the list. If it stays empty, check the upstream and any relay configured.",action:{label:"Refresh",onClick:()=>void K()}});return}let w=p("input","br-search-input");w.type="text",w.placeholder="Search free models by name or id...",w.value=s,w.oninput=()=>{s=w.value.toLowerCase(),q()},x.append(w);let z=p("div","br-row between"),pe=d(E),me=p("span","br-muted br-mono",`${pe.length} of ${E.models.length} active · Updated ${Zo(E.modelsFetchedAt)}`);z.append(me);let W=p("div","br-row");J(W,"Select All",()=>Y(E)),J(W,"Reset",()=>j(E)),J(W,"Refresh List",()=>void K()),z.append(W),x.append(z);let _e=p("div","br-models-grid");x.append(_e);let q=()=>{_e.replaceChildren();let P=E.models.filter((m)=>m.id.toLowerCase().includes(s)||m.name.toLowerCase().includes(s));if(P.length===0){let m=p("p","br-muted","No free models match your filter.");_e.append(m);return}for(let m of P){let v=pe.includes(m.id),se=p("div",`br-model-card ${v?"selected":""}`),ue=p("div","br-model-card-info");ue.append(p("span","br-model-name",m.name)),ue.append(p("span","br-model-id",m.id));let ae=p("div","br-row");ae.style.gap="4px",ae.style.marginTop="4px";let i=m.limit?.context?Hn(m.limit.context):"128k";if(ae.append(p("span","br-badge br-badge-neutral",`${i} ctx`)),m.limit?.output){let ie=Hn(m.limit.output);ae.append(p("span","br-badge br-badge-neutral",`${ie} out`))}if(m.capabilities?.input?.includes("image"))ae.append(p("span","br-badge br-badge-neutral","Vision"));if(m.variants&&m.variants.length>0)ae.append(p("span","br-badge br-badge-running","Thinking"));if(m.capabilities?.tools)ae.append(p("span","br-badge br-badge-neutral","Tools"));ue.append(ae),se.append(ue);let l=p("div","br-model-right"),A=c[m.id];if(A)if(A.ok)l.append(p("span","br-badge br-badge-running",`${A.elapsedMs??0}ms ✓`));else{let ie=p("span","br-badge br-badge-stopped","Failed ✗");ie.title=A.error||"Test failed",l.append(ie)}let I=a===m.id,V=J(l,I?"Testing...":"Test",async(ie)=>{ie.stopPropagation(),a=m.id,q();try{let Z=await t.testModel(m.id);if(c[m.id]=Z,Z.ok)await r.toast({kind:"success",message:`${m.name}: Test passed (${Z.elapsedMs??0}ms). "${Z.reply?.slice(0,40)||"OK"}"`});else await r.toast({kind:"error",message:`${m.name}: ${Z.error||"Test failed."}`})}catch(Z){c[m.id]={ok:!1,modelId:m.id,error:String(Z)},await r.toast({kind:"error",message:Z instanceof Error?Z.message:String(Z)})}finally{a=null,q()}});V.disabled=I;let N=p("div");Mr(N,{label:"",checked:v,onChange:(ie)=>b(E,m.id,ie)}),l.append(N),se.append(l),se.onclick=(ie)=>{if(ie.target.closest("input, button"))return;b(E,m.id,!v)},_e.append(se)}};q()};return{element:n,render:k}};var Fn=(e,t)=>{let r=He(document.createElement("div")),n=!1,o=async(c,d)=>{try{await t.writeClipboard(c),await t.toast({kind:"success",message:`${d} copied.`})}catch{await t.toast({kind:"error",message:"Failed to copy."})}},s=async(c,d)=>{if(n=!1,await e.run(c),e.error())await t.toast({kind:"error",message:e.error()});else await t.toast({kind:"success",message:d});a()},a=()=>{r.replaceChildren();let c=e.state();if(!c)return;let{card:d}=Ee(r,"OpenCode Provider Registration","BlackRouter registers this local endpoint directly into OpenCode’s configuration file.");for(let z of c.warnings){let pe=p("div");Se(pe,{tone:"warning",title:"File warning",body:z}),d.append(pe)}let u=p("div","br-opencode-hero"),b=p("div","br-opencode-desc"),Y=p("span",`br-badge ${c.registration.installed?"br-badge-running":"br-badge-neutral"}`,c.registration.installed?"Registered":"Not Registered"),j=p("div","br-row");j.append(Y),j.append(p("span","br-mono",c.registration.path)),b.append(j);let K=p("span","br-muted",c.registration.installed?`${c.registration.models} free model${c.registration.models===1?"":"s"} registered in OpenCode config.`:"Click register to add BlackRouter into your active OpenCode configuration.");b.append(K),u.append(b);let k=p("div","br-row");if(c.registration.installed)J(k,"Update Provider",()=>void s((z)=>z.register(),"Provider updated in OpenCode config."),"primary"),J(k,n?"Confirm Remove?":"Remove",()=>{if(!n){n=!0,a();return}s((z)=>z.unregister(),"Provider removed from OpenCode config.")},n?"destructive":"default");else{let z=J(k,"Register in OpenCode",()=>void s((pe)=>pe.register(),"Provider added to OpenCode config."),"primary");z.disabled=c.models.length===0}u.append(k),d.append(u);let{card:E}=Ee(r,"Config Block Preview","The exact JSON configuration written to OpenCode."),x=p("pre","br-json-block",c.preview);E.append(x);let w=p("div","br-row");J(w,"Copy JSON Block",()=>void o(c.preview,"Config block")),E.append(w)};return{element:r,render:a}};var es=[{id:"cloudflare",label:"Cloudflare Worker"},{id:"vercel",label:"Vercel Edge"},{id:"deno",label:"Deno Deploy"},{id:"netlify",label:"Netlify Function"},{id:"http",label:"Forward Proxy"}],Xn=(e,t,r)=>{let n=He(document.createElement("div")),o=!1,s="cloudflare",a=!1,c="",d=null,u={name:"",type:"http",proxyUrl:""},b={accountId:"",apiToken:"",projectName:""},Y={vercelToken:"",projectName:""},j={denoToken:"",orgDomain:"",projectName:""},K={netlifyToken:"",projectName:""},k=async(m,v)=>{try{await r.writeClipboard(m),await r.toast({kind:"success",message:`${v} copied.`})}catch{c="The clipboard refused the copy.",P()}},E=async(m)=>{try{let v=await t.relaySource(m);await k(v.code,`${m} relay code`)}catch(v){await r.toast({kind:"error",message:v instanceof Error?v.message:String(v)})}},x=async()=>{a=!0,c="",P();try{if(s==="http"){if(!u.name.trim()||!u.proxyUrl.trim())throw Error("Name and Proxy URL are required.");await e.run((m)=>m.createProxyPool({name:u.name.trim(),type:"http",proxyUrl:u.proxyUrl.trim(),isActive:!0})),u.name="",u.proxyUrl=""}else if(s==="cloudflare"){if(!b.accountId.trim()||!b.apiToken.trim())throw Error("Cloudflare Account ID and API Token are required.");await e.run((m)=>m.deployCloudflare({accountId:b.accountId.trim(),apiToken:b.apiToken.trim(),projectName:b.projectName.trim()||void 0})),b.accountId="",b.apiToken="",b.projectName=""}else if(s==="vercel"){if(!Y.vercelToken.trim())throw Error("Vercel API Token is required.");await e.run((m)=>m.deployVercel({vercelToken:Y.vercelToken.trim(),projectName:Y.projectName.trim()||void 0})),Y.vercelToken="",Y.projectName=""}else if(s==="deno"){if(!j.denoToken.trim()||!j.orgDomain.trim())throw Error("Deno Deploy Token and Organization Domain are required.");await e.run((m)=>m.deployDeno({denoToken:j.denoToken.trim(),orgDomain:j.orgDomain.trim(),projectName:j.projectName.trim()||void 0})),j.denoToken="",j.orgDomain="",j.projectName=""}else if(s==="netlify"){if(!K.netlifyToken.trim())throw Error("Netlify API Token is required.");await e.run((m)=>m.deployNetlify({netlifyToken:K.netlifyToken.trim(),projectName:K.projectName.trim()||void 0})),K.netlifyToken="",K.projectName=""}o=!1,await r.toast({kind:"success",message:"Relay configured and activated."})}catch(m){c=m instanceof Error?m.message:String(m)}finally{a=!1,P()}},w=async(m)=>{await e.run((v)=>v.updateProxyPool(m.id,{isActive:!m.isActive}))},z=async(m)=>{await e.run((v)=>v.patchConfig({proxyStrategy:m})),await r.toast({kind:"info",message:`Routing strategy set to ${m}.`})},pe=async(m)=>{await e.run((v)=>v.patchConfig({stickyLimit:m}))},me=async(m)=>{let v=e.state();if(!v)return;let se=v.config.proxyPools.map((ue)=>({...ue,isActive:ue.id===m.id}));await e.run((ue)=>ue.patchConfig({proxyPools:se,activePoolId:m.id,proxyStrategy:"single"})),await r.toast({kind:"success",message:`${m.name} set as primary route.`})},W=async()=>{let m=e.state();if(!m)return;let v=m.config.proxyPools.map((se)=>({...se,isActive:!1}));await e.run((se)=>se.patchConfig({activePoolId:null,proxyPools:v})),await r.toast({kind:"info",message:"Switched to direct routing."})},_e=async(m)=>{await e.run((v)=>v.deleteProxyPool(m)),await r.toast({kind:"success",message:"Proxy pool removed."})},q=async(m)=>{d=m,P();try{let v=await t.testProxyPool(m);if(await e.load(),v.ok)await r.toast({kind:"success",message:`Relay test passed (${v.elapsedMs||0}ms).`});else await r.toast({kind:"error",message:v.error||"Relay test failed."})}catch(v){await r.toast({kind:"error",message:v instanceof Error?v.message:String(v)})}finally{d=null,P()}},P=()=>{n.replaceChildren();let m=e.state();if(!m)return;let v=m.config.proxyStrategy||"single",se=m.config.stickyLimit??1,{card:ue}=Ee(n,"Upstream Routing & Strategy","Select whether calls go directly, through a dedicated relay, or load-balance across pools."),ae=p("div","br-strategy-toolbar"),i=p("div","br-strategy-group");i.append(p("span","br-strategy-label","Strategy:"));let l=p("div","br-strategy-tabs"),A=[{id:"single",label:"Single Pool"},{id:"round-robin",label:"Round-Robin"},{id:"random",label:"Random"}];for(let F of A){let G=p("button",`br-strategy-tab ${v===F.id?"active":""}`,F.label);G.onclick=()=>void z(F.id),l.append(G)}if(i.append(l),ae.append(i),v==="round-robin"){let F=p("div","br-sticky-control");F.append(p("span","","Sticky Turns:"));let G=p("input","br-sticky-input");G.type="number",G.min="1",G.max="100",G.value=String(se),G.onchange=()=>{let ce=Math.max(1,parseInt(G.value,10)||1);G.value=String(ce),pe(ce)},F.append(G),ae.append(F)}ue.append(ae);let I=m.config.proxyPools.filter((F)=>F.isActive),V=m.config.proxyPools.find((F)=>F.id===m.config.activePoolId)||m.config.proxyPools.find((F)=>F.isActive),N=p("div","br-pool-card active"),ie=p("div","br-pool-left"),Z=p("div","br-pool-info"),U=p("div","br-pool-title-row");if(v==="round-robin")U.append(p("span","br-pool-name","Round-Robin Load Balancing")),U.append(p("span",I.length>0?"br-badge br-badge-primary":"br-badge br-badge-stopped",`${I.length} Pools Active`)),Z.append(U),Z.append(p("span","br-pool-url",I.length>0?`Sequentially rotating across ${I.length} active relays with ${se} sticky turn(s) each.`:"No relays active in pool. Falling back to direct connection."));else if(v==="random")U.append(p("span","br-pool-name","Random Upstream Routing")),U.append(p("span",I.length>0?"br-badge br-badge-primary":"br-badge br-badge-stopped",`${I.length} Pools Active`)),Z.append(U),Z.append(p("span","br-pool-url",I.length>0?`Distributing requests uniformly at random across ${I.length} active relays.`:"No relays active in pool. Falling back to direct connection."));else if(V)U.append(p("span","br-pool-name",V.name)),U.append(p("span","br-badge br-badge-primary",V.type==="http"?"Forward Proxy":`${V.type} Relay`)),Z.append(U),Z.append(p("span","br-pool-url",V.proxyUrl));else U.append(p("span","br-pool-name","Direct Connection")),U.append(p("span","br-badge br-badge-neutral","Direct")),Z.append(U),Z.append(p("span","br-pool-url","Direct requests from this machine to https://opencode.ai/zen/v1"));ie.append(Z),N.append(ie);let ye=p("div","br-pool-actions");if(v==="single"&&V)J(ye,"Switch to Direct",()=>void W());if(J(ye,o?"Close Form":"+ Add / Deploy Relay",()=>{o=!o,c="",P()},o?"default":"primary"),N.append(ye),ue.append(N),o){let F=p("div","br-deploy-box");if(c){let D=p("div");Se(D,{tone:"error",title:"Deployment error",body:c}),F.append(D)}let G=p("div","br-deploy-nav");for(let D of es){let mt=p("button",`br-deploy-tab ${s===D.id?"active":""}`,D.label);mt.onclick=()=>{s=D.id,c="",P()},G.append(mt)}F.append(G);let ce=p("div","br-stack");if(F.append(ce),s==="cloudflare")be(ce,{label:"Account ID",value:b.accountId,placeholder:"Cloudflare dashboard -> Overview",onChange:(D)=>b.accountId=D}),be(ce,{label:"API Token",value:b.apiToken,password:!0,placeholder:"Cloudflare Workers edit permissions",onChange:(D)=>b.apiToken=D}),be(ce,{label:"Worker Name",value:b.projectName,placeholder:"blackrouter-relay (optional)",onChange:(D)=>b.projectName=D});else if(s==="vercel")be(ce,{label:"Vercel API Token",value:Y.vercelToken,password:!0,placeholder:"Account Settings -> Tokens",onChange:(D)=>Y.vercelToken=D}),be(ce,{label:"Project Name",value:Y.projectName,placeholder:"blackrouter-relay (optional)",onChange:(D)=>Y.projectName=D});else if(s==="deno")be(ce,{label:"Deno Access Token",value:j.denoToken,password:!0,placeholder:"Deno Deploy -> Access Tokens",onChange:(D)=>j.denoToken=D}),be(ce,{label:"Organization / Subdomain",value:j.orgDomain,placeholder:"your-org.deno.dev",onChange:(D)=>j.orgDomain=D}),be(ce,{label:"Project Name",value:j.projectName,placeholder:"blackrouter-relay (optional)",onChange:(D)=>j.projectName=D});else if(s==="netlify")be(ce,{label:"Netlify Personal Access Token",value:K.netlifyToken,password:!0,placeholder:"User Settings -> Applications",onChange:(D)=>K.netlifyToken=D}),be(ce,{label:"Site Name",value:K.projectName,placeholder:"blackrouter-relay (optional)",onChange:(D)=>K.projectName=D});else if(s==="http")be(ce,{label:"Proxy Name",value:u.name,placeholder:"e.g. Clash / Corporate Proxy",onChange:(D)=>u.name=D}),be(ce,{label:"Proxy URL",value:u.proxyUrl,placeholder:"http://127.0.0.1:7890 or http://user:pass@host:port",onChange:(D)=>u.proxyUrl=D});let We=p("div","br-row");if(J(We,a?"Saving...":s==="http"?"Add Proxy":"Deploy & Activate",()=>void x(),"primary"),s!=="http")J(We,"Copy Standalone Script",()=>void E(s));J(We,"Cancel",()=>{o=!1,P()}),F.append(We),n.append(F)}let{card:Ye}=Ee(n,"Configured Proxy Pools",v==="single"?'Manage deployed relays. Click "Set Primary" to route calls through that relay.':"Manage deployed relays. Toggle relays to include or exclude them from the active rotation pool.");if(m.config.proxyPools.length===0){let F=p("p","br-card-desc","No proxy pools configured. Deploy one using the button above to route through Cloudflare, Vercel, Deno, Netlify, or Forward Proxy.");Ye.append(F)}else{let F=p("div","br-pool-grid");for(let G of m.config.proxyPools){let ce=m.config.activePoolId?G.id===m.config.activePoolId:G.isActive,We=v==="single"?ce:G.isActive,D=p("div",`br-pool-card ${We?"active":""}`),mt=p("div","br-pool-left"),ir=p("div","br-pool-info"),ht=p("div","br-pool-title-row");if(ht.append(p("span","br-pool-name",G.name)),ht.append(p("span","br-badge br-badge-neutral",G.type==="http"?"Forward Proxy":`${G.type} Relay`)),G.testStatus==="active")ht.append(p("span","br-badge br-badge-running","Healthy"));else if(G.testStatus==="error")ht.append(p("span","br-badge br-badge-stopped","Failed"));ir.append(ht),ir.append(p("span","br-pool-url",G.proxyUrl)),mt.append(ir),D.append(mt);let qe=p("div","br-pool-actions");if(v==="single")J(qe,ce?"Primary ✓":"Set Primary",()=>void me(G),ce?"primary":"default");else J(qe,G.isActive?"In Rotation ✓":"Add to Rotation",()=>void w(G),G.isActive?"primary":"default");let rn=d===G.id,ro=J(qe,rn?"Testing...":"Test",()=>void q(G.id));if(ro.disabled=rn,G.type!=="http")J(qe,"Copy Script",()=>void E(G.type));J(qe,"Delete",()=>void _e(G.id),"destructive"),D.append(qe),F.append(D)}Ye.append(F)}};return{element:n,render:P}};var Kn=(e,t,r,n)=>{let o=He(document.createElement("div")),s="",a=!1,c=!1,d="",u=(k)=>{s=String(k.config.port)},b=async(k,E)=>{try{await r.writeClipboard(k),await r.toast({kind:"success",message:`${E} copied.`})}catch{d="The clipboard refused the copy.",K()}},Y=async()=>{let k=Number(s);if(!Number.isInteger(k)||k<1024||k>65535){d="The port must be a whole number between 1024 and 65535.",K();return}d="",await e.run((x)=>x.patchConfig({port:k}));let E=e.state();if(E)u(E);K()},j=async()=>{d="",await e.run((k)=>k.rotateKey()),await r.toast({kind:"success",message:"New API key generated and saved."}),K()},K=()=>{o.replaceChildren();let k=e.state();if(!k){if(e.error()){bt(o,{title:"Local service is not reachable",body:"Allow the local service for BlackRouter in Settings -> Extensions, then retry.",action:{label:"Retry",onClick:()=>{e.load()}}});return}let U=Bn(o);Ur(U,{label:"Connecting to local service..."});return}if(!a)u(k),a=!0;if(!k.running){let U=p("div");o.append(U),Se(U,{tone:"error",title:"Router listener is not active",body:k.routerError||"The listener did not start. Change the port below and save."})}if(d){let U=p("div");o.append(U),Se(U,{tone:"error",title:"Action failed",body:d})}let{card:E}=Ee(o,"Connection & Endpoint","OpenCode and any OpenAI-compatible client connect to this loopback address."),x=p("div","br-kv-grid");E.append(x);let w=p("div","br-kv-box");w.append(p("span","br-kv-label","Base URL (Endpoint)"));let z=p("div","br-kv-val");z.append(p("span","br-kv-text",k.endpoint)),J(z,"Copy URL",()=>void b(k.endpoint,"Endpoint")),w.append(z),x.append(w);let pe=p("div","br-kv-box");pe.append(p("span","br-kv-label","API Key"));let me=p("div","br-kv-val");me.append(p("span","br-kv-text",c?k.config.apiKey:`${k.config.apiKey.slice(0,7)}••••••••••••••••`));let W=p("div","br-row");J(W,c?"Hide":"Reveal",()=>{c=!c,K()}),J(W,"Copy",()=>void b(k.config.apiKey,"API key")),J(W,"Rotate",()=>void j()),me.append(W),pe.append(me),x.append(pe);let _e=p("div","br-kv-box");_e.append(p("span","br-kv-label","Listening Port"));let q=p("div","br-kv-val"),P=p("input","br-search-input br-mono");P.type="number",P.value=s,P.style.maxWidth="110px",P.oninput=()=>{s=P.value,m.disabled=s===String(k.config.port)},q.append(P);let m=J(q,"Save Port",()=>void Y(),"primary");m.disabled=s===String(k.config.port),_e.append(q),x.append(_e);let v=p("div","br-kv-box");v.append(p("span","br-kv-label","RTK Token Saver"));let se=p("div","br-kv-val");$r(se,{label:k.config.rtkEnabled!==!1?"Enabled":"Disabled",description:"Compacts git diff, status, and grep tool outputs (saves ~30% tokens)",checked:k.config.rtkEnabled!==!1,onChange:(U)=>{e.run((ye)=>ye.patchConfig({rtkEnabled:U}))}}),v.append(se),x.append(v);let{card:ue}=Ee(o,"Upstream Routing","Traffic to OpenCode Zen can route directly or through a serverless proxy pool."),ae=k.config.proxyStrategy||"single",i=k.config.proxyPools.filter((U)=>U.isActive),l=k.config.activePoolId?i.find((U)=>U.id===k.config.activePoolId)||i[0]:i[0],A=p("div","br-pool-card active"),I=p("div","br-pool-left"),V=p("div","br-pool-info"),N=p("div","br-pool-title-row");if(ae==="round-robin")N.append(p("span","br-pool-name","Round-Robin Rotation")),N.append(p("span","br-badge br-badge-running",`${i.length} Pools`)),V.append(N),V.append(p("span","br-pool-url",`Sequential rotation with sticky turn limit ${k.config.stickyLimit||1}`));else if(ae==="random")N.append(p("span","br-pool-name","Random Upstream Routing")),N.append(p("span","br-badge br-badge-primary",`${i.length} Pools`)),V.append(N),V.append(p("span","br-pool-url","Uniform random distribution across active proxy pools"));else if(l){N.append(p("span","br-pool-name",l.name));let U=p("span","br-badge br-badge-primary",l.type);N.append(U),V.append(N),V.append(p("span","br-pool-url",l.proxyUrl))}else{N.append(p("span","br-pool-name","Direct Routing"));let U=p("span","br-badge br-badge-neutral","Direct");N.append(U),V.append(N),V.append(p("span","br-pool-url","Direct requests from this machine to https://opencode.ai/zen/v1"))}I.append(V),A.append(I);let ie=p("div","br-pool-actions");if(n)J(ie,"Manage Proxy Pools",()=>n("proxy-pools"));A.append(ie),ue.append(A);let{card:Z}=Ee(o,"Recent Calls","The last requests answered by this router. Kept in memory.");if(k.requests.length===0){let U=p("p","br-card-desc","No requests yet. Calls from OpenCode or other clients will appear here.");Z.append(U)}else{let U=p("div");for(let ye of k.requests.slice(0,8)){let Ye=p("div","br-call-row"),F=p("div","br-call-left"),G=p("span",`br-badge ${ye.status>=200&&ye.status<300?"br-badge-running":"br-badge-stopped"}`,String(ye.status));if(F.append(G),F.append(p("span","br-call-name",ye.model||ye.path)),ye.poolName)F.append(p("span","br-badge br-badge-neutral",ye.poolName));Ye.append(F),Ye.append(p("span","br-call-ms",`${ye.ms}ms`)),U.append(Ye)}Z.append(U)}};return{element:o,render:K}};var ft=Ar(),Jn=document.querySelector("#root");if(!Jn)throw Error("Missing root");var Yn=document.createElement("style");Yn.textContent=zn;document.head.append(Yn);ft.onReady((e)=>Cr(e,document.documentElement));var or=Dn(ft),ve=jn(or),Mt=document.createElement("div");Mt.className="br-root";Jn.replaceChildren(Mt);var Fr=document.createElement("header");Fr.className="br-header";var Xr=document.createElement("div");Xr.className="br-header-left";var Kr=document.createElement("div");Kr.className="br-logo-box";Kr.textContent="⚡";var Jr=document.createElement("div");Jr.className="br-header-titles";var Yr=document.createElement("div");Yr.className="br-title-row";var Wn=document.createElement("h1");Wn.textContent="BlackRouter";var Nt=document.createElement("span");Nt.className="br-badge br-badge-neutral";Nt.textContent="Connecting...";Yr.append(Wn,Nt);var Wr=document.createElement("p");Wr.className="br-header-sub";Wr.textContent="OpenCode Zen Local Endpoint & Proxy Pools";Jr.append(Yr,Wr);Xr.append(Kr,Jr);var qr=document.createElement("div");qr.className="br-header-right";var ts=je(qr,{label:"Refresh",variant:"outline",size:"sm",onClick:()=>{ve.load()}});Fr.append(Xr,qr);Mt.append(Fr);var Qr=document.createElement("div");Qr.className="br-nav-bar";var qn=document.createElement("div");Qr.append(qn);Mt.append(Qr);var sr=document.createElement("main");sr.className="br-stack";Mt.append(sr);var ar=document.createElement("div");ar.hidden=!0;var rs=Se(ar,{tone:"error",title:""});sr.append(ar);var nr="router",Zr=null,en=(e)=>{nr=e,Zr?.update({activeId:nr});for(let r of tn)r.element.hidden=r.id!==e;let t=ve.state();if(e==="models"&&t&&t.models.length===0&&!ve.busy())ve.run((r)=>r.refreshModels())},Qn=Kn(ve,or,ft,(e)=>en(e)),Zn=Xn(ve,or,ft),eo=Vn(ve,or,ft),to=Fn(ve,ft),tn=[{id:"router",label:"Router",element:Qn.element},{id:"proxy-pools",label:"Proxy Pools",element:Zn.element},{id:"models",label:"Models",element:eo.element},{id:"opencode",label:"OpenCode",element:to.element}];for(let e of tn)sr.append(e.element);Zr=Lr(qn,{items:tn.map((e)=>({id:e.id,label:e.label})),activeId:nr,onChange:en});en("router");var ns=()=>{let e=ve.state();if(e){Nt.className=`br-badge ${e.running?"br-badge-running":"br-badge-stopped"}`,Nt.innerHTML=`<span class="br-dot ${e.running?"on":"off"}"></span> ${e.running?`127.0.0.1:${e.config.port}`:"Stopped"}`;let n=e.config.proxyPools.length,o=e.models.length,s=e.registration.installed;Zr?.update({activeId:nr,items:[{id:"router",label:"Router"},{id:"proxy-pools",label:n>0?`Proxy Pools (${n})`:"Proxy Pools"},{id:"models",label:o>0?`Models (${o})`:"Models"},{id:"opencode",label:s?"OpenCode ✓":"OpenCode"}]})}let t=ve.error(),r=Boolean(t)&&e!==null;if(ar.hidden=!r,t&&r)rs.update({tone:"error",title:"Local service notice",body:t});ts.update({loading:ve.busy()}),Qn.render(),Zn.render(),eo.render(),to.render()};ve.subscribe(ns);ve.load();setInterval(()=>{ve.poll()},30000);})();
