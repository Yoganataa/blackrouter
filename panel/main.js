(()=>{var Q="openchamber.sdk",Z=1;var _r=`
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
`;var Sr=128,Tr=65536;var ko=["file","directory","other","missing"],Er=(e)=>Boolean(e&&"sessionId"in e),Ar=(e)=>Boolean(e&&"sent"in e&&!("sessionId"in e));var Yt=500,Wt=32000,_o=16000,So=128,To=200,wo=2000,Eo=16000,Ao=80,Co=200,Ro=16000;var Po=2000;var Cr=20000,Qt=1024,Zt=2000000;var er=64000,tr=8000,Rr=4000;var Pr=90000;var Oo=999,rr=500,Mo=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED"],Io=["stopped","starting","ready","failed"],kn=new Set(Mo),No=(e)=>kn.has(e),Lo=(e)=>e&&No(e)?e:"HOST_REJECTED",ft=(e)=>{if(e===void 0)return!1;if(e===null||e===!0||e===!1)return!0;if(String(e)===e)return!0;if(Number(e)===e)return Number.isFinite(e);if(Array.isArray(e))return e.every(ft);if(Object(e)===e)return Object.values(e).every(ft);return!1},$o=(e)=>ft(e)&&JSON.stringify(e).length<=Ro,vo=(e)=>e?.trim().slice(0,Co)??"",ht=(e)=>{let t=e.id.trim().slice(0,So),r=e.title.trim().slice(0,To),o=e.url.trim().slice(0,wo),n=e.text?.trim().slice(0,Eo),s=e.author?.trim().slice(0,Ao),a=e.kind==="pull"?"pull":"issue",d={providerId:e.providerId.trim(),id:t,title:r||t,url:o,kind:a};if(n)d.text=n;if(s)d.author=s;if(a==="pull"){let l=vo(e.branches?.head),u=vo(e.branches?.base);if(l&&u)d.branches={head:l,base:u}}if($o(e.data))d.data=e.data;return d},Or=(e)=>{let t=ht(e);if(e.projectId)t.projectId=e.projectId;if(e.navigation)t.navigation=e.navigation;if(e.worktree)t.worktree=e.worktree;return t},Mr=(e)=>{let t={text:e.text.trim().slice(0,_o)};if(e.send)t.send=!0;return t},Ir=(e)=>{if(e===null||!Number.isFinite(e))return null;return Math.min(Oo,Math.max(0,Math.round(e)))};var gt=(e)=>e.length>0&&e.length<=Qt&&!e.includes("\x00")&&!e.includes("\\");var or=(e)=>{if(!e.startsWith("/")||e.includes("\x00")||e.includes("\\")||e.includes("://"))return!1;if(e.length>Po)return!1;return!e.split("/").some((r)=>r==="."||r==="..")},_n=new Set(Io),Nr=(e)=>Boolean(e&&"status"in e&&_n.has(String(e.status))&&!("body"in e)),nr=(e)=>Boolean(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Lr=(e)=>Boolean(e&&"content"in e&&String(e.content)===e.content),$r=(e)=>Boolean(e&&"written"in e&&e.written===!0),Ur=(e)=>Boolean(e&&"entries"in e&&Array.isArray(e.entries)),Sn=new Set(ko),Dr=(e)=>Boolean(e&&"kind"in e&&"size"in e&&Sn.has(String(e.kind))&&Number.isFinite(e.size)),Gr=(e)=>Boolean(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),Tn=new Set(["workspace","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action"]),wn=(e)=>Object(e)===e?e:null,wr=(e)=>String(e)===e&&e.length>0,En=(e)=>{if(!wr(e.id))return null;if(e.ok===!0){let t={channel:Q,v:Z,type:"result",id:e.id,ok:!0};if(Object(e.payload)===e.payload)t.payload=e.payload;return t}if(e.ok===!1&&wr(e.error))return{channel:Q,v:Z,type:"result",id:e.id,ok:!1,error:e.error,code:Lo(wr(e.code)?e.code:void 0)};return null},jr=(e)=>{let t=wn(e);if(!t||t.channel!==Q||t.v!==Z)return null;if(t.type==="result")return En(t);if(!Tn.has(String(t.type))||Object(t.payload)!==t.payload)return null;return t};class H extends Error{code;constructor(e,t){super(t);this.name="HostRequestError",this.code=e}}var Uo=()=>Promise.reject(new H("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),sr=()=>Promise.reject(new H("BAD_PATH",`File path must be 1 to ${Qt} characters without NUL or backslash.`)),te=(e)=>(e.value+=1,`oc-${e.value}`),zr=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new H("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let r=e.acceptSource??((i)=>i===t.parent),o=e.requestTimeoutMs??Cr,n=new Set,s=new Set,a=new Set,d=new Set,l=new Set,u=new Set,x=new Set,W=null,S=null,V=new Map,A=new Map,le=!1,P={value:0},D=null,oe=null,Te=(i)=>{if(!i)return null;return{sessionId:i.id,phase:i.busy?"started":"completed"}},we=(i)=>{t.parent.postMessage(i,"*")},ae=(i,p)=>{for(let E of i)try{E(p)}catch(G){console.error(G)}},Fe=(i)=>{if(!(i instanceof MessageEvent))return;if(!r(i.source))return;let p=jr(i.data);if(!p)return;if(p.type==="workspace"){let G=A.get(p.payload.subscriptionId);if(G)ae([G],p.payload.snapshot);return}if(p.type==="ready"){if(D=p.payload,oe=Te(p.payload.session),ae(n,p.payload),ae(s,p.payload.directory),ae(a,p.payload.session),oe)ae(d,oe);ae(l,p.payload.connection),ae(u,p.payload.settings),ae(x,p.payload.item);return}if(p.type==="directory"){if(D)D={...D,directory:p.payload.directory};ae(s,p.payload.directory);return}if(p.type==="session"){if(D)D={...D,session:p.payload.session};if(!p.payload.session)oe=null;else if(oe?.sessionId!==p.payload.session.id)oe=Te(p.payload.session);ae(a,p.payload.session);return}if(p.type==="session-lifecycle"){oe=p.payload,ae(d,p.payload);return}if(p.type==="connection"){if(D)D={...D,connection:p.payload.connection};ae(l,p.payload.connection);return}if(p.type==="settings"){if(D)D={...D,settings:p.payload.settings};ae(u,p.payload.settings);return}if(p.type==="item"){if(D)D={...D,item:p.payload.item};ae(x,p.payload.item);return}if(p.type==="action"){let G=(j)=>{if(!le)we({channel:Q,v:Z,type:"action-result",id:p.id,payload:j})},Y=S;if(!Y){G({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>Y(p.payload)).then(()=>G({ok:!0}),(j)=>{let ue=(j instanceof Error?j.message:String(j)).trim();G({ok:!1,error:(ue||"Action failed.").slice(0,rr)})});return}if(p.type==="resolve"){let G=(j)=>{we({channel:Q,v:Z,type:"resolve-result",id:p.id,payload:j})},Y=W;if(!Y){G({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>Y(p.payload)).then((j)=>G({item:j?ht(j):null}),(j)=>{let ue=(j instanceof Error?j.message:String(j)).trim();G({error:(ue||"Command failed.").slice(0,rr)})});return}let E=V.get(p.id);if(!E)return;if(clearTimeout(E.timer),V.delete(p.id),p.ok){E.resolve(p.payload);return}E.reject(new H(p.code,p.error))};t.addEventListener("message",Fe),we({channel:Q,v:Z,type:"hello"});let be=(i,p=o)=>{if(le||t.parent===t)return Promise.reject(new H("HOST_UNAVAILABLE","No host frame. This page is not in an iframe."));return new Promise((E,G)=>{let Y=setTimeout(()=>{V.delete(i.id),G(new H("HOST_TIMEOUT","Host did not answer in time."))},p);V.set(i.id,{resolve:E,reject:G,timer:Y}),we(i)})},q=(i)=>be(i).then(()=>{return}),h={channel:Q,v:Z},m=(i,p=1024)=>{if(!i.trim()||i.length>p)throw new H("HOST_REJECTED",`Identity must contain 1 to ${p} characters.`)},M=async(i)=>{if(i.kind!=="projects")m(i.projectId);let p=await be({...h,type:"workspace-read",id:te(P),payload:i});if(!p||!("kind"in p)||!("state"in p)||p.kind!==i.kind)throw new H("HOST_REJECTED","Host did not return workspace data.");return p},ee=async(i,p)=>{if(i.kind!=="projects")m(i.projectId);let E=te(P);A.set(E,p);try{await q({...h,type:"workspace-subscribe",id:te(P),payload:{subscriptionId:E,query:i}})}catch(G){if(A.delete(E),!le)we({...h,type:"workspace-unsubscribe",id:te(P),payload:{subscriptionId:E}});throw G}return()=>{if(!A.delete(E)||le)return;we({...h,type:"workspace-unsubscribe",id:te(P),payload:{subscriptionId:E}})}},pe=async(i)=>{if("key"in i&&(i.key.length===0||i.key.length>Sr))throw new H("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(i.op==="set"&&!ft(i.value))throw new H("HOST_REJECTED","Storage values must be JSON.");if(i.op==="set"&&new TextEncoder().encode(JSON.stringify(i.value)).length>Tr)throw new H("HOST_REJECTED","Storage value exceeds 64 KiB.");let p=await be({...h,type:"storage",id:te(P),payload:i});if(!p||!("storage"in p)||p.op!==i.op)throw new H("HOST_REJECTED","Host did not return storage data.");return p};return{onAction:(i)=>(S=i,()=>{if(S===i)S=null}),listProjects:async()=>{let i=await M({kind:"projects"});if(i.kind!=="projects")throw new H("HOST_REJECTED","Expected projects.");return i},listWorktrees:async(i)=>{let p=await M({kind:"worktrees",projectId:i});if(p.kind!=="worktrees")throw new H("HOST_REJECTED","Expected worktrees.");return p},listSessions:async(i)=>{let p=await M({kind:"sessions",projectId:i});if(p.kind!=="sessions")throw new H("HOST_REJECTED","Expected sessions.");return p},onProjects:(i)=>ee({kind:"projects"},(p)=>{if(p.kind==="projects")i(p)}),onWorktrees:(i,p)=>ee({kind:"worktrees",projectId:i},(E)=>{if(E.kind==="worktrees")p(E)}),onSessions:(i,p)=>ee({kind:"sessions",projectId:i},(E)=>{if(E.kind==="sessions")p(E)}),openSession:async(i)=>{m(i),await q({...h,type:"open-session",id:te(P),payload:{sessionId:i}})},storage:{get:async(i)=>{let p=await pe({op:"get",key:i});return p.op==="get"&&p.found?p.value:void 0},set:async(i,p)=>{await pe({op:"set",key:i,value:p})},delete:async(i)=>{await pe({op:"delete",key:i})},keys:async()=>{let i=await pe({op:"keys"});if(i.op!=="keys")throw new H("HOST_REJECTED","Expected storage keys.");return i.keys}},onReady:(i)=>{if(n.add(i),D)i(D);return()=>{n.delete(i)}},onDirectory:(i)=>{if(s.add(i),D)i(D.directory);return()=>{s.delete(i)}},onSession:(i)=>{if(a.add(i),D)i(D.session);return()=>{a.delete(i)}},onSessionLifecycle:(i)=>{if(d.add(i),oe)i(oe);return()=>{d.delete(i)}},onConnection:(i)=>{if(l.add(i),D)i(D.connection);return()=>{l.delete(i)}},onSettings:(i)=>{if(u.add(i),D)i(D.settings);return()=>{u.delete(i)}},onItem:(i)=>{if(x.add(i),D)i(D.item);return()=>{x.delete(i)}},onResolve:(i)=>(W=i,()=>{if(W===i)W=null}),toast:(i)=>{let p=i.message.trim();if(!p||p.length>Yt)return Promise.reject(new H("HOST_REJECTED",`Toast message must contain 1 to ${Yt} characters.`));if(i.copy&&i.copy!==!0&&(!i.copy.text.length||i.copy.text.length>Wt))return Promise.reject(new H("HOST_REJECTED",`Toast copy text must contain 1 to ${Wt} characters.`));return q({channel:Q,v:Z,type:"toast",id:te(P),payload:{...i,message:p}})},openUrl:(i)=>q({channel:Q,v:Z,type:"open-url",id:te(P),payload:{url:i}}),openSurface:(i)=>q({channel:Q,v:Z,type:"open-surface",id:te(P),payload:{surfaceId:i}}),writeClipboard:(i)=>q({channel:Q,v:Z,type:"clipboard-write",id:te(P),payload:{text:i}}),compose:(i)=>q({channel:Q,v:Z,type:"compose",id:te(P),payload:i}),attach:(i)=>q({channel:Q,v:Z,type:"attach",id:te(P),payload:ht(i)}),startSession:async(i)=>{if(i.projectId!==void 0)m(i.projectId);let p=i.worktree;if(p&&p!==!0)if(p.kind==="existing")m(p.directory);else{if(p.name!==void 0)m(p.name,200);if(p.baseBranch!==void 0)m(p.baseBranch,200)}let E=await be({channel:Q,v:Z,type:"start-session",id:te(P),payload:Or(i)},e.requestTimeoutMs??180000);if(!Er(E))throw new H("HOST_REJECTED","Host did not return a session.");return E},prompt:(i)=>be({channel:Q,v:Z,type:"prompt",id:te(P),payload:Mr(i)}).then((p)=>{if(!Ar(p))throw new H("HOST_REJECTED","Host did not return a prompt result.");return p}),sessionLink:(i)=>q({channel:Q,v:Z,type:"session-link",id:te(P),payload:ht(i)}),close:()=>q({channel:Q,v:Z,type:"close",id:te(P)}),oauthStart:()=>q({channel:Q,v:Z,type:"oauth-start",id:te(P)}),oauthDisconnect:()=>q({channel:Q,v:Z,type:"oauth-disconnect",id:te(P)}),request:(i)=>(or(i.path)?be({channel:Q,v:Z,type:"request",id:te(P),payload:i}):Uo()).then((p)=>{if(!nr(p))throw new H("HOST_REJECTED","Host request result was empty.");return p}),serviceRequest:(i)=>(or(i.path)?be({channel:Q,v:Z,type:"service-request",id:te(P),payload:i}):Uo()).then((p)=>{if(!nr(p))throw new H("HOST_REJECTED","Host service request result was empty.");return p}),serviceStatus:()=>be({channel:Q,v:Z,type:"service-status",id:te(P)}).then((i)=>{if(!Nr(i))throw new H("HOST_REJECTED","Host did not return service status.");return i}),readFile:(i)=>(gt(i)?be({channel:Q,v:Z,type:"file-read",id:te(P),payload:{path:i}}):sr()).then((p)=>{if(!Lr(p))throw new H("HOST_REJECTED","Host did not return file content.");return p}),writeFile:(i,p)=>{if(!gt(i))return sr();if(p.length>Zt)return Promise.reject(new H("FILE_TOO_LARGE",`Content is over ${Zt} characters.`));return be({channel:Q,v:Z,type:"file-write",id:te(P),payload:{path:i,content:p}}).then((E)=>{if(!$r(E))throw new H("HOST_REJECTED","Host did not confirm the write.");return E})},listDir:(i)=>(gt(i)?be({channel:Q,v:Z,type:"file-list",id:te(P),payload:{path:i}}):sr()).then((p)=>{if(!Ur(p))throw new H("HOST_REJECTED","Host did not return directory entries.");return p}),stat:(i)=>(gt(i)?be({channel:Q,v:Z,type:"file-stat",id:te(P),payload:{path:i}}):sr()).then((p)=>{if(!Dr(p))throw new H("HOST_REJECTED","Host did not return file status.");return p}),generate:(i)=>{let p=i.prompt.trim(),E=i.system?.trim();if(p.length===0||p.length>er)return Promise.reject(new H("HOST_REJECTED",`Prompt must be 1 to ${er} characters.`));if(E!==void 0&&(E.length===0||E.length>tr))return Promise.reject(new H("HOST_REJECTED",`System prompt must be 1 to ${tr} characters.`));let G=i.maxOutputTokens===void 0?void 0:Math.min(Rr,Math.max(1,Math.floor(i.maxOutputTokens)));if(G!==void 0&&!Number.isFinite(G))return Promise.reject(new H("HOST_REJECTED","maxOutputTokens must be a number."));let Y={prompt:p};if(E!==void 0)Y.system=E;if(G!==void 0)Y.maxOutputTokens=G;return be({channel:Q,v:Z,type:"generate",id:te(P),payload:Y},e.requestTimeoutMs??Pr).then((j)=>{if(!Gr(j))throw new H("HOST_REJECTED","Host did not return generated text.");return j})},setBadge:(i)=>q({channel:Q,v:Z,type:"badge",id:te(P),payload:{count:Ir(i)}}),dispose:()=>{for(let i of A.keys())we({...h,type:"workspace-unsubscribe",id:te(P),payload:{subscriptionId:i}});A.clear(),le=!0,W=null,S=null,t.removeEventListener("message",Fe);for(let i of V.values())clearTimeout(i.timer),i.reject(new H("HOST_UNAVAILABLE","Host client was disposed."));V.clear(),n.clear(),s.clear(),a.clear(),d.clear(),l.clear(),u.clear(),x.clear()}}};var An=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Do=(e,t)=>{t.style.colorScheme=e.mode;for(let[r,o]of An)t.style.setProperty(r,e.tokens[o]);t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size","0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},Br=(e,t)=>{if(Do(e.theme,t),t.dataset)t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode};var bt=(e)=>{while(e.firstChild)e.removeChild(e.firstChild)},me=(e)=>{let t=document.getElementById("oc-sdk-ui-style");if(t instanceof HTMLStyleElement){if(t.textContent!==e)t.textContent=e;return}let r=document.createElement("style");r.id="oc-sdk-ui-style",r.textContent=e,document.head.appendChild(r)},U=(e,t)=>{let r=document.createElement(e);if(t)r.className=t;return r},Ke=(e)=>{let t=U("button",e);return t.type="button",t},_e=(e,t)=>{let r=t??"";if(e.textContent!==r)e.textContent=r},yt=(e,t,r)=>{if(r===void 0||r===null||r==="")e.removeAttribute(t);else if(e.getAttribute(t)!==r)e.setAttribute(t,r)};var Cn={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},ie=(e,t)=>`var(--${e}, var(--oc-${Cn[e]}, ${t}))`,dt=ie("surface-background","transparent"),ar=ie("surface-elevated","transparent"),Pt=ie("surface-elevated-foreground","inherit"),Ot=ie("surface-foreground","inherit"),fe=ie("surface-muted-foreground","gray"),Rn=ie("surface-muted","transparent"),je=ie("interactive-border","currentColor"),Ue=ie("interactive-hover","transparent"),lt=ie("interactive-active","transparent"),Hr=ie("interactive-selection","transparent"),Vr=ie("interactive-selection-foreground","inherit"),zo=ie("interactive-focus-ring","currentColor"),Be=ie("primary","currentColor"),Fr=ie("primary-text","inherit"),Xr=ie("error-text","inherit"),Pn=ie("font-sans","inherit"),Kr=ie("font-mono","monospace"),Go=ie("radius","9px"),Se=(e,t,r="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${r})`,jo=`box-shadow: 0 0 0 2px ${zo};`,ir=(e)=>{let t=ie(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${ie(`${e}-text`,"inherit")}; }`},he=`
${_r}
.oc-sdk { box-sizing: border-box; color: ${Ot}; font-family: ${Pn}; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }
.oc-sdk :focus-visible { outline: none; ${jo} }
.oc-sdk-mono { font-family: ${Kr}; }
.oc-sdk-muted { color: ${fe}; }
${ir("success")}${ir("warning")}${ir("error")}${ir("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${Be}; --oc-sdk-tone-text: ${Fr}; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 36px; padding: 0 14px; border: 1px solid transparent; border-radius: ${Go}; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="sm"] { height: 32px; padding: 0 10px; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { height: 24px; padding: 0 8px; font-size: 0.75rem; border-radius: 6px; }
.oc-sdk-btn[data-variant="default"] { color: ${Fr}; background: ${Se(Be,10,dt)}; border-color: ${Se(Be,12)}; }
.oc-sdk-btn[data-variant="default"]:hover { background: ${Se(Be,16,dt)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${Se(Be,22,dt)}; }
.oc-sdk-btn[data-variant="secondary"] { background: ${Rn}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${Ue}, ${Ue}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${lt}, ${lt}); }
.oc-sdk-btn[data-variant="outline"] { background: ${ar}; color: ${Pt}; border-color: ${je}; }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${Ue}, ${Ue}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${lt}, ${lt}); }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${Ue}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${lt}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${ie("status-error","red")}; color: ${Xr}; background: ${Se("var(--oc-sdk-tone)",7,dt)}; border-color: ${Se("var(--oc-sdk-tone)",12)}; }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${Se("var(--oc-sdk-tone)",9,dt)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${Se("var(--oc-sdk-tone)",11,dt)}; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: 14px; height: 14px; }

.oc-sdk-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; color: ${fe}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Xr}; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: 36px; padding: 0 12px; border: 0; border-radius: ${Go}; background: ${ar}; color: ${Pt}; font-size: 0.875rem; line-height: 1.45; appearance: none; box-shadow: inset 0 0 0 1px ${Se(je,60)}; transition: background 150ms ease-out, box-shadow 150ms ease-out; }
textarea.oc-sdk-input { height: auto; padding: 8px 12px; resize: vertical; }
.oc-sdk-input::placeholder { color: ${fe}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${Ue}, ${Ue}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { box-shadow: inset 0 0 0 2px ${zo}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input { box-shadow: inset 0 0 0 1px ${ie("status-error","red")}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { box-shadow: inset 0 0 0 2px ${ie("status-error","red")}; }
.oc-sdk-input[data-mono="true"] { font-family: ${Kr}; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: 34px; padding-right: 34px; }
.oc-sdk-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: ${fe}; pointer-events: none; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${Be}; }
.oc-sdk-search-clear { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; color: ${fe}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }
.oc-sdk-search-clear:hover { background: ${Ue}; color: ${Ot}; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: 6px; width: 100%; min-width: 0; height: 32px; padding: 0 8px 0 10px; border: 1px solid ${je}; border-radius: 6px; background: ${ar}; color: ${Pt}; font-size: 0.8125rem; text-align: left; transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${Ue}, ${Ue}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${lt}, ${lt}); }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-value[data-empty="true"] { color: ${fe}; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; color: ${fe}; }
.oc-sdk-popup { --surface-foreground: ${Pt}; position: fixed; z-index: 50; display: flex; flex-direction: column; gap: 2px; min-width: 160px; max-width: calc(100vw - 16px); max-height: min(320px, calc(100vh - 16px)); overflow: auto; padding: 4px; border: 1px solid ${Se(je,60)}; border-radius: 12px; background: ${ar}; color: ${Pt}; box-shadow: 0 8px 24px ${Se(Ot,12)}; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: 2px 2px 4px; }
.oc-sdk-popup-search .oc-sdk-input { height: 32px; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; border-radius: 8px; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option[data-active="true"] { background: ${Ue}; }
.oc-sdk-option[aria-selected="true"] { background: ${Hr}; color: ${Vr}; }
.oc-sdk-option[data-destructive="true"] { color: ${Xr}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${Se(ie("status-error","red"),10)}; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; color: ${fe}; }
.oc-sdk-option-check { flex: 0 0 auto; width: 12px; }
.oc-sdk-popup-empty { padding: 8px; font-size: 0.8125rem; color: ${fe}; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: 8px; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; margin-top: 3px; border: 1px solid ${je}; border-radius: 4px; color: ${Be}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${Se(Be,65,je)}; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: 36px; height: 20px; border-radius: 9999px; background: ${je}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 9999px; background: ${dt}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${Be}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${jo} }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; color: ${fe}; }

.oc-sdk-tabs { display: inline-flex; gap: 2px; padding: 2px; border-radius: 10px; max-width: 100%; overflow: auto; }
.oc-sdk-tabs[data-track="true"] { background: ${Se(Ot,4)}; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border: 1px solid transparent; border-radius: 8px; font-size: 0.8125rem; font-weight: 500; color: ${fe}; white-space: nowrap; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${Ot}; }
.oc-sdk-tab[aria-selected="true"] { color: ${Vr}; background: ${Hr}; border-color: ${je}; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; color: ${fe}; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: 1px 6px; border-radius: 9999px; font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; background: ${Ue}; color: ${fe}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${Se("var(--oc-sdk-tone)",15)}; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; border-radius: 6px; text-align: left; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${Ue}; }
.oc-sdk-row[aria-selected="true"] { background: ${Hr}; color: ${Vr}; }
.oc-sdk-row-lead { flex: 0 0 auto; width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: ${Kr}; font-size: 0.75rem; color: ${fe}; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; color: ${fe}; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; color: ${fe}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { padding: 16px 8px; text-align: center; font-size: 0.8125rem; color: ${fe}; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 40px 16px; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; color: ${fe}; }
.oc-sdk-empty-action { margin-top: 12px; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: ${fe}; }
.oc-sdk-spinner-ring { width: 16px; height: 16px; border: 2px solid ${je}; border-top-color: ${Be}; border-radius: 9999px; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: 12px; height: 12px; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: 12px; padding: 8px 12px; border: 1px solid ${Se("var(--oc-sdk-tone)",40)}; border-radius: 8px; background: ${Se("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { font-size: 0.8125rem; color: ${fe}; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: 8px; width: 100%; margin: 8px 0; font-size: 0.75rem; color: ${fe}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; background: ${Se(je,40)}; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: 4px 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; color: ${fe}; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: 6px; border-radius: 9999px; background: ${je}; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; border-radius: 9999px; background: var(--oc-sdk-tone, ${Be}); transform-origin: left; transition: transform 200ms ease-out; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text a { color: ${Fr}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { display: block; max-width: 100%; margin: 8px 0; border-radius: 8px; border: 1px solid ${Se(je,60)}; }
`;var On=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},st=(e,t)=>{me(he);let r=t,o=Ke("oc-sdk oc-sdk-btn"),n=On(),s=document.createElement("span");o.append(s),e.append(o);let a=()=>{if(o.dataset.variant=r.variant??"default",o.dataset.size=r.size??"default",o.disabled=Boolean(r.disabled)||Boolean(r.loading),o.dataset.loading=r.loading?"true":"false",o.setAttribute("aria-busy",r.loading?"true":"false"),r.loading&&n.parentNode!==o)o.prepend(n);else if(!r.loading&&n.parentNode===o)n.remove();_e(s,r.label)},d=()=>{if(r.disabled||r.loading)return;r.onClick()};return o.addEventListener("click",d),a(),{update:(l)=>{r={...r,...l},a()},dispose:()=>{o.removeEventListener("click",d),o.remove()}}};var Ne=(e,t)=>{me(he);let r=t,o=U("label","oc-sdk oc-sdk-field"),n=U("span","oc-sdk-field-label"),s=r.multiline?U("textarea","oc-sdk-input"):U("input","oc-sdk-input"),a=U("span","oc-sdk-field-note");o.append(n,s,a),e.append(o);let d=()=>{if(_e(n,r.label),n.hidden=!r.label,s instanceof HTMLInputElement)s.type=r.password?"password":"text";else s.rows=r.rows??3;if(s.value!==r.value)s.value=r.value;s.disabled=Boolean(r.disabled),yt(s,"placeholder",r.placeholder),s.dataset.mono=r.mono?"true":"false";let u=Boolean(r.error);o.dataset.invalid=u?"true":"false",s.setAttribute("aria-invalid",u?"true":"false");let x=r.error??r.helper??"";_e(a,x),a.hidden=x===""},l=()=>{r.onChange(s.value)};return s.addEventListener("input",l),d(),{update:(u)=>{r={...r,...u},d()},dispose:()=>{s.removeEventListener("input",l),o.remove()}}};var Mn={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},cr=(e,t,r)=>{let o=document.createElementNS("http://www.w3.org/2000/svg","svg");if(o.setAttribute("viewBox","0 0 24 24"),o.setAttribute("width",String(t)),o.setAttribute("height",String(t)),o.setAttribute("aria-hidden","true"),o.setAttribute("fill","currentColor"),r)o.setAttribute("class",r);let n=document.createElementNS("http://www.w3.org/2000/svg","path");return n.setAttribute("d",Mn[e]),o.append(n),o};var xt=(e,t="vertical")=>{let[r,o]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];if(e.key===r||e.ctrlKey&&e.key.toLowerCase()==="n")return"next";if(e.key===o||e.ctrlKey&&e.key.toLowerCase()==="p")return"previous";if(e.key==="Home")return"first";if(e.key==="End")return"last";return null},vt=(e,t,r)=>{let o=e.filter((l)=>!l.disabled);if(o.length===0)return null;let n=o[0],s=o[o.length-1];if(r==="first"||!n||!s)return n?.id??null;if(r==="last")return s.id;let a=o.findIndex((l)=>l.id===t);if(a===-1)return r==="next"?n.id:s.id;return o[Math.min(o.length-1,Math.max(0,a+(r==="next"?1:-1)))]?.id??null};var Bo=(e,t,r)=>{me(he);let o=t,n=Ke("oc-sdk oc-sdk-check");n.setAttribute("role",r);let s=U("span",r==="switch"?"oc-sdk-check-thumb":"oc-sdk-check-box");if(r==="checkbox")s.append(cr("check",12));let a=U("span","oc-sdk-check-text"),d=U("span","oc-sdk-check-label"),l=U("span","oc-sdk-check-desc");a.append(d,l),n.append(s,a),e.append(n);let u=()=>{n.setAttribute("aria-checked",o.checked?"true":"false"),n.disabled=Boolean(o.disabled),_e(d,o.label),_e(l,o.description),l.hidden=!o.description},x=()=>{if(!o.disabled)o.onChange(!o.checked)};return n.addEventListener("click",x),u(),{update:(W)=>{o={...o,...W},u()},dispose:()=>{n.removeEventListener("click",x),n.remove()}}},Jr=(e,t)=>Bo(e,t,"checkbox"),qr=(e,t)=>Bo(e,t,"switch");var Yr=(e,t)=>{me(he);let r=t,o=U("div","oc-sdk oc-sdk-tabs");o.setAttribute("role","tablist"),e.append(o);let n=()=>{bt(o),o.dataset.track=r.trackBackground?"true":"false";for(let a of r.items){let d=Ke("oc-sdk-tab");d.setAttribute("role","tab");let l=a.id===r.activeId;d.setAttribute("aria-selected",l?"true":"false"),d.tabIndex=l?0:-1,d.dataset.id=a.id;let u=U("span");if(u.textContent=a.label,d.append(u),a.count!==void 0){let x=U("span","oc-sdk-tab-count");x.textContent=String(a.count),d.append(x)}d.addEventListener("click",()=>{if(a.id!==r.activeId)r.onChange(a.id)}),o.append(d)}},s=(a)=>{let d=xt(a,"horizontal");if(!d)return;let l=vt(r.items,r.activeId,d);if(l&&l!==r.activeId){a.preventDefault(),r.onChange(l);let u=o.querySelector(`[data-id="${CSS.escape(l)}"]`);if(u instanceof HTMLElement)u.focus()}};return o.addEventListener("keydown",s),n(),{update:(a)=>{r={...r,...a},n()},dispose:()=>{o.removeEventListener("keydown",s),o.remove()}}};var Mt=(e,t)=>{me(he);let r=t,o=U("div","oc-sdk oc-sdk-empty"),n=U("h2","oc-sdk-empty-title"),s=U("p","oc-sdk-empty-body"),a=U("div","oc-sdk-empty-action");o.append(n,s,a),e.append(o);let d=null,l=()=>{if(_e(n,r.title),_e(s,r.body),s.hidden=!r.body,a.hidden=!r.action,!r.action){d?.dispose(),d=null;return}let u={label:r.action.label,onClick:r.action.onClick};if(d)d.update(u);else d=st(a,{...u,variant:"outline",size:"sm"})};return l(),{update:(u)=>{r={...r,...u},l()},dispose:()=>{d?.dispose(),d=null,o.remove()}}};var Wr=(e,t={})=>{me(he);let r=t,o=U("span","oc-sdk oc-sdk-spinner");o.setAttribute("role","status");let n=U("span","oc-sdk-spinner-ring");n.setAttribute("aria-hidden","true");let s=U("span");o.append(n,s),e.append(o);let a=()=>{o.dataset.size=r.size??"default",_e(s,r.label),s.hidden=!r.label,o.setAttribute("aria-label",r.label??"Loading")};return a(),{update:(d)=>{r={...r,...d},a()},dispose:()=>{o.remove()}}};var De=(e,t)=>{me(he);let r=t,o=U("div","oc-sdk oc-sdk-banner"),n=U("div","oc-sdk-banner-text"),s=U("div","oc-sdk-banner-title"),a=U("div","oc-sdk-banner-body"),d=U("div","oc-sdk-banner-action");n.append(s,a),o.append(n,d),e.append(o);let l=null,u=()=>{if(o.dataset.tone=r.tone,o.setAttribute("role",r.tone==="error"||r.tone==="warning"?"alert":"status"),_e(s,r.title),_e(a,r.body),a.hidden=!r.body,d.hidden=!r.action,!r.action){l?.dispose(),l=null;return}let x={label:r.action.label,onClick:r.action.onClick};if(l)l.update(x);else l=st(d,{...x,variant:"outline",size:"xs"})};return u(),{update:(x)=>{r={...r,...x},u()},dispose:()=>{l?.dispose(),l=null,o.remove()}}};var F;(function(e){e.assertEqual=(n)=>{};function t(n){}e.assertIs=t;function r(n){throw Error()}e.assertNever=r,e.arrayToEnum=(n)=>{let s={};for(let a of n)s[a]=a;return s},e.getValidEnumValues=(n)=>{let s=e.objectKeys(n).filter((d)=>typeof n[n[d]]!=="number"),a={};for(let d of s)a[d]=n[d];return e.objectValues(a)},e.objectValues=(n)=>e.objectKeys(n).map(function(s){return n[s]}),e.objectKeys=typeof Object.keys==="function"?(n)=>Object.keys(n):(n)=>{let s=[];for(let a in n)if(Object.prototype.hasOwnProperty.call(n,a))s.push(a);return s},e.find=(n,s)=>{for(let a of n)if(s(a))return a;return},e.isInteger=typeof Number.isInteger==="function"?(n)=>Number.isInteger(n):(n)=>typeof n==="number"&&Number.isFinite(n)&&Math.floor(n)===n;function o(n,s=" | "){return n.map((a)=>typeof a==="string"?`'${a}'`:a).join(s)}e.joinValues=o,e.jsonStringifyReplacer=(n,s)=>{if(typeof s==="bigint")return s.toString();return s}})(F||(F={}));var Ho;(function(e){e.mergeShapes=(t,r)=>({...t,...r})})(Ho||(Ho={}));var y=F.arrayToEnum(["string","nan","number","integer","float","boolean","date","bigint","symbol","function","undefined","null","array","object","unknown","promise","void","never","map","set"]),We=(e)=>{switch(typeof e){case"undefined":return y.undefined;case"string":return y.string;case"number":return Number.isNaN(e)?y.nan:y.number;case"boolean":return y.boolean;case"function":return y.function;case"bigint":return y.bigint;case"symbol":return y.symbol;case"object":if(Array.isArray(e))return y.array;if(e===null)return y.null;if(e.then&&typeof e.then==="function"&&e.catch&&typeof e.catch==="function")return y.promise;if(typeof Map<"u"&&e instanceof Map)return y.map;if(typeof Set<"u"&&e instanceof Set)return y.set;if(typeof Date<"u"&&e instanceof Date)return y.date;return y.object;default:return y.unknown}};var f=F.arrayToEnum(["invalid_type","invalid_literal","custom","invalid_union","invalid_union_discriminator","invalid_enum_value","unrecognized_keys","invalid_arguments","invalid_return_type","invalid_date","invalid_string","too_small","too_big","invalid_intersection_types","not_multiple_of","not_finite"]);class Ge extends Error{get errors(){return this.issues}constructor(e){super();this.issues=[],this.addIssue=(r)=>{this.issues=[...this.issues,r]},this.addIssues=(r=[])=>{this.issues=[...this.issues,...r]};let t=new.target.prototype;if(Object.setPrototypeOf)Object.setPrototypeOf(this,t);else this.__proto__=t;this.name="ZodError",this.issues=e}format(e){let t=e||function(n){return n.message},r={_errors:[]},o=(n)=>{for(let s of n.issues)if(s.code==="invalid_union")s.unionErrors.map(o);else if(s.code==="invalid_return_type")o(s.returnTypeError);else if(s.code==="invalid_arguments")o(s.argumentsError);else if(s.path.length===0)r._errors.push(t(s));else{let a=r,d=0;while(d<s.path.length){let l=s.path[d];if(d!==s.path.length-1)a[l]=a[l]||{_errors:[]};else a[l]=a[l]||{_errors:[]},a[l]._errors.push(t(s));a=a[l],d++}}};return o(this),r}static assert(e){if(!(e instanceof Ge))throw Error(`Not a ZodError: ${e}`)}toString(){return this.message}get message(){return JSON.stringify(this.issues,F.jsonStringifyReplacer,2)}get isEmpty(){return this.issues.length===0}flatten(e=(t)=>t.message){let t={},r=[];for(let o of this.issues)if(o.path.length>0){let n=o.path[0];t[n]=t[n]||[],t[n].push(e(o))}else r.push(e(o));return{formErrors:r,fieldErrors:t}}get formErrors(){return this.flatten()}}Ge.create=(e)=>new Ge(e);var Un=(e,t)=>{let r;switch(e.code){case f.invalid_type:if(e.received===y.undefined)r="Required";else r=`Expected ${e.expected}, received ${e.received}`;break;case f.invalid_literal:r=`Invalid literal value, expected ${JSON.stringify(e.expected,F.jsonStringifyReplacer)}`;break;case f.unrecognized_keys:r=`Unrecognized key(s) in object: ${F.joinValues(e.keys,", ")}`;break;case f.invalid_union:r="Invalid input";break;case f.invalid_union_discriminator:r=`Invalid discriminator value. Expected ${F.joinValues(e.options)}`;break;case f.invalid_enum_value:r=`Invalid enum value. Expected ${F.joinValues(e.options)}, received '${e.received}'`;break;case f.invalid_arguments:r="Invalid function arguments";break;case f.invalid_return_type:r="Invalid function return type";break;case f.invalid_date:r="Invalid date";break;case f.invalid_string:if(typeof e.validation==="object")if("includes"in e.validation){if(r=`Invalid input: must include "${e.validation.includes}"`,typeof e.validation.position==="number")r=`${r} at one or more positions greater than or equal to ${e.validation.position}`}else if("startsWith"in e.validation)r=`Invalid input: must start with "${e.validation.startsWith}"`;else if("endsWith"in e.validation)r=`Invalid input: must end with "${e.validation.endsWith}"`;else F.assertNever(e.validation);else if(e.validation!=="regex")r=`Invalid ${e.validation}`;else r="Invalid";break;case f.too_small:if(e.type==="array")r=`Array must contain ${e.exact?"exactly":e.inclusive?"at least":"more than"} ${e.minimum} element(s)`;else if(e.type==="string")r=`String must contain ${e.exact?"exactly":e.inclusive?"at least":"over"} ${e.minimum} character(s)`;else if(e.type==="number")r=`Number must be ${e.exact?"exactly equal to ":e.inclusive?"greater than or equal to ":"greater than "}${e.minimum}`;else if(e.type==="bigint")r=`Number must be ${e.exact?"exactly equal to ":e.inclusive?"greater than or equal to ":"greater than "}${e.minimum}`;else if(e.type==="date")r=`Date must be ${e.exact?"exactly equal to ":e.inclusive?"greater than or equal to ":"greater than "}${new Date(Number(e.minimum))}`;else r="Invalid input";break;case f.too_big:if(e.type==="array")r=`Array must contain ${e.exact?"exactly":e.inclusive?"at most":"less than"} ${e.maximum} element(s)`;else if(e.type==="string")r=`String must contain ${e.exact?"exactly":e.inclusive?"at most":"under"} ${e.maximum} character(s)`;else if(e.type==="number")r=`Number must be ${e.exact?"exactly":e.inclusive?"less than or equal to":"less than"} ${e.maximum}`;else if(e.type==="bigint")r=`BigInt must be ${e.exact?"exactly":e.inclusive?"less than or equal to":"less than"} ${e.maximum}`;else if(e.type==="date")r=`Date must be ${e.exact?"exactly":e.inclusive?"smaller than or equal to":"smaller than"} ${new Date(Number(e.maximum))}`;else r="Invalid input";break;case f.custom:r="Invalid input";break;case f.invalid_intersection_types:r="Intersection results could not be merged";break;case f.not_multiple_of:r=`Number must be a multiple of ${e.multipleOf}`;break;case f.not_finite:r="Number must be finite";break;default:r=t.defaultError,F.assertNever(e)}return{message:r}},at=Un;var Dn=at;function It(){return Dn}var dr=(e)=>{let{data:t,path:r,errorMaps:o,issueData:n}=e,s=[...r,...n.path||[]],a={...n,path:s};if(n.message!==void 0)return{...n,path:s,message:n.message};let d="",l=o.filter((u)=>!!u).slice().reverse();for(let u of l)d=u(a,{data:t,defaultError:d}).message;return{...n,path:s,message:d}};function b(e,t){let r=It(),o=dr({issueData:t,data:e.data,path:e.path,errorMaps:[e.common.contextualErrorMap,e.schemaErrorMap,r,r===at?void 0:at].filter((n)=>!!n)});e.common.issues.push(o)}class Ae{constructor(){this.value="valid"}dirty(){if(this.value==="valid")this.value="dirty"}abort(){if(this.value!=="aborted")this.value="aborted"}static mergeArray(e,t){let r=[];for(let o of t){if(o.status==="aborted")return C;if(o.status==="dirty")e.dirty();r.push(o.value)}return{status:e.value,value:r}}static async mergeObjectAsync(e,t){let r=[];for(let o of t){let n=await o.key,s=await o.value;r.push({key:n,value:s})}return Ae.mergeObjectSync(e,r)}static mergeObjectSync(e,t){let r={};for(let o of t){let{key:n,value:s}=o;if(n.status==="aborted")return C;if(s.status==="aborted")return C;if(n.status==="dirty")e.dirty();if(s.status==="dirty")e.dirty();if(n.value!=="__proto__"&&(typeof s.value<"u"||o.alwaysSet))r[n.value]=s.value}return{status:e.value,value:r}}}var C=Object.freeze({status:"aborted"}),kt=(e)=>({status:"dirty",value:e}),Pe=(e)=>({status:"valid",value:e}),Qr=(e)=>e.status==="aborted",Zr=(e)=>e.status==="dirty",pt=(e)=>e.status==="valid",Nt=(e)=>typeof Promise<"u"&&e instanceof Promise;var v;(function(e){e.errToObj=(t)=>typeof t==="string"?{message:t}:t||{},e.toString=(t)=>typeof t==="string"?t:t?.message})(v||(v={}));class He{constructor(e,t,r,o){this._cachedPath=[],this.parent=e,this.data=t,this._path=r,this._key=o}get path(){if(!this._cachedPath.length)if(Array.isArray(this._key))this._cachedPath.push(...this._path,...this._key);else this._cachedPath.push(...this._path,this._key);return this._cachedPath}}var Vo=(e,t)=>{if(pt(t))return{success:!0,data:t.value};else{if(!e.common.issues.length)throw Error("Validation failed but no issues detected.");return{success:!1,get error(){if(this._error)return this._error;let r=new Ge(e.common.issues);return this._error=r,this._error}}}};function I(e){if(!e)return{};let{errorMap:t,invalid_type_error:r,required_error:o,description:n}=e;if(t&&(r||o))throw Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);if(t)return{errorMap:t,description:n};return{errorMap:(a,d)=>{let{message:l}=e;if(a.code==="invalid_enum_value")return{message:l??d.defaultError};if(typeof d.data>"u")return{message:l??o??d.defaultError};if(a.code!=="invalid_type")return{message:d.defaultError};return{message:l??r??d.defaultError}},description:n}}class B{get description(){return this._def.description}_getType(e){return We(e.data)}_getOrReturnCtx(e,t){return t||{common:e.parent.common,data:e.data,parsedType:We(e.data),schemaErrorMap:this._def.errorMap,path:e.path,parent:e.parent}}_processInputParams(e){return{status:new Ae,ctx:{common:e.parent.common,data:e.data,parsedType:We(e.data),schemaErrorMap:this._def.errorMap,path:e.path,parent:e.parent}}}_parseSync(e){let t=this._parse(e);if(Nt(t))throw Error("Synchronous parse encountered promise.");return t}_parseAsync(e){let t=this._parse(e);return Promise.resolve(t)}parse(e,t){let r=this.safeParse(e,t);if(r.success)return r.data;throw r.error}safeParse(e,t){let r={common:{issues:[],async:t?.async??!1,contextualErrorMap:t?.errorMap},path:t?.path||[],schemaErrorMap:this._def.errorMap,parent:null,data:e,parsedType:We(e)},o=this._parseSync({data:e,path:r.path,parent:r});return Vo(r,o)}"~validate"(e){let t={common:{issues:[],async:!!this["~standard"].async},path:[],schemaErrorMap:this._def.errorMap,parent:null,data:e,parsedType:We(e)};if(!this["~standard"].async)try{let r=this._parseSync({data:e,path:[],parent:t});return pt(r)?{value:r.value}:{issues:t.common.issues}}catch(r){if(r?.message?.toLowerCase()?.includes("encountered"))this["~standard"].async=!0;t.common={issues:[],async:!0}}return this._parseAsync({data:e,path:[],parent:t}).then((r)=>pt(r)?{value:r.value}:{issues:t.common.issues})}async parseAsync(e,t){let r=await this.safeParseAsync(e,t);if(r.success)return r.data;throw r.error}async safeParseAsync(e,t){let r={common:{issues:[],contextualErrorMap:t?.errorMap,async:!0},path:t?.path||[],schemaErrorMap:this._def.errorMap,parent:null,data:e,parsedType:We(e)},o=this._parse({data:e,path:r.path,parent:r}),n=await(Nt(o)?o:Promise.resolve(o));return Vo(r,n)}refine(e,t){let r=(o)=>{if(typeof t==="string"||typeof t>"u")return{message:t};else if(typeof t==="function")return t(o);else return t};return this._refinement((o,n)=>{let s=e(o),a=()=>n.addIssue({code:f.custom,...r(o)});if(typeof Promise<"u"&&s instanceof Promise)return s.then((d)=>{if(!d)return a(),!1;else return!0});if(!s)return a(),!1;else return!0})}refinement(e,t){return this._refinement((r,o)=>{if(!e(r))return o.addIssue(typeof t==="function"?t(r,o):t),!1;else return!0})}_refinement(e){return new Ye({schema:this,typeName:R.ZodEffects,effect:{type:"refinement",refinement:e}})}superRefine(e){return this._refinement(e)}constructor(e){this.spa=this.safeParseAsync,this._def=e,this.parse=this.parse.bind(this),this.safeParse=this.safeParse.bind(this),this.parseAsync=this.parseAsync.bind(this),this.safeParseAsync=this.safeParseAsync.bind(this),this.spa=this.spa.bind(this),this.refine=this.refine.bind(this),this.refinement=this.refinement.bind(this),this.superRefine=this.superRefine.bind(this),this.optional=this.optional.bind(this),this.nullable=this.nullable.bind(this),this.nullish=this.nullish.bind(this),this.array=this.array.bind(this),this.promise=this.promise.bind(this),this.or=this.or.bind(this),this.and=this.and.bind(this),this.transform=this.transform.bind(this),this.brand=this.brand.bind(this),this.default=this.default.bind(this),this.catch=this.catch.bind(this),this.describe=this.describe.bind(this),this.pipe=this.pipe.bind(this),this.readonly=this.readonly.bind(this),this.isNullable=this.isNullable.bind(this),this.isOptional=this.isOptional.bind(this),this["~standard"]={version:1,vendor:"zod",validate:(t)=>this["~validate"](t)}}optional(){return qe.create(this,this._def)}nullable(){return it.create(this,this._def)}nullish(){return this.nullable().optional()}array(){return Je.create(this)}promise(){return Et.create(this,this._def)}or(e){return Gt.create([this,e],this._def)}and(e){return jt.create(this,e,this._def)}transform(e){return new Ye({...I(this._def),schema:this,typeName:R.ZodEffects,effect:{type:"transform",transform:e}})}default(e){let t=typeof e==="function"?e:()=>e;return new Vt({...I(this._def),innerType:this,defaultValue:t,typeName:R.ZodDefault})}brand(){return new oo({typeName:R.ZodBranded,type:this,...I(this._def)})}catch(e){let t=typeof e==="function"?e:()=>e;return new Ft({...I(this._def),innerType:this,catchValue:t,typeName:R.ZodCatch})}describe(e){return new this.constructor({...this._def,description:e})}pipe(e){return br.create(this,e)}readonly(){return Xt.create(this)}isOptional(){return this.safeParse(void 0).success}isNullable(){return this.safeParse(null).success}}var Gn=/^c[^\s-]{8,}$/i,jn=/^[0-9a-z]+$/,zn=/^[0-9A-HJKMNP-TV-Z]{26}$/i,Bn=/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i,Hn=/^[a-z0-9_-]{21}$/i,Vn=/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,Fn=/^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/,Xn=/^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i,Kn="^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$",eo,Jn=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,qn=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,Yn=/^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,Wn=/^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,Qn=/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,Zn=/^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,Fo="((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))",es=new RegExp(`^${Fo}$`);function Xo(e){let t="[0-5]\\d";if(e.precision)t=`${t}\\.\\d{${e.precision}}`;else if(e.precision==null)t=`${t}(\\.\\d+)?`;let r=e.precision?"+":"?";return`([01]\\d|2[0-3]):[0-5]\\d(:${t})${r}`}function ts(e){return new RegExp(`^${Xo(e)}$`)}function rs(e){let t=`${Fo}T${Xo(e)}`,r=[];if(r.push(e.local?"Z?":"Z"),e.offset)r.push("([+-]\\d{2}:?\\d{2})");return t=`${t}(${r.join("|")})`,new RegExp(`^${t}$`)}function os(e,t){if((t==="v4"||!t)&&Jn.test(e))return!0;if((t==="v6"||!t)&&Yn.test(e))return!0;return!1}function ns(e,t){if(!Vn.test(e))return!1;try{let[r]=e.split(".");if(!r)return!1;let o=r.replace(/-/g,"+").replace(/_/g,"/").padEnd(r.length+(4-r.length%4)%4,"="),n=JSON.parse(atob(o));if(typeof n!=="object"||n===null)return!1;if("typ"in n&&n?.typ!=="JWT")return!1;if(!n.alg)return!1;if(t&&n.alg!==t)return!1;return!0}catch{return!1}}function ss(e,t){if((t==="v4"||!t)&&qn.test(e))return!0;if((t==="v6"||!t)&&Wn.test(e))return!0;return!1}class Ze extends B{_parse(e){if(this._def.coerce)e.data=String(e.data);if(this._getType(e)!==y.string){let n=this._getOrReturnCtx(e);return b(n,{code:f.invalid_type,expected:y.string,received:n.parsedType}),C}let r=new Ae,o=void 0;for(let n of this._def.checks)if(n.kind==="min"){if(e.data.length<n.value)o=this._getOrReturnCtx(e,o),b(o,{code:f.too_small,minimum:n.value,type:"string",inclusive:!0,exact:!1,message:n.message}),r.dirty()}else if(n.kind==="max"){if(e.data.length>n.value)o=this._getOrReturnCtx(e,o),b(o,{code:f.too_big,maximum:n.value,type:"string",inclusive:!0,exact:!1,message:n.message}),r.dirty()}else if(n.kind==="length"){let s=e.data.length>n.value,a=e.data.length<n.value;if(s||a){if(o=this._getOrReturnCtx(e,o),s)b(o,{code:f.too_big,maximum:n.value,type:"string",inclusive:!0,exact:!0,message:n.message});else if(a)b(o,{code:f.too_small,minimum:n.value,type:"string",inclusive:!0,exact:!0,message:n.message});r.dirty()}}else if(n.kind==="email"){if(!Xn.test(e.data))o=this._getOrReturnCtx(e,o),b(o,{validation:"email",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="emoji"){if(!eo)eo=new RegExp(Kn,"u");if(!eo.test(e.data))o=this._getOrReturnCtx(e,o),b(o,{validation:"emoji",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="uuid"){if(!Bn.test(e.data))o=this._getOrReturnCtx(e,o),b(o,{validation:"uuid",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="nanoid"){if(!Hn.test(e.data))o=this._getOrReturnCtx(e,o),b(o,{validation:"nanoid",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="cuid"){if(!Gn.test(e.data))o=this._getOrReturnCtx(e,o),b(o,{validation:"cuid",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="cuid2"){if(!jn.test(e.data))o=this._getOrReturnCtx(e,o),b(o,{validation:"cuid2",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="ulid"){if(!zn.test(e.data))o=this._getOrReturnCtx(e,o),b(o,{validation:"ulid",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="url")try{new URL(e.data)}catch{o=this._getOrReturnCtx(e,o),b(o,{validation:"url",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="regex"){if(n.regex.lastIndex=0,!n.regex.test(e.data))o=this._getOrReturnCtx(e,o),b(o,{validation:"regex",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="trim")e.data=e.data.trim();else if(n.kind==="includes"){if(!e.data.includes(n.value,n.position))o=this._getOrReturnCtx(e,o),b(o,{code:f.invalid_string,validation:{includes:n.value,position:n.position},message:n.message}),r.dirty()}else if(n.kind==="toLowerCase")e.data=e.data.toLowerCase();else if(n.kind==="toUpperCase")e.data=e.data.toUpperCase();else if(n.kind==="startsWith"){if(!e.data.startsWith(n.value))o=this._getOrReturnCtx(e,o),b(o,{code:f.invalid_string,validation:{startsWith:n.value},message:n.message}),r.dirty()}else if(n.kind==="endsWith"){if(!e.data.endsWith(n.value))o=this._getOrReturnCtx(e,o),b(o,{code:f.invalid_string,validation:{endsWith:n.value},message:n.message}),r.dirty()}else if(n.kind==="datetime"){if(!rs(n).test(e.data))o=this._getOrReturnCtx(e,o),b(o,{code:f.invalid_string,validation:"datetime",message:n.message}),r.dirty()}else if(n.kind==="date"){if(!es.test(e.data))o=this._getOrReturnCtx(e,o),b(o,{code:f.invalid_string,validation:"date",message:n.message}),r.dirty()}else if(n.kind==="time"){if(!ts(n).test(e.data))o=this._getOrReturnCtx(e,o),b(o,{code:f.invalid_string,validation:"time",message:n.message}),r.dirty()}else if(n.kind==="duration"){if(!Fn.test(e.data))o=this._getOrReturnCtx(e,o),b(o,{validation:"duration",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="ip"){if(!os(e.data,n.version))o=this._getOrReturnCtx(e,o),b(o,{validation:"ip",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="jwt"){if(!ns(e.data,n.alg))o=this._getOrReturnCtx(e,o),b(o,{validation:"jwt",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="cidr"){if(!ss(e.data,n.version))o=this._getOrReturnCtx(e,o),b(o,{validation:"cidr",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="base64"){if(!Qn.test(e.data))o=this._getOrReturnCtx(e,o),b(o,{validation:"base64",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="base64url"){if(!Zn.test(e.data))o=this._getOrReturnCtx(e,o),b(o,{validation:"base64url",code:f.invalid_string,message:n.message}),r.dirty()}else F.assertNever(n);return{status:r.value,value:e.data}}_regex(e,t,r){return this.refinement((o)=>e.test(o),{validation:t,code:f.invalid_string,...v.errToObj(r)})}_addCheck(e){return new Ze({...this._def,checks:[...this._def.checks,e]})}email(e){return this._addCheck({kind:"email",...v.errToObj(e)})}url(e){return this._addCheck({kind:"url",...v.errToObj(e)})}emoji(e){return this._addCheck({kind:"emoji",...v.errToObj(e)})}uuid(e){return this._addCheck({kind:"uuid",...v.errToObj(e)})}nanoid(e){return this._addCheck({kind:"nanoid",...v.errToObj(e)})}cuid(e){return this._addCheck({kind:"cuid",...v.errToObj(e)})}cuid2(e){return this._addCheck({kind:"cuid2",...v.errToObj(e)})}ulid(e){return this._addCheck({kind:"ulid",...v.errToObj(e)})}base64(e){return this._addCheck({kind:"base64",...v.errToObj(e)})}base64url(e){return this._addCheck({kind:"base64url",...v.errToObj(e)})}jwt(e){return this._addCheck({kind:"jwt",...v.errToObj(e)})}ip(e){return this._addCheck({kind:"ip",...v.errToObj(e)})}cidr(e){return this._addCheck({kind:"cidr",...v.errToObj(e)})}datetime(e){if(typeof e==="string")return this._addCheck({kind:"datetime",precision:null,offset:!1,local:!1,message:e});return this._addCheck({kind:"datetime",precision:typeof e?.precision>"u"?null:e?.precision,offset:e?.offset??!1,local:e?.local??!1,...v.errToObj(e?.message)})}date(e){return this._addCheck({kind:"date",message:e})}time(e){if(typeof e==="string")return this._addCheck({kind:"time",precision:null,message:e});return this._addCheck({kind:"time",precision:typeof e?.precision>"u"?null:e?.precision,...v.errToObj(e?.message)})}duration(e){return this._addCheck({kind:"duration",...v.errToObj(e)})}regex(e,t){return this._addCheck({kind:"regex",regex:e,...v.errToObj(t)})}includes(e,t){return this._addCheck({kind:"includes",value:e,position:t?.position,...v.errToObj(t?.message)})}startsWith(e,t){return this._addCheck({kind:"startsWith",value:e,...v.errToObj(t)})}endsWith(e,t){return this._addCheck({kind:"endsWith",value:e,...v.errToObj(t)})}min(e,t){return this._addCheck({kind:"min",value:e,...v.errToObj(t)})}max(e,t){return this._addCheck({kind:"max",value:e,...v.errToObj(t)})}length(e,t){return this._addCheck({kind:"length",value:e,...v.errToObj(t)})}nonempty(e){return this.min(1,v.errToObj(e))}trim(){return new Ze({...this._def,checks:[...this._def.checks,{kind:"trim"}]})}toLowerCase(){return new Ze({...this._def,checks:[...this._def.checks,{kind:"toLowerCase"}]})}toUpperCase(){return new Ze({...this._def,checks:[...this._def.checks,{kind:"toUpperCase"}]})}get isDatetime(){return!!this._def.checks.find((e)=>e.kind==="datetime")}get isDate(){return!!this._def.checks.find((e)=>e.kind==="date")}get isTime(){return!!this._def.checks.find((e)=>e.kind==="time")}get isDuration(){return!!this._def.checks.find((e)=>e.kind==="duration")}get isEmail(){return!!this._def.checks.find((e)=>e.kind==="email")}get isURL(){return!!this._def.checks.find((e)=>e.kind==="url")}get isEmoji(){return!!this._def.checks.find((e)=>e.kind==="emoji")}get isUUID(){return!!this._def.checks.find((e)=>e.kind==="uuid")}get isNANOID(){return!!this._def.checks.find((e)=>e.kind==="nanoid")}get isCUID(){return!!this._def.checks.find((e)=>e.kind==="cuid")}get isCUID2(){return!!this._def.checks.find((e)=>e.kind==="cuid2")}get isULID(){return!!this._def.checks.find((e)=>e.kind==="ulid")}get isIP(){return!!this._def.checks.find((e)=>e.kind==="ip")}get isCIDR(){return!!this._def.checks.find((e)=>e.kind==="cidr")}get isBase64(){return!!this._def.checks.find((e)=>e.kind==="base64")}get isBase64url(){return!!this._def.checks.find((e)=>e.kind==="base64url")}get minLength(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e}get maxLength(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e}}Ze.create=(e)=>new Ze({checks:[],typeName:R.ZodString,coerce:e?.coerce??!1,...I(e)});function as(e,t){let r=(e.toString().split(".")[1]||"").length,o=(t.toString().split(".")[1]||"").length,n=r>o?r:o,s=Number.parseInt(e.toFixed(n).replace(".","")),a=Number.parseInt(t.toFixed(n).replace(".",""));return s%a/10**n}class St extends B{constructor(){super(...arguments);this.min=this.gte,this.max=this.lte,this.step=this.multipleOf}_parse(e){if(this._def.coerce)e.data=Number(e.data);if(this._getType(e)!==y.number){let n=this._getOrReturnCtx(e);return b(n,{code:f.invalid_type,expected:y.number,received:n.parsedType}),C}let r=void 0,o=new Ae;for(let n of this._def.checks)if(n.kind==="int"){if(!F.isInteger(e.data))r=this._getOrReturnCtx(e,r),b(r,{code:f.invalid_type,expected:"integer",received:"float",message:n.message}),o.dirty()}else if(n.kind==="min"){if(n.inclusive?e.data<n.value:e.data<=n.value)r=this._getOrReturnCtx(e,r),b(r,{code:f.too_small,minimum:n.value,type:"number",inclusive:n.inclusive,exact:!1,message:n.message}),o.dirty()}else if(n.kind==="max"){if(n.inclusive?e.data>n.value:e.data>=n.value)r=this._getOrReturnCtx(e,r),b(r,{code:f.too_big,maximum:n.value,type:"number",inclusive:n.inclusive,exact:!1,message:n.message}),o.dirty()}else if(n.kind==="multipleOf"){if(as(e.data,n.value)!==0)r=this._getOrReturnCtx(e,r),b(r,{code:f.not_multiple_of,multipleOf:n.value,message:n.message}),o.dirty()}else if(n.kind==="finite"){if(!Number.isFinite(e.data))r=this._getOrReturnCtx(e,r),b(r,{code:f.not_finite,message:n.message}),o.dirty()}else F.assertNever(n);return{status:o.value,value:e.data}}gte(e,t){return this.setLimit("min",e,!0,v.toString(t))}gt(e,t){return this.setLimit("min",e,!1,v.toString(t))}lte(e,t){return this.setLimit("max",e,!0,v.toString(t))}lt(e,t){return this.setLimit("max",e,!1,v.toString(t))}setLimit(e,t,r,o){return new St({...this._def,checks:[...this._def.checks,{kind:e,value:t,inclusive:r,message:v.toString(o)}]})}_addCheck(e){return new St({...this._def,checks:[...this._def.checks,e]})}int(e){return this._addCheck({kind:"int",message:v.toString(e)})}positive(e){return this._addCheck({kind:"min",value:0,inclusive:!1,message:v.toString(e)})}negative(e){return this._addCheck({kind:"max",value:0,inclusive:!1,message:v.toString(e)})}nonpositive(e){return this._addCheck({kind:"max",value:0,inclusive:!0,message:v.toString(e)})}nonnegative(e){return this._addCheck({kind:"min",value:0,inclusive:!0,message:v.toString(e)})}multipleOf(e,t){return this._addCheck({kind:"multipleOf",value:e,message:v.toString(t)})}finite(e){return this._addCheck({kind:"finite",message:v.toString(e)})}safe(e){return this._addCheck({kind:"min",inclusive:!0,value:Number.MIN_SAFE_INTEGER,message:v.toString(e)})._addCheck({kind:"max",inclusive:!0,value:Number.MAX_SAFE_INTEGER,message:v.toString(e)})}get minValue(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e}get maxValue(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e}get isInt(){return!!this._def.checks.find((e)=>e.kind==="int"||e.kind==="multipleOf"&&F.isInteger(e.value))}get isFinite(){let e=null,t=null;for(let r of this._def.checks)if(r.kind==="finite"||r.kind==="int"||r.kind==="multipleOf")return!0;else if(r.kind==="min"){if(t===null||r.value>t)t=r.value}else if(r.kind==="max"){if(e===null||r.value<e)e=r.value}return Number.isFinite(t)&&Number.isFinite(e)}}St.create=(e)=>new St({checks:[],typeName:R.ZodNumber,coerce:e?.coerce||!1,...I(e)});class Tt extends B{constructor(){super(...arguments);this.min=this.gte,this.max=this.lte}_parse(e){if(this._def.coerce)try{e.data=BigInt(e.data)}catch{return this._getInvalidInput(e)}if(this._getType(e)!==y.bigint)return this._getInvalidInput(e);let r=void 0,o=new Ae;for(let n of this._def.checks)if(n.kind==="min"){if(n.inclusive?e.data<n.value:e.data<=n.value)r=this._getOrReturnCtx(e,r),b(r,{code:f.too_small,type:"bigint",minimum:n.value,inclusive:n.inclusive,message:n.message}),o.dirty()}else if(n.kind==="max"){if(n.inclusive?e.data>n.value:e.data>=n.value)r=this._getOrReturnCtx(e,r),b(r,{code:f.too_big,type:"bigint",maximum:n.value,inclusive:n.inclusive,message:n.message}),o.dirty()}else if(n.kind==="multipleOf"){if(e.data%n.value!==BigInt(0))r=this._getOrReturnCtx(e,r),b(r,{code:f.not_multiple_of,multipleOf:n.value,message:n.message}),o.dirty()}else F.assertNever(n);return{status:o.value,value:e.data}}_getInvalidInput(e){let t=this._getOrReturnCtx(e);return b(t,{code:f.invalid_type,expected:y.bigint,received:t.parsedType}),C}gte(e,t){return this.setLimit("min",e,!0,v.toString(t))}gt(e,t){return this.setLimit("min",e,!1,v.toString(t))}lte(e,t){return this.setLimit("max",e,!0,v.toString(t))}lt(e,t){return this.setLimit("max",e,!1,v.toString(t))}setLimit(e,t,r,o){return new Tt({...this._def,checks:[...this._def.checks,{kind:e,value:t,inclusive:r,message:v.toString(o)}]})}_addCheck(e){return new Tt({...this._def,checks:[...this._def.checks,e]})}positive(e){return this._addCheck({kind:"min",value:BigInt(0),inclusive:!1,message:v.toString(e)})}negative(e){return this._addCheck({kind:"max",value:BigInt(0),inclusive:!1,message:v.toString(e)})}nonpositive(e){return this._addCheck({kind:"max",value:BigInt(0),inclusive:!0,message:v.toString(e)})}nonnegative(e){return this._addCheck({kind:"min",value:BigInt(0),inclusive:!0,message:v.toString(e)})}multipleOf(e,t){return this._addCheck({kind:"multipleOf",value:e,message:v.toString(t)})}get minValue(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e}get maxValue(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e}}Tt.create=(e)=>new Tt({checks:[],typeName:R.ZodBigInt,coerce:e?.coerce??!1,...I(e)});class lr extends B{_parse(e){if(this._def.coerce)e.data=Boolean(e.data);if(this._getType(e)!==y.boolean){let r=this._getOrReturnCtx(e);return b(r,{code:f.invalid_type,expected:y.boolean,received:r.parsedType}),C}return Pe(e.data)}}lr.create=(e)=>new lr({typeName:R.ZodBoolean,coerce:e?.coerce||!1,...I(e)});class $t extends B{_parse(e){if(this._def.coerce)e.data=new Date(e.data);if(this._getType(e)!==y.date){let n=this._getOrReturnCtx(e);return b(n,{code:f.invalid_type,expected:y.date,received:n.parsedType}),C}if(Number.isNaN(e.data.getTime())){let n=this._getOrReturnCtx(e);return b(n,{code:f.invalid_date}),C}let r=new Ae,o=void 0;for(let n of this._def.checks)if(n.kind==="min"){if(e.data.getTime()<n.value)o=this._getOrReturnCtx(e,o),b(o,{code:f.too_small,message:n.message,inclusive:!0,exact:!1,minimum:n.value,type:"date"}),r.dirty()}else if(n.kind==="max"){if(e.data.getTime()>n.value)o=this._getOrReturnCtx(e,o),b(o,{code:f.too_big,message:n.message,inclusive:!0,exact:!1,maximum:n.value,type:"date"}),r.dirty()}else F.assertNever(n);return{status:r.value,value:new Date(e.data.getTime())}}_addCheck(e){return new $t({...this._def,checks:[...this._def.checks,e]})}min(e,t){return this._addCheck({kind:"min",value:e.getTime(),message:v.toString(t)})}max(e,t){return this._addCheck({kind:"max",value:e.getTime(),message:v.toString(t)})}get minDate(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e!=null?new Date(e):null}get maxDate(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e!=null?new Date(e):null}}$t.create=(e)=>new $t({checks:[],coerce:e?.coerce||!1,typeName:R.ZodDate,...I(e)});class pr extends B{_parse(e){if(this._getType(e)!==y.symbol){let r=this._getOrReturnCtx(e);return b(r,{code:f.invalid_type,expected:y.symbol,received:r.parsedType}),C}return Pe(e.data)}}pr.create=(e)=>new pr({typeName:R.ZodSymbol,...I(e)});class Ut extends B{_parse(e){if(this._getType(e)!==y.undefined){let r=this._getOrReturnCtx(e);return b(r,{code:f.invalid_type,expected:y.undefined,received:r.parsedType}),C}return Pe(e.data)}}Ut.create=(e)=>new Ut({typeName:R.ZodUndefined,...I(e)});class Dt extends B{_parse(e){if(this._getType(e)!==y.null){let r=this._getOrReturnCtx(e);return b(r,{code:f.invalid_type,expected:y.null,received:r.parsedType}),C}return Pe(e.data)}}Dt.create=(e)=>new Dt({typeName:R.ZodNull,...I(e)});class ur extends B{constructor(){super(...arguments);this._any=!0}_parse(e){return Pe(e.data)}}ur.create=(e)=>new ur({typeName:R.ZodAny,...I(e)});class ut extends B{constructor(){super(...arguments);this._unknown=!0}_parse(e){return Pe(e.data)}}ut.create=(e)=>new ut({typeName:R.ZodUnknown,...I(e)});class et extends B{_parse(e){let t=this._getOrReturnCtx(e);return b(t,{code:f.invalid_type,expected:y.never,received:t.parsedType}),C}}et.create=(e)=>new et({typeName:R.ZodNever,...I(e)});class mr extends B{_parse(e){if(this._getType(e)!==y.undefined){let r=this._getOrReturnCtx(e);return b(r,{code:f.invalid_type,expected:y.void,received:r.parsedType}),C}return Pe(e.data)}}mr.create=(e)=>new mr({typeName:R.ZodVoid,...I(e)});class Je extends B{_parse(e){let{ctx:t,status:r}=this._processInputParams(e),o=this._def;if(t.parsedType!==y.array)return b(t,{code:f.invalid_type,expected:y.array,received:t.parsedType}),C;if(o.exactLength!==null){let s=t.data.length>o.exactLength.value,a=t.data.length<o.exactLength.value;if(s||a)b(t,{code:s?f.too_big:f.too_small,minimum:a?o.exactLength.value:void 0,maximum:s?o.exactLength.value:void 0,type:"array",inclusive:!0,exact:!0,message:o.exactLength.message}),r.dirty()}if(o.minLength!==null){if(t.data.length<o.minLength.value)b(t,{code:f.too_small,minimum:o.minLength.value,type:"array",inclusive:!0,exact:!1,message:o.minLength.message}),r.dirty()}if(o.maxLength!==null){if(t.data.length>o.maxLength.value)b(t,{code:f.too_big,maximum:o.maxLength.value,type:"array",inclusive:!0,exact:!1,message:o.maxLength.message}),r.dirty()}if(t.common.async)return Promise.all([...t.data].map((s,a)=>o.type._parseAsync(new He(t,s,t.path,a)))).then((s)=>Ae.mergeArray(r,s));let n=[...t.data].map((s,a)=>o.type._parseSync(new He(t,s,t.path,a)));return Ae.mergeArray(r,n)}get element(){return this._def.type}min(e,t){return new Je({...this._def,minLength:{value:e,message:v.toString(t)}})}max(e,t){return new Je({...this._def,maxLength:{value:e,message:v.toString(t)}})}length(e,t){return new Je({...this._def,exactLength:{value:e,message:v.toString(t)}})}nonempty(e){return this.min(1,e)}}Je.create=(e,t)=>new Je({type:e,minLength:null,maxLength:null,exactLength:null,typeName:R.ZodArray,...I(t)});function _t(e){if(e instanceof ge){let t={};for(let r in e.shape){let o=e.shape[r];t[r]=qe.create(_t(o))}return new ge({...e._def,shape:()=>t})}else if(e instanceof Je)return new Je({...e._def,type:_t(e.element)});else if(e instanceof qe)return qe.create(_t(e.unwrap()));else if(e instanceof it)return it.create(_t(e.unwrap()));else if(e instanceof tt)return tt.create(e.items.map((t)=>_t(t)));else return e}class ge extends B{constructor(){super(...arguments);this._cached=null,this.nonstrict=this.passthrough,this.augment=this.extend}_getCached(){if(this._cached!==null)return this._cached;let e=this._def.shape(),t=F.objectKeys(e);return this._cached={shape:e,keys:t},this._cached}_parse(e){if(this._getType(e)!==y.object){let l=this._getOrReturnCtx(e);return b(l,{code:f.invalid_type,expected:y.object,received:l.parsedType}),C}let{status:r,ctx:o}=this._processInputParams(e),{shape:n,keys:s}=this._getCached(),a=[];if(!(this._def.catchall instanceof et&&this._def.unknownKeys==="strip")){for(let l in o.data)if(!s.includes(l))a.push(l)}let d=[];for(let l of s){let u=n[l],x=o.data[l];d.push({key:{status:"valid",value:l},value:u._parse(new He(o,x,o.path,l)),alwaysSet:l in o.data})}if(this._def.catchall instanceof et){let l=this._def.unknownKeys;if(l==="passthrough")for(let u of a)d.push({key:{status:"valid",value:u},value:{status:"valid",value:o.data[u]}});else if(l==="strict"){if(a.length>0)b(o,{code:f.unrecognized_keys,keys:a}),r.dirty()}else if(l==="strip");else throw Error("Internal ZodObject error: invalid unknownKeys value.")}else{let l=this._def.catchall;for(let u of a){let x=o.data[u];d.push({key:{status:"valid",value:u},value:l._parse(new He(o,x,o.path,u)),alwaysSet:u in o.data})}}if(o.common.async)return Promise.resolve().then(async()=>{let l=[];for(let u of d){let x=await u.key,W=await u.value;l.push({key:x,value:W,alwaysSet:u.alwaysSet})}return l}).then((l)=>Ae.mergeObjectSync(r,l));else return Ae.mergeObjectSync(r,d)}get shape(){return this._def.shape()}strict(e){return v.errToObj,new ge({...this._def,unknownKeys:"strict",...e!==void 0?{errorMap:(t,r)=>{let o=this._def.errorMap?.(t,r).message??r.defaultError;if(t.code==="unrecognized_keys")return{message:v.errToObj(e).message??o};return{message:o}}}:{}})}strip(){return new ge({...this._def,unknownKeys:"strip"})}passthrough(){return new ge({...this._def,unknownKeys:"passthrough"})}extend(e){return new ge({...this._def,shape:()=>({...this._def.shape(),...e})})}merge(e){return new ge({unknownKeys:e._def.unknownKeys,catchall:e._def.catchall,shape:()=>({...this._def.shape(),...e._def.shape()}),typeName:R.ZodObject})}setKey(e,t){return this.augment({[e]:t})}catchall(e){return new ge({...this._def,catchall:e})}pick(e){let t={};for(let r of F.objectKeys(e))if(e[r]&&this.shape[r])t[r]=this.shape[r];return new ge({...this._def,shape:()=>t})}omit(e){let t={};for(let r of F.objectKeys(this.shape))if(!e[r])t[r]=this.shape[r];return new ge({...this._def,shape:()=>t})}deepPartial(){return _t(this)}partial(e){let t={};for(let r of F.objectKeys(this.shape)){let o=this.shape[r];if(e&&!e[r])t[r]=o;else t[r]=o.optional()}return new ge({...this._def,shape:()=>t})}required(e){let t={};for(let r of F.objectKeys(this.shape))if(e&&!e[r])t[r]=this.shape[r];else{let n=this.shape[r];while(n instanceof qe)n=n._def.innerType;t[r]=n}return new ge({...this._def,shape:()=>t})}keyof(){return Ko(F.objectKeys(this.shape))}}ge.create=(e,t)=>new ge({shape:()=>e,unknownKeys:"strip",catchall:et.create(),typeName:R.ZodObject,...I(t)});ge.strictCreate=(e,t)=>new ge({shape:()=>e,unknownKeys:"strict",catchall:et.create(),typeName:R.ZodObject,...I(t)});ge.lazycreate=(e,t)=>new ge({shape:e,unknownKeys:"strip",catchall:et.create(),typeName:R.ZodObject,...I(t)});class Gt extends B{_parse(e){let{ctx:t}=this._processInputParams(e),r=this._def.options;function o(n){for(let a of n)if(a.result.status==="valid")return a.result;for(let a of n)if(a.result.status==="dirty")return t.common.issues.push(...a.ctx.common.issues),a.result;let s=n.map((a)=>new Ge(a.ctx.common.issues));return b(t,{code:f.invalid_union,unionErrors:s}),C}if(t.common.async)return Promise.all(r.map(async(n)=>{let s={...t,common:{...t.common,issues:[]},parent:null};return{result:await n._parseAsync({data:t.data,path:t.path,parent:s}),ctx:s}})).then(o);else{let n=void 0,s=[];for(let d of r){let l={...t,common:{...t.common,issues:[]},parent:null},u=d._parseSync({data:t.data,path:t.path,parent:l});if(u.status==="valid")return u;else if(u.status==="dirty"&&!n)n={result:u,ctx:l};if(l.common.issues.length)s.push(l.common.issues)}if(n)return t.common.issues.push(...n.ctx.common.issues),n.result;let a=s.map((d)=>new Ge(d));return b(t,{code:f.invalid_union,unionErrors:a}),C}}get options(){return this._def.options}}Gt.create=(e,t)=>new Gt({options:e,typeName:R.ZodUnion,...I(t)});var Qe=(e)=>{if(e instanceof zt)return Qe(e.schema);else if(e instanceof Ye)return Qe(e.innerType());else if(e instanceof Bt)return[e.value];else if(e instanceof mt)return e.options;else if(e instanceof Ht)return F.objectValues(e.enum);else if(e instanceof Vt)return Qe(e._def.innerType);else if(e instanceof Ut)return[void 0];else if(e instanceof Dt)return[null];else if(e instanceof qe)return[void 0,...Qe(e.unwrap())];else if(e instanceof it)return[null,...Qe(e.unwrap())];else if(e instanceof oo)return Qe(e.unwrap());else if(e instanceof Xt)return Qe(e.unwrap());else if(e instanceof Ft)return Qe(e._def.innerType);else return[]};class ro extends B{_parse(e){let{ctx:t}=this._processInputParams(e);if(t.parsedType!==y.object)return b(t,{code:f.invalid_type,expected:y.object,received:t.parsedType}),C;let r=this.discriminator,o=t.data[r],n=this.optionsMap.get(o);if(!n)return b(t,{code:f.invalid_union_discriminator,options:Array.from(this.optionsMap.keys()),path:[r]}),C;if(t.common.async)return n._parseAsync({data:t.data,path:t.path,parent:t});else return n._parseSync({data:t.data,path:t.path,parent:t})}get discriminator(){return this._def.discriminator}get options(){return this._def.options}get optionsMap(){return this._def.optionsMap}static create(e,t,r){let o=new Map;for(let n of t){let s=Qe(n.shape[e]);if(!s.length)throw Error(`A discriminator value for key \`${e}\` could not be extracted from all schema options`);for(let a of s){if(o.has(a))throw Error(`Discriminator property ${String(e)} has duplicate value ${String(a)}`);o.set(a,n)}}return new ro({typeName:R.ZodDiscriminatedUnion,discriminator:e,options:t,optionsMap:o,...I(r)})}}function to(e,t){let r=We(e),o=We(t);if(e===t)return{valid:!0,data:e};else if(r===y.object&&o===y.object){let n=F.objectKeys(t),s=F.objectKeys(e).filter((d)=>n.indexOf(d)!==-1),a={...e,...t};for(let d of s){let l=to(e[d],t[d]);if(!l.valid)return{valid:!1};a[d]=l.data}return{valid:!0,data:a}}else if(r===y.array&&o===y.array){if(e.length!==t.length)return{valid:!1};let n=[];for(let s=0;s<e.length;s++){let a=e[s],d=t[s],l=to(a,d);if(!l.valid)return{valid:!1};n.push(l.data)}return{valid:!0,data:n}}else if(r===y.date&&o===y.date&&+e===+t)return{valid:!0,data:e};else return{valid:!1}}class jt extends B{_parse(e){let{status:t,ctx:r}=this._processInputParams(e),o=(n,s)=>{if(Qr(n)||Qr(s))return C;let a=to(n.value,s.value);if(!a.valid)return b(r,{code:f.invalid_intersection_types}),C;if(Zr(n)||Zr(s))t.dirty();return{status:t.value,value:a.data}};if(r.common.async)return Promise.all([this._def.left._parseAsync({data:r.data,path:r.path,parent:r}),this._def.right._parseAsync({data:r.data,path:r.path,parent:r})]).then(([n,s])=>o(n,s));else return o(this._def.left._parseSync({data:r.data,path:r.path,parent:r}),this._def.right._parseSync({data:r.data,path:r.path,parent:r}))}}jt.create=(e,t,r)=>new jt({left:e,right:t,typeName:R.ZodIntersection,...I(r)});class tt extends B{_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==y.array)return b(r,{code:f.invalid_type,expected:y.array,received:r.parsedType}),C;if(r.data.length<this._def.items.length)return b(r,{code:f.too_small,minimum:this._def.items.length,inclusive:!0,exact:!1,type:"array"}),C;if(!this._def.rest&&r.data.length>this._def.items.length)b(r,{code:f.too_big,maximum:this._def.items.length,inclusive:!0,exact:!1,type:"array"}),t.dirty();let n=[...r.data].map((s,a)=>{let d=this._def.items[a]||this._def.rest;if(!d)return null;return d._parse(new He(r,s,r.path,a))}).filter((s)=>!!s);if(r.common.async)return Promise.all(n).then((s)=>Ae.mergeArray(t,s));else return Ae.mergeArray(t,n)}get items(){return this._def.items}rest(e){return new tt({...this._def,rest:e})}}tt.create=(e,t)=>{if(!Array.isArray(e))throw Error("You must pass an array of schemas to z.tuple([ ... ])");return new tt({items:e,typeName:R.ZodTuple,rest:null,...I(t)})};class fr extends B{get keySchema(){return this._def.keyType}get valueSchema(){return this._def.valueType}_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==y.object)return b(r,{code:f.invalid_type,expected:y.object,received:r.parsedType}),C;let o=[],n=this._def.keyType,s=this._def.valueType;for(let a in r.data)o.push({key:n._parse(new He(r,a,r.path,a)),value:s._parse(new He(r,r.data[a],r.path,a)),alwaysSet:a in r.data});if(r.common.async)return Ae.mergeObjectAsync(t,o);else return Ae.mergeObjectSync(t,o)}get element(){return this._def.valueType}static create(e,t,r){if(t instanceof B)return new fr({keyType:e,valueType:t,typeName:R.ZodRecord,...I(r)});return new fr({keyType:Ze.create(),valueType:e,typeName:R.ZodRecord,...I(t)})}}class hr extends B{get keySchema(){return this._def.keyType}get valueSchema(){return this._def.valueType}_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==y.map)return b(r,{code:f.invalid_type,expected:y.map,received:r.parsedType}),C;let o=this._def.keyType,n=this._def.valueType,s=[...r.data.entries()].map(([a,d],l)=>({key:o._parse(new He(r,a,r.path,[l,"key"])),value:n._parse(new He(r,d,r.path,[l,"value"]))}));if(r.common.async){let a=new Map;return Promise.resolve().then(async()=>{for(let d of s){let l=await d.key,u=await d.value;if(l.status==="aborted"||u.status==="aborted")return C;if(l.status==="dirty"||u.status==="dirty")t.dirty();a.set(l.value,u.value)}return{status:t.value,value:a}})}else{let a=new Map;for(let d of s){let{key:l,value:u}=d;if(l.status==="aborted"||u.status==="aborted")return C;if(l.status==="dirty"||u.status==="dirty")t.dirty();a.set(l.value,u.value)}return{status:t.value,value:a}}}}hr.create=(e,t,r)=>new hr({valueType:t,keyType:e,typeName:R.ZodMap,...I(r)});class wt extends B{_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==y.set)return b(r,{code:f.invalid_type,expected:y.set,received:r.parsedType}),C;let o=this._def;if(o.minSize!==null){if(r.data.size<o.minSize.value)b(r,{code:f.too_small,minimum:o.minSize.value,type:"set",inclusive:!0,exact:!1,message:o.minSize.message}),t.dirty()}if(o.maxSize!==null){if(r.data.size>o.maxSize.value)b(r,{code:f.too_big,maximum:o.maxSize.value,type:"set",inclusive:!0,exact:!1,message:o.maxSize.message}),t.dirty()}let n=this._def.valueType;function s(d){let l=new Set;for(let u of d){if(u.status==="aborted")return C;if(u.status==="dirty")t.dirty();l.add(u.value)}return{status:t.value,value:l}}let a=[...r.data.values()].map((d,l)=>n._parse(new He(r,d,r.path,l)));if(r.common.async)return Promise.all(a).then((d)=>s(d));else return s(a)}min(e,t){return new wt({...this._def,minSize:{value:e,message:v.toString(t)}})}max(e,t){return new wt({...this._def,maxSize:{value:e,message:v.toString(t)}})}size(e,t){return this.min(e,t).max(e,t)}nonempty(e){return this.min(1,e)}}wt.create=(e,t)=>new wt({valueType:e,minSize:null,maxSize:null,typeName:R.ZodSet,...I(t)});class Lt extends B{constructor(){super(...arguments);this.validate=this.implement}_parse(e){let{ctx:t}=this._processInputParams(e);if(t.parsedType!==y.function)return b(t,{code:f.invalid_type,expected:y.function,received:t.parsedType}),C;function r(a,d){return dr({data:a,path:t.path,errorMaps:[t.common.contextualErrorMap,t.schemaErrorMap,It(),at].filter((l)=>!!l),issueData:{code:f.invalid_arguments,argumentsError:d}})}function o(a,d){return dr({data:a,path:t.path,errorMaps:[t.common.contextualErrorMap,t.schemaErrorMap,It(),at].filter((l)=>!!l),issueData:{code:f.invalid_return_type,returnTypeError:d}})}let n={errorMap:t.common.contextualErrorMap},s=t.data;if(this._def.returns instanceof Et){let a=this;return Pe(async function(...d){let l=new Ge([]),u=await a._def.args.parseAsync(d,n).catch((S)=>{throw l.addIssue(r(d,S)),l}),x=await Reflect.apply(s,this,u);return await a._def.returns._def.type.parseAsync(x,n).catch((S)=>{throw l.addIssue(o(x,S)),l})})}else{let a=this;return Pe(function(...d){let l=a._def.args.safeParse(d,n);if(!l.success)throw new Ge([r(d,l.error)]);let u=Reflect.apply(s,this,l.data),x=a._def.returns.safeParse(u,n);if(!x.success)throw new Ge([o(u,x.error)]);return x.data})}}parameters(){return this._def.args}returnType(){return this._def.returns}args(...e){return new Lt({...this._def,args:tt.create(e).rest(ut.create())})}returns(e){return new Lt({...this._def,returns:e})}implement(e){return this.parse(e)}strictImplement(e){return this.parse(e)}static create(e,t,r){return new Lt({args:e?e:tt.create([]).rest(ut.create()),returns:t||ut.create(),typeName:R.ZodFunction,...I(r)})}}class zt extends B{get schema(){return this._def.getter()}_parse(e){let{ctx:t}=this._processInputParams(e);return this._def.getter()._parse({data:t.data,path:t.path,parent:t})}}zt.create=(e,t)=>new zt({getter:e,typeName:R.ZodLazy,...I(t)});class Bt extends B{_parse(e){if(e.data!==this._def.value){let t=this._getOrReturnCtx(e);return b(t,{received:t.data,code:f.invalid_literal,expected:this._def.value}),C}return{status:"valid",value:e.data}}get value(){return this._def.value}}Bt.create=(e,t)=>new Bt({value:e,typeName:R.ZodLiteral,...I(t)});function Ko(e,t){return new mt({values:e,typeName:R.ZodEnum,...I(t)})}class mt extends B{_parse(e){if(typeof e.data!=="string"){let t=this._getOrReturnCtx(e),r=this._def.values;return b(t,{expected:F.joinValues(r),received:t.parsedType,code:f.invalid_type}),C}if(!this._cache)this._cache=new Set(this._def.values);if(!this._cache.has(e.data)){let t=this._getOrReturnCtx(e),r=this._def.values;return b(t,{received:t.data,code:f.invalid_enum_value,options:r}),C}return Pe(e.data)}get options(){return this._def.values}get enum(){let e={};for(let t of this._def.values)e[t]=t;return e}get Values(){let e={};for(let t of this._def.values)e[t]=t;return e}get Enum(){let e={};for(let t of this._def.values)e[t]=t;return e}extract(e,t=this._def){return mt.create(e,{...this._def,...t})}exclude(e,t=this._def){return mt.create(this.options.filter((r)=>!e.includes(r)),{...this._def,...t})}}mt.create=Ko;class Ht extends B{_parse(e){let t=F.getValidEnumValues(this._def.values),r=this._getOrReturnCtx(e);if(r.parsedType!==y.string&&r.parsedType!==y.number){let o=F.objectValues(t);return b(r,{expected:F.joinValues(o),received:r.parsedType,code:f.invalid_type}),C}if(!this._cache)this._cache=new Set(F.getValidEnumValues(this._def.values));if(!this._cache.has(e.data)){let o=F.objectValues(t);return b(r,{received:r.data,code:f.invalid_enum_value,options:o}),C}return Pe(e.data)}get enum(){return this._def.values}}Ht.create=(e,t)=>new Ht({values:e,typeName:R.ZodNativeEnum,...I(t)});class Et extends B{unwrap(){return this._def.type}_parse(e){let{ctx:t}=this._processInputParams(e);if(t.parsedType!==y.promise&&t.common.async===!1)return b(t,{code:f.invalid_type,expected:y.promise,received:t.parsedType}),C;let r=t.parsedType===y.promise?t.data:Promise.resolve(t.data);return Pe(r.then((o)=>this._def.type.parseAsync(o,{path:t.path,errorMap:t.common.contextualErrorMap})))}}Et.create=(e,t)=>new Et({type:e,typeName:R.ZodPromise,...I(t)});class Ye extends B{innerType(){return this._def.schema}sourceType(){return this._def.schema._def.typeName===R.ZodEffects?this._def.schema.sourceType():this._def.schema}_parse(e){let{status:t,ctx:r}=this._processInputParams(e),o=this._def.effect||null,n={addIssue:(s)=>{if(b(r,s),s.fatal)t.abort();else t.dirty()},get path(){return r.path}};if(n.addIssue=n.addIssue.bind(n),o.type==="preprocess"){let s=o.transform(r.data,n);if(r.common.async)return Promise.resolve(s).then(async(a)=>{if(t.value==="aborted")return C;let d=await this._def.schema._parseAsync({data:a,path:r.path,parent:r});if(d.status==="aborted")return C;if(d.status==="dirty")return kt(d.value);if(t.value==="dirty")return kt(d.value);return d});else{if(t.value==="aborted")return C;let a=this._def.schema._parseSync({data:s,path:r.path,parent:r});if(a.status==="aborted")return C;if(a.status==="dirty")return kt(a.value);if(t.value==="dirty")return kt(a.value);return a}}if(o.type==="refinement"){let s=(a)=>{let d=o.refinement(a,n);if(r.common.async)return Promise.resolve(d);if(d instanceof Promise)throw Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");return a};if(r.common.async===!1){let a=this._def.schema._parseSync({data:r.data,path:r.path,parent:r});if(a.status==="aborted")return C;if(a.status==="dirty")t.dirty();return s(a.value),{status:t.value,value:a.value}}else return this._def.schema._parseAsync({data:r.data,path:r.path,parent:r}).then((a)=>{if(a.status==="aborted")return C;if(a.status==="dirty")t.dirty();return s(a.value).then(()=>({status:t.value,value:a.value}))})}if(o.type==="transform")if(r.common.async===!1){let s=this._def.schema._parseSync({data:r.data,path:r.path,parent:r});if(!pt(s))return C;let a=o.transform(s.value,n);if(a instanceof Promise)throw Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");return{status:t.value,value:a}}else return this._def.schema._parseAsync({data:r.data,path:r.path,parent:r}).then((s)=>{if(!pt(s))return C;return Promise.resolve(o.transform(s.value,n)).then((a)=>({status:t.value,value:a}))});F.assertNever(o)}}Ye.create=(e,t,r)=>new Ye({schema:e,typeName:R.ZodEffects,effect:t,...I(r)});Ye.createWithPreprocess=(e,t,r)=>new Ye({schema:t,effect:{type:"preprocess",transform:e},typeName:R.ZodEffects,...I(r)});class qe extends B{_parse(e){if(this._getType(e)===y.undefined)return Pe(void 0);return this._def.innerType._parse(e)}unwrap(){return this._def.innerType}}qe.create=(e,t)=>new qe({innerType:e,typeName:R.ZodOptional,...I(t)});class it extends B{_parse(e){if(this._getType(e)===y.null)return Pe(null);return this._def.innerType._parse(e)}unwrap(){return this._def.innerType}}it.create=(e,t)=>new it({innerType:e,typeName:R.ZodNullable,...I(t)});class Vt extends B{_parse(e){let{ctx:t}=this._processInputParams(e),r=t.data;if(t.parsedType===y.undefined)r=this._def.defaultValue();return this._def.innerType._parse({data:r,path:t.path,parent:t})}removeDefault(){return this._def.innerType}}Vt.create=(e,t)=>new Vt({innerType:e,typeName:R.ZodDefault,defaultValue:typeof t.default==="function"?t.default:()=>t.default,...I(t)});class Ft extends B{_parse(e){let{ctx:t}=this._processInputParams(e),r={...t,common:{...t.common,issues:[]}},o=this._def.innerType._parse({data:r.data,path:r.path,parent:{...r}});if(Nt(o))return o.then((n)=>({status:"valid",value:n.status==="valid"?n.value:this._def.catchValue({get error(){return new Ge(r.common.issues)},input:r.data})}));else return{status:"valid",value:o.status==="valid"?o.value:this._def.catchValue({get error(){return new Ge(r.common.issues)},input:r.data})}}removeCatch(){return this._def.innerType}}Ft.create=(e,t)=>new Ft({innerType:e,typeName:R.ZodCatch,catchValue:typeof t.catch==="function"?t.catch:()=>t.catch,...I(t)});class gr extends B{_parse(e){if(this._getType(e)!==y.nan){let r=this._getOrReturnCtx(e);return b(r,{code:f.invalid_type,expected:y.nan,received:r.parsedType}),C}return{status:"valid",value:e.data}}}gr.create=(e)=>new gr({typeName:R.ZodNaN,...I(e)});var od=Symbol("zod_brand");class oo extends B{_parse(e){let{ctx:t}=this._processInputParams(e),r=t.data;return this._def.type._parse({data:r,path:t.path,parent:t})}unwrap(){return this._def.type}}class br extends B{_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.common.async)return(async()=>{let n=await this._def.in._parseAsync({data:r.data,path:r.path,parent:r});if(n.status==="aborted")return C;if(n.status==="dirty")return t.dirty(),kt(n.value);else return this._def.out._parseAsync({data:n.value,path:r.path,parent:r})})();else{let o=this._def.in._parseSync({data:r.data,path:r.path,parent:r});if(o.status==="aborted")return C;if(o.status==="dirty")return t.dirty(),{status:"dirty",value:o.value};else return this._def.out._parseSync({data:o.value,path:r.path,parent:r})}}static create(e,t){return new br({in:e,out:t,typeName:R.ZodPipeline})}}class Xt extends B{_parse(e){let t=this._def.innerType._parse(e),r=(o)=>{if(pt(o))o.value=Object.freeze(o.value);return o};return Nt(t)?t.then((o)=>r(o)):r(t)}unwrap(){return this._def.innerType}}Xt.create=(e,t)=>new Xt({innerType:e,typeName:R.ZodReadonly,...I(t)});var nd={object:ge.lazycreate},R;(function(e){e.ZodString="ZodString",e.ZodNumber="ZodNumber",e.ZodNaN="ZodNaN",e.ZodBigInt="ZodBigInt",e.ZodBoolean="ZodBoolean",e.ZodDate="ZodDate",e.ZodSymbol="ZodSymbol",e.ZodUndefined="ZodUndefined",e.ZodNull="ZodNull",e.ZodAny="ZodAny",e.ZodUnknown="ZodUnknown",e.ZodNever="ZodNever",e.ZodVoid="ZodVoid",e.ZodArray="ZodArray",e.ZodObject="ZodObject",e.ZodUnion="ZodUnion",e.ZodDiscriminatedUnion="ZodDiscriminatedUnion",e.ZodIntersection="ZodIntersection",e.ZodTuple="ZodTuple",e.ZodRecord="ZodRecord",e.ZodMap="ZodMap",e.ZodSet="ZodSet",e.ZodFunction="ZodFunction",e.ZodLazy="ZodLazy",e.ZodLiteral="ZodLiteral",e.ZodEnum="ZodEnum",e.ZodEffects="ZodEffects",e.ZodNativeEnum="ZodNativeEnum",e.ZodOptional="ZodOptional",e.ZodNullable="ZodNullable",e.ZodDefault="ZodDefault",e.ZodCatch="ZodCatch",e.ZodPromise="ZodPromise",e.ZodBranded="ZodBranded",e.ZodPipeline="ZodPipeline",e.ZodReadonly="ZodReadonly"})(R||(R={}));var k=Ze.create,ve=St.create,sd=gr.create,ad=Tt.create,ze=lr.create,id=$t.create,cd=pr.create,dd=Ut.create,is=Dt.create,ld=ur.create,pd=ut.create,ud=et.create,md=mr.create,Oe=Je.create,{create:ce,strictCreate:fd}=ge,cs=Gt.create,hd=ro.create,gd=jt.create,bd=tt.create,ds=fr.create,yd=hr.create,xd=wt.create,vd=Lt.create,kd=zt.create,Jo=Bt.create,At=mt.create,_d=Ht.create,Sd=Et.create,Td=Ye.create,wd=qe.create,Ed=it.create,Ad=Ye.createWithPreprocess,Cd=br.create;var no=["http","vercel","cloudflare","deno","netlify"];var Yo=ce({id:k(),name:k(),type:At(no),proxyUrl:k(),isActive:ze(),testStatus:At(["active","error"]).nullable().optional(),lastTestedAt:ve().nullable().optional(),lastError:k().nullable().optional(),rateLimitedUntil:ve().nullable().optional()}),Id=ce({name:k().min(1),type:At(no),proxyUrl:k().min(1),isActive:ze().optional()}),Nd=ce({name:k().min(1).optional(),proxyUrl:k().min(1).optional(),isActive:ze().optional()}),Ld=ce({accountId:k().min(1),apiToken:k().min(1),projectName:k().optional()}),$d=ce({vercelToken:k().min(1),projectName:k().optional()}),Ud=ce({denoToken:k().min(1),orgDomain:k().min(1),projectName:k().optional()}),Dd=ce({netlifyToken:k().min(1),projectName:k().optional()}),Wo=ce({ok:ze(),status:ve().optional(),statusText:k().nullable().optional(),elapsedMs:ve().optional(),error:k().nullable().optional()}),Qo=["single","round-robin","random"],ls=ce({id:k().trim().toLowerCase().min(1).max(40).regex(/^[a-z0-9][a-z0-9._-]*$/,"Use a lowercase model-combo slug."),name:k().trim().min(1).max(80),models:Oe(k().trim().min(1).max(200)).min(2).max(6)}).superRefine((e,t)=>{let r=new Set;e.models.forEach((o,n)=>{let s=o.trim().toLowerCase();if(r.has(s))t.addIssue({code:f.custom,path:["models",n],message:"A model can appear only once in a combo."});r.add(s)})}),Zo=Oe(ls).max(20).superRefine((e,t)=>{let r=new Set;e.forEach((o,n)=>{let s=o.id.toLowerCase();if(r.has(s))t.addIssue({code:f.custom,path:[n,"id"],message:"Model-combo IDs must be unique."});r.add(s)})}),ps=ce({version:Jo(1),port:ve().int().min(1024).max(65535),apiKey:k().min(8),upstream:k(),selectedModels:Oe(k()),fallbackModels:Oe(k().min(1)).max(2).default([]),modelCombos:Zo.default([]),proxyPools:Oe(Yo),proxyStrategy:At(Qo).default("single"),activePoolId:k().nullable().optional(),stickyLimit:ve().int().min(1).max(100).default(1),rtkEnabled:ze().default(!0)}),Gd=ce({port:ve().int().min(1024).max(65535).optional(),apiKey:k().min(1).optional(),selectedModels:Oe(k()).optional(),fallbackModels:Oe(k().min(1)).max(2).optional(),modelCombos:Zo.optional(),proxyPools:Oe(Yo).optional(),proxyStrategy:At(Qo).optional(),activePoolId:k().nullable().optional(),stickyLimit:ve().int().min(1).max(100).optional(),rtkEnabled:ze().optional()}),jd=ce({modelId:k().min(1)}),en=ce({ok:ze(),modelId:k(),elapsedMs:ve().int().nonnegative().optional(),reply:k().optional(),error:k().optional()}),us=ce({id:k(),name:k(),limit:ce({context:ve().optional(),output:ve().optional()}).optional(),capabilities:ce({tools:ze().optional(),input:Oe(k()).optional(),output:Oe(k()).optional()}).optional(),variants:Oe(ce({id:k(),settings:ds(k(),cs([k(),ve(),ze(),is()])).optional()})).optional()});var ms=ce({at:ve(),method:k(),path:k(),model:k(),requestedModel:k().optional(),status:ve(),ms:ve(),poolName:k().optional(),fallbackUsed:ze().optional(),fallbackReason:k().optional(),inputTokens:ve().int().nonnegative().optional(),outputTokens:ve().int().nonnegative().optional(),totalTokens:ve().int().nonnegative().optional(),error:k().optional()}),fs=ce({providerId:k(),path:k(),installed:ze(),models:ve(),modelIds:Oe(k())}),Le=ce({running:ze(),routerError:k(),endpoint:k(),config:ps,models:Oe(us),modelsFetchedAt:ve().nullable(),modelsError:k(),upstreamCount:ve(),registration:fs,preview:k(),warnings:Oe(k()),requests:Oe(ms)}),tn=ce({kind:At(no),code:k()}),zd=ce({ok:Jo(!0)});class Ct extends Error{code;constructor(e,t){super(t);this.name="ServiceError",this.code=e}}var hs=ce({error:ce({code:k(),message:k()})}),gs=(e)=>{try{return JSON.parse(e)}catch{return null}},rn=(e)=>{let t=async(r,o,n,s)=>{let a;try{a=await e.serviceRequest({method:r,path:o,body:s===void 0?void 0:JSON.stringify(s)})}catch(u){throw new Ct("no-service",u instanceof H&&u.code==="NO_SERVICE"?"Allow the local service for this extension in Settings, Extensions.":"Could not reach the local service.")}let d=gs(a.body);if(a.status>=400){let u=hs.safeParse(d);throw new Ct(u.success?u.data.error.code:"unknown",u.success?u.data.error.message:"The local service refused the request.")}let l=n.safeParse(d);if(!l.success)throw new Ct("bad-answer","The local service answered with something this panel does not understand.");return l.data};return{state:()=>t("GET","/state",Le),patchConfig:(r)=>t("PUT","/config",Le,r),rotateKey:()=>t("POST","/api-key/rotate",Le,{}),refreshModels:()=>t("POST","/models/refresh",Le,{}),testModel:(r)=>t("POST","/models/test",en,{modelId:r}),register:()=>t("POST","/register",Le,{}),unregister:()=>t("POST","/unregister",Le,{}),relaySource:(r)=>t("GET",`/relays/${r}`,tn),createProxyPool:(r)=>t("POST","/proxy-pools",Le,r),updateProxyPool:(r,o)=>t("PUT",`/proxy-pools/${r}`,Le,o),deleteProxyPool:(r)=>t("DELETE",`/proxy-pools/${r}`,Le),testProxyPool:(r)=>t("POST",`/proxy-pools/${r}/test`,Wo,{}),deployCloudflare:(r)=>t("POST","/proxy-pools/cloudflare-deploy",Le,r),deployVercel:(r)=>t("POST","/proxy-pools/vercel-deploy",Le,r),deployDeno:(r)=>t("POST","/proxy-pools/deno-deploy",Le,r),deployNetlify:(r)=>t("POST","/proxy-pools/netlify-deploy",Le,r)}};var on=(e)=>{let t=null,r="",o=!1,n=new Set,s=()=>{for(let u of n)u()},a=(u)=>u instanceof Ct?u.message:u instanceof Error?u.message:String(u),d=async(u)=>{o=!0,s();try{t=await u(e),r=""}catch(x){r=a(x)}finally{o=!1,s()}};return{state:()=>t,error:()=>r,busy:()=>o,subscribe:(u)=>{n.add(u)},load:()=>d((u)=>u.state()),poll:async()=>{if(o)return;try{t=await e.state(),r="",s()}catch{}},run:d}};var nn=`
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
`;var c=(e,t="",r="")=>{let o=document.createElement(e);if(t)o.className=t;if(r)o.textContent=r;return o},sn=(e,t="")=>{let r=c("div",`br-row ${t}`.trim());return e.append(r),r},ct=(e,t="")=>{let r=c("div",`br-stack ${t}`.trim());return e.append(r),r},Me=(e,t,r)=>{let o=c("section","br-card"),n=c("header","br-card-header"),s=c("div"),a=c("h3","br-card-title",t);if(s.append(a),r){let d=c("p","br-card-desc",r);s.append(d)}return n.append(s),o.append(n),e.append(o),{card:o,body:o}},L=(e,t,r,o="default")=>{let n=c("button",`br-btn ${o!=="default"?o:""}`.trim(),t);return n.type="button",n.addEventListener("click",r),e.append(n),n};var bs=(e)=>e===null?"never":new Date(e).toLocaleTimeString(),Ve=(e)=>{let t=e.trim().replace(/\([^()]+\)\s*$/,"");return(t.startsWith("blackrouter/")?t.slice(12):t).toLowerCase()},an=(e)=>{if(e>=1e6){if(e===1e6||e===1048576)return"1M";let t=e/1e6;return`${t.toFixed(t%1===0?0:1)}M`}if(e>=1000){if(e%1000===0)return`${e/1000}k`;return`${Math.round(e/1024)}k`}return`${e}`},cn=(e,t,r)=>{let o=ct(document.createElement("div")),n="",s="",a=null,d={},l=!1,u=null,x="",W="",S=[],V="",A=(m)=>m.config.selectedModels.length>0?m.config.selectedModels:m.models.map((M)=>M.id),le=async(m)=>{n="",await e.run((M)=>M.patchConfig({selectedModels:m})),h()},P=(m,M,ee)=>{let pe=A(m);if(!ee&&pe.length<=1){n="Keep at least one free model selected so OpenCode has an endpoint to call.",h();return}let i=ee?[...pe,M]:pe.filter((p)=>p!==M);le(i)},D=(m)=>{le(m.models.map((M)=>M.id))},oe=(m)=>{if(m.models.length>0)le([m.models[0].id])},Te=async(m)=>{if(n="",await e.run((M)=>M.patchConfig({fallbackModels:m.slice(0,2)})),e.error()){n=e.error(),h();return}await r.toast({kind:"success",message:"Model fallback order saved."}),h()},we=async(m)=>{if(n="",await e.run((M)=>M.patchConfig({modelCombos:m})),e.error()){n=e.error(),h();return}l=!1,u=null,x="",W="",S=[],V="",await r.toast({kind:"success",message:"Named model combo saved."}),h()},ae=(m)=>{n="",l=!0,u=m?.id??null,x=m?.id??"",W=m?.name??"",S=m?[...m.models]:[],V="",h()},Fe=async(m)=>{let M=x.trim().toLowerCase(),ee=W.trim();if(!/^[a-z0-9][a-z0-9._-]{0,39}$/.test(M)){n="Combo ID must be a lowercase slug (letters, numbers, dot, underscore, hyphen).",h();return}if(!ee||ee.length>80){n="Enter a combo name of 1–80 characters.",h();return}if(S.length<2||S.length>6){n="A named combo needs 2–6 models in priority order.",h();return}let pe=S.map(Ve);if(new Set(pe).size!==pe.length){n="A model can appear only once in a combo.",h();return}if(m.some((E)=>E.id.toLowerCase()===M&&E.id!==u)){n="That combo ID already exists.",h();return}let i={id:M,name:ee,models:[...S]},p=u?m.map((E)=>E.id===u?i:E):[...m,i];await we(p)},be=async(m)=>{let M=e.state();if(!M)return;await we((M.config.modelCombos??[]).filter((ee)=>ee.id!==m))},q=async()=>{if(n="",await e.run((m)=>m.refreshModels()),e.error())await r.toast({kind:"error",message:e.error()});h()},h=()=>{o.replaceChildren();let m=e.state();if(!m)return;let{card:M}=Me(o,"OpenCode Zen Free Catalog","Select the free models OpenCode and clients can call. Paid models are filtered out.");if(m.modelsError){let _=c("div");De(_,{tone:"warning",title:"Could not refresh catalog",body:m.modelsError}),M.append(_)}if(n){let _=c("div");De(_,{tone:"error",title:"Selection notice",body:n}),M.append(_)}if(m.models.length===0){Mt(M,{title:"No free models detected",body:"Refresh the list. If it stays empty, check the upstream and any relay configured.",action:{label:"Refresh",onClick:()=>void q()}});return}let ee=c("input","br-search-input");ee.type="text",ee.placeholder="Search free models by name or id...",ee.value=s,ee.oninput=()=>{s=ee.value.toLowerCase(),Y()},M.append(ee);let pe=c("div","br-row between"),i=A(m),p=c("span","br-muted br-mono",`${i.length} of ${m.models.length} active · Updated ${bs(m.modelsFetchedAt)}`);pe.append(p);let E=c("div","br-row");L(E,"Select All",()=>D(m)),L(E,"Reset",()=>oe(m)),L(E,"Refresh List",()=>void q()),pe.append(E),M.append(pe);let G=c("div","br-models-grid");M.append(G);let Y=()=>{G.replaceChildren();let _=m.models.filter((T)=>T.id.toLowerCase().includes(s)||T.name.toLowerCase().includes(s));if(_.length===0){let T=c("p","br-muted","No free models match your filter.");G.append(T);return}for(let T of _){let K=i.includes(T.id),xe=c("div",`br-model-card ${K?"selected":""}`),ke=c("div","br-model-card-info");ke.append(c("span","br-model-name",T.name)),ke.append(c("span","br-model-id",T.id));let J=c("div","br-row");J.style.gap="4px",J.style.marginTop="4px";let Ee=T.limit?.context?an(T.limit.context):"128k";if(J.append(c("span","br-badge br-badge-neutral",`${Ee} ctx`)),T.limit?.output){let se=an(T.limit.output);J.append(c("span","br-badge br-badge-neutral",`${se} out`))}if(T.capabilities?.input?.includes("image"))J.append(c("span","br-badge br-badge-neutral","Vision"));if(T.variants&&T.variants.length>0)J.append(c("span","br-badge br-badge-running","Thinking"));if(T.capabilities?.tools)J.append(c("span","br-badge br-badge-neutral","Tools"));ke.append(J),xe.append(ke);let re=c("div","br-model-right"),g=d[T.id];if(g)if(g.ok)re.append(c("span","br-badge br-badge-running",`${g.elapsedMs??0}ms ✓`));else{let se=c("span","br-badge br-badge-stopped","Failed ✗");se.title=g.error||"Test failed",re.append(se)}let w=a===T.id,Re=L(re,w?"Testing...":"Test",async(se)=>{se.stopPropagation(),a=T.id,Y();try{let Ie=await t.testModel(T.id);if(d[T.id]=Ie,Ie.ok)await r.toast({kind:"success",message:`${T.name}: Test passed (${Ie.elapsedMs??0}ms). "${Ie.reply?.slice(0,40)||"OK"}"`});else await r.toast({kind:"error",message:`${T.name}: ${Ie.error||"Test failed."}`})}catch(Ie){d[T.id]={ok:!1,modelId:T.id,error:String(Ie)},await r.toast({kind:"error",message:Ie instanceof Error?Ie.message:String(Ie)})}finally{a=null,Y()}});Re.disabled=w;let z=c("div");Jr(z,{label:"",checked:K,onChange:(se)=>P(m,T.id,se)}),re.append(z),xe.append(re),xe.onclick=(se)=>{if(se.target.closest("input, button"))return;P(m,T.id,!K)},G.append(xe)}};Y();let{card:j}=Me(o,"Automatic Model Fallback","If a request fails with a retryable upstream error, BlackRouter tries these models in order. The requested model is always attempted first."),ue=m.config.fallbackModels??[];if(ue.length===0)j.append(c("p","br-muted","No fallback models configured. Failed requests will return the upstream error."));let de=c("div","br-stack");for(let _=0;_<ue.length;_+=1){let T=ue[_],K=m.models.find((g)=>Ve(g.id)===Ve(T)),xe=c("div","br-row between");xe.style.alignItems="center";let ke=c("div","br-stack");ke.append(c("span","br-model-name",`${_+1}. ${K?.name??T}`)),ke.append(c("span","br-model-id",T)),xe.append(ke);let J=c("div","br-row"),Ee=L(J,"Move up",()=>{if(_===0)return;let g=[...ue];[g[_-1],g[_]]=[g[_],g[_-1]],Te(g)});Ee.disabled=_===0;let re=L(J,"Move down",()=>{if(_>=ue.length-1)return;let g=[...ue];[g[_+1],g[_]]=[g[_],g[_+1]],Te(g)});re.disabled=_>=ue.length-1,L(J,"Remove",()=>{Te(ue.filter((g,w)=>w!==_))}),xe.append(J),de.append(xe)}j.append(de);let ye=new Set(ue.map(Ve)),Xe=m.models.filter((_)=>!ye.has(Ve(_.id))),rt=c("div","br-row"),X=c("select","br-search-input");X.style.flex="1";let O=document.createElement("option");O.value="",O.textContent=Xe.length>0?"Choose a fallback model…":"No additional models available",X.append(O);for(let _ of Xe){let T=document.createElement("option");T.value=_.id,T.textContent=_.name,X.append(T)}X.disabled=ue.length>=2||Xe.length===0,rt.append(X);let ne=L(rt,"Add fallback",()=>{if(!X.value||ue.length>=2)return;Te([...ue,X.value])},"primary");ne.disabled=X.disabled,j.append(rt),j.append(c("p","br-muted","Fallbacks are tried only for HTTP 404, 408, 429, 500, 502, 503, or 504. Up to two fallback models are allowed per request."));let{card:Ce}=Me(o,"Named Model Combos","Create a reusable model alias with its own ordered fallback chain. In OpenCode, use blackrouter/combo/<id>."),N=m.config.modelCombos??[];if(N.length===0)Ce.append(c("p","br-muted","No named combos yet. Each combo can contain 2–6 free models and is limited to a maximum of 20 combos."));for(let _ of N){let T=c("div","br-stack");T.style.gap="6px",T.style.padding="10px 0",T.style.borderBottom="1px solid var(--border-subtle, rgba(127,127,127,.22))";let K=c("div","br-row between"),xe=c("div","br-stack");xe.append(c("span","br-model-name",_.name)),xe.append(c("span","br-model-id","blackrouter/combo/"+_.id)),K.append(xe);let ke=c("div","br-row");L(ke,"Edit",()=>ae(_)),L(ke,"Remove",()=>void be(_.id)),K.append(ke),T.append(K),_.models.forEach((J,Ee)=>{let re=m.models.find((g)=>Ve(g.id)===Ve(J));T.append(c("span","br-muted",Ee+1+". "+(re?.name??J)))}),Ce.append(T)}if(l){let _=c("div","br-stack");_.style.gap="8px",_.style.marginTop="10px";let T=c("input","br-search-input");T.type="text",T.maxLength=40,T.placeholder="combo-id (e.g. fast-coding)",T.value=x,T.disabled=u!==null,T.oninput=()=>{x=T.value.toLowerCase()},_.append(c("label","br-muted","Combo ID")),_.append(T);let K=c("input","br-search-input");K.type="text",K.maxLength=80,K.placeholder="Display name",K.value=W,K.oninput=()=>{W=K.value},_.append(c("label","br-muted","Display name")),_.append(K),_.append(c("label","br-muted","Priority order · "+S.length+"/6 models"));let xe=c("div","br-stack");for(let z=0;z<S.length;z+=1){let se=S[z],Ie=m.models.find((xo)=>Ve(xo.id)===Ve(se)),ot=c("div","br-row between"),nt=c("div","br-stack");nt.append(c("span","br-model-name",z+1+". "+(Ie?.name??se))),nt.append(c("span","br-model-id",se)),ot.append(nt);let qt=c("div","br-row"),bo=L(qt,"↑",()=>{if(z===0)return;[S[z-1],S[z]]=[S[z],S[z-1]],h()});bo.title="Move model up",bo.disabled=z===0;let yo=L(qt,"↓",()=>{if(z>=S.length-1)return;[S[z+1],S[z]]=[S[z],S[z+1]],h()});yo.title="Move model down",yo.disabled=z>=S.length-1,L(qt,"Remove",()=>{S=S.filter((xo,vn)=>vn!==z),h()}),ot.append(qt),xe.append(ot)}_.append(xe);let ke=new Set(S.map(Ve)),J=m.models.filter((z)=>!ke.has(Ve(z.id))),Ee=c("div","br-row"),re=c("select","br-search-input");re.style.flex="1";let g=document.createElement("option");g.value="",g.textContent=J.length>0?"Choose a free model…":"No additional models available",re.append(g);for(let z of J){let se=document.createElement("option");se.value=z.id,se.textContent=z.name,re.append(se)}re.value=V,re.disabled=S.length>=6||J.length===0,Ee.append(re);let w=L(Ee,"Add model",()=>{if(!V||S.length>=6)return;S=[...S,V],V="",h()});re.onchange=()=>{V=re.value,w.disabled=re.disabled||!V},w.disabled=re.disabled||!V,Ee.append(w),_.append(Ee);let Re=c("div","br-row");L(Re,"Save Combo",()=>void Fe(N),"primary"),L(Re,"Cancel",()=>{l=!1,u=null,x="",W="",S=[],V="",h()}),_.append(Re),Ce.append(_)}else{let _=L(Ce,"Create Model Combo",()=>ae(),"primary");_.disabled=N.length>=20}};return{element:o,render:h}};var dn=(e,t)=>{let r=ct(document.createElement("div")),o=!1,n=async(d,l)=>{try{await t.writeClipboard(d),await t.toast({kind:"success",message:`${l} copied.`})}catch{await t.toast({kind:"error",message:"Failed to copy."})}},s=async(d,l)=>{if(o=!1,await e.run(d),e.error())await t.toast({kind:"error",message:e.error()});else await t.toast({kind:"success",message:l});a()},a=()=>{r.replaceChildren();let d=e.state();if(!d)return;let{card:l}=Me(r,"OpenCode Provider Registration","BlackRouter registers this local endpoint directly into OpenCode’s configuration file.");for(let oe of d.warnings){let Te=c("div");De(Te,{tone:"warning",title:"File warning",body:oe}),l.append(Te)}let u=c("div","br-opencode-hero"),x=c("div","br-opencode-desc"),W=c("span",`br-badge ${d.registration.installed?"br-badge-running":"br-badge-neutral"}`,d.registration.installed?"Registered":"Not Registered"),S=c("div","br-row");S.append(W),S.append(c("span","br-mono",d.registration.path)),x.append(S);let V=c("span","br-muted",d.registration.installed?`${d.registration.models} free model${d.registration.models===1?"":"s"} registered in OpenCode config.`:"Click register to add BlackRouter into your active OpenCode configuration.");x.append(V),u.append(x);let A=c("div","br-row");if(d.registration.installed)L(A,"Update Provider",()=>void s((oe)=>oe.register(),"Provider updated in OpenCode config."),"primary"),L(A,o?"Confirm Remove?":"Remove",()=>{if(!o){o=!0,a();return}s((oe)=>oe.unregister(),"Provider removed from OpenCode config.")},o?"destructive":"default");else{let oe=L(A,"Register in OpenCode",()=>void s((Te)=>Te.register(),"Provider added to OpenCode config."),"primary");oe.disabled=d.models.length===0}u.append(A),l.append(u);let{card:le}=Me(r,"Config Block Preview","The exact JSON configuration written to OpenCode."),P=c("pre","br-json-block",d.preview);le.append(P);let D=c("div","br-row");L(D,"Copy JSON Block",()=>void n(d.preview,"Config block")),le.append(D)};return{element:r,render:a}};var ys=[{id:"cloudflare",label:"Cloudflare Worker"},{id:"vercel",label:"Vercel Edge"},{id:"deno",label:"Deno Deploy"},{id:"netlify",label:"Netlify Function"},{id:"http",label:"Forward Proxy"}],ln=(e,t,r)=>{let o=ct(document.createElement("div")),n=!1,s="cloudflare",a=!1,d="",l=null,u={name:"",type:"http",proxyUrl:""},x={accountId:"",apiToken:"",projectName:""},W={vercelToken:"",projectName:""},S={denoToken:"",orgDomain:"",projectName:""},V={netlifyToken:"",projectName:""},A=async(h,m)=>{try{await r.writeClipboard(h),await r.toast({kind:"success",message:`${m} copied.`})}catch{d="The clipboard refused the copy.",q()}},le=async(h)=>{try{let m=await t.relaySource(h);await A(m.code,`${h} relay code`)}catch(m){await r.toast({kind:"error",message:m instanceof Error?m.message:String(m)})}},P=async()=>{a=!0,d="",q();try{if(s==="http"){if(!u.name.trim()||!u.proxyUrl.trim())throw Error("Name and Proxy URL are required.");await e.run((h)=>h.createProxyPool({name:u.name.trim(),type:"http",proxyUrl:u.proxyUrl.trim(),isActive:!0})),u.name="",u.proxyUrl=""}else if(s==="cloudflare"){if(!x.accountId.trim()||!x.apiToken.trim())throw Error("Cloudflare Account ID and API Token are required.");await e.run((h)=>h.deployCloudflare({accountId:x.accountId.trim(),apiToken:x.apiToken.trim(),projectName:x.projectName.trim()||void 0})),x.accountId="",x.apiToken="",x.projectName=""}else if(s==="vercel"){if(!W.vercelToken.trim())throw Error("Vercel API Token is required.");await e.run((h)=>h.deployVercel({vercelToken:W.vercelToken.trim(),projectName:W.projectName.trim()||void 0})),W.vercelToken="",W.projectName=""}else if(s==="deno"){if(!S.denoToken.trim()||!S.orgDomain.trim())throw Error("Deno Deploy Token and Organization Domain are required.");await e.run((h)=>h.deployDeno({denoToken:S.denoToken.trim(),orgDomain:S.orgDomain.trim(),projectName:S.projectName.trim()||void 0})),S.denoToken="",S.orgDomain="",S.projectName=""}else if(s==="netlify"){if(!V.netlifyToken.trim())throw Error("Netlify API Token is required.");await e.run((h)=>h.deployNetlify({netlifyToken:V.netlifyToken.trim(),projectName:V.projectName.trim()||void 0})),V.netlifyToken="",V.projectName=""}n=!1,await r.toast({kind:"success",message:"Relay configured and activated."})}catch(h){d=h instanceof Error?h.message:String(h)}finally{a=!1,q()}},D=async(h)=>{await e.run((m)=>m.updateProxyPool(h.id,{isActive:!h.isActive}))},oe=async(h)=>{await e.run((m)=>m.patchConfig({proxyStrategy:h})),await r.toast({kind:"info",message:`Routing strategy set to ${h}.`})},Te=async(h)=>{await e.run((m)=>m.patchConfig({stickyLimit:h}))},we=async(h)=>{let m=e.state();if(!m)return;let M=m.config.proxyPools.map((ee)=>({...ee,isActive:ee.id===h.id}));await e.run((ee)=>ee.patchConfig({proxyPools:M,activePoolId:h.id,proxyStrategy:"single"})),await r.toast({kind:"success",message:`${h.name} set as primary route.`})},ae=async()=>{let h=e.state();if(!h)return;let m=h.config.proxyPools.map((M)=>({...M,isActive:!1}));await e.run((M)=>M.patchConfig({activePoolId:null,proxyPools:m})),await r.toast({kind:"info",message:"Switched to direct routing."})},Fe=async(h)=>{await e.run((m)=>m.deleteProxyPool(h)),await r.toast({kind:"success",message:"Proxy pool removed."})},be=async(h)=>{l=h,q();try{let m=await t.testProxyPool(h);if(await e.load(),m.ok)await r.toast({kind:"success",message:`Relay test passed (${m.elapsedMs||0}ms).`});else await r.toast({kind:"error",message:m.error||"Relay test failed."})}catch(m){await r.toast({kind:"error",message:m instanceof Error?m.message:String(m)})}finally{l=null,q()}},q=()=>{o.replaceChildren();let h=e.state();if(!h)return;let m=h.config.proxyStrategy||"single",M=h.config.stickyLimit??1,{card:ee}=Me(o,"Upstream Routing & Strategy","Select whether calls go directly, through a dedicated relay, or load-balance across pools."),pe=c("div","br-strategy-toolbar"),i=c("div","br-strategy-group");i.append(c("span","br-strategy-label","Strategy:"));let p=c("div","br-strategy-tabs"),E=[{id:"single",label:"Single Pool"},{id:"round-robin",label:"Round-Robin"},{id:"random",label:"Random"}];for(let X of E){let O=c("button",`br-strategy-tab ${m===X.id?"active":""}`,X.label);O.onclick=()=>void oe(X.id),p.append(O)}if(i.append(p),pe.append(i),m==="round-robin"){let X=c("div","br-sticky-control");X.append(c("span","","Sticky Turns:"));let O=c("input","br-sticky-input");O.type="number",O.min="1",O.max="100",O.value=String(M),O.onchange=()=>{let ne=Math.max(1,parseInt(O.value,10)||1);O.value=String(ne),Te(ne)},X.append(O),pe.append(X)}ee.append(pe);let G=h.config.proxyPools.filter((X)=>X.isActive),Y=h.config.proxyPools.find((X)=>X.id===h.config.activePoolId)||h.config.proxyPools.find((X)=>X.isActive),j=c("div","br-pool-card active"),ue=c("div","br-pool-left"),de=c("div","br-pool-info"),ye=c("div","br-pool-title-row");if(m==="round-robin")ye.append(c("span","br-pool-name","Round-Robin Load Balancing")),ye.append(c("span",G.length>0?"br-badge br-badge-primary":"br-badge br-badge-stopped",`${G.length} Pools Active`)),de.append(ye),de.append(c("span","br-pool-url",G.length>0?`Sequentially rotating across ${G.length} active relays with ${M} sticky turn(s) each.`:"No relays active in pool. Falling back to direct connection."));else if(m==="random")ye.append(c("span","br-pool-name","Random Upstream Routing")),ye.append(c("span",G.length>0?"br-badge br-badge-primary":"br-badge br-badge-stopped",`${G.length} Pools Active`)),de.append(ye),de.append(c("span","br-pool-url",G.length>0?`Distributing requests uniformly at random across ${G.length} active relays.`:"No relays active in pool. Falling back to direct connection."));else if(Y)ye.append(c("span","br-pool-name",Y.name)),ye.append(c("span","br-badge br-badge-primary",Y.type==="http"?"Forward Proxy":`${Y.type} Relay`)),de.append(ye),de.append(c("span","br-pool-url",Y.proxyUrl));else ye.append(c("span","br-pool-name","Direct Connection")),ye.append(c("span","br-badge br-badge-neutral","Direct")),de.append(ye),de.append(c("span","br-pool-url","Direct requests from this machine to https://opencode.ai/zen/v1"));ue.append(de),j.append(ue);let Xe=c("div","br-pool-actions");if(m==="single"&&Y)L(Xe,"Switch to Direct",()=>void ae());if(L(Xe,n?"Close Form":"+ Add / Deploy Relay",()=>{n=!n,d="",q()},n?"default":"primary"),j.append(Xe),ee.append(j),n){let X=c("div","br-deploy-box");if(d){let N=c("div");De(N,{tone:"error",title:"Deployment error",body:d}),X.append(N)}let O=c("div","br-deploy-nav");for(let N of ys){let _=c("button",`br-deploy-tab ${s===N.id?"active":""}`,N.label);_.onclick=()=>{s=N.id,d="",q()},O.append(_)}X.append(O);let ne=c("div","br-stack");if(X.append(ne),s==="cloudflare")Ne(ne,{label:"Account ID",value:x.accountId,placeholder:"Cloudflare dashboard -> Overview",onChange:(N)=>x.accountId=N}),Ne(ne,{label:"API Token",value:x.apiToken,password:!0,placeholder:"Cloudflare Workers edit permissions",onChange:(N)=>x.apiToken=N}),Ne(ne,{label:"Worker Name",value:x.projectName,placeholder:"blackrouter-relay (optional)",onChange:(N)=>x.projectName=N});else if(s==="vercel")Ne(ne,{label:"Vercel API Token",value:W.vercelToken,password:!0,placeholder:"Account Settings -> Tokens",onChange:(N)=>W.vercelToken=N}),Ne(ne,{label:"Project Name",value:W.projectName,placeholder:"blackrouter-relay (optional)",onChange:(N)=>W.projectName=N});else if(s==="deno")Ne(ne,{label:"Deno Access Token",value:S.denoToken,password:!0,placeholder:"Deno Deploy -> Access Tokens",onChange:(N)=>S.denoToken=N}),Ne(ne,{label:"Organization / Subdomain",value:S.orgDomain,placeholder:"your-org.deno.dev",onChange:(N)=>S.orgDomain=N}),Ne(ne,{label:"Project Name",value:S.projectName,placeholder:"blackrouter-relay (optional)",onChange:(N)=>S.projectName=N});else if(s==="netlify")Ne(ne,{label:"Netlify Personal Access Token",value:V.netlifyToken,password:!0,placeholder:"User Settings -> Applications",onChange:(N)=>V.netlifyToken=N}),Ne(ne,{label:"Site Name",value:V.projectName,placeholder:"blackrouter-relay (optional)",onChange:(N)=>V.projectName=N});else if(s==="http")Ne(ne,{label:"Proxy Name",value:u.name,placeholder:"e.g. Clash / Corporate Proxy",onChange:(N)=>u.name=N}),Ne(ne,{label:"Proxy URL",value:u.proxyUrl,placeholder:"http://127.0.0.1:7890 or http://user:pass@host:port",onChange:(N)=>u.proxyUrl=N});let Ce=c("div","br-row");if(L(Ce,a?"Saving...":s==="http"?"Add Proxy":"Deploy & Activate",()=>void P(),"primary"),s!=="http")L(Ce,"Copy Standalone Script",()=>void le(s));L(Ce,"Cancel",()=>{n=!1,q()}),X.append(Ce),o.append(X)}let{card:rt}=Me(o,"Configured Proxy Pools",m==="single"?'Manage deployed relays. Click "Set Primary" to route calls through that relay.':"Manage deployed relays. Toggle relays to include or exclude them from the active rotation pool.");if(h.config.proxyPools.length===0){let X=c("p","br-card-desc","No proxy pools configured. Deploy one using the button above to route through Cloudflare, Vercel, Deno, Netlify, or Forward Proxy.");rt.append(X)}else{let X=c("div","br-pool-grid");for(let O of h.config.proxyPools){let ne=h.config.activePoolId?O.id===h.config.activePoolId:O.isActive,Ce=m==="single"?ne:O.isActive,N=c("div",`br-pool-card ${Ce?"active":""}`),_=c("div","br-pool-left"),T=c("div","br-pool-info"),K=c("div","br-pool-title-row");K.append(c("span","br-pool-name",O.name)),K.append(c("span","br-badge br-badge-neutral",O.type==="http"?"Forward Proxy":`${O.type} Relay`));let xe=typeof O.rateLimitedUntil==="number"?O.rateLimitedUntil-Date.now():0,ke=xe>0;if(ke)K.append(c("span","br-badge br-badge-stopped","429 cooldown"));else if(O.testStatus==="active")K.append(c("span","br-badge br-badge-running","Healthy"));else if(O.testStatus==="error")K.append(c("span","br-badge br-badge-stopped","Failed"));if(T.append(K),T.append(c("span","br-pool-url",O.proxyUrl)),ke){let w=Math.ceil(xe/1000),Re=Math.floor(w/60),z=w%60,se=Re>0?Re+"m "+String(z).padStart(2,"0")+"s":z+"s";T.append(c("p","br-card-desc","Upstream rate-limited this pool. Requests skip it for another "+se+"."))}_.append(T),N.append(_);let J=c("div","br-pool-actions");if(m==="single")L(J,ne?"Primary ✓":"Set Primary",()=>void we(O),ne?"primary":"default");else L(J,O.isActive?"In Rotation ✓":"Add to Rotation",()=>void D(O),O.isActive?"primary":"default");let Ee=l===O.id,re=typeof O.rateLimitedUntil==="number"&&O.rateLimitedUntil>Date.now(),g=L(J,Ee?"Testing...":"Test",()=>void be(O.id));if(g.disabled=Ee||re,re)g.title="This pool is cooling down after HTTP 429; wait until the displayed cooldown ends.";if(O.type!=="http")L(J,"Copy Script",()=>void le(O.type));L(J,"Delete",()=>void Fe(O.id),"destructive"),N.append(J),X.append(N)}rt.append(X)}};return{element:o,render:q}};var pn=(e,t,r,o)=>{let n=ct(document.createElement("div")),s="",a=!1,d=!1,l="",u=(A)=>{s=String(A.config.port)},x=async(A,le)=>{try{await r.writeClipboard(A),await r.toast({kind:"success",message:`${le} copied.`})}catch{l="The clipboard refused the copy.",V()}},W=async()=>{let A=Number(s);if(!Number.isInteger(A)||A<1024||A>65535){l="The port must be a whole number between 1024 and 65535.",V();return}l="",await e.run((P)=>P.patchConfig({port:A}));let le=e.state();if(le)u(le);V()},S=async()=>{l="",await e.run((A)=>A.rotateKey()),await r.toast({kind:"success",message:"New API key generated and saved."}),V()},V=()=>{n.replaceChildren();let A=e.state();if(!A){if(e.error()){Mt(n,{title:"Local service is not reachable",body:"Allow the local service for BlackRouter in Settings -> Extensions, then retry.",action:{label:"Retry",onClick:()=>{e.load()}}});return}let g=sn(n);Wr(g,{label:"Connecting to local service..."});return}if(!a)u(A),a=!0;if(!A.running){let g=c("div");n.append(g),De(g,{tone:"error",title:"Router listener is not active",body:A.routerError||"The listener did not start. Change the port below and save."})}if(l){let g=c("div");n.append(g),De(g,{tone:"error",title:"Action failed",body:l})}let{card:le}=Me(n,"Connection & Endpoint","OpenCode and any OpenAI-compatible client connect to this loopback address."),P=c("div","br-kv-grid");le.append(P);let D=c("div","br-kv-box");D.append(c("span","br-kv-label","Base URL (Endpoint)"));let oe=c("div","br-kv-val");oe.append(c("span","br-kv-text",A.endpoint)),L(oe,"Copy URL",()=>void x(A.endpoint,"Endpoint")),D.append(oe),P.append(D);let Te=c("div","br-kv-box");Te.append(c("span","br-kv-label","API Key"));let we=c("div","br-kv-val");we.append(c("span","br-kv-text",d?A.config.apiKey:`${A.config.apiKey.slice(0,7)}••••••••••••••••`));let ae=c("div","br-row");L(ae,d?"Hide":"Reveal",()=>{d=!d,V()}),L(ae,"Copy",()=>void x(A.config.apiKey,"API key")),L(ae,"Rotate",()=>void S()),we.append(ae),Te.append(we),P.append(Te);let Fe=c("div","br-kv-box");Fe.append(c("span","br-kv-label","Listening Port"));let be=c("div","br-kv-val"),q=c("input","br-search-input br-mono");q.type="number",q.value=s,q.style.maxWidth="110px",q.oninput=()=>{s=q.value,h.disabled=s===String(A.config.port)},be.append(q);let h=L(be,"Save Port",()=>void W(),"primary");h.disabled=s===String(A.config.port),Fe.append(be),P.append(Fe);let m=c("div","br-kv-box");m.append(c("span","br-kv-label","RTK Token Saver"));let M=c("div","br-kv-val");qr(M,{label:A.config.rtkEnabled!==!1?"Enabled":"Disabled",description:"Compacts git diff, status, and grep tool outputs (saves ~30% tokens)",checked:A.config.rtkEnabled!==!1,onChange:(g)=>{e.run((w)=>w.patchConfig({rtkEnabled:g}))}}),m.append(M),P.append(m);let{card:ee}=Me(n,"Upstream Routing","Traffic to OpenCode Zen can route directly or through a serverless proxy pool."),pe=A.config.proxyStrategy||"single",i=A.config.proxyPools.filter((g)=>g.isActive),p=A.config.activePoolId?i.find((g)=>g.id===A.config.activePoolId)||i[0]:i[0],E=c("div","br-pool-card active"),G=c("div","br-pool-left"),Y=c("div","br-pool-info"),j=c("div","br-pool-title-row");if(pe==="round-robin")j.append(c("span","br-pool-name","Round-Robin Rotation")),j.append(c("span","br-badge br-badge-running",`${i.length} Pools`)),Y.append(j),Y.append(c("span","br-pool-url",`Sequential rotation with sticky turn limit ${A.config.stickyLimit||1}`));else if(pe==="random")j.append(c("span","br-pool-name","Random Upstream Routing")),j.append(c("span","br-badge br-badge-primary",`${i.length} Pools`)),Y.append(j),Y.append(c("span","br-pool-url","Uniform random distribution across active proxy pools"));else if(p){j.append(c("span","br-pool-name",p.name));let g=c("span","br-badge br-badge-primary",p.type);j.append(g),Y.append(j),Y.append(c("span","br-pool-url",p.proxyUrl))}else{j.append(c("span","br-pool-name","Direct Routing"));let g=c("span","br-badge br-badge-neutral","Direct");j.append(g),Y.append(j),Y.append(c("span","br-pool-url","Direct requests from this machine to https://opencode.ai/zen/v1"))}G.append(Y),E.append(G);let ue=c("div","br-pool-actions");if(o)L(ue,"Manage Proxy Pools",()=>o("proxy-pools"));E.append(ue),ee.append(E);let de=A.requests,ye=de.length,Xe=de.filter((g)=>g.status>=200&&g.status<300).length,rt=de.filter((g)=>g.status===429).length,X=de.filter((g)=>g.fallbackUsed===!0).length,O=de.filter((g)=>g.status<200||g.status>=300).length,ne=ye>0?Math.round(de.reduce((g,w)=>g+Math.max(0,w.ms),0)/ye):null,Ce=de.filter((g)=>g.inputTokens!==void 0||g.outputTokens!==void 0||g.totalTokens!==void 0).length,N=de.reduce((g,w)=>g+(w.inputTokens??0),0),_=de.reduce((g,w)=>g+(w.outputTokens??0),0),T=de.reduce((g,w)=>g+(w.totalTokens??(w.inputTokens!==void 0&&w.outputTokens!==void 0?w.inputTokens+w.outputTokens:0)),0),K=new Intl.NumberFormat,{card:xe}=Me(n,"Usage & Reliability","Summary of the most recent persisted request records. Token figures include only usage reported by the upstream."),ke=c("div","br-kv-grid"),J=(g,w,Re)=>{let z=c("div","br-kv-box");z.append(c("span","br-kv-label",g));let se=c("div","br-kv-val");if(se.append(c("span","br-kv-text",w)),z.append(se),Re)z.append(c("span","br-card-desc",Re));ke.append(z)},Ee=ye>0?Math.round(Xe/ye*100):null;J("Requests",K.format(ye),"Stored request records"),J("Success rate",Ee===null?"—":Ee+"%",K.format(Xe)+" successful"),J("Errors",K.format(O),K.format(rt)+" rate-limited (429)"),J("Fallbacks",K.format(X),"Requests answered by a fallback model"),J("Average latency",ne===null?"—":ne+" ms","Across stored requests"),J("Reported tokens",Ce>0?K.format(T):"Not reported",Ce>0?K.format(N)+" input · "+K.format(_)+" output · reported on "+Ce+"/"+ye+" requests":"No upstream token usage was available in this history"),xe.append(ke);let{card:re}=Me(n,"Recent Calls","The most recent request metadata is stored locally; prompts, tool output, and response bodies are not saved.");if(A.requests.length===0){let g=c("p","br-card-desc","No requests yet. Calls from OpenCode or other clients will appear here.");re.append(g)}else{let g=c("div");for(let w of A.requests.slice(0,8)){let Re=c("div","br-call-row"),z=c("div","br-call-left"),se=c("span",`br-badge ${w.status>=200&&w.status<300?"br-badge-running":"br-badge-stopped"}`,String(w.status));z.append(se);let Ie=w.requestedModel&&w.requestedModel!==w.model?w.requestedModel+" → "+(w.model||w.path):w.model||w.path;if(z.append(c("span","br-call-name",Ie)),w.poolName)z.append(c("span","br-badge br-badge-neutral",w.poolName));if(w.fallbackUsed)z.append(c("span","br-badge br-badge-primary","Fallback"));Re.append(z);let ot=[];if(w.totalTokens!==void 0)ot.push(K.format(w.totalTokens)+" tokens");else if(w.inputTokens!==void 0||w.outputTokens!==void 0){let nt=(w.inputTokens??0)+(w.outputTokens??0);ot.push(K.format(nt)+" reported tokens")}if(ot.push(w.ms+"ms"),Re.append(c("span","br-call-ms",ot.join(" · "))),g.append(Re),w.fallbackReason){let nt=c("p","br-card-desc","Fallback reason: "+w.fallbackReason);nt.style.margin="0 0 8px 0",g.append(nt)}}re.append(g)}};return{element:n,render:V}};var Rt=zr(),un=document.querySelector("#root");if(!un)throw Error("Missing root");var mn=document.createElement("style");mn.textContent=nn;document.head.append(mn);Rt.onReady((e)=>Br(e,document.documentElement));var xr=rn(Rt),$e=on(xr),Jt=document.createElement("div");Jt.className="br-root";un.replaceChildren(Jt);var so=document.createElement("header");so.className="br-header";var ao=document.createElement("div");ao.className="br-header-left";var io=document.createElement("div");io.className="br-logo-box";io.textContent="⚡";var co=document.createElement("div");co.className="br-header-titles";var lo=document.createElement("div");lo.className="br-title-row";var fn=document.createElement("h1");fn.textContent="BlackRouter";var Kt=document.createElement("span");Kt.className="br-badge br-badge-neutral";Kt.textContent="Connecting...";lo.append(fn,Kt);var po=document.createElement("p");po.className="br-header-sub";po.textContent="OpenCode Zen Local Endpoint & Proxy Pools";co.append(lo,po);ao.append(io,co);var uo=document.createElement("div");uo.className="br-header-right";var xs=st(uo,{label:"Refresh",variant:"outline",size:"sm",onClick:()=>{$e.load()}});so.append(ao,uo);Jt.append(so);var mo=document.createElement("div");mo.className="br-nav-bar";var hn=document.createElement("div");mo.append(hn);Jt.append(mo);var vr=document.createElement("main");vr.className="br-stack";Jt.append(vr);var kr=document.createElement("div");kr.hidden=!0;var vs=De(kr,{tone:"error",title:""});vr.append(kr);var yr="router",fo=null,ho=(e)=>{yr=e,fo?.update({activeId:yr});for(let r of go)r.element.hidden=r.id!==e;let t=$e.state();if(e==="models"&&t&&t.models.length===0&&!$e.busy())$e.run((r)=>r.refreshModels())},gn=pn($e,xr,Rt,(e)=>ho(e)),bn=ln($e,xr,Rt),yn=cn($e,xr,Rt),xn=dn($e,Rt),go=[{id:"router",label:"Router",element:gn.element},{id:"proxy-pools",label:"Proxy Pools",element:bn.element},{id:"models",label:"Models",element:yn.element},{id:"opencode",label:"OpenCode",element:xn.element}];for(let e of go)vr.append(e.element);fo=Yr(hn,{items:go.map((e)=>({id:e.id,label:e.label})),activeId:yr,onChange:ho});ho("router");var ks=()=>{let e=$e.state();if(e){Kt.className=`br-badge ${e.running?"br-badge-running":"br-badge-stopped"}`,Kt.innerHTML=`<span class="br-dot ${e.running?"on":"off"}"></span> ${e.running?`127.0.0.1:${e.config.port}`:"Stopped"}`;let o=e.config.proxyPools.length,n=e.models.length,s=e.registration.installed;fo?.update({activeId:yr,items:[{id:"router",label:"Router"},{id:"proxy-pools",label:o>0?`Proxy Pools (${o})`:"Proxy Pools"},{id:"models",label:n>0?`Models (${n})`:"Models"},{id:"opencode",label:s?"OpenCode ✓":"OpenCode"}]})}let t=$e.error(),r=Boolean(t)&&e!==null;if(kr.hidden=!r,t&&r)vs.update({tone:"error",title:"Local service notice",body:t});xs.update({loading:$e.busy()}),gn.render(),bn.render(),yn.render(),xn.render()};$e.subscribe(ks);$e.load();setInterval(()=>{$e.poll()},30000);})();
