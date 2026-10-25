(()=>{var V="openchamber.sdk",F=1;var dr=`
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
`;var lr=128,pr=65536;var sn=["file","directory","other","missing"],fr=(e)=>Boolean(e&&"sessionId"in e),mr=(e)=>Boolean(e&&"sent"in e&&!("sessionId"in e));var Lt=500,Ut=32000,an=16000,cn=128,dn=200,ln=2000,pn=16000,un=80,fn=200,mn=16000;var hn=2000;var hr=20000,Gt=1024,Dt=2000000;var jt=64000,zt=8000,gr=4000;var yr=90000;var gn=999,Bt=500,yn=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED"],bn=["stopped","starting","ready","failed"],oo=new Set(yn),xn=(e)=>oo.has(e),vn=(e)=>e&&xn(e)?e:"HOST_REJECTED",et=(e)=>{if(e===void 0)return!1;if(e===null||e===!0||e===!1)return!0;if(String(e)===e)return!0;if(Number(e)===e)return Number.isFinite(e);if(Array.isArray(e))return e.every(et);if(Object(e)===e)return Object.values(e).every(et);return!1},_n=(e)=>et(e)&&JSON.stringify(e).length<=mn,on=(e)=>e?.trim().slice(0,fn)??"",tt=(e)=>{let t=e.id.trim().slice(0,cn),r=e.title.trim().slice(0,dn),n=e.url.trim().slice(0,ln),o=e.text?.trim().slice(0,pn),s=e.author?.trim().slice(0,un),a=e.kind==="pull"?"pull":"issue",c={providerId:e.providerId.trim(),id:t,title:r||t,url:n,kind:a};if(o)c.text=o;if(s)c.author=s;if(a==="pull"){let d=on(e.branches?.head),u=on(e.branches?.base);if(d&&u)c.branches={head:d,base:u}}if(_n(e.data))c.data=e.data;return c},br=(e)=>{let t=tt(e);if(e.projectId)t.projectId=e.projectId;if(e.navigation)t.navigation=e.navigation;if(e.worktree)t.worktree=e.worktree;return t},xr=(e)=>{let t={text:e.text.trim().slice(0,an)};if(e.send)t.send=!0;return t},vr=(e)=>{if(e===null||!Number.isFinite(e))return null;return Math.min(gn,Math.max(0,Math.round(e)))};var rt=(e)=>e.length>0&&e.length<=Gt&&!e.includes("\x00")&&!e.includes("\\");var Ht=(e)=>{if(!e.startsWith("/")||e.includes("\x00")||e.includes("\\")||e.includes("://"))return!1;if(e.length>hn)return!1;return!e.split("/").some((r)=>r==="."||r==="..")},so=new Set(bn),_r=(e)=>Boolean(e&&"status"in e&&so.has(String(e.status))&&!("body"in e)),Vt=(e)=>Boolean(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),kr=(e)=>Boolean(e&&"content"in e&&String(e.content)===e.content),Sr=(e)=>Boolean(e&&"written"in e&&e.written===!0),Tr=(e)=>Boolean(e&&"entries"in e&&Array.isArray(e.entries)),ao=new Set(sn),wr=(e)=>Boolean(e&&"kind"in e&&"size"in e&&ao.has(String(e.kind))&&Number.isFinite(e.size)),Er=(e)=>Boolean(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),io=new Set(["workspace","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action"]),co=(e)=>Object(e)===e?e:null,ur=(e)=>String(e)===e&&e.length>0,lo=(e)=>{if(!ur(e.id))return null;if(e.ok===!0){let t={channel:V,v:F,type:"result",id:e.id,ok:!0};if(Object(e.payload)===e.payload)t.payload=e.payload;return t}if(e.ok===!1&&ur(e.error))return{channel:V,v:F,type:"result",id:e.id,ok:!1,error:e.error,code:vn(ur(e.code)?e.code:void 0)};return null},Ar=(e)=>{let t=co(e);if(!t||t.channel!==V||t.v!==F)return null;if(t.type==="result")return lo(t);if(!io.has(String(t.type))||Object(t.payload)!==t.payload)return null;return t};class U extends Error{code;constructor(e,t){super(t);this.name="HostRequestError",this.code=e}}var kn=()=>Promise.reject(new U("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),Ft=()=>Promise.reject(new U("BAD_PATH",`File path must be 1 to ${Gt} characters without NUL or backslash.`)),K=(e)=>(e.value+=1,`oc-${e.value}`),Cr=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new U("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let r=e.acceptSource??((i)=>i===t.parent),n=e.requestTimeoutMs??hr,o=new Set,s=new Set,a=new Set,c=new Set,d=new Set,u=new Set,k=new Set,Y=null,B=null,X=new Map,A=new Map,W=!1,h={value:0},S=null,z=null,ie=(i)=>{if(!i)return null;return{sessionId:i.id,phase:i.busy?"started":"completed"}},le=(i)=>{t.parent.postMessage(i,"*")},q=(i,p)=>{for(let P of i)try{P(p)}catch(G){console.error(G)}},Se=(i)=>{if(!(i instanceof MessageEvent))return;if(!r(i.source))return;let p=Ar(i.data);if(!p)return;if(p.type==="workspace"){let G=A.get(p.payload.subscriptionId);if(G)q([G],p.payload.snapshot);return}if(p.type==="ready"){if(S=p.payload,z=ie(p.payload.session),q(o,p.payload),q(s,p.payload.directory),q(a,p.payload.session),z)q(c,z);q(d,p.payload.connection),q(u,p.payload.settings),q(k,p.payload.item);return}if(p.type==="directory"){if(S)S={...S,directory:p.payload.directory};q(s,p.payload.directory);return}if(p.type==="session"){if(S)S={...S,session:p.payload.session};if(!p.payload.session)z=null;else if(z?.sessionId!==p.payload.session.id)z=ie(p.payload.session);q(a,p.payload.session);return}if(p.type==="session-lifecycle"){z=p.payload,q(c,p.payload);return}if(p.type==="connection"){if(S)S={...S,connection:p.payload.connection};q(d,p.payload.connection);return}if(p.type==="settings"){if(S)S={...S,settings:p.payload.settings};q(u,p.payload.settings);return}if(p.type==="item"){if(S)S={...S,item:p.payload.item};q(k,p.payload.item);return}if(p.type==="action"){let G=(g)=>{if(!W)le({channel:V,v:F,type:"action-result",id:p.id,payload:g})},_=B;if(!_){G({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>_(p.payload)).then(()=>G({ok:!0}),(g)=>{let ye=(g instanceof Error?g.message:String(g)).trim();G({ok:!1,error:(ye||"Action failed.").slice(0,Bt)})});return}if(p.type==="resolve"){let G=(g)=>{le({channel:V,v:F,type:"resolve-result",id:p.id,payload:g})},_=Y;if(!_){G({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>_(p.payload)).then((g)=>G({item:g?tt(g):null}),(g)=>{let ye=(g instanceof Error?g.message:String(g)).trim();G({error:(ye||"Command failed.").slice(0,Bt)})});return}let P=X.get(p.id);if(!P)return;if(clearTimeout(P.timer),X.delete(p.id),p.ok){P.resolve(p.payload);return}P.reject(new U(p.code,p.error))};t.addEventListener("message",Se),le({channel:V,v:F,type:"hello"});let Z=(i,p=n)=>{if(W||t.parent===t)return Promise.reject(new U("HOST_UNAVAILABLE","No host frame. This page is not in an iframe."));return new Promise((P,G)=>{let _=setTimeout(()=>{X.delete(i.id),G(new U("HOST_TIMEOUT","Host did not answer in time."))},p);X.set(i.id,{resolve:P,reject:G,timer:_}),le(i)})},j=(i)=>Z(i).then(()=>{return}),b={channel:V,v:F},x=(i,p=1024)=>{if(!i.trim()||i.length>p)throw new U("HOST_REJECTED",`Identity must contain 1 to ${p} characters.`)},pe=async(i)=>{if(i.kind!=="projects")x(i.projectId);let p=await Z({...b,type:"workspace-read",id:K(h),payload:i});if(!p||!("kind"in p)||!("state"in p)||p.kind!==i.kind)throw new U("HOST_REJECTED","Host did not return workspace data.");return p},he=async(i,p)=>{if(i.kind!=="projects")x(i.projectId);let P=K(h);A.set(P,p);try{await j({...b,type:"workspace-subscribe",id:K(h),payload:{subscriptionId:P,query:i}})}catch(G){if(A.delete(P),!W)le({...b,type:"workspace-unsubscribe",id:K(h),payload:{subscriptionId:P}});throw G}return()=>{if(!A.delete(P)||W)return;le({...b,type:"workspace-unsubscribe",id:K(h),payload:{subscriptionId:P}})}},ge=async(i)=>{if("key"in i&&(i.key.length===0||i.key.length>lr))throw new U("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(i.op==="set"&&!et(i.value))throw new U("HOST_REJECTED","Storage values must be JSON.");if(i.op==="set"&&new TextEncoder().encode(JSON.stringify(i.value)).length>pr)throw new U("HOST_REJECTED","Storage value exceeds 64 KiB.");let p=await Z({...b,type:"storage",id:K(h),payload:i});if(!p||!("storage"in p)||p.op!==i.op)throw new U("HOST_REJECTED","Host did not return storage data.");return p};return{onAction:(i)=>(B=i,()=>{if(B===i)B=null}),listProjects:async()=>{let i=await pe({kind:"projects"});if(i.kind!=="projects")throw new U("HOST_REJECTED","Expected projects.");return i},listWorktrees:async(i)=>{let p=await pe({kind:"worktrees",projectId:i});if(p.kind!=="worktrees")throw new U("HOST_REJECTED","Expected worktrees.");return p},listSessions:async(i)=>{let p=await pe({kind:"sessions",projectId:i});if(p.kind!=="sessions")throw new U("HOST_REJECTED","Expected sessions.");return p},onProjects:(i)=>he({kind:"projects"},(p)=>{if(p.kind==="projects")i(p)}),onWorktrees:(i,p)=>he({kind:"worktrees",projectId:i},(P)=>{if(P.kind==="worktrees")p(P)}),onSessions:(i,p)=>he({kind:"sessions",projectId:i},(P)=>{if(P.kind==="sessions")p(P)}),openSession:async(i)=>{x(i),await j({...b,type:"open-session",id:K(h),payload:{sessionId:i}})},storage:{get:async(i)=>{let p=await ge({op:"get",key:i});return p.op==="get"&&p.found?p.value:void 0},set:async(i,p)=>{await ge({op:"set",key:i,value:p})},delete:async(i)=>{await ge({op:"delete",key:i})},keys:async()=>{let i=await ge({op:"keys"});if(i.op!=="keys")throw new U("HOST_REJECTED","Expected storage keys.");return i.keys}},onReady:(i)=>{if(o.add(i),S)i(S);return()=>{o.delete(i)}},onDirectory:(i)=>{if(s.add(i),S)i(S.directory);return()=>{s.delete(i)}},onSession:(i)=>{if(a.add(i),S)i(S.session);return()=>{a.delete(i)}},onSessionLifecycle:(i)=>{if(c.add(i),z)i(z);return()=>{c.delete(i)}},onConnection:(i)=>{if(d.add(i),S)i(S.connection);return()=>{d.delete(i)}},onSettings:(i)=>{if(u.add(i),S)i(S.settings);return()=>{u.delete(i)}},onItem:(i)=>{if(k.add(i),S)i(S.item);return()=>{k.delete(i)}},onResolve:(i)=>(Y=i,()=>{if(Y===i)Y=null}),toast:(i)=>{let p=i.message.trim();if(!p||p.length>Lt)return Promise.reject(new U("HOST_REJECTED",`Toast message must contain 1 to ${Lt} characters.`));if(i.copy&&i.copy!==!0&&(!i.copy.text.length||i.copy.text.length>Ut))return Promise.reject(new U("HOST_REJECTED",`Toast copy text must contain 1 to ${Ut} characters.`));return j({channel:V,v:F,type:"toast",id:K(h),payload:{...i,message:p}})},openUrl:(i)=>j({channel:V,v:F,type:"open-url",id:K(h),payload:{url:i}}),openSurface:(i)=>j({channel:V,v:F,type:"open-surface",id:K(h),payload:{surfaceId:i}}),writeClipboard:(i)=>j({channel:V,v:F,type:"clipboard-write",id:K(h),payload:{text:i}}),compose:(i)=>j({channel:V,v:F,type:"compose",id:K(h),payload:i}),attach:(i)=>j({channel:V,v:F,type:"attach",id:K(h),payload:tt(i)}),startSession:async(i)=>{if(i.projectId!==void 0)x(i.projectId);let p=i.worktree;if(p&&p!==!0)if(p.kind==="existing")x(p.directory);else{if(p.name!==void 0)x(p.name,200);if(p.baseBranch!==void 0)x(p.baseBranch,200)}let P=await Z({channel:V,v:F,type:"start-session",id:K(h),payload:br(i)},e.requestTimeoutMs??180000);if(!fr(P))throw new U("HOST_REJECTED","Host did not return a session.");return P},prompt:(i)=>Z({channel:V,v:F,type:"prompt",id:K(h),payload:xr(i)}).then((p)=>{if(!mr(p))throw new U("HOST_REJECTED","Host did not return a prompt result.");return p}),sessionLink:(i)=>j({channel:V,v:F,type:"session-link",id:K(h),payload:tt(i)}),close:()=>j({channel:V,v:F,type:"close",id:K(h)}),oauthStart:()=>j({channel:V,v:F,type:"oauth-start",id:K(h)}),oauthDisconnect:()=>j({channel:V,v:F,type:"oauth-disconnect",id:K(h)}),request:(i)=>(Ht(i.path)?Z({channel:V,v:F,type:"request",id:K(h),payload:i}):kn()).then((p)=>{if(!Vt(p))throw new U("HOST_REJECTED","Host request result was empty.");return p}),serviceRequest:(i)=>(Ht(i.path)?Z({channel:V,v:F,type:"service-request",id:K(h),payload:i}):kn()).then((p)=>{if(!Vt(p))throw new U("HOST_REJECTED","Host service request result was empty.");return p}),serviceStatus:()=>Z({channel:V,v:F,type:"service-status",id:K(h)}).then((i)=>{if(!_r(i))throw new U("HOST_REJECTED","Host did not return service status.");return i}),readFile:(i)=>(rt(i)?Z({channel:V,v:F,type:"file-read",id:K(h),payload:{path:i}}):Ft()).then((p)=>{if(!kr(p))throw new U("HOST_REJECTED","Host did not return file content.");return p}),writeFile:(i,p)=>{if(!rt(i))return Ft();if(p.length>Dt)return Promise.reject(new U("FILE_TOO_LARGE",`Content is over ${Dt} characters.`));return Z({channel:V,v:F,type:"file-write",id:K(h),payload:{path:i,content:p}}).then((P)=>{if(!Sr(P))throw new U("HOST_REJECTED","Host did not confirm the write.");return P})},listDir:(i)=>(rt(i)?Z({channel:V,v:F,type:"file-list",id:K(h),payload:{path:i}}):Ft()).then((p)=>{if(!Tr(p))throw new U("HOST_REJECTED","Host did not return directory entries.");return p}),stat:(i)=>(rt(i)?Z({channel:V,v:F,type:"file-stat",id:K(h),payload:{path:i}}):Ft()).then((p)=>{if(!wr(p))throw new U("HOST_REJECTED","Host did not return file status.");return p}),generate:(i)=>{let p=i.prompt.trim(),P=i.system?.trim();if(p.length===0||p.length>jt)return Promise.reject(new U("HOST_REJECTED",`Prompt must be 1 to ${jt} characters.`));if(P!==void 0&&(P.length===0||P.length>zt))return Promise.reject(new U("HOST_REJECTED",`System prompt must be 1 to ${zt} characters.`));let G=i.maxOutputTokens===void 0?void 0:Math.min(gr,Math.max(1,Math.floor(i.maxOutputTokens)));if(G!==void 0&&!Number.isFinite(G))return Promise.reject(new U("HOST_REJECTED","maxOutputTokens must be a number."));let _={prompt:p};if(P!==void 0)_.system=P;if(G!==void 0)_.maxOutputTokens=G;return Z({channel:V,v:F,type:"generate",id:K(h),payload:_},e.requestTimeoutMs??yr).then((g)=>{if(!Er(g))throw new U("HOST_REJECTED","Host did not return generated text.");return g})},setBadge:(i)=>j({channel:V,v:F,type:"badge",id:K(h),payload:{count:vr(i)}}),dispose:()=>{for(let i of A.keys())le({...b,type:"workspace-unsubscribe",id:K(h),payload:{subscriptionId:i}});A.clear(),W=!0,Y=null,B=null,t.removeEventListener("message",Se);for(let i of X.values())clearTimeout(i.timer),i.reject(new U("HOST_UNAVAILABLE","Host client was disposed."));X.clear(),o.clear(),s.clear(),a.clear(),c.clear(),d.clear(),u.clear(),k.clear()}}};var po=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Sn=(e,t)=>{t.style.colorScheme=e.mode;for(let[r,n]of po)t.style.setProperty(r,e.tokens[n]);t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size","0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},Rr=(e,t)=>{if(Sn(e.theme,t),t.dataset)t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode};var nt=(e)=>{while(e.firstChild)e.removeChild(e.firstChild)},ne=(e)=>{let t=document.getElementById("oc-sdk-ui-style");if(t instanceof HTMLStyleElement){if(t.textContent!==e)t.textContent=e;return}let r=document.createElement("style");r.id="oc-sdk-ui-style",r.textContent=e,document.head.appendChild(r)},I=(e,t)=>{let r=document.createElement(e);if(t)r.className=t;return r},Ne=(e)=>{let t=I("button",e);return t.type="button",t},ce=(e,t)=>{let r=t??"";if(e.textContent!==r)e.textContent=r},ot=(e,t,r)=>{if(r===void 0||r===null||r==="")e.removeAttribute(t);else if(e.getAttribute(t)!==r)e.setAttribute(t,r)};var uo={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},ee=(e,t)=>`var(--${e}, var(--oc-${uo[e]}, ${t}))`,Je=ee("surface-background","transparent"),Xt=ee("surface-elevated","transparent"),yt=ee("surface-elevated-foreground","inherit"),bt=ee("surface-foreground","inherit"),oe=ee("surface-muted-foreground","gray"),fo=ee("surface-muted","transparent"),Re=ee("interactive-border","currentColor"),Te=ee("interactive-hover","transparent"),Ye=ee("interactive-active","transparent"),Pr=ee("interactive-selection","transparent"),Or=ee("interactive-selection-foreground","inherit"),En=ee("interactive-focus-ring","currentColor"),Pe=ee("primary","currentColor"),Ir=ee("primary-text","inherit"),Mr=ee("error-text","inherit"),mo=ee("font-sans","inherit"),Nr=ee("font-mono","monospace"),Tn=ee("radius","9px"),de=(e,t,r="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${r})`,wn=`box-shadow: 0 0 0 2px ${En};`,Kt=(e)=>{let t=ee(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${ee(`${e}-text`,"inherit")}; }`},se=`
${dr}
.oc-sdk { box-sizing: border-box; color: ${bt}; font-family: ${mo}; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }
.oc-sdk :focus-visible { outline: none; ${wn} }
.oc-sdk-mono { font-family: ${Nr}; }
.oc-sdk-muted { color: ${oe}; }
${Kt("success")}${Kt("warning")}${Kt("error")}${Kt("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${Pe}; --oc-sdk-tone-text: ${Ir}; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 36px; padding: 0 14px; border: 1px solid transparent; border-radius: ${Tn}; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="sm"] { height: 32px; padding: 0 10px; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { height: 24px; padding: 0 8px; font-size: 0.75rem; border-radius: 6px; }
.oc-sdk-btn[data-variant="default"] { color: ${Ir}; background: ${de(Pe,10,Je)}; border-color: ${de(Pe,12)}; }
.oc-sdk-btn[data-variant="default"]:hover { background: ${de(Pe,16,Je)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${de(Pe,22,Je)}; }
.oc-sdk-btn[data-variant="secondary"] { background: ${fo}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${Te}, ${Te}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${Ye}, ${Ye}); }
.oc-sdk-btn[data-variant="outline"] { background: ${Xt}; color: ${yt}; border-color: ${Re}; }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${Te}, ${Te}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${Ye}, ${Ye}); }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${Te}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${Ye}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${ee("status-error","red")}; color: ${Mr}; background: ${de("var(--oc-sdk-tone)",7,Je)}; border-color: ${de("var(--oc-sdk-tone)",12)}; }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${de("var(--oc-sdk-tone)",9,Je)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${de("var(--oc-sdk-tone)",11,Je)}; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: 14px; height: 14px; }

.oc-sdk-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; color: ${oe}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Mr}; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: 36px; padding: 0 12px; border: 0; border-radius: ${Tn}; background: ${Xt}; color: ${yt}; font-size: 0.875rem; line-height: 1.45; appearance: none; box-shadow: inset 0 0 0 1px ${de(Re,60)}; transition: background 150ms ease-out, box-shadow 150ms ease-out; }
textarea.oc-sdk-input { height: auto; padding: 8px 12px; resize: vertical; }
.oc-sdk-input::placeholder { color: ${oe}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${Te}, ${Te}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { box-shadow: inset 0 0 0 2px ${En}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input { box-shadow: inset 0 0 0 1px ${ee("status-error","red")}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { box-shadow: inset 0 0 0 2px ${ee("status-error","red")}; }
.oc-sdk-input[data-mono="true"] { font-family: ${Nr}; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: 34px; padding-right: 34px; }
.oc-sdk-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: ${oe}; pointer-events: none; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${Pe}; }
.oc-sdk-search-clear { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; color: ${oe}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }
.oc-sdk-search-clear:hover { background: ${Te}; color: ${bt}; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: 6px; width: 100%; min-width: 0; height: 32px; padding: 0 8px 0 10px; border: 1px solid ${Re}; border-radius: 6px; background: ${Xt}; color: ${yt}; font-size: 0.8125rem; text-align: left; transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${Te}, ${Te}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${Ye}, ${Ye}); }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-value[data-empty="true"] { color: ${oe}; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; color: ${oe}; }
.oc-sdk-popup { --surface-foreground: ${yt}; position: fixed; z-index: 50; display: flex; flex-direction: column; gap: 2px; min-width: 160px; max-width: calc(100vw - 16px); max-height: min(320px, calc(100vh - 16px)); overflow: auto; padding: 4px; border: 1px solid ${de(Re,60)}; border-radius: 12px; background: ${Xt}; color: ${yt}; box-shadow: 0 8px 24px ${de(bt,12)}; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: 2px 2px 4px; }
.oc-sdk-popup-search .oc-sdk-input { height: 32px; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; border-radius: 8px; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option[data-active="true"] { background: ${Te}; }
.oc-sdk-option[aria-selected="true"] { background: ${Pr}; color: ${Or}; }
.oc-sdk-option[data-destructive="true"] { color: ${Mr}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${de(ee("status-error","red"),10)}; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; color: ${oe}; }
.oc-sdk-option-check { flex: 0 0 auto; width: 12px; }
.oc-sdk-popup-empty { padding: 8px; font-size: 0.8125rem; color: ${oe}; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: 8px; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; margin-top: 3px; border: 1px solid ${Re}; border-radius: 4px; color: ${Pe}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${de(Pe,65,Re)}; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: 36px; height: 20px; border-radius: 9999px; background: ${Re}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 9999px; background: ${Je}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${Pe}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${wn} }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; color: ${oe}; }

.oc-sdk-tabs { display: inline-flex; gap: 2px; padding: 2px; border-radius: 10px; max-width: 100%; overflow: auto; }
.oc-sdk-tabs[data-track="true"] { background: ${de(bt,4)}; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border: 1px solid transparent; border-radius: 8px; font-size: 0.8125rem; font-weight: 500; color: ${oe}; white-space: nowrap; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${bt}; }
.oc-sdk-tab[aria-selected="true"] { color: ${Or}; background: ${Pr}; border-color: ${Re}; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; color: ${oe}; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: 1px 6px; border-radius: 9999px; font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; background: ${Te}; color: ${oe}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${de("var(--oc-sdk-tone)",15)}; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; border-radius: 6px; text-align: left; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${Te}; }
.oc-sdk-row[aria-selected="true"] { background: ${Pr}; color: ${Or}; }
.oc-sdk-row-lead { flex: 0 0 auto; width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: ${Nr}; font-size: 0.75rem; color: ${oe}; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; color: ${oe}; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; color: ${oe}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { padding: 16px 8px; text-align: center; font-size: 0.8125rem; color: ${oe}; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 40px 16px; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; color: ${oe}; }
.oc-sdk-empty-action { margin-top: 12px; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: ${oe}; }
.oc-sdk-spinner-ring { width: 16px; height: 16px; border: 2px solid ${Re}; border-top-color: ${Pe}; border-radius: 9999px; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: 12px; height: 12px; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: 12px; padding: 8px 12px; border: 1px solid ${de("var(--oc-sdk-tone)",40)}; border-radius: 8px; background: ${de("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { font-size: 0.8125rem; color: ${oe}; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: 8px; width: 100%; margin: 8px 0; font-size: 0.75rem; color: ${oe}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; background: ${de(Re,40)}; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: 4px 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; color: ${oe}; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: 6px; border-radius: 9999px; background: ${Re}; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; border-radius: 9999px; background: var(--oc-sdk-tone, ${Pe}); transform-origin: left; transition: transform 200ms ease-out; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text a { color: ${Ir}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { display: block; max-width: 100%; margin: 8px 0; border-radius: 8px; border: 1px solid ${de(Re,60)}; }
`;var ho=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},Ve=(e,t)=>{ne(se);let r=t,n=Ne("oc-sdk oc-sdk-btn"),o=ho(),s=document.createElement("span");n.append(s),e.append(n);let a=()=>{if(n.dataset.variant=r.variant??"default",n.dataset.size=r.size??"default",n.disabled=Boolean(r.disabled)||Boolean(r.loading),n.dataset.loading=r.loading?"true":"false",n.setAttribute("aria-busy",r.loading?"true":"false"),r.loading&&o.parentNode!==n)n.prepend(o);else if(!r.loading&&o.parentNode===n)o.remove();ce(s,r.label)},c=()=>{if(r.disabled||r.loading)return;r.onClick()};return n.addEventListener("click",c),a(),{update:(d)=>{r={...r,...d},a()},dispose:()=>{n.removeEventListener("click",c),n.remove()}}};var ve=(e,t)=>{ne(se);let r=t,n=I("label","oc-sdk oc-sdk-field"),o=I("span","oc-sdk-field-label"),s=r.multiline?I("textarea","oc-sdk-input"):I("input","oc-sdk-input"),a=I("span","oc-sdk-field-note");n.append(o,s,a),e.append(n);let c=()=>{if(ce(o,r.label),o.hidden=!r.label,s instanceof HTMLInputElement)s.type=r.password?"password":"text";else s.rows=r.rows??3;if(s.value!==r.value)s.value=r.value;s.disabled=Boolean(r.disabled),ot(s,"placeholder",r.placeholder),s.dataset.mono=r.mono?"true":"false";let u=Boolean(r.error);n.dataset.invalid=u?"true":"false",s.setAttribute("aria-invalid",u?"true":"false");let k=r.error??r.helper??"";ce(a,k),a.hidden=k===""},d=()=>{r.onChange(s.value)};return s.addEventListener("input",d),c(),{update:(u)=>{r={...r,...u},c()},dispose:()=>{s.removeEventListener("input",d),n.remove()}}};var go={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},Jt=(e,t,r)=>{let n=document.createElementNS("http://www.w3.org/2000/svg","svg");if(n.setAttribute("viewBox","0 0 24 24"),n.setAttribute("width",String(t)),n.setAttribute("height",String(t)),n.setAttribute("aria-hidden","true"),n.setAttribute("fill","currentColor"),r)n.setAttribute("class",r);let o=document.createElementNS("http://www.w3.org/2000/svg","path");return o.setAttribute("d",go[e]),n.append(o),n};var st=(e,t="vertical")=>{let[r,n]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];if(e.key===r||e.ctrlKey&&e.key.toLowerCase()==="n")return"next";if(e.key===n||e.ctrlKey&&e.key.toLowerCase()==="p")return"previous";if(e.key==="Home")return"first";if(e.key==="End")return"last";return null},at=(e,t,r)=>{let n=e.filter((d)=>!d.disabled);if(n.length===0)return null;let o=n[0],s=n[n.length-1];if(r==="first"||!o||!s)return o?.id??null;if(r==="last")return s.id;let a=n.findIndex((d)=>d.id===t);if(a===-1)return r==="next"?o.id:s.id;return n[Math.min(n.length-1,Math.max(0,a+(r==="next"?1:-1)))]?.id??null};var An=(e,t,r)=>{ne(se);let n=t,o=Ne("oc-sdk oc-sdk-check");o.setAttribute("role",r);let s=I("span",r==="switch"?"oc-sdk-check-thumb":"oc-sdk-check-box");if(r==="checkbox")s.append(Jt("check",12));let a=I("span","oc-sdk-check-text"),c=I("span","oc-sdk-check-label"),d=I("span","oc-sdk-check-desc");a.append(c,d),o.append(s,a),e.append(o);let u=()=>{o.setAttribute("aria-checked",n.checked?"true":"false"),o.disabled=Boolean(n.disabled),ce(c,n.label),ce(d,n.description),d.hidden=!n.description},k=()=>{if(!n.disabled)n.onChange(!n.checked)};return o.addEventListener("click",k),u(),{update:(Y)=>{n={...n,...Y},u()},dispose:()=>{o.removeEventListener("click",k),o.remove()}}},$r=(e,t)=>An(e,t,"checkbox"),Lr=(e,t)=>An(e,t,"switch");var Ur=(e,t)=>{ne(se);let r=t,n=I("div","oc-sdk oc-sdk-tabs");n.setAttribute("role","tablist"),e.append(n);let o=()=>{nt(n),n.dataset.track=r.trackBackground?"true":"false";for(let a of r.items){let c=Ne("oc-sdk-tab");c.setAttribute("role","tab");let d=a.id===r.activeId;c.setAttribute("aria-selected",d?"true":"false"),c.tabIndex=d?0:-1,c.dataset.id=a.id;let u=I("span");if(u.textContent=a.label,c.append(u),a.count!==void 0){let k=I("span","oc-sdk-tab-count");k.textContent=String(a.count),c.append(k)}c.addEventListener("click",()=>{if(a.id!==r.activeId)r.onChange(a.id)}),n.append(c)}},s=(a)=>{let c=st(a,"horizontal");if(!c)return;let d=at(r.items,r.activeId,c);if(d&&d!==r.activeId){a.preventDefault(),r.onChange(d);let u=n.querySelector(`[data-id="${CSS.escape(d)}"]`);if(u instanceof HTMLElement)u.focus()}};return n.addEventListener("keydown",s),o(),{update:(a)=>{r={...r,...a},o()},dispose:()=>{n.removeEventListener("keydown",s),n.remove()}}};var xt=(e,t)=>{ne(se);let r=t,n=I("div","oc-sdk oc-sdk-empty"),o=I("h2","oc-sdk-empty-title"),s=I("p","oc-sdk-empty-body"),a=I("div","oc-sdk-empty-action");n.append(o,s,a),e.append(n);let c=null,d=()=>{if(ce(o,r.title),ce(s,r.body),s.hidden=!r.body,a.hidden=!r.action,!r.action){c?.dispose(),c=null;return}let u={label:r.action.label,onClick:r.action.onClick};if(c)c.update(u);else c=Ve(a,{...u,variant:"outline",size:"sm"})};return d(),{update:(u)=>{r={...r,...u},d()},dispose:()=>{c?.dispose(),c=null,n.remove()}}};var Gr=(e,t={})=>{ne(se);let r=t,n=I("span","oc-sdk oc-sdk-spinner");n.setAttribute("role","status");let o=I("span","oc-sdk-spinner-ring");o.setAttribute("aria-hidden","true");let s=I("span");n.append(o,s),e.append(n);let a=()=>{n.dataset.size=r.size??"default",ce(s,r.label),s.hidden=!r.label,n.setAttribute("aria-label",r.label??"Loading")};return a(),{update:(c)=>{r={...r,...c},a()},dispose:()=>{n.remove()}}};var we=(e,t)=>{ne(se);let r=t,n=I("div","oc-sdk oc-sdk-banner"),o=I("div","oc-sdk-banner-text"),s=I("div","oc-sdk-banner-title"),a=I("div","oc-sdk-banner-body"),c=I("div","oc-sdk-banner-action");o.append(s,a),n.append(o,c),e.append(n);let d=null,u=()=>{if(n.dataset.tone=r.tone,n.setAttribute("role",r.tone==="error"||r.tone==="warning"?"alert":"status"),ce(s,r.title),ce(a,r.body),a.hidden=!r.body,c.hidden=!r.action,!r.action){d?.dispose(),d=null;return}let k={label:r.action.label,onClick:r.action.onClick};if(d)d.update(k);else d=Ve(c,{...k,variant:"outline",size:"xs"})};return u(),{update:(k)=>{r={...r,...k},u()},dispose:()=>{d?.dispose(),d=null,n.remove()}}};var D;(function(e){e.assertEqual=(o)=>{};function t(o){}e.assertIs=t;function r(o){throw Error()}e.assertNever=r,e.arrayToEnum=(o)=>{let s={};for(let a of o)s[a]=a;return s},e.getValidEnumValues=(o)=>{let s=e.objectKeys(o).filter((c)=>typeof o[o[c]]!=="number"),a={};for(let c of s)a[c]=o[c];return e.objectValues(a)},e.objectValues=(o)=>e.objectKeys(o).map(function(s){return o[s]}),e.objectKeys=typeof Object.keys==="function"?(o)=>Object.keys(o):(o)=>{let s=[];for(let a in o)if(Object.prototype.hasOwnProperty.call(o,a))s.push(a);return s},e.find=(o,s)=>{for(let a of o)if(s(a))return a;return},e.isInteger=typeof Number.isInteger==="function"?(o)=>Number.isInteger(o):(o)=>typeof o==="number"&&Number.isFinite(o)&&Math.floor(o)===o;function n(o,s=" | "){return o.map((a)=>typeof a==="string"?`'${a}'`:a).join(s)}e.joinValues=n,e.jsonStringifyReplacer=(o,s)=>{if(typeof s==="bigint")return s.toString();return s}})(D||(D={}));var Cn;(function(e){e.mergeShapes=(t,r)=>({...t,...r})})(Cn||(Cn={}));var y=D.arrayToEnum(["string","nan","number","integer","float","boolean","date","bigint","symbol","function","undefined","null","array","object","unknown","promise","void","never","map","set"]),Ge=(e)=>{switch(typeof e){case"undefined":return y.undefined;case"string":return y.string;case"number":return Number.isNaN(e)?y.nan:y.number;case"boolean":return y.boolean;case"function":return y.function;case"bigint":return y.bigint;case"symbol":return y.symbol;case"object":if(Array.isArray(e))return y.array;if(e===null)return y.null;if(e.then&&typeof e.then==="function"&&e.catch&&typeof e.catch==="function")return y.promise;if(typeof Map<"u"&&e instanceof Map)return y.map;if(typeof Set<"u"&&e instanceof Set)return y.set;if(typeof Date<"u"&&e instanceof Date)return y.date;return y.object;default:return y.unknown}};var f=D.arrayToEnum(["invalid_type","invalid_literal","custom","invalid_union","invalid_union_discriminator","invalid_enum_value","unrecognized_keys","invalid_arguments","invalid_return_type","invalid_date","invalid_string","too_small","too_big","invalid_intersection_types","not_multiple_of","not_finite"]);class Ee extends Error{get errors(){return this.issues}constructor(e){super();this.issues=[],this.addIssue=(r)=>{this.issues=[...this.issues,r]},this.addIssues=(r=[])=>{this.issues=[...this.issues,...r]};let t=new.target.prototype;if(Object.setPrototypeOf)Object.setPrototypeOf(this,t);else this.__proto__=t;this.name="ZodError",this.issues=e}format(e){let t=e||function(o){return o.message},r={_errors:[]},n=(o)=>{for(let s of o.issues)if(s.code==="invalid_union")s.unionErrors.map(n);else if(s.code==="invalid_return_type")n(s.returnTypeError);else if(s.code==="invalid_arguments")n(s.argumentsError);else if(s.path.length===0)r._errors.push(t(s));else{let a=r,c=0;while(c<s.path.length){let d=s.path[c];if(c!==s.path.length-1)a[d]=a[d]||{_errors:[]};else a[d]=a[d]||{_errors:[]},a[d]._errors.push(t(s));a=a[d],c++}}};return n(this),r}static assert(e){if(!(e instanceof Ee))throw Error(`Not a ZodError: ${e}`)}toString(){return this.message}get message(){return JSON.stringify(this.issues,D.jsonStringifyReplacer,2)}get isEmpty(){return this.issues.length===0}flatten(e=(t)=>t.message){let t={},r=[];for(let n of this.issues)if(n.path.length>0){let o=n.path[0];t[o]=t[o]||[],t[o].push(e(n))}else r.push(e(n));return{formErrors:r,fieldErrors:t}}get formErrors(){return this.flatten()}}Ee.create=(e)=>new Ee(e);var _o=(e,t)=>{let r;switch(e.code){case f.invalid_type:if(e.received===y.undefined)r="Required";else r=`Expected ${e.expected}, received ${e.received}`;break;case f.invalid_literal:r=`Invalid literal value, expected ${JSON.stringify(e.expected,D.jsonStringifyReplacer)}`;break;case f.unrecognized_keys:r=`Unrecognized key(s) in object: ${D.joinValues(e.keys,", ")}`;break;case f.invalid_union:r="Invalid input";break;case f.invalid_union_discriminator:r=`Invalid discriminator value. Expected ${D.joinValues(e.options)}`;break;case f.invalid_enum_value:r=`Invalid enum value. Expected ${D.joinValues(e.options)}, received '${e.received}'`;break;case f.invalid_arguments:r="Invalid function arguments";break;case f.invalid_return_type:r="Invalid function return type";break;case f.invalid_date:r="Invalid date";break;case f.invalid_string:if(typeof e.validation==="object")if("includes"in e.validation){if(r=`Invalid input: must include "${e.validation.includes}"`,typeof e.validation.position==="number")r=`${r} at one or more positions greater than or equal to ${e.validation.position}`}else if("startsWith"in e.validation)r=`Invalid input: must start with "${e.validation.startsWith}"`;else if("endsWith"in e.validation)r=`Invalid input: must end with "${e.validation.endsWith}"`;else D.assertNever(e.validation);else if(e.validation!=="regex")r=`Invalid ${e.validation}`;else r="Invalid";break;case f.too_small:if(e.type==="array")r=`Array must contain ${e.exact?"exactly":e.inclusive?"at least":"more than"} ${e.minimum} element(s)`;else if(e.type==="string")r=`String must contain ${e.exact?"exactly":e.inclusive?"at least":"over"} ${e.minimum} character(s)`;else if(e.type==="number")r=`Number must be ${e.exact?"exactly equal to ":e.inclusive?"greater than or equal to ":"greater than "}${e.minimum}`;else if(e.type==="bigint")r=`Number must be ${e.exact?"exactly equal to ":e.inclusive?"greater than or equal to ":"greater than "}${e.minimum}`;else if(e.type==="date")r=`Date must be ${e.exact?"exactly equal to ":e.inclusive?"greater than or equal to ":"greater than "}${new Date(Number(e.minimum))}`;else r="Invalid input";break;case f.too_big:if(e.type==="array")r=`Array must contain ${e.exact?"exactly":e.inclusive?"at most":"less than"} ${e.maximum} element(s)`;else if(e.type==="string")r=`String must contain ${e.exact?"exactly":e.inclusive?"at most":"under"} ${e.maximum} character(s)`;else if(e.type==="number")r=`Number must be ${e.exact?"exactly":e.inclusive?"less than or equal to":"less than"} ${e.maximum}`;else if(e.type==="bigint")r=`BigInt must be ${e.exact?"exactly":e.inclusive?"less than or equal to":"less than"} ${e.maximum}`;else if(e.type==="date")r=`Date must be ${e.exact?"exactly":e.inclusive?"smaller than or equal to":"smaller than"} ${new Date(Number(e.maximum))}`;else r="Invalid input";break;case f.custom:r="Invalid input";break;case f.invalid_intersection_types:r="Intersection results could not be merged";break;case f.not_multiple_of:r=`Number must be a multiple of ${e.multipleOf}`;break;case f.not_finite:r="Number must be finite";break;default:r=t.defaultError,D.assertNever(e)}return{message:r}},Fe=_o;var ko=Fe;function vt(){return ko}var Yt=(e)=>{let{data:t,path:r,errorMaps:n,issueData:o}=e,s=[...r,...o.path||[]],a={...o,path:s};if(o.message!==void 0)return{...o,path:s,message:o.message};let c="",d=n.filter((u)=>!!u).slice().reverse();for(let u of d)c=u(a,{data:t,defaultError:c}).message;return{...o,path:s,message:c}};function m(e,t){let r=vt(),n=Yt({issueData:t,data:e.data,path:e.path,errorMaps:[e.common.contextualErrorMap,e.schemaErrorMap,r,r===Fe?void 0:Fe].filter((o)=>!!o)});e.common.issues.push(n)}class me{constructor(){this.value="valid"}dirty(){if(this.value==="valid")this.value="dirty"}abort(){if(this.value!=="aborted")this.value="aborted"}static mergeArray(e,t){let r=[];for(let n of t){if(n.status==="aborted")return E;if(n.status==="dirty")e.dirty();r.push(n.value)}return{status:e.value,value:r}}static async mergeObjectAsync(e,t){let r=[];for(let n of t){let o=await n.key,s=await n.value;r.push({key:o,value:s})}return me.mergeObjectSync(e,r)}static mergeObjectSync(e,t){let r={};for(let n of t){let{key:o,value:s}=n;if(o.status==="aborted")return E;if(s.status==="aborted")return E;if(o.status==="dirty")e.dirty();if(s.status==="dirty")e.dirty();if(o.value!=="__proto__"&&(typeof s.value<"u"||n.alwaysSet))r[o.value]=s.value}return{status:e.value,value:r}}}var E=Object.freeze({status:"aborted"}),it=(e)=>({status:"dirty",value:e}),be=(e)=>({status:"valid",value:e}),Dr=(e)=>e.status==="aborted",jr=(e)=>e.status==="dirty",We=(e)=>e.status==="valid",_t=(e)=>typeof Promise<"u"&&e instanceof Promise;var v;(function(e){e.errToObj=(t)=>typeof t==="string"?{message:t}:t||{},e.toString=(t)=>typeof t==="string"?t:t?.message})(v||(v={}));class Oe{constructor(e,t,r,n){this._cachedPath=[],this.parent=e,this.data=t,this._path=r,this._key=n}get path(){if(!this._cachedPath.length)if(Array.isArray(this._key))this._cachedPath.push(...this._path,...this._key);else this._cachedPath.push(...this._path,this._key);return this._cachedPath}}var Rn=(e,t)=>{if(We(t))return{success:!0,data:t.value};else{if(!e.common.issues.length)throw Error("Validation failed but no issues detected.");return{success:!1,get error(){if(this._error)return this._error;let r=new Ee(e.common.issues);return this._error=r,this._error}}}};function O(e){if(!e)return{};let{errorMap:t,invalid_type_error:r,required_error:n,description:o}=e;if(t&&(r||n))throw Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);if(t)return{errorMap:t,description:o};return{errorMap:(a,c)=>{let{message:d}=e;if(a.code==="invalid_enum_value")return{message:d??c.defaultError};if(typeof c.data>"u")return{message:d??n??c.defaultError};if(a.code!=="invalid_type")return{message:c.defaultError};return{message:d??r??c.defaultError}},description:o}}class M{get description(){return this._def.description}_getType(e){return Ge(e.data)}_getOrReturnCtx(e,t){return t||{common:e.parent.common,data:e.data,parsedType:Ge(e.data),schemaErrorMap:this._def.errorMap,path:e.path,parent:e.parent}}_processInputParams(e){return{status:new me,ctx:{common:e.parent.common,data:e.data,parsedType:Ge(e.data),schemaErrorMap:this._def.errorMap,path:e.path,parent:e.parent}}}_parseSync(e){let t=this._parse(e);if(_t(t))throw Error("Synchronous parse encountered promise.");return t}_parseAsync(e){let t=this._parse(e);return Promise.resolve(t)}parse(e,t){let r=this.safeParse(e,t);if(r.success)return r.data;throw r.error}safeParse(e,t){let r={common:{issues:[],async:t?.async??!1,contextualErrorMap:t?.errorMap},path:t?.path||[],schemaErrorMap:this._def.errorMap,parent:null,data:e,parsedType:Ge(e)},n=this._parseSync({data:e,path:r.path,parent:r});return Rn(r,n)}"~validate"(e){let t={common:{issues:[],async:!!this["~standard"].async},path:[],schemaErrorMap:this._def.errorMap,parent:null,data:e,parsedType:Ge(e)};if(!this["~standard"].async)try{let r=this._parseSync({data:e,path:[],parent:t});return We(r)?{value:r.value}:{issues:t.common.issues}}catch(r){if(r?.message?.toLowerCase()?.includes("encountered"))this["~standard"].async=!0;t.common={issues:[],async:!0}}return this._parseAsync({data:e,path:[],parent:t}).then((r)=>We(r)?{value:r.value}:{issues:t.common.issues})}async parseAsync(e,t){let r=await this.safeParseAsync(e,t);if(r.success)return r.data;throw r.error}async safeParseAsync(e,t){let r={common:{issues:[],contextualErrorMap:t?.errorMap,async:!0},path:t?.path||[],schemaErrorMap:this._def.errorMap,parent:null,data:e,parsedType:Ge(e)},n=this._parse({data:e,path:r.path,parent:r}),o=await(_t(n)?n:Promise.resolve(n));return Rn(r,o)}refine(e,t){let r=(n)=>{if(typeof t==="string"||typeof t>"u")return{message:t};else if(typeof t==="function")return t(n);else return t};return this._refinement((n,o)=>{let s=e(n),a=()=>o.addIssue({code:f.custom,...r(n)});if(typeof Promise<"u"&&s instanceof Promise)return s.then((c)=>{if(!c)return a(),!1;else return!0});if(!s)return a(),!1;else return!0})}refinement(e,t){return this._refinement((r,n)=>{if(!e(r))return n.addIssue(typeof t==="function"?t(r,n):t),!1;else return!0})}_refinement(e){return new Ue({schema:this,typeName:C.ZodEffects,effect:{type:"refinement",refinement:e}})}superRefine(e){return this._refinement(e)}constructor(e){this.spa=this.safeParseAsync,this._def=e,this.parse=this.parse.bind(this),this.safeParse=this.safeParse.bind(this),this.parseAsync=this.parseAsync.bind(this),this.safeParseAsync=this.safeParseAsync.bind(this),this.spa=this.spa.bind(this),this.refine=this.refine.bind(this),this.refinement=this.refinement.bind(this),this.superRefine=this.superRefine.bind(this),this.optional=this.optional.bind(this),this.nullable=this.nullable.bind(this),this.nullish=this.nullish.bind(this),this.array=this.array.bind(this),this.promise=this.promise.bind(this),this.or=this.or.bind(this),this.and=this.and.bind(this),this.transform=this.transform.bind(this),this.brand=this.brand.bind(this),this.default=this.default.bind(this),this.catch=this.catch.bind(this),this.describe=this.describe.bind(this),this.pipe=this.pipe.bind(this),this.readonly=this.readonly.bind(this),this.isNullable=this.isNullable.bind(this),this.isOptional=this.isOptional.bind(this),this["~standard"]={version:1,vendor:"zod",validate:(t)=>this["~validate"](t)}}optional(){return Le.create(this,this._def)}nullable(){return Xe.create(this,this._def)}nullish(){return this.nullable().optional()}array(){return $e.create(this)}promise(){return ut.create(this,this._def)}or(e){return Et.create([this,e],this._def)}and(e){return At.create(this,e,this._def)}transform(e){return new Ue({...O(this._def),schema:this,typeName:C.ZodEffects,effect:{type:"transform",transform:e}})}default(e){let t=typeof e==="function"?e:()=>e;return new Ot({...O(this._def),innerType:this,defaultValue:t,typeName:C.ZodDefault})}brand(){return new Vr({typeName:C.ZodBranded,type:this,...O(this._def)})}catch(e){let t=typeof e==="function"?e:()=>e;return new It({...O(this._def),innerType:this,catchValue:t,typeName:C.ZodCatch})}describe(e){return new this.constructor({...this._def,description:e})}pipe(e){return nr.create(this,e)}readonly(){return Mt.create(this)}isOptional(){return this.safeParse(void 0).success}isNullable(){return this.safeParse(null).success}}var So=/^c[^\s-]{8,}$/i,To=/^[0-9a-z]+$/,wo=/^[0-9A-HJKMNP-TV-Z]{26}$/i,Eo=/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i,Ao=/^[a-z0-9_-]{21}$/i,Co=/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,Ro=/^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/,Po=/^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i,Oo="^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$",zr,Io=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,Mo=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,No=/^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,$o=/^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,Lo=/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,Uo=/^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,Pn="((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))",Go=new RegExp(`^${Pn}$`);function On(e){let t="[0-5]\\d";if(e.precision)t=`${t}\\.\\d{${e.precision}}`;else if(e.precision==null)t=`${t}(\\.\\d+)?`;let r=e.precision?"+":"?";return`([01]\\d|2[0-3]):[0-5]\\d(:${t})${r}`}function Do(e){return new RegExp(`^${On(e)}$`)}function jo(e){let t=`${Pn}T${On(e)}`,r=[];if(r.push(e.local?"Z?":"Z"),e.offset)r.push("([+-]\\d{2}:?\\d{2})");return t=`${t}(${r.join("|")})`,new RegExp(`^${t}$`)}function zo(e,t){if((t==="v4"||!t)&&Io.test(e))return!0;if((t==="v6"||!t)&&No.test(e))return!0;return!1}function Bo(e,t){if(!Co.test(e))return!1;try{let[r]=e.split(".");if(!r)return!1;let n=r.replace(/-/g,"+").replace(/_/g,"/").padEnd(r.length+(4-r.length%4)%4,"="),o=JSON.parse(atob(n));if(typeof o!=="object"||o===null)return!1;if("typ"in o&&o?.typ!=="JWT")return!1;if(!o.alg)return!1;if(t&&o.alg!==t)return!1;return!0}catch{return!1}}function Ho(e,t){if((t==="v4"||!t)&&Mo.test(e))return!0;if((t==="v6"||!t)&&$o.test(e))return!0;return!1}class je extends M{_parse(e){if(this._def.coerce)e.data=String(e.data);if(this._getType(e)!==y.string){let o=this._getOrReturnCtx(e);return m(o,{code:f.invalid_type,expected:y.string,received:o.parsedType}),E}let r=new me,n=void 0;for(let o of this._def.checks)if(o.kind==="min"){if(e.data.length<o.value)n=this._getOrReturnCtx(e,n),m(n,{code:f.too_small,minimum:o.value,type:"string",inclusive:!0,exact:!1,message:o.message}),r.dirty()}else if(o.kind==="max"){if(e.data.length>o.value)n=this._getOrReturnCtx(e,n),m(n,{code:f.too_big,maximum:o.value,type:"string",inclusive:!0,exact:!1,message:o.message}),r.dirty()}else if(o.kind==="length"){let s=e.data.length>o.value,a=e.data.length<o.value;if(s||a){if(n=this._getOrReturnCtx(e,n),s)m(n,{code:f.too_big,maximum:o.value,type:"string",inclusive:!0,exact:!0,message:o.message});else if(a)m(n,{code:f.too_small,minimum:o.value,type:"string",inclusive:!0,exact:!0,message:o.message});r.dirty()}}else if(o.kind==="email"){if(!Po.test(e.data))n=this._getOrReturnCtx(e,n),m(n,{validation:"email",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="emoji"){if(!zr)zr=new RegExp(Oo,"u");if(!zr.test(e.data))n=this._getOrReturnCtx(e,n),m(n,{validation:"emoji",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="uuid"){if(!Eo.test(e.data))n=this._getOrReturnCtx(e,n),m(n,{validation:"uuid",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="nanoid"){if(!Ao.test(e.data))n=this._getOrReturnCtx(e,n),m(n,{validation:"nanoid",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="cuid"){if(!So.test(e.data))n=this._getOrReturnCtx(e,n),m(n,{validation:"cuid",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="cuid2"){if(!To.test(e.data))n=this._getOrReturnCtx(e,n),m(n,{validation:"cuid2",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="ulid"){if(!wo.test(e.data))n=this._getOrReturnCtx(e,n),m(n,{validation:"ulid",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="url")try{new URL(e.data)}catch{n=this._getOrReturnCtx(e,n),m(n,{validation:"url",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="regex"){if(o.regex.lastIndex=0,!o.regex.test(e.data))n=this._getOrReturnCtx(e,n),m(n,{validation:"regex",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="trim")e.data=e.data.trim();else if(o.kind==="includes"){if(!e.data.includes(o.value,o.position))n=this._getOrReturnCtx(e,n),m(n,{code:f.invalid_string,validation:{includes:o.value,position:o.position},message:o.message}),r.dirty()}else if(o.kind==="toLowerCase")e.data=e.data.toLowerCase();else if(o.kind==="toUpperCase")e.data=e.data.toUpperCase();else if(o.kind==="startsWith"){if(!e.data.startsWith(o.value))n=this._getOrReturnCtx(e,n),m(n,{code:f.invalid_string,validation:{startsWith:o.value},message:o.message}),r.dirty()}else if(o.kind==="endsWith"){if(!e.data.endsWith(o.value))n=this._getOrReturnCtx(e,n),m(n,{code:f.invalid_string,validation:{endsWith:o.value},message:o.message}),r.dirty()}else if(o.kind==="datetime"){if(!jo(o).test(e.data))n=this._getOrReturnCtx(e,n),m(n,{code:f.invalid_string,validation:"datetime",message:o.message}),r.dirty()}else if(o.kind==="date"){if(!Go.test(e.data))n=this._getOrReturnCtx(e,n),m(n,{code:f.invalid_string,validation:"date",message:o.message}),r.dirty()}else if(o.kind==="time"){if(!Do(o).test(e.data))n=this._getOrReturnCtx(e,n),m(n,{code:f.invalid_string,validation:"time",message:o.message}),r.dirty()}else if(o.kind==="duration"){if(!Ro.test(e.data))n=this._getOrReturnCtx(e,n),m(n,{validation:"duration",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="ip"){if(!zo(e.data,o.version))n=this._getOrReturnCtx(e,n),m(n,{validation:"ip",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="jwt"){if(!Bo(e.data,o.alg))n=this._getOrReturnCtx(e,n),m(n,{validation:"jwt",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="cidr"){if(!Ho(e.data,o.version))n=this._getOrReturnCtx(e,n),m(n,{validation:"cidr",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="base64"){if(!Lo.test(e.data))n=this._getOrReturnCtx(e,n),m(n,{validation:"base64",code:f.invalid_string,message:o.message}),r.dirty()}else if(o.kind==="base64url"){if(!Uo.test(e.data))n=this._getOrReturnCtx(e,n),m(n,{validation:"base64url",code:f.invalid_string,message:o.message}),r.dirty()}else D.assertNever(o);return{status:r.value,value:e.data}}_regex(e,t,r){return this.refinement((n)=>e.test(n),{validation:t,code:f.invalid_string,...v.errToObj(r)})}_addCheck(e){return new je({...this._def,checks:[...this._def.checks,e]})}email(e){return this._addCheck({kind:"email",...v.errToObj(e)})}url(e){return this._addCheck({kind:"url",...v.errToObj(e)})}emoji(e){return this._addCheck({kind:"emoji",...v.errToObj(e)})}uuid(e){return this._addCheck({kind:"uuid",...v.errToObj(e)})}nanoid(e){return this._addCheck({kind:"nanoid",...v.errToObj(e)})}cuid(e){return this._addCheck({kind:"cuid",...v.errToObj(e)})}cuid2(e){return this._addCheck({kind:"cuid2",...v.errToObj(e)})}ulid(e){return this._addCheck({kind:"ulid",...v.errToObj(e)})}base64(e){return this._addCheck({kind:"base64",...v.errToObj(e)})}base64url(e){return this._addCheck({kind:"base64url",...v.errToObj(e)})}jwt(e){return this._addCheck({kind:"jwt",...v.errToObj(e)})}ip(e){return this._addCheck({kind:"ip",...v.errToObj(e)})}cidr(e){return this._addCheck({kind:"cidr",...v.errToObj(e)})}datetime(e){if(typeof e==="string")return this._addCheck({kind:"datetime",precision:null,offset:!1,local:!1,message:e});return this._addCheck({kind:"datetime",precision:typeof e?.precision>"u"?null:e?.precision,offset:e?.offset??!1,local:e?.local??!1,...v.errToObj(e?.message)})}date(e){return this._addCheck({kind:"date",message:e})}time(e){if(typeof e==="string")return this._addCheck({kind:"time",precision:null,message:e});return this._addCheck({kind:"time",precision:typeof e?.precision>"u"?null:e?.precision,...v.errToObj(e?.message)})}duration(e){return this._addCheck({kind:"duration",...v.errToObj(e)})}regex(e,t){return this._addCheck({kind:"regex",regex:e,...v.errToObj(t)})}includes(e,t){return this._addCheck({kind:"includes",value:e,position:t?.position,...v.errToObj(t?.message)})}startsWith(e,t){return this._addCheck({kind:"startsWith",value:e,...v.errToObj(t)})}endsWith(e,t){return this._addCheck({kind:"endsWith",value:e,...v.errToObj(t)})}min(e,t){return this._addCheck({kind:"min",value:e,...v.errToObj(t)})}max(e,t){return this._addCheck({kind:"max",value:e,...v.errToObj(t)})}length(e,t){return this._addCheck({kind:"length",value:e,...v.errToObj(t)})}nonempty(e){return this.min(1,v.errToObj(e))}trim(){return new je({...this._def,checks:[...this._def.checks,{kind:"trim"}]})}toLowerCase(){return new je({...this._def,checks:[...this._def.checks,{kind:"toLowerCase"}]})}toUpperCase(){return new je({...this._def,checks:[...this._def.checks,{kind:"toUpperCase"}]})}get isDatetime(){return!!this._def.checks.find((e)=>e.kind==="datetime")}get isDate(){return!!this._def.checks.find((e)=>e.kind==="date")}get isTime(){return!!this._def.checks.find((e)=>e.kind==="time")}get isDuration(){return!!this._def.checks.find((e)=>e.kind==="duration")}get isEmail(){return!!this._def.checks.find((e)=>e.kind==="email")}get isURL(){return!!this._def.checks.find((e)=>e.kind==="url")}get isEmoji(){return!!this._def.checks.find((e)=>e.kind==="emoji")}get isUUID(){return!!this._def.checks.find((e)=>e.kind==="uuid")}get isNANOID(){return!!this._def.checks.find((e)=>e.kind==="nanoid")}get isCUID(){return!!this._def.checks.find((e)=>e.kind==="cuid")}get isCUID2(){return!!this._def.checks.find((e)=>e.kind==="cuid2")}get isULID(){return!!this._def.checks.find((e)=>e.kind==="ulid")}get isIP(){return!!this._def.checks.find((e)=>e.kind==="ip")}get isCIDR(){return!!this._def.checks.find((e)=>e.kind==="cidr")}get isBase64(){return!!this._def.checks.find((e)=>e.kind==="base64")}get isBase64url(){return!!this._def.checks.find((e)=>e.kind==="base64url")}get minLength(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e}get maxLength(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e}}je.create=(e)=>new je({checks:[],typeName:C.ZodString,coerce:e?.coerce??!1,...O(e)});function Vo(e,t){let r=(e.toString().split(".")[1]||"").length,n=(t.toString().split(".")[1]||"").length,o=r>n?r:n,s=Number.parseInt(e.toFixed(o).replace(".","")),a=Number.parseInt(t.toFixed(o).replace(".",""));return s%a/10**o}class dt extends M{constructor(){super(...arguments);this.min=this.gte,this.max=this.lte,this.step=this.multipleOf}_parse(e){if(this._def.coerce)e.data=Number(e.data);if(this._getType(e)!==y.number){let o=this._getOrReturnCtx(e);return m(o,{code:f.invalid_type,expected:y.number,received:o.parsedType}),E}let r=void 0,n=new me;for(let o of this._def.checks)if(o.kind==="int"){if(!D.isInteger(e.data))r=this._getOrReturnCtx(e,r),m(r,{code:f.invalid_type,expected:"integer",received:"float",message:o.message}),n.dirty()}else if(o.kind==="min"){if(o.inclusive?e.data<o.value:e.data<=o.value)r=this._getOrReturnCtx(e,r),m(r,{code:f.too_small,minimum:o.value,type:"number",inclusive:o.inclusive,exact:!1,message:o.message}),n.dirty()}else if(o.kind==="max"){if(o.inclusive?e.data>o.value:e.data>=o.value)r=this._getOrReturnCtx(e,r),m(r,{code:f.too_big,maximum:o.value,type:"number",inclusive:o.inclusive,exact:!1,message:o.message}),n.dirty()}else if(o.kind==="multipleOf"){if(Vo(e.data,o.value)!==0)r=this._getOrReturnCtx(e,r),m(r,{code:f.not_multiple_of,multipleOf:o.value,message:o.message}),n.dirty()}else if(o.kind==="finite"){if(!Number.isFinite(e.data))r=this._getOrReturnCtx(e,r),m(r,{code:f.not_finite,message:o.message}),n.dirty()}else D.assertNever(o);return{status:n.value,value:e.data}}gte(e,t){return this.setLimit("min",e,!0,v.toString(t))}gt(e,t){return this.setLimit("min",e,!1,v.toString(t))}lte(e,t){return this.setLimit("max",e,!0,v.toString(t))}lt(e,t){return this.setLimit("max",e,!1,v.toString(t))}setLimit(e,t,r,n){return new dt({...this._def,checks:[...this._def.checks,{kind:e,value:t,inclusive:r,message:v.toString(n)}]})}_addCheck(e){return new dt({...this._def,checks:[...this._def.checks,e]})}int(e){return this._addCheck({kind:"int",message:v.toString(e)})}positive(e){return this._addCheck({kind:"min",value:0,inclusive:!1,message:v.toString(e)})}negative(e){return this._addCheck({kind:"max",value:0,inclusive:!1,message:v.toString(e)})}nonpositive(e){return this._addCheck({kind:"max",value:0,inclusive:!0,message:v.toString(e)})}nonnegative(e){return this._addCheck({kind:"min",value:0,inclusive:!0,message:v.toString(e)})}multipleOf(e,t){return this._addCheck({kind:"multipleOf",value:e,message:v.toString(t)})}finite(e){return this._addCheck({kind:"finite",message:v.toString(e)})}safe(e){return this._addCheck({kind:"min",inclusive:!0,value:Number.MIN_SAFE_INTEGER,message:v.toString(e)})._addCheck({kind:"max",inclusive:!0,value:Number.MAX_SAFE_INTEGER,message:v.toString(e)})}get minValue(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e}get maxValue(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e}get isInt(){return!!this._def.checks.find((e)=>e.kind==="int"||e.kind==="multipleOf"&&D.isInteger(e.value))}get isFinite(){let e=null,t=null;for(let r of this._def.checks)if(r.kind==="finite"||r.kind==="int"||r.kind==="multipleOf")return!0;else if(r.kind==="min"){if(t===null||r.value>t)t=r.value}else if(r.kind==="max"){if(e===null||r.value<e)e=r.value}return Number.isFinite(t)&&Number.isFinite(e)}}dt.create=(e)=>new dt({checks:[],typeName:C.ZodNumber,coerce:e?.coerce||!1,...O(e)});class lt extends M{constructor(){super(...arguments);this.min=this.gte,this.max=this.lte}_parse(e){if(this._def.coerce)try{e.data=BigInt(e.data)}catch{return this._getInvalidInput(e)}if(this._getType(e)!==y.bigint)return this._getInvalidInput(e);let r=void 0,n=new me;for(let o of this._def.checks)if(o.kind==="min"){if(o.inclusive?e.data<o.value:e.data<=o.value)r=this._getOrReturnCtx(e,r),m(r,{code:f.too_small,type:"bigint",minimum:o.value,inclusive:o.inclusive,message:o.message}),n.dirty()}else if(o.kind==="max"){if(o.inclusive?e.data>o.value:e.data>=o.value)r=this._getOrReturnCtx(e,r),m(r,{code:f.too_big,type:"bigint",maximum:o.value,inclusive:o.inclusive,message:o.message}),n.dirty()}else if(o.kind==="multipleOf"){if(e.data%o.value!==BigInt(0))r=this._getOrReturnCtx(e,r),m(r,{code:f.not_multiple_of,multipleOf:o.value,message:o.message}),n.dirty()}else D.assertNever(o);return{status:n.value,value:e.data}}_getInvalidInput(e){let t=this._getOrReturnCtx(e);return m(t,{code:f.invalid_type,expected:y.bigint,received:t.parsedType}),E}gte(e,t){return this.setLimit("min",e,!0,v.toString(t))}gt(e,t){return this.setLimit("min",e,!1,v.toString(t))}lte(e,t){return this.setLimit("max",e,!0,v.toString(t))}lt(e,t){return this.setLimit("max",e,!1,v.toString(t))}setLimit(e,t,r,n){return new lt({...this._def,checks:[...this._def.checks,{kind:e,value:t,inclusive:r,message:v.toString(n)}]})}_addCheck(e){return new lt({...this._def,checks:[...this._def.checks,e]})}positive(e){return this._addCheck({kind:"min",value:BigInt(0),inclusive:!1,message:v.toString(e)})}negative(e){return this._addCheck({kind:"max",value:BigInt(0),inclusive:!1,message:v.toString(e)})}nonpositive(e){return this._addCheck({kind:"max",value:BigInt(0),inclusive:!0,message:v.toString(e)})}nonnegative(e){return this._addCheck({kind:"min",value:BigInt(0),inclusive:!0,message:v.toString(e)})}multipleOf(e,t){return this._addCheck({kind:"multipleOf",value:e,message:v.toString(t)})}get minValue(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e}get maxValue(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e}}lt.create=(e)=>new lt({checks:[],typeName:C.ZodBigInt,coerce:e?.coerce??!1,...O(e)});class Wt extends M{_parse(e){if(this._def.coerce)e.data=Boolean(e.data);if(this._getType(e)!==y.boolean){let r=this._getOrReturnCtx(e);return m(r,{code:f.invalid_type,expected:y.boolean,received:r.parsedType}),E}return be(e.data)}}Wt.create=(e)=>new Wt({typeName:C.ZodBoolean,coerce:e?.coerce||!1,...O(e)});class St extends M{_parse(e){if(this._def.coerce)e.data=new Date(e.data);if(this._getType(e)!==y.date){let o=this._getOrReturnCtx(e);return m(o,{code:f.invalid_type,expected:y.date,received:o.parsedType}),E}if(Number.isNaN(e.data.getTime())){let o=this._getOrReturnCtx(e);return m(o,{code:f.invalid_date}),E}let r=new me,n=void 0;for(let o of this._def.checks)if(o.kind==="min"){if(e.data.getTime()<o.value)n=this._getOrReturnCtx(e,n),m(n,{code:f.too_small,message:o.message,inclusive:!0,exact:!1,minimum:o.value,type:"date"}),r.dirty()}else if(o.kind==="max"){if(e.data.getTime()>o.value)n=this._getOrReturnCtx(e,n),m(n,{code:f.too_big,message:o.message,inclusive:!0,exact:!1,maximum:o.value,type:"date"}),r.dirty()}else D.assertNever(o);return{status:r.value,value:new Date(e.data.getTime())}}_addCheck(e){return new St({...this._def,checks:[...this._def.checks,e]})}min(e,t){return this._addCheck({kind:"min",value:e.getTime(),message:v.toString(t)})}max(e,t){return this._addCheck({kind:"max",value:e.getTime(),message:v.toString(t)})}get minDate(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e!=null?new Date(e):null}get maxDate(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e!=null?new Date(e):null}}St.create=(e)=>new St({checks:[],coerce:e?.coerce||!1,typeName:C.ZodDate,...O(e)});class qt extends M{_parse(e){if(this._getType(e)!==y.symbol){let r=this._getOrReturnCtx(e);return m(r,{code:f.invalid_type,expected:y.symbol,received:r.parsedType}),E}return be(e.data)}}qt.create=(e)=>new qt({typeName:C.ZodSymbol,...O(e)});class Tt extends M{_parse(e){if(this._getType(e)!==y.undefined){let r=this._getOrReturnCtx(e);return m(r,{code:f.invalid_type,expected:y.undefined,received:r.parsedType}),E}return be(e.data)}}Tt.create=(e)=>new Tt({typeName:C.ZodUndefined,...O(e)});class wt extends M{_parse(e){if(this._getType(e)!==y.null){let r=this._getOrReturnCtx(e);return m(r,{code:f.invalid_type,expected:y.null,received:r.parsedType}),E}return be(e.data)}}wt.create=(e)=>new wt({typeName:C.ZodNull,...O(e)});class Qt extends M{constructor(){super(...arguments);this._any=!0}_parse(e){return be(e.data)}}Qt.create=(e)=>new Qt({typeName:C.ZodAny,...O(e)});class qe extends M{constructor(){super(...arguments);this._unknown=!0}_parse(e){return be(e.data)}}qe.create=(e)=>new qe({typeName:C.ZodUnknown,...O(e)});class ze extends M{_parse(e){let t=this._getOrReturnCtx(e);return m(t,{code:f.invalid_type,expected:y.never,received:t.parsedType}),E}}ze.create=(e)=>new ze({typeName:C.ZodNever,...O(e)});class Zt extends M{_parse(e){if(this._getType(e)!==y.undefined){let r=this._getOrReturnCtx(e);return m(r,{code:f.invalid_type,expected:y.void,received:r.parsedType}),E}return be(e.data)}}Zt.create=(e)=>new Zt({typeName:C.ZodVoid,...O(e)});class $e extends M{_parse(e){let{ctx:t,status:r}=this._processInputParams(e),n=this._def;if(t.parsedType!==y.array)return m(t,{code:f.invalid_type,expected:y.array,received:t.parsedType}),E;if(n.exactLength!==null){let s=t.data.length>n.exactLength.value,a=t.data.length<n.exactLength.value;if(s||a)m(t,{code:s?f.too_big:f.too_small,minimum:a?n.exactLength.value:void 0,maximum:s?n.exactLength.value:void 0,type:"array",inclusive:!0,exact:!0,message:n.exactLength.message}),r.dirty()}if(n.minLength!==null){if(t.data.length<n.minLength.value)m(t,{code:f.too_small,minimum:n.minLength.value,type:"array",inclusive:!0,exact:!1,message:n.minLength.message}),r.dirty()}if(n.maxLength!==null){if(t.data.length>n.maxLength.value)m(t,{code:f.too_big,maximum:n.maxLength.value,type:"array",inclusive:!0,exact:!1,message:n.maxLength.message}),r.dirty()}if(t.common.async)return Promise.all([...t.data].map((s,a)=>n.type._parseAsync(new Oe(t,s,t.path,a)))).then((s)=>me.mergeArray(r,s));let o=[...t.data].map((s,a)=>n.type._parseSync(new Oe(t,s,t.path,a)));return me.mergeArray(r,o)}get element(){return this._def.type}min(e,t){return new $e({...this._def,minLength:{value:e,message:v.toString(t)}})}max(e,t){return new $e({...this._def,maxLength:{value:e,message:v.toString(t)}})}length(e,t){return new $e({...this._def,exactLength:{value:e,message:v.toString(t)}})}nonempty(e){return this.min(1,e)}}$e.create=(e,t)=>new $e({type:e,minLength:null,maxLength:null,exactLength:null,typeName:C.ZodArray,...O(t)});function ct(e){if(e instanceof ae){let t={};for(let r in e.shape){let n=e.shape[r];t[r]=Le.create(ct(n))}return new ae({...e._def,shape:()=>t})}else if(e instanceof $e)return new $e({...e._def,type:ct(e.element)});else if(e instanceof Le)return Le.create(ct(e.unwrap()));else if(e instanceof Xe)return Xe.create(ct(e.unwrap()));else if(e instanceof Be)return Be.create(e.items.map((t)=>ct(t)));else return e}class ae extends M{constructor(){super(...arguments);this._cached=null,this.nonstrict=this.passthrough,this.augment=this.extend}_getCached(){if(this._cached!==null)return this._cached;let e=this._def.shape(),t=D.objectKeys(e);return this._cached={shape:e,keys:t},this._cached}_parse(e){if(this._getType(e)!==y.object){let d=this._getOrReturnCtx(e);return m(d,{code:f.invalid_type,expected:y.object,received:d.parsedType}),E}let{status:r,ctx:n}=this._processInputParams(e),{shape:o,keys:s}=this._getCached(),a=[];if(!(this._def.catchall instanceof ze&&this._def.unknownKeys==="strip")){for(let d in n.data)if(!s.includes(d))a.push(d)}let c=[];for(let d of s){let u=o[d],k=n.data[d];c.push({key:{status:"valid",value:d},value:u._parse(new Oe(n,k,n.path,d)),alwaysSet:d in n.data})}if(this._def.catchall instanceof ze){let d=this._def.unknownKeys;if(d==="passthrough")for(let u of a)c.push({key:{status:"valid",value:u},value:{status:"valid",value:n.data[u]}});else if(d==="strict"){if(a.length>0)m(n,{code:f.unrecognized_keys,keys:a}),r.dirty()}else if(d==="strip");else throw Error("Internal ZodObject error: invalid unknownKeys value.")}else{let d=this._def.catchall;for(let u of a){let k=n.data[u];c.push({key:{status:"valid",value:u},value:d._parse(new Oe(n,k,n.path,u)),alwaysSet:u in n.data})}}if(n.common.async)return Promise.resolve().then(async()=>{let d=[];for(let u of c){let k=await u.key,Y=await u.value;d.push({key:k,value:Y,alwaysSet:u.alwaysSet})}return d}).then((d)=>me.mergeObjectSync(r,d));else return me.mergeObjectSync(r,c)}get shape(){return this._def.shape()}strict(e){return v.errToObj,new ae({...this._def,unknownKeys:"strict",...e!==void 0?{errorMap:(t,r)=>{let n=this._def.errorMap?.(t,r).message??r.defaultError;if(t.code==="unrecognized_keys")return{message:v.errToObj(e).message??n};return{message:n}}}:{}})}strip(){return new ae({...this._def,unknownKeys:"strip"})}passthrough(){return new ae({...this._def,unknownKeys:"passthrough"})}extend(e){return new ae({...this._def,shape:()=>({...this._def.shape(),...e})})}merge(e){return new ae({unknownKeys:e._def.unknownKeys,catchall:e._def.catchall,shape:()=>({...this._def.shape(),...e._def.shape()}),typeName:C.ZodObject})}setKey(e,t){return this.augment({[e]:t})}catchall(e){return new ae({...this._def,catchall:e})}pick(e){let t={};for(let r of D.objectKeys(e))if(e[r]&&this.shape[r])t[r]=this.shape[r];return new ae({...this._def,shape:()=>t})}omit(e){let t={};for(let r of D.objectKeys(this.shape))if(!e[r])t[r]=this.shape[r];return new ae({...this._def,shape:()=>t})}deepPartial(){return ct(this)}partial(e){let t={};for(let r of D.objectKeys(this.shape)){let n=this.shape[r];if(e&&!e[r])t[r]=n;else t[r]=n.optional()}return new ae({...this._def,shape:()=>t})}required(e){let t={};for(let r of D.objectKeys(this.shape))if(e&&!e[r])t[r]=this.shape[r];else{let o=this.shape[r];while(o instanceof Le)o=o._def.innerType;t[r]=o}return new ae({...this._def,shape:()=>t})}keyof(){return In(D.objectKeys(this.shape))}}ae.create=(e,t)=>new ae({shape:()=>e,unknownKeys:"strip",catchall:ze.create(),typeName:C.ZodObject,...O(t)});ae.strictCreate=(e,t)=>new ae({shape:()=>e,unknownKeys:"strict",catchall:ze.create(),typeName:C.ZodObject,...O(t)});ae.lazycreate=(e,t)=>new ae({shape:e,unknownKeys:"strip",catchall:ze.create(),typeName:C.ZodObject,...O(t)});class Et extends M{_parse(e){let{ctx:t}=this._processInputParams(e),r=this._def.options;function n(o){for(let a of o)if(a.result.status==="valid")return a.result;for(let a of o)if(a.result.status==="dirty")return t.common.issues.push(...a.ctx.common.issues),a.result;let s=o.map((a)=>new Ee(a.ctx.common.issues));return m(t,{code:f.invalid_union,unionErrors:s}),E}if(t.common.async)return Promise.all(r.map(async(o)=>{let s={...t,common:{...t.common,issues:[]},parent:null};return{result:await o._parseAsync({data:t.data,path:t.path,parent:s}),ctx:s}})).then(n);else{let o=void 0,s=[];for(let c of r){let d={...t,common:{...t.common,issues:[]},parent:null},u=c._parseSync({data:t.data,path:t.path,parent:d});if(u.status==="valid")return u;else if(u.status==="dirty"&&!o)o={result:u,ctx:d};if(d.common.issues.length)s.push(d.common.issues)}if(o)return t.common.issues.push(...o.ctx.common.issues),o.result;let a=s.map((c)=>new Ee(c));return m(t,{code:f.invalid_union,unionErrors:a}),E}}get options(){return this._def.options}}Et.create=(e,t)=>new Et({options:e,typeName:C.ZodUnion,...O(t)});var De=(e)=>{if(e instanceof Ct)return De(e.schema);else if(e instanceof Ue)return De(e.innerType());else if(e instanceof Rt)return[e.value];else if(e instanceof Qe)return e.options;else if(e instanceof Pt)return D.objectValues(e.enum);else if(e instanceof Ot)return De(e._def.innerType);else if(e instanceof Tt)return[void 0];else if(e instanceof wt)return[null];else if(e instanceof Le)return[void 0,...De(e.unwrap())];else if(e instanceof Xe)return[null,...De(e.unwrap())];else if(e instanceof Vr)return De(e.unwrap());else if(e instanceof Mt)return De(e.unwrap());else if(e instanceof It)return De(e._def.innerType);else return[]};class Hr extends M{_parse(e){let{ctx:t}=this._processInputParams(e);if(t.parsedType!==y.object)return m(t,{code:f.invalid_type,expected:y.object,received:t.parsedType}),E;let r=this.discriminator,n=t.data[r],o=this.optionsMap.get(n);if(!o)return m(t,{code:f.invalid_union_discriminator,options:Array.from(this.optionsMap.keys()),path:[r]}),E;if(t.common.async)return o._parseAsync({data:t.data,path:t.path,parent:t});else return o._parseSync({data:t.data,path:t.path,parent:t})}get discriminator(){return this._def.discriminator}get options(){return this._def.options}get optionsMap(){return this._def.optionsMap}static create(e,t,r){let n=new Map;for(let o of t){let s=De(o.shape[e]);if(!s.length)throw Error(`A discriminator value for key \`${e}\` could not be extracted from all schema options`);for(let a of s){if(n.has(a))throw Error(`Discriminator property ${String(e)} has duplicate value ${String(a)}`);n.set(a,o)}}return new Hr({typeName:C.ZodDiscriminatedUnion,discriminator:e,options:t,optionsMap:n,...O(r)})}}function Br(e,t){let r=Ge(e),n=Ge(t);if(e===t)return{valid:!0,data:e};else if(r===y.object&&n===y.object){let o=D.objectKeys(t),s=D.objectKeys(e).filter((c)=>o.indexOf(c)!==-1),a={...e,...t};for(let c of s){let d=Br(e[c],t[c]);if(!d.valid)return{valid:!1};a[c]=d.data}return{valid:!0,data:a}}else if(r===y.array&&n===y.array){if(e.length!==t.length)return{valid:!1};let o=[];for(let s=0;s<e.length;s++){let a=e[s],c=t[s],d=Br(a,c);if(!d.valid)return{valid:!1};o.push(d.data)}return{valid:!0,data:o}}else if(r===y.date&&n===y.date&&+e===+t)return{valid:!0,data:e};else return{valid:!1}}class At extends M{_parse(e){let{status:t,ctx:r}=this._processInputParams(e),n=(o,s)=>{if(Dr(o)||Dr(s))return E;let a=Br(o.value,s.value);if(!a.valid)return m(r,{code:f.invalid_intersection_types}),E;if(jr(o)||jr(s))t.dirty();return{status:t.value,value:a.data}};if(r.common.async)return Promise.all([this._def.left._parseAsync({data:r.data,path:r.path,parent:r}),this._def.right._parseAsync({data:r.data,path:r.path,parent:r})]).then(([o,s])=>n(o,s));else return n(this._def.left._parseSync({data:r.data,path:r.path,parent:r}),this._def.right._parseSync({data:r.data,path:r.path,parent:r}))}}At.create=(e,t,r)=>new At({left:e,right:t,typeName:C.ZodIntersection,...O(r)});class Be extends M{_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==y.array)return m(r,{code:f.invalid_type,expected:y.array,received:r.parsedType}),E;if(r.data.length<this._def.items.length)return m(r,{code:f.too_small,minimum:this._def.items.length,inclusive:!0,exact:!1,type:"array"}),E;if(!this._def.rest&&r.data.length>this._def.items.length)m(r,{code:f.too_big,maximum:this._def.items.length,inclusive:!0,exact:!1,type:"array"}),t.dirty();let o=[...r.data].map((s,a)=>{let c=this._def.items[a]||this._def.rest;if(!c)return null;return c._parse(new Oe(r,s,r.path,a))}).filter((s)=>!!s);if(r.common.async)return Promise.all(o).then((s)=>me.mergeArray(t,s));else return me.mergeArray(t,o)}get items(){return this._def.items}rest(e){return new Be({...this._def,rest:e})}}Be.create=(e,t)=>{if(!Array.isArray(e))throw Error("You must pass an array of schemas to z.tuple([ ... ])");return new Be({items:e,typeName:C.ZodTuple,rest:null,...O(t)})};class er extends M{get keySchema(){return this._def.keyType}get valueSchema(){return this._def.valueType}_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==y.object)return m(r,{code:f.invalid_type,expected:y.object,received:r.parsedType}),E;let n=[],o=this._def.keyType,s=this._def.valueType;for(let a in r.data)n.push({key:o._parse(new Oe(r,a,r.path,a)),value:s._parse(new Oe(r,r.data[a],r.path,a)),alwaysSet:a in r.data});if(r.common.async)return me.mergeObjectAsync(t,n);else return me.mergeObjectSync(t,n)}get element(){return this._def.valueType}static create(e,t,r){if(t instanceof M)return new er({keyType:e,valueType:t,typeName:C.ZodRecord,...O(r)});return new er({keyType:je.create(),valueType:e,typeName:C.ZodRecord,...O(t)})}}class tr extends M{get keySchema(){return this._def.keyType}get valueSchema(){return this._def.valueType}_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==y.map)return m(r,{code:f.invalid_type,expected:y.map,received:r.parsedType}),E;let n=this._def.keyType,o=this._def.valueType,s=[...r.data.entries()].map(([a,c],d)=>({key:n._parse(new Oe(r,a,r.path,[d,"key"])),value:o._parse(new Oe(r,c,r.path,[d,"value"]))}));if(r.common.async){let a=new Map;return Promise.resolve().then(async()=>{for(let c of s){let d=await c.key,u=await c.value;if(d.status==="aborted"||u.status==="aborted")return E;if(d.status==="dirty"||u.status==="dirty")t.dirty();a.set(d.value,u.value)}return{status:t.value,value:a}})}else{let a=new Map;for(let c of s){let{key:d,value:u}=c;if(d.status==="aborted"||u.status==="aborted")return E;if(d.status==="dirty"||u.status==="dirty")t.dirty();a.set(d.value,u.value)}return{status:t.value,value:a}}}}tr.create=(e,t,r)=>new tr({valueType:t,keyType:e,typeName:C.ZodMap,...O(r)});class pt extends M{_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==y.set)return m(r,{code:f.invalid_type,expected:y.set,received:r.parsedType}),E;let n=this._def;if(n.minSize!==null){if(r.data.size<n.minSize.value)m(r,{code:f.too_small,minimum:n.minSize.value,type:"set",inclusive:!0,exact:!1,message:n.minSize.message}),t.dirty()}if(n.maxSize!==null){if(r.data.size>n.maxSize.value)m(r,{code:f.too_big,maximum:n.maxSize.value,type:"set",inclusive:!0,exact:!1,message:n.maxSize.message}),t.dirty()}let o=this._def.valueType;function s(c){let d=new Set;for(let u of c){if(u.status==="aborted")return E;if(u.status==="dirty")t.dirty();d.add(u.value)}return{status:t.value,value:d}}let a=[...r.data.values()].map((c,d)=>o._parse(new Oe(r,c,r.path,d)));if(r.common.async)return Promise.all(a).then((c)=>s(c));else return s(a)}min(e,t){return new pt({...this._def,minSize:{value:e,message:v.toString(t)}})}max(e,t){return new pt({...this._def,maxSize:{value:e,message:v.toString(t)}})}size(e,t){return this.min(e,t).max(e,t)}nonempty(e){return this.min(1,e)}}pt.create=(e,t)=>new pt({valueType:e,minSize:null,maxSize:null,typeName:C.ZodSet,...O(t)});class kt extends M{constructor(){super(...arguments);this.validate=this.implement}_parse(e){let{ctx:t}=this._processInputParams(e);if(t.parsedType!==y.function)return m(t,{code:f.invalid_type,expected:y.function,received:t.parsedType}),E;function r(a,c){return Yt({data:a,path:t.path,errorMaps:[t.common.contextualErrorMap,t.schemaErrorMap,vt(),Fe].filter((d)=>!!d),issueData:{code:f.invalid_arguments,argumentsError:c}})}function n(a,c){return Yt({data:a,path:t.path,errorMaps:[t.common.contextualErrorMap,t.schemaErrorMap,vt(),Fe].filter((d)=>!!d),issueData:{code:f.invalid_return_type,returnTypeError:c}})}let o={errorMap:t.common.contextualErrorMap},s=t.data;if(this._def.returns instanceof ut){let a=this;return be(async function(...c){let d=new Ee([]),u=await a._def.args.parseAsync(c,o).catch((B)=>{throw d.addIssue(r(c,B)),d}),k=await Reflect.apply(s,this,u);return await a._def.returns._def.type.parseAsync(k,o).catch((B)=>{throw d.addIssue(n(k,B)),d})})}else{let a=this;return be(function(...c){let d=a._def.args.safeParse(c,o);if(!d.success)throw new Ee([r(c,d.error)]);let u=Reflect.apply(s,this,d.data),k=a._def.returns.safeParse(u,o);if(!k.success)throw new Ee([n(u,k.error)]);return k.data})}}parameters(){return this._def.args}returnType(){return this._def.returns}args(...e){return new kt({...this._def,args:Be.create(e).rest(qe.create())})}returns(e){return new kt({...this._def,returns:e})}implement(e){return this.parse(e)}strictImplement(e){return this.parse(e)}static create(e,t,r){return new kt({args:e?e:Be.create([]).rest(qe.create()),returns:t||qe.create(),typeName:C.ZodFunction,...O(r)})}}class Ct extends M{get schema(){return this._def.getter()}_parse(e){let{ctx:t}=this._processInputParams(e);return this._def.getter()._parse({data:t.data,path:t.path,parent:t})}}Ct.create=(e,t)=>new Ct({getter:e,typeName:C.ZodLazy,...O(t)});class Rt extends M{_parse(e){if(e.data!==this._def.value){let t=this._getOrReturnCtx(e);return m(t,{received:t.data,code:f.invalid_literal,expected:this._def.value}),E}return{status:"valid",value:e.data}}get value(){return this._def.value}}Rt.create=(e,t)=>new Rt({value:e,typeName:C.ZodLiteral,...O(t)});function In(e,t){return new Qe({values:e,typeName:C.ZodEnum,...O(t)})}class Qe extends M{_parse(e){if(typeof e.data!=="string"){let t=this._getOrReturnCtx(e),r=this._def.values;return m(t,{expected:D.joinValues(r),received:t.parsedType,code:f.invalid_type}),E}if(!this._cache)this._cache=new Set(this._def.values);if(!this._cache.has(e.data)){let t=this._getOrReturnCtx(e),r=this._def.values;return m(t,{received:t.data,code:f.invalid_enum_value,options:r}),E}return be(e.data)}get options(){return this._def.values}get enum(){let e={};for(let t of this._def.values)e[t]=t;return e}get Values(){let e={};for(let t of this._def.values)e[t]=t;return e}get Enum(){let e={};for(let t of this._def.values)e[t]=t;return e}extract(e,t=this._def){return Qe.create(e,{...this._def,...t})}exclude(e,t=this._def){return Qe.create(this.options.filter((r)=>!e.includes(r)),{...this._def,...t})}}Qe.create=In;class Pt extends M{_parse(e){let t=D.getValidEnumValues(this._def.values),r=this._getOrReturnCtx(e);if(r.parsedType!==y.string&&r.parsedType!==y.number){let n=D.objectValues(t);return m(r,{expected:D.joinValues(n),received:r.parsedType,code:f.invalid_type}),E}if(!this._cache)this._cache=new Set(D.getValidEnumValues(this._def.values));if(!this._cache.has(e.data)){let n=D.objectValues(t);return m(r,{received:r.data,code:f.invalid_enum_value,options:n}),E}return be(e.data)}get enum(){return this._def.values}}Pt.create=(e,t)=>new Pt({values:e,typeName:C.ZodNativeEnum,...O(t)});class ut extends M{unwrap(){return this._def.type}_parse(e){let{ctx:t}=this._processInputParams(e);if(t.parsedType!==y.promise&&t.common.async===!1)return m(t,{code:f.invalid_type,expected:y.promise,received:t.parsedType}),E;let r=t.parsedType===y.promise?t.data:Promise.resolve(t.data);return be(r.then((n)=>this._def.type.parseAsync(n,{path:t.path,errorMap:t.common.contextualErrorMap})))}}ut.create=(e,t)=>new ut({type:e,typeName:C.ZodPromise,...O(t)});class Ue extends M{innerType(){return this._def.schema}sourceType(){return this._def.schema._def.typeName===C.ZodEffects?this._def.schema.sourceType():this._def.schema}_parse(e){let{status:t,ctx:r}=this._processInputParams(e),n=this._def.effect||null,o={addIssue:(s)=>{if(m(r,s),s.fatal)t.abort();else t.dirty()},get path(){return r.path}};if(o.addIssue=o.addIssue.bind(o),n.type==="preprocess"){let s=n.transform(r.data,o);if(r.common.async)return Promise.resolve(s).then(async(a)=>{if(t.value==="aborted")return E;let c=await this._def.schema._parseAsync({data:a,path:r.path,parent:r});if(c.status==="aborted")return E;if(c.status==="dirty")return it(c.value);if(t.value==="dirty")return it(c.value);return c});else{if(t.value==="aborted")return E;let a=this._def.schema._parseSync({data:s,path:r.path,parent:r});if(a.status==="aborted")return E;if(a.status==="dirty")return it(a.value);if(t.value==="dirty")return it(a.value);return a}}if(n.type==="refinement"){let s=(a)=>{let c=n.refinement(a,o);if(r.common.async)return Promise.resolve(c);if(c instanceof Promise)throw Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");return a};if(r.common.async===!1){let a=this._def.schema._parseSync({data:r.data,path:r.path,parent:r});if(a.status==="aborted")return E;if(a.status==="dirty")t.dirty();return s(a.value),{status:t.value,value:a.value}}else return this._def.schema._parseAsync({data:r.data,path:r.path,parent:r}).then((a)=>{if(a.status==="aborted")return E;if(a.status==="dirty")t.dirty();return s(a.value).then(()=>({status:t.value,value:a.value}))})}if(n.type==="transform")if(r.common.async===!1){let s=this._def.schema._parseSync({data:r.data,path:r.path,parent:r});if(!We(s))return E;let a=n.transform(s.value,o);if(a instanceof Promise)throw Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");return{status:t.value,value:a}}else return this._def.schema._parseAsync({data:r.data,path:r.path,parent:r}).then((s)=>{if(!We(s))return E;return Promise.resolve(n.transform(s.value,o)).then((a)=>({status:t.value,value:a}))});D.assertNever(n)}}Ue.create=(e,t,r)=>new Ue({schema:e,typeName:C.ZodEffects,effect:t,...O(r)});Ue.createWithPreprocess=(e,t,r)=>new Ue({schema:t,effect:{type:"preprocess",transform:e},typeName:C.ZodEffects,...O(r)});class Le extends M{_parse(e){if(this._getType(e)===y.undefined)return be(void 0);return this._def.innerType._parse(e)}unwrap(){return this._def.innerType}}Le.create=(e,t)=>new Le({innerType:e,typeName:C.ZodOptional,...O(t)});class Xe extends M{_parse(e){if(this._getType(e)===y.null)return be(null);return this._def.innerType._parse(e)}unwrap(){return this._def.innerType}}Xe.create=(e,t)=>new Xe({innerType:e,typeName:C.ZodNullable,...O(t)});class Ot extends M{_parse(e){let{ctx:t}=this._processInputParams(e),r=t.data;if(t.parsedType===y.undefined)r=this._def.defaultValue();return this._def.innerType._parse({data:r,path:t.path,parent:t})}removeDefault(){return this._def.innerType}}Ot.create=(e,t)=>new Ot({innerType:e,typeName:C.ZodDefault,defaultValue:typeof t.default==="function"?t.default:()=>t.default,...O(t)});class It extends M{_parse(e){let{ctx:t}=this._processInputParams(e),r={...t,common:{...t.common,issues:[]}},n=this._def.innerType._parse({data:r.data,path:r.path,parent:{...r}});if(_t(n))return n.then((o)=>({status:"valid",value:o.status==="valid"?o.value:this._def.catchValue({get error(){return new Ee(r.common.issues)},input:r.data})}));else return{status:"valid",value:n.status==="valid"?n.value:this._def.catchValue({get error(){return new Ee(r.common.issues)},input:r.data})}}removeCatch(){return this._def.innerType}}It.create=(e,t)=>new It({innerType:e,typeName:C.ZodCatch,catchValue:typeof t.catch==="function"?t.catch:()=>t.catch,...O(t)});class rr extends M{_parse(e){if(this._getType(e)!==y.nan){let r=this._getOrReturnCtx(e);return m(r,{code:f.invalid_type,expected:y.nan,received:r.parsedType}),E}return{status:"valid",value:e.data}}}rr.create=(e)=>new rr({typeName:C.ZodNaN,...O(e)});var jc=Symbol("zod_brand");class Vr extends M{_parse(e){let{ctx:t}=this._processInputParams(e),r=t.data;return this._def.type._parse({data:r,path:t.path,parent:t})}unwrap(){return this._def.type}}class nr extends M{_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.common.async)return(async()=>{let o=await this._def.in._parseAsync({data:r.data,path:r.path,parent:r});if(o.status==="aborted")return E;if(o.status==="dirty")return t.dirty(),it(o.value);else return this._def.out._parseAsync({data:o.value,path:r.path,parent:r})})();else{let n=this._def.in._parseSync({data:r.data,path:r.path,parent:r});if(n.status==="aborted")return E;if(n.status==="dirty")return t.dirty(),{status:"dirty",value:n.value};else return this._def.out._parseSync({data:n.value,path:r.path,parent:r})}}static create(e,t){return new nr({in:e,out:t,typeName:C.ZodPipeline})}}class Mt extends M{_parse(e){let t=this._def.innerType._parse(e),r=(n)=>{if(We(n))n.value=Object.freeze(n.value);return n};return _t(t)?t.then((n)=>r(n)):r(t)}unwrap(){return this._def.innerType}}Mt.create=(e,t)=>new Mt({innerType:e,typeName:C.ZodReadonly,...O(t)});var zc={object:ae.lazycreate},C;(function(e){e.ZodString="ZodString",e.ZodNumber="ZodNumber",e.ZodNaN="ZodNaN",e.ZodBigInt="ZodBigInt",e.ZodBoolean="ZodBoolean",e.ZodDate="ZodDate",e.ZodSymbol="ZodSymbol",e.ZodUndefined="ZodUndefined",e.ZodNull="ZodNull",e.ZodAny="ZodAny",e.ZodUnknown="ZodUnknown",e.ZodNever="ZodNever",e.ZodVoid="ZodVoid",e.ZodArray="ZodArray",e.ZodObject="ZodObject",e.ZodUnion="ZodUnion",e.ZodDiscriminatedUnion="ZodDiscriminatedUnion",e.ZodIntersection="ZodIntersection",e.ZodTuple="ZodTuple",e.ZodRecord="ZodRecord",e.ZodMap="ZodMap",e.ZodSet="ZodSet",e.ZodFunction="ZodFunction",e.ZodLazy="ZodLazy",e.ZodLiteral="ZodLiteral",e.ZodEnum="ZodEnum",e.ZodEffects="ZodEffects",e.ZodNativeEnum="ZodNativeEnum",e.ZodOptional="ZodOptional",e.ZodNullable="ZodNullable",e.ZodDefault="ZodDefault",e.ZodCatch="ZodCatch",e.ZodPromise="ZodPromise",e.ZodBranded="ZodBranded",e.ZodPipeline="ZodPipeline",e.ZodReadonly="ZodReadonly"})(C||(C={}));var w=je.create,ue=dt.create,Bc=rr.create,Hc=lt.create,Ie=Wt.create,Vc=St.create,Fc=qt.create,Xc=Tt.create,Fo=wt.create,Kc=Qt.create,Jc=qe.create,Yc=ze.create,Wc=Zt.create,Ae=$e.create,{create:te,strictCreate:qc}=ae,Xo=Et.create,Qc=Hr.create,Zc=At.create,ed=Be.create,Ko=er.create,td=tr.create,rd=pt.create,nd=kt.create,od=Ct.create,Mn=Rt.create,ft=Qe.create,sd=Pt.create,ad=ut.create,id=Ue.create,cd=Le.create,dd=Xe.create,ld=Ue.createWithPreprocess,pd=nr.create;var Fr=["http","vercel","cloudflare","deno","netlify"];var $n=te({id:w(),name:w(),type:ft(Fr),proxyUrl:w(),isActive:Ie(),testStatus:ft(["active","error"]).nullable().optional(),lastTestedAt:ue().nullable().optional(),lastError:w().nullable().optional(),rateLimitedUntil:ue().nullable().optional()}),gd=te({name:w().min(1),type:ft(Fr),proxyUrl:w().min(1),isActive:Ie().optional()}),yd=te({name:w().min(1).optional(),proxyUrl:w().min(1).optional(),isActive:Ie().optional()}),bd=te({accountId:w().min(1),apiToken:w().min(1),projectName:w().optional()}),xd=te({vercelToken:w().min(1),projectName:w().optional()}),vd=te({denoToken:w().min(1),orgDomain:w().min(1),projectName:w().optional()}),_d=te({netlifyToken:w().min(1),projectName:w().optional()}),Ln=te({ok:Ie(),status:ue().optional(),statusText:w().nullable().optional(),elapsedMs:ue().optional(),error:w().nullable().optional()}),Un=["single","round-robin","random"],Jo=te({version:Mn(1),port:ue().int().min(1024).max(65535),apiKey:w().min(8),upstream:w(),selectedModels:Ae(w()),fallbackModels:Ae(w().min(1)).max(2).default([]),proxyPools:Ae($n),proxyStrategy:ft(Un).default("single"),activePoolId:w().nullable().optional(),stickyLimit:ue().int().min(1).max(100).default(1),rtkEnabled:Ie().default(!0)}),kd=te({port:ue().int().min(1024).max(65535).optional(),apiKey:w().min(1).optional(),selectedModels:Ae(w()).optional(),fallbackModels:Ae(w().min(1)).max(2).optional(),proxyPools:Ae($n).optional(),proxyStrategy:ft(Un).optional(),activePoolId:w().nullable().optional(),stickyLimit:ue().int().min(1).max(100).optional(),rtkEnabled:Ie().optional()}),Sd=te({modelId:w().min(1)}),Gn=te({ok:Ie(),modelId:w(),elapsedMs:ue().int().nonnegative().optional(),reply:w().optional(),error:w().optional()}),Yo=te({id:w(),name:w(),limit:te({context:ue().optional(),output:ue().optional()}).optional(),capabilities:te({tools:Ie().optional(),input:Ae(w()).optional(),output:Ae(w()).optional()}).optional(),variants:Ae(te({id:w(),settings:Ko(w(),Xo([w(),ue(),Ie(),Fo()])).optional()})).optional()});var Wo=te({at:ue(),method:w(),path:w(),model:w(),status:ue(),ms:ue(),poolName:w().optional()}),qo=te({providerId:w(),path:w(),installed:Ie(),models:ue(),modelIds:Ae(w())}),_e=te({running:Ie(),routerError:w(),endpoint:w(),config:Jo,models:Ae(Yo),modelsFetchedAt:ue().nullable(),modelsError:w(),upstreamCount:ue(),registration:qo,preview:w(),warnings:Ae(w()),requests:Ae(Wo)}),Dn=te({kind:ft(Fr),code:w()}),Td=te({ok:Mn(!0)});class mt extends Error{code;constructor(e,t){super(t);this.name="ServiceError",this.code=e}}var Qo=te({error:te({code:w(),message:w()})}),Zo=(e)=>{try{return JSON.parse(e)}catch{return null}},jn=(e)=>{let t=async(r,n,o,s)=>{let a;try{a=await e.serviceRequest({method:r,path:n,body:s===void 0?void 0:JSON.stringify(s)})}catch(u){throw new mt("no-service",u instanceof U&&u.code==="NO_SERVICE"?"Allow the local service for this extension in Settings, Extensions.":"Could not reach the local service.")}let c=Zo(a.body);if(a.status>=400){let u=Qo.safeParse(c);throw new mt(u.success?u.data.error.code:"unknown",u.success?u.data.error.message:"The local service refused the request.")}let d=o.safeParse(c);if(!d.success)throw new mt("bad-answer","The local service answered with something this panel does not understand.");return d.data};return{state:()=>t("GET","/state",_e),patchConfig:(r)=>t("PUT","/config",_e,r),rotateKey:()=>t("POST","/api-key/rotate",_e,{}),refreshModels:()=>t("POST","/models/refresh",_e,{}),testModel:(r)=>t("POST","/models/test",Gn,{modelId:r}),register:()=>t("POST","/register",_e,{}),unregister:()=>t("POST","/unregister",_e,{}),relaySource:(r)=>t("GET",`/relays/${r}`,Dn),createProxyPool:(r)=>t("POST","/proxy-pools",_e,r),updateProxyPool:(r,n)=>t("PUT",`/proxy-pools/${r}`,_e,n),deleteProxyPool:(r)=>t("DELETE",`/proxy-pools/${r}`,_e),testProxyPool:(r)=>t("POST",`/proxy-pools/${r}/test`,Ln,{}),deployCloudflare:(r)=>t("POST","/proxy-pools/cloudflare-deploy",_e,r),deployVercel:(r)=>t("POST","/proxy-pools/vercel-deploy",_e,r),deployDeno:(r)=>t("POST","/proxy-pools/deno-deploy",_e,r),deployNetlify:(r)=>t("POST","/proxy-pools/netlify-deploy",_e,r)}};var zn=(e)=>{let t=null,r="",n=!1,o=new Set,s=()=>{for(let u of o)u()},a=(u)=>u instanceof mt?u.message:u instanceof Error?u.message:String(u),c=async(u)=>{n=!0,s();try{t=await u(e),r=""}catch(k){r=a(k)}finally{n=!1,s()}};return{state:()=>t,error:()=>r,busy:()=>n,subscribe:(u)=>{o.add(u)},load:()=>c((u)=>u.state()),poll:async()=>{if(n)return;try{t=await e.state(),r="",s()}catch{}},run:c}};var Bn=`
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
`;var l=(e,t="",r="")=>{let n=document.createElement(e);if(t)n.className=t;if(r)n.textContent=r;return n},Hn=(e,t="")=>{let r=l("div",`br-row ${t}`.trim());return e.append(r),r},Ke=(e,t="")=>{let r=l("div",`br-stack ${t}`.trim());return e.append(r),r},Ce=(e,t,r)=>{let n=l("section","br-card"),o=l("header","br-card-header"),s=l("div"),a=l("h3","br-card-title",t);if(s.append(a),r){let c=l("p","br-card-desc",r);s.append(c)}return o.append(s),n.append(o),e.append(n),{card:n,body:n}},H=(e,t,r,n="default")=>{let o=l("button",`br-btn ${n!=="default"?n:""}`.trim(),t);return o.type="button",o.addEventListener("click",r),e.append(o),o};var es=(e)=>e===null?"never":new Date(e).toLocaleTimeString(),or=(e)=>{let t=e.trim().replace(/\([^()]+\)\s*$/,"");return(t.startsWith("blackrouter/")?t.slice(12):t).toLowerCase()},Vn=(e)=>{if(e>=1e6){if(e===1e6||e===1048576)return"1M";let t=e/1e6;return`${t.toFixed(t%1===0?0:1)}M`}if(e>=1000){if(e%1000===0)return`${e/1000}k`;return`${Math.round(e/1024)}k`}return`${e}`},Fn=(e,t,r)=>{let n=Ke(document.createElement("div")),o="",s="",a=null,c={},d=(h)=>h.config.selectedModels.length>0?h.config.selectedModels:h.models.map((S)=>S.id),u=async(h)=>{o="",await e.run((S)=>S.patchConfig({selectedModels:h})),W()},k=(h,S,z)=>{let ie=d(h);if(!z&&ie.length<=1){o="Keep at least one free model selected so OpenCode has an endpoint to call.",W();return}let le=z?[...ie,S]:ie.filter((q)=>q!==S);u(le)},Y=(h)=>{u(h.models.map((S)=>S.id))},B=(h)=>{if(h.models.length>0)u([h.models[0].id])},X=async(h)=>{if(o="",await e.run((S)=>S.patchConfig({fallbackModels:h.slice(0,2)})),e.error()){o=e.error(),W();return}await r.toast({kind:"success",message:"Model fallback order saved."}),W()},A=async()=>{if(o="",await e.run((h)=>h.refreshModels()),e.error())await r.toast({kind:"error",message:e.error()});W()},W=()=>{n.replaceChildren();let h=e.state();if(!h)return;let{card:S}=Ce(n,"OpenCode Zen Free Catalog","Select the free models OpenCode and clients can call. Paid models are filtered out.");if(h.modelsError){let _=l("div");we(_,{tone:"warning",title:"Could not refresh catalog",body:h.modelsError}),S.append(_)}if(o){let _=l("div");we(_,{tone:"error",title:"Selection notice",body:o}),S.append(_)}if(h.models.length===0){xt(S,{title:"No free models detected",body:"Refresh the list. If it stays empty, check the upstream and any relay configured.",action:{label:"Refresh",onClick:()=>void A()}});return}let z=l("input","br-search-input");z.type="text",z.placeholder="Search free models by name or id...",z.value=s,z.oninput=()=>{s=z.value.toLowerCase(),j()},S.append(z);let ie=l("div","br-row between"),le=d(h),q=l("span","br-muted br-mono",`${le.length} of ${h.models.length} active · Updated ${es(h.modelsFetchedAt)}`);ie.append(q);let Se=l("div","br-row");H(Se,"Select All",()=>Y(h)),H(Se,"Reset",()=>B(h)),H(Se,"Refresh List",()=>void A()),ie.append(Se),S.append(ie);let Z=l("div","br-models-grid");S.append(Z);let j=()=>{Z.replaceChildren();let _=h.models.filter((g)=>g.id.toLowerCase().includes(s)||g.name.toLowerCase().includes(s));if(_.length===0){let g=l("p","br-muted","No free models match your filter.");Z.append(g);return}for(let g of _){let ye=le.includes(g.id),re=l("div",`br-model-card ${ye?"selected":""}`),R=l("div","br-model-card-info");R.append(l("span","br-model-name",g.name)),R.append(l("span","br-model-id",g.id));let J=l("div","br-row");J.style.gap="4px",J.style.marginTop="4px";let Me=g.limit?.context?Vn(g.limit.context):"128k";if(J.append(l("span","br-badge br-badge-neutral",`${Me} ctx`)),g.limit?.output){let fe=Vn(g.limit.output);J.append(l("span","br-badge br-badge-neutral",`${fe} out`))}if(g.capabilities?.input?.includes("image"))J.append(l("span","br-badge br-badge-neutral","Vision"));if(g.variants&&g.variants.length>0)J.append(l("span","br-badge br-badge-running","Thinking"));if(g.capabilities?.tools)J.append(l("span","br-badge br-badge-neutral","Tools"));R.append(J),re.append(R);let N=l("div","br-model-right"),T=c[g.id];if(T)if(T.ok)N.append(l("span","br-badge br-badge-running",`${T.elapsedMs??0}ms ✓`));else{let fe=l("span","br-badge br-badge-stopped","Failed ✗");fe.title=T.error||"Test failed",N.append(fe)}let Q=a===g.id,He=H(N,Q?"Testing...":"Test",async(fe)=>{fe.stopPropagation(),a=g.id,j();try{let xe=await t.testModel(g.id);if(c[g.id]=xe,xe.ok)await r.toast({kind:"success",message:`${g.name}: Test passed (${xe.elapsedMs??0}ms). "${xe.reply?.slice(0,40)||"OK"}"`});else await r.toast({kind:"error",message:`${g.name}: ${xe.error||"Test failed."}`})}catch(xe){c[g.id]={ok:!1,modelId:g.id,error:String(xe)},await r.toast({kind:"error",message:xe instanceof Error?xe.message:String(xe)})}finally{a=null,j()}});He.disabled=Q;let L=l("div");$r(L,{label:"",checked:ye,onChange:(fe)=>k(h,g.id,fe)}),N.append(L),re.append(N),re.onclick=(fe)=>{if(fe.target.closest("input, button"))return;k(h,g.id,!ye)},Z.append(re)}};j();let{card:b}=Ce(n,"Automatic Model Fallback","If a request fails with a retryable upstream error, BlackRouter tries these models in order. The requested model is always attempted first."),x=h.config.fallbackModels??[];if(x.length===0)b.append(l("p","br-muted","No fallback models configured. Failed requests will return the upstream error."));let pe=l("div","br-stack");for(let _=0;_<x.length;_+=1){let g=x[_],ye=h.models.find((T)=>or(T.id)===or(g)),re=l("div","br-row between");re.style.alignItems="center";let R=l("div","br-stack");R.append(l("span","br-model-name",`${_+1}. ${ye?.name??g}`)),R.append(l("span","br-model-id",g)),re.append(R);let J=l("div","br-row"),Me=H(J,"Move up",()=>{if(_===0)return;let T=[...x];[T[_-1],T[_]]=[T[_],T[_-1]],X(T)});Me.disabled=_===0;let N=H(J,"Move down",()=>{if(_>=x.length-1)return;let T=[...x];[T[_+1],T[_]]=[T[_],T[_+1]],X(T)});N.disabled=_>=x.length-1,H(J,"Remove",()=>{X(x.filter((T,Q)=>Q!==_))}),re.append(J),pe.append(re)}b.append(pe);let he=new Set(x.map(or)),ge=h.models.filter((_)=>!he.has(or(_.id))),i=l("div","br-row"),p=l("select","br-search-input");p.style.flex="1";let P=document.createElement("option");P.value="",P.textContent=ge.length>0?"Choose a fallback model…":"No additional models available",p.append(P);for(let _ of ge){let g=document.createElement("option");g.value=_.id,g.textContent=_.name,p.append(g)}p.disabled=x.length>=2||ge.length===0,i.append(p);let G=H(i,"Add fallback",()=>{if(!p.value||x.length>=2)return;X([...x,p.value])},"primary");G.disabled=p.disabled,b.append(i),b.append(l("p","br-muted","Fallbacks are tried only for HTTP 404, 408, 429, 500, 502, 503, or 504. Up to two fallback models are allowed per request."))};return{element:n,render:W}};var Xn=(e,t)=>{let r=Ke(document.createElement("div")),n=!1,o=async(c,d)=>{try{await t.writeClipboard(c),await t.toast({kind:"success",message:`${d} copied.`})}catch{await t.toast({kind:"error",message:"Failed to copy."})}},s=async(c,d)=>{if(n=!1,await e.run(c),e.error())await t.toast({kind:"error",message:e.error()});else await t.toast({kind:"success",message:d});a()},a=()=>{r.replaceChildren();let c=e.state();if(!c)return;let{card:d}=Ce(r,"OpenCode Provider Registration","BlackRouter registers this local endpoint directly into OpenCode’s configuration file.");for(let z of c.warnings){let ie=l("div");we(ie,{tone:"warning",title:"File warning",body:z}),d.append(ie)}let u=l("div","br-opencode-hero"),k=l("div","br-opencode-desc"),Y=l("span",`br-badge ${c.registration.installed?"br-badge-running":"br-badge-neutral"}`,c.registration.installed?"Registered":"Not Registered"),B=l("div","br-row");B.append(Y),B.append(l("span","br-mono",c.registration.path)),k.append(B);let X=l("span","br-muted",c.registration.installed?`${c.registration.models} free model${c.registration.models===1?"":"s"} registered in OpenCode config.`:"Click register to add BlackRouter into your active OpenCode configuration.");k.append(X),u.append(k);let A=l("div","br-row");if(c.registration.installed)H(A,"Update Provider",()=>void s((z)=>z.register(),"Provider updated in OpenCode config."),"primary"),H(A,n?"Confirm Remove?":"Remove",()=>{if(!n){n=!0,a();return}s((z)=>z.unregister(),"Provider removed from OpenCode config.")},n?"destructive":"default");else{let z=H(A,"Register in OpenCode",()=>void s((ie)=>ie.register(),"Provider added to OpenCode config."),"primary");z.disabled=c.models.length===0}u.append(A),d.append(u);let{card:W}=Ce(r,"Config Block Preview","The exact JSON configuration written to OpenCode."),h=l("pre","br-json-block",c.preview);W.append(h);let S=l("div","br-row");H(S,"Copy JSON Block",()=>void o(c.preview,"Config block")),W.append(S)};return{element:r,render:a}};var ts=[{id:"cloudflare",label:"Cloudflare Worker"},{id:"vercel",label:"Vercel Edge"},{id:"deno",label:"Deno Deploy"},{id:"netlify",label:"Netlify Function"},{id:"http",label:"Forward Proxy"}],Kn=(e,t,r)=>{let n=Ke(document.createElement("div")),o=!1,s="cloudflare",a=!1,c="",d=null,u={name:"",type:"http",proxyUrl:""},k={accountId:"",apiToken:"",projectName:""},Y={vercelToken:"",projectName:""},B={denoToken:"",orgDomain:"",projectName:""},X={netlifyToken:"",projectName:""},A=async(b,x)=>{try{await r.writeClipboard(b),await r.toast({kind:"success",message:`${x} copied.`})}catch{c="The clipboard refused the copy.",j()}},W=async(b)=>{try{let x=await t.relaySource(b);await A(x.code,`${b} relay code`)}catch(x){await r.toast({kind:"error",message:x instanceof Error?x.message:String(x)})}},h=async()=>{a=!0,c="",j();try{if(s==="http"){if(!u.name.trim()||!u.proxyUrl.trim())throw Error("Name and Proxy URL are required.");await e.run((b)=>b.createProxyPool({name:u.name.trim(),type:"http",proxyUrl:u.proxyUrl.trim(),isActive:!0})),u.name="",u.proxyUrl=""}else if(s==="cloudflare"){if(!k.accountId.trim()||!k.apiToken.trim())throw Error("Cloudflare Account ID and API Token are required.");await e.run((b)=>b.deployCloudflare({accountId:k.accountId.trim(),apiToken:k.apiToken.trim(),projectName:k.projectName.trim()||void 0})),k.accountId="",k.apiToken="",k.projectName=""}else if(s==="vercel"){if(!Y.vercelToken.trim())throw Error("Vercel API Token is required.");await e.run((b)=>b.deployVercel({vercelToken:Y.vercelToken.trim(),projectName:Y.projectName.trim()||void 0})),Y.vercelToken="",Y.projectName=""}else if(s==="deno"){if(!B.denoToken.trim()||!B.orgDomain.trim())throw Error("Deno Deploy Token and Organization Domain are required.");await e.run((b)=>b.deployDeno({denoToken:B.denoToken.trim(),orgDomain:B.orgDomain.trim(),projectName:B.projectName.trim()||void 0})),B.denoToken="",B.orgDomain="",B.projectName=""}else if(s==="netlify"){if(!X.netlifyToken.trim())throw Error("Netlify API Token is required.");await e.run((b)=>b.deployNetlify({netlifyToken:X.netlifyToken.trim(),projectName:X.projectName.trim()||void 0})),X.netlifyToken="",X.projectName=""}o=!1,await r.toast({kind:"success",message:"Relay configured and activated."})}catch(b){c=b instanceof Error?b.message:String(b)}finally{a=!1,j()}},S=async(b)=>{await e.run((x)=>x.updateProxyPool(b.id,{isActive:!b.isActive}))},z=async(b)=>{await e.run((x)=>x.patchConfig({proxyStrategy:b})),await r.toast({kind:"info",message:`Routing strategy set to ${b}.`})},ie=async(b)=>{await e.run((x)=>x.patchConfig({stickyLimit:b}))},le=async(b)=>{let x=e.state();if(!x)return;let pe=x.config.proxyPools.map((he)=>({...he,isActive:he.id===b.id}));await e.run((he)=>he.patchConfig({proxyPools:pe,activePoolId:b.id,proxyStrategy:"single"})),await r.toast({kind:"success",message:`${b.name} set as primary route.`})},q=async()=>{let b=e.state();if(!b)return;let x=b.config.proxyPools.map((pe)=>({...pe,isActive:!1}));await e.run((pe)=>pe.patchConfig({activePoolId:null,proxyPools:x})),await r.toast({kind:"info",message:"Switched to direct routing."})},Se=async(b)=>{await e.run((x)=>x.deleteProxyPool(b)),await r.toast({kind:"success",message:"Proxy pool removed."})},Z=async(b)=>{d=b,j();try{let x=await t.testProxyPool(b);if(await e.load(),x.ok)await r.toast({kind:"success",message:`Relay test passed (${x.elapsedMs||0}ms).`});else await r.toast({kind:"error",message:x.error||"Relay test failed."})}catch(x){await r.toast({kind:"error",message:x instanceof Error?x.message:String(x)})}finally{d=null,j()}},j=()=>{n.replaceChildren();let b=e.state();if(!b)return;let x=b.config.proxyStrategy||"single",pe=b.config.stickyLimit??1,{card:he}=Ce(n,"Upstream Routing & Strategy","Select whether calls go directly, through a dedicated relay, or load-balance across pools."),ge=l("div","br-strategy-toolbar"),i=l("div","br-strategy-group");i.append(l("span","br-strategy-label","Strategy:"));let p=l("div","br-strategy-tabs"),P=[{id:"single",label:"Single Pool"},{id:"round-robin",label:"Round-Robin"},{id:"random",label:"Random"}];for(let N of P){let T=l("button",`br-strategy-tab ${x===N.id?"active":""}`,N.label);T.onclick=()=>void z(N.id),p.append(T)}if(i.append(p),ge.append(i),x==="round-robin"){let N=l("div","br-sticky-control");N.append(l("span","","Sticky Turns:"));let T=l("input","br-sticky-input");T.type="number",T.min="1",T.max="100",T.value=String(pe),T.onchange=()=>{let Q=Math.max(1,parseInt(T.value,10)||1);T.value=String(Q),ie(Q)},N.append(T),ge.append(N)}he.append(ge);let G=b.config.proxyPools.filter((N)=>N.isActive),_=b.config.proxyPools.find((N)=>N.id===b.config.activePoolId)||b.config.proxyPools.find((N)=>N.isActive),g=l("div","br-pool-card active"),ye=l("div","br-pool-left"),re=l("div","br-pool-info"),R=l("div","br-pool-title-row");if(x==="round-robin")R.append(l("span","br-pool-name","Round-Robin Load Balancing")),R.append(l("span",G.length>0?"br-badge br-badge-primary":"br-badge br-badge-stopped",`${G.length} Pools Active`)),re.append(R),re.append(l("span","br-pool-url",G.length>0?`Sequentially rotating across ${G.length} active relays with ${pe} sticky turn(s) each.`:"No relays active in pool. Falling back to direct connection."));else if(x==="random")R.append(l("span","br-pool-name","Random Upstream Routing")),R.append(l("span",G.length>0?"br-badge br-badge-primary":"br-badge br-badge-stopped",`${G.length} Pools Active`)),re.append(R),re.append(l("span","br-pool-url",G.length>0?`Distributing requests uniformly at random across ${G.length} active relays.`:"No relays active in pool. Falling back to direct connection."));else if(_)R.append(l("span","br-pool-name",_.name)),R.append(l("span","br-badge br-badge-primary",_.type==="http"?"Forward Proxy":`${_.type} Relay`)),re.append(R),re.append(l("span","br-pool-url",_.proxyUrl));else R.append(l("span","br-pool-name","Direct Connection")),R.append(l("span","br-badge br-badge-neutral","Direct")),re.append(R),re.append(l("span","br-pool-url","Direct requests from this machine to https://opencode.ai/zen/v1"));ye.append(re),g.append(ye);let J=l("div","br-pool-actions");if(x==="single"&&_)H(J,"Switch to Direct",()=>void q());if(H(J,o?"Close Form":"+ Add / Deploy Relay",()=>{o=!o,c="",j()},o?"default":"primary"),g.append(J),he.append(g),o){let N=l("div","br-deploy-box");if(c){let L=l("div");we(L,{tone:"error",title:"Deployment error",body:c}),N.append(L)}let T=l("div","br-deploy-nav");for(let L of ts){let fe=l("button",`br-deploy-tab ${s===L.id?"active":""}`,L.label);fe.onclick=()=>{s=L.id,c="",j()},T.append(fe)}N.append(T);let Q=l("div","br-stack");if(N.append(Q),s==="cloudflare")ve(Q,{label:"Account ID",value:k.accountId,placeholder:"Cloudflare dashboard -> Overview",onChange:(L)=>k.accountId=L}),ve(Q,{label:"API Token",value:k.apiToken,password:!0,placeholder:"Cloudflare Workers edit permissions",onChange:(L)=>k.apiToken=L}),ve(Q,{label:"Worker Name",value:k.projectName,placeholder:"blackrouter-relay (optional)",onChange:(L)=>k.projectName=L});else if(s==="vercel")ve(Q,{label:"Vercel API Token",value:Y.vercelToken,password:!0,placeholder:"Account Settings -> Tokens",onChange:(L)=>Y.vercelToken=L}),ve(Q,{label:"Project Name",value:Y.projectName,placeholder:"blackrouter-relay (optional)",onChange:(L)=>Y.projectName=L});else if(s==="deno")ve(Q,{label:"Deno Access Token",value:B.denoToken,password:!0,placeholder:"Deno Deploy -> Access Tokens",onChange:(L)=>B.denoToken=L}),ve(Q,{label:"Organization / Subdomain",value:B.orgDomain,placeholder:"your-org.deno.dev",onChange:(L)=>B.orgDomain=L}),ve(Q,{label:"Project Name",value:B.projectName,placeholder:"blackrouter-relay (optional)",onChange:(L)=>B.projectName=L});else if(s==="netlify")ve(Q,{label:"Netlify Personal Access Token",value:X.netlifyToken,password:!0,placeholder:"User Settings -> Applications",onChange:(L)=>X.netlifyToken=L}),ve(Q,{label:"Site Name",value:X.projectName,placeholder:"blackrouter-relay (optional)",onChange:(L)=>X.projectName=L});else if(s==="http")ve(Q,{label:"Proxy Name",value:u.name,placeholder:"e.g. Clash / Corporate Proxy",onChange:(L)=>u.name=L}),ve(Q,{label:"Proxy URL",value:u.proxyUrl,placeholder:"http://127.0.0.1:7890 or http://user:pass@host:port",onChange:(L)=>u.proxyUrl=L});let He=l("div","br-row");if(H(He,a?"Saving...":s==="http"?"Add Proxy":"Deploy & Activate",()=>void h(),"primary"),s!=="http")H(He,"Copy Standalone Script",()=>void W(s));H(He,"Cancel",()=>{o=!1,j()}),N.append(He),n.append(N)}let{card:Me}=Ce(n,"Configured Proxy Pools",x==="single"?'Manage deployed relays. Click "Set Primary" to route calls through that relay.':"Manage deployed relays. Toggle relays to include or exclude them from the active rotation pool.");if(b.config.proxyPools.length===0){let N=l("p","br-card-desc","No proxy pools configured. Deploy one using the button above to route through Cloudflare, Vercel, Deno, Netlify, or Forward Proxy.");Me.append(N)}else{let N=l("div","br-pool-grid");for(let T of b.config.proxyPools){let Q=b.config.activePoolId?T.id===b.config.activePoolId:T.isActive,He=x==="single"?Q:T.isActive,L=l("div",`br-pool-card ${He?"active":""}`),fe=l("div","br-pool-left"),xe=l("div","br-pool-info"),gt=l("div","br-pool-title-row");if(gt.append(l("span","br-pool-name",T.name)),gt.append(l("span","br-badge br-badge-neutral",T.type==="http"?"Forward Proxy":`${T.type} Relay`)),T.testStatus==="active")gt.append(l("span","br-badge br-badge-running","Healthy"));else if(T.testStatus==="error")gt.append(l("span","br-badge br-badge-stopped","Failed"));xe.append(gt),xe.append(l("span","br-pool-url",T.proxyUrl)),fe.append(xe),L.append(fe);let Ze=l("div","br-pool-actions");if(x==="single")H(Ze,Q?"Primary ✓":"Set Primary",()=>void le(T),Q?"primary":"default");else H(Ze,T.isActive?"In Rotation ✓":"Add to Rotation",()=>void S(T),T.isActive?"primary":"default");let nn=d===T.id,no=H(Ze,nn?"Testing...":"Test",()=>void Z(T.id));if(no.disabled=nn,T.type!=="http")H(Ze,"Copy Script",()=>void W(T.type));H(Ze,"Delete",()=>void Se(T.id),"destructive"),L.append(Ze),N.append(L)}Me.append(N)}};return{element:n,render:j}};var Jn=(e,t,r,n)=>{let o=Ke(document.createElement("div")),s="",a=!1,c=!1,d="",u=(A)=>{s=String(A.config.port)},k=async(A,W)=>{try{await r.writeClipboard(A),await r.toast({kind:"success",message:`${W} copied.`})}catch{d="The clipboard refused the copy.",X()}},Y=async()=>{let A=Number(s);if(!Number.isInteger(A)||A<1024||A>65535){d="The port must be a whole number between 1024 and 65535.",X();return}d="",await e.run((h)=>h.patchConfig({port:A}));let W=e.state();if(W)u(W);X()},B=async()=>{d="",await e.run((A)=>A.rotateKey()),await r.toast({kind:"success",message:"New API key generated and saved."}),X()},X=()=>{o.replaceChildren();let A=e.state();if(!A){if(e.error()){xt(o,{title:"Local service is not reachable",body:"Allow the local service for BlackRouter in Settings -> Extensions, then retry.",action:{label:"Retry",onClick:()=>{e.load()}}});return}let R=Hn(o);Gr(R,{label:"Connecting to local service..."});return}if(!a)u(A),a=!0;if(!A.running){let R=l("div");o.append(R),we(R,{tone:"error",title:"Router listener is not active",body:A.routerError||"The listener did not start. Change the port below and save."})}if(d){let R=l("div");o.append(R),we(R,{tone:"error",title:"Action failed",body:d})}let{card:W}=Ce(o,"Connection & Endpoint","OpenCode and any OpenAI-compatible client connect to this loopback address."),h=l("div","br-kv-grid");W.append(h);let S=l("div","br-kv-box");S.append(l("span","br-kv-label","Base URL (Endpoint)"));let z=l("div","br-kv-val");z.append(l("span","br-kv-text",A.endpoint)),H(z,"Copy URL",()=>void k(A.endpoint,"Endpoint")),S.append(z),h.append(S);let ie=l("div","br-kv-box");ie.append(l("span","br-kv-label","API Key"));let le=l("div","br-kv-val");le.append(l("span","br-kv-text",c?A.config.apiKey:`${A.config.apiKey.slice(0,7)}••••••••••••••••`));let q=l("div","br-row");H(q,c?"Hide":"Reveal",()=>{c=!c,X()}),H(q,"Copy",()=>void k(A.config.apiKey,"API key")),H(q,"Rotate",()=>void B()),le.append(q),ie.append(le),h.append(ie);let Se=l("div","br-kv-box");Se.append(l("span","br-kv-label","Listening Port"));let Z=l("div","br-kv-val"),j=l("input","br-search-input br-mono");j.type="number",j.value=s,j.style.maxWidth="110px",j.oninput=()=>{s=j.value,b.disabled=s===String(A.config.port)},Z.append(j);let b=H(Z,"Save Port",()=>void Y(),"primary");b.disabled=s===String(A.config.port),Se.append(Z),h.append(Se);let x=l("div","br-kv-box");x.append(l("span","br-kv-label","RTK Token Saver"));let pe=l("div","br-kv-val");Lr(pe,{label:A.config.rtkEnabled!==!1?"Enabled":"Disabled",description:"Compacts git diff, status, and grep tool outputs (saves ~30% tokens)",checked:A.config.rtkEnabled!==!1,onChange:(R)=>{e.run((J)=>J.patchConfig({rtkEnabled:R}))}}),x.append(pe),h.append(x);let{card:he}=Ce(o,"Upstream Routing","Traffic to OpenCode Zen can route directly or through a serverless proxy pool."),ge=A.config.proxyStrategy||"single",i=A.config.proxyPools.filter((R)=>R.isActive),p=A.config.activePoolId?i.find((R)=>R.id===A.config.activePoolId)||i[0]:i[0],P=l("div","br-pool-card active"),G=l("div","br-pool-left"),_=l("div","br-pool-info"),g=l("div","br-pool-title-row");if(ge==="round-robin")g.append(l("span","br-pool-name","Round-Robin Rotation")),g.append(l("span","br-badge br-badge-running",`${i.length} Pools`)),_.append(g),_.append(l("span","br-pool-url",`Sequential rotation with sticky turn limit ${A.config.stickyLimit||1}`));else if(ge==="random")g.append(l("span","br-pool-name","Random Upstream Routing")),g.append(l("span","br-badge br-badge-primary",`${i.length} Pools`)),_.append(g),_.append(l("span","br-pool-url","Uniform random distribution across active proxy pools"));else if(p){g.append(l("span","br-pool-name",p.name));let R=l("span","br-badge br-badge-primary",p.type);g.append(R),_.append(g),_.append(l("span","br-pool-url",p.proxyUrl))}else{g.append(l("span","br-pool-name","Direct Routing"));let R=l("span","br-badge br-badge-neutral","Direct");g.append(R),_.append(g),_.append(l("span","br-pool-url","Direct requests from this machine to https://opencode.ai/zen/v1"))}G.append(_),P.append(G);let ye=l("div","br-pool-actions");if(n)H(ye,"Manage Proxy Pools",()=>n("proxy-pools"));P.append(ye),he.append(P);let{card:re}=Ce(o,"Recent Calls","The last requests answered by this router. Kept in memory.");if(A.requests.length===0){let R=l("p","br-card-desc","No requests yet. Calls from OpenCode or other clients will appear here.");re.append(R)}else{let R=l("div");for(let J of A.requests.slice(0,8)){let Me=l("div","br-call-row"),N=l("div","br-call-left"),T=l("span",`br-badge ${J.status>=200&&J.status<300?"br-badge-running":"br-badge-stopped"}`,String(J.status));if(N.append(T),N.append(l("span","br-call-name",J.model||J.path)),J.poolName)N.append(l("span","br-badge br-badge-neutral",J.poolName));Me.append(N),Me.append(l("span","br-call-ms",`${J.ms}ms`)),R.append(Me)}re.append(R)}};return{element:o,render:X}};var ht=Cr(),Yn=document.querySelector("#root");if(!Yn)throw Error("Missing root");var Wn=document.createElement("style");Wn.textContent=Bn;document.head.append(Wn);ht.onReady((e)=>Rr(e,document.documentElement));var ar=jn(ht),ke=zn(ar),$t=document.createElement("div");$t.className="br-root";Yn.replaceChildren($t);var Xr=document.createElement("header");Xr.className="br-header";var Kr=document.createElement("div");Kr.className="br-header-left";var Jr=document.createElement("div");Jr.className="br-logo-box";Jr.textContent="⚡";var Yr=document.createElement("div");Yr.className="br-header-titles";var Wr=document.createElement("div");Wr.className="br-title-row";var qn=document.createElement("h1");qn.textContent="BlackRouter";var Nt=document.createElement("span");Nt.className="br-badge br-badge-neutral";Nt.textContent="Connecting...";Wr.append(qn,Nt);var qr=document.createElement("p");qr.className="br-header-sub";qr.textContent="OpenCode Zen Local Endpoint & Proxy Pools";Yr.append(Wr,qr);Kr.append(Jr,Yr);var Qr=document.createElement("div");Qr.className="br-header-right";var rs=Ve(Qr,{label:"Refresh",variant:"outline",size:"sm",onClick:()=>{ke.load()}});Xr.append(Kr,Qr);$t.append(Xr);var Zr=document.createElement("div");Zr.className="br-nav-bar";var Qn=document.createElement("div");Zr.append(Qn);$t.append(Zr);var ir=document.createElement("main");ir.className="br-stack";$t.append(ir);var cr=document.createElement("div");cr.hidden=!0;var ns=we(cr,{tone:"error",title:""});ir.append(cr);var sr="router",en=null,tn=(e)=>{sr=e,en?.update({activeId:sr});for(let r of rn)r.element.hidden=r.id!==e;let t=ke.state();if(e==="models"&&t&&t.models.length===0&&!ke.busy())ke.run((r)=>r.refreshModels())},Zn=Jn(ke,ar,ht,(e)=>tn(e)),eo=Kn(ke,ar,ht),to=Fn(ke,ar,ht),ro=Xn(ke,ht),rn=[{id:"router",label:"Router",element:Zn.element},{id:"proxy-pools",label:"Proxy Pools",element:eo.element},{id:"models",label:"Models",element:to.element},{id:"opencode",label:"OpenCode",element:ro.element}];for(let e of rn)ir.append(e.element);en=Ur(Qn,{items:rn.map((e)=>({id:e.id,label:e.label})),activeId:sr,onChange:tn});tn("router");var os=()=>{let e=ke.state();if(e){Nt.className=`br-badge ${e.running?"br-badge-running":"br-badge-stopped"}`,Nt.innerHTML=`<span class="br-dot ${e.running?"on":"off"}"></span> ${e.running?`127.0.0.1:${e.config.port}`:"Stopped"}`;let n=e.config.proxyPools.length,o=e.models.length,s=e.registration.installed;en?.update({activeId:sr,items:[{id:"router",label:"Router"},{id:"proxy-pools",label:n>0?`Proxy Pools (${n})`:"Proxy Pools"},{id:"models",label:o>0?`Models (${o})`:"Models"},{id:"opencode",label:s?"OpenCode ✓":"OpenCode"}]})}let t=ke.error(),r=Boolean(t)&&e!==null;if(cr.hidden=!r,t&&r)ns.update({tone:"error",title:"Local service notice",body:t});rs.update({loading:ke.busy()}),Zn.render(),eo.render(),to.render(),ro.render()};ke.subscribe(os);ke.load();setInterval(()=>{ke.poll()},30000);})();
