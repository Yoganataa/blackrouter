(()=>{var J="openchamber.sdk",Y=1;var kr=`
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
`;var Sr=128,Tr=65536;var _o=["file","directory","other","missing"],Er=(e)=>Boolean(e&&"sessionId"in e),Ar=(e)=>Boolean(e&&"sent"in e&&!("sessionId"in e));var Jt=500,Yt=32000,ko=16000,So=128,To=200,wo=2000,Eo=16000,Ao=80,Co=200,Ro=16000;var Po=2000;var Cr=20000,Wt=1024,qt=2000000;var Qt=64000,Zt=8000,Rr=4000;var Pr=90000;var Oo=999,er=500,Io=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED"],Mo=["stopped","starting","ready","failed"],_n=new Set(Io),No=(e)=>_n.has(e),Lo=(e)=>e&&No(e)?e:"HOST_REJECTED",pt=(e)=>{if(e===void 0)return!1;if(e===null||e===!0||e===!1)return!0;if(String(e)===e)return!0;if(Number(e)===e)return Number.isFinite(e);if(Array.isArray(e))return e.every(pt);if(Object(e)===e)return Object.values(e).every(pt);return!1},$o=(e)=>pt(e)&&JSON.stringify(e).length<=Ro,vo=(e)=>e?.trim().slice(0,Co)??"",ut=(e)=>{let t=e.id.trim().slice(0,So),r=e.title.trim().slice(0,To),o=e.url.trim().slice(0,wo),n=e.text?.trim().slice(0,Eo),s=e.author?.trim().slice(0,Ao),a=e.kind==="pull"?"pull":"issue",c={providerId:e.providerId.trim(),id:t,title:r||t,url:o,kind:a};if(n)c.text=n;if(s)c.author=s;if(a==="pull"){let l=vo(e.branches?.head),u=vo(e.branches?.base);if(l&&u)c.branches={head:l,base:u}}if($o(e.data))c.data=e.data;return c},Or=(e)=>{let t=ut(e);if(e.projectId)t.projectId=e.projectId;if(e.navigation)t.navigation=e.navigation;if(e.worktree)t.worktree=e.worktree;return t},Ir=(e)=>{let t={text:e.text.trim().slice(0,ko)};if(e.send)t.send=!0;return t},Mr=(e)=>{if(e===null||!Number.isFinite(e))return null;return Math.min(Oo,Math.max(0,Math.round(e)))};var mt=(e)=>e.length>0&&e.length<=Wt&&!e.includes("\x00")&&!e.includes("\\");var tr=(e)=>{if(!e.startsWith("/")||e.includes("\x00")||e.includes("\\")||e.includes("://"))return!1;if(e.length>Po)return!1;return!e.split("/").some((r)=>r==="."||r==="..")},kn=new Set(Mo),Nr=(e)=>Boolean(e&&"status"in e&&kn.has(String(e.status))&&!("body"in e)),rr=(e)=>Boolean(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Lr=(e)=>Boolean(e&&"content"in e&&String(e.content)===e.content),$r=(e)=>Boolean(e&&"written"in e&&e.written===!0),Ur=(e)=>Boolean(e&&"entries"in e&&Array.isArray(e.entries)),Sn=new Set(_o),Dr=(e)=>Boolean(e&&"kind"in e&&"size"in e&&Sn.has(String(e.kind))&&Number.isFinite(e.size)),Gr=(e)=>Boolean(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),Tn=new Set(["workspace","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action"]),wn=(e)=>Object(e)===e?e:null,wr=(e)=>String(e)===e&&e.length>0,En=(e)=>{if(!wr(e.id))return null;if(e.ok===!0){let t={channel:J,v:Y,type:"result",id:e.id,ok:!0};if(Object(e.payload)===e.payload)t.payload=e.payload;return t}if(e.ok===!1&&wr(e.error))return{channel:J,v:Y,type:"result",id:e.id,ok:!1,error:e.error,code:Lo(wr(e.code)?e.code:void 0)};return null},jr=(e)=>{let t=wn(e);if(!t||t.channel!==J||t.v!==Y)return null;if(t.type==="result")return En(t);if(!Tn.has(String(t.type))||Object(t.payload)!==t.payload)return null;return t};class B extends Error{code;constructor(e,t){super(t);this.name="HostRequestError",this.code=e}}var Uo=()=>Promise.reject(new B("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),or=()=>Promise.reject(new B("BAD_PATH",`File path must be 1 to ${Wt} characters without NUL or backslash.`)),q=(e)=>(e.value+=1,`oc-${e.value}`),zr=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new B("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let r=e.acceptSource??((i)=>i===t.parent),o=e.requestTimeoutMs??Cr,n=new Set,s=new Set,a=new Set,c=new Set,l=new Set,u=new Set,y=new Set,K=null,_=null,H=new Map,E=new Map,ae=!1,C={value:0},M=null,Q=null,ve=(i)=>{if(!i)return null;return{sessionId:i.id,phase:i.busy?"started":"completed"}},Te=(i)=>{t.parent.postMessage(i,"*")},te=(i,p)=>{for(let T of i)try{T(p)}catch(N){console.error(N)}},He=(i)=>{if(!(i instanceof MessageEvent))return;if(!r(i.source))return;let p=jr(i.data);if(!p)return;if(p.type==="workspace"){let N=E.get(p.payload.subscriptionId);if(N)te([N],p.payload.snapshot);return}if(p.type==="ready"){if(M=p.payload,Q=ve(p.payload.session),te(n,p.payload),te(s,p.payload.directory),te(a,p.payload.session),Q)te(c,Q);te(l,p.payload.connection),te(u,p.payload.settings),te(y,p.payload.item);return}if(p.type==="directory"){if(M)M={...M,directory:p.payload.directory};te(s,p.payload.directory);return}if(p.type==="session"){if(M)M={...M,session:p.payload.session};if(!p.payload.session)Q=null;else if(Q?.sessionId!==p.payload.session.id)Q=ve(p.payload.session);te(a,p.payload.session);return}if(p.type==="session-lifecycle"){Q=p.payload,te(c,p.payload);return}if(p.type==="connection"){if(M)M={...M,connection:p.payload.connection};te(l,p.payload.connection);return}if(p.type==="settings"){if(M)M={...M,settings:p.payload.settings};te(u,p.payload.settings);return}if(p.type==="item"){if(M)M={...M,item:p.payload.item};te(y,p.payload.item);return}if(p.type==="action"){let N=(L)=>{if(!ae)Te({channel:J,v:Y,type:"action-result",id:p.id,payload:L})},X=_;if(!X){N({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>X(p.payload)).then(()=>N({ok:!0}),(L)=>{let ce=(L instanceof Error?L.message:String(L)).trim();N({ok:!1,error:(ce||"Action failed.").slice(0,er)})});return}if(p.type==="resolve"){let N=(L)=>{Te({channel:J,v:Y,type:"resolve-result",id:p.id,payload:L})},X=K;if(!X){N({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>X(p.payload)).then((L)=>N({item:L?ut(L):null}),(L)=>{let ce=(L instanceof Error?L.message:String(L)).trim();N({error:(ce||"Command failed.").slice(0,er)})});return}let T=H.get(p.id);if(!T)return;if(clearTimeout(T.timer),H.delete(p.id),p.ok){T.resolve(p.payload);return}T.reject(new B(p.code,p.error))};t.addEventListener("message",He),Te({channel:J,v:Y,type:"hello"});let he=(i,p=o)=>{if(ae||t.parent===t)return Promise.reject(new B("HOST_UNAVAILABLE","No host frame. This page is not in an iframe."));return new Promise((T,N)=>{let X=setTimeout(()=>{H.delete(i.id),N(new B("HOST_TIMEOUT","Host did not answer in time."))},p);H.set(i.id,{resolve:T,reject:N,timer:X}),Te(i)})},F=(i)=>he(i).then(()=>{return}),h={channel:J,v:Y},m=(i,p=1024)=>{if(!i.trim()||i.length>p)throw new B("HOST_REJECTED",`Identity must contain 1 to ${p} characters.`)},R=async(i)=>{if(i.kind!=="projects")m(i.projectId);let p=await he({...h,type:"workspace-read",id:q(C),payload:i});if(!p||!("kind"in p)||!("state"in p)||p.kind!==i.kind)throw new B("HOST_REJECTED","Host did not return workspace data.");return p},W=async(i,p)=>{if(i.kind!=="projects")m(i.projectId);let T=q(C);E.set(T,p);try{await F({...h,type:"workspace-subscribe",id:q(C),payload:{subscriptionId:T,query:i}})}catch(N){if(E.delete(T),!ae)Te({...h,type:"workspace-unsubscribe",id:q(C),payload:{subscriptionId:T}});throw N}return()=>{if(!E.delete(T)||ae)return;Te({...h,type:"workspace-unsubscribe",id:q(C),payload:{subscriptionId:T}})}},ie=async(i)=>{if("key"in i&&(i.key.length===0||i.key.length>Sr))throw new B("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(i.op==="set"&&!pt(i.value))throw new B("HOST_REJECTED","Storage values must be JSON.");if(i.op==="set"&&new TextEncoder().encode(JSON.stringify(i.value)).length>Tr)throw new B("HOST_REJECTED","Storage value exceeds 64 KiB.");let p=await he({...h,type:"storage",id:q(C),payload:i});if(!p||!("storage"in p)||p.op!==i.op)throw new B("HOST_REJECTED","Host did not return storage data.");return p};return{onAction:(i)=>(_=i,()=>{if(_===i)_=null}),listProjects:async()=>{let i=await R({kind:"projects"});if(i.kind!=="projects")throw new B("HOST_REJECTED","Expected projects.");return i},listWorktrees:async(i)=>{let p=await R({kind:"worktrees",projectId:i});if(p.kind!=="worktrees")throw new B("HOST_REJECTED","Expected worktrees.");return p},listSessions:async(i)=>{let p=await R({kind:"sessions",projectId:i});if(p.kind!=="sessions")throw new B("HOST_REJECTED","Expected sessions.");return p},onProjects:(i)=>W({kind:"projects"},(p)=>{if(p.kind==="projects")i(p)}),onWorktrees:(i,p)=>W({kind:"worktrees",projectId:i},(T)=>{if(T.kind==="worktrees")p(T)}),onSessions:(i,p)=>W({kind:"sessions",projectId:i},(T)=>{if(T.kind==="sessions")p(T)}),openSession:async(i)=>{m(i),await F({...h,type:"open-session",id:q(C),payload:{sessionId:i}})},storage:{get:async(i)=>{let p=await ie({op:"get",key:i});return p.op==="get"&&p.found?p.value:void 0},set:async(i,p)=>{await ie({op:"set",key:i,value:p})},delete:async(i)=>{await ie({op:"delete",key:i})},keys:async()=>{let i=await ie({op:"keys"});if(i.op!=="keys")throw new B("HOST_REJECTED","Expected storage keys.");return i.keys}},onReady:(i)=>{if(n.add(i),M)i(M);return()=>{n.delete(i)}},onDirectory:(i)=>{if(s.add(i),M)i(M.directory);return()=>{s.delete(i)}},onSession:(i)=>{if(a.add(i),M)i(M.session);return()=>{a.delete(i)}},onSessionLifecycle:(i)=>{if(c.add(i),Q)i(Q);return()=>{c.delete(i)}},onConnection:(i)=>{if(l.add(i),M)i(M.connection);return()=>{l.delete(i)}},onSettings:(i)=>{if(u.add(i),M)i(M.settings);return()=>{u.delete(i)}},onItem:(i)=>{if(y.add(i),M)i(M.item);return()=>{y.delete(i)}},onResolve:(i)=>(K=i,()=>{if(K===i)K=null}),toast:(i)=>{let p=i.message.trim();if(!p||p.length>Jt)return Promise.reject(new B("HOST_REJECTED",`Toast message must contain 1 to ${Jt} characters.`));if(i.copy&&i.copy!==!0&&(!i.copy.text.length||i.copy.text.length>Yt))return Promise.reject(new B("HOST_REJECTED",`Toast copy text must contain 1 to ${Yt} characters.`));return F({channel:J,v:Y,type:"toast",id:q(C),payload:{...i,message:p}})},openUrl:(i)=>F({channel:J,v:Y,type:"open-url",id:q(C),payload:{url:i}}),openSurface:(i)=>F({channel:J,v:Y,type:"open-surface",id:q(C),payload:{surfaceId:i}}),writeClipboard:(i)=>F({channel:J,v:Y,type:"clipboard-write",id:q(C),payload:{text:i}}),compose:(i)=>F({channel:J,v:Y,type:"compose",id:q(C),payload:i}),attach:(i)=>F({channel:J,v:Y,type:"attach",id:q(C),payload:ut(i)}),startSession:async(i)=>{if(i.projectId!==void 0)m(i.projectId);let p=i.worktree;if(p&&p!==!0)if(p.kind==="existing")m(p.directory);else{if(p.name!==void 0)m(p.name,200);if(p.baseBranch!==void 0)m(p.baseBranch,200)}let T=await he({channel:J,v:Y,type:"start-session",id:q(C),payload:Or(i)},e.requestTimeoutMs??180000);if(!Er(T))throw new B("HOST_REJECTED","Host did not return a session.");return T},prompt:(i)=>he({channel:J,v:Y,type:"prompt",id:q(C),payload:Ir(i)}).then((p)=>{if(!Ar(p))throw new B("HOST_REJECTED","Host did not return a prompt result.");return p}),sessionLink:(i)=>F({channel:J,v:Y,type:"session-link",id:q(C),payload:ut(i)}),close:()=>F({channel:J,v:Y,type:"close",id:q(C)}),oauthStart:()=>F({channel:J,v:Y,type:"oauth-start",id:q(C)}),oauthDisconnect:()=>F({channel:J,v:Y,type:"oauth-disconnect",id:q(C)}),request:(i)=>(tr(i.path)?he({channel:J,v:Y,type:"request",id:q(C),payload:i}):Uo()).then((p)=>{if(!rr(p))throw new B("HOST_REJECTED","Host request result was empty.");return p}),serviceRequest:(i)=>(tr(i.path)?he({channel:J,v:Y,type:"service-request",id:q(C),payload:i}):Uo()).then((p)=>{if(!rr(p))throw new B("HOST_REJECTED","Host service request result was empty.");return p}),serviceStatus:()=>he({channel:J,v:Y,type:"service-status",id:q(C)}).then((i)=>{if(!Nr(i))throw new B("HOST_REJECTED","Host did not return service status.");return i}),readFile:(i)=>(mt(i)?he({channel:J,v:Y,type:"file-read",id:q(C),payload:{path:i}}):or()).then((p)=>{if(!Lr(p))throw new B("HOST_REJECTED","Host did not return file content.");return p}),writeFile:(i,p)=>{if(!mt(i))return or();if(p.length>qt)return Promise.reject(new B("FILE_TOO_LARGE",`Content is over ${qt} characters.`));return he({channel:J,v:Y,type:"file-write",id:q(C),payload:{path:i,content:p}}).then((T)=>{if(!$r(T))throw new B("HOST_REJECTED","Host did not confirm the write.");return T})},listDir:(i)=>(mt(i)?he({channel:J,v:Y,type:"file-list",id:q(C),payload:{path:i}}):or()).then((p)=>{if(!Ur(p))throw new B("HOST_REJECTED","Host did not return directory entries.");return p}),stat:(i)=>(mt(i)?he({channel:J,v:Y,type:"file-stat",id:q(C),payload:{path:i}}):or()).then((p)=>{if(!Dr(p))throw new B("HOST_REJECTED","Host did not return file status.");return p}),generate:(i)=>{let p=i.prompt.trim(),T=i.system?.trim();if(p.length===0||p.length>Qt)return Promise.reject(new B("HOST_REJECTED",`Prompt must be 1 to ${Qt} characters.`));if(T!==void 0&&(T.length===0||T.length>Zt))return Promise.reject(new B("HOST_REJECTED",`System prompt must be 1 to ${Zt} characters.`));let N=i.maxOutputTokens===void 0?void 0:Math.min(Rr,Math.max(1,Math.floor(i.maxOutputTokens)));if(N!==void 0&&!Number.isFinite(N))return Promise.reject(new B("HOST_REJECTED","maxOutputTokens must be a number."));let X={prompt:p};if(T!==void 0)X.system=T;if(N!==void 0)X.maxOutputTokens=N;return he({channel:J,v:Y,type:"generate",id:q(C),payload:X},e.requestTimeoutMs??Pr).then((L)=>{if(!Gr(L))throw new B("HOST_REJECTED","Host did not return generated text.");return L})},setBadge:(i)=>F({channel:J,v:Y,type:"badge",id:q(C),payload:{count:Mr(i)}}),dispose:()=>{for(let i of E.keys())Te({...h,type:"workspace-unsubscribe",id:q(C),payload:{subscriptionId:i}});E.clear(),ae=!0,K=null,_=null,t.removeEventListener("message",He);for(let i of H.values())clearTimeout(i.timer),i.reject(new B("HOST_UNAVAILABLE","Host client was disposed."));H.clear(),n.clear(),s.clear(),a.clear(),c.clear(),l.clear(),u.clear(),y.clear()}}};var An=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Do=(e,t)=>{t.style.colorScheme=e.mode;for(let[r,o]of An)t.style.setProperty(r,e.tokens[o]);t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size","0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},Br=(e,t)=>{if(Do(e.theme,t),t.dataset)t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode};var ft=(e)=>{while(e.firstChild)e.removeChild(e.firstChild)},pe=(e)=>{let t=document.getElementById("oc-sdk-ui-style");if(t instanceof HTMLStyleElement){if(t.textContent!==e)t.textContent=e;return}let r=document.createElement("style");r.id="oc-sdk-ui-style",r.textContent=e,document.head.appendChild(r)},I=(e,t)=>{let r=document.createElement(e);if(t)r.className=t;return r},Xe=(e)=>{let t=I("button",e);return t.type="button",t},ye=(e,t)=>{let r=t??"";if(e.textContent!==r)e.textContent=r},ht=(e,t,r)=>{if(r===void 0||r===null||r==="")e.removeAttribute(t);else if(e.getAttribute(t)!==r)e.setAttribute(t,r)};var Cn={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},re=(e,t)=>`var(--${e}, var(--oc-${Cn[e]}, ${t}))`,at=re("surface-background","transparent"),nr=re("surface-elevated","transparent"),Ct=re("surface-elevated-foreground","inherit"),Rt=re("surface-foreground","inherit"),ue=re("surface-muted-foreground","gray"),Rn=re("surface-muted","transparent"),Ue=re("interactive-border","currentColor"),Me=re("interactive-hover","transparent"),it=re("interactive-active","transparent"),Hr=re("interactive-selection","transparent"),Vr=re("interactive-selection-foreground","inherit"),zo=re("interactive-focus-ring","currentColor"),je=re("primary","currentColor"),Fr=re("primary-text","inherit"),Xr=re("error-text","inherit"),Pn=re("font-sans","inherit"),Kr=re("font-mono","monospace"),Go=re("radius","9px"),xe=(e,t,r="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${r})`,jo=`box-shadow: 0 0 0 2px ${zo};`,sr=(e)=>{let t=re(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${re(`${e}-text`,"inherit")}; }`},me=`
${kr}
.oc-sdk { box-sizing: border-box; color: ${Rt}; font-family: ${Pn}; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }
.oc-sdk :focus-visible { outline: none; ${jo} }
.oc-sdk-mono { font-family: ${Kr}; }
.oc-sdk-muted { color: ${ue}; }
${sr("success")}${sr("warning")}${sr("error")}${sr("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${je}; --oc-sdk-tone-text: ${Fr}; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 36px; padding: 0 14px; border: 1px solid transparent; border-radius: ${Go}; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="sm"] { height: 32px; padding: 0 10px; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { height: 24px; padding: 0 8px; font-size: 0.75rem; border-radius: 6px; }
.oc-sdk-btn[data-variant="default"] { color: ${Fr}; background: ${xe(je,10,at)}; border-color: ${xe(je,12)}; }
.oc-sdk-btn[data-variant="default"]:hover { background: ${xe(je,16,at)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${xe(je,22,at)}; }
.oc-sdk-btn[data-variant="secondary"] { background: ${Rn}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${Me}, ${Me}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${it}, ${it}); }
.oc-sdk-btn[data-variant="outline"] { background: ${nr}; color: ${Ct}; border-color: ${Ue}; }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${Me}, ${Me}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${it}, ${it}); }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${Me}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${it}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${re("status-error","red")}; color: ${Xr}; background: ${xe("var(--oc-sdk-tone)",7,at)}; border-color: ${xe("var(--oc-sdk-tone)",12)}; }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${xe("var(--oc-sdk-tone)",9,at)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${xe("var(--oc-sdk-tone)",11,at)}; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: 14px; height: 14px; }

.oc-sdk-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; color: ${ue}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Xr}; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: 36px; padding: 0 12px; border: 0; border-radius: ${Go}; background: ${nr}; color: ${Ct}; font-size: 0.875rem; line-height: 1.45; appearance: none; box-shadow: inset 0 0 0 1px ${xe(Ue,60)}; transition: background 150ms ease-out, box-shadow 150ms ease-out; }
textarea.oc-sdk-input { height: auto; padding: 8px 12px; resize: vertical; }
.oc-sdk-input::placeholder { color: ${ue}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${Me}, ${Me}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { box-shadow: inset 0 0 0 2px ${zo}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input { box-shadow: inset 0 0 0 1px ${re("status-error","red")}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { box-shadow: inset 0 0 0 2px ${re("status-error","red")}; }
.oc-sdk-input[data-mono="true"] { font-family: ${Kr}; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: 34px; padding-right: 34px; }
.oc-sdk-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: ${ue}; pointer-events: none; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${je}; }
.oc-sdk-search-clear { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; color: ${ue}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }
.oc-sdk-search-clear:hover { background: ${Me}; color: ${Rt}; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: 6px; width: 100%; min-width: 0; height: 32px; padding: 0 8px 0 10px; border: 1px solid ${Ue}; border-radius: 6px; background: ${nr}; color: ${Ct}; font-size: 0.8125rem; text-align: left; transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${Me}, ${Me}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${it}, ${it}); }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-value[data-empty="true"] { color: ${ue}; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; color: ${ue}; }
.oc-sdk-popup { --surface-foreground: ${Ct}; position: fixed; z-index: 50; display: flex; flex-direction: column; gap: 2px; min-width: 160px; max-width: calc(100vw - 16px); max-height: min(320px, calc(100vh - 16px)); overflow: auto; padding: 4px; border: 1px solid ${xe(Ue,60)}; border-radius: 12px; background: ${nr}; color: ${Ct}; box-shadow: 0 8px 24px ${xe(Rt,12)}; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: 2px 2px 4px; }
.oc-sdk-popup-search .oc-sdk-input { height: 32px; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; border-radius: 8px; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option[data-active="true"] { background: ${Me}; }
.oc-sdk-option[aria-selected="true"] { background: ${Hr}; color: ${Vr}; }
.oc-sdk-option[data-destructive="true"] { color: ${Xr}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${xe(re("status-error","red"),10)}; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; color: ${ue}; }
.oc-sdk-option-check { flex: 0 0 auto; width: 12px; }
.oc-sdk-popup-empty { padding: 8px; font-size: 0.8125rem; color: ${ue}; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: 8px; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; margin-top: 3px; border: 1px solid ${Ue}; border-radius: 4px; color: ${je}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${xe(je,65,Ue)}; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: 36px; height: 20px; border-radius: 9999px; background: ${Ue}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 9999px; background: ${at}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${je}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${jo} }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; color: ${ue}; }

.oc-sdk-tabs { display: inline-flex; gap: 2px; padding: 2px; border-radius: 10px; max-width: 100%; overflow: auto; }
.oc-sdk-tabs[data-track="true"] { background: ${xe(Rt,4)}; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border: 1px solid transparent; border-radius: 8px; font-size: 0.8125rem; font-weight: 500; color: ${ue}; white-space: nowrap; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${Rt}; }
.oc-sdk-tab[aria-selected="true"] { color: ${Vr}; background: ${Hr}; border-color: ${Ue}; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; color: ${ue}; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: 1px 6px; border-radius: 9999px; font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; background: ${Me}; color: ${ue}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${xe("var(--oc-sdk-tone)",15)}; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; border-radius: 6px; text-align: left; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${Me}; }
.oc-sdk-row[aria-selected="true"] { background: ${Hr}; color: ${Vr}; }
.oc-sdk-row-lead { flex: 0 0 auto; width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: ${Kr}; font-size: 0.75rem; color: ${ue}; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; color: ${ue}; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; color: ${ue}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { padding: 16px 8px; text-align: center; font-size: 0.8125rem; color: ${ue}; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 40px 16px; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; color: ${ue}; }
.oc-sdk-empty-action { margin-top: 12px; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: ${ue}; }
.oc-sdk-spinner-ring { width: 16px; height: 16px; border: 2px solid ${Ue}; border-top-color: ${je}; border-radius: 9999px; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: 12px; height: 12px; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: 12px; padding: 8px 12px; border: 1px solid ${xe("var(--oc-sdk-tone)",40)}; border-radius: 8px; background: ${xe("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { font-size: 0.8125rem; color: ${ue}; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: 8px; width: 100%; margin: 8px 0; font-size: 0.75rem; color: ${ue}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; background: ${xe(Ue,40)}; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: 4px 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; color: ${ue}; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: 6px; border-radius: 9999px; background: ${Ue}; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; border-radius: 9999px; background: var(--oc-sdk-tone, ${je}); transform-origin: left; transition: transform 200ms ease-out; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text a { color: ${Fr}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { display: block; max-width: 100%; margin: 8px 0; border-radius: 8px; border: 1px solid ${xe(Ue,60)}; }
`;var On=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},rt=(e,t)=>{pe(me);let r=t,o=Xe("oc-sdk oc-sdk-btn"),n=On(),s=document.createElement("span");o.append(s),e.append(o);let a=()=>{if(o.dataset.variant=r.variant??"default",o.dataset.size=r.size??"default",o.disabled=Boolean(r.disabled)||Boolean(r.loading),o.dataset.loading=r.loading?"true":"false",o.setAttribute("aria-busy",r.loading?"true":"false"),r.loading&&n.parentNode!==o)o.prepend(n);else if(!r.loading&&n.parentNode===o)n.remove();ye(s,r.label)},c=()=>{if(r.disabled||r.loading)return;r.onClick()};return o.addEventListener("click",c),a(),{update:(l)=>{r={...r,...l},a()},dispose:()=>{o.removeEventListener("click",c),o.remove()}}};var Re=(e,t)=>{pe(me);let r=t,o=I("label","oc-sdk oc-sdk-field"),n=I("span","oc-sdk-field-label"),s=r.multiline?I("textarea","oc-sdk-input"):I("input","oc-sdk-input"),a=I("span","oc-sdk-field-note");o.append(n,s,a),e.append(o);let c=()=>{if(ye(n,r.label),n.hidden=!r.label,s instanceof HTMLInputElement)s.type=r.password?"password":"text";else s.rows=r.rows??3;if(s.value!==r.value)s.value=r.value;s.disabled=Boolean(r.disabled),ht(s,"placeholder",r.placeholder),s.dataset.mono=r.mono?"true":"false";let u=Boolean(r.error);o.dataset.invalid=u?"true":"false",s.setAttribute("aria-invalid",u?"true":"false");let y=r.error??r.helper??"";ye(a,y),a.hidden=y===""},l=()=>{r.onChange(s.value)};return s.addEventListener("input",l),c(),{update:(u)=>{r={...r,...u},c()},dispose:()=>{s.removeEventListener("input",l),o.remove()}}};var In={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},ar=(e,t,r)=>{let o=document.createElementNS("http://www.w3.org/2000/svg","svg");if(o.setAttribute("viewBox","0 0 24 24"),o.setAttribute("width",String(t)),o.setAttribute("height",String(t)),o.setAttribute("aria-hidden","true"),o.setAttribute("fill","currentColor"),r)o.setAttribute("class",r);let n=document.createElementNS("http://www.w3.org/2000/svg","path");return n.setAttribute("d",In[e]),o.append(n),o};var gt=(e,t="vertical")=>{let[r,o]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];if(e.key===r||e.ctrlKey&&e.key.toLowerCase()==="n")return"next";if(e.key===o||e.ctrlKey&&e.key.toLowerCase()==="p")return"previous";if(e.key==="Home")return"first";if(e.key==="End")return"last";return null},bt=(e,t,r)=>{let o=e.filter((l)=>!l.disabled);if(o.length===0)return null;let n=o[0],s=o[o.length-1];if(r==="first"||!n||!s)return n?.id??null;if(r==="last")return s.id;let a=o.findIndex((l)=>l.id===t);if(a===-1)return r==="next"?n.id:s.id;return o[Math.min(o.length-1,Math.max(0,a+(r==="next"?1:-1)))]?.id??null};var Bo=(e,t,r)=>{pe(me);let o=t,n=Xe("oc-sdk oc-sdk-check");n.setAttribute("role",r);let s=I("span",r==="switch"?"oc-sdk-check-thumb":"oc-sdk-check-box");if(r==="checkbox")s.append(ar("check",12));let a=I("span","oc-sdk-check-text"),c=I("span","oc-sdk-check-label"),l=I("span","oc-sdk-check-desc");a.append(c,l),n.append(s,a),e.append(n);let u=()=>{n.setAttribute("aria-checked",o.checked?"true":"false"),n.disabled=Boolean(o.disabled),ye(c,o.label),ye(l,o.description),l.hidden=!o.description},y=()=>{if(!o.disabled)o.onChange(!o.checked)};return n.addEventListener("click",y),u(),{update:(K)=>{o={...o,...K},u()},dispose:()=>{n.removeEventListener("click",y),n.remove()}}},Jr=(e,t)=>Bo(e,t,"checkbox"),Yr=(e,t)=>Bo(e,t,"switch");var Wr=(e,t)=>{pe(me);let r=t,o=I("div","oc-sdk oc-sdk-tabs");o.setAttribute("role","tablist"),e.append(o);let n=()=>{ft(o),o.dataset.track=r.trackBackground?"true":"false";for(let a of r.items){let c=Xe("oc-sdk-tab");c.setAttribute("role","tab");let l=a.id===r.activeId;c.setAttribute("aria-selected",l?"true":"false"),c.tabIndex=l?0:-1,c.dataset.id=a.id;let u=I("span");if(u.textContent=a.label,c.append(u),a.count!==void 0){let y=I("span","oc-sdk-tab-count");y.textContent=String(a.count),c.append(y)}c.addEventListener("click",()=>{if(a.id!==r.activeId)r.onChange(a.id)}),o.append(c)}},s=(a)=>{let c=gt(a,"horizontal");if(!c)return;let l=bt(r.items,r.activeId,c);if(l&&l!==r.activeId){a.preventDefault(),r.onChange(l);let u=o.querySelector(`[data-id="${CSS.escape(l)}"]`);if(u instanceof HTMLElement)u.focus()}};return o.addEventListener("keydown",s),n(),{update:(a)=>{r={...r,...a},n()},dispose:()=>{o.removeEventListener("keydown",s),o.remove()}}};var Pt=(e,t)=>{pe(me);let r=t,o=I("div","oc-sdk oc-sdk-empty"),n=I("h2","oc-sdk-empty-title"),s=I("p","oc-sdk-empty-body"),a=I("div","oc-sdk-empty-action");o.append(n,s,a),e.append(o);let c=null,l=()=>{if(ye(n,r.title),ye(s,r.body),s.hidden=!r.body,a.hidden=!r.action,!r.action){c?.dispose(),c=null;return}let u={label:r.action.label,onClick:r.action.onClick};if(c)c.update(u);else c=rt(a,{...u,variant:"outline",size:"sm"})};return l(),{update:(u)=>{r={...r,...u},l()},dispose:()=>{c?.dispose(),c=null,o.remove()}}};var qr=(e,t={})=>{pe(me);let r=t,o=I("span","oc-sdk oc-sdk-spinner");o.setAttribute("role","status");let n=I("span","oc-sdk-spinner-ring");n.setAttribute("aria-hidden","true");let s=I("span");o.append(n,s),e.append(o);let a=()=>{o.dataset.size=r.size??"default",ye(s,r.label),s.hidden=!r.label,o.setAttribute("aria-label",r.label??"Loading")};return a(),{update:(c)=>{r={...r,...c},a()},dispose:()=>{o.remove()}}};var Ne=(e,t)=>{pe(me);let r=t,o=I("div","oc-sdk oc-sdk-banner"),n=I("div","oc-sdk-banner-text"),s=I("div","oc-sdk-banner-title"),a=I("div","oc-sdk-banner-body"),c=I("div","oc-sdk-banner-action");n.append(s,a),o.append(n,c),e.append(o);let l=null,u=()=>{if(o.dataset.tone=r.tone,o.setAttribute("role",r.tone==="error"||r.tone==="warning"?"alert":"status"),ye(s,r.title),ye(a,r.body),a.hidden=!r.body,c.hidden=!r.action,!r.action){l?.dispose(),l=null;return}let y={label:r.action.label,onClick:r.action.onClick};if(l)l.update(y);else l=rt(c,{...y,variant:"outline",size:"xs"})};return u(),{update:(y)=>{r={...r,...y},u()},dispose:()=>{l?.dispose(),l=null,o.remove()}}};var V;(function(e){e.assertEqual=(n)=>{};function t(n){}e.assertIs=t;function r(n){throw Error()}e.assertNever=r,e.arrayToEnum=(n)=>{let s={};for(let a of n)s[a]=a;return s},e.getValidEnumValues=(n)=>{let s=e.objectKeys(n).filter((c)=>typeof n[n[c]]!=="number"),a={};for(let c of s)a[c]=n[c];return e.objectValues(a)},e.objectValues=(n)=>e.objectKeys(n).map(function(s){return n[s]}),e.objectKeys=typeof Object.keys==="function"?(n)=>Object.keys(n):(n)=>{let s=[];for(let a in n)if(Object.prototype.hasOwnProperty.call(n,a))s.push(a);return s},e.find=(n,s)=>{for(let a of n)if(s(a))return a;return},e.isInteger=typeof Number.isInteger==="function"?(n)=>Number.isInteger(n):(n)=>typeof n==="number"&&Number.isFinite(n)&&Math.floor(n)===n;function o(n,s=" | "){return n.map((a)=>typeof a==="string"?`'${a}'`:a).join(s)}e.joinValues=o,e.jsonStringifyReplacer=(n,s)=>{if(typeof s==="bigint")return s.toString();return s}})(V||(V={}));var Ho;(function(e){e.mergeShapes=(t,r)=>({...t,...r})})(Ho||(Ho={}));var b=V.arrayToEnum(["string","nan","number","integer","float","boolean","date","bigint","symbol","function","undefined","null","array","object","unknown","promise","void","never","map","set"]),We=(e)=>{switch(typeof e){case"undefined":return b.undefined;case"string":return b.string;case"number":return Number.isNaN(e)?b.nan:b.number;case"boolean":return b.boolean;case"function":return b.function;case"bigint":return b.bigint;case"symbol":return b.symbol;case"object":if(Array.isArray(e))return b.array;if(e===null)return b.null;if(e.then&&typeof e.then==="function"&&e.catch&&typeof e.catch==="function")return b.promise;if(typeof Map<"u"&&e instanceof Map)return b.map;if(typeof Set<"u"&&e instanceof Set)return b.set;if(typeof Date<"u"&&e instanceof Date)return b.date;return b.object;default:return b.unknown}};var f=V.arrayToEnum(["invalid_type","invalid_literal","custom","invalid_union","invalid_union_discriminator","invalid_enum_value","unrecognized_keys","invalid_arguments","invalid_return_type","invalid_date","invalid_string","too_small","too_big","invalid_intersection_types","not_multiple_of","not_finite"]);class Le extends Error{get errors(){return this.issues}constructor(e){super();this.issues=[],this.addIssue=(r)=>{this.issues=[...this.issues,r]},this.addIssues=(r=[])=>{this.issues=[...this.issues,...r]};let t=new.target.prototype;if(Object.setPrototypeOf)Object.setPrototypeOf(this,t);else this.__proto__=t;this.name="ZodError",this.issues=e}format(e){let t=e||function(n){return n.message},r={_errors:[]},o=(n)=>{for(let s of n.issues)if(s.code==="invalid_union")s.unionErrors.map(o);else if(s.code==="invalid_return_type")o(s.returnTypeError);else if(s.code==="invalid_arguments")o(s.argumentsError);else if(s.path.length===0)r._errors.push(t(s));else{let a=r,c=0;while(c<s.path.length){let l=s.path[c];if(c!==s.path.length-1)a[l]=a[l]||{_errors:[]};else a[l]=a[l]||{_errors:[]},a[l]._errors.push(t(s));a=a[l],c++}}};return o(this),r}static assert(e){if(!(e instanceof Le))throw Error(`Not a ZodError: ${e}`)}toString(){return this.message}get message(){return JSON.stringify(this.issues,V.jsonStringifyReplacer,2)}get isEmpty(){return this.issues.length===0}flatten(e=(t)=>t.message){let t={},r=[];for(let o of this.issues)if(o.path.length>0){let n=o.path[0];t[n]=t[n]||[],t[n].push(e(o))}else r.push(e(o));return{formErrors:r,fieldErrors:t}}get formErrors(){return this.flatten()}}Le.create=(e)=>new Le(e);var Un=(e,t)=>{let r;switch(e.code){case f.invalid_type:if(e.received===b.undefined)r="Required";else r=`Expected ${e.expected}, received ${e.received}`;break;case f.invalid_literal:r=`Invalid literal value, expected ${JSON.stringify(e.expected,V.jsonStringifyReplacer)}`;break;case f.unrecognized_keys:r=`Unrecognized key(s) in object: ${V.joinValues(e.keys,", ")}`;break;case f.invalid_union:r="Invalid input";break;case f.invalid_union_discriminator:r=`Invalid discriminator value. Expected ${V.joinValues(e.options)}`;break;case f.invalid_enum_value:r=`Invalid enum value. Expected ${V.joinValues(e.options)}, received '${e.received}'`;break;case f.invalid_arguments:r="Invalid function arguments";break;case f.invalid_return_type:r="Invalid function return type";break;case f.invalid_date:r="Invalid date";break;case f.invalid_string:if(typeof e.validation==="object")if("includes"in e.validation){if(r=`Invalid input: must include "${e.validation.includes}"`,typeof e.validation.position==="number")r=`${r} at one or more positions greater than or equal to ${e.validation.position}`}else if("startsWith"in e.validation)r=`Invalid input: must start with "${e.validation.startsWith}"`;else if("endsWith"in e.validation)r=`Invalid input: must end with "${e.validation.endsWith}"`;else V.assertNever(e.validation);else if(e.validation!=="regex")r=`Invalid ${e.validation}`;else r="Invalid";break;case f.too_small:if(e.type==="array")r=`Array must contain ${e.exact?"exactly":e.inclusive?"at least":"more than"} ${e.minimum} element(s)`;else if(e.type==="string")r=`String must contain ${e.exact?"exactly":e.inclusive?"at least":"over"} ${e.minimum} character(s)`;else if(e.type==="number")r=`Number must be ${e.exact?"exactly equal to ":e.inclusive?"greater than or equal to ":"greater than "}${e.minimum}`;else if(e.type==="bigint")r=`Number must be ${e.exact?"exactly equal to ":e.inclusive?"greater than or equal to ":"greater than "}${e.minimum}`;else if(e.type==="date")r=`Date must be ${e.exact?"exactly equal to ":e.inclusive?"greater than or equal to ":"greater than "}${new Date(Number(e.minimum))}`;else r="Invalid input";break;case f.too_big:if(e.type==="array")r=`Array must contain ${e.exact?"exactly":e.inclusive?"at most":"less than"} ${e.maximum} element(s)`;else if(e.type==="string")r=`String must contain ${e.exact?"exactly":e.inclusive?"at most":"under"} ${e.maximum} character(s)`;else if(e.type==="number")r=`Number must be ${e.exact?"exactly":e.inclusive?"less than or equal to":"less than"} ${e.maximum}`;else if(e.type==="bigint")r=`BigInt must be ${e.exact?"exactly":e.inclusive?"less than or equal to":"less than"} ${e.maximum}`;else if(e.type==="date")r=`Date must be ${e.exact?"exactly":e.inclusive?"smaller than or equal to":"smaller than"} ${new Date(Number(e.maximum))}`;else r="Invalid input";break;case f.custom:r="Invalid input";break;case f.invalid_intersection_types:r="Intersection results could not be merged";break;case f.not_multiple_of:r=`Number must be a multiple of ${e.multipleOf}`;break;case f.not_finite:r="Number must be finite";break;default:r=t.defaultError,V.assertNever(e)}return{message:r}},ot=Un;var Dn=ot;function Ot(){return Dn}var ir=(e)=>{let{data:t,path:r,errorMaps:o,issueData:n}=e,s=[...r,...n.path||[]],a={...n,path:s};if(n.message!==void 0)return{...n,path:s,message:n.message};let c="",l=o.filter((u)=>!!u).slice().reverse();for(let u of l)c=u(a,{data:t,defaultError:c}).message;return{...n,path:s,message:c}};function g(e,t){let r=Ot(),o=ir({issueData:t,data:e.data,path:e.path,errorMaps:[e.common.contextualErrorMap,e.schemaErrorMap,r,r===ot?void 0:ot].filter((n)=>!!n)});e.common.issues.push(o)}class we{constructor(){this.value="valid"}dirty(){if(this.value==="valid")this.value="dirty"}abort(){if(this.value!=="aborted")this.value="aborted"}static mergeArray(e,t){let r=[];for(let o of t){if(o.status==="aborted")return w;if(o.status==="dirty")e.dirty();r.push(o.value)}return{status:e.value,value:r}}static async mergeObjectAsync(e,t){let r=[];for(let o of t){let n=await o.key,s=await o.value;r.push({key:n,value:s})}return we.mergeObjectSync(e,r)}static mergeObjectSync(e,t){let r={};for(let o of t){let{key:n,value:s}=o;if(n.status==="aborted")return w;if(s.status==="aborted")return w;if(n.status==="dirty")e.dirty();if(s.status==="dirty")e.dirty();if(n.value!=="__proto__"&&(typeof s.value<"u"||o.alwaysSet))r[n.value]=s.value}return{status:e.value,value:r}}}var w=Object.freeze({status:"aborted"}),yt=(e)=>({status:"dirty",value:e}),Ae=(e)=>({status:"valid",value:e}),Qr=(e)=>e.status==="aborted",Zr=(e)=>e.status==="dirty",ct=(e)=>e.status==="valid",It=(e)=>typeof Promise<"u"&&e instanceof Promise;var x;(function(e){e.errToObj=(t)=>typeof t==="string"?{message:t}:t||{},e.toString=(t)=>typeof t==="string"?t:t?.message})(x||(x={}));class ze{constructor(e,t,r,o){this._cachedPath=[],this.parent=e,this.data=t,this._path=r,this._key=o}get path(){if(!this._cachedPath.length)if(Array.isArray(this._key))this._cachedPath.push(...this._path,...this._key);else this._cachedPath.push(...this._path,this._key);return this._cachedPath}}var Vo=(e,t)=>{if(ct(t))return{success:!0,data:t.value};else{if(!e.common.issues.length)throw Error("Validation failed but no issues detected.");return{success:!1,get error(){if(this._error)return this._error;let r=new Le(e.common.issues);return this._error=r,this._error}}}};function P(e){if(!e)return{};let{errorMap:t,invalid_type_error:r,required_error:o,description:n}=e;if(t&&(r||o))throw Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);if(t)return{errorMap:t,description:n};return{errorMap:(a,c)=>{let{message:l}=e;if(a.code==="invalid_enum_value")return{message:l??c.defaultError};if(typeof c.data>"u")return{message:l??o??c.defaultError};if(a.code!=="invalid_type")return{message:c.defaultError};return{message:l??r??c.defaultError}},description:n}}class j{get description(){return this._def.description}_getType(e){return We(e.data)}_getOrReturnCtx(e,t){return t||{common:e.parent.common,data:e.data,parsedType:We(e.data),schemaErrorMap:this._def.errorMap,path:e.path,parent:e.parent}}_processInputParams(e){return{status:new we,ctx:{common:e.parent.common,data:e.data,parsedType:We(e.data),schemaErrorMap:this._def.errorMap,path:e.path,parent:e.parent}}}_parseSync(e){let t=this._parse(e);if(It(t))throw Error("Synchronous parse encountered promise.");return t}_parseAsync(e){let t=this._parse(e);return Promise.resolve(t)}parse(e,t){let r=this.safeParse(e,t);if(r.success)return r.data;throw r.error}safeParse(e,t){let r={common:{issues:[],async:t?.async??!1,contextualErrorMap:t?.errorMap},path:t?.path||[],schemaErrorMap:this._def.errorMap,parent:null,data:e,parsedType:We(e)},o=this._parseSync({data:e,path:r.path,parent:r});return Vo(r,o)}"~validate"(e){let t={common:{issues:[],async:!!this["~standard"].async},path:[],schemaErrorMap:this._def.errorMap,parent:null,data:e,parsedType:We(e)};if(!this["~standard"].async)try{let r=this._parseSync({data:e,path:[],parent:t});return ct(r)?{value:r.value}:{issues:t.common.issues}}catch(r){if(r?.message?.toLowerCase()?.includes("encountered"))this["~standard"].async=!0;t.common={issues:[],async:!0}}return this._parseAsync({data:e,path:[],parent:t}).then((r)=>ct(r)?{value:r.value}:{issues:t.common.issues})}async parseAsync(e,t){let r=await this.safeParseAsync(e,t);if(r.success)return r.data;throw r.error}async safeParseAsync(e,t){let r={common:{issues:[],contextualErrorMap:t?.errorMap,async:!0},path:t?.path||[],schemaErrorMap:this._def.errorMap,parent:null,data:e,parsedType:We(e)},o=this._parse({data:e,path:r.path,parent:r}),n=await(It(o)?o:Promise.resolve(o));return Vo(r,n)}refine(e,t){let r=(o)=>{if(typeof t==="string"||typeof t>"u")return{message:t};else if(typeof t==="function")return t(o);else return t};return this._refinement((o,n)=>{let s=e(o),a=()=>n.addIssue({code:f.custom,...r(o)});if(typeof Promise<"u"&&s instanceof Promise)return s.then((c)=>{if(!c)return a(),!1;else return!0});if(!s)return a(),!1;else return!0})}refinement(e,t){return this._refinement((r,o)=>{if(!e(r))return o.addIssue(typeof t==="function"?t(r,o):t),!1;else return!0})}_refinement(e){return new Ye({schema:this,typeName:A.ZodEffects,effect:{type:"refinement",refinement:e}})}superRefine(e){return this._refinement(e)}constructor(e){this.spa=this.safeParseAsync,this._def=e,this.parse=this.parse.bind(this),this.safeParse=this.safeParse.bind(this),this.parseAsync=this.parseAsync.bind(this),this.safeParseAsync=this.safeParseAsync.bind(this),this.spa=this.spa.bind(this),this.refine=this.refine.bind(this),this.refinement=this.refinement.bind(this),this.superRefine=this.superRefine.bind(this),this.optional=this.optional.bind(this),this.nullable=this.nullable.bind(this),this.nullish=this.nullish.bind(this),this.array=this.array.bind(this),this.promise=this.promise.bind(this),this.or=this.or.bind(this),this.and=this.and.bind(this),this.transform=this.transform.bind(this),this.brand=this.brand.bind(this),this.default=this.default.bind(this),this.catch=this.catch.bind(this),this.describe=this.describe.bind(this),this.pipe=this.pipe.bind(this),this.readonly=this.readonly.bind(this),this.isNullable=this.isNullable.bind(this),this.isOptional=this.isOptional.bind(this),this["~standard"]={version:1,vendor:"zod",validate:(t)=>this["~validate"](t)}}optional(){return Je.create(this,this._def)}nullable(){return nt.create(this,this._def)}nullish(){return this.nullable().optional()}array(){return Ke.create(this)}promise(){return St.create(this,this._def)}or(e){return Ut.create([this,e],this._def)}and(e){return Dt.create(this,e,this._def)}transform(e){return new Ye({...P(this._def),schema:this,typeName:A.ZodEffects,effect:{type:"transform",transform:e}})}default(e){let t=typeof e==="function"?e:()=>e;return new Bt({...P(this._def),innerType:this,defaultValue:t,typeName:A.ZodDefault})}brand(){return new oo({typeName:A.ZodBranded,type:this,...P(this._def)})}catch(e){let t=typeof e==="function"?e:()=>e;return new Ht({...P(this._def),innerType:this,catchValue:t,typeName:A.ZodCatch})}describe(e){return new this.constructor({...this._def,description:e})}pipe(e){return hr.create(this,e)}readonly(){return Vt.create(this)}isOptional(){return this.safeParse(void 0).success}isNullable(){return this.safeParse(null).success}}var Gn=/^c[^\s-]{8,}$/i,jn=/^[0-9a-z]+$/,zn=/^[0-9A-HJKMNP-TV-Z]{26}$/i,Bn=/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i,Hn=/^[a-z0-9_-]{21}$/i,Vn=/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,Fn=/^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/,Xn=/^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i,Kn="^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$",eo,Jn=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,Yn=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,Wn=/^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,qn=/^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,Qn=/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,Zn=/^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,Fo="((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))",es=new RegExp(`^${Fo}$`);function Xo(e){let t="[0-5]\\d";if(e.precision)t=`${t}\\.\\d{${e.precision}}`;else if(e.precision==null)t=`${t}(\\.\\d+)?`;let r=e.precision?"+":"?";return`([01]\\d|2[0-3]):[0-5]\\d(:${t})${r}`}function ts(e){return new RegExp(`^${Xo(e)}$`)}function rs(e){let t=`${Fo}T${Xo(e)}`,r=[];if(r.push(e.local?"Z?":"Z"),e.offset)r.push("([+-]\\d{2}:?\\d{2})");return t=`${t}(${r.join("|")})`,new RegExp(`^${t}$`)}function os(e,t){if((t==="v4"||!t)&&Jn.test(e))return!0;if((t==="v6"||!t)&&Wn.test(e))return!0;return!1}function ns(e,t){if(!Vn.test(e))return!1;try{let[r]=e.split(".");if(!r)return!1;let o=r.replace(/-/g,"+").replace(/_/g,"/").padEnd(r.length+(4-r.length%4)%4,"="),n=JSON.parse(atob(o));if(typeof n!=="object"||n===null)return!1;if("typ"in n&&n?.typ!=="JWT")return!1;if(!n.alg)return!1;if(t&&n.alg!==t)return!1;return!0}catch{return!1}}function ss(e,t){if((t==="v4"||!t)&&Yn.test(e))return!0;if((t==="v6"||!t)&&qn.test(e))return!0;return!1}class Qe extends j{_parse(e){if(this._def.coerce)e.data=String(e.data);if(this._getType(e)!==b.string){let n=this._getOrReturnCtx(e);return g(n,{code:f.invalid_type,expected:b.string,received:n.parsedType}),w}let r=new we,o=void 0;for(let n of this._def.checks)if(n.kind==="min"){if(e.data.length<n.value)o=this._getOrReturnCtx(e,o),g(o,{code:f.too_small,minimum:n.value,type:"string",inclusive:!0,exact:!1,message:n.message}),r.dirty()}else if(n.kind==="max"){if(e.data.length>n.value)o=this._getOrReturnCtx(e,o),g(o,{code:f.too_big,maximum:n.value,type:"string",inclusive:!0,exact:!1,message:n.message}),r.dirty()}else if(n.kind==="length"){let s=e.data.length>n.value,a=e.data.length<n.value;if(s||a){if(o=this._getOrReturnCtx(e,o),s)g(o,{code:f.too_big,maximum:n.value,type:"string",inclusive:!0,exact:!0,message:n.message});else if(a)g(o,{code:f.too_small,minimum:n.value,type:"string",inclusive:!0,exact:!0,message:n.message});r.dirty()}}else if(n.kind==="email"){if(!Xn.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"email",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="emoji"){if(!eo)eo=new RegExp(Kn,"u");if(!eo.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"emoji",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="uuid"){if(!Bn.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"uuid",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="nanoid"){if(!Hn.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"nanoid",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="cuid"){if(!Gn.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"cuid",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="cuid2"){if(!jn.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"cuid2",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="ulid"){if(!zn.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"ulid",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="url")try{new URL(e.data)}catch{o=this._getOrReturnCtx(e,o),g(o,{validation:"url",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="regex"){if(n.regex.lastIndex=0,!n.regex.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"regex",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="trim")e.data=e.data.trim();else if(n.kind==="includes"){if(!e.data.includes(n.value,n.position))o=this._getOrReturnCtx(e,o),g(o,{code:f.invalid_string,validation:{includes:n.value,position:n.position},message:n.message}),r.dirty()}else if(n.kind==="toLowerCase")e.data=e.data.toLowerCase();else if(n.kind==="toUpperCase")e.data=e.data.toUpperCase();else if(n.kind==="startsWith"){if(!e.data.startsWith(n.value))o=this._getOrReturnCtx(e,o),g(o,{code:f.invalid_string,validation:{startsWith:n.value},message:n.message}),r.dirty()}else if(n.kind==="endsWith"){if(!e.data.endsWith(n.value))o=this._getOrReturnCtx(e,o),g(o,{code:f.invalid_string,validation:{endsWith:n.value},message:n.message}),r.dirty()}else if(n.kind==="datetime"){if(!rs(n).test(e.data))o=this._getOrReturnCtx(e,o),g(o,{code:f.invalid_string,validation:"datetime",message:n.message}),r.dirty()}else if(n.kind==="date"){if(!es.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{code:f.invalid_string,validation:"date",message:n.message}),r.dirty()}else if(n.kind==="time"){if(!ts(n).test(e.data))o=this._getOrReturnCtx(e,o),g(o,{code:f.invalid_string,validation:"time",message:n.message}),r.dirty()}else if(n.kind==="duration"){if(!Fn.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"duration",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="ip"){if(!os(e.data,n.version))o=this._getOrReturnCtx(e,o),g(o,{validation:"ip",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="jwt"){if(!ns(e.data,n.alg))o=this._getOrReturnCtx(e,o),g(o,{validation:"jwt",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="cidr"){if(!ss(e.data,n.version))o=this._getOrReturnCtx(e,o),g(o,{validation:"cidr",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="base64"){if(!Qn.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"base64",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="base64url"){if(!Zn.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"base64url",code:f.invalid_string,message:n.message}),r.dirty()}else V.assertNever(n);return{status:r.value,value:e.data}}_regex(e,t,r){return this.refinement((o)=>e.test(o),{validation:t,code:f.invalid_string,...x.errToObj(r)})}_addCheck(e){return new Qe({...this._def,checks:[...this._def.checks,e]})}email(e){return this._addCheck({kind:"email",...x.errToObj(e)})}url(e){return this._addCheck({kind:"url",...x.errToObj(e)})}emoji(e){return this._addCheck({kind:"emoji",...x.errToObj(e)})}uuid(e){return this._addCheck({kind:"uuid",...x.errToObj(e)})}nanoid(e){return this._addCheck({kind:"nanoid",...x.errToObj(e)})}cuid(e){return this._addCheck({kind:"cuid",...x.errToObj(e)})}cuid2(e){return this._addCheck({kind:"cuid2",...x.errToObj(e)})}ulid(e){return this._addCheck({kind:"ulid",...x.errToObj(e)})}base64(e){return this._addCheck({kind:"base64",...x.errToObj(e)})}base64url(e){return this._addCheck({kind:"base64url",...x.errToObj(e)})}jwt(e){return this._addCheck({kind:"jwt",...x.errToObj(e)})}ip(e){return this._addCheck({kind:"ip",...x.errToObj(e)})}cidr(e){return this._addCheck({kind:"cidr",...x.errToObj(e)})}datetime(e){if(typeof e==="string")return this._addCheck({kind:"datetime",precision:null,offset:!1,local:!1,message:e});return this._addCheck({kind:"datetime",precision:typeof e?.precision>"u"?null:e?.precision,offset:e?.offset??!1,local:e?.local??!1,...x.errToObj(e?.message)})}date(e){return this._addCheck({kind:"date",message:e})}time(e){if(typeof e==="string")return this._addCheck({kind:"time",precision:null,message:e});return this._addCheck({kind:"time",precision:typeof e?.precision>"u"?null:e?.precision,...x.errToObj(e?.message)})}duration(e){return this._addCheck({kind:"duration",...x.errToObj(e)})}regex(e,t){return this._addCheck({kind:"regex",regex:e,...x.errToObj(t)})}includes(e,t){return this._addCheck({kind:"includes",value:e,position:t?.position,...x.errToObj(t?.message)})}startsWith(e,t){return this._addCheck({kind:"startsWith",value:e,...x.errToObj(t)})}endsWith(e,t){return this._addCheck({kind:"endsWith",value:e,...x.errToObj(t)})}min(e,t){return this._addCheck({kind:"min",value:e,...x.errToObj(t)})}max(e,t){return this._addCheck({kind:"max",value:e,...x.errToObj(t)})}length(e,t){return this._addCheck({kind:"length",value:e,...x.errToObj(t)})}nonempty(e){return this.min(1,x.errToObj(e))}trim(){return new Qe({...this._def,checks:[...this._def.checks,{kind:"trim"}]})}toLowerCase(){return new Qe({...this._def,checks:[...this._def.checks,{kind:"toLowerCase"}]})}toUpperCase(){return new Qe({...this._def,checks:[...this._def.checks,{kind:"toUpperCase"}]})}get isDatetime(){return!!this._def.checks.find((e)=>e.kind==="datetime")}get isDate(){return!!this._def.checks.find((e)=>e.kind==="date")}get isTime(){return!!this._def.checks.find((e)=>e.kind==="time")}get isDuration(){return!!this._def.checks.find((e)=>e.kind==="duration")}get isEmail(){return!!this._def.checks.find((e)=>e.kind==="email")}get isURL(){return!!this._def.checks.find((e)=>e.kind==="url")}get isEmoji(){return!!this._def.checks.find((e)=>e.kind==="emoji")}get isUUID(){return!!this._def.checks.find((e)=>e.kind==="uuid")}get isNANOID(){return!!this._def.checks.find((e)=>e.kind==="nanoid")}get isCUID(){return!!this._def.checks.find((e)=>e.kind==="cuid")}get isCUID2(){return!!this._def.checks.find((e)=>e.kind==="cuid2")}get isULID(){return!!this._def.checks.find((e)=>e.kind==="ulid")}get isIP(){return!!this._def.checks.find((e)=>e.kind==="ip")}get isCIDR(){return!!this._def.checks.find((e)=>e.kind==="cidr")}get isBase64(){return!!this._def.checks.find((e)=>e.kind==="base64")}get isBase64url(){return!!this._def.checks.find((e)=>e.kind==="base64url")}get minLength(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e}get maxLength(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e}}Qe.create=(e)=>new Qe({checks:[],typeName:A.ZodString,coerce:e?.coerce??!1,...P(e)});function as(e,t){let r=(e.toString().split(".")[1]||"").length,o=(t.toString().split(".")[1]||"").length,n=r>o?r:o,s=Number.parseInt(e.toFixed(n).replace(".","")),a=Number.parseInt(t.toFixed(n).replace(".",""));return s%a/10**n}class vt extends j{constructor(){super(...arguments);this.min=this.gte,this.max=this.lte,this.step=this.multipleOf}_parse(e){if(this._def.coerce)e.data=Number(e.data);if(this._getType(e)!==b.number){let n=this._getOrReturnCtx(e);return g(n,{code:f.invalid_type,expected:b.number,received:n.parsedType}),w}let r=void 0,o=new we;for(let n of this._def.checks)if(n.kind==="int"){if(!V.isInteger(e.data))r=this._getOrReturnCtx(e,r),g(r,{code:f.invalid_type,expected:"integer",received:"float",message:n.message}),o.dirty()}else if(n.kind==="min"){if(n.inclusive?e.data<n.value:e.data<=n.value)r=this._getOrReturnCtx(e,r),g(r,{code:f.too_small,minimum:n.value,type:"number",inclusive:n.inclusive,exact:!1,message:n.message}),o.dirty()}else if(n.kind==="max"){if(n.inclusive?e.data>n.value:e.data>=n.value)r=this._getOrReturnCtx(e,r),g(r,{code:f.too_big,maximum:n.value,type:"number",inclusive:n.inclusive,exact:!1,message:n.message}),o.dirty()}else if(n.kind==="multipleOf"){if(as(e.data,n.value)!==0)r=this._getOrReturnCtx(e,r),g(r,{code:f.not_multiple_of,multipleOf:n.value,message:n.message}),o.dirty()}else if(n.kind==="finite"){if(!Number.isFinite(e.data))r=this._getOrReturnCtx(e,r),g(r,{code:f.not_finite,message:n.message}),o.dirty()}else V.assertNever(n);return{status:o.value,value:e.data}}gte(e,t){return this.setLimit("min",e,!0,x.toString(t))}gt(e,t){return this.setLimit("min",e,!1,x.toString(t))}lte(e,t){return this.setLimit("max",e,!0,x.toString(t))}lt(e,t){return this.setLimit("max",e,!1,x.toString(t))}setLimit(e,t,r,o){return new vt({...this._def,checks:[...this._def.checks,{kind:e,value:t,inclusive:r,message:x.toString(o)}]})}_addCheck(e){return new vt({...this._def,checks:[...this._def.checks,e]})}int(e){return this._addCheck({kind:"int",message:x.toString(e)})}positive(e){return this._addCheck({kind:"min",value:0,inclusive:!1,message:x.toString(e)})}negative(e){return this._addCheck({kind:"max",value:0,inclusive:!1,message:x.toString(e)})}nonpositive(e){return this._addCheck({kind:"max",value:0,inclusive:!0,message:x.toString(e)})}nonnegative(e){return this._addCheck({kind:"min",value:0,inclusive:!0,message:x.toString(e)})}multipleOf(e,t){return this._addCheck({kind:"multipleOf",value:e,message:x.toString(t)})}finite(e){return this._addCheck({kind:"finite",message:x.toString(e)})}safe(e){return this._addCheck({kind:"min",inclusive:!0,value:Number.MIN_SAFE_INTEGER,message:x.toString(e)})._addCheck({kind:"max",inclusive:!0,value:Number.MAX_SAFE_INTEGER,message:x.toString(e)})}get minValue(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e}get maxValue(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e}get isInt(){return!!this._def.checks.find((e)=>e.kind==="int"||e.kind==="multipleOf"&&V.isInteger(e.value))}get isFinite(){let e=null,t=null;for(let r of this._def.checks)if(r.kind==="finite"||r.kind==="int"||r.kind==="multipleOf")return!0;else if(r.kind==="min"){if(t===null||r.value>t)t=r.value}else if(r.kind==="max"){if(e===null||r.value<e)e=r.value}return Number.isFinite(t)&&Number.isFinite(e)}}vt.create=(e)=>new vt({checks:[],typeName:A.ZodNumber,coerce:e?.coerce||!1,...P(e)});class _t extends j{constructor(){super(...arguments);this.min=this.gte,this.max=this.lte}_parse(e){if(this._def.coerce)try{e.data=BigInt(e.data)}catch{return this._getInvalidInput(e)}if(this._getType(e)!==b.bigint)return this._getInvalidInput(e);let r=void 0,o=new we;for(let n of this._def.checks)if(n.kind==="min"){if(n.inclusive?e.data<n.value:e.data<=n.value)r=this._getOrReturnCtx(e,r),g(r,{code:f.too_small,type:"bigint",minimum:n.value,inclusive:n.inclusive,message:n.message}),o.dirty()}else if(n.kind==="max"){if(n.inclusive?e.data>n.value:e.data>=n.value)r=this._getOrReturnCtx(e,r),g(r,{code:f.too_big,type:"bigint",maximum:n.value,inclusive:n.inclusive,message:n.message}),o.dirty()}else if(n.kind==="multipleOf"){if(e.data%n.value!==BigInt(0))r=this._getOrReturnCtx(e,r),g(r,{code:f.not_multiple_of,multipleOf:n.value,message:n.message}),o.dirty()}else V.assertNever(n);return{status:o.value,value:e.data}}_getInvalidInput(e){let t=this._getOrReturnCtx(e);return g(t,{code:f.invalid_type,expected:b.bigint,received:t.parsedType}),w}gte(e,t){return this.setLimit("min",e,!0,x.toString(t))}gt(e,t){return this.setLimit("min",e,!1,x.toString(t))}lte(e,t){return this.setLimit("max",e,!0,x.toString(t))}lt(e,t){return this.setLimit("max",e,!1,x.toString(t))}setLimit(e,t,r,o){return new _t({...this._def,checks:[...this._def.checks,{kind:e,value:t,inclusive:r,message:x.toString(o)}]})}_addCheck(e){return new _t({...this._def,checks:[...this._def.checks,e]})}positive(e){return this._addCheck({kind:"min",value:BigInt(0),inclusive:!1,message:x.toString(e)})}negative(e){return this._addCheck({kind:"max",value:BigInt(0),inclusive:!1,message:x.toString(e)})}nonpositive(e){return this._addCheck({kind:"max",value:BigInt(0),inclusive:!0,message:x.toString(e)})}nonnegative(e){return this._addCheck({kind:"min",value:BigInt(0),inclusive:!0,message:x.toString(e)})}multipleOf(e,t){return this._addCheck({kind:"multipleOf",value:e,message:x.toString(t)})}get minValue(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e}get maxValue(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e}}_t.create=(e)=>new _t({checks:[],typeName:A.ZodBigInt,coerce:e?.coerce??!1,...P(e)});class cr extends j{_parse(e){if(this._def.coerce)e.data=Boolean(e.data);if(this._getType(e)!==b.boolean){let r=this._getOrReturnCtx(e);return g(r,{code:f.invalid_type,expected:b.boolean,received:r.parsedType}),w}return Ae(e.data)}}cr.create=(e)=>new cr({typeName:A.ZodBoolean,coerce:e?.coerce||!1,...P(e)});class Nt extends j{_parse(e){if(this._def.coerce)e.data=new Date(e.data);if(this._getType(e)!==b.date){let n=this._getOrReturnCtx(e);return g(n,{code:f.invalid_type,expected:b.date,received:n.parsedType}),w}if(Number.isNaN(e.data.getTime())){let n=this._getOrReturnCtx(e);return g(n,{code:f.invalid_date}),w}let r=new we,o=void 0;for(let n of this._def.checks)if(n.kind==="min"){if(e.data.getTime()<n.value)o=this._getOrReturnCtx(e,o),g(o,{code:f.too_small,message:n.message,inclusive:!0,exact:!1,minimum:n.value,type:"date"}),r.dirty()}else if(n.kind==="max"){if(e.data.getTime()>n.value)o=this._getOrReturnCtx(e,o),g(o,{code:f.too_big,message:n.message,inclusive:!0,exact:!1,maximum:n.value,type:"date"}),r.dirty()}else V.assertNever(n);return{status:r.value,value:new Date(e.data.getTime())}}_addCheck(e){return new Nt({...this._def,checks:[...this._def.checks,e]})}min(e,t){return this._addCheck({kind:"min",value:e.getTime(),message:x.toString(t)})}max(e,t){return this._addCheck({kind:"max",value:e.getTime(),message:x.toString(t)})}get minDate(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e!=null?new Date(e):null}get maxDate(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e!=null?new Date(e):null}}Nt.create=(e)=>new Nt({checks:[],coerce:e?.coerce||!1,typeName:A.ZodDate,...P(e)});class dr extends j{_parse(e){if(this._getType(e)!==b.symbol){let r=this._getOrReturnCtx(e);return g(r,{code:f.invalid_type,expected:b.symbol,received:r.parsedType}),w}return Ae(e.data)}}dr.create=(e)=>new dr({typeName:A.ZodSymbol,...P(e)});class Lt extends j{_parse(e){if(this._getType(e)!==b.undefined){let r=this._getOrReturnCtx(e);return g(r,{code:f.invalid_type,expected:b.undefined,received:r.parsedType}),w}return Ae(e.data)}}Lt.create=(e)=>new Lt({typeName:A.ZodUndefined,...P(e)});class $t extends j{_parse(e){if(this._getType(e)!==b.null){let r=this._getOrReturnCtx(e);return g(r,{code:f.invalid_type,expected:b.null,received:r.parsedType}),w}return Ae(e.data)}}$t.create=(e)=>new $t({typeName:A.ZodNull,...P(e)});class lr extends j{constructor(){super(...arguments);this._any=!0}_parse(e){return Ae(e.data)}}lr.create=(e)=>new lr({typeName:A.ZodAny,...P(e)});class dt extends j{constructor(){super(...arguments);this._unknown=!0}_parse(e){return Ae(e.data)}}dt.create=(e)=>new dt({typeName:A.ZodUnknown,...P(e)});class Ze extends j{_parse(e){let t=this._getOrReturnCtx(e);return g(t,{code:f.invalid_type,expected:b.never,received:t.parsedType}),w}}Ze.create=(e)=>new Ze({typeName:A.ZodNever,...P(e)});class pr extends j{_parse(e){if(this._getType(e)!==b.undefined){let r=this._getOrReturnCtx(e);return g(r,{code:f.invalid_type,expected:b.void,received:r.parsedType}),w}return Ae(e.data)}}pr.create=(e)=>new pr({typeName:A.ZodVoid,...P(e)});class Ke extends j{_parse(e){let{ctx:t,status:r}=this._processInputParams(e),o=this._def;if(t.parsedType!==b.array)return g(t,{code:f.invalid_type,expected:b.array,received:t.parsedType}),w;if(o.exactLength!==null){let s=t.data.length>o.exactLength.value,a=t.data.length<o.exactLength.value;if(s||a)g(t,{code:s?f.too_big:f.too_small,minimum:a?o.exactLength.value:void 0,maximum:s?o.exactLength.value:void 0,type:"array",inclusive:!0,exact:!0,message:o.exactLength.message}),r.dirty()}if(o.minLength!==null){if(t.data.length<o.minLength.value)g(t,{code:f.too_small,minimum:o.minLength.value,type:"array",inclusive:!0,exact:!1,message:o.minLength.message}),r.dirty()}if(o.maxLength!==null){if(t.data.length>o.maxLength.value)g(t,{code:f.too_big,maximum:o.maxLength.value,type:"array",inclusive:!0,exact:!1,message:o.maxLength.message}),r.dirty()}if(t.common.async)return Promise.all([...t.data].map((s,a)=>o.type._parseAsync(new ze(t,s,t.path,a)))).then((s)=>we.mergeArray(r,s));let n=[...t.data].map((s,a)=>o.type._parseSync(new ze(t,s,t.path,a)));return we.mergeArray(r,n)}get element(){return this._def.type}min(e,t){return new Ke({...this._def,minLength:{value:e,message:x.toString(t)}})}max(e,t){return new Ke({...this._def,maxLength:{value:e,message:x.toString(t)}})}length(e,t){return new Ke({...this._def,exactLength:{value:e,message:x.toString(t)}})}nonempty(e){return this.min(1,e)}}Ke.create=(e,t)=>new Ke({type:e,minLength:null,maxLength:null,exactLength:null,typeName:A.ZodArray,...P(t)});function xt(e){if(e instanceof fe){let t={};for(let r in e.shape){let o=e.shape[r];t[r]=Je.create(xt(o))}return new fe({...e._def,shape:()=>t})}else if(e instanceof Ke)return new Ke({...e._def,type:xt(e.element)});else if(e instanceof Je)return Je.create(xt(e.unwrap()));else if(e instanceof nt)return nt.create(xt(e.unwrap()));else if(e instanceof et)return et.create(e.items.map((t)=>xt(t)));else return e}class fe extends j{constructor(){super(...arguments);this._cached=null,this.nonstrict=this.passthrough,this.augment=this.extend}_getCached(){if(this._cached!==null)return this._cached;let e=this._def.shape(),t=V.objectKeys(e);return this._cached={shape:e,keys:t},this._cached}_parse(e){if(this._getType(e)!==b.object){let l=this._getOrReturnCtx(e);return g(l,{code:f.invalid_type,expected:b.object,received:l.parsedType}),w}let{status:r,ctx:o}=this._processInputParams(e),{shape:n,keys:s}=this._getCached(),a=[];if(!(this._def.catchall instanceof Ze&&this._def.unknownKeys==="strip")){for(let l in o.data)if(!s.includes(l))a.push(l)}let c=[];for(let l of s){let u=n[l],y=o.data[l];c.push({key:{status:"valid",value:l},value:u._parse(new ze(o,y,o.path,l)),alwaysSet:l in o.data})}if(this._def.catchall instanceof Ze){let l=this._def.unknownKeys;if(l==="passthrough")for(let u of a)c.push({key:{status:"valid",value:u},value:{status:"valid",value:o.data[u]}});else if(l==="strict"){if(a.length>0)g(o,{code:f.unrecognized_keys,keys:a}),r.dirty()}else if(l==="strip");else throw Error("Internal ZodObject error: invalid unknownKeys value.")}else{let l=this._def.catchall;for(let u of a){let y=o.data[u];c.push({key:{status:"valid",value:u},value:l._parse(new ze(o,y,o.path,u)),alwaysSet:u in o.data})}}if(o.common.async)return Promise.resolve().then(async()=>{let l=[];for(let u of c){let y=await u.key,K=await u.value;l.push({key:y,value:K,alwaysSet:u.alwaysSet})}return l}).then((l)=>we.mergeObjectSync(r,l));else return we.mergeObjectSync(r,c)}get shape(){return this._def.shape()}strict(e){return x.errToObj,new fe({...this._def,unknownKeys:"strict",...e!==void 0?{errorMap:(t,r)=>{let o=this._def.errorMap?.(t,r).message??r.defaultError;if(t.code==="unrecognized_keys")return{message:x.errToObj(e).message??o};return{message:o}}}:{}})}strip(){return new fe({...this._def,unknownKeys:"strip"})}passthrough(){return new fe({...this._def,unknownKeys:"passthrough"})}extend(e){return new fe({...this._def,shape:()=>({...this._def.shape(),...e})})}merge(e){return new fe({unknownKeys:e._def.unknownKeys,catchall:e._def.catchall,shape:()=>({...this._def.shape(),...e._def.shape()}),typeName:A.ZodObject})}setKey(e,t){return this.augment({[e]:t})}catchall(e){return new fe({...this._def,catchall:e})}pick(e){let t={};for(let r of V.objectKeys(e))if(e[r]&&this.shape[r])t[r]=this.shape[r];return new fe({...this._def,shape:()=>t})}omit(e){let t={};for(let r of V.objectKeys(this.shape))if(!e[r])t[r]=this.shape[r];return new fe({...this._def,shape:()=>t})}deepPartial(){return xt(this)}partial(e){let t={};for(let r of V.objectKeys(this.shape)){let o=this.shape[r];if(e&&!e[r])t[r]=o;else t[r]=o.optional()}return new fe({...this._def,shape:()=>t})}required(e){let t={};for(let r of V.objectKeys(this.shape))if(e&&!e[r])t[r]=this.shape[r];else{let n=this.shape[r];while(n instanceof Je)n=n._def.innerType;t[r]=n}return new fe({...this._def,shape:()=>t})}keyof(){return Ko(V.objectKeys(this.shape))}}fe.create=(e,t)=>new fe({shape:()=>e,unknownKeys:"strip",catchall:Ze.create(),typeName:A.ZodObject,...P(t)});fe.strictCreate=(e,t)=>new fe({shape:()=>e,unknownKeys:"strict",catchall:Ze.create(),typeName:A.ZodObject,...P(t)});fe.lazycreate=(e,t)=>new fe({shape:e,unknownKeys:"strip",catchall:Ze.create(),typeName:A.ZodObject,...P(t)});class Ut extends j{_parse(e){let{ctx:t}=this._processInputParams(e),r=this._def.options;function o(n){for(let a of n)if(a.result.status==="valid")return a.result;for(let a of n)if(a.result.status==="dirty")return t.common.issues.push(...a.ctx.common.issues),a.result;let s=n.map((a)=>new Le(a.ctx.common.issues));return g(t,{code:f.invalid_union,unionErrors:s}),w}if(t.common.async)return Promise.all(r.map(async(n)=>{let s={...t,common:{...t.common,issues:[]},parent:null};return{result:await n._parseAsync({data:t.data,path:t.path,parent:s}),ctx:s}})).then(o);else{let n=void 0,s=[];for(let c of r){let l={...t,common:{...t.common,issues:[]},parent:null},u=c._parseSync({data:t.data,path:t.path,parent:l});if(u.status==="valid")return u;else if(u.status==="dirty"&&!n)n={result:u,ctx:l};if(l.common.issues.length)s.push(l.common.issues)}if(n)return t.common.issues.push(...n.ctx.common.issues),n.result;let a=s.map((c)=>new Le(c));return g(t,{code:f.invalid_union,unionErrors:a}),w}}get options(){return this._def.options}}Ut.create=(e,t)=>new Ut({options:e,typeName:A.ZodUnion,...P(t)});var qe=(e)=>{if(e instanceof Gt)return qe(e.schema);else if(e instanceof Ye)return qe(e.innerType());else if(e instanceof jt)return[e.value];else if(e instanceof lt)return e.options;else if(e instanceof zt)return V.objectValues(e.enum);else if(e instanceof Bt)return qe(e._def.innerType);else if(e instanceof Lt)return[void 0];else if(e instanceof $t)return[null];else if(e instanceof Je)return[void 0,...qe(e.unwrap())];else if(e instanceof nt)return[null,...qe(e.unwrap())];else if(e instanceof oo)return qe(e.unwrap());else if(e instanceof Vt)return qe(e.unwrap());else if(e instanceof Ht)return qe(e._def.innerType);else return[]};class ro extends j{_parse(e){let{ctx:t}=this._processInputParams(e);if(t.parsedType!==b.object)return g(t,{code:f.invalid_type,expected:b.object,received:t.parsedType}),w;let r=this.discriminator,o=t.data[r],n=this.optionsMap.get(o);if(!n)return g(t,{code:f.invalid_union_discriminator,options:Array.from(this.optionsMap.keys()),path:[r]}),w;if(t.common.async)return n._parseAsync({data:t.data,path:t.path,parent:t});else return n._parseSync({data:t.data,path:t.path,parent:t})}get discriminator(){return this._def.discriminator}get options(){return this._def.options}get optionsMap(){return this._def.optionsMap}static create(e,t,r){let o=new Map;for(let n of t){let s=qe(n.shape[e]);if(!s.length)throw Error(`A discriminator value for key \`${e}\` could not be extracted from all schema options`);for(let a of s){if(o.has(a))throw Error(`Discriminator property ${String(e)} has duplicate value ${String(a)}`);o.set(a,n)}}return new ro({typeName:A.ZodDiscriminatedUnion,discriminator:e,options:t,optionsMap:o,...P(r)})}}function to(e,t){let r=We(e),o=We(t);if(e===t)return{valid:!0,data:e};else if(r===b.object&&o===b.object){let n=V.objectKeys(t),s=V.objectKeys(e).filter((c)=>n.indexOf(c)!==-1),a={...e,...t};for(let c of s){let l=to(e[c],t[c]);if(!l.valid)return{valid:!1};a[c]=l.data}return{valid:!0,data:a}}else if(r===b.array&&o===b.array){if(e.length!==t.length)return{valid:!1};let n=[];for(let s=0;s<e.length;s++){let a=e[s],c=t[s],l=to(a,c);if(!l.valid)return{valid:!1};n.push(l.data)}return{valid:!0,data:n}}else if(r===b.date&&o===b.date&&+e===+t)return{valid:!0,data:e};else return{valid:!1}}class Dt extends j{_parse(e){let{status:t,ctx:r}=this._processInputParams(e),o=(n,s)=>{if(Qr(n)||Qr(s))return w;let a=to(n.value,s.value);if(!a.valid)return g(r,{code:f.invalid_intersection_types}),w;if(Zr(n)||Zr(s))t.dirty();return{status:t.value,value:a.data}};if(r.common.async)return Promise.all([this._def.left._parseAsync({data:r.data,path:r.path,parent:r}),this._def.right._parseAsync({data:r.data,path:r.path,parent:r})]).then(([n,s])=>o(n,s));else return o(this._def.left._parseSync({data:r.data,path:r.path,parent:r}),this._def.right._parseSync({data:r.data,path:r.path,parent:r}))}}Dt.create=(e,t,r)=>new Dt({left:e,right:t,typeName:A.ZodIntersection,...P(r)});class et extends j{_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==b.array)return g(r,{code:f.invalid_type,expected:b.array,received:r.parsedType}),w;if(r.data.length<this._def.items.length)return g(r,{code:f.too_small,minimum:this._def.items.length,inclusive:!0,exact:!1,type:"array"}),w;if(!this._def.rest&&r.data.length>this._def.items.length)g(r,{code:f.too_big,maximum:this._def.items.length,inclusive:!0,exact:!1,type:"array"}),t.dirty();let n=[...r.data].map((s,a)=>{let c=this._def.items[a]||this._def.rest;if(!c)return null;return c._parse(new ze(r,s,r.path,a))}).filter((s)=>!!s);if(r.common.async)return Promise.all(n).then((s)=>we.mergeArray(t,s));else return we.mergeArray(t,n)}get items(){return this._def.items}rest(e){return new et({...this._def,rest:e})}}et.create=(e,t)=>{if(!Array.isArray(e))throw Error("You must pass an array of schemas to z.tuple([ ... ])");return new et({items:e,typeName:A.ZodTuple,rest:null,...P(t)})};class ur extends j{get keySchema(){return this._def.keyType}get valueSchema(){return this._def.valueType}_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==b.object)return g(r,{code:f.invalid_type,expected:b.object,received:r.parsedType}),w;let o=[],n=this._def.keyType,s=this._def.valueType;for(let a in r.data)o.push({key:n._parse(new ze(r,a,r.path,a)),value:s._parse(new ze(r,r.data[a],r.path,a)),alwaysSet:a in r.data});if(r.common.async)return we.mergeObjectAsync(t,o);else return we.mergeObjectSync(t,o)}get element(){return this._def.valueType}static create(e,t,r){if(t instanceof j)return new ur({keyType:e,valueType:t,typeName:A.ZodRecord,...P(r)});return new ur({keyType:Qe.create(),valueType:e,typeName:A.ZodRecord,...P(t)})}}class mr extends j{get keySchema(){return this._def.keyType}get valueSchema(){return this._def.valueType}_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==b.map)return g(r,{code:f.invalid_type,expected:b.map,received:r.parsedType}),w;let o=this._def.keyType,n=this._def.valueType,s=[...r.data.entries()].map(([a,c],l)=>({key:o._parse(new ze(r,a,r.path,[l,"key"])),value:n._parse(new ze(r,c,r.path,[l,"value"]))}));if(r.common.async){let a=new Map;return Promise.resolve().then(async()=>{for(let c of s){let l=await c.key,u=await c.value;if(l.status==="aborted"||u.status==="aborted")return w;if(l.status==="dirty"||u.status==="dirty")t.dirty();a.set(l.value,u.value)}return{status:t.value,value:a}})}else{let a=new Map;for(let c of s){let{key:l,value:u}=c;if(l.status==="aborted"||u.status==="aborted")return w;if(l.status==="dirty"||u.status==="dirty")t.dirty();a.set(l.value,u.value)}return{status:t.value,value:a}}}}mr.create=(e,t,r)=>new mr({valueType:t,keyType:e,typeName:A.ZodMap,...P(r)});class kt extends j{_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==b.set)return g(r,{code:f.invalid_type,expected:b.set,received:r.parsedType}),w;let o=this._def;if(o.minSize!==null){if(r.data.size<o.minSize.value)g(r,{code:f.too_small,minimum:o.minSize.value,type:"set",inclusive:!0,exact:!1,message:o.minSize.message}),t.dirty()}if(o.maxSize!==null){if(r.data.size>o.maxSize.value)g(r,{code:f.too_big,maximum:o.maxSize.value,type:"set",inclusive:!0,exact:!1,message:o.maxSize.message}),t.dirty()}let n=this._def.valueType;function s(c){let l=new Set;for(let u of c){if(u.status==="aborted")return w;if(u.status==="dirty")t.dirty();l.add(u.value)}return{status:t.value,value:l}}let a=[...r.data.values()].map((c,l)=>n._parse(new ze(r,c,r.path,l)));if(r.common.async)return Promise.all(a).then((c)=>s(c));else return s(a)}min(e,t){return new kt({...this._def,minSize:{value:e,message:x.toString(t)}})}max(e,t){return new kt({...this._def,maxSize:{value:e,message:x.toString(t)}})}size(e,t){return this.min(e,t).max(e,t)}nonempty(e){return this.min(1,e)}}kt.create=(e,t)=>new kt({valueType:e,minSize:null,maxSize:null,typeName:A.ZodSet,...P(t)});class Mt extends j{constructor(){super(...arguments);this.validate=this.implement}_parse(e){let{ctx:t}=this._processInputParams(e);if(t.parsedType!==b.function)return g(t,{code:f.invalid_type,expected:b.function,received:t.parsedType}),w;function r(a,c){return ir({data:a,path:t.path,errorMaps:[t.common.contextualErrorMap,t.schemaErrorMap,Ot(),ot].filter((l)=>!!l),issueData:{code:f.invalid_arguments,argumentsError:c}})}function o(a,c){return ir({data:a,path:t.path,errorMaps:[t.common.contextualErrorMap,t.schemaErrorMap,Ot(),ot].filter((l)=>!!l),issueData:{code:f.invalid_return_type,returnTypeError:c}})}let n={errorMap:t.common.contextualErrorMap},s=t.data;if(this._def.returns instanceof St){let a=this;return Ae(async function(...c){let l=new Le([]),u=await a._def.args.parseAsync(c,n).catch((_)=>{throw l.addIssue(r(c,_)),l}),y=await Reflect.apply(s,this,u);return await a._def.returns._def.type.parseAsync(y,n).catch((_)=>{throw l.addIssue(o(y,_)),l})})}else{let a=this;return Ae(function(...c){let l=a._def.args.safeParse(c,n);if(!l.success)throw new Le([r(c,l.error)]);let u=Reflect.apply(s,this,l.data),y=a._def.returns.safeParse(u,n);if(!y.success)throw new Le([o(u,y.error)]);return y.data})}}parameters(){return this._def.args}returnType(){return this._def.returns}args(...e){return new Mt({...this._def,args:et.create(e).rest(dt.create())})}returns(e){return new Mt({...this._def,returns:e})}implement(e){return this.parse(e)}strictImplement(e){return this.parse(e)}static create(e,t,r){return new Mt({args:e?e:et.create([]).rest(dt.create()),returns:t||dt.create(),typeName:A.ZodFunction,...P(r)})}}class Gt extends j{get schema(){return this._def.getter()}_parse(e){let{ctx:t}=this._processInputParams(e);return this._def.getter()._parse({data:t.data,path:t.path,parent:t})}}Gt.create=(e,t)=>new Gt({getter:e,typeName:A.ZodLazy,...P(t)});class jt extends j{_parse(e){if(e.data!==this._def.value){let t=this._getOrReturnCtx(e);return g(t,{received:t.data,code:f.invalid_literal,expected:this._def.value}),w}return{status:"valid",value:e.data}}get value(){return this._def.value}}jt.create=(e,t)=>new jt({value:e,typeName:A.ZodLiteral,...P(t)});function Ko(e,t){return new lt({values:e,typeName:A.ZodEnum,...P(t)})}class lt extends j{_parse(e){if(typeof e.data!=="string"){let t=this._getOrReturnCtx(e),r=this._def.values;return g(t,{expected:V.joinValues(r),received:t.parsedType,code:f.invalid_type}),w}if(!this._cache)this._cache=new Set(this._def.values);if(!this._cache.has(e.data)){let t=this._getOrReturnCtx(e),r=this._def.values;return g(t,{received:t.data,code:f.invalid_enum_value,options:r}),w}return Ae(e.data)}get options(){return this._def.values}get enum(){let e={};for(let t of this._def.values)e[t]=t;return e}get Values(){let e={};for(let t of this._def.values)e[t]=t;return e}get Enum(){let e={};for(let t of this._def.values)e[t]=t;return e}extract(e,t=this._def){return lt.create(e,{...this._def,...t})}exclude(e,t=this._def){return lt.create(this.options.filter((r)=>!e.includes(r)),{...this._def,...t})}}lt.create=Ko;class zt extends j{_parse(e){let t=V.getValidEnumValues(this._def.values),r=this._getOrReturnCtx(e);if(r.parsedType!==b.string&&r.parsedType!==b.number){let o=V.objectValues(t);return g(r,{expected:V.joinValues(o),received:r.parsedType,code:f.invalid_type}),w}if(!this._cache)this._cache=new Set(V.getValidEnumValues(this._def.values));if(!this._cache.has(e.data)){let o=V.objectValues(t);return g(r,{received:r.data,code:f.invalid_enum_value,options:o}),w}return Ae(e.data)}get enum(){return this._def.values}}zt.create=(e,t)=>new zt({values:e,typeName:A.ZodNativeEnum,...P(t)});class St extends j{unwrap(){return this._def.type}_parse(e){let{ctx:t}=this._processInputParams(e);if(t.parsedType!==b.promise&&t.common.async===!1)return g(t,{code:f.invalid_type,expected:b.promise,received:t.parsedType}),w;let r=t.parsedType===b.promise?t.data:Promise.resolve(t.data);return Ae(r.then((o)=>this._def.type.parseAsync(o,{path:t.path,errorMap:t.common.contextualErrorMap})))}}St.create=(e,t)=>new St({type:e,typeName:A.ZodPromise,...P(t)});class Ye extends j{innerType(){return this._def.schema}sourceType(){return this._def.schema._def.typeName===A.ZodEffects?this._def.schema.sourceType():this._def.schema}_parse(e){let{status:t,ctx:r}=this._processInputParams(e),o=this._def.effect||null,n={addIssue:(s)=>{if(g(r,s),s.fatal)t.abort();else t.dirty()},get path(){return r.path}};if(n.addIssue=n.addIssue.bind(n),o.type==="preprocess"){let s=o.transform(r.data,n);if(r.common.async)return Promise.resolve(s).then(async(a)=>{if(t.value==="aborted")return w;let c=await this._def.schema._parseAsync({data:a,path:r.path,parent:r});if(c.status==="aborted")return w;if(c.status==="dirty")return yt(c.value);if(t.value==="dirty")return yt(c.value);return c});else{if(t.value==="aborted")return w;let a=this._def.schema._parseSync({data:s,path:r.path,parent:r});if(a.status==="aborted")return w;if(a.status==="dirty")return yt(a.value);if(t.value==="dirty")return yt(a.value);return a}}if(o.type==="refinement"){let s=(a)=>{let c=o.refinement(a,n);if(r.common.async)return Promise.resolve(c);if(c instanceof Promise)throw Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");return a};if(r.common.async===!1){let a=this._def.schema._parseSync({data:r.data,path:r.path,parent:r});if(a.status==="aborted")return w;if(a.status==="dirty")t.dirty();return s(a.value),{status:t.value,value:a.value}}else return this._def.schema._parseAsync({data:r.data,path:r.path,parent:r}).then((a)=>{if(a.status==="aborted")return w;if(a.status==="dirty")t.dirty();return s(a.value).then(()=>({status:t.value,value:a.value}))})}if(o.type==="transform")if(r.common.async===!1){let s=this._def.schema._parseSync({data:r.data,path:r.path,parent:r});if(!ct(s))return w;let a=o.transform(s.value,n);if(a instanceof Promise)throw Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");return{status:t.value,value:a}}else return this._def.schema._parseAsync({data:r.data,path:r.path,parent:r}).then((s)=>{if(!ct(s))return w;return Promise.resolve(o.transform(s.value,n)).then((a)=>({status:t.value,value:a}))});V.assertNever(o)}}Ye.create=(e,t,r)=>new Ye({schema:e,typeName:A.ZodEffects,effect:t,...P(r)});Ye.createWithPreprocess=(e,t,r)=>new Ye({schema:t,effect:{type:"preprocess",transform:e},typeName:A.ZodEffects,...P(r)});class Je extends j{_parse(e){if(this._getType(e)===b.undefined)return Ae(void 0);return this._def.innerType._parse(e)}unwrap(){return this._def.innerType}}Je.create=(e,t)=>new Je({innerType:e,typeName:A.ZodOptional,...P(t)});class nt extends j{_parse(e){if(this._getType(e)===b.null)return Ae(null);return this._def.innerType._parse(e)}unwrap(){return this._def.innerType}}nt.create=(e,t)=>new nt({innerType:e,typeName:A.ZodNullable,...P(t)});class Bt extends j{_parse(e){let{ctx:t}=this._processInputParams(e),r=t.data;if(t.parsedType===b.undefined)r=this._def.defaultValue();return this._def.innerType._parse({data:r,path:t.path,parent:t})}removeDefault(){return this._def.innerType}}Bt.create=(e,t)=>new Bt({innerType:e,typeName:A.ZodDefault,defaultValue:typeof t.default==="function"?t.default:()=>t.default,...P(t)});class Ht extends j{_parse(e){let{ctx:t}=this._processInputParams(e),r={...t,common:{...t.common,issues:[]}},o=this._def.innerType._parse({data:r.data,path:r.path,parent:{...r}});if(It(o))return o.then((n)=>({status:"valid",value:n.status==="valid"?n.value:this._def.catchValue({get error(){return new Le(r.common.issues)},input:r.data})}));else return{status:"valid",value:o.status==="valid"?o.value:this._def.catchValue({get error(){return new Le(r.common.issues)},input:r.data})}}removeCatch(){return this._def.innerType}}Ht.create=(e,t)=>new Ht({innerType:e,typeName:A.ZodCatch,catchValue:typeof t.catch==="function"?t.catch:()=>t.catch,...P(t)});class fr extends j{_parse(e){if(this._getType(e)!==b.nan){let r=this._getOrReturnCtx(e);return g(r,{code:f.invalid_type,expected:b.nan,received:r.parsedType}),w}return{status:"valid",value:e.data}}}fr.create=(e)=>new fr({typeName:A.ZodNaN,...P(e)});var od=Symbol("zod_brand");class oo extends j{_parse(e){let{ctx:t}=this._processInputParams(e),r=t.data;return this._def.type._parse({data:r,path:t.path,parent:t})}unwrap(){return this._def.type}}class hr extends j{_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.common.async)return(async()=>{let n=await this._def.in._parseAsync({data:r.data,path:r.path,parent:r});if(n.status==="aborted")return w;if(n.status==="dirty")return t.dirty(),yt(n.value);else return this._def.out._parseAsync({data:n.value,path:r.path,parent:r})})();else{let o=this._def.in._parseSync({data:r.data,path:r.path,parent:r});if(o.status==="aborted")return w;if(o.status==="dirty")return t.dirty(),{status:"dirty",value:o.value};else return this._def.out._parseSync({data:o.value,path:r.path,parent:r})}}static create(e,t){return new hr({in:e,out:t,typeName:A.ZodPipeline})}}class Vt extends j{_parse(e){let t=this._def.innerType._parse(e),r=(o)=>{if(ct(o))o.value=Object.freeze(o.value);return o};return It(t)?t.then((o)=>r(o)):r(t)}unwrap(){return this._def.innerType}}Vt.create=(e,t)=>new Vt({innerType:e,typeName:A.ZodReadonly,...P(t)});var nd={object:fe.lazycreate},A;(function(e){e.ZodString="ZodString",e.ZodNumber="ZodNumber",e.ZodNaN="ZodNaN",e.ZodBigInt="ZodBigInt",e.ZodBoolean="ZodBoolean",e.ZodDate="ZodDate",e.ZodSymbol="ZodSymbol",e.ZodUndefined="ZodUndefined",e.ZodNull="ZodNull",e.ZodAny="ZodAny",e.ZodUnknown="ZodUnknown",e.ZodNever="ZodNever",e.ZodVoid="ZodVoid",e.ZodArray="ZodArray",e.ZodObject="ZodObject",e.ZodUnion="ZodUnion",e.ZodDiscriminatedUnion="ZodDiscriminatedUnion",e.ZodIntersection="ZodIntersection",e.ZodTuple="ZodTuple",e.ZodRecord="ZodRecord",e.ZodMap="ZodMap",e.ZodSet="ZodSet",e.ZodFunction="ZodFunction",e.ZodLazy="ZodLazy",e.ZodLiteral="ZodLiteral",e.ZodEnum="ZodEnum",e.ZodEffects="ZodEffects",e.ZodNativeEnum="ZodNativeEnum",e.ZodOptional="ZodOptional",e.ZodNullable="ZodNullable",e.ZodDefault="ZodDefault",e.ZodCatch="ZodCatch",e.ZodPromise="ZodPromise",e.ZodBranded="ZodBranded",e.ZodPipeline="ZodPipeline",e.ZodReadonly="ZodReadonly"})(A||(A={}));var v=Qe.create,ge=vt.create,sd=fr.create,ad=_t.create,De=cr.create,id=Nt.create,cd=dr.create,dd=Lt.create,is=$t.create,ld=lr.create,pd=dt.create,ud=Ze.create,md=pr.create,Ce=Ke.create,{create:oe,strictCreate:fd}=fe,cs=Ut.create,hd=ro.create,gd=Dt.create,bd=et.create,ds=ur.create,yd=mr.create,xd=kt.create,vd=Mt.create,_d=Gt.create,Jo=jt.create,Tt=lt.create,kd=zt.create,Sd=St.create,Td=Ye.create,wd=Je.create,Ed=nt.create,Ad=Ye.createWithPreprocess,Cd=hr.create;var no=["http","vercel","cloudflare","deno","netlify"];var Wo=oe({id:v(),name:v(),type:Tt(no),proxyUrl:v(),isActive:De(),testStatus:Tt(["active","error"]).nullable().optional(),lastTestedAt:ge().nullable().optional(),lastError:v().nullable().optional(),rateLimitedUntil:ge().nullable().optional()}),Md=oe({name:v().min(1),type:Tt(no),proxyUrl:v().min(1),isActive:De().optional()}),Nd=oe({name:v().min(1).optional(),proxyUrl:v().min(1).optional(),isActive:De().optional()}),Ld=oe({accountId:v().min(1),apiToken:v().min(1),projectName:v().optional()}),$d=oe({vercelToken:v().min(1),projectName:v().optional()}),Ud=oe({denoToken:v().min(1),orgDomain:v().min(1),projectName:v().optional()}),Dd=oe({netlifyToken:v().min(1),projectName:v().optional()}),qo=oe({ok:De(),status:ge().optional(),statusText:v().nullable().optional(),elapsedMs:ge().optional(),error:v().nullable().optional()}),Qo=["single","round-robin","random"],ls=oe({id:v().trim().toLowerCase().min(1).max(40).regex(/^[a-z0-9][a-z0-9._-]*$/,"Use a lowercase model-combo slug."),name:v().trim().min(1).max(80),models:Ce(v().trim().min(1).max(200)).min(2).max(6)}).superRefine((e,t)=>{let r=new Set;e.models.forEach((o,n)=>{let s=o.trim().toLowerCase();if(r.has(s))t.addIssue({code:f.custom,path:["models",n],message:"A model can appear only once in a combo."});r.add(s)})}),Zo=Ce(ls).max(20).superRefine((e,t)=>{let r=new Set;e.forEach((o,n)=>{let s=o.id.toLowerCase();if(r.has(s))t.addIssue({code:f.custom,path:[n,"id"],message:"Model-combo IDs must be unique."});r.add(s)})}),ps=oe({version:Jo(1),port:ge().int().min(1024).max(65535),apiKey:v().min(8),upstream:v(),selectedModels:Ce(v()),fallbackModels:Ce(v().min(1)).max(2).default([]),modelCombos:Zo.default([]),proxyPools:Ce(Wo),proxyStrategy:Tt(Qo).default("single"),activePoolId:v().nullable().optional(),stickyLimit:ge().int().min(1).max(100).default(1),rtkEnabled:De().default(!0)}),Gd=oe({port:ge().int().min(1024).max(65535).optional(),apiKey:v().min(1).optional(),selectedModels:Ce(v()).optional(),fallbackModels:Ce(v().min(1)).max(2).optional(),modelCombos:Zo.optional(),proxyPools:Ce(Wo).optional(),proxyStrategy:Tt(Qo).optional(),activePoolId:v().nullable().optional(),stickyLimit:ge().int().min(1).max(100).optional(),rtkEnabled:De().optional()}),jd=oe({modelId:v().min(1)}),en=oe({ok:De(),modelId:v(),elapsedMs:ge().int().nonnegative().optional(),reply:v().optional(),error:v().optional()}),us=oe({id:v(),name:v(),limit:oe({context:ge().optional(),output:ge().optional()}).optional(),capabilities:oe({tools:De().optional(),input:Ce(v()).optional(),output:Ce(v()).optional()}).optional(),variants:Ce(oe({id:v(),settings:ds(v(),cs([v(),ge(),De(),is()])).optional()})).optional()});var ms=oe({at:ge(),method:v(),path:v(),model:v(),requestedModel:v().optional(),status:ge(),ms:ge(),poolName:v().optional(),fallbackUsed:De().optional(),fallbackReason:v().optional(),inputTokens:ge().int().nonnegative().optional(),outputTokens:ge().int().nonnegative().optional(),totalTokens:ge().int().nonnegative().optional(),error:v().optional()}),fs=oe({providerId:v(),path:v(),installed:De(),models:ge(),modelIds:Ce(v())}),Pe=oe({running:De(),routerError:v(),endpoint:v(),config:ps,models:Ce(us),modelsFetchedAt:ge().nullable(),modelsError:v(),upstreamCount:ge(),registration:fs,preview:v(),warnings:Ce(v()),requests:Ce(ms)}),tn=oe({kind:Tt(no),code:v()}),zd=oe({ok:Jo(!0)});class wt extends Error{code;constructor(e,t){super(t);this.name="ServiceError",this.code=e}}var hs=oe({error:oe({code:v(),message:v()})}),gs=(e)=>{try{return JSON.parse(e)}catch{return null}},rn=(e)=>{let t=async(r,o,n,s)=>{let a;try{a=await e.serviceRequest({method:r,path:o,body:s===void 0?void 0:JSON.stringify(s)})}catch(u){throw new wt("no-service",u instanceof B&&u.code==="NO_SERVICE"?"Allow the local service for this extension in Settings, Extensions.":"Could not reach the local service.")}let c=gs(a.body);if(a.status>=400){let u=hs.safeParse(c);throw new wt(u.success?u.data.error.code:"unknown",u.success?u.data.error.message:"The local service refused the request.")}let l=n.safeParse(c);if(!l.success)throw new wt("bad-answer","The local service answered with something this panel does not understand.");return l.data};return{state:()=>t("GET","/state",Pe),patchConfig:(r)=>t("PUT","/config",Pe,r),rotateKey:()=>t("POST","/api-key/rotate",Pe,{}),refreshModels:()=>t("POST","/models/refresh",Pe,{}),testModel:(r)=>t("POST","/models/test",en,{modelId:r}),register:()=>t("POST","/register",Pe,{}),unregister:()=>t("POST","/unregister",Pe,{}),relaySource:(r)=>t("GET",`/relays/${r}`,tn),createProxyPool:(r)=>t("POST","/proxy-pools",Pe,r),updateProxyPool:(r,o)=>t("PUT",`/proxy-pools/${r}`,Pe,o),deleteProxyPool:(r)=>t("DELETE",`/proxy-pools/${r}`,Pe),testProxyPool:(r)=>t("POST",`/proxy-pools/${r}/test`,qo,{}),deployCloudflare:(r)=>t("POST","/proxy-pools/cloudflare-deploy",Pe,r),deployVercel:(r)=>t("POST","/proxy-pools/vercel-deploy",Pe,r),deployDeno:(r)=>t("POST","/proxy-pools/deno-deploy",Pe,r),deployNetlify:(r)=>t("POST","/proxy-pools/netlify-deploy",Pe,r)}};var on=(e)=>{let t=null,r="",o=!1,n=new Set,s=()=>{for(let u of n)u()},a=(u)=>u instanceof wt?u.message:u instanceof Error?u.message:String(u),c=async(u)=>{o=!0,s();try{t=await u(e),r=""}catch(y){r=a(y)}finally{o=!1,s()}};return{state:()=>t,error:()=>r,busy:()=>o,subscribe:(u)=>{n.add(u)},load:()=>c((u)=>u.state()),poll:async()=>{if(o)return;try{t=await e.state(),r="",s()}catch{}},run:c}};var nn=`
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
`;var d=(e,t="",r="")=>{let o=document.createElement(e);if(t)o.className=t;if(r)o.textContent=r;return o},sn=(e,t="")=>{let r=d("div",`br-row ${t}`.trim());return e.append(r),r},st=(e,t="")=>{let r=d("div",`br-stack ${t}`.trim());return e.append(r),r},Oe=(e,t,r)=>{let o=d("section","br-card"),n=d("header","br-card-header"),s=d("div"),a=d("h3","br-card-title",t);if(s.append(a),r){let c=d("p","br-card-desc",r);s.append(c)}return n.append(s),o.append(n),e.append(o),{card:o,body:o}},O=(e,t,r,o="default")=>{let n=d("button",`br-btn ${o!=="default"?o:""}`.trim(),t);return n.type="button",n.addEventListener("click",r),e.append(n),n};var bs=(e)=>e===null?"never":new Date(e).toLocaleTimeString(),Be=(e)=>{let t=e.trim().replace(/\([^()]+\)\s*$/,"");return(t.startsWith("blackrouter/")?t.slice(12):t).toLowerCase()},an=(e)=>{if(e>=1e6){if(e===1e6||e===1048576)return"1M";let t=e/1e6;return`${t.toFixed(t%1===0?0:1)}M`}if(e>=1000){if(e%1000===0)return`${e/1000}k`;return`${Math.round(e/1024)}k`}return`${e}`},cn=(e,t,r)=>{let o=st(document.createElement("div")),n="",s="",a=null,c={},l=!1,u=null,y="",K="",_=[],H="",E=(m)=>m.config.selectedModels.length>0?m.config.selectedModels:m.models.map((R)=>R.id),ae=async(m)=>{n="",await e.run((R)=>R.patchConfig({selectedModels:m})),h()},C=(m,R,W)=>{let ie=E(m);if(!W&&ie.length<=1){n="Keep at least one free model selected so OpenCode has an endpoint to call.",h();return}let i=W?[...ie,R]:ie.filter((p)=>p!==R);ae(i)},M=(m)=>{ae(m.models.map((R)=>R.id))},Q=(m)=>{if(m.models.length>0)ae([m.models[0].id])},ve=async(m)=>{if(n="",await e.run((R)=>R.patchConfig({fallbackModels:m.slice(0,2)})),e.error()){n=e.error(),h();return}await r.toast({kind:"success",message:"Model fallback order saved."}),h()},Te=async(m)=>{if(n="",await e.run((R)=>R.patchConfig({modelCombos:m})),e.error()){n=e.error(),h();return}l=!1,u=null,y="",K="",_=[],H="",await r.toast({kind:"success",message:"Named model combo saved."}),h()},te=(m)=>{n="",l=!0,u=m?.id??null,y=m?.id??"",K=m?.name??"",_=m?[...m.models]:[],H="",h()},He=async(m)=>{let R=y.trim().toLowerCase(),W=K.trim();if(!/^[a-z0-9][a-z0-9._-]{0,39}$/.test(R)){n="Combo ID must be a lowercase slug (letters, numbers, dot, underscore, hyphen).",h();return}if(!W||W.length>80){n="Enter a combo name of 1–80 characters.",h();return}if(_.length<2||_.length>6){n="A named combo needs 2–6 models in priority order.",h();return}let ie=_.map(Be);if(new Set(ie).size!==ie.length){n="A model can appear only once in a combo.",h();return}if(m.some((T)=>T.id.toLowerCase()===R&&T.id!==u)){n="That combo ID already exists.",h();return}let i={id:R,name:W,models:[..._]},p=u?m.map((T)=>T.id===u?i:T):[...m,i];await Te(p)},he=async(m)=>{let R=e.state();if(!R)return;await Te((R.config.modelCombos??[]).filter((W)=>W.id!==m))},F=async()=>{if(n="",await e.run((m)=>m.refreshModels()),e.error())await r.toast({kind:"error",message:e.error()});h()},h=()=>{o.replaceChildren();let m=e.state();if(!m)return;let{card:R}=Oe(o,"OpenCode Zen Free Catalog","Select the free models OpenCode and clients can call. Paid models are filtered out.");if(m.modelsError){let k=d("div");Ne(k,{tone:"warning",title:"Could not refresh catalog",body:m.modelsError}),R.append(k)}if(n){let k=d("div");Ne(k,{tone:"error",title:"Selection notice",body:n}),R.append(k)}if(m.models.length===0){Pt(R,{title:"No free models detected",body:"Refresh the list. If it stays empty, check the upstream and any relay configured.",action:{label:"Refresh",onClick:()=>void F()}});return}let W=d("input","br-search-input");W.type="text",W.placeholder="Search free models by name or id...",W.value=s,W.oninput=()=>{s=W.value.toLowerCase(),X()},R.append(W);let ie=d("div","br-row between"),i=E(m),p=d("span","br-muted br-mono",`${i.length} of ${m.models.length} active · Updated ${bs(m.modelsFetchedAt)}`);ie.append(p);let T=d("div","br-row");O(T,"Select All",()=>M(m)),O(T,"Reset",()=>Q(m)),O(T,"Refresh List",()=>void F()),ie.append(T),R.append(ie);let N=d("div","br-models-grid");R.append(N);let X=()=>{N.replaceChildren();let k=m.models.filter((S)=>S.id.toLowerCase().includes(s)||S.name.toLowerCase().includes(s));if(k.length===0){let S=d("p","br-muted","No free models match your filter.");N.append(S);return}for(let S of k){let ne=i.includes(S.id),se=d("div",`br-model-card ${ne?"selected":""}`),Se=d("div","br-model-card-info");Se.append(d("span","br-model-name",S.name)),Se.append(d("span","br-model-id",S.id));let le=d("div","br-row");le.style.gap="4px",le.style.marginTop="4px";let Fe=S.limit?.context?an(S.limit.context):"128k";if(le.append(d("span","br-badge br-badge-neutral",`${Fe} ctx`)),S.limit?.output){let ke=an(S.limit.output);le.append(d("span","br-badge br-badge-neutral",`${ke} out`))}if(S.capabilities?.input?.includes("image"))le.append(d("span","br-badge br-badge-neutral","Vision"));if(S.variants&&S.variants.length>0)le.append(d("span","br-badge br-badge-running","Thinking"));if(S.capabilities?.tools)le.append(d("span","br-badge br-badge-neutral","Tools"));Se.append(le),se.append(Se);let be=d("div","br-model-right"),Z=c[S.id];if(Z)if(Z.ok)be.append(d("span","br-badge br-badge-running",`${Z.elapsedMs??0}ms ✓`));else{let ke=d("span","br-badge br-badge-stopped","Failed ✗");ke.title=Z.error||"Test failed",be.append(ke)}let tt=a===S.id,At=O(be,tt?"Testing...":"Test",async(ke)=>{ke.stopPropagation(),a=S.id,X();try{let $e=await t.testModel(S.id);if(c[S.id]=$e,$e.ok)await r.toast({kind:"success",message:`${S.name}: Test passed (${$e.elapsedMs??0}ms). "${$e.reply?.slice(0,40)||"OK"}"`});else await r.toast({kind:"error",message:`${S.name}: ${$e.error||"Test failed."}`})}catch($e){c[S.id]={ok:!1,modelId:S.id,error:String($e)},await r.toast({kind:"error",message:$e instanceof Error?$e.message:String($e)})}finally{a=null,X()}});At.disabled=tt;let ee=d("div");Jr(ee,{label:"",checked:ne,onChange:(ke)=>C(m,S.id,ke)}),be.append(ee),se.append(be),se.onclick=(ke)=>{if(ke.target.closest("input, button"))return;C(m,S.id,!ne)},N.append(se)}};X();let{card:L}=Oe(o,"Automatic Model Fallback","If a request fails with a retryable upstream error, BlackRouter tries these models in order. The requested model is always attempted first."),ce=m.config.fallbackModels??[];if(ce.length===0)L.append(d("p","br-muted","No fallback models configured. Failed requests will return the upstream error."));let Ee=d("div","br-stack");for(let k=0;k<ce.length;k+=1){let S=ce[k],ne=m.models.find((Z)=>Be(Z.id)===Be(S)),se=d("div","br-row between");se.style.alignItems="center";let Se=d("div","br-stack");Se.append(d("span","br-model-name",`${k+1}. ${ne?.name??S}`)),Se.append(d("span","br-model-id",S)),se.append(Se);let le=d("div","br-row"),Fe=O(le,"Move up",()=>{if(k===0)return;let Z=[...ce];[Z[k-1],Z[k]]=[Z[k],Z[k-1]],ve(Z)});Fe.disabled=k===0;let be=O(le,"Move down",()=>{if(k>=ce.length-1)return;let Z=[...ce];[Z[k+1],Z[k]]=[Z[k],Z[k+1]],ve(Z)});be.disabled=k>=ce.length-1,O(le,"Remove",()=>{ve(ce.filter((Z,tt)=>tt!==k))}),se.append(le),Ee.append(se)}L.append(Ee);let z=new Set(ce.map(Be)),_e=m.models.filter((k)=>!z.has(Be(k.id))),Ve=d("div","br-row"),G=d("select","br-search-input");G.style.flex="1";let U=document.createElement("option");U.value="",U.textContent=_e.length>0?"Choose a fallback model…":"No additional models available",G.append(U);for(let k of _e){let S=document.createElement("option");S.value=k.id,S.textContent=k.name,G.append(S)}G.disabled=ce.length>=2||_e.length===0,Ve.append(G);let de=O(Ve,"Add fallback",()=>{if(!G.value||ce.length>=2)return;ve([...ce,G.value])},"primary");de.disabled=G.disabled,L.append(Ve),L.append(d("p","br-muted","Fallbacks are tried only for HTTP 404, 408, 429, 500, 502, 503, or 504. Up to two fallback models are allowed per request."));let{card:Ge}=Oe(o,"Named Model Combos","Create a reusable model alias with its own ordered fallback chain. In OpenCode, use blackrouter/combo/<id>."),D=m.config.modelCombos??[];if(D.length===0)Ge.append(d("p","br-muted","No named combos yet. Each combo can contain 2–6 free models and is limited to a maximum of 20 combos."));for(let k of D){let S=d("div","br-stack");S.style.gap="6px",S.style.padding="10px 0",S.style.borderBottom="1px solid var(--border-subtle, rgba(127,127,127,.22))";let ne=d("div","br-row between"),se=d("div","br-stack");se.append(d("span","br-model-name",k.name)),se.append(d("span","br-model-id","blackrouter/combo/"+k.id)),ne.append(se);let Se=d("div","br-row");O(Se,"Edit",()=>te(k)),O(Se,"Remove",()=>void he(k.id)),ne.append(Se),S.append(ne),k.models.forEach((le,Fe)=>{let be=m.models.find((Z)=>Be(Z.id)===Be(le));S.append(d("span","br-muted",Fe+1+". "+(be?.name??le)))}),Ge.append(S)}if(l){let k=d("div","br-stack");k.style.gap="8px",k.style.marginTop="10px";let S=d("input","br-search-input");S.type="text",S.maxLength=40,S.placeholder="combo-id (e.g. fast-coding)",S.value=y,S.disabled=u!==null,S.oninput=()=>{y=S.value.toLowerCase()},k.append(d("label","br-muted","Combo ID")),k.append(S);let ne=d("input","br-search-input");ne.type="text",ne.maxLength=80,ne.placeholder="Display name",ne.value=K,ne.oninput=()=>{K=ne.value},k.append(d("label","br-muted","Display name")),k.append(ne),k.append(d("label","br-muted","Priority order · "+_.length+"/6 models"));let se=d("div","br-stack");for(let ee=0;ee<_.length;ee+=1){let ke=_[ee],$e=m.models.find((xo)=>Be(xo.id)===Be(ke)),vr=d("div","br-row between"),_r=d("div","br-stack");_r.append(d("span","br-model-name",ee+1+". "+($e?.name??ke))),_r.append(d("span","br-model-id",ke)),vr.append(_r);let Kt=d("div","br-row"),bo=O(Kt,"↑",()=>{if(ee===0)return;[_[ee-1],_[ee]]=[_[ee],_[ee-1]],h()});bo.title="Move model up",bo.disabled=ee===0;let yo=O(Kt,"↓",()=>{if(ee>=_.length-1)return;[_[ee+1],_[ee]]=[_[ee],_[ee+1]],h()});yo.title="Move model down",yo.disabled=ee>=_.length-1,O(Kt,"Remove",()=>{_=_.filter((xo,vn)=>vn!==ee),h()}),vr.append(Kt),se.append(vr)}k.append(se);let Se=new Set(_.map(Be)),le=m.models.filter((ee)=>!Se.has(Be(ee.id))),Fe=d("div","br-row"),be=d("select","br-search-input");be.style.flex="1";let Z=document.createElement("option");Z.value="",Z.textContent=le.length>0?"Choose a free model…":"No additional models available",be.append(Z);for(let ee of le){let ke=document.createElement("option");ke.value=ee.id,ke.textContent=ee.name,be.append(ke)}be.value=H,be.disabled=_.length>=6||le.length===0,Fe.append(be);let tt=O(Fe,"Add model",()=>{if(!H||_.length>=6)return;_=[..._,H],H="",h()});be.onchange=()=>{H=be.value,tt.disabled=be.disabled||!H},tt.disabled=be.disabled||!H,Fe.append(tt),k.append(Fe);let At=d("div","br-row");O(At,"Save Combo",()=>void He(D),"primary"),O(At,"Cancel",()=>{l=!1,u=null,y="",K="",_=[],H="",h()}),k.append(At),Ge.append(k)}else{let k=O(Ge,"Create Model Combo",()=>te(),"primary");k.disabled=D.length>=20}};return{element:o,render:h}};var dn=(e,t)=>{let r=st(document.createElement("div")),o=!1,n=async(c,l)=>{try{await t.writeClipboard(c),await t.toast({kind:"success",message:`${l} copied.`})}catch{await t.toast({kind:"error",message:"Failed to copy."})}},s=async(c,l)=>{if(o=!1,await e.run(c),e.error())await t.toast({kind:"error",message:e.error()});else await t.toast({kind:"success",message:l});a()},a=()=>{r.replaceChildren();let c=e.state();if(!c)return;let{card:l}=Oe(r,"OpenCode Provider Registration","BlackRouter registers this local endpoint directly into OpenCode’s configuration file.");for(let Q of c.warnings){let ve=d("div");Ne(ve,{tone:"warning",title:"File warning",body:Q}),l.append(ve)}let u=d("div","br-opencode-hero"),y=d("div","br-opencode-desc"),K=d("span",`br-badge ${c.registration.installed?"br-badge-running":"br-badge-neutral"}`,c.registration.installed?"Registered":"Not Registered"),_=d("div","br-row");_.append(K),_.append(d("span","br-mono",c.registration.path)),y.append(_);let H=d("span","br-muted",c.registration.installed?`${c.registration.models} free model${c.registration.models===1?"":"s"} registered in OpenCode config.`:"Click register to add BlackRouter into your active OpenCode configuration.");y.append(H),u.append(y);let E=d("div","br-row");if(c.registration.installed)O(E,"Update Provider",()=>void s((Q)=>Q.register(),"Provider updated in OpenCode config."),"primary"),O(E,o?"Confirm Remove?":"Remove",()=>{if(!o){o=!0,a();return}s((Q)=>Q.unregister(),"Provider removed from OpenCode config.")},o?"destructive":"default");else{let Q=O(E,"Register in OpenCode",()=>void s((ve)=>ve.register(),"Provider added to OpenCode config."),"primary");Q.disabled=c.models.length===0}u.append(E),l.append(u);let{card:ae}=Oe(r,"Config Block Preview","The exact JSON configuration written to OpenCode."),C=d("pre","br-json-block",c.preview);ae.append(C);let M=d("div","br-row");O(M,"Copy JSON Block",()=>void n(c.preview,"Config block")),ae.append(M)};return{element:r,render:a}};var ys=[{id:"cloudflare",label:"Cloudflare Worker"},{id:"vercel",label:"Vercel Edge"},{id:"deno",label:"Deno Deploy"},{id:"netlify",label:"Netlify Function"},{id:"http",label:"Forward Proxy"}],ln=(e,t,r)=>{let o=st(document.createElement("div")),n=!1,s="cloudflare",a=!1,c="",l=null,u={name:"",type:"http",proxyUrl:""},y={accountId:"",apiToken:"",projectName:""},K={vercelToken:"",projectName:""},_={denoToken:"",orgDomain:"",projectName:""},H={netlifyToken:"",projectName:""},E=async(h,m)=>{try{await r.writeClipboard(h),await r.toast({kind:"success",message:`${m} copied.`})}catch{c="The clipboard refused the copy.",F()}},ae=async(h)=>{try{let m=await t.relaySource(h);await E(m.code,`${h} relay code`)}catch(m){await r.toast({kind:"error",message:m instanceof Error?m.message:String(m)})}},C=async()=>{a=!0,c="",F();try{if(s==="http"){if(!u.name.trim()||!u.proxyUrl.trim())throw Error("Name and Proxy URL are required.");await e.run((h)=>h.createProxyPool({name:u.name.trim(),type:"http",proxyUrl:u.proxyUrl.trim(),isActive:!0})),u.name="",u.proxyUrl=""}else if(s==="cloudflare"){if(!y.accountId.trim()||!y.apiToken.trim())throw Error("Cloudflare Account ID and API Token are required.");await e.run((h)=>h.deployCloudflare({accountId:y.accountId.trim(),apiToken:y.apiToken.trim(),projectName:y.projectName.trim()||void 0})),y.accountId="",y.apiToken="",y.projectName=""}else if(s==="vercel"){if(!K.vercelToken.trim())throw Error("Vercel API Token is required.");await e.run((h)=>h.deployVercel({vercelToken:K.vercelToken.trim(),projectName:K.projectName.trim()||void 0})),K.vercelToken="",K.projectName=""}else if(s==="deno"){if(!_.denoToken.trim()||!_.orgDomain.trim())throw Error("Deno Deploy Token and Organization Domain are required.");await e.run((h)=>h.deployDeno({denoToken:_.denoToken.trim(),orgDomain:_.orgDomain.trim(),projectName:_.projectName.trim()||void 0})),_.denoToken="",_.orgDomain="",_.projectName=""}else if(s==="netlify"){if(!H.netlifyToken.trim())throw Error("Netlify API Token is required.");await e.run((h)=>h.deployNetlify({netlifyToken:H.netlifyToken.trim(),projectName:H.projectName.trim()||void 0})),H.netlifyToken="",H.projectName=""}n=!1,await r.toast({kind:"success",message:"Relay configured and activated."})}catch(h){c=h instanceof Error?h.message:String(h)}finally{a=!1,F()}},M=async(h)=>{await e.run((m)=>m.updateProxyPool(h.id,{isActive:!h.isActive}))},Q=async(h)=>{await e.run((m)=>m.patchConfig({proxyStrategy:h})),await r.toast({kind:"info",message:`Routing strategy set to ${h}.`})},ve=async(h)=>{await e.run((m)=>m.patchConfig({stickyLimit:h}))},Te=async(h)=>{let m=e.state();if(!m)return;let R=m.config.proxyPools.map((W)=>({...W,isActive:W.id===h.id}));await e.run((W)=>W.patchConfig({proxyPools:R,activePoolId:h.id,proxyStrategy:"single"})),await r.toast({kind:"success",message:`${h.name} set as primary route.`})},te=async()=>{let h=e.state();if(!h)return;let m=h.config.proxyPools.map((R)=>({...R,isActive:!1}));await e.run((R)=>R.patchConfig({activePoolId:null,proxyPools:m})),await r.toast({kind:"info",message:"Switched to direct routing."})},He=async(h)=>{await e.run((m)=>m.deleteProxyPool(h)),await r.toast({kind:"success",message:"Proxy pool removed."})},he=async(h)=>{l=h,F();try{let m=await t.testProxyPool(h);if(await e.load(),m.ok)await r.toast({kind:"success",message:`Relay test passed (${m.elapsedMs||0}ms).`});else await r.toast({kind:"error",message:m.error||"Relay test failed."})}catch(m){await r.toast({kind:"error",message:m instanceof Error?m.message:String(m)})}finally{l=null,F()}},F=()=>{o.replaceChildren();let h=e.state();if(!h)return;let m=h.config.proxyStrategy||"single",R=h.config.stickyLimit??1,{card:W}=Oe(o,"Upstream Routing & Strategy","Select whether calls go directly, through a dedicated relay, or load-balance across pools."),ie=d("div","br-strategy-toolbar"),i=d("div","br-strategy-group");i.append(d("span","br-strategy-label","Strategy:"));let p=d("div","br-strategy-tabs"),T=[{id:"single",label:"Single Pool"},{id:"round-robin",label:"Round-Robin"},{id:"random",label:"Random"}];for(let G of T){let U=d("button",`br-strategy-tab ${m===G.id?"active":""}`,G.label);U.onclick=()=>void Q(G.id),p.append(U)}if(i.append(p),ie.append(i),m==="round-robin"){let G=d("div","br-sticky-control");G.append(d("span","","Sticky Turns:"));let U=d("input","br-sticky-input");U.type="number",U.min="1",U.max="100",U.value=String(R),U.onchange=()=>{let de=Math.max(1,parseInt(U.value,10)||1);U.value=String(de),ve(de)},G.append(U),ie.append(G)}W.append(ie);let N=h.config.proxyPools.filter((G)=>G.isActive),X=h.config.proxyPools.find((G)=>G.id===h.config.activePoolId)||h.config.proxyPools.find((G)=>G.isActive),L=d("div","br-pool-card active"),ce=d("div","br-pool-left"),Ee=d("div","br-pool-info"),z=d("div","br-pool-title-row");if(m==="round-robin")z.append(d("span","br-pool-name","Round-Robin Load Balancing")),z.append(d("span",N.length>0?"br-badge br-badge-primary":"br-badge br-badge-stopped",`${N.length} Pools Active`)),Ee.append(z),Ee.append(d("span","br-pool-url",N.length>0?`Sequentially rotating across ${N.length} active relays with ${R} sticky turn(s) each.`:"No relays active in pool. Falling back to direct connection."));else if(m==="random")z.append(d("span","br-pool-name","Random Upstream Routing")),z.append(d("span",N.length>0?"br-badge br-badge-primary":"br-badge br-badge-stopped",`${N.length} Pools Active`)),Ee.append(z),Ee.append(d("span","br-pool-url",N.length>0?`Distributing requests uniformly at random across ${N.length} active relays.`:"No relays active in pool. Falling back to direct connection."));else if(X)z.append(d("span","br-pool-name",X.name)),z.append(d("span","br-badge br-badge-primary",X.type==="http"?"Forward Proxy":`${X.type} Relay`)),Ee.append(z),Ee.append(d("span","br-pool-url",X.proxyUrl));else z.append(d("span","br-pool-name","Direct Connection")),z.append(d("span","br-badge br-badge-neutral","Direct")),Ee.append(z),Ee.append(d("span","br-pool-url","Direct requests from this machine to https://opencode.ai/zen/v1"));ce.append(Ee),L.append(ce);let _e=d("div","br-pool-actions");if(m==="single"&&X)O(_e,"Switch to Direct",()=>void te());if(O(_e,n?"Close Form":"+ Add / Deploy Relay",()=>{n=!n,c="",F()},n?"default":"primary"),L.append(_e),W.append(L),n){let G=d("div","br-deploy-box");if(c){let D=d("div");Ne(D,{tone:"error",title:"Deployment error",body:c}),G.append(D)}let U=d("div","br-deploy-nav");for(let D of ys){let k=d("button",`br-deploy-tab ${s===D.id?"active":""}`,D.label);k.onclick=()=>{s=D.id,c="",F()},U.append(k)}G.append(U);let de=d("div","br-stack");if(G.append(de),s==="cloudflare")Re(de,{label:"Account ID",value:y.accountId,placeholder:"Cloudflare dashboard -> Overview",onChange:(D)=>y.accountId=D}),Re(de,{label:"API Token",value:y.apiToken,password:!0,placeholder:"Cloudflare Workers edit permissions",onChange:(D)=>y.apiToken=D}),Re(de,{label:"Worker Name",value:y.projectName,placeholder:"blackrouter-relay (optional)",onChange:(D)=>y.projectName=D});else if(s==="vercel")Re(de,{label:"Vercel API Token",value:K.vercelToken,password:!0,placeholder:"Account Settings -> Tokens",onChange:(D)=>K.vercelToken=D}),Re(de,{label:"Project Name",value:K.projectName,placeholder:"blackrouter-relay (optional)",onChange:(D)=>K.projectName=D});else if(s==="deno")Re(de,{label:"Deno Access Token",value:_.denoToken,password:!0,placeholder:"Deno Deploy -> Access Tokens",onChange:(D)=>_.denoToken=D}),Re(de,{label:"Organization / Subdomain",value:_.orgDomain,placeholder:"your-org.deno.dev",onChange:(D)=>_.orgDomain=D}),Re(de,{label:"Project Name",value:_.projectName,placeholder:"blackrouter-relay (optional)",onChange:(D)=>_.projectName=D});else if(s==="netlify")Re(de,{label:"Netlify Personal Access Token",value:H.netlifyToken,password:!0,placeholder:"User Settings -> Applications",onChange:(D)=>H.netlifyToken=D}),Re(de,{label:"Site Name",value:H.projectName,placeholder:"blackrouter-relay (optional)",onChange:(D)=>H.projectName=D});else if(s==="http")Re(de,{label:"Proxy Name",value:u.name,placeholder:"e.g. Clash / Corporate Proxy",onChange:(D)=>u.name=D}),Re(de,{label:"Proxy URL",value:u.proxyUrl,placeholder:"http://127.0.0.1:7890 or http://user:pass@host:port",onChange:(D)=>u.proxyUrl=D});let Ge=d("div","br-row");if(O(Ge,a?"Saving...":s==="http"?"Add Proxy":"Deploy & Activate",()=>void C(),"primary"),s!=="http")O(Ge,"Copy Standalone Script",()=>void ae(s));O(Ge,"Cancel",()=>{n=!1,F()}),G.append(Ge),o.append(G)}let{card:Ve}=Oe(o,"Configured Proxy Pools",m==="single"?'Manage deployed relays. Click "Set Primary" to route calls through that relay.':"Manage deployed relays. Toggle relays to include or exclude them from the active rotation pool.");if(h.config.proxyPools.length===0){let G=d("p","br-card-desc","No proxy pools configured. Deploy one using the button above to route through Cloudflare, Vercel, Deno, Netlify, or Forward Proxy.");Ve.append(G)}else{let G=d("div","br-pool-grid");for(let U of h.config.proxyPools){let de=h.config.activePoolId?U.id===h.config.activePoolId:U.isActive,Ge=m==="single"?de:U.isActive,D=d("div",`br-pool-card ${Ge?"active":""}`),k=d("div","br-pool-left"),S=d("div","br-pool-info"),ne=d("div","br-pool-title-row");if(ne.append(d("span","br-pool-name",U.name)),ne.append(d("span","br-badge br-badge-neutral",U.type==="http"?"Forward Proxy":`${U.type} Relay`)),U.testStatus==="active")ne.append(d("span","br-badge br-badge-running","Healthy"));else if(U.testStatus==="error")ne.append(d("span","br-badge br-badge-stopped","Failed"));S.append(ne),S.append(d("span","br-pool-url",U.proxyUrl)),k.append(S),D.append(k);let se=d("div","br-pool-actions");if(m==="single")O(se,de?"Primary ✓":"Set Primary",()=>void Te(U),de?"primary":"default");else O(se,U.isActive?"In Rotation ✓":"Add to Rotation",()=>void M(U),U.isActive?"primary":"default");let Se=l===U.id,le=O(se,Se?"Testing...":"Test",()=>void he(U.id));if(le.disabled=Se,U.type!=="http")O(se,"Copy Script",()=>void ae(U.type));O(se,"Delete",()=>void He(U.id),"destructive"),D.append(se),G.append(D)}Ve.append(G)}};return{element:o,render:F}};var pn=(e,t,r,o)=>{let n=st(document.createElement("div")),s="",a=!1,c=!1,l="",u=(E)=>{s=String(E.config.port)},y=async(E,ae)=>{try{await r.writeClipboard(E),await r.toast({kind:"success",message:`${ae} copied.`})}catch{l="The clipboard refused the copy.",H()}},K=async()=>{let E=Number(s);if(!Number.isInteger(E)||E<1024||E>65535){l="The port must be a whole number between 1024 and 65535.",H();return}l="",await e.run((C)=>C.patchConfig({port:E}));let ae=e.state();if(ae)u(ae);H()},_=async()=>{l="",await e.run((E)=>E.rotateKey()),await r.toast({kind:"success",message:"New API key generated and saved."}),H()},H=()=>{n.replaceChildren();let E=e.state();if(!E){if(e.error()){Pt(n,{title:"Local service is not reachable",body:"Allow the local service for BlackRouter in Settings -> Extensions, then retry.",action:{label:"Retry",onClick:()=>{e.load()}}});return}let z=sn(n);qr(z,{label:"Connecting to local service..."});return}if(!a)u(E),a=!0;if(!E.running){let z=d("div");n.append(z),Ne(z,{tone:"error",title:"Router listener is not active",body:E.routerError||"The listener did not start. Change the port below and save."})}if(l){let z=d("div");n.append(z),Ne(z,{tone:"error",title:"Action failed",body:l})}let{card:ae}=Oe(n,"Connection & Endpoint","OpenCode and any OpenAI-compatible client connect to this loopback address."),C=d("div","br-kv-grid");ae.append(C);let M=d("div","br-kv-box");M.append(d("span","br-kv-label","Base URL (Endpoint)"));let Q=d("div","br-kv-val");Q.append(d("span","br-kv-text",E.endpoint)),O(Q,"Copy URL",()=>void y(E.endpoint,"Endpoint")),M.append(Q),C.append(M);let ve=d("div","br-kv-box");ve.append(d("span","br-kv-label","API Key"));let Te=d("div","br-kv-val");Te.append(d("span","br-kv-text",c?E.config.apiKey:`${E.config.apiKey.slice(0,7)}••••••••••••••••`));let te=d("div","br-row");O(te,c?"Hide":"Reveal",()=>{c=!c,H()}),O(te,"Copy",()=>void y(E.config.apiKey,"API key")),O(te,"Rotate",()=>void _()),Te.append(te),ve.append(Te),C.append(ve);let He=d("div","br-kv-box");He.append(d("span","br-kv-label","Listening Port"));let he=d("div","br-kv-val"),F=d("input","br-search-input br-mono");F.type="number",F.value=s,F.style.maxWidth="110px",F.oninput=()=>{s=F.value,h.disabled=s===String(E.config.port)},he.append(F);let h=O(he,"Save Port",()=>void K(),"primary");h.disabled=s===String(E.config.port),He.append(he),C.append(He);let m=d("div","br-kv-box");m.append(d("span","br-kv-label","RTK Token Saver"));let R=d("div","br-kv-val");Yr(R,{label:E.config.rtkEnabled!==!1?"Enabled":"Disabled",description:"Compacts git diff, status, and grep tool outputs (saves ~30% tokens)",checked:E.config.rtkEnabled!==!1,onChange:(z)=>{e.run((_e)=>_e.patchConfig({rtkEnabled:z}))}}),m.append(R),C.append(m);let{card:W}=Oe(n,"Upstream Routing","Traffic to OpenCode Zen can route directly or through a serverless proxy pool."),ie=E.config.proxyStrategy||"single",i=E.config.proxyPools.filter((z)=>z.isActive),p=E.config.activePoolId?i.find((z)=>z.id===E.config.activePoolId)||i[0]:i[0],T=d("div","br-pool-card active"),N=d("div","br-pool-left"),X=d("div","br-pool-info"),L=d("div","br-pool-title-row");if(ie==="round-robin")L.append(d("span","br-pool-name","Round-Robin Rotation")),L.append(d("span","br-badge br-badge-running",`${i.length} Pools`)),X.append(L),X.append(d("span","br-pool-url",`Sequential rotation with sticky turn limit ${E.config.stickyLimit||1}`));else if(ie==="random")L.append(d("span","br-pool-name","Random Upstream Routing")),L.append(d("span","br-badge br-badge-primary",`${i.length} Pools`)),X.append(L),X.append(d("span","br-pool-url","Uniform random distribution across active proxy pools"));else if(p){L.append(d("span","br-pool-name",p.name));let z=d("span","br-badge br-badge-primary",p.type);L.append(z),X.append(L),X.append(d("span","br-pool-url",p.proxyUrl))}else{L.append(d("span","br-pool-name","Direct Routing"));let z=d("span","br-badge br-badge-neutral","Direct");L.append(z),X.append(L),X.append(d("span","br-pool-url","Direct requests from this machine to https://opencode.ai/zen/v1"))}N.append(X),T.append(N);let ce=d("div","br-pool-actions");if(o)O(ce,"Manage Proxy Pools",()=>o("proxy-pools"));T.append(ce),W.append(T);let{card:Ee}=Oe(n,"Recent Calls","The last requests answered by this router. Kept in memory.");if(E.requests.length===0){let z=d("p","br-card-desc","No requests yet. Calls from OpenCode or other clients will appear here.");Ee.append(z)}else{let z=d("div");for(let _e of E.requests.slice(0,8)){let Ve=d("div","br-call-row"),G=d("div","br-call-left"),U=d("span",`br-badge ${_e.status>=200&&_e.status<300?"br-badge-running":"br-badge-stopped"}`,String(_e.status));if(G.append(U),G.append(d("span","br-call-name",_e.model||_e.path)),_e.poolName)G.append(d("span","br-badge br-badge-neutral",_e.poolName));Ve.append(G),Ve.append(d("span","br-call-ms",`${_e.ms}ms`)),z.append(Ve)}Ee.append(z)}};return{element:n,render:H}};var Et=zr(),un=document.querySelector("#root");if(!un)throw Error("Missing root");var mn=document.createElement("style");mn.textContent=nn;document.head.append(mn);Et.onReady((e)=>Br(e,document.documentElement));var br=rn(Et),Ie=on(br),Xt=document.createElement("div");Xt.className="br-root";un.replaceChildren(Xt);var so=document.createElement("header");so.className="br-header";var ao=document.createElement("div");ao.className="br-header-left";var io=document.createElement("div");io.className="br-logo-box";io.textContent="⚡";var co=document.createElement("div");co.className="br-header-titles";var lo=document.createElement("div");lo.className="br-title-row";var fn=document.createElement("h1");fn.textContent="BlackRouter";var Ft=document.createElement("span");Ft.className="br-badge br-badge-neutral";Ft.textContent="Connecting...";lo.append(fn,Ft);var po=document.createElement("p");po.className="br-header-sub";po.textContent="OpenCode Zen Local Endpoint & Proxy Pools";co.append(lo,po);ao.append(io,co);var uo=document.createElement("div");uo.className="br-header-right";var xs=rt(uo,{label:"Refresh",variant:"outline",size:"sm",onClick:()=>{Ie.load()}});so.append(ao,uo);Xt.append(so);var mo=document.createElement("div");mo.className="br-nav-bar";var hn=document.createElement("div");mo.append(hn);Xt.append(mo);var yr=document.createElement("main");yr.className="br-stack";Xt.append(yr);var xr=document.createElement("div");xr.hidden=!0;var vs=Ne(xr,{tone:"error",title:""});yr.append(xr);var gr="router",fo=null,ho=(e)=>{gr=e,fo?.update({activeId:gr});for(let r of go)r.element.hidden=r.id!==e;let t=Ie.state();if(e==="models"&&t&&t.models.length===0&&!Ie.busy())Ie.run((r)=>r.refreshModels())},gn=pn(Ie,br,Et,(e)=>ho(e)),bn=ln(Ie,br,Et),yn=cn(Ie,br,Et),xn=dn(Ie,Et),go=[{id:"router",label:"Router",element:gn.element},{id:"proxy-pools",label:"Proxy Pools",element:bn.element},{id:"models",label:"Models",element:yn.element},{id:"opencode",label:"OpenCode",element:xn.element}];for(let e of go)yr.append(e.element);fo=Wr(hn,{items:go.map((e)=>({id:e.id,label:e.label})),activeId:gr,onChange:ho});ho("router");var _s=()=>{let e=Ie.state();if(e){Ft.className=`br-badge ${e.running?"br-badge-running":"br-badge-stopped"}`,Ft.innerHTML=`<span class="br-dot ${e.running?"on":"off"}"></span> ${e.running?`127.0.0.1:${e.config.port}`:"Stopped"}`;let o=e.config.proxyPools.length,n=e.models.length,s=e.registration.installed;fo?.update({activeId:gr,items:[{id:"router",label:"Router"},{id:"proxy-pools",label:o>0?`Proxy Pools (${o})`:"Proxy Pools"},{id:"models",label:n>0?`Models (${n})`:"Models"},{id:"opencode",label:s?"OpenCode ✓":"OpenCode"}]})}let t=Ie.error(),r=Boolean(t)&&e!==null;if(xr.hidden=!r,t&&r)vs.update({tone:"error",title:"Local service notice",body:t});xs.update({loading:Ie.busy()}),gn.render(),bn.render(),yn.render(),xn.render()};Ie.subscribe(_s);Ie.load();setInterval(()=>{Ie.poll()},30000);})();
