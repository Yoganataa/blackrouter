(()=>{var q="openchamber.sdk",W=1;var Mr=`
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
`;var Nr=128,Lr=65536;var Oo=["file","directory","other","missing"],Ur=(e)=>Boolean(e&&"sessionId"in e),Dr=(e)=>Boolean(e&&"sent"in e&&!("sessionId"in e));var ir=500,cr=32000,Io=16000,Mo=128,No=200,Lo=2000,$o=16000,Uo=80,Do=200,Go=16000;var jo=2000;var Gr=20000,dr=1024,lr=2000000;var pr=64000,ur=8000,jr=4000;var zr=90000;var zo=999,mr=500,Bo=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED"],Ho=["stopped","starting","ready","failed"],Mn=new Set(Bo),Vo=(e)=>Mn.has(e),Fo=(e)=>e&&Vo(e)?e:"HOST_REJECTED",vt=(e)=>{if(e===void 0)return!1;if(e===null||e===!0||e===!1)return!0;if(String(e)===e)return!0;if(Number(e)===e)return Number.isFinite(e);if(Array.isArray(e))return e.every(vt);if(Object(e)===e)return Object.values(e).every(vt);return!1},Xo=(e)=>vt(e)&&JSON.stringify(e).length<=Go,Po=(e)=>e?.trim().slice(0,Do)??"",kt=(e)=>{let t=e.id.trim().slice(0,Mo),r=e.title.trim().slice(0,No),o=e.url.trim().slice(0,Lo),n=e.text?.trim().slice(0,$o),a=e.author?.trim().slice(0,Uo),s=e.kind==="pull"?"pull":"issue",d={providerId:e.providerId.trim(),id:t,title:r||t,url:o,kind:s};if(n)d.text=n;if(a)d.author=a;if(s==="pull"){let l=Po(e.branches?.head),u=Po(e.branches?.base);if(l&&u)d.branches={head:l,base:u}}if(Xo(e.data))d.data=e.data;return d},Br=(e)=>{let t=kt(e);if(e.projectId)t.projectId=e.projectId;if(e.navigation)t.navigation=e.navigation;if(e.worktree)t.worktree=e.worktree;return t},Hr=(e)=>{let t={text:e.text.trim().slice(0,Io)};if(e.send)t.send=!0;return t},Vr=(e)=>{if(e===null||!Number.isFinite(e))return null;return Math.min(zo,Math.max(0,Math.round(e)))};var _t=(e)=>e.length>0&&e.length<=dr&&!e.includes("\x00")&&!e.includes("\\");var fr=(e)=>{if(!e.startsWith("/")||e.includes("\x00")||e.includes("\\")||e.includes("://"))return!1;if(e.length>jo)return!1;return!e.split("/").some((r)=>r==="."||r==="..")},Nn=new Set(Ho),Fr=(e)=>Boolean(e&&"status"in e&&Nn.has(String(e.status))&&!("body"in e)),hr=(e)=>Boolean(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Xr=(e)=>Boolean(e&&"content"in e&&String(e.content)===e.content),Kr=(e)=>Boolean(e&&"written"in e&&e.written===!0),Jr=(e)=>Boolean(e&&"entries"in e&&Array.isArray(e.entries)),Ln=new Set(Oo),Yr=(e)=>Boolean(e&&"kind"in e&&"size"in e&&Ln.has(String(e.kind))&&Number.isFinite(e.size)),qr=(e)=>Boolean(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),$n=new Set(["workspace","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action"]),Un=(e)=>Object(e)===e?e:null,$r=(e)=>String(e)===e&&e.length>0,Dn=(e)=>{if(!$r(e.id))return null;if(e.ok===!0){let t={channel:q,v:W,type:"result",id:e.id,ok:!0};if(Object(e.payload)===e.payload)t.payload=e.payload;return t}if(e.ok===!1&&$r(e.error))return{channel:q,v:W,type:"result",id:e.id,ok:!1,error:e.error,code:Fo($r(e.code)?e.code:void 0)};return null},Wr=(e)=>{let t=Un(e);if(!t||t.channel!==q||t.v!==W)return null;if(t.type==="result")return Dn(t);if(!$n.has(String(t.type))||Object(t.payload)!==t.payload)return null;return t};class B extends Error{code;constructor(e,t){super(t);this.name="HostRequestError",this.code=e}}var Ko=()=>Promise.reject(new B("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),gr=()=>Promise.reject(new B("BAD_PATH",`File path must be 1 to ${dr} characters without NUL or backslash.`)),ne=(e)=>(e.value+=1,`oc-${e.value}`),Qr=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new B("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let r=e.acceptSource??((c)=>c===t.parent),o=e.requestTimeoutMs??Gr,n=new Set,a=new Set,s=new Set,d=new Set,l=new Set,u=new Set,b=new Set,F=null,S=null,J=new Map,Te=new Map,Ee=!1,j={value:0},R=null,y=null,ie=(c)=>{if(!c)return null;return{sessionId:c.id,phase:c.busy?"started":"completed"}},ce=(c)=>{t.parent.postMessage(c,"*")},V=(c,p)=>{for(let E of c)try{E(p)}catch(L){console.error(L)}},Ye=(c)=>{if(!(c instanceof MessageEvent))return;if(!r(c.source))return;let p=Wr(c.data);if(!p)return;if(p.type==="workspace"){let L=Te.get(p.payload.subscriptionId);if(L)V([L],p.payload.snapshot);return}if(p.type==="ready"){if(R=p.payload,y=ie(p.payload.session),V(n,p.payload),V(a,p.payload.directory),V(s,p.payload.session),y)V(d,y);V(l,p.payload.connection),V(u,p.payload.settings),V(b,p.payload.item);return}if(p.type==="directory"){if(R)R={...R,directory:p.payload.directory};V(a,p.payload.directory);return}if(p.type==="session"){if(R)R={...R,session:p.payload.session};if(!p.payload.session)y=null;else if(y?.sessionId!==p.payload.session.id)y=ie(p.payload.session);V(s,p.payload.session);return}if(p.type==="session-lifecycle"){y=p.payload,V(d,p.payload);return}if(p.type==="connection"){if(R)R={...R,connection:p.payload.connection};V(l,p.payload.connection);return}if(p.type==="settings"){if(R)R={...R,settings:p.payload.settings};V(u,p.payload.settings);return}if(p.type==="item"){if(R)R={...R,item:p.payload.item};V(b,p.payload.item);return}if(p.type==="action"){let L=(K)=>{if(!Ee)ce({channel:q,v:W,type:"action-result",id:p.id,payload:K})},ae=S;if(!ae){L({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>ae(p.payload)).then(()=>L({ok:!0}),(K)=>{let ve=(K instanceof Error?K.message:String(K)).trim();L({ok:!1,error:(ve||"Action failed.").slice(0,mr)})});return}if(p.type==="resolve"){let L=(K)=>{ce({channel:q,v:W,type:"resolve-result",id:p.id,payload:K})},ae=F;if(!ae){L({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>ae(p.payload)).then((K)=>L({item:K?kt(K):null}),(K)=>{let ve=(K instanceof Error?K.message:String(K)).trim();L({error:(ve||"Command failed.").slice(0,mr)})});return}let E=J.get(p.id);if(!E)return;if(clearTimeout(E.timer),J.delete(p.id),p.ok){E.resolve(p.payload);return}E.reject(new B(p.code,p.error))};t.addEventListener("message",Ye),ce({channel:q,v:W,type:"hello"});let ye=(c,p=o)=>{if(Ee||t.parent===t)return Promise.reject(new B("HOST_UNAVAILABLE","No host frame. This page is not in an iframe."));return new Promise((E,L)=>{let ae=setTimeout(()=>{J.delete(c.id),L(new B("HOST_TIMEOUT","Host did not answer in time."))},p);J.set(c.id,{resolve:E,reject:L,timer:ae}),ce(c)})},Q=(c)=>ye(c).then(()=>{return}),h={channel:q,v:W},m=(c,p=1024)=>{if(!c.trim()||c.length>p)throw new B("HOST_REJECTED",`Identity must contain 1 to ${p} characters.`)},M=async(c)=>{if(c.kind!=="projects")m(c.projectId);let p=await ye({...h,type:"workspace-read",id:ne(j),payload:c});if(!p||!("kind"in p)||!("state"in p)||p.kind!==c.kind)throw new B("HOST_REJECTED","Host did not return workspace data.");return p},X=async(c,p)=>{if(c.kind!=="projects")m(c.projectId);let E=ne(j);Te.set(E,p);try{await Q({...h,type:"workspace-subscribe",id:ne(j),payload:{subscriptionId:E,query:c}})}catch(L){if(Te.delete(E),!Ee)ce({...h,type:"workspace-unsubscribe",id:ne(j),payload:{subscriptionId:E}});throw L}return()=>{if(!Te.delete(E)||Ee)return;ce({...h,type:"workspace-unsubscribe",id:ne(j),payload:{subscriptionId:E}})}},fe=async(c)=>{if("key"in c&&(c.key.length===0||c.key.length>Nr))throw new B("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(c.op==="set"&&!vt(c.value))throw new B("HOST_REJECTED","Storage values must be JSON.");if(c.op==="set"&&new TextEncoder().encode(JSON.stringify(c.value)).length>Lr)throw new B("HOST_REJECTED","Storage value exceeds 64 KiB.");let p=await ye({...h,type:"storage",id:ne(j),payload:c});if(!p||!("storage"in p)||p.op!==c.op)throw new B("HOST_REJECTED","Host did not return storage data.");return p};return{onAction:(c)=>(S=c,()=>{if(S===c)S=null}),listProjects:async()=>{let c=await M({kind:"projects"});if(c.kind!=="projects")throw new B("HOST_REJECTED","Expected projects.");return c},listWorktrees:async(c)=>{let p=await M({kind:"worktrees",projectId:c});if(p.kind!=="worktrees")throw new B("HOST_REJECTED","Expected worktrees.");return p},listSessions:async(c)=>{let p=await M({kind:"sessions",projectId:c});if(p.kind!=="sessions")throw new B("HOST_REJECTED","Expected sessions.");return p},onProjects:(c)=>X({kind:"projects"},(p)=>{if(p.kind==="projects")c(p)}),onWorktrees:(c,p)=>X({kind:"worktrees",projectId:c},(E)=>{if(E.kind==="worktrees")p(E)}),onSessions:(c,p)=>X({kind:"sessions",projectId:c},(E)=>{if(E.kind==="sessions")p(E)}),openSession:async(c)=>{m(c),await Q({...h,type:"open-session",id:ne(j),payload:{sessionId:c}})},storage:{get:async(c)=>{let p=await fe({op:"get",key:c});return p.op==="get"&&p.found?p.value:void 0},set:async(c,p)=>{await fe({op:"set",key:c,value:p})},delete:async(c)=>{await fe({op:"delete",key:c})},keys:async()=>{let c=await fe({op:"keys"});if(c.op!=="keys")throw new B("HOST_REJECTED","Expected storage keys.");return c.keys}},onReady:(c)=>{if(n.add(c),R)c(R);return()=>{n.delete(c)}},onDirectory:(c)=>{if(a.add(c),R)c(R.directory);return()=>{a.delete(c)}},onSession:(c)=>{if(s.add(c),R)c(R.session);return()=>{s.delete(c)}},onSessionLifecycle:(c)=>{if(d.add(c),y)c(y);return()=>{d.delete(c)}},onConnection:(c)=>{if(l.add(c),R)c(R.connection);return()=>{l.delete(c)}},onSettings:(c)=>{if(u.add(c),R)c(R.settings);return()=>{u.delete(c)}},onItem:(c)=>{if(b.add(c),R)c(R.item);return()=>{b.delete(c)}},onResolve:(c)=>(F=c,()=>{if(F===c)F=null}),toast:(c)=>{let p=c.message.trim();if(!p||p.length>ir)return Promise.reject(new B("HOST_REJECTED",`Toast message must contain 1 to ${ir} characters.`));if(c.copy&&c.copy!==!0&&(!c.copy.text.length||c.copy.text.length>cr))return Promise.reject(new B("HOST_REJECTED",`Toast copy text must contain 1 to ${cr} characters.`));return Q({channel:q,v:W,type:"toast",id:ne(j),payload:{...c,message:p}})},openUrl:(c)=>Q({channel:q,v:W,type:"open-url",id:ne(j),payload:{url:c}}),openSurface:(c)=>Q({channel:q,v:W,type:"open-surface",id:ne(j),payload:{surfaceId:c}}),writeClipboard:(c)=>Q({channel:q,v:W,type:"clipboard-write",id:ne(j),payload:{text:c}}),compose:(c)=>Q({channel:q,v:W,type:"compose",id:ne(j),payload:c}),attach:(c)=>Q({channel:q,v:W,type:"attach",id:ne(j),payload:kt(c)}),startSession:async(c)=>{if(c.projectId!==void 0)m(c.projectId);let p=c.worktree;if(p&&p!==!0)if(p.kind==="existing")m(p.directory);else{if(p.name!==void 0)m(p.name,200);if(p.baseBranch!==void 0)m(p.baseBranch,200)}let E=await ye({channel:q,v:W,type:"start-session",id:ne(j),payload:Br(c)},e.requestTimeoutMs??180000);if(!Ur(E))throw new B("HOST_REJECTED","Host did not return a session.");return E},prompt:(c)=>ye({channel:q,v:W,type:"prompt",id:ne(j),payload:Hr(c)}).then((p)=>{if(!Dr(p))throw new B("HOST_REJECTED","Host did not return a prompt result.");return p}),sessionLink:(c)=>Q({channel:q,v:W,type:"session-link",id:ne(j),payload:kt(c)}),close:()=>Q({channel:q,v:W,type:"close",id:ne(j)}),oauthStart:()=>Q({channel:q,v:W,type:"oauth-start",id:ne(j)}),oauthDisconnect:()=>Q({channel:q,v:W,type:"oauth-disconnect",id:ne(j)}),request:(c)=>(fr(c.path)?ye({channel:q,v:W,type:"request",id:ne(j),payload:c}):Ko()).then((p)=>{if(!hr(p))throw new B("HOST_REJECTED","Host request result was empty.");return p}),serviceRequest:(c)=>(fr(c.path)?ye({channel:q,v:W,type:"service-request",id:ne(j),payload:c}):Ko()).then((p)=>{if(!hr(p))throw new B("HOST_REJECTED","Host service request result was empty.");return p}),serviceStatus:()=>ye({channel:q,v:W,type:"service-status",id:ne(j)}).then((c)=>{if(!Fr(c))throw new B("HOST_REJECTED","Host did not return service status.");return c}),readFile:(c)=>(_t(c)?ye({channel:q,v:W,type:"file-read",id:ne(j),payload:{path:c}}):gr()).then((p)=>{if(!Xr(p))throw new B("HOST_REJECTED","Host did not return file content.");return p}),writeFile:(c,p)=>{if(!_t(c))return gr();if(p.length>lr)return Promise.reject(new B("FILE_TOO_LARGE",`Content is over ${lr} characters.`));return ye({channel:q,v:W,type:"file-write",id:ne(j),payload:{path:c,content:p}}).then((E)=>{if(!Kr(E))throw new B("HOST_REJECTED","Host did not confirm the write.");return E})},listDir:(c)=>(_t(c)?ye({channel:q,v:W,type:"file-list",id:ne(j),payload:{path:c}}):gr()).then((p)=>{if(!Jr(p))throw new B("HOST_REJECTED","Host did not return directory entries.");return p}),stat:(c)=>(_t(c)?ye({channel:q,v:W,type:"file-stat",id:ne(j),payload:{path:c}}):gr()).then((p)=>{if(!Yr(p))throw new B("HOST_REJECTED","Host did not return file status.");return p}),generate:(c)=>{let p=c.prompt.trim(),E=c.system?.trim();if(p.length===0||p.length>pr)return Promise.reject(new B("HOST_REJECTED",`Prompt must be 1 to ${pr} characters.`));if(E!==void 0&&(E.length===0||E.length>ur))return Promise.reject(new B("HOST_REJECTED",`System prompt must be 1 to ${ur} characters.`));let L=c.maxOutputTokens===void 0?void 0:Math.min(jr,Math.max(1,Math.floor(c.maxOutputTokens)));if(L!==void 0&&!Number.isFinite(L))return Promise.reject(new B("HOST_REJECTED","maxOutputTokens must be a number."));let ae={prompt:p};if(E!==void 0)ae.system=E;if(L!==void 0)ae.maxOutputTokens=L;return ye({channel:q,v:W,type:"generate",id:ne(j),payload:ae},e.requestTimeoutMs??zr).then((K)=>{if(!qr(K))throw new B("HOST_REJECTED","Host did not return generated text.");return K})},setBadge:(c)=>Q({channel:q,v:W,type:"badge",id:ne(j),payload:{count:Vr(c)}}),dispose:()=>{for(let c of Te.keys())ce({...h,type:"workspace-unsubscribe",id:ne(j),payload:{subscriptionId:c}});Te.clear(),Ee=!0,F=null,S=null,t.removeEventListener("message",Ye);for(let c of J.values())clearTimeout(c.timer),c.reject(new B("HOST_UNAVAILABLE","Host client was disposed."));J.clear(),n.clear(),a.clear(),s.clear(),d.clear(),l.clear(),u.clear(),b.clear()}}};var Gn=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Jo=(e,t)=>{t.style.colorScheme=e.mode;for(let[r,o]of Gn)t.style.setProperty(r,e.tokens[o]);t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size","0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},Zr=(e,t)=>{if(Jo(e.theme,t),t.dataset)t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode};var wt=(e)=>{while(e.firstChild)e.removeChild(e.firstChild)},he=(e)=>{let t=document.getElementById("oc-sdk-ui-style");if(t instanceof HTMLStyleElement){if(t.textContent!==e)t.textContent=e;return}let r=document.createElement("style");r.id="oc-sdk-ui-style",r.textContent=e,document.head.appendChild(r)},G=(e,t)=>{let r=document.createElement(e);if(t)r.className=t;return r},Qe=(e)=>{let t=G("button",e);return t.type="button",t},_e=(e,t)=>{let r=t??"";if(e.textContent!==r)e.textContent=r},St=(e,t,r)=>{if(r===void 0||r===null||r==="")e.removeAttribute(t);else if(e.getAttribute(t)!==r)e.setAttribute(t,r)};var jn={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},pe=(e,t)=>`var(--${e}, var(--oc-${jn[e]}, ${t}))`,mt=pe("surface-background","transparent"),br=pe("surface-elevated","transparent"),Dt=pe("surface-elevated-foreground","inherit"),Gt=pe("surface-foreground","inherit"),ge=pe("surface-muted-foreground","gray"),zn=pe("surface-muted","transparent"),Fe=pe("interactive-border","currentColor"),je=pe("interactive-hover","transparent"),ft=pe("interactive-active","transparent"),eo=pe("interactive-selection","transparent"),to=pe("interactive-selection-foreground","inherit"),Wo=pe("interactive-focus-ring","currentColor"),Xe=pe("primary","currentColor"),ro=pe("primary-text","inherit"),oo=pe("error-text","inherit"),Bn=pe("font-sans","inherit"),no=pe("font-mono","monospace"),Yo=pe("radius","9px"),Se=(e,t,r="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${r})`,qo=`box-shadow: 0 0 0 2px ${Wo};`,xr=(e)=>{let t=pe(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${pe(`${e}-text`,"inherit")}; }`},be=`
${Mr}
.oc-sdk { box-sizing: border-box; color: ${Gt}; font-family: ${Bn}; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }
.oc-sdk :focus-visible { outline: none; ${qo} }
.oc-sdk-mono { font-family: ${no}; }
.oc-sdk-muted { color: ${ge}; }
${xr("success")}${xr("warning")}${xr("error")}${xr("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${Xe}; --oc-sdk-tone-text: ${ro}; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 36px; padding: 0 14px; border: 1px solid transparent; border-radius: ${Yo}; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="sm"] { height: 32px; padding: 0 10px; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { height: 24px; padding: 0 8px; font-size: 0.75rem; border-radius: 6px; }
.oc-sdk-btn[data-variant="default"] { color: ${ro}; background: ${Se(Xe,10,mt)}; border-color: ${Se(Xe,12)}; }
.oc-sdk-btn[data-variant="default"]:hover { background: ${Se(Xe,16,mt)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${Se(Xe,22,mt)}; }
.oc-sdk-btn[data-variant="secondary"] { background: ${zn}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${je}, ${je}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${ft}, ${ft}); }
.oc-sdk-btn[data-variant="outline"] { background: ${br}; color: ${Dt}; border-color: ${Fe}; }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${je}, ${je}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${ft}, ${ft}); }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${je}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${ft}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${pe("status-error","red")}; color: ${oo}; background: ${Se("var(--oc-sdk-tone)",7,mt)}; border-color: ${Se("var(--oc-sdk-tone)",12)}; }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${Se("var(--oc-sdk-tone)",9,mt)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${Se("var(--oc-sdk-tone)",11,mt)}; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: 14px; height: 14px; }

.oc-sdk-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; color: ${ge}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${oo}; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: 36px; padding: 0 12px; border: 0; border-radius: ${Yo}; background: ${br}; color: ${Dt}; font-size: 0.875rem; line-height: 1.45; appearance: none; box-shadow: inset 0 0 0 1px ${Se(Fe,60)}; transition: background 150ms ease-out, box-shadow 150ms ease-out; }
textarea.oc-sdk-input { height: auto; padding: 8px 12px; resize: vertical; }
.oc-sdk-input::placeholder { color: ${ge}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${je}, ${je}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { box-shadow: inset 0 0 0 2px ${Wo}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input { box-shadow: inset 0 0 0 1px ${pe("status-error","red")}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { box-shadow: inset 0 0 0 2px ${pe("status-error","red")}; }
.oc-sdk-input[data-mono="true"] { font-family: ${no}; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: 34px; padding-right: 34px; }
.oc-sdk-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: ${ge}; pointer-events: none; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${Xe}; }
.oc-sdk-search-clear { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; color: ${ge}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }
.oc-sdk-search-clear:hover { background: ${je}; color: ${Gt}; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: 6px; width: 100%; min-width: 0; height: 32px; padding: 0 8px 0 10px; border: 1px solid ${Fe}; border-radius: 6px; background: ${br}; color: ${Dt}; font-size: 0.8125rem; text-align: left; transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${je}, ${je}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${ft}, ${ft}); }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-value[data-empty="true"] { color: ${ge}; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; color: ${ge}; }
.oc-sdk-popup { --surface-foreground: ${Dt}; position: fixed; z-index: 50; display: flex; flex-direction: column; gap: 2px; min-width: 160px; max-width: calc(100vw - 16px); max-height: min(320px, calc(100vh - 16px)); overflow: auto; padding: 4px; border: 1px solid ${Se(Fe,60)}; border-radius: 12px; background: ${br}; color: ${Dt}; box-shadow: 0 8px 24px ${Se(Gt,12)}; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: 2px 2px 4px; }
.oc-sdk-popup-search .oc-sdk-input { height: 32px; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; border-radius: 8px; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option[data-active="true"] { background: ${je}; }
.oc-sdk-option[aria-selected="true"] { background: ${eo}; color: ${to}; }
.oc-sdk-option[data-destructive="true"] { color: ${oo}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${Se(pe("status-error","red"),10)}; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; color: ${ge}; }
.oc-sdk-option-check { flex: 0 0 auto; width: 12px; }
.oc-sdk-popup-empty { padding: 8px; font-size: 0.8125rem; color: ${ge}; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: 8px; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; margin-top: 3px; border: 1px solid ${Fe}; border-radius: 4px; color: ${Xe}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${Se(Xe,65,Fe)}; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: 36px; height: 20px; border-radius: 9999px; background: ${Fe}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 9999px; background: ${mt}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${Xe}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${qo} }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; color: ${ge}; }

.oc-sdk-tabs { display: inline-flex; gap: 2px; padding: 2px; border-radius: 10px; max-width: 100%; overflow: auto; }
.oc-sdk-tabs[data-track="true"] { background: ${Se(Gt,4)}; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border: 1px solid transparent; border-radius: 8px; font-size: 0.8125rem; font-weight: 500; color: ${ge}; white-space: nowrap; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${Gt}; }
.oc-sdk-tab[aria-selected="true"] { color: ${to}; background: ${eo}; border-color: ${Fe}; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; color: ${ge}; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: 1px 6px; border-radius: 9999px; font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; background: ${je}; color: ${ge}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${Se("var(--oc-sdk-tone)",15)}; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; border-radius: 6px; text-align: left; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${je}; }
.oc-sdk-row[aria-selected="true"] { background: ${eo}; color: ${to}; }
.oc-sdk-row-lead { flex: 0 0 auto; width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: ${no}; font-size: 0.75rem; color: ${ge}; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; color: ${ge}; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; color: ${ge}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { padding: 16px 8px; text-align: center; font-size: 0.8125rem; color: ${ge}; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 40px 16px; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; color: ${ge}; }
.oc-sdk-empty-action { margin-top: 12px; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: ${ge}; }
.oc-sdk-spinner-ring { width: 16px; height: 16px; border: 2px solid ${Fe}; border-top-color: ${Xe}; border-radius: 9999px; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: 12px; height: 12px; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: 12px; padding: 8px 12px; border: 1px solid ${Se("var(--oc-sdk-tone)",40)}; border-radius: 8px; background: ${Se("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { font-size: 0.8125rem; color: ${ge}; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: 8px; width: 100%; margin: 8px 0; font-size: 0.75rem; color: ${ge}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; background: ${Se(Fe,40)}; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: 4px 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; color: ${ge}; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: 6px; border-radius: 9999px; background: ${Fe}; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; border-radius: 9999px; background: var(--oc-sdk-tone, ${Xe}); transform-origin: left; transition: transform 200ms ease-out; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text a { color: ${ro}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { display: block; max-width: 100%; margin: 8px 0; border-radius: 8px; border: 1px solid ${Se(Fe,60)}; }
`;var Hn=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},dt=(e,t)=>{he(be);let r=t,o=Qe("oc-sdk oc-sdk-btn"),n=Hn(),a=document.createElement("span");o.append(a),e.append(o);let s=()=>{if(o.dataset.variant=r.variant??"default",o.dataset.size=r.size??"default",o.disabled=Boolean(r.disabled)||Boolean(r.loading),o.dataset.loading=r.loading?"true":"false",o.setAttribute("aria-busy",r.loading?"true":"false"),r.loading&&n.parentNode!==o)o.prepend(n);else if(!r.loading&&n.parentNode===o)n.remove();_e(a,r.label)},d=()=>{if(r.disabled||r.loading)return;r.onClick()};return o.addEventListener("click",d),s(),{update:(l)=>{r={...r,...l},s()},dispose:()=>{o.removeEventListener("click",d),o.remove()}}};var Le=(e,t)=>{he(be);let r=t,o=G("label","oc-sdk oc-sdk-field"),n=G("span","oc-sdk-field-label"),a=r.multiline?G("textarea","oc-sdk-input"):G("input","oc-sdk-input"),s=G("span","oc-sdk-field-note");o.append(n,a,s),e.append(o);let d=()=>{if(_e(n,r.label),n.hidden=!r.label,a instanceof HTMLInputElement)a.type=r.password?"password":"text";else a.rows=r.rows??3;if(a.value!==r.value)a.value=r.value;a.disabled=Boolean(r.disabled),St(a,"placeholder",r.placeholder),a.dataset.mono=r.mono?"true":"false";let u=Boolean(r.error);o.dataset.invalid=u?"true":"false",a.setAttribute("aria-invalid",u?"true":"false");let b=r.error??r.helper??"";_e(s,b),s.hidden=b===""},l=()=>{r.onChange(a.value)};return a.addEventListener("input",l),d(),{update:(u)=>{r={...r,...u},d()},dispose:()=>{a.removeEventListener("input",l),o.remove()}}};var Vn={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},yr=(e,t,r)=>{let o=document.createElementNS("http://www.w3.org/2000/svg","svg");if(o.setAttribute("viewBox","0 0 24 24"),o.setAttribute("width",String(t)),o.setAttribute("height",String(t)),o.setAttribute("aria-hidden","true"),o.setAttribute("fill","currentColor"),r)o.setAttribute("class",r);let n=document.createElementNS("http://www.w3.org/2000/svg","path");return n.setAttribute("d",Vn[e]),o.append(n),o};var Tt=(e,t="vertical")=>{let[r,o]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];if(e.key===r||e.ctrlKey&&e.key.toLowerCase()==="n")return"next";if(e.key===o||e.ctrlKey&&e.key.toLowerCase()==="p")return"previous";if(e.key==="Home")return"first";if(e.key==="End")return"last";return null},Et=(e,t,r)=>{let o=e.filter((l)=>!l.disabled);if(o.length===0)return null;let n=o[0],a=o[o.length-1];if(r==="first"||!n||!a)return n?.id??null;if(r==="last")return a.id;let s=o.findIndex((l)=>l.id===t);if(s===-1)return r==="next"?n.id:a.id;return o[Math.min(o.length-1,Math.max(0,s+(r==="next"?1:-1)))]?.id??null};var Qo=(e,t,r)=>{he(be);let o=t,n=Qe("oc-sdk oc-sdk-check");n.setAttribute("role",r);let a=G("span",r==="switch"?"oc-sdk-check-thumb":"oc-sdk-check-box");if(r==="checkbox")a.append(yr("check",12));let s=G("span","oc-sdk-check-text"),d=G("span","oc-sdk-check-label"),l=G("span","oc-sdk-check-desc");s.append(d,l),n.append(a,s),e.append(n);let u=()=>{n.setAttribute("aria-checked",o.checked?"true":"false"),n.disabled=Boolean(o.disabled),_e(d,o.label),_e(l,o.description),l.hidden=!o.description},b=()=>{if(!o.disabled)o.onChange(!o.checked)};return n.addEventListener("click",b),u(),{update:(F)=>{o={...o,...F},u()},dispose:()=>{n.removeEventListener("click",b),n.remove()}}},ao=(e,t)=>Qo(e,t,"checkbox"),so=(e,t)=>Qo(e,t,"switch");var io=(e,t)=>{he(be);let r=t,o=G("div","oc-sdk oc-sdk-tabs");o.setAttribute("role","tablist"),e.append(o);let n=()=>{wt(o),o.dataset.track=r.trackBackground?"true":"false";for(let s of r.items){let d=Qe("oc-sdk-tab");d.setAttribute("role","tab");let l=s.id===r.activeId;d.setAttribute("aria-selected",l?"true":"false"),d.tabIndex=l?0:-1,d.dataset.id=s.id;let u=G("span");if(u.textContent=s.label,d.append(u),s.count!==void 0){let b=G("span","oc-sdk-tab-count");b.textContent=String(s.count),d.append(b)}d.addEventListener("click",()=>{if(s.id!==r.activeId)r.onChange(s.id)}),o.append(d)}},a=(s)=>{let d=Tt(s,"horizontal");if(!d)return;let l=Et(r.items,r.activeId,d);if(l&&l!==r.activeId){s.preventDefault(),r.onChange(l);let u=o.querySelector(`[data-id="${CSS.escape(l)}"]`);if(u instanceof HTMLElement)u.focus()}};return o.addEventListener("keydown",a),n(),{update:(s)=>{r={...r,...s},n()},dispose:()=>{o.removeEventListener("keydown",a),o.remove()}}};var jt=(e,t)=>{he(be);let r=t,o=G("div","oc-sdk oc-sdk-empty"),n=G("h2","oc-sdk-empty-title"),a=G("p","oc-sdk-empty-body"),s=G("div","oc-sdk-empty-action");o.append(n,a,s),e.append(o);let d=null,l=()=>{if(_e(n,r.title),_e(a,r.body),a.hidden=!r.body,s.hidden=!r.action,!r.action){d?.dispose(),d=null;return}let u={label:r.action.label,onClick:r.action.onClick};if(d)d.update(u);else d=dt(s,{...u,variant:"outline",size:"sm"})};return l(),{update:(u)=>{r={...r,...u},l()},dispose:()=>{d?.dispose(),d=null,o.remove()}}};var co=(e,t={})=>{he(be);let r=t,o=G("span","oc-sdk oc-sdk-spinner");o.setAttribute("role","status");let n=G("span","oc-sdk-spinner-ring");n.setAttribute("aria-hidden","true");let a=G("span");o.append(n,a),e.append(o);let s=()=>{o.dataset.size=r.size??"default",_e(a,r.label),a.hidden=!r.label,o.setAttribute("aria-label",r.label??"Loading")};return s(),{update:(d)=>{r={...r,...d},s()},dispose:()=>{o.remove()}}};var ze=(e,t)=>{he(be);let r=t,o=G("div","oc-sdk oc-sdk-banner"),n=G("div","oc-sdk-banner-text"),a=G("div","oc-sdk-banner-title"),s=G("div","oc-sdk-banner-body"),d=G("div","oc-sdk-banner-action");n.append(a,s),o.append(n,d),e.append(o);let l=null,u=()=>{if(o.dataset.tone=r.tone,o.setAttribute("role",r.tone==="error"||r.tone==="warning"?"alert":"status"),_e(a,r.title),_e(s,r.body),s.hidden=!r.body,d.hidden=!r.action,!r.action){l?.dispose(),l=null;return}let b={label:r.action.label,onClick:r.action.onClick};if(l)l.update(b);else l=dt(d,{...b,variant:"outline",size:"xs"})};return u(),{update:(b)=>{r={...r,...b},u()},dispose:()=>{l?.dispose(),l=null,o.remove()}}};var H;(function(e){e.assertEqual=(n)=>{};function t(n){}e.assertIs=t;function r(n){throw Error()}e.assertNever=r,e.arrayToEnum=(n)=>{let a={};for(let s of n)a[s]=s;return a},e.getValidEnumValues=(n)=>{let a=e.objectKeys(n).filter((d)=>typeof n[n[d]]!=="number"),s={};for(let d of a)s[d]=n[d];return e.objectValues(s)},e.objectValues=(n)=>e.objectKeys(n).map(function(a){return n[a]}),e.objectKeys=typeof Object.keys==="function"?(n)=>Object.keys(n):(n)=>{let a=[];for(let s in n)if(Object.prototype.hasOwnProperty.call(n,s))a.push(s);return a},e.find=(n,a)=>{for(let s of n)if(a(s))return s;return},e.isInteger=typeof Number.isInteger==="function"?(n)=>Number.isInteger(n):(n)=>typeof n==="number"&&Number.isFinite(n)&&Math.floor(n)===n;function o(n,a=" | "){return n.map((s)=>typeof s==="string"?`'${s}'`:s).join(a)}e.joinValues=o,e.jsonStringifyReplacer=(n,a)=>{if(typeof a==="bigint")return a.toString();return a}})(H||(H={}));var Zo;(function(e){e.mergeShapes=(t,r)=>({...t,...r})})(Zo||(Zo={}));var x=H.arrayToEnum(["string","nan","number","integer","float","boolean","date","bigint","symbol","function","undefined","null","array","object","unknown","promise","void","never","map","set"]),ot=(e)=>{switch(typeof e){case"undefined":return x.undefined;case"string":return x.string;case"number":return Number.isNaN(e)?x.nan:x.number;case"boolean":return x.boolean;case"function":return x.function;case"bigint":return x.bigint;case"symbol":return x.symbol;case"object":if(Array.isArray(e))return x.array;if(e===null)return x.null;if(e.then&&typeof e.then==="function"&&e.catch&&typeof e.catch==="function")return x.promise;if(typeof Map<"u"&&e instanceof Map)return x.map;if(typeof Set<"u"&&e instanceof Set)return x.set;if(typeof Date<"u"&&e instanceof Date)return x.date;return x.object;default:return x.unknown}};var f=H.arrayToEnum(["invalid_type","invalid_literal","custom","invalid_union","invalid_union_discriminator","invalid_enum_value","unrecognized_keys","invalid_arguments","invalid_return_type","invalid_date","invalid_string","too_small","too_big","invalid_intersection_types","not_multiple_of","not_finite"]);class Be extends Error{get errors(){return this.issues}constructor(e){super();this.issues=[],this.addIssue=(r)=>{this.issues=[...this.issues,r]},this.addIssues=(r=[])=>{this.issues=[...this.issues,...r]};let t=new.target.prototype;if(Object.setPrototypeOf)Object.setPrototypeOf(this,t);else this.__proto__=t;this.name="ZodError",this.issues=e}format(e){let t=e||function(n){return n.message},r={_errors:[]},o=(n)=>{for(let a of n.issues)if(a.code==="invalid_union")a.unionErrors.map(o);else if(a.code==="invalid_return_type")o(a.returnTypeError);else if(a.code==="invalid_arguments")o(a.argumentsError);else if(a.path.length===0)r._errors.push(t(a));else{let s=r,d=0;while(d<a.path.length){let l=a.path[d];if(d!==a.path.length-1)s[l]=s[l]||{_errors:[]};else s[l]=s[l]||{_errors:[]},s[l]._errors.push(t(a));s=s[l],d++}}};return o(this),r}static assert(e){if(!(e instanceof Be))throw Error(`Not a ZodError: ${e}`)}toString(){return this.message}get message(){return JSON.stringify(this.issues,H.jsonStringifyReplacer,2)}get isEmpty(){return this.issues.length===0}flatten(e=(t)=>t.message){let t={},r=[];for(let o of this.issues)if(o.path.length>0){let n=o.path[0];t[n]=t[n]||[],t[n].push(e(o))}else r.push(e(o));return{formErrors:r,fieldErrors:t}}get formErrors(){return this.flatten()}}Be.create=(e)=>new Be(e);var Yn=(e,t)=>{let r;switch(e.code){case f.invalid_type:if(e.received===x.undefined)r="Required";else r=`Expected ${e.expected}, received ${e.received}`;break;case f.invalid_literal:r=`Invalid literal value, expected ${JSON.stringify(e.expected,H.jsonStringifyReplacer)}`;break;case f.unrecognized_keys:r=`Unrecognized key(s) in object: ${H.joinValues(e.keys,", ")}`;break;case f.invalid_union:r="Invalid input";break;case f.invalid_union_discriminator:r=`Invalid discriminator value. Expected ${H.joinValues(e.options)}`;break;case f.invalid_enum_value:r=`Invalid enum value. Expected ${H.joinValues(e.options)}, received '${e.received}'`;break;case f.invalid_arguments:r="Invalid function arguments";break;case f.invalid_return_type:r="Invalid function return type";break;case f.invalid_date:r="Invalid date";break;case f.invalid_string:if(typeof e.validation==="object")if("includes"in e.validation){if(r=`Invalid input: must include "${e.validation.includes}"`,typeof e.validation.position==="number")r=`${r} at one or more positions greater than or equal to ${e.validation.position}`}else if("startsWith"in e.validation)r=`Invalid input: must start with "${e.validation.startsWith}"`;else if("endsWith"in e.validation)r=`Invalid input: must end with "${e.validation.endsWith}"`;else H.assertNever(e.validation);else if(e.validation!=="regex")r=`Invalid ${e.validation}`;else r="Invalid";break;case f.too_small:if(e.type==="array")r=`Array must contain ${e.exact?"exactly":e.inclusive?"at least":"more than"} ${e.minimum} element(s)`;else if(e.type==="string")r=`String must contain ${e.exact?"exactly":e.inclusive?"at least":"over"} ${e.minimum} character(s)`;else if(e.type==="number")r=`Number must be ${e.exact?"exactly equal to ":e.inclusive?"greater than or equal to ":"greater than "}${e.minimum}`;else if(e.type==="bigint")r=`Number must be ${e.exact?"exactly equal to ":e.inclusive?"greater than or equal to ":"greater than "}${e.minimum}`;else if(e.type==="date")r=`Date must be ${e.exact?"exactly equal to ":e.inclusive?"greater than or equal to ":"greater than "}${new Date(Number(e.minimum))}`;else r="Invalid input";break;case f.too_big:if(e.type==="array")r=`Array must contain ${e.exact?"exactly":e.inclusive?"at most":"less than"} ${e.maximum} element(s)`;else if(e.type==="string")r=`String must contain ${e.exact?"exactly":e.inclusive?"at most":"under"} ${e.maximum} character(s)`;else if(e.type==="number")r=`Number must be ${e.exact?"exactly":e.inclusive?"less than or equal to":"less than"} ${e.maximum}`;else if(e.type==="bigint")r=`BigInt must be ${e.exact?"exactly":e.inclusive?"less than or equal to":"less than"} ${e.maximum}`;else if(e.type==="date")r=`Date must be ${e.exact?"exactly":e.inclusive?"smaller than or equal to":"smaller than"} ${new Date(Number(e.maximum))}`;else r="Invalid input";break;case f.custom:r="Invalid input";break;case f.invalid_intersection_types:r="Intersection results could not be merged";break;case f.not_multiple_of:r=`Number must be a multiple of ${e.multipleOf}`;break;case f.not_finite:r="Number must be finite";break;default:r=t.defaultError,H.assertNever(e)}return{message:r}},lt=Yn;var qn=lt;function zt(){return qn}var vr=(e)=>{let{data:t,path:r,errorMaps:o,issueData:n}=e,a=[...r,...n.path||[]],s={...n,path:a};if(n.message!==void 0)return{...n,path:a,message:n.message};let d="",l=o.filter((u)=>!!u).slice().reverse();for(let u of l)d=u(s,{data:t,defaultError:d}).message;return{...n,path:a,message:d}};function g(e,t){let r=zt(),o=vr({issueData:t,data:e.data,path:e.path,errorMaps:[e.common.contextualErrorMap,e.schemaErrorMap,r,r===lt?void 0:lt].filter((n)=>!!n)});e.common.issues.push(o)}class Re{constructor(){this.value="valid"}dirty(){if(this.value==="valid")this.value="dirty"}abort(){if(this.value!=="aborted")this.value="aborted"}static mergeArray(e,t){let r=[];for(let o of t){if(o.status==="aborted")return A;if(o.status==="dirty")e.dirty();r.push(o.value)}return{status:e.value,value:r}}static async mergeObjectAsync(e,t){let r=[];for(let o of t){let n=await o.key,a=await o.value;r.push({key:n,value:a})}return Re.mergeObjectSync(e,r)}static mergeObjectSync(e,t){let r={};for(let o of t){let{key:n,value:a}=o;if(n.status==="aborted")return A;if(a.status==="aborted")return A;if(n.status==="dirty")e.dirty();if(a.status==="dirty")e.dirty();if(n.value!=="__proto__"&&(typeof a.value<"u"||o.alwaysSet))r[n.value]=a.value}return{status:e.value,value:r}}}var A=Object.freeze({status:"aborted"}),At=(e)=>({status:"dirty",value:e}),Ie=(e)=>({status:"valid",value:e}),lo=(e)=>e.status==="aborted",po=(e)=>e.status==="dirty",ht=(e)=>e.status==="valid",Bt=(e)=>typeof Promise<"u"&&e instanceof Promise;var _;(function(e){e.errToObj=(t)=>typeof t==="string"?{message:t}:t||{},e.toString=(t)=>typeof t==="string"?t:t?.message})(_||(_={}));class Ke{constructor(e,t,r,o){this._cachedPath=[],this.parent=e,this.data=t,this._path=r,this._key=o}get path(){if(!this._cachedPath.length)if(Array.isArray(this._key))this._cachedPath.push(...this._path,...this._key);else this._cachedPath.push(...this._path,this._key);return this._cachedPath}}var en=(e,t)=>{if(ht(t))return{success:!0,data:t.value};else{if(!e.common.issues.length)throw Error("Validation failed but no issues detected.");return{success:!1,get error(){if(this._error)return this._error;let r=new Be(e.common.issues);return this._error=r,this._error}}}};function U(e){if(!e)return{};let{errorMap:t,invalid_type_error:r,required_error:o,description:n}=e;if(t&&(r||o))throw Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);if(t)return{errorMap:t,description:n};return{errorMap:(s,d)=>{let{message:l}=e;if(s.code==="invalid_enum_value")return{message:l??d.defaultError};if(typeof d.data>"u")return{message:l??o??d.defaultError};if(s.code!=="invalid_type")return{message:d.defaultError};return{message:l??r??d.defaultError}},description:n}}class z{get description(){return this._def.description}_getType(e){return ot(e.data)}_getOrReturnCtx(e,t){return t||{common:e.parent.common,data:e.data,parsedType:ot(e.data),schemaErrorMap:this._def.errorMap,path:e.path,parent:e.parent}}_processInputParams(e){return{status:new Re,ctx:{common:e.parent.common,data:e.data,parsedType:ot(e.data),schemaErrorMap:this._def.errorMap,path:e.path,parent:e.parent}}}_parseSync(e){let t=this._parse(e);if(Bt(t))throw Error("Synchronous parse encountered promise.");return t}_parseAsync(e){let t=this._parse(e);return Promise.resolve(t)}parse(e,t){let r=this.safeParse(e,t);if(r.success)return r.data;throw r.error}safeParse(e,t){let r={common:{issues:[],async:t?.async??!1,contextualErrorMap:t?.errorMap},path:t?.path||[],schemaErrorMap:this._def.errorMap,parent:null,data:e,parsedType:ot(e)},o=this._parseSync({data:e,path:r.path,parent:r});return en(r,o)}"~validate"(e){let t={common:{issues:[],async:!!this["~standard"].async},path:[],schemaErrorMap:this._def.errorMap,parent:null,data:e,parsedType:ot(e)};if(!this["~standard"].async)try{let r=this._parseSync({data:e,path:[],parent:t});return ht(r)?{value:r.value}:{issues:t.common.issues}}catch(r){if(r?.message?.toLowerCase()?.includes("encountered"))this["~standard"].async=!0;t.common={issues:[],async:!0}}return this._parseAsync({data:e,path:[],parent:t}).then((r)=>ht(r)?{value:r.value}:{issues:t.common.issues})}async parseAsync(e,t){let r=await this.safeParseAsync(e,t);if(r.success)return r.data;throw r.error}async safeParseAsync(e,t){let r={common:{issues:[],contextualErrorMap:t?.errorMap,async:!0},path:t?.path||[],schemaErrorMap:this._def.errorMap,parent:null,data:e,parsedType:ot(e)},o=this._parse({data:e,path:r.path,parent:r}),n=await(Bt(o)?o:Promise.resolve(o));return en(r,n)}refine(e,t){let r=(o)=>{if(typeof t==="string"||typeof t>"u")return{message:t};else if(typeof t==="function")return t(o);else return t};return this._refinement((o,n)=>{let a=e(o),s=()=>n.addIssue({code:f.custom,...r(o)});if(typeof Promise<"u"&&a instanceof Promise)return a.then((d)=>{if(!d)return s(),!1;else return!0});if(!a)return s(),!1;else return!0})}refinement(e,t){return this._refinement((r,o)=>{if(!e(r))return o.addIssue(typeof t==="function"?t(r,o):t),!1;else return!0})}_refinement(e){return new tt({schema:this,typeName:C.ZodEffects,effect:{type:"refinement",refinement:e}})}superRefine(e){return this._refinement(e)}constructor(e){this.spa=this.safeParseAsync,this._def=e,this.parse=this.parse.bind(this),this.safeParse=this.safeParse.bind(this),this.parseAsync=this.parseAsync.bind(this),this.safeParseAsync=this.safeParseAsync.bind(this),this.spa=this.spa.bind(this),this.refine=this.refine.bind(this),this.refinement=this.refinement.bind(this),this.superRefine=this.superRefine.bind(this),this.optional=this.optional.bind(this),this.nullable=this.nullable.bind(this),this.nullish=this.nullish.bind(this),this.array=this.array.bind(this),this.promise=this.promise.bind(this),this.or=this.or.bind(this),this.and=this.and.bind(this),this.transform=this.transform.bind(this),this.brand=this.brand.bind(this),this.default=this.default.bind(this),this.catch=this.catch.bind(this),this.describe=this.describe.bind(this),this.pipe=this.pipe.bind(this),this.readonly=this.readonly.bind(this),this.isNullable=this.isNullable.bind(this),this.isOptional=this.isOptional.bind(this),this["~standard"]={version:1,vendor:"zod",validate:(t)=>this["~validate"](t)}}optional(){return et.create(this,this._def)}nullable(){return pt.create(this,this._def)}nullish(){return this.nullable().optional()}array(){return Ze.create(this)}promise(){return It.create(this,this._def)}or(e){return Kt.create([this,e],this._def)}and(e){return Jt.create(this,e,this._def)}transform(e){return new tt({...U(this._def),schema:this,typeName:C.ZodEffects,effect:{type:"transform",transform:e}})}default(e){let t=typeof e==="function"?e:()=>e;return new Qt({...U(this._def),innerType:this,defaultValue:t,typeName:C.ZodDefault})}brand(){return new ho({typeName:C.ZodBranded,type:this,...U(this._def)})}catch(e){let t=typeof e==="function"?e:()=>e;return new Zt({...U(this._def),innerType:this,catchValue:t,typeName:C.ZodCatch})}describe(e){return new this.constructor({...this._def,description:e})}pipe(e){return Cr.create(this,e)}readonly(){return er.create(this)}isOptional(){return this.safeParse(void 0).success}isNullable(){return this.safeParse(null).success}}var Wn=/^c[^\s-]{8,}$/i,Qn=/^[0-9a-z]+$/,Zn=/^[0-9A-HJKMNP-TV-Z]{26}$/i,ea=/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i,ta=/^[a-z0-9_-]{21}$/i,ra=/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,oa=/^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/,na=/^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i,aa="^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$",uo,sa=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,ia=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,ca=/^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,da=/^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,la=/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,pa=/^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,tn="((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))",ua=new RegExp(`^${tn}$`);function rn(e){let t="[0-5]\\d";if(e.precision)t=`${t}\\.\\d{${e.precision}}`;else if(e.precision==null)t=`${t}(\\.\\d+)?`;let r=e.precision?"+":"?";return`([01]\\d|2[0-3]):[0-5]\\d(:${t})${r}`}function ma(e){return new RegExp(`^${rn(e)}$`)}function fa(e){let t=`${tn}T${rn(e)}`,r=[];if(r.push(e.local?"Z?":"Z"),e.offset)r.push("([+-]\\d{2}:?\\d{2})");return t=`${t}(${r.join("|")})`,new RegExp(`^${t}$`)}function ha(e,t){if((t==="v4"||!t)&&sa.test(e))return!0;if((t==="v6"||!t)&&ca.test(e))return!0;return!1}function ga(e,t){if(!ra.test(e))return!1;try{let[r]=e.split(".");if(!r)return!1;let o=r.replace(/-/g,"+").replace(/_/g,"/").padEnd(r.length+(4-r.length%4)%4,"="),n=JSON.parse(atob(o));if(typeof n!=="object"||n===null)return!1;if("typ"in n&&n?.typ!=="JWT")return!1;if(!n.alg)return!1;if(t&&n.alg!==t)return!1;return!0}catch{return!1}}function ba(e,t){if((t==="v4"||!t)&&ia.test(e))return!0;if((t==="v6"||!t)&&da.test(e))return!0;return!1}class at extends z{_parse(e){if(this._def.coerce)e.data=String(e.data);if(this._getType(e)!==x.string){let n=this._getOrReturnCtx(e);return g(n,{code:f.invalid_type,expected:x.string,received:n.parsedType}),A}let r=new Re,o=void 0;for(let n of this._def.checks)if(n.kind==="min"){if(e.data.length<n.value)o=this._getOrReturnCtx(e,o),g(o,{code:f.too_small,minimum:n.value,type:"string",inclusive:!0,exact:!1,message:n.message}),r.dirty()}else if(n.kind==="max"){if(e.data.length>n.value)o=this._getOrReturnCtx(e,o),g(o,{code:f.too_big,maximum:n.value,type:"string",inclusive:!0,exact:!1,message:n.message}),r.dirty()}else if(n.kind==="length"){let a=e.data.length>n.value,s=e.data.length<n.value;if(a||s){if(o=this._getOrReturnCtx(e,o),a)g(o,{code:f.too_big,maximum:n.value,type:"string",inclusive:!0,exact:!0,message:n.message});else if(s)g(o,{code:f.too_small,minimum:n.value,type:"string",inclusive:!0,exact:!0,message:n.message});r.dirty()}}else if(n.kind==="email"){if(!na.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"email",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="emoji"){if(!uo)uo=new RegExp(aa,"u");if(!uo.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"emoji",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="uuid"){if(!ea.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"uuid",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="nanoid"){if(!ta.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"nanoid",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="cuid"){if(!Wn.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"cuid",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="cuid2"){if(!Qn.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"cuid2",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="ulid"){if(!Zn.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"ulid",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="url")try{new URL(e.data)}catch{o=this._getOrReturnCtx(e,o),g(o,{validation:"url",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="regex"){if(n.regex.lastIndex=0,!n.regex.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"regex",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="trim")e.data=e.data.trim();else if(n.kind==="includes"){if(!e.data.includes(n.value,n.position))o=this._getOrReturnCtx(e,o),g(o,{code:f.invalid_string,validation:{includes:n.value,position:n.position},message:n.message}),r.dirty()}else if(n.kind==="toLowerCase")e.data=e.data.toLowerCase();else if(n.kind==="toUpperCase")e.data=e.data.toUpperCase();else if(n.kind==="startsWith"){if(!e.data.startsWith(n.value))o=this._getOrReturnCtx(e,o),g(o,{code:f.invalid_string,validation:{startsWith:n.value},message:n.message}),r.dirty()}else if(n.kind==="endsWith"){if(!e.data.endsWith(n.value))o=this._getOrReturnCtx(e,o),g(o,{code:f.invalid_string,validation:{endsWith:n.value},message:n.message}),r.dirty()}else if(n.kind==="datetime"){if(!fa(n).test(e.data))o=this._getOrReturnCtx(e,o),g(o,{code:f.invalid_string,validation:"datetime",message:n.message}),r.dirty()}else if(n.kind==="date"){if(!ua.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{code:f.invalid_string,validation:"date",message:n.message}),r.dirty()}else if(n.kind==="time"){if(!ma(n).test(e.data))o=this._getOrReturnCtx(e,o),g(o,{code:f.invalid_string,validation:"time",message:n.message}),r.dirty()}else if(n.kind==="duration"){if(!oa.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"duration",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="ip"){if(!ha(e.data,n.version))o=this._getOrReturnCtx(e,o),g(o,{validation:"ip",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="jwt"){if(!ga(e.data,n.alg))o=this._getOrReturnCtx(e,o),g(o,{validation:"jwt",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="cidr"){if(!ba(e.data,n.version))o=this._getOrReturnCtx(e,o),g(o,{validation:"cidr",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="base64"){if(!la.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"base64",code:f.invalid_string,message:n.message}),r.dirty()}else if(n.kind==="base64url"){if(!pa.test(e.data))o=this._getOrReturnCtx(e,o),g(o,{validation:"base64url",code:f.invalid_string,message:n.message}),r.dirty()}else H.assertNever(n);return{status:r.value,value:e.data}}_regex(e,t,r){return this.refinement((o)=>e.test(o),{validation:t,code:f.invalid_string,..._.errToObj(r)})}_addCheck(e){return new at({...this._def,checks:[...this._def.checks,e]})}email(e){return this._addCheck({kind:"email",..._.errToObj(e)})}url(e){return this._addCheck({kind:"url",..._.errToObj(e)})}emoji(e){return this._addCheck({kind:"emoji",..._.errToObj(e)})}uuid(e){return this._addCheck({kind:"uuid",..._.errToObj(e)})}nanoid(e){return this._addCheck({kind:"nanoid",..._.errToObj(e)})}cuid(e){return this._addCheck({kind:"cuid",..._.errToObj(e)})}cuid2(e){return this._addCheck({kind:"cuid2",..._.errToObj(e)})}ulid(e){return this._addCheck({kind:"ulid",..._.errToObj(e)})}base64(e){return this._addCheck({kind:"base64",..._.errToObj(e)})}base64url(e){return this._addCheck({kind:"base64url",..._.errToObj(e)})}jwt(e){return this._addCheck({kind:"jwt",..._.errToObj(e)})}ip(e){return this._addCheck({kind:"ip",..._.errToObj(e)})}cidr(e){return this._addCheck({kind:"cidr",..._.errToObj(e)})}datetime(e){if(typeof e==="string")return this._addCheck({kind:"datetime",precision:null,offset:!1,local:!1,message:e});return this._addCheck({kind:"datetime",precision:typeof e?.precision>"u"?null:e?.precision,offset:e?.offset??!1,local:e?.local??!1,..._.errToObj(e?.message)})}date(e){return this._addCheck({kind:"date",message:e})}time(e){if(typeof e==="string")return this._addCheck({kind:"time",precision:null,message:e});return this._addCheck({kind:"time",precision:typeof e?.precision>"u"?null:e?.precision,..._.errToObj(e?.message)})}duration(e){return this._addCheck({kind:"duration",..._.errToObj(e)})}regex(e,t){return this._addCheck({kind:"regex",regex:e,..._.errToObj(t)})}includes(e,t){return this._addCheck({kind:"includes",value:e,position:t?.position,..._.errToObj(t?.message)})}startsWith(e,t){return this._addCheck({kind:"startsWith",value:e,..._.errToObj(t)})}endsWith(e,t){return this._addCheck({kind:"endsWith",value:e,..._.errToObj(t)})}min(e,t){return this._addCheck({kind:"min",value:e,..._.errToObj(t)})}max(e,t){return this._addCheck({kind:"max",value:e,..._.errToObj(t)})}length(e,t){return this._addCheck({kind:"length",value:e,..._.errToObj(t)})}nonempty(e){return this.min(1,_.errToObj(e))}trim(){return new at({...this._def,checks:[...this._def.checks,{kind:"trim"}]})}toLowerCase(){return new at({...this._def,checks:[...this._def.checks,{kind:"toLowerCase"}]})}toUpperCase(){return new at({...this._def,checks:[...this._def.checks,{kind:"toUpperCase"}]})}get isDatetime(){return!!this._def.checks.find((e)=>e.kind==="datetime")}get isDate(){return!!this._def.checks.find((e)=>e.kind==="date")}get isTime(){return!!this._def.checks.find((e)=>e.kind==="time")}get isDuration(){return!!this._def.checks.find((e)=>e.kind==="duration")}get isEmail(){return!!this._def.checks.find((e)=>e.kind==="email")}get isURL(){return!!this._def.checks.find((e)=>e.kind==="url")}get isEmoji(){return!!this._def.checks.find((e)=>e.kind==="emoji")}get isUUID(){return!!this._def.checks.find((e)=>e.kind==="uuid")}get isNANOID(){return!!this._def.checks.find((e)=>e.kind==="nanoid")}get isCUID(){return!!this._def.checks.find((e)=>e.kind==="cuid")}get isCUID2(){return!!this._def.checks.find((e)=>e.kind==="cuid2")}get isULID(){return!!this._def.checks.find((e)=>e.kind==="ulid")}get isIP(){return!!this._def.checks.find((e)=>e.kind==="ip")}get isCIDR(){return!!this._def.checks.find((e)=>e.kind==="cidr")}get isBase64(){return!!this._def.checks.find((e)=>e.kind==="base64")}get isBase64url(){return!!this._def.checks.find((e)=>e.kind==="base64url")}get minLength(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e}get maxLength(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e}}at.create=(e)=>new at({checks:[],typeName:C.ZodString,coerce:e?.coerce??!1,...U(e)});function xa(e,t){let r=(e.toString().split(".")[1]||"").length,o=(t.toString().split(".")[1]||"").length,n=r>o?r:o,a=Number.parseInt(e.toFixed(n).replace(".","")),s=Number.parseInt(t.toFixed(n).replace(".",""));return a%s/10**n}class Rt extends z{constructor(){super(...arguments);this.min=this.gte,this.max=this.lte,this.step=this.multipleOf}_parse(e){if(this._def.coerce)e.data=Number(e.data);if(this._getType(e)!==x.number){let n=this._getOrReturnCtx(e);return g(n,{code:f.invalid_type,expected:x.number,received:n.parsedType}),A}let r=void 0,o=new Re;for(let n of this._def.checks)if(n.kind==="int"){if(!H.isInteger(e.data))r=this._getOrReturnCtx(e,r),g(r,{code:f.invalid_type,expected:"integer",received:"float",message:n.message}),o.dirty()}else if(n.kind==="min"){if(n.inclusive?e.data<n.value:e.data<=n.value)r=this._getOrReturnCtx(e,r),g(r,{code:f.too_small,minimum:n.value,type:"number",inclusive:n.inclusive,exact:!1,message:n.message}),o.dirty()}else if(n.kind==="max"){if(n.inclusive?e.data>n.value:e.data>=n.value)r=this._getOrReturnCtx(e,r),g(r,{code:f.too_big,maximum:n.value,type:"number",inclusive:n.inclusive,exact:!1,message:n.message}),o.dirty()}else if(n.kind==="multipleOf"){if(xa(e.data,n.value)!==0)r=this._getOrReturnCtx(e,r),g(r,{code:f.not_multiple_of,multipleOf:n.value,message:n.message}),o.dirty()}else if(n.kind==="finite"){if(!Number.isFinite(e.data))r=this._getOrReturnCtx(e,r),g(r,{code:f.not_finite,message:n.message}),o.dirty()}else H.assertNever(n);return{status:o.value,value:e.data}}gte(e,t){return this.setLimit("min",e,!0,_.toString(t))}gt(e,t){return this.setLimit("min",e,!1,_.toString(t))}lte(e,t){return this.setLimit("max",e,!0,_.toString(t))}lt(e,t){return this.setLimit("max",e,!1,_.toString(t))}setLimit(e,t,r,o){return new Rt({...this._def,checks:[...this._def.checks,{kind:e,value:t,inclusive:r,message:_.toString(o)}]})}_addCheck(e){return new Rt({...this._def,checks:[...this._def.checks,e]})}int(e){return this._addCheck({kind:"int",message:_.toString(e)})}positive(e){return this._addCheck({kind:"min",value:0,inclusive:!1,message:_.toString(e)})}negative(e){return this._addCheck({kind:"max",value:0,inclusive:!1,message:_.toString(e)})}nonpositive(e){return this._addCheck({kind:"max",value:0,inclusive:!0,message:_.toString(e)})}nonnegative(e){return this._addCheck({kind:"min",value:0,inclusive:!0,message:_.toString(e)})}multipleOf(e,t){return this._addCheck({kind:"multipleOf",value:e,message:_.toString(t)})}finite(e){return this._addCheck({kind:"finite",message:_.toString(e)})}safe(e){return this._addCheck({kind:"min",inclusive:!0,value:Number.MIN_SAFE_INTEGER,message:_.toString(e)})._addCheck({kind:"max",inclusive:!0,value:Number.MAX_SAFE_INTEGER,message:_.toString(e)})}get minValue(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e}get maxValue(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e}get isInt(){return!!this._def.checks.find((e)=>e.kind==="int"||e.kind==="multipleOf"&&H.isInteger(e.value))}get isFinite(){let e=null,t=null;for(let r of this._def.checks)if(r.kind==="finite"||r.kind==="int"||r.kind==="multipleOf")return!0;else if(r.kind==="min"){if(t===null||r.value>t)t=r.value}else if(r.kind==="max"){if(e===null||r.value<e)e=r.value}return Number.isFinite(t)&&Number.isFinite(e)}}Rt.create=(e)=>new Rt({checks:[],typeName:C.ZodNumber,coerce:e?.coerce||!1,...U(e)});class Pt extends z{constructor(){super(...arguments);this.min=this.gte,this.max=this.lte}_parse(e){if(this._def.coerce)try{e.data=BigInt(e.data)}catch{return this._getInvalidInput(e)}if(this._getType(e)!==x.bigint)return this._getInvalidInput(e);let r=void 0,o=new Re;for(let n of this._def.checks)if(n.kind==="min"){if(n.inclusive?e.data<n.value:e.data<=n.value)r=this._getOrReturnCtx(e,r),g(r,{code:f.too_small,type:"bigint",minimum:n.value,inclusive:n.inclusive,message:n.message}),o.dirty()}else if(n.kind==="max"){if(n.inclusive?e.data>n.value:e.data>=n.value)r=this._getOrReturnCtx(e,r),g(r,{code:f.too_big,type:"bigint",maximum:n.value,inclusive:n.inclusive,message:n.message}),o.dirty()}else if(n.kind==="multipleOf"){if(e.data%n.value!==BigInt(0))r=this._getOrReturnCtx(e,r),g(r,{code:f.not_multiple_of,multipleOf:n.value,message:n.message}),o.dirty()}else H.assertNever(n);return{status:o.value,value:e.data}}_getInvalidInput(e){let t=this._getOrReturnCtx(e);return g(t,{code:f.invalid_type,expected:x.bigint,received:t.parsedType}),A}gte(e,t){return this.setLimit("min",e,!0,_.toString(t))}gt(e,t){return this.setLimit("min",e,!1,_.toString(t))}lte(e,t){return this.setLimit("max",e,!0,_.toString(t))}lt(e,t){return this.setLimit("max",e,!1,_.toString(t))}setLimit(e,t,r,o){return new Pt({...this._def,checks:[...this._def.checks,{kind:e,value:t,inclusive:r,message:_.toString(o)}]})}_addCheck(e){return new Pt({...this._def,checks:[...this._def.checks,e]})}positive(e){return this._addCheck({kind:"min",value:BigInt(0),inclusive:!1,message:_.toString(e)})}negative(e){return this._addCheck({kind:"max",value:BigInt(0),inclusive:!1,message:_.toString(e)})}nonpositive(e){return this._addCheck({kind:"max",value:BigInt(0),inclusive:!0,message:_.toString(e)})}nonnegative(e){return this._addCheck({kind:"min",value:BigInt(0),inclusive:!0,message:_.toString(e)})}multipleOf(e,t){return this._addCheck({kind:"multipleOf",value:e,message:_.toString(t)})}get minValue(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e}get maxValue(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e}}Pt.create=(e)=>new Pt({checks:[],typeName:C.ZodBigInt,coerce:e?.coerce??!1,...U(e)});class kr extends z{_parse(e){if(this._def.coerce)e.data=Boolean(e.data);if(this._getType(e)!==x.boolean){let r=this._getOrReturnCtx(e);return g(r,{code:f.invalid_type,expected:x.boolean,received:r.parsedType}),A}return Ie(e.data)}}kr.create=(e)=>new kr({typeName:C.ZodBoolean,coerce:e?.coerce||!1,...U(e)});class Vt extends z{_parse(e){if(this._def.coerce)e.data=new Date(e.data);if(this._getType(e)!==x.date){let n=this._getOrReturnCtx(e);return g(n,{code:f.invalid_type,expected:x.date,received:n.parsedType}),A}if(Number.isNaN(e.data.getTime())){let n=this._getOrReturnCtx(e);return g(n,{code:f.invalid_date}),A}let r=new Re,o=void 0;for(let n of this._def.checks)if(n.kind==="min"){if(e.data.getTime()<n.value)o=this._getOrReturnCtx(e,o),g(o,{code:f.too_small,message:n.message,inclusive:!0,exact:!1,minimum:n.value,type:"date"}),r.dirty()}else if(n.kind==="max"){if(e.data.getTime()>n.value)o=this._getOrReturnCtx(e,o),g(o,{code:f.too_big,message:n.message,inclusive:!0,exact:!1,maximum:n.value,type:"date"}),r.dirty()}else H.assertNever(n);return{status:r.value,value:new Date(e.data.getTime())}}_addCheck(e){return new Vt({...this._def,checks:[...this._def.checks,e]})}min(e,t){return this._addCheck({kind:"min",value:e.getTime(),message:_.toString(t)})}max(e,t){return this._addCheck({kind:"max",value:e.getTime(),message:_.toString(t)})}get minDate(){let e=null;for(let t of this._def.checks)if(t.kind==="min"){if(e===null||t.value>e)e=t.value}return e!=null?new Date(e):null}get maxDate(){let e=null;for(let t of this._def.checks)if(t.kind==="max"){if(e===null||t.value<e)e=t.value}return e!=null?new Date(e):null}}Vt.create=(e)=>new Vt({checks:[],coerce:e?.coerce||!1,typeName:C.ZodDate,...U(e)});class _r extends z{_parse(e){if(this._getType(e)!==x.symbol){let r=this._getOrReturnCtx(e);return g(r,{code:f.invalid_type,expected:x.symbol,received:r.parsedType}),A}return Ie(e.data)}}_r.create=(e)=>new _r({typeName:C.ZodSymbol,...U(e)});class Ft extends z{_parse(e){if(this._getType(e)!==x.undefined){let r=this._getOrReturnCtx(e);return g(r,{code:f.invalid_type,expected:x.undefined,received:r.parsedType}),A}return Ie(e.data)}}Ft.create=(e)=>new Ft({typeName:C.ZodUndefined,...U(e)});class Xt extends z{_parse(e){if(this._getType(e)!==x.null){let r=this._getOrReturnCtx(e);return g(r,{code:f.invalid_type,expected:x.null,received:r.parsedType}),A}return Ie(e.data)}}Xt.create=(e)=>new Xt({typeName:C.ZodNull,...U(e)});class wr extends z{constructor(){super(...arguments);this._any=!0}_parse(e){return Ie(e.data)}}wr.create=(e)=>new wr({typeName:C.ZodAny,...U(e)});class gt extends z{constructor(){super(...arguments);this._unknown=!0}_parse(e){return Ie(e.data)}}gt.create=(e)=>new gt({typeName:C.ZodUnknown,...U(e)});class st extends z{_parse(e){let t=this._getOrReturnCtx(e);return g(t,{code:f.invalid_type,expected:x.never,received:t.parsedType}),A}}st.create=(e)=>new st({typeName:C.ZodNever,...U(e)});class Sr extends z{_parse(e){if(this._getType(e)!==x.undefined){let r=this._getOrReturnCtx(e);return g(r,{code:f.invalid_type,expected:x.void,received:r.parsedType}),A}return Ie(e.data)}}Sr.create=(e)=>new Sr({typeName:C.ZodVoid,...U(e)});class Ze extends z{_parse(e){let{ctx:t,status:r}=this._processInputParams(e),o=this._def;if(t.parsedType!==x.array)return g(t,{code:f.invalid_type,expected:x.array,received:t.parsedType}),A;if(o.exactLength!==null){let a=t.data.length>o.exactLength.value,s=t.data.length<o.exactLength.value;if(a||s)g(t,{code:a?f.too_big:f.too_small,minimum:s?o.exactLength.value:void 0,maximum:a?o.exactLength.value:void 0,type:"array",inclusive:!0,exact:!0,message:o.exactLength.message}),r.dirty()}if(o.minLength!==null){if(t.data.length<o.minLength.value)g(t,{code:f.too_small,minimum:o.minLength.value,type:"array",inclusive:!0,exact:!1,message:o.minLength.message}),r.dirty()}if(o.maxLength!==null){if(t.data.length>o.maxLength.value)g(t,{code:f.too_big,maximum:o.maxLength.value,type:"array",inclusive:!0,exact:!1,message:o.maxLength.message}),r.dirty()}if(t.common.async)return Promise.all([...t.data].map((a,s)=>o.type._parseAsync(new Ke(t,a,t.path,s)))).then((a)=>Re.mergeArray(r,a));let n=[...t.data].map((a,s)=>o.type._parseSync(new Ke(t,a,t.path,s)));return Re.mergeArray(r,n)}get element(){return this._def.type}min(e,t){return new Ze({...this._def,minLength:{value:e,message:_.toString(t)}})}max(e,t){return new Ze({...this._def,maxLength:{value:e,message:_.toString(t)}})}length(e,t){return new Ze({...this._def,exactLength:{value:e,message:_.toString(t)}})}nonempty(e){return this.min(1,e)}}Ze.create=(e,t)=>new Ze({type:e,minLength:null,maxLength:null,exactLength:null,typeName:C.ZodArray,...U(t)});function Ct(e){if(e instanceof xe){let t={};for(let r in e.shape){let o=e.shape[r];t[r]=et.create(Ct(o))}return new xe({...e._def,shape:()=>t})}else if(e instanceof Ze)return new Ze({...e._def,type:Ct(e.element)});else if(e instanceof et)return et.create(Ct(e.unwrap()));else if(e instanceof pt)return pt.create(Ct(e.unwrap()));else if(e instanceof it)return it.create(e.items.map((t)=>Ct(t)));else return e}class xe extends z{constructor(){super(...arguments);this._cached=null,this.nonstrict=this.passthrough,this.augment=this.extend}_getCached(){if(this._cached!==null)return this._cached;let e=this._def.shape(),t=H.objectKeys(e);return this._cached={shape:e,keys:t},this._cached}_parse(e){if(this._getType(e)!==x.object){let l=this._getOrReturnCtx(e);return g(l,{code:f.invalid_type,expected:x.object,received:l.parsedType}),A}let{status:r,ctx:o}=this._processInputParams(e),{shape:n,keys:a}=this._getCached(),s=[];if(!(this._def.catchall instanceof st&&this._def.unknownKeys==="strip")){for(let l in o.data)if(!a.includes(l))s.push(l)}let d=[];for(let l of a){let u=n[l],b=o.data[l];d.push({key:{status:"valid",value:l},value:u._parse(new Ke(o,b,o.path,l)),alwaysSet:l in o.data})}if(this._def.catchall instanceof st){let l=this._def.unknownKeys;if(l==="passthrough")for(let u of s)d.push({key:{status:"valid",value:u},value:{status:"valid",value:o.data[u]}});else if(l==="strict"){if(s.length>0)g(o,{code:f.unrecognized_keys,keys:s}),r.dirty()}else if(l==="strip");else throw Error("Internal ZodObject error: invalid unknownKeys value.")}else{let l=this._def.catchall;for(let u of s){let b=o.data[u];d.push({key:{status:"valid",value:u},value:l._parse(new Ke(o,b,o.path,u)),alwaysSet:u in o.data})}}if(o.common.async)return Promise.resolve().then(async()=>{let l=[];for(let u of d){let b=await u.key,F=await u.value;l.push({key:b,value:F,alwaysSet:u.alwaysSet})}return l}).then((l)=>Re.mergeObjectSync(r,l));else return Re.mergeObjectSync(r,d)}get shape(){return this._def.shape()}strict(e){return _.errToObj,new xe({...this._def,unknownKeys:"strict",...e!==void 0?{errorMap:(t,r)=>{let o=this._def.errorMap?.(t,r).message??r.defaultError;if(t.code==="unrecognized_keys")return{message:_.errToObj(e).message??o};return{message:o}}}:{}})}strip(){return new xe({...this._def,unknownKeys:"strip"})}passthrough(){return new xe({...this._def,unknownKeys:"passthrough"})}extend(e){return new xe({...this._def,shape:()=>({...this._def.shape(),...e})})}merge(e){return new xe({unknownKeys:e._def.unknownKeys,catchall:e._def.catchall,shape:()=>({...this._def.shape(),...e._def.shape()}),typeName:C.ZodObject})}setKey(e,t){return this.augment({[e]:t})}catchall(e){return new xe({...this._def,catchall:e})}pick(e){let t={};for(let r of H.objectKeys(e))if(e[r]&&this.shape[r])t[r]=this.shape[r];return new xe({...this._def,shape:()=>t})}omit(e){let t={};for(let r of H.objectKeys(this.shape))if(!e[r])t[r]=this.shape[r];return new xe({...this._def,shape:()=>t})}deepPartial(){return Ct(this)}partial(e){let t={};for(let r of H.objectKeys(this.shape)){let o=this.shape[r];if(e&&!e[r])t[r]=o;else t[r]=o.optional()}return new xe({...this._def,shape:()=>t})}required(e){let t={};for(let r of H.objectKeys(this.shape))if(e&&!e[r])t[r]=this.shape[r];else{let n=this.shape[r];while(n instanceof et)n=n._def.innerType;t[r]=n}return new xe({...this._def,shape:()=>t})}keyof(){return on(H.objectKeys(this.shape))}}xe.create=(e,t)=>new xe({shape:()=>e,unknownKeys:"strip",catchall:st.create(),typeName:C.ZodObject,...U(t)});xe.strictCreate=(e,t)=>new xe({shape:()=>e,unknownKeys:"strict",catchall:st.create(),typeName:C.ZodObject,...U(t)});xe.lazycreate=(e,t)=>new xe({shape:e,unknownKeys:"strip",catchall:st.create(),typeName:C.ZodObject,...U(t)});class Kt extends z{_parse(e){let{ctx:t}=this._processInputParams(e),r=this._def.options;function o(n){for(let s of n)if(s.result.status==="valid")return s.result;for(let s of n)if(s.result.status==="dirty")return t.common.issues.push(...s.ctx.common.issues),s.result;let a=n.map((s)=>new Be(s.ctx.common.issues));return g(t,{code:f.invalid_union,unionErrors:a}),A}if(t.common.async)return Promise.all(r.map(async(n)=>{let a={...t,common:{...t.common,issues:[]},parent:null};return{result:await n._parseAsync({data:t.data,path:t.path,parent:a}),ctx:a}})).then(o);else{let n=void 0,a=[];for(let d of r){let l={...t,common:{...t.common,issues:[]},parent:null},u=d._parseSync({data:t.data,path:t.path,parent:l});if(u.status==="valid")return u;else if(u.status==="dirty"&&!n)n={result:u,ctx:l};if(l.common.issues.length)a.push(l.common.issues)}if(n)return t.common.issues.push(...n.ctx.common.issues),n.result;let s=a.map((d)=>new Be(d));return g(t,{code:f.invalid_union,unionErrors:s}),A}}get options(){return this._def.options}}Kt.create=(e,t)=>new Kt({options:e,typeName:C.ZodUnion,...U(t)});var nt=(e)=>{if(e instanceof Yt)return nt(e.schema);else if(e instanceof tt)return nt(e.innerType());else if(e instanceof qt)return[e.value];else if(e instanceof bt)return e.options;else if(e instanceof Wt)return H.objectValues(e.enum);else if(e instanceof Qt)return nt(e._def.innerType);else if(e instanceof Ft)return[void 0];else if(e instanceof Xt)return[null];else if(e instanceof et)return[void 0,...nt(e.unwrap())];else if(e instanceof pt)return[null,...nt(e.unwrap())];else if(e instanceof ho)return nt(e.unwrap());else if(e instanceof er)return nt(e.unwrap());else if(e instanceof Zt)return nt(e._def.innerType);else return[]};class fo extends z{_parse(e){let{ctx:t}=this._processInputParams(e);if(t.parsedType!==x.object)return g(t,{code:f.invalid_type,expected:x.object,received:t.parsedType}),A;let r=this.discriminator,o=t.data[r],n=this.optionsMap.get(o);if(!n)return g(t,{code:f.invalid_union_discriminator,options:Array.from(this.optionsMap.keys()),path:[r]}),A;if(t.common.async)return n._parseAsync({data:t.data,path:t.path,parent:t});else return n._parseSync({data:t.data,path:t.path,parent:t})}get discriminator(){return this._def.discriminator}get options(){return this._def.options}get optionsMap(){return this._def.optionsMap}static create(e,t,r){let o=new Map;for(let n of t){let a=nt(n.shape[e]);if(!a.length)throw Error(`A discriminator value for key \`${e}\` could not be extracted from all schema options`);for(let s of a){if(o.has(s))throw Error(`Discriminator property ${String(e)} has duplicate value ${String(s)}`);o.set(s,n)}}return new fo({typeName:C.ZodDiscriminatedUnion,discriminator:e,options:t,optionsMap:o,...U(r)})}}function mo(e,t){let r=ot(e),o=ot(t);if(e===t)return{valid:!0,data:e};else if(r===x.object&&o===x.object){let n=H.objectKeys(t),a=H.objectKeys(e).filter((d)=>n.indexOf(d)!==-1),s={...e,...t};for(let d of a){let l=mo(e[d],t[d]);if(!l.valid)return{valid:!1};s[d]=l.data}return{valid:!0,data:s}}else if(r===x.array&&o===x.array){if(e.length!==t.length)return{valid:!1};let n=[];for(let a=0;a<e.length;a++){let s=e[a],d=t[a],l=mo(s,d);if(!l.valid)return{valid:!1};n.push(l.data)}return{valid:!0,data:n}}else if(r===x.date&&o===x.date&&+e===+t)return{valid:!0,data:e};else return{valid:!1}}class Jt extends z{_parse(e){let{status:t,ctx:r}=this._processInputParams(e),o=(n,a)=>{if(lo(n)||lo(a))return A;let s=mo(n.value,a.value);if(!s.valid)return g(r,{code:f.invalid_intersection_types}),A;if(po(n)||po(a))t.dirty();return{status:t.value,value:s.data}};if(r.common.async)return Promise.all([this._def.left._parseAsync({data:r.data,path:r.path,parent:r}),this._def.right._parseAsync({data:r.data,path:r.path,parent:r})]).then(([n,a])=>o(n,a));else return o(this._def.left._parseSync({data:r.data,path:r.path,parent:r}),this._def.right._parseSync({data:r.data,path:r.path,parent:r}))}}Jt.create=(e,t,r)=>new Jt({left:e,right:t,typeName:C.ZodIntersection,...U(r)});class it extends z{_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==x.array)return g(r,{code:f.invalid_type,expected:x.array,received:r.parsedType}),A;if(r.data.length<this._def.items.length)return g(r,{code:f.too_small,minimum:this._def.items.length,inclusive:!0,exact:!1,type:"array"}),A;if(!this._def.rest&&r.data.length>this._def.items.length)g(r,{code:f.too_big,maximum:this._def.items.length,inclusive:!0,exact:!1,type:"array"}),t.dirty();let n=[...r.data].map((a,s)=>{let d=this._def.items[s]||this._def.rest;if(!d)return null;return d._parse(new Ke(r,a,r.path,s))}).filter((a)=>!!a);if(r.common.async)return Promise.all(n).then((a)=>Re.mergeArray(t,a));else return Re.mergeArray(t,n)}get items(){return this._def.items}rest(e){return new it({...this._def,rest:e})}}it.create=(e,t)=>{if(!Array.isArray(e))throw Error("You must pass an array of schemas to z.tuple([ ... ])");return new it({items:e,typeName:C.ZodTuple,rest:null,...U(t)})};class Tr extends z{get keySchema(){return this._def.keyType}get valueSchema(){return this._def.valueType}_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==x.object)return g(r,{code:f.invalid_type,expected:x.object,received:r.parsedType}),A;let o=[],n=this._def.keyType,a=this._def.valueType;for(let s in r.data)o.push({key:n._parse(new Ke(r,s,r.path,s)),value:a._parse(new Ke(r,r.data[s],r.path,s)),alwaysSet:s in r.data});if(r.common.async)return Re.mergeObjectAsync(t,o);else return Re.mergeObjectSync(t,o)}get element(){return this._def.valueType}static create(e,t,r){if(t instanceof z)return new Tr({keyType:e,valueType:t,typeName:C.ZodRecord,...U(r)});return new Tr({keyType:at.create(),valueType:e,typeName:C.ZodRecord,...U(t)})}}class Er extends z{get keySchema(){return this._def.keyType}get valueSchema(){return this._def.valueType}_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==x.map)return g(r,{code:f.invalid_type,expected:x.map,received:r.parsedType}),A;let o=this._def.keyType,n=this._def.valueType,a=[...r.data.entries()].map(([s,d],l)=>({key:o._parse(new Ke(r,s,r.path,[l,"key"])),value:n._parse(new Ke(r,d,r.path,[l,"value"]))}));if(r.common.async){let s=new Map;return Promise.resolve().then(async()=>{for(let d of a){let l=await d.key,u=await d.value;if(l.status==="aborted"||u.status==="aborted")return A;if(l.status==="dirty"||u.status==="dirty")t.dirty();s.set(l.value,u.value)}return{status:t.value,value:s}})}else{let s=new Map;for(let d of a){let{key:l,value:u}=d;if(l.status==="aborted"||u.status==="aborted")return A;if(l.status==="dirty"||u.status==="dirty")t.dirty();s.set(l.value,u.value)}return{status:t.value,value:s}}}}Er.create=(e,t,r)=>new Er({valueType:t,keyType:e,typeName:C.ZodMap,...U(r)});class Ot extends z{_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.parsedType!==x.set)return g(r,{code:f.invalid_type,expected:x.set,received:r.parsedType}),A;let o=this._def;if(o.minSize!==null){if(r.data.size<o.minSize.value)g(r,{code:f.too_small,minimum:o.minSize.value,type:"set",inclusive:!0,exact:!1,message:o.minSize.message}),t.dirty()}if(o.maxSize!==null){if(r.data.size>o.maxSize.value)g(r,{code:f.too_big,maximum:o.maxSize.value,type:"set",inclusive:!0,exact:!1,message:o.maxSize.message}),t.dirty()}let n=this._def.valueType;function a(d){let l=new Set;for(let u of d){if(u.status==="aborted")return A;if(u.status==="dirty")t.dirty();l.add(u.value)}return{status:t.value,value:l}}let s=[...r.data.values()].map((d,l)=>n._parse(new Ke(r,d,r.path,l)));if(r.common.async)return Promise.all(s).then((d)=>a(d));else return a(s)}min(e,t){return new Ot({...this._def,minSize:{value:e,message:_.toString(t)}})}max(e,t){return new Ot({...this._def,maxSize:{value:e,message:_.toString(t)}})}size(e,t){return this.min(e,t).max(e,t)}nonempty(e){return this.min(1,e)}}Ot.create=(e,t)=>new Ot({valueType:e,minSize:null,maxSize:null,typeName:C.ZodSet,...U(t)});class Ht extends z{constructor(){super(...arguments);this.validate=this.implement}_parse(e){let{ctx:t}=this._processInputParams(e);if(t.parsedType!==x.function)return g(t,{code:f.invalid_type,expected:x.function,received:t.parsedType}),A;function r(s,d){return vr({data:s,path:t.path,errorMaps:[t.common.contextualErrorMap,t.schemaErrorMap,zt(),lt].filter((l)=>!!l),issueData:{code:f.invalid_arguments,argumentsError:d}})}function o(s,d){return vr({data:s,path:t.path,errorMaps:[t.common.contextualErrorMap,t.schemaErrorMap,zt(),lt].filter((l)=>!!l),issueData:{code:f.invalid_return_type,returnTypeError:d}})}let n={errorMap:t.common.contextualErrorMap},a=t.data;if(this._def.returns instanceof It){let s=this;return Ie(async function(...d){let l=new Be([]),u=await s._def.args.parseAsync(d,n).catch((S)=>{throw l.addIssue(r(d,S)),l}),b=await Reflect.apply(a,this,u);return await s._def.returns._def.type.parseAsync(b,n).catch((S)=>{throw l.addIssue(o(b,S)),l})})}else{let s=this;return Ie(function(...d){let l=s._def.args.safeParse(d,n);if(!l.success)throw new Be([r(d,l.error)]);let u=Reflect.apply(a,this,l.data),b=s._def.returns.safeParse(u,n);if(!b.success)throw new Be([o(u,b.error)]);return b.data})}}parameters(){return this._def.args}returnType(){return this._def.returns}args(...e){return new Ht({...this._def,args:it.create(e).rest(gt.create())})}returns(e){return new Ht({...this._def,returns:e})}implement(e){return this.parse(e)}strictImplement(e){return this.parse(e)}static create(e,t,r){return new Ht({args:e?e:it.create([]).rest(gt.create()),returns:t||gt.create(),typeName:C.ZodFunction,...U(r)})}}class Yt extends z{get schema(){return this._def.getter()}_parse(e){let{ctx:t}=this._processInputParams(e);return this._def.getter()._parse({data:t.data,path:t.path,parent:t})}}Yt.create=(e,t)=>new Yt({getter:e,typeName:C.ZodLazy,...U(t)});class qt extends z{_parse(e){if(e.data!==this._def.value){let t=this._getOrReturnCtx(e);return g(t,{received:t.data,code:f.invalid_literal,expected:this._def.value}),A}return{status:"valid",value:e.data}}get value(){return this._def.value}}qt.create=(e,t)=>new qt({value:e,typeName:C.ZodLiteral,...U(t)});function on(e,t){return new bt({values:e,typeName:C.ZodEnum,...U(t)})}class bt extends z{_parse(e){if(typeof e.data!=="string"){let t=this._getOrReturnCtx(e),r=this._def.values;return g(t,{expected:H.joinValues(r),received:t.parsedType,code:f.invalid_type}),A}if(!this._cache)this._cache=new Set(this._def.values);if(!this._cache.has(e.data)){let t=this._getOrReturnCtx(e),r=this._def.values;return g(t,{received:t.data,code:f.invalid_enum_value,options:r}),A}return Ie(e.data)}get options(){return this._def.values}get enum(){let e={};for(let t of this._def.values)e[t]=t;return e}get Values(){let e={};for(let t of this._def.values)e[t]=t;return e}get Enum(){let e={};for(let t of this._def.values)e[t]=t;return e}extract(e,t=this._def){return bt.create(e,{...this._def,...t})}exclude(e,t=this._def){return bt.create(this.options.filter((r)=>!e.includes(r)),{...this._def,...t})}}bt.create=on;class Wt extends z{_parse(e){let t=H.getValidEnumValues(this._def.values),r=this._getOrReturnCtx(e);if(r.parsedType!==x.string&&r.parsedType!==x.number){let o=H.objectValues(t);return g(r,{expected:H.joinValues(o),received:r.parsedType,code:f.invalid_type}),A}if(!this._cache)this._cache=new Set(H.getValidEnumValues(this._def.values));if(!this._cache.has(e.data)){let o=H.objectValues(t);return g(r,{received:r.data,code:f.invalid_enum_value,options:o}),A}return Ie(e.data)}get enum(){return this._def.values}}Wt.create=(e,t)=>new Wt({values:e,typeName:C.ZodNativeEnum,...U(t)});class It extends z{unwrap(){return this._def.type}_parse(e){let{ctx:t}=this._processInputParams(e);if(t.parsedType!==x.promise&&t.common.async===!1)return g(t,{code:f.invalid_type,expected:x.promise,received:t.parsedType}),A;let r=t.parsedType===x.promise?t.data:Promise.resolve(t.data);return Ie(r.then((o)=>this._def.type.parseAsync(o,{path:t.path,errorMap:t.common.contextualErrorMap})))}}It.create=(e,t)=>new It({type:e,typeName:C.ZodPromise,...U(t)});class tt extends z{innerType(){return this._def.schema}sourceType(){return this._def.schema._def.typeName===C.ZodEffects?this._def.schema.sourceType():this._def.schema}_parse(e){let{status:t,ctx:r}=this._processInputParams(e),o=this._def.effect||null,n={addIssue:(a)=>{if(g(r,a),a.fatal)t.abort();else t.dirty()},get path(){return r.path}};if(n.addIssue=n.addIssue.bind(n),o.type==="preprocess"){let a=o.transform(r.data,n);if(r.common.async)return Promise.resolve(a).then(async(s)=>{if(t.value==="aborted")return A;let d=await this._def.schema._parseAsync({data:s,path:r.path,parent:r});if(d.status==="aborted")return A;if(d.status==="dirty")return At(d.value);if(t.value==="dirty")return At(d.value);return d});else{if(t.value==="aborted")return A;let s=this._def.schema._parseSync({data:a,path:r.path,parent:r});if(s.status==="aborted")return A;if(s.status==="dirty")return At(s.value);if(t.value==="dirty")return At(s.value);return s}}if(o.type==="refinement"){let a=(s)=>{let d=o.refinement(s,n);if(r.common.async)return Promise.resolve(d);if(d instanceof Promise)throw Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");return s};if(r.common.async===!1){let s=this._def.schema._parseSync({data:r.data,path:r.path,parent:r});if(s.status==="aborted")return A;if(s.status==="dirty")t.dirty();return a(s.value),{status:t.value,value:s.value}}else return this._def.schema._parseAsync({data:r.data,path:r.path,parent:r}).then((s)=>{if(s.status==="aborted")return A;if(s.status==="dirty")t.dirty();return a(s.value).then(()=>({status:t.value,value:s.value}))})}if(o.type==="transform")if(r.common.async===!1){let a=this._def.schema._parseSync({data:r.data,path:r.path,parent:r});if(!ht(a))return A;let s=o.transform(a.value,n);if(s instanceof Promise)throw Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");return{status:t.value,value:s}}else return this._def.schema._parseAsync({data:r.data,path:r.path,parent:r}).then((a)=>{if(!ht(a))return A;return Promise.resolve(o.transform(a.value,n)).then((s)=>({status:t.value,value:s}))});H.assertNever(o)}}tt.create=(e,t,r)=>new tt({schema:e,typeName:C.ZodEffects,effect:t,...U(r)});tt.createWithPreprocess=(e,t,r)=>new tt({schema:t,effect:{type:"preprocess",transform:e},typeName:C.ZodEffects,...U(r)});class et extends z{_parse(e){if(this._getType(e)===x.undefined)return Ie(void 0);return this._def.innerType._parse(e)}unwrap(){return this._def.innerType}}et.create=(e,t)=>new et({innerType:e,typeName:C.ZodOptional,...U(t)});class pt extends z{_parse(e){if(this._getType(e)===x.null)return Ie(null);return this._def.innerType._parse(e)}unwrap(){return this._def.innerType}}pt.create=(e,t)=>new pt({innerType:e,typeName:C.ZodNullable,...U(t)});class Qt extends z{_parse(e){let{ctx:t}=this._processInputParams(e),r=t.data;if(t.parsedType===x.undefined)r=this._def.defaultValue();return this._def.innerType._parse({data:r,path:t.path,parent:t})}removeDefault(){return this._def.innerType}}Qt.create=(e,t)=>new Qt({innerType:e,typeName:C.ZodDefault,defaultValue:typeof t.default==="function"?t.default:()=>t.default,...U(t)});class Zt extends z{_parse(e){let{ctx:t}=this._processInputParams(e),r={...t,common:{...t.common,issues:[]}},o=this._def.innerType._parse({data:r.data,path:r.path,parent:{...r}});if(Bt(o))return o.then((n)=>({status:"valid",value:n.status==="valid"?n.value:this._def.catchValue({get error(){return new Be(r.common.issues)},input:r.data})}));else return{status:"valid",value:o.status==="valid"?o.value:this._def.catchValue({get error(){return new Be(r.common.issues)},input:r.data})}}removeCatch(){return this._def.innerType}}Zt.create=(e,t)=>new Zt({innerType:e,typeName:C.ZodCatch,catchValue:typeof t.catch==="function"?t.catch:()=>t.catch,...U(t)});class Ar extends z{_parse(e){if(this._getType(e)!==x.nan){let r=this._getOrReturnCtx(e);return g(r,{code:f.invalid_type,expected:x.nan,received:r.parsedType}),A}return{status:"valid",value:e.data}}}Ar.create=(e)=>new Ar({typeName:C.ZodNaN,...U(e)});var gd=Symbol("zod_brand");class ho extends z{_parse(e){let{ctx:t}=this._processInputParams(e),r=t.data;return this._def.type._parse({data:r,path:t.path,parent:t})}unwrap(){return this._def.type}}class Cr extends z{_parse(e){let{status:t,ctx:r}=this._processInputParams(e);if(r.common.async)return(async()=>{let n=await this._def.in._parseAsync({data:r.data,path:r.path,parent:r});if(n.status==="aborted")return A;if(n.status==="dirty")return t.dirty(),At(n.value);else return this._def.out._parseAsync({data:n.value,path:r.path,parent:r})})();else{let o=this._def.in._parseSync({data:r.data,path:r.path,parent:r});if(o.status==="aborted")return A;if(o.status==="dirty")return t.dirty(),{status:"dirty",value:o.value};else return this._def.out._parseSync({data:o.value,path:r.path,parent:r})}}static create(e,t){return new Cr({in:e,out:t,typeName:C.ZodPipeline})}}class er extends z{_parse(e){let t=this._def.innerType._parse(e),r=(o)=>{if(ht(o))o.value=Object.freeze(o.value);return o};return Bt(t)?t.then((o)=>r(o)):r(t)}unwrap(){return this._def.innerType}}er.create=(e,t)=>new er({innerType:e,typeName:C.ZodReadonly,...U(t)});var bd={object:xe.lazycreate},C;(function(e){e.ZodString="ZodString",e.ZodNumber="ZodNumber",e.ZodNaN="ZodNaN",e.ZodBigInt="ZodBigInt",e.ZodBoolean="ZodBoolean",e.ZodDate="ZodDate",e.ZodSymbol="ZodSymbol",e.ZodUndefined="ZodUndefined",e.ZodNull="ZodNull",e.ZodAny="ZodAny",e.ZodUnknown="ZodUnknown",e.ZodNever="ZodNever",e.ZodVoid="ZodVoid",e.ZodArray="ZodArray",e.ZodObject="ZodObject",e.ZodUnion="ZodUnion",e.ZodDiscriminatedUnion="ZodDiscriminatedUnion",e.ZodIntersection="ZodIntersection",e.ZodTuple="ZodTuple",e.ZodRecord="ZodRecord",e.ZodMap="ZodMap",e.ZodSet="ZodSet",e.ZodFunction="ZodFunction",e.ZodLazy="ZodLazy",e.ZodLiteral="ZodLiteral",e.ZodEnum="ZodEnum",e.ZodEffects="ZodEffects",e.ZodNativeEnum="ZodNativeEnum",e.ZodOptional="ZodOptional",e.ZodNullable="ZodNullable",e.ZodDefault="ZodDefault",e.ZodCatch="ZodCatch",e.ZodPromise="ZodPromise",e.ZodBranded="ZodBranded",e.ZodPipeline="ZodPipeline",e.ZodReadonly="ZodReadonly"})(C||(C={}));var v=at.create,ke=Rt.create,xd=Ar.create,yd=Pt.create,He=kr.create,vd=Vt.create,kd=_r.create,_d=Ft.create,ya=Xt.create,wd=wr.create,Sd=gt.create,Td=st.create,Ed=Sr.create,Me=Ze.create,{create:ue,strictCreate:Ad}=xe,va=Kt.create,Cd=fo.create,Rd=Jt.create,Pd=it.create,ka=Tr.create,Od=Er.create,Id=Ot.create,Md=Ht.create,Nd=Yt.create,nn=qt.create,rt=bt.create,Ld=Wt.create,$d=It.create,Ud=tt.create,Dd=et.create,Gd=pt.create,jd=tt.createWithPreprocess,zd=Cr.create;var go=["http","vercel","cloudflare","deno","netlify"];var sn=ue({id:v(),name:v(),type:rt(go),proxyUrl:v(),isActive:He(),testStatus:rt(["active","error"]).nullable().optional(),lastTestedAt:ke().nullable().optional(),lastError:v().nullable().optional(),rateLimitedUntil:ke().nullable().optional()}),Xd=ue({name:v().min(1),type:rt(go),proxyUrl:v().min(1),isActive:He().optional()}),Kd=ue({name:v().min(1).optional(),proxyUrl:v().min(1).optional(),isActive:He().optional()}),Jd=ue({accountId:v().min(1),apiToken:v().min(1),projectName:v().optional()}),Yd=ue({vercelToken:v().min(1),projectName:v().optional()}),qd=ue({denoToken:v().min(1),orgDomain:v().min(1),projectName:v().optional()}),Wd=ue({netlifyToken:v().min(1),projectName:v().optional()}),cn=ue({ok:He(),status:ke().optional(),statusText:v().nullable().optional(),elapsedMs:ke().optional(),error:v().nullable().optional()}),dn=["single","round-robin","random"],ln=["off","lite","full","ultra"],pn=["off","lite","full","ultra"],_a=ue({id:v().trim().toLowerCase().min(1).max(40).regex(/^[a-z0-9][a-z0-9._-]*$/,"Use a lowercase model-combo slug."),name:v().trim().min(1).max(80),models:Me(v().trim().min(1).max(200)).min(2).max(6)}).superRefine((e,t)=>{let r=new Set;e.models.forEach((o,n)=>{let a=o.trim().toLowerCase();if(r.has(a))t.addIssue({code:f.custom,path:["models",n],message:"A model can appear only once in a combo."});r.add(a)})}),un=Me(_a).max(20).superRefine((e,t)=>{let r=new Set;e.forEach((o,n)=>{let a=o.id.toLowerCase();if(r.has(a))t.addIssue({code:f.custom,path:[n,"id"],message:"Model-combo IDs must be unique."});r.add(a)})}),wa=ue({version:nn(1),port:ke().int().min(1024).max(65535),apiKey:v().min(8),upstream:v(),upstreamApiKey:v().max(4096).optional(),selectedModels:Me(v()),fallbackModels:Me(v().min(1)).max(2).default([]),modelCombos:un.default([]),proxyPools:Me(sn),proxyStrategy:rt(dn).default("single"),activePoolId:v().nullable().optional(),stickyLimit:ke().int().min(1).max(100).default(1),rtkEnabled:He().default(!0),cavemanLevel:rt(ln).default("off"),ponytailLevel:rt(pn).default("off")}),Sa=v().url().refine((e)=>{try{let t=new URL(e);return(t.protocol==="http:"||t.protocol==="https:")&&!t.username&&!t.password&&!t.hash}catch{return!1}},"Use an HTTP(S) base URL without embedded credentials or a fragment."),Qd=ue({port:ke().int().min(1024).max(65535).optional(),apiKey:v().min(1).optional(),upstream:Sa.optional(),upstreamApiKey:v().max(4096).optional(),selectedModels:Me(v()).optional(),fallbackModels:Me(v().min(1)).max(2).optional(),modelCombos:un.optional(),proxyPools:Me(sn).optional(),proxyStrategy:rt(dn).optional(),activePoolId:v().nullable().optional(),stickyLimit:ke().int().min(1).max(100).optional(),rtkEnabled:He().optional(),cavemanLevel:rt(ln).optional(),ponytailLevel:rt(pn).optional()}),Zd=ue({modelId:v().min(1)}),mn=ue({ok:He(),modelId:v(),elapsedMs:ke().int().nonnegative().optional(),reply:v().optional(),error:v().optional()}),Ta=ue({id:v(),name:v(),limit:ue({context:ke().optional(),output:ke().optional()}).optional(),capabilities:ue({tools:He().optional(),input:Me(v()).optional(),output:Me(v()).optional()}).optional(),variants:Me(ue({id:v(),settings:ka(v(),va([v(),ke(),He(),ya()])).optional()})).optional()});var Ea=ue({at:ke(),method:v(),path:v(),model:v(),requestedModel:v().optional(),status:ke(),ms:ke(),poolName:v().optional(),fallbackUsed:He().optional(),fallbackReason:v().optional(),inputTokens:ke().int().nonnegative().optional(),outputTokens:ke().int().nonnegative().optional(),totalTokens:ke().int().nonnegative().optional(),error:v().optional()}),Aa=ue({providerId:v(),path:v(),installed:He(),models:ke(),modelIds:Me(v())}),$e=ue({running:He(),routerError:v(),endpoint:v(),config:wa,upstreamApiKeyConfigured:He(),models:Me(Ta),modelsFetchedAt:ke().nullable(),modelsError:v(),upstreamCount:ke(),registration:Aa,preview:v(),warnings:Me(v()),requests:Me(Ea)}),fn=ue({kind:rt(go),code:v()}),el=ue({ok:nn(!0)});class Mt extends Error{code;constructor(e,t){super(t);this.name="ServiceError",this.code=e}}var Ca=ue({error:ue({code:v(),message:v()})}),Ra=(e)=>{try{return JSON.parse(e)}catch{return null}},hn=(e)=>{let t=async(r,o,n,a)=>{let s;try{s=await e.serviceRequest({method:r,path:o,body:a===void 0?void 0:JSON.stringify(a)})}catch(u){throw new Mt("no-service",u instanceof B&&u.code==="NO_SERVICE"?"Allow the local service for this extension in Settings, Extensions.":"Could not reach the local service.")}let d=Ra(s.body);if(s.status>=400){let u=Ca.safeParse(d);throw new Mt(u.success?u.data.error.code:"unknown",u.success?u.data.error.message:"The local service refused the request.")}let l=n.safeParse(d);if(!l.success)throw new Mt("bad-answer","The local service answered with something this panel does not understand.");return l.data};return{state:()=>t("GET","/state",$e),patchConfig:(r)=>t("PUT","/config",$e,r),rotateKey:()=>t("POST","/api-key/rotate",$e,{}),refreshModels:()=>t("POST","/models/refresh",$e,{}),testModel:(r)=>t("POST","/models/test",mn,{modelId:r}),register:()=>t("POST","/register",$e,{}),unregister:()=>t("POST","/unregister",$e,{}),relaySource:(r)=>t("GET",`/relays/${r}`,fn),createProxyPool:(r)=>t("POST","/proxy-pools",$e,r),updateProxyPool:(r,o)=>t("PUT",`/proxy-pools/${r}`,$e,o),deleteProxyPool:(r)=>t("DELETE",`/proxy-pools/${r}`,$e),testProxyPool:(r)=>t("POST",`/proxy-pools/${r}/test`,cn,{}),deployCloudflare:(r)=>t("POST","/proxy-pools/cloudflare-deploy",$e,r),deployVercel:(r)=>t("POST","/proxy-pools/vercel-deploy",$e,r),deployDeno:(r)=>t("POST","/proxy-pools/deno-deploy",$e,r),deployNetlify:(r)=>t("POST","/proxy-pools/netlify-deploy",$e,r)}};var gn=(e)=>{let t=null,r="",o=!1,n=new Set,a=()=>{for(let u of n)u()},s=(u)=>u instanceof Mt?u.message:u instanceof Error?u.message:String(u),d=async(u)=>{o=!0,a();try{t=await u(e),r=""}catch(b){r=s(b)}finally{o=!1,a()}};return{state:()=>t,error:()=>r,busy:()=>o,subscribe:(u)=>{n.add(u)},load:()=>d((u)=>u.state()),poll:async()=>{if(o)return;try{t=await e.state(),r="",a()}catch{}},run:d}};var bn=`
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

/* BlackRouter compact operations-console refresh; retains OpenChamber theme tokens. */
:root { --br-accent-soft: color-mix(in srgb, var(--oc-primary) 11%, transparent); --br-accent-line: color-mix(in srgb, var(--oc-primary) 35%, var(--oc-border)); --br-panel-shadow: 0 8px 24px color-mix(in srgb, #000 12%, transparent); }
.br-root { width: 100%; max-width: 1080px; margin-inline: auto; padding: clamp(12px, 2.2vw, 22px); gap: 16px; }
.br-header { padding-bottom: 15px; border-bottom-color: color-mix(in srgb, var(--oc-border) 78%, transparent); }
.br-logo-box { width: 34px; height: 34px; border-radius: 10px; color: var(--oc-primary); background: var(--br-accent-soft); border-color: var(--br-accent-line); }
.br-title-row h1 { font-size: 16px; letter-spacing: -.035em; }
.br-header-sub { font-size: 11.5px; }
.br-nav-bar { position: sticky; top: 0; z-index: 5; padding: 5px; border: 1px solid var(--oc-border); border-radius: 12px; background: color-mix(in srgb, var(--oc-bg) 88%, transparent); backdrop-filter: blur(14px); }
.br-nav-bar [role="tablist"] { display: flex; width: 100%; gap: 4px; padding: 0; border: 0; background: transparent; overflow-x: auto; }
.br-nav-bar [role="tab"] { flex: 1 0 auto; justify-content: center; min-height: 34px; padding: 7px 12px; border: 1px solid transparent; border-radius: 8px; color: var(--oc-muted); font-size: 11.5px; font-weight: 550; transition: background .16s ease, color .16s ease, border-color .16s ease; }
.br-nav-bar [role="tab"]:hover { color: var(--oc-fg); background: var(--oc-hover); }
.br-nav-bar [role="tab"][aria-selected="true"], .br-nav-bar [role="tab"].active, .br-nav-bar [data-state="active"] { color: var(--oc-fg); background: var(--oc-elevated, var(--oc-muted-surface)); border-color: var(--oc-border); box-shadow: 0 1px 2px color-mix(in srgb, #000 10%, transparent); }
.br-stack { gap: 14px; }
.br-card { position: relative; gap: 14px; padding: clamp(13px, 2vw, 18px); border-radius: 12px; border-color: color-mix(in srgb, var(--oc-border) 88%, transparent); box-shadow: var(--br-panel-shadow); }
.br-card-header { align-items: center; padding-bottom: 11px; border-bottom: 1px solid color-mix(in srgb, var(--oc-border) 70%, transparent); }
.br-card-title { font-size: 13px; font-weight: 650; letter-spacing: -.015em; }
.br-card-desc { font-size: 11.5px; line-height: 1.55; max-width: 72ch; }
.br-kv-grid { grid-template-columns: repeat(auto-fit, minmax(min(100%, 245px), 1fr)); gap: 10px; }
.br-kv-box { min-width: 0; border-radius: 10px; padding: 12px; background: color-mix(in srgb, var(--oc-bg) 86%, var(--oc-elevated, var(--oc-muted-surface))); }
.br-kv-label { font-size: 10px; letter-spacing: .075em; }
.br-kv-val { align-items: flex-start; flex-wrap: wrap; }
.br-kv-text { min-width: 0; line-height: 1.7; }
.br-btn { min-height: 27px; padding: 5px 10px; border-radius: 7px; font-size: 11px; font-weight: 600; transition: transform .12s ease, background .12s ease, border-color .12s ease; }
.br-btn:hover:not(:disabled) { border-color: var(--br-accent-line); }
.br-btn:active:not(:disabled) { transform: translateY(1px); }
.br-btn.primary { box-shadow: 0 2px 8px color-mix(in srgb, var(--oc-primary) 16%, transparent); }
.br-badge { padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 650; letter-spacing: .015em; }
.br-dot { width: 7px; height: 7px; box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 12%, transparent); }
.br-strategy-toolbar { border-radius: 10px; padding: 10px 12px; }
.br-strategy-tabs { border-radius: 8px; padding: 3px; }
.br-strategy-tab { padding: 5px 10px; border-radius: 6px; }
.br-pool-card, .br-model-card { border-radius: 10px; padding: 11px 12px; border-color: color-mix(in srgb, var(--oc-border) 90%, transparent); transition: transform .14s ease, border-color .14s ease, background .14s ease, box-shadow .14s ease; }
.br-pool-card:hover, .br-model-card:hover { border-color: var(--br-accent-line); box-shadow: 0 3px 12px color-mix(in srgb, #000 9%, transparent); }
.br-pool-card.active, .br-model-card.selected { border-color: var(--br-accent-line); background: var(--br-accent-soft); box-shadow: inset 3px 0 0 var(--oc-primary); }
.br-models-grid { grid-template-columns: repeat(auto-fill, minmax(min(100%, 255px), 1fr)); gap: 9px; max-height: min(56vh, 560px); padding: 2px; }
.br-model-name { font-size: 12px; font-weight: 650; }
.br-model-id { font-size: 10px; }
.br-search-input, .br-sticky-input { min-height: 36px; padding: 8px 11px; border-radius: 9px; }
.br-deploy-box { border-style: solid; border-radius: 11px; padding: 13px; }
.br-deploy-nav { gap: 5px; }
.br-deploy-tab { padding: 6px 9px; border-radius: 7px; }
.br-deploy-tab.active { background: var(--br-accent-soft); color: var(--oc-primary); }
.br-opencode-hero { border-radius: 11px; padding: 15px; background: color-mix(in srgb, var(--oc-bg) 82%, var(--oc-elevated, var(--oc-muted-surface))); }
.br-json-block { border-radius: 10px; padding: 13px; line-height: 1.65; }
.br-call-row { padding: 9px 0; }
.br-call-name { max-width: 65%; }
.br-root input:focus-visible, .br-root button:focus-visible, .br-root [role="tab"]:focus-visible { outline: 2px solid var(--oc-focus); outline-offset: 2px; }
@media (max-width: 560px) {
  .br-root { padding: 10px; gap: 12px; }
  .br-header { align-items: flex-start; }
  .br-header-left { gap: 8px; }
  .br-title-row { flex-wrap: wrap; gap: 5px; }
  .br-nav-bar { padding: 4px; }
  .br-nav-bar [role="tab"] { padding-inline: 9px; }
  .br-card { padding: 12px; }
  .br-card-header { align-items: flex-start; }
  .br-opencode-hero { align-items: stretch; flex-direction: column; }
  .br-pool-card { align-items: flex-start; }
  .br-pool-actions { flex-wrap: wrap; justify-content: flex-end; }
}
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; } }

`;var i=(e,t="",r="")=>{let o=document.createElement(e);if(t)o.className=t;if(r)o.textContent=r;return o},xn=(e,t="")=>{let r=i("div",`br-row ${t}`.trim());return e.append(r),r},ut=(e,t="")=>{let r=i("div",`br-stack ${t}`.trim());return e.append(r),r},Pe=(e,t,r)=>{let o=i("section","br-card"),n=i("header","br-card-header"),a=i("div"),s=i("h3","br-card-title",t);if(a.append(s),r){let d=i("p","br-card-desc",r);a.append(d)}return n.append(a),o.append(n),e.append(o),{card:o,body:o}},N=(e,t,r,o="default")=>{let n=i("button",`br-btn ${o!=="default"?o:""}`.trim(),t);return n.type="button",n.addEventListener("click",r),e.append(n),n};var Pa=(e)=>e===null?"never":new Date(e).toLocaleTimeString(),Je=(e)=>{let t=e.trim().replace(/\([^()]+\)\s*$/,"");return(t.startsWith("blackrouter/")?t.slice(12):t).toLowerCase()},yn=(e)=>{if(e>=1e6){if(e===1e6||e===1048576)return"1M";let t=e/1e6;return`${t.toFixed(t%1===0?0:1)}M`}if(e>=1000){if(e%1000===0)return`${e/1000}k`;return`${Math.round(e/1024)}k`}return`${e}`},vn=(e,t,r)=>{let o=ut(document.createElement("div")),n="",a="",s=null,d={},l=!1,u=null,b="",F="",S=[],J="",Te=(m)=>m.config.selectedModels.length>0?m.config.selectedModels:m.models.map((M)=>M.id),Ee=async(m)=>{n="",await e.run((M)=>M.patchConfig({selectedModels:m})),h()},j=(m,M,X)=>{let fe=Te(m);if(!X&&fe.length<=1){n="Keep at least one free model selected so OpenCode has an endpoint to call.",h();return}let c=X?[...fe,M]:fe.filter((p)=>p!==M);Ee(c)},R=(m)=>{Ee(m.models.map((M)=>M.id))},y=(m)=>{if(m.models.length>0)Ee([m.models[0].id])},ie=async(m)=>{if(n="",await e.run((M)=>M.patchConfig({fallbackModels:m.slice(0,2)})),e.error()){n=e.error(),h();return}await r.toast({kind:"success",message:"Model fallback order saved."}),h()},ce=async(m)=>{if(n="",await e.run((M)=>M.patchConfig({modelCombos:m})),e.error()){n=e.error(),h();return}l=!1,u=null,b="",F="",S=[],J="",await r.toast({kind:"success",message:"Named model combo saved."}),h()},V=(m)=>{n="",l=!0,u=m?.id??null,b=m?.id??"",F=m?.name??"",S=m?[...m.models]:[],J="",h()},Ye=async(m)=>{let M=b.trim().toLowerCase(),X=F.trim();if(!/^[a-z0-9][a-z0-9._-]{0,39}$/.test(M)){n="Combo ID must be a lowercase slug (letters, numbers, dot, underscore, hyphen).",h();return}if(!X||X.length>80){n="Enter a combo name of 1–80 characters.",h();return}if(S.length<2||S.length>6){n="A named combo needs 2–6 models in priority order.",h();return}let fe=S.map(Je);if(new Set(fe).size!==fe.length){n="A model can appear only once in a combo.",h();return}if(m.some((E)=>E.id.toLowerCase()===M&&E.id!==u)){n="That combo ID already exists.",h();return}let c={id:M,name:X,models:[...S]},p=u?m.map((E)=>E.id===u?c:E):[...m,c];await ce(p)},ye=async(m)=>{let M=e.state();if(!M)return;await ce((M.config.modelCombos??[]).filter((X)=>X.id!==m))},Q=async()=>{if(n="",await e.run((m)=>m.refreshModels()),e.error())await r.toast({kind:"error",message:e.error()});h()},h=()=>{o.replaceChildren();let m=e.state();if(!m)return;let{card:M}=Pe(o,"OpenCode Zen Free Catalog","Select the free models OpenCode and clients can call. Paid models are filtered out.");if(m.modelsError){let k=i("div");ze(k,{tone:"warning",title:"Could not refresh catalog",body:m.modelsError}),M.append(k)}if(n){let k=i("div");ze(k,{tone:"error",title:"Selection notice",body:n}),M.append(k)}if(m.models.length===0){jt(M,{title:"No free models detected",body:"Refresh the list. If it stays empty, check the upstream and any relay configured.",action:{label:"Refresh",onClick:()=>void Q()}});return}let X=i("input","br-search-input");X.type="text",X.placeholder="Search free models by name or id...",X.value=a,X.oninput=()=>{a=X.value.toLowerCase(),ae()},M.append(X);let fe=i("div","br-row between"),c=Te(m),p=i("span","br-muted br-mono",`${c.length} of ${m.models.length} active · Updated ${Pa(m.modelsFetchedAt)}`);fe.append(p);let E=i("div","br-row");N(E,"Select All",()=>R(m)),N(E,"Reset",()=>y(m)),N(E,"Refresh List",()=>void Q()),fe.append(E),M.append(fe);let L=i("div","br-models-grid");M.append(L);let ae=()=>{L.replaceChildren();let k=m.models.filter((w)=>w.id.toLowerCase().includes(a)||w.name.toLowerCase().includes(a));if(k.length===0){let w=i("p","br-muted","No free models match your filter.");L.append(w);return}for(let w of k){let se=c.includes(w.id),oe=i("div",`br-model-card ${se?"selected":""}`),Z=i("div","br-model-card-info");Z.append(i("span","br-model-name",w.name)),Z.append(i("span","br-model-id",w.id));let ee=i("div","br-row");ee.style.gap="4px",ee.style.marginTop="4px";let le=w.limit?.context?yn(w.limit.context):"128k";if(ee.append(i("span","br-badge br-badge-neutral",`${le} ctx`)),w.limit?.output){let me=yn(w.limit.output);ee.append(i("span","br-badge br-badge-neutral",`${me} out`))}if(w.capabilities?.input?.includes("image"))ee.append(i("span","br-badge br-badge-neutral","Vision"));if(w.variants&&w.variants.length>0)ee.append(i("span","br-badge br-badge-running","Thinking"));if(w.capabilities?.tools)ee.append(i("span","br-badge br-badge-neutral","Tools"));Z.append(ee),oe.append(Z);let te=i("div","br-model-right"),Y=d[w.id];if(Y)if(Y.ok)te.append(i("span","br-badge br-badge-running",`${Y.elapsedMs??0}ms ✓`));else{let me=i("span","br-badge br-badge-stopped","Failed ✗");me.title=Y.error||"Test failed",te.append(me)}let De=s===w.id,qe=N(te,De?"Testing...":"Test",async(me)=>{me.stopPropagation(),s=w.id,ae();try{let Ce=await t.testModel(w.id);if(d[w.id]=Ce,Ce.ok)await r.toast({kind:"success",message:`${w.name}: Test passed (${Ce.elapsedMs??0}ms). "${Ce.reply?.slice(0,40)||"OK"}"`});else await r.toast({kind:"error",message:`${w.name}: ${Ce.error||"Test failed."}`})}catch(Ce){d[w.id]={ok:!1,modelId:w.id,error:String(Ce)},await r.toast({kind:"error",message:Ce instanceof Error?Ce.message:String(Ce)})}finally{s=null,ae()}});qe.disabled=De;let re=i("div");ao(re,{label:"",checked:se,onChange:(me)=>j(m,w.id,me)}),te.append(re),oe.append(te),oe.onclick=(me)=>{if(me.target.closest("input, button"))return;j(m,w.id,!se)},L.append(oe)}};ae();let{card:K}=Pe(o,"Automatic Model Fallback","If a request fails with a retryable upstream error, BlackRouter tries these models in order. The requested model is always attempted first."),ve=m.config.fallbackModels??[];if(ve.length===0)K.append(i("p","br-muted","No fallback models configured. Failed requests will return the upstream error."));let Ae=i("div","br-stack");for(let k=0;k<ve.length;k+=1){let w=ve[k],se=m.models.find((Y)=>Je(Y.id)===Je(w)),oe=i("div","br-row between");oe.style.alignItems="center";let Z=i("div","br-stack");Z.append(i("span","br-model-name",`${k+1}. ${se?.name??w}`)),Z.append(i("span","br-model-id",w)),oe.append(Z);let ee=i("div","br-row"),le=N(ee,"Move up",()=>{if(k===0)return;let Y=[...ve];[Y[k-1],Y[k]]=[Y[k],Y[k-1]],ie(Y)});le.disabled=k===0;let te=N(ee,"Move down",()=>{if(k>=ve.length-1)return;let Y=[...ve];[Y[k+1],Y[k]]=[Y[k],Y[k+1]],ie(Y)});te.disabled=k>=ve.length-1,N(ee,"Remove",()=>{ie(ve.filter((Y,De)=>De!==k))}),oe.append(ee),Ae.append(oe)}K.append(Ae);let we=new Set(ve.map(Je)),Oe=m.models.filter((k)=>!we.has(Je(k.id))),Ve=i("div","br-row"),D=i("select","br-search-input");D.style.flex="1";let O=document.createElement("option");O.value="",O.textContent=Oe.length>0?"Choose a fallback model…":"No additional models available",D.append(O);for(let k of Oe){let w=document.createElement("option");w.value=k.id,w.textContent=k.name,D.append(w)}D.disabled=ve.length>=2||Oe.length===0,Ve.append(D);let de=N(Ve,"Add fallback",()=>{if(!D.value||ve.length>=2)return;ie([...ve,D.value])},"primary");de.disabled=D.disabled,K.append(Ve),K.append(i("p","br-muted","Fallbacks are tried only for HTTP 404, 408, 429, 500, 502, 503, or 504. Up to two fallback models are allowed per request."));let{card:Ne}=Pe(o,"Named Model Combos","Create a reusable model alias with its own ordered fallback chain. In OpenCode, use blackrouter/combo/<id>."),I=m.config.modelCombos??[];if(I.length===0)Ne.append(i("p","br-muted","No named combos yet. Each combo can contain 2–6 free models and is limited to a maximum of 20 combos."));for(let k of I){let w=i("div","br-stack");w.style.gap="6px",w.style.padding="10px 0",w.style.borderBottom="1px solid var(--border-subtle, rgba(127,127,127,.22))";let se=i("div","br-row between"),oe=i("div","br-stack");oe.append(i("span","br-model-name",k.name)),oe.append(i("span","br-model-id","blackrouter/combo/"+k.id)),se.append(oe);let Z=i("div","br-row");N(Z,"Edit",()=>V(k)),N(Z,"Remove",()=>void ye(k.id)),se.append(Z),w.append(se),k.models.forEach((ee,le)=>{let te=m.models.find((Y)=>Je(Y.id)===Je(ee));w.append(i("span","br-muted",le+1+". "+(te?.name??ee)))}),Ne.append(w)}if(l){let k=i("div","br-stack");k.style.gap="8px",k.style.marginTop="10px";let w=i("input","br-search-input");w.type="text",w.maxLength=40,w.placeholder="combo-id (e.g. fast-coding)",w.value=b,w.disabled=u!==null,w.oninput=()=>{b=w.value.toLowerCase()},k.append(i("label","br-muted","Combo ID")),k.append(w);let se=i("input","br-search-input");se.type="text",se.maxLength=80,se.placeholder="Display name",se.value=F,se.oninput=()=>{F=se.value},k.append(i("label","br-muted","Display name")),k.append(se),k.append(i("label","br-muted","Priority order · "+S.length+"/6 models"));let oe=i("div","br-stack");for(let re=0;re<S.length;re+=1){let me=S[re],Ce=m.models.find((Ut)=>Je(Ut.id)===Je(me)),Lt=i("div","br-row between"),$t=i("div","br-stack");$t.append(i("span","br-model-name",re+1+". "+(Ce?.name??me))),$t.append(i("span","br-model-id",me)),Lt.append($t);let xt=i("div","br-row"),Ge=N(xt,"↑",()=>{if(re===0)return;[S[re-1],S[re]]=[S[re],S[re-1]],h()});Ge.title="Move model up",Ge.disabled=re===0;let or=N(xt,"↓",()=>{if(re>=S.length-1)return;[S[re+1],S[re]]=[S[re],S[re+1]],h()});or.title="Move model down",or.disabled=re>=S.length-1,N(xt,"Remove",()=>{S=S.filter((Ut,ct)=>ct!==re),h()}),Lt.append(xt),oe.append(Lt)}k.append(oe);let Z=new Set(S.map(Je)),ee=m.models.filter((re)=>!Z.has(Je(re.id))),le=i("div","br-row"),te=i("select","br-search-input");te.style.flex="1";let Y=document.createElement("option");Y.value="",Y.textContent=ee.length>0?"Choose a free model…":"No additional models available",te.append(Y);for(let re of ee){let me=document.createElement("option");me.value=re.id,me.textContent=re.name,te.append(me)}te.value=J,te.disabled=S.length>=6||ee.length===0,le.append(te);let De=N(le,"Add model",()=>{if(!J||S.length>=6)return;S=[...S,J],J="",h()});te.onchange=()=>{J=te.value,De.disabled=te.disabled||!J},De.disabled=te.disabled||!J,le.append(De),k.append(le);let qe=i("div","br-row");N(qe,"Save Combo",()=>void Ye(I),"primary"),N(qe,"Cancel",()=>{l=!1,u=null,b="",F="",S=[],J="",h()}),k.append(qe),Ne.append(k)}else{let k=N(Ne,"Create Model Combo",()=>V(),"primary");k.disabled=I.length>=20}};return{element:o,render:h}};var kn=(e,t)=>{let r=ut(document.createElement("div")),o=!1,n=async(d,l)=>{try{await t.writeClipboard(d),await t.toast({kind:"success",message:`${l} copied.`})}catch{await t.toast({kind:"error",message:"Failed to copy."})}},a=async(d,l)=>{if(o=!1,await e.run(d),e.error())await t.toast({kind:"error",message:e.error()});else await t.toast({kind:"success",message:l});s()},s=()=>{r.replaceChildren();let d=e.state();if(!d)return;let{card:l}=Pe(r,"OpenCode Provider Registration","BlackRouter registers this local endpoint directly into OpenCode’s configuration file.");for(let y of d.warnings){let ie=i("div");ze(ie,{tone:"warning",title:"File warning",body:y}),l.append(ie)}let u=i("div","br-opencode-hero"),b=i("div","br-opencode-desc"),F=i("span",`br-badge ${d.registration.installed?"br-badge-running":"br-badge-neutral"}`,d.registration.installed?"Registered":"Not Registered"),S=i("div","br-row");S.append(F),S.append(i("span","br-mono",d.registration.path)),b.append(S);let J=i("span","br-muted",d.registration.installed?`${d.registration.models} free model${d.registration.models===1?"":"s"} registered in OpenCode config.`:"Click register to add BlackRouter into your active OpenCode configuration.");b.append(J),u.append(b);let Te=i("div","br-row");if(d.registration.installed)N(Te,"Update Provider",()=>void a((y)=>y.register(),"Provider updated in OpenCode config."),"primary"),N(Te,o?"Confirm Remove?":"Remove",()=>{if(!o){o=!0,s();return}a((y)=>y.unregister(),"Provider removed from OpenCode config.")},o?"destructive":"default");else{let y=N(Te,"Register in OpenCode",()=>void a((ie)=>ie.register(),"Provider added to OpenCode config."),"primary");y.disabled=d.models.length===0}u.append(Te),l.append(u);let{card:Ee}=Pe(r,"Config Block Preview","The exact JSON configuration written to OpenCode."),j=i("pre","br-json-block",d.preview);Ee.append(j);let R=i("div","br-row");N(R,"Copy JSON Block",()=>void n(d.preview,"Config block")),Ee.append(R)};return{element:r,render:s}};var Oa=[{id:"cloudflare",label:"Cloudflare Worker"},{id:"vercel",label:"Vercel Edge"},{id:"deno",label:"Deno Deploy"},{id:"netlify",label:"Netlify Function"},{id:"http",label:"Forward Proxy"}],_n=(e,t,r)=>{let o=ut(document.createElement("div")),n=!1,a="cloudflare",s=!1,d="",l=null,u={name:"",type:"http",proxyUrl:""},b={accountId:"",apiToken:"",projectName:""},F={vercelToken:"",projectName:""},S={denoToken:"",orgDomain:"",projectName:""},J={netlifyToken:"",projectName:""},Te=async(h,m)=>{try{await r.writeClipboard(h),await r.toast({kind:"success",message:`${m} copied.`})}catch{d="The clipboard refused the copy.",Q()}},Ee=async(h)=>{try{let m=await t.relaySource(h);await Te(m.code,`${h} relay code`)}catch(m){await r.toast({kind:"error",message:m instanceof Error?m.message:String(m)})}},j=async()=>{s=!0,d="",Q();try{if(a==="http"){if(!u.name.trim()||!u.proxyUrl.trim())throw Error("Name and Proxy URL are required.");await e.run((h)=>h.createProxyPool({name:u.name.trim(),type:"http",proxyUrl:u.proxyUrl.trim(),isActive:!0})),u.name="",u.proxyUrl=""}else if(a==="cloudflare"){if(!b.accountId.trim()||!b.apiToken.trim())throw Error("Cloudflare Account ID and API Token are required.");await e.run((h)=>h.deployCloudflare({accountId:b.accountId.trim(),apiToken:b.apiToken.trim(),projectName:b.projectName.trim()||void 0})),b.accountId="",b.apiToken="",b.projectName=""}else if(a==="vercel"){if(!F.vercelToken.trim())throw Error("Vercel API Token is required.");await e.run((h)=>h.deployVercel({vercelToken:F.vercelToken.trim(),projectName:F.projectName.trim()||void 0})),F.vercelToken="",F.projectName=""}else if(a==="deno"){if(!S.denoToken.trim()||!S.orgDomain.trim())throw Error("Deno Deploy Token and Organization Domain are required.");await e.run((h)=>h.deployDeno({denoToken:S.denoToken.trim(),orgDomain:S.orgDomain.trim(),projectName:S.projectName.trim()||void 0})),S.denoToken="",S.orgDomain="",S.projectName=""}else if(a==="netlify"){if(!J.netlifyToken.trim())throw Error("Netlify API Token is required.");await e.run((h)=>h.deployNetlify({netlifyToken:J.netlifyToken.trim(),projectName:J.projectName.trim()||void 0})),J.netlifyToken="",J.projectName=""}n=!1,await r.toast({kind:"success",message:"Relay configured and activated."})}catch(h){d=h instanceof Error?h.message:String(h)}finally{s=!1,Q()}},R=async(h)=>{await e.run((m)=>m.updateProxyPool(h.id,{isActive:!h.isActive}))},y=async(h)=>{await e.run((m)=>m.patchConfig({proxyStrategy:h})),await r.toast({kind:"info",message:`Routing strategy set to ${h}.`})},ie=async(h)=>{await e.run((m)=>m.patchConfig({stickyLimit:h}))},ce=async(h)=>{let m=e.state();if(!m)return;let M=m.config.proxyPools.map((X)=>({...X,isActive:X.id===h.id}));await e.run((X)=>X.patchConfig({proxyPools:M,activePoolId:h.id,proxyStrategy:"single"})),await r.toast({kind:"success",message:`${h.name} set as primary route.`})},V=async()=>{let h=e.state();if(!h)return;let m=h.config.proxyPools.map((M)=>({...M,isActive:!1}));await e.run((M)=>M.patchConfig({activePoolId:null,proxyPools:m})),await r.toast({kind:"info",message:"Switched to direct routing."})},Ye=async(h)=>{await e.run((m)=>m.deleteProxyPool(h)),await r.toast({kind:"success",message:"Proxy pool removed."})},ye=async(h)=>{l=h,Q();try{let m=await t.testProxyPool(h);if(await e.load(),m.ok)await r.toast({kind:"success",message:`Relay test passed (${m.elapsedMs||0}ms).`});else await r.toast({kind:"error",message:m.error||"Relay test failed."})}catch(m){await r.toast({kind:"error",message:m instanceof Error?m.message:String(m)})}finally{l=null,Q()}},Q=()=>{o.replaceChildren();let h=e.state();if(!h)return;let m=h.config.proxyStrategy||"single",M=h.config.stickyLimit??1,{card:X}=Pe(o,"Upstream Routing & Strategy","Select whether calls go directly, through a dedicated relay, or load-balance across pools."),fe=i("div","br-strategy-toolbar"),c=i("div","br-strategy-group");c.append(i("span","br-strategy-label","Strategy:"));let p=i("div","br-strategy-tabs"),E=[{id:"single",label:"Single Pool"},{id:"round-robin",label:"Round-Robin"},{id:"random",label:"Random"}];for(let D of E){let O=i("button",`br-strategy-tab ${m===D.id?"active":""}`,D.label);O.onclick=()=>void y(D.id),p.append(O)}if(c.append(p),fe.append(c),m==="round-robin"){let D=i("div","br-sticky-control");D.append(i("span","","Sticky Turns:"));let O=i("input","br-sticky-input");O.type="number",O.min="1",O.max="100",O.value=String(M),O.onchange=()=>{let de=Math.max(1,parseInt(O.value,10)||1);O.value=String(de),ie(de)},D.append(O),fe.append(D)}X.append(fe);let L=h.config.proxyPools.filter((D)=>D.isActive),ae=h.config.proxyPools.find((D)=>D.id===h.config.activePoolId)||h.config.proxyPools.find((D)=>D.isActive),K=i("div","br-pool-card active"),ve=i("div","br-pool-left"),Ae=i("div","br-pool-info"),we=i("div","br-pool-title-row");if(m==="round-robin")we.append(i("span","br-pool-name","Round-Robin Load Balancing")),we.append(i("span",L.length>0?"br-badge br-badge-primary":"br-badge br-badge-stopped",`${L.length} Pools Active`)),Ae.append(we),Ae.append(i("span","br-pool-url",L.length>0?`Sequentially rotating across ${L.length} active relays with ${M} sticky turn(s) each.`:"No relays active in pool. Falling back to direct connection."));else if(m==="random")we.append(i("span","br-pool-name","Random Upstream Routing")),we.append(i("span",L.length>0?"br-badge br-badge-primary":"br-badge br-badge-stopped",`${L.length} Pools Active`)),Ae.append(we),Ae.append(i("span","br-pool-url",L.length>0?`Distributing requests uniformly at random across ${L.length} active relays.`:"No relays active in pool. Falling back to direct connection."));else if(ae)we.append(i("span","br-pool-name",ae.name)),we.append(i("span","br-badge br-badge-primary",ae.type==="http"?"Forward Proxy":`${ae.type} Relay`)),Ae.append(we),Ae.append(i("span","br-pool-url",ae.proxyUrl));else we.append(i("span","br-pool-name","Direct Connection")),we.append(i("span","br-badge br-badge-neutral","Direct")),Ae.append(we),Ae.append(i("span","br-pool-url","Direct requests from this machine to https://opencode.ai/zen/v1"));ve.append(Ae),K.append(ve);let Oe=i("div","br-pool-actions");if(m==="single"&&ae)N(Oe,"Switch to Direct",()=>void V());if(N(Oe,n?"Close Form":"+ Add / Deploy Relay",()=>{n=!n,d="",Q()},n?"default":"primary"),K.append(Oe),X.append(K),n){let D=i("div","br-deploy-box");if(d){let I=i("div");ze(I,{tone:"error",title:"Deployment error",body:d}),D.append(I)}let O=i("div","br-deploy-nav");for(let I of Oa){let k=i("button",`br-deploy-tab ${a===I.id?"active":""}`,I.label);k.onclick=()=>{a=I.id,d="",Q()},O.append(k)}D.append(O);let de=i("div","br-stack");if(D.append(de),a==="cloudflare")Le(de,{label:"Account ID",value:b.accountId,placeholder:"Cloudflare dashboard -> Overview",onChange:(I)=>b.accountId=I}),Le(de,{label:"API Token",value:b.apiToken,password:!0,placeholder:"Cloudflare Workers edit permissions",onChange:(I)=>b.apiToken=I}),Le(de,{label:"Worker Name",value:b.projectName,placeholder:"blackrouter-relay (optional)",onChange:(I)=>b.projectName=I});else if(a==="vercel")Le(de,{label:"Vercel API Token",value:F.vercelToken,password:!0,placeholder:"Account Settings -> Tokens",onChange:(I)=>F.vercelToken=I}),Le(de,{label:"Project Name",value:F.projectName,placeholder:"blackrouter-relay (optional)",onChange:(I)=>F.projectName=I});else if(a==="deno")Le(de,{label:"Deno Access Token",value:S.denoToken,password:!0,placeholder:"Deno Deploy -> Access Tokens",onChange:(I)=>S.denoToken=I}),Le(de,{label:"Organization / Subdomain",value:S.orgDomain,placeholder:"your-org.deno.dev",onChange:(I)=>S.orgDomain=I}),Le(de,{label:"Project Name",value:S.projectName,placeholder:"blackrouter-relay (optional)",onChange:(I)=>S.projectName=I});else if(a==="netlify")Le(de,{label:"Netlify Personal Access Token",value:J.netlifyToken,password:!0,placeholder:"User Settings -> Applications",onChange:(I)=>J.netlifyToken=I}),Le(de,{label:"Site Name",value:J.projectName,placeholder:"blackrouter-relay (optional)",onChange:(I)=>J.projectName=I});else if(a==="http")Le(de,{label:"Proxy Name",value:u.name,placeholder:"e.g. Clash / Corporate Proxy",onChange:(I)=>u.name=I}),Le(de,{label:"Proxy URL",value:u.proxyUrl,placeholder:"http://127.0.0.1:7890 or http://user:pass@host:port",onChange:(I)=>u.proxyUrl=I});let Ne=i("div","br-row");if(N(Ne,s?"Saving...":a==="http"?"Add Proxy":"Deploy & Activate",()=>void j(),"primary"),a!=="http")N(Ne,"Copy Standalone Script",()=>void Ee(a));N(Ne,"Cancel",()=>{n=!1,Q()}),D.append(Ne),o.append(D)}let{card:Ve}=Pe(o,"Configured Proxy Pools",m==="single"?'Manage deployed relays. Click "Set Primary" to route calls through that relay.':"Manage deployed relays. Toggle relays to include or exclude them from the active rotation pool.");if(h.config.proxyPools.length===0){let D=i("p","br-card-desc","No proxy pools configured. Deploy one using the button above to route through Cloudflare, Vercel, Deno, Netlify, or Forward Proxy.");Ve.append(D)}else{let D=i("div","br-pool-grid");for(let O of h.config.proxyPools){let de=h.config.activePoolId?O.id===h.config.activePoolId:O.isActive,Ne=m==="single"?de:O.isActive,I=i("div",`br-pool-card ${Ne?"active":""}`),k=i("div","br-pool-left"),w=i("div","br-pool-info"),se=i("div","br-pool-title-row");se.append(i("span","br-pool-name",O.name)),se.append(i("span","br-badge br-badge-neutral",O.type==="http"?"Forward Proxy":`${O.type} Relay`));let oe=typeof O.rateLimitedUntil==="number"?O.rateLimitedUntil-Date.now():0,Z=oe>0;if(Z)se.append(i("span","br-badge br-badge-stopped","429 cooldown"));else if(O.testStatus==="active")se.append(i("span","br-badge br-badge-running","Healthy"));else if(O.testStatus==="error")se.append(i("span","br-badge br-badge-stopped","Failed"));if(w.append(se),w.append(i("span","br-pool-url",O.proxyUrl)),Z){let De=Math.ceil(oe/1000),qe=Math.floor(De/60),re=De%60,me=qe>0?qe+"m "+String(re).padStart(2,"0")+"s":re+"s";w.append(i("p","br-card-desc","Upstream rate-limited this pool. Requests skip it for another "+me+"."))}k.append(w),I.append(k);let ee=i("div","br-pool-actions");if(m==="single")N(ee,de?"Primary ✓":"Set Primary",()=>void ce(O),de?"primary":"default");else N(ee,O.isActive?"In Rotation ✓":"Add to Rotation",()=>void R(O),O.isActive?"primary":"default");let le=l===O.id,te=typeof O.rateLimitedUntil==="number"&&O.rateLimitedUntil>Date.now(),Y=N(ee,le?"Testing...":"Test",()=>void ye(O.id));if(Y.disabled=le||te,te)Y.title="This pool is cooling down after HTTP 429; wait until the displayed cooldown ends.";if(O.type!=="http")N(ee,"Copy Script",()=>void Ee(O.type));N(ee,"Delete",()=>void Ye(O.id),"destructive"),I.append(ee),D.append(I)}Ve.append(D)}};return{element:o,render:Q}};var wn=(e,t,r,o)=>{let n=ut(document.createElement("div")),a="",s="",d="",l=!1,u=!1,b="",F=(y)=>{a=String(y.config.port),s=y.config.upstream,d=""},S=async(y,ie)=>{try{await r.writeClipboard(y),await r.toast({kind:"success",message:`${ie} copied.`})}catch{b="The clipboard refused the copy.",R()}},J=async()=>{let y=Number(a);if(!Number.isInteger(y)||y<1024||y>65535){b="The port must be a whole number between 1024 and 65535.",R();return}b="",await e.run((ce)=>ce.patchConfig({port:y}));let ie=e.state();if(ie)F(ie);R()},Te=async()=>{b="",await e.run((y)=>y.rotateKey()),await r.toast({kind:"success",message:"New API key generated and saved."}),R()},Ee=async()=>{b="";let y=s.trim();try{let V=new URL(y);if(V.protocol!=="http:"&&V.protocol!=="https:"||V.username||V.password||V.hash)throw Error("Use an HTTP(S) base URL without embedded credentials or a fragment.")}catch(V){b=V instanceof Error&&V.message.startsWith("Use an HTTP(S)")?V.message:"Enter a valid upstream base URL, such as https://api.openai.com/v1.",R();return}let ie=d;if(await e.run((V)=>V.patchConfig({upstream:y,...ie?{upstreamApiKey:ie}:{}})),e.error()){R();return}let ce=e.state();if(ce)F(ce);await r.toast({kind:"success",message:"Upstream settings saved and model catalog refreshed."}),R()},j=async()=>{if(b="",await e.run((ie)=>ie.patchConfig({upstreamApiKey:""})),e.error()){R();return}let y=e.state();if(y)F(y);await r.toast({kind:"info",message:"Upstream API key cleared."}),R()},R=()=>{n.replaceChildren();let y=e.state();if(!y){if(e.error()){jt(n,{title:"Local service is not reachable",body:"Allow the local service for BlackRouter in Settings -> Extensions, then retry.",action:{label:"Retry",onClick:()=>{e.load()}}});return}let T=xn(n);co(T,{label:"Connecting to local service..."});return}if(!l)F(y),l=!0;if(!y.running){let T=i("div");n.append(T),ze(T,{tone:"error",title:"Router listener is not active",body:y.routerError||"The listener did not start. Change the port below and save."})}if(b){let T=i("div");n.append(T),ze(T,{tone:"error",title:"Action failed",body:b})}let{card:ie}=Pe(n,"Connection & Endpoint","OpenCode and any OpenAI-compatible client connect to this loopback address."),ce=i("div","br-kv-grid");ie.append(ce);let V=i("div","br-kv-box");V.append(i("span","br-kv-label","Base URL (Endpoint)"));let Ye=i("div","br-kv-val");Ye.append(i("span","br-kv-text",y.endpoint)),N(Ye,"Copy URL",()=>void S(y.endpoint,"Endpoint")),V.append(Ye),ce.append(V);let ye=i("div","br-kv-box");ye.append(i("span","br-kv-label","API Key"));let Q=i("div","br-kv-val");Q.append(i("span","br-kv-text",u?y.config.apiKey:`${y.config.apiKey.slice(0,7)}••••••••••••••••`));let h=i("div","br-row");N(h,u?"Hide":"Reveal",()=>{u=!u,R()}),N(h,"Copy",()=>void S(y.config.apiKey,"API key")),N(h,"Rotate",()=>void Te()),Q.append(h),ye.append(Q),ce.append(ye);let m=i("div","br-kv-box");m.append(i("span","br-kv-label","Listening Port"));let M=i("div","br-kv-val"),X=i("input","br-search-input br-mono");X.type="number",X.value=a,X.style.maxWidth="110px",X.oninput=()=>{a=X.value,fe.disabled=a===String(y.config.port)},M.append(X);let fe=N(M,"Save Port",()=>void J(),"primary");fe.disabled=a===String(y.config.port),m.append(M),ce.append(m);let c=i("div","br-kv-box");c.append(i("span","br-kv-label","RTK Token Saver"));let p=i("div","br-kv-val");so(p,{label:y.config.rtkEnabled!==!1?"Enabled":"Disabled",description:"Compacts git diff, status, and grep tool outputs (saves ~30% tokens)",checked:y.config.rtkEnabled!==!1,onChange:(T)=>{e.run((P)=>P.patchConfig({rtkEnabled:T}))}}),c.append(p),ce.append(c);let E=i("div","br-kv-box");E.append(i("span","br-kv-label","Caveman"));let L=i("select","br-search-input");for(let T of[{value:"off",label:"Off"},{value:"lite",label:"Lite · concise sentences"},{value:"full",label:"Full · terse technical"},{value:"ultra",label:"Ultra · minimum words"}]){let P=document.createElement("option");P.value=T.value,P.textContent=T.label,L.append(P)}L.value=y.config.cavemanLevel,L.onchange=()=>{e.run((T)=>T.patchConfig({cavemanLevel:L.value}))},E.append(L),E.append(i("span","br-card-desc","Terse answers; technical literals and safety warnings stay intact.")),ce.append(E);let ae=i("div","br-kv-box");ae.append(i("span","br-kv-label","Ponytail"));let K=i("select","br-search-input");for(let T of[{value:"off",label:"Off"},{value:"lite",label:"Lite · minimal changes"},{value:"full",label:"Full · YAGNI first"},{value:"ultra",label:"Ultra · smallest diff"}]){let P=document.createElement("option");P.value=T.value,P.textContent=T.label,K.append(P)}K.value=y.config.ponytailLevel,K.onchange=()=>{e.run((T)=>T.patchConfig({ponytailLevel:K.value}))},ae.append(K),ae.append(i("span","br-card-desc","Encourages minimal code without skipping validation, security, or requested behavior.")),ce.append(ae);let{card:ve}=Pe(n,"Upstream Provider","Use OpenCode Zen Free by default, or connect an OpenAI-compatible chat-completions API."),Ae=i("div","br-kv-grid"),we=i("div","br-kv-box");we.append(i("span","br-kv-label","API Base URL"));let Oe=i("input","br-search-input br-mono");Oe.type="url",Oe.value=s,Oe.placeholder="https://api.openai.com/v1",Oe.autocomplete="off",Oe.oninput=()=>{s=Oe.value},we.append(Oe),we.append(i("span","br-card-desc","Enter the API base, not the /chat/completions path. OpenCode Zen remains the default.")),Ae.append(we);let Ve=i("div","br-kv-box");Ve.append(i("span","br-kv-label","Upstream API Key"));let D=i("input","br-search-input br-mono");D.type="password",D.autocomplete="new-password",D.value=d,D.placeholder=y.upstreamApiKeyConfigured?"Key is saved; leave blank to keep it":"Optional for local or keyless APIs",D.oninput=()=>{d=D.value},Ve.append(D),Ve.append(i("span","br-card-desc","Stored locally with owner-only file permissions. The saved key is not returned to panel state."));let O=i("div","br-row");if(N(O,"Save Upstream",()=>void Ee(),"primary"),y.upstreamApiKeyConfigured)N(O,"Clear API Key",()=>void j());Ve.append(O),Ae.append(Ve),ve.append(Ae);let{card:de}=Pe(n,"Upstream Routing","Traffic to the configured upstream can route directly or through a serverless proxy pool."),Ne=y.config.proxyStrategy||"single",I=y.config.proxyPools.filter((T)=>T.isActive),k=y.config.activePoolId?I.find((T)=>T.id===y.config.activePoolId)||I[0]:I[0],w=i("div","br-pool-card active"),se=i("div","br-pool-left"),oe=i("div","br-pool-info"),Z=i("div","br-pool-title-row");if(Ne==="round-robin")Z.append(i("span","br-pool-name","Round-Robin Rotation")),Z.append(i("span","br-badge br-badge-running",`${I.length} Pools`)),oe.append(Z),oe.append(i("span","br-pool-url",`Sequential rotation with sticky turn limit ${y.config.stickyLimit||1}`));else if(Ne==="random")Z.append(i("span","br-pool-name","Random Upstream Routing")),Z.append(i("span","br-badge br-badge-primary",`${I.length} Pools`)),oe.append(Z),oe.append(i("span","br-pool-url","Uniform random distribution across active proxy pools"));else if(k){Z.append(i("span","br-pool-name",k.name));let T=i("span","br-badge br-badge-primary",k.type);Z.append(T),oe.append(Z),oe.append(i("span","br-pool-url",k.proxyUrl))}else{Z.append(i("span","br-pool-name","Direct Routing"));let T=i("span","br-badge br-badge-neutral","Direct");Z.append(T),oe.append(Z),oe.append(i("span","br-pool-url",`Direct requests from this machine to ${y.config.upstream}`))}se.append(oe),w.append(se);let ee=i("div","br-pool-actions");if(o)N(ee,"Manage Proxy Pools",()=>o("proxy-pools"));w.append(ee),de.append(w);let le=y.requests,te=le.length,Y=le.filter((T)=>T.status>=200&&T.status<300).length,De=le.filter((T)=>T.status===429).length,qe=le.filter((T)=>T.fallbackUsed===!0).length,re=le.filter((T)=>T.status<200||T.status>=300).length,me=te>0?Math.round(le.reduce((T,P)=>T+Math.max(0,P.ms),0)/te):null,Ce=le.filter((T)=>T.inputTokens!==void 0||T.outputTokens!==void 0||T.totalTokens!==void 0).length,Lt=le.reduce((T,P)=>T+(P.inputTokens??0),0),$t=le.reduce((T,P)=>T+(P.outputTokens??0),0),xt=le.reduce((T,P)=>T+(P.totalTokens??(P.inputTokens!==void 0&&P.outputTokens!==void 0?P.inputTokens+P.outputTokens:0)),0),Ge=new Intl.NumberFormat,{card:or}=Pe(n,"Usage & Reliability","Summary of the most recent persisted request records. Token figures include only usage reported by the upstream."),Ut=i("div","br-kv-grid"),ct=(T,P,yt)=>{let We=i("div","br-kv-box");We.append(i("span","br-kv-label",T));let nr=i("div","br-kv-val");if(nr.append(i("span","br-kv-text",P)),We.append(nr),yt)We.append(i("span","br-card-desc",yt));Ut.append(We)},Co=te>0?Math.round(Y/te*100):null;ct("Requests",Ge.format(te),"Stored request records"),ct("Success rate",Co===null?"—":Co+"%",Ge.format(Y)+" successful"),ct("Errors",Ge.format(re),Ge.format(De)+" rate-limited (429)"),ct("Fallbacks",Ge.format(qe),"Requests answered by a fallback model"),ct("Average latency",me===null?"—":me+" ms","Across stored requests"),ct("Reported tokens",Ce>0?Ge.format(xt):"Not reported",Ce>0?Ge.format(Lt)+" input · "+Ge.format($t)+" output · reported on "+Ce+"/"+te+" requests":"No upstream token usage was available in this history"),or.append(Ut);let{card:Ro}=Pe(n,"Recent Calls","The most recent request metadata is stored locally; prompts, tool output, and response bodies are not saved.");if(y.requests.length===0){let T=i("p","br-card-desc","No requests yet. Calls from OpenCode or other clients will appear here.");Ro.append(T)}else{let T=i("div");for(let P of y.requests.slice(0,8)){let yt=i("div","br-call-row"),We=i("div","br-call-left"),nr=i("span",`br-badge ${P.status>=200&&P.status<300?"br-badge-running":"br-badge-stopped"}`,String(P.status));We.append(nr);let In=P.requestedModel&&P.requestedModel!==P.model?P.requestedModel+" → "+(P.model||P.path):P.model||P.path;if(We.append(i("span","br-call-name",In)),P.poolName)We.append(i("span","br-badge br-badge-neutral",P.poolName));if(P.fallbackUsed)We.append(i("span","br-badge br-badge-primary","Fallback"));yt.append(We);let ar=[];if(P.totalTokens!==void 0)ar.push(Ge.format(P.totalTokens)+" tokens");else if(P.inputTokens!==void 0||P.outputTokens!==void 0){let sr=(P.inputTokens??0)+(P.outputTokens??0);ar.push(Ge.format(sr)+" reported tokens")}if(ar.push(P.ms+"ms"),yt.append(i("span","br-call-ms",ar.join(" · "))),T.append(yt),P.fallbackReason){let sr=i("p","br-card-desc","Fallback reason: "+P.fallbackReason);sr.style.margin="0 0 8px 0",T.append(sr)}}Ro.append(T)}};return{element:n,render:R}};var Nt=Qr(),Sn=document.querySelector("#root");if(!Sn)throw Error("Missing root");var Tn=document.createElement("style");Tn.textContent=bn;document.head.append(Tn);Nt.onReady((e)=>Zr(e,document.documentElement));var Pr=hn(Nt),Ue=gn(Pr),rr=document.createElement("div");rr.className="br-root";Sn.replaceChildren(rr);var bo=document.createElement("header");bo.className="br-header";var xo=document.createElement("div");xo.className="br-header-left";var yo=document.createElement("div");yo.className="br-logo-box";yo.textContent="⚡";var vo=document.createElement("div");vo.className="br-header-titles";var ko=document.createElement("div");ko.className="br-title-row";var En=document.createElement("h1");En.textContent="BlackRouter";var tr=document.createElement("span");tr.className="br-badge br-badge-neutral";tr.textContent="Connecting...";ko.append(En,tr);var _o=document.createElement("p");_o.className="br-header-sub";_o.textContent="OpenCode Zen Local Endpoint & Proxy Pools";vo.append(ko,_o);xo.append(yo,vo);var wo=document.createElement("div");wo.className="br-header-right";var Ia=dt(wo,{label:"Refresh",variant:"outline",size:"sm",onClick:()=>{Ue.load()}});bo.append(xo,wo);rr.append(bo);var So=document.createElement("div");So.className="br-nav-bar";var An=document.createElement("div");So.append(An);rr.append(So);var Or=document.createElement("main");Or.className="br-stack";rr.append(Or);var Ir=document.createElement("div");Ir.hidden=!0;var Ma=ze(Ir,{tone:"error",title:""});Or.append(Ir);var Rr="router",To=null,Eo=(e)=>{Rr=e,To?.update({activeId:Rr});for(let r of Ao)r.element.hidden=r.id!==e;let t=Ue.state();if(e==="models"&&t&&t.models.length===0&&!Ue.busy())Ue.run((r)=>r.refreshModels())},Cn=wn(Ue,Pr,Nt,(e)=>Eo(e)),Rn=_n(Ue,Pr,Nt),Pn=vn(Ue,Pr,Nt),On=kn(Ue,Nt),Ao=[{id:"router",label:"Router",element:Cn.element},{id:"proxy-pools",label:"Proxy Pools",element:Rn.element},{id:"models",label:"Models",element:Pn.element},{id:"opencode",label:"OpenCode",element:On.element}];for(let e of Ao)Or.append(e.element);To=io(An,{items:Ao.map((e)=>({id:e.id,label:e.label})),activeId:Rr,onChange:Eo});Eo("router");var Na=()=>{let e=Ue.state();if(e){tr.className=`br-badge ${e.running?"br-badge-running":"br-badge-stopped"}`,tr.innerHTML=`<span class="br-dot ${e.running?"on":"off"}"></span> ${e.running?`127.0.0.1:${e.config.port}`:"Stopped"}`;let o=e.config.proxyPools.length,n=e.models.length,a=e.registration.installed;To?.update({activeId:Rr,items:[{id:"router",label:"Router"},{id:"proxy-pools",label:o>0?`Proxy Pools (${o})`:"Proxy Pools"},{id:"models",label:n>0?`Models (${n})`:"Models"},{id:"opencode",label:a?"OpenCode ✓":"OpenCode"}]})}let t=Ue.error(),r=Boolean(t)&&e!==null;if(Ir.hidden=!r,t&&r)Ma.update({tone:"error",title:"Local service notice",body:t});Ia.update({loading:Ue.busy()}),Cn.render(),Rn.render(),Pn.render(),On.render()};Ue.subscribe(Na);Ue.load();setInterval(()=>{Ue.poll()},30000);})();
