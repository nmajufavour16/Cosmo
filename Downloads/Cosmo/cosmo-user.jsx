import { useState, useEffect, useRef } from "react";

/* ── HELPERS ── */
var fmt = function(n){ return "$"+Number(n).toFixed(2); };
var countdown = function(endDateStr){
  if(!endDateStr) return "";
  var end = new Date(endDateStr); var now = new Date();
  var diff = end - now;
  if(diff <= 0) return "Ended";
  var days = Math.floor(diff/86400000);
  var hrs  = Math.floor((diff%86400000)/3600000);
  var mins = Math.floor((diff%3600000)/60000);
  if(days > 0) return days+"d "+hrs+"h left";
  if(hrs  > 0) return hrs+"h "+mins+"m left";
  return mins+"m left";
};
function getTodayKey(){ var n=new Date(); return n.getFullYear()+"-"+(n.getMonth()+1)+"-"+n.getDate(); }

/* ── EMPTY SEED DATA (populated from Firebase in production) ── */
var STREAK_REWARDS = [0.06,0.09,0.12,0.15,0.18,0.21,0.30];
var TXNS    = [];
var NOTIFS  = [];
var COMPS   = [];
var TASKS   = [];
var OFFERS  = [];
var LB_EARNERS = [];
var LB_REFS    = [];

/* ── THEME TOKENS ── */
var DARK = {
  bg:"#06070d", surf:"#0b0c15", card:"#0e0f18", panel:"#111325",
  border:"#1e2038", div:"#1a1b2e",
  text:"#e8eaf6", sub:"#9294b0", muted:"#52556e",
  chrome:"#c8caf0", silver:"#a0a3c4",
  gold:"#c8a84b", bronze:"#cd7f32",
  success:"#2ed880", warn:"#f5a623", danger:"#ff4060",
};
var LIGHT = {
  bg:"#dde0f0", surf:"#e8ebf7", card:"#f0f2ff", panel:"#e0e3f2",
  border:"#c0c4dc", div:"#cdd0e8",
  text:"#12142a", sub:"#44476a", muted:"#9294b0",
  chrome:"#12142a", silver:"#22264a",
  gold:"#a07820", bronze:"#8b5e3c",
  success:"#1a9f5a", warn:"#c07800", danger:"#cc2040",
};

/* ── GLOBAL CSS ── */
var CSS_BASE = `
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
body{font-family:"Outfit",sans-serif;overscroll-behavior:none}
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
input,textarea,select{font-family:"Outfit",sans-serif;width:100%;padding:12px 14px;border-radius:12px;font-size:14px;outline:none;transition:border .15s}
input[type=range]{padding:4px 0;height:6px;cursor:pointer}
button{font-family:"Outfit",sans-serif}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(160,163,196,.3);border-radius:3px}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes glint{0%{background-position:200%}100%{background-position:-200%}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pop{0%{transform:scale(.85);opacity:0}60%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
@keyframes confetti{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(120px) rotate(720deg);opacity:0}}
.fade{animation:fadeIn .25s ease}
`;

/* ── UI PRIMITIVE COMPONENTS ── */
function Sheet({show,onClose,C,children,title,maxH}){
  if(!show) return null;
  return(
    <div onClick={function(e){if(e.target===e.currentTarget)onClose();}}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",backdropFilter:"blur(4px)",zIndex:100,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div style={{background:C.surf,borderRadius:"20px 20px 0 0",maxHeight:maxH||"90vh",overflowY:"auto",animation:"pop .2s ease"}}>
        {title&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 18px",borderBottom:"1px solid "+C.div,flexShrink:0}}>
          <div style={{fontSize:15,fontWeight:800,color:C.text}}>{title}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.sub,fontSize:22,cursor:"pointer",lineHeight:1}}>×</button>
        </div>}
        <div style={{padding:"0 0 env(safe-area-inset-bottom,0) 0"}}>{children}</div>
      </div>
    </div>
  );
}

function Pop({show,onClose,C,children}){
  if(!show) return null;
  return(
    <div onClick={function(e){if(e.target===e.currentTarget)onClose();}}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(6px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:C.surf,borderRadius:20,padding:"22px 20px",width:"100%",maxWidth:360,border:"1px solid "+C.border,animation:"pop .2s ease"}}>
        {children}
      </div>
    </div>
  );
}

function Btn({children,onClick,v,style,disabled}){
  var base={border:"none",borderRadius:14,padding:"13px 20px",cursor:disabled?"not-allowed":"pointer",fontSize:14,fontWeight:700,fontFamily:"Outfit",transition:"opacity .15s",opacity:disabled?0.5:1,...(style||{})};
  var variants={
    primary:{background:"linear-gradient(135deg,#a0a3c4,#c8caf0)",color:"#06070d"},
    outline:{background:"transparent",border:"1.5px solid rgba(200,202,240,.4)",color:"#e8eaf6"},
    ghost:{background:"rgba(160,163,196,.08)",color:"#9294b0",border:"1px solid rgba(160,163,196,.15)"},
    danger:{background:"rgba(255,64,96,.12)",color:"#ff4060",border:"1px solid rgba(255,64,96,.3)"},
    success:{background:"rgba(46,216,128,.12)",color:"#2ed880",border:"1px solid rgba(46,216,128,.3)"},
    gold:{background:"linear-gradient(135deg,#c8a84b,#f0c040)",color:"#06070d"},
  };
  var vs=variants[v]||variants.primary;
  return <button onClick={onClick} disabled={disabled} style={{...base,...vs,...(style||{})}}>{children}</button>;
}

function Pill({label,color,bg}){
  return <span style={{background:bg||color+"22",color:color,borderRadius:20,padding:"3px 9px",fontSize:10,fontWeight:700,letterSpacing:.5,display:"inline-flex",alignItems:"center"}}>{label}</span>;
}

function Tog({on,onToggle}){
  return(
    <div onClick={onToggle} style={{width:44,height:26,borderRadius:13,background:on?"linear-gradient(135deg,#a0a3c4,#c8caf0)":"rgba(160,163,196,.15)",border:"1.5px solid "+(on?"transparent":"rgba(160,163,196,.2)"),cursor:"pointer",position:"relative",transition:"all .2s",flexShrink:0}}>
      <div style={{position:"absolute",top:3,left:on?21:3,width:16,height:16,borderRadius:"50%",background:on?"#06070d":"#52556e",transition:"left .2s"}}/>
    </div>
  );
}

function BackBtn({onClick,C}){
  return(
    <button onClick={onClick} style={{background:C.panel,border:"1px solid "+C.border,borderRadius:10,padding:"7px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:C.sub,fontSize:13,fontFamily:"Outfit",fontWeight:600}}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      Back
    </button>
  );
}

function TextField({label,type,value,onChange,placeholder,C}){
  return(
    <div style={{marginBottom:12}}>
      {label&&<div style={{fontSize:11,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:6}}>{label}</div>}
      <input type={type||"text"} value={value} onChange={onChange} placeholder={placeholder||""}
        style={{background:C.panel,border:"1.5px solid "+C.border,color:C.text,borderRadius:12}}/>
    </div>
  );
}

function PasswordField({label,value,onChange,placeholder,C}){
  var show=useState(false); var setShow=show[1]; show=show[0];
  return(
    <div style={{marginBottom:12,position:"relative"}}>
      {label&&<div style={{fontSize:11,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:6}}>{label}</div>}
      <input type={show?"text":"password"} value={value} onChange={onChange} placeholder={placeholder||"Password"}
        style={{background:C.panel,border:"1.5px solid "+C.border,color:C.text,borderRadius:12,paddingRight:44}}/>
      <button onClick={function(){setShow(function(p){return !p;});}} type="button"
        style={{position:"absolute",right:12,top:label?36:10,background:"none",border:"none",cursor:"pointer",color:C.sub,padding:4}}>
        {show
          ?<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          :<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        }
      </button>
    </div>
  );
}

function PinBox({label,onDone,C}){
  var vals=useState(["","","",""]); var setVals=vals[1]; vals=vals[0];
  var refs=useRef([]);
  function set(i,v){
    v=v.replace(/\D/g,"").slice(-1);
    var n=vals.slice(); n[i]=v; setVals(n);
    if(v&&i<3&&refs.current[i+1]) refs.current[i+1].focus();
    if(n.every(function(x){return x.length===1;})&&onDone) setTimeout(function(){onDone(n.join(""));},80);
  }
  function bk(i,e){if(e.key==="Backspace"&&!vals[i]&&i>0&&refs.current[i-1]) refs.current[i-1].focus();}
  return(
    <div style={{textAlign:"center"}}>
      {label&&<div style={{fontSize:12,color:C.sub,marginBottom:14}}>{label}</div>}
      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        {vals.map(function(p,i){
          return <input key={i} ref={function(el){refs.current[i]=el;}} type="password" inputMode="numeric" maxLength={1} value={p}
            onChange={function(e){set(i,e.target.value);}} onKeyDown={function(e){bk(i,e);}}
            style={{width:54,height:60,textAlign:"center",fontSize:22,fontWeight:800,fontFamily:"JetBrains Mono",background:C.panel,border:"2px solid "+(p?C.silver:C.border),borderRadius:14,color:C.text,outline:"none",caretColor:"transparent"}}/>;
        })}
      </div>
    </div>
  );
}

function OTPBox({onDone,C}){
  var digits=useState(Array(6).fill("")); var setDigits=digits[1]; digits=digits[0];
  var refs=useRef([]);
  function set(i,v){
    v=v.replace(/\D/g,"").slice(-1);
    var n=[...digits]; n[i]=v; setDigits(n);
    if(v&&i<5&&refs.current[i+1]) refs.current[i+1].focus();
    if(n.every(function(d){return d!=="";})&&onDone) setTimeout(function(){onDone(n.join(""));},120);
  }
  function bk(i,e){if(e.key==="Backspace"&&!digits[i]&&i>0&&refs.current[i-1]) refs.current[i-1].focus();}
  return(
    <div style={{display:"flex",gap:8,justifyContent:"center"}}>
      {digits.map(function(d,i){
        return <input key={i} ref={function(el){refs.current[i]=el;}} type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={function(e){set(i,e.target.value);}} onKeyDown={function(e){bk(i,e);}}
          style={{width:42,height:48,textAlign:"center",fontSize:18,fontWeight:700,fontFamily:"JetBrains Mono",background:C.panel,border:"2px solid "+(d?C.silver:C.border),borderRadius:10,color:C.text,outline:"none"}}/>;
      })}
    </div>
  );
}

function BalanceNum({value,C,forceLight}){
  var display=useState(0); var setDisplay=display[1]; display=display[0];
  var mounted=useRef(false);
  var flash=useState(false); var setFlash=flash[1]; flash=flash[0];
  var prev=useRef(value);
  useEffect(function(){
    if(!mounted.current){
      mounted.current=true;
      var end=value; var dur=900; var start=null;
      function step(ts){
        if(!start) start=ts;
        var p=Math.min((ts-start)/dur,1);
        var ease=1-Math.pow(1-p,3);
        setDisplay(+(end*ease).toFixed(2));
        if(p<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    } else if(value!==prev.current){
      setFlash(true); setTimeout(function(){setFlash(false);},700);
      setDisplay(value);
    }
    prev.current=value;
  },[value]);
  var col=flash?"#2ed880":forceLight?"#f0f2ff":C.text;
  return <div style={{fontSize:52,fontWeight:900,fontFamily:"JetBrains Mono",color:col,letterSpacing:-2,lineHeight:1,transition:"color .3s"}}>{fmt(mounted.current?display:value)}</div>;
}

function Empty({msg,C}){
  return <div style={{textAlign:"center",padding:"40px 20px",color:C.muted,fontSize:13}}>{msg||"Nothing here yet"}</div>;
}

function Skel({C,h,r}){
  return <div style={{height:h||14,background:C.panel,borderRadius:r||8,animation:"pulse 1.4s infinite"}}/>;
}

function StatusDot({status}){
  var col={completed:"#2ed880",pending:"#f5a623",processing:"#a0a3c4",sent:"#2ed880",rejected:"#ff4060",cancelled:"#52556e"}[status]||"#52556e";
  return <div style={{width:8,height:8,borderRadius:"50%",background:col,flexShrink:0}}/>;
}

/* ── AUTH SCREENS ── */
function Splash({onDone,C}){
  useEffect(function(){var t=setTimeout(onDone,2200);return function(){clearTimeout(t);};;},[]);
  return(
    <div style={{height:"100%",minHeight:"100svh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"fixed",inset:0}}>
      <div style={{fontSize:48,fontWeight:900,letterSpacing:6,background:"linear-gradient(105deg,"+C.muted+" 0%,"+C.chrome+" 35%,"+C.silver+" 50%,"+C.chrome+" 65%,"+C.muted+" 100%)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"glint 2.5s linear infinite",marginBottom:12}}>COSMO</div>
      <div style={{fontSize:13,color:C.muted,letterSpacing:3,textTransform:"uppercase"}}>Earn & Explore</div>
    </div>
  );
}

function Welcome({onSignUp,onLogin,onShowTos,onShowPrivacy,C}){
  return(
    <div style={{height:"100%",minHeight:"100svh",background:C.bg,position:"fixed",inset:0,display:"flex",flexDirection:"column",padding:"0 24px 32px"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:0}}>
        <div style={{fontSize:52,fontWeight:900,letterSpacing:6,background:"linear-gradient(105deg,"+C.muted+" 0%,"+C.chrome+" 35%,"+C.silver+" 50%,"+C.chrome+" 65%,"+C.muted+" 100%)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"glint 3s linear infinite",marginBottom:8}}>COSMO</div>
        <div style={{fontSize:14,color:C.sub,letterSpacing:2,textTransform:"uppercase",marginBottom:48}}>Earn & Explore</div>
        <div style={{fontSize:22,fontWeight:800,color:C.text,textAlign:"center",marginBottom:10,lineHeight:1.3}}>Turn your free time<br/>into real money</div>
        <div style={{fontSize:13,color:C.sub,textAlign:"center",lineHeight:1.7,maxWidth:280}}>Complete surveys, watch videos, finish tasks and refer friends. Withdraw via PayPal or gift cards.</div>
      </div>
      <Btn onClick={onSignUp} style={{width:"100%",padding:16,fontSize:16,borderRadius:16,marginBottom:12}}>Create Free Account</Btn>
      <Btn onClick={onLogin} v="ghost" style={{width:"100%",padding:15,fontSize:15,borderRadius:16,marginBottom:20}}>I already have an account</Btn>
      <div style={{textAlign:"center",fontSize:10,color:C.muted,lineHeight:1.8}}>
        By continuing you agree to our{" "}
        <span onClick={onShowTos} style={{color:C.sub,cursor:"pointer",textDecoration:"underline"}}>Terms of Service</span>{" "}and{" "}
        <span onClick={onShowPrivacy} style={{color:C.sub,cursor:"pointer",textDecoration:"underline"}}>Privacy Policy</span>
      </div>
    </div>
  );
}

function SignUp({onBack,onDone,C}){
  var step=useState(0); var setStep=step[1]; step=step[0];
  var email=useState(""); var setEmail=email[1]; email=email[0];
  var user=useState(""); var setUser=user[1]; user=user[0];
  var pass=useState(""); var setPass=pass[1]; pass=pass[0];
  var pass2=useState(""); var setPass2=pass2[1]; pass2=pass2[0];
  var otp=useState(""); var setOtp=otp[1]; otp=otp[0];
  var pin=useState(""); var setPin=pin[1]; pin=pin[0];
  var refCode=useState(""); var setRefCode=refCode[1]; refCode=refCode[0];
  var tosOk=useState(false); var setTosOk=tosOk[1]; tosOk=tosOk[0];
  var err=useState(""); var setErr=err[1]; err=err[0];
  var loading=useState(false); var setLoading=loading[1]; loading=loading[0];

  function nextStep0(){
    if(!email.includes("@")){setErr("Enter a valid email address");return;}
    if(user.length<3){setErr("Username must be at least 3 characters");return;}
    if(pass.length<8){setErr("Password must be at least 8 characters");return;}
    if(pass!==pass2){setErr("Passwords do not match");return;}
    if(!tosOk){setErr("Please agree to the Terms of Service");return;}
    setErr(""); setLoading(true);
    setTimeout(function(){setLoading(false);setStep(1);},800);
  }
  function verifyOtp(code){ setOtp(code); setStep(2); }
  function setNewPin(p){ setPin(p); setStep(3); }
  function confirmPin(p){
    if(p!==pin){setErr("PINs do not match — try again");setStep(2);return;}
    onDone({email,username:"@"+user,balance:0,totalEarned:0,streak:0,refs:0,tier:"Bronze",kyc:"unverified",referredBy:refCode||null});
  }

  var bg={background:C.bg,position:"fixed",inset:0,height:"100%",minHeight:"100svh",display:"flex",flexDirection:"column",fontFamily:"Outfit"};
  var topBar=<div style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid "+C.div,flexShrink:0}}>
    <BackBtn onClick={step===0?onBack:function(){setStep(step-1);setErr("");}} C={C}/>
    <div style={{fontSize:13,color:C.sub}}>Step {step+1} of 4</div>
  </div>;
  var steps=[
    <div key="s0" style={{flex:1,overflowY:"auto",padding:"24px 22px"}}>
      <div style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:6}}>Create your account</div>
      <div style={{fontSize:13,color:C.sub,marginBottom:22,lineHeight:1.6}}>Enter your details to get started</div>
      <TextField label="Email Address" type="email" value={email} onChange={function(e){setEmail(e.target.value);}} placeholder="your@email.com" C={C}/>
      <TextField label="Username" value={user} onChange={function(e){setUser(e.target.value.replace(/[^a-zA-Z0-9_]/g,""));}} placeholder="e.g. cooluser123" C={C}/>
      <PasswordField label="Password (min 8 characters)" value={pass} onChange={function(e){setPass(e.target.value);}} C={C}/>
      <PasswordField label="Confirm Password" value={pass2} onChange={function(e){setPass2(e.target.value);}} C={C}/>
      <TextField label="Referral Code (optional)" value={refCode} onChange={function(e){setRefCode(e.target.value.toUpperCase());}} placeholder="COSMO-XXXXXX" C={C}/>
      <div onClick={function(){setTosOk(function(p){return !p;});}} style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,cursor:"pointer"}}>
        <div style={{width:20,height:20,borderRadius:6,border:"2px solid "+(tosOk?C.silver:C.border),background:tosOk?C.silver:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          {tosOk&&<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
        </div>
        <div style={{fontSize:12,color:C.sub,lineHeight:1.5}}>I agree to the Terms of Service and Privacy Policy</div>
      </div>
      {err&&<div style={{color:C.danger,fontSize:12,marginBottom:12,padding:"8px 12px",background:C.danger+"14",borderRadius:8}}>{err}</div>}
      <Btn onClick={nextStep0} style={{width:"100%",padding:15}} disabled={loading}>{loading?"Creating account...":"Continue"}</Btn>
    </div>,
    <div key="s1" style={{flex:1,overflowY:"auto",padding:"40px 22px",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:8,textAlign:"center"}}>Verify your email</div>
      <div style={{fontSize:13,color:C.sub,marginBottom:6,textAlign:"center",lineHeight:1.6}}>We sent a 6-digit code to</div>
      <div style={{fontSize:14,fontWeight:700,color:C.chrome,marginBottom:28,textAlign:"center"}}>{email}</div>
      <OTPBox onDone={verifyOtp} C={C}/>
      <div style={{fontSize:12,color:C.muted,marginTop:20,textAlign:"center"}}>Didn't receive it? Check your spam folder<br/>or <span onClick={function(){setStep(1);}} style={{color:C.sub,cursor:"pointer",textDecoration:"underline"}}>resend code</span></div>
    </div>,
    <div key="s2" style={{flex:1,overflowY:"auto",padding:"40px 22px",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:8,textAlign:"center"}}>Set your withdrawal PIN</div>
      <div style={{fontSize:13,color:C.sub,marginBottom:28,textAlign:"center",lineHeight:1.6}}>This 4-digit PIN is required to approve withdrawals and gift card purchases</div>
      <PinBox label="Enter 4-digit PIN" onDone={setNewPin} C={C}/>
    </div>,
    <div key="s3" style={{flex:1,overflowY:"auto",padding:"40px 22px",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:8,textAlign:"center"}}>Confirm your PIN</div>
      <div style={{fontSize:13,color:C.sub,marginBottom:28,textAlign:"center"}}>Enter your PIN again to confirm</div>
      {err&&<div style={{color:C.danger,fontSize:12,marginBottom:16,padding:"8px 12px",background:C.danger+"14",borderRadius:8,width:"100%",textAlign:"center"}}>{err}</div>}
      <PinBox label="Confirm PIN" onDone={confirmPin} C={C}/>
    </div>,
  ];
  return <div style={bg}>{topBar}{steps[step]}</div>;
}

function Login({onBack,onDone,C}){
  var email=useState(""); var setEmail=email[1]; email=email[0];
  var pass=useState(""); var setPass=pass[1]; pass=pass[0];
  var err=useState(""); var setErr=err[1]; err=err[0];
  var forgotMode=useState(false); var setForgotMode=forgotMode[1]; forgotMode=forgotMode[0];
  var resetStep=useState(0); var setResetStep=resetStep[1]; resetStep=resetStep[0];
  var loading=useState(false); var setLoading=loading[1]; loading=loading[0];

  function doLogin(){
    if(!email.includes("@")){setErr("Enter a valid email");return;}
    if(!pass){setErr("Enter your password");return;}
    setErr(""); setLoading(true);
    setTimeout(function(){
      setLoading(false);
      onDone({email,username:"@user",balance:0,totalEarned:0,streak:0,refs:0,tier:"Bronze",kyc:"unverified"});
    },800);
  }

  var bg={background:C.bg,position:"fixed",inset:0,height:"100%",minHeight:"100svh",display:"flex",flexDirection:"column",fontFamily:"Outfit"};
  if(forgotMode) return(
    <div style={bg}>
      <div style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid "+C.div}}>
        <BackBtn onClick={function(){setForgotMode(false);setResetStep(0);}} C={C}/>
        <div style={{fontSize:15,fontWeight:800,color:C.text}}>Reset Password</div>
      </div>
      <div style={{flex:1,padding:"28px 22px",display:"flex",flexDirection:"column",alignItems:"center"}}>
        {resetStep===0&&<>
          <div style={{fontSize:14,color:C.sub,marginBottom:20,textAlign:"center"}}>Enter the email address you used to sign up</div>
          <TextField type="email" value={email} onChange={function(e){setEmail(e.target.value);}} placeholder="your@email.com" C={C}/>
          <Btn onClick={function(){if(!email.includes("@")){setErr("Valid email required");return;}setResetStep(1);setErr("");}} style={{width:"100%",padding:14,marginTop:4}}>Send Reset Code</Btn>
        </>}
        {resetStep===1&&<>
          <div style={{fontSize:13,color:C.sub,marginBottom:6,textAlign:"center"}}>Code sent to <b style={{color:C.chrome}}>{email}</b></div>
          <div style={{marginBottom:20}}/>
          <OTPBox onDone={function(){setResetStep(2);}} C={C}/>
        </>}
        {resetStep===2&&<>
          <div style={{fontSize:14,color:C.sub,marginBottom:20,textAlign:"center"}}>Set your new password</div>
          <PasswordField label="New Password" value={pass} onChange={function(e){setPass(e.target.value);}} C={C}/>
          <Btn onClick={function(){setForgotMode(false);setResetStep(0);}} style={{width:"100%",padding:14}}>Update Password</Btn>
        </>}
        {err&&<div style={{color:C.danger,fontSize:12,marginTop:10}}>{err}</div>}
      </div>
    </div>
  );

  return(
    <div style={bg}>
      <div style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid "+C.div}}>
        <BackBtn onClick={onBack} C={C}/>
        <div style={{fontSize:15,fontWeight:800,color:C.text}}>Sign In</div>
      </div>
      <div style={{flex:1,padding:"28px 22px"}}>
        <TextField label="Email Address" type="email" value={email} onChange={function(e){setEmail(e.target.value);}} placeholder="your@email.com" C={C}/>
        <PasswordField label="Password" value={pass} onChange={function(e){setPass(e.target.value);}} C={C}/>
        <div onClick={function(){setForgotMode(true);setErr("");}} style={{textAlign:"right",fontSize:12,color:C.sub,cursor:"pointer",marginBottom:20,textDecoration:"underline"}}>Forgot password?</div>
        {err&&<div style={{color:C.danger,fontSize:12,marginBottom:14,padding:"8px 12px",background:C.danger+"14",borderRadius:8}}>{err}</div>}
        <Btn onClick={doLogin} style={{width:"100%",padding:15}} disabled={loading}>{loading?"Signing in...":"Sign In"}</Btn>
      </div>
    </div>
  );
}

/* ── HOME TAB ── */
function HomeTab({user,setUser,navTo,C,addTxn,streakClaimed,setStreakClaimed}){
  var claimed=streakClaimed; var setClaimed=setStreakClaimed;
  var todayKey=getTodayKey();
  var lastClaim=useState(""); var setLastClaim=lastClaim[1]; lastClaim=lastClaim[0];
  var showClaim=useState(false); var setShowClaim=showClaim[1]; showClaim=showClaim[0];
  var showCal=useState(false); var setShowCal=showCal[1]; showCal=showCal[0];
  var balVis=useState(true); var setBalVis=balVis[1]; balVis=balVis[0];
  var todayStr=new Date().toLocaleDateString("en-US",{weekday:"long"});
  var greeting=["Good morning","Good afternoon","Good evening"][Math.floor(new Date().getHours()/8)];
  var streakDay=Math.min((user.streak||0)+1,7);
  var todayReward=STREAK_REWARDS[streakDay-1]||0.06;
  var alreadyClaimed=claimed||(lastClaim===todayKey);
  var tierCol=user.tier==="Gold"?C.gold:user.tier==="Silver"?C.silver:C.bronze;
  var tierPct=user.tier==="Gold"?100:user.tier==="Silver"?Math.min(100,Math.round((user.totalEarned||0)/1000*100)):Math.min(100,Math.round((user.totalEarned||0)/200*100));
  var toNext=user.tier==="Gold"?"Max tier":user.tier==="Silver"?("$"+(1000-(user.totalEarned||0)).toFixed(2)+" to Diamond"):("$"+(200-(user.totalEarned||0)).toFixed(2)+" to Silver");

  function claimStreak(){
    setUser(function(p){return Object.assign({},p,{balance:+(p.balance+todayReward).toFixed(2),totalEarned:+(p.totalEarned+todayReward).toFixed(2),streak:(p.streak||0)+1});});
    setClaimed(true); setLastClaim(todayKey); setShowClaim(false);
    addTxn&&addTxn({id:"TXN-S"+Date.now(),type:"streak",desc:"Daily Streak — Day "+streakDay,provider:"Cosmo",amt:todayReward,date:"Just now",status:"completed",detail:"Day "+streakDay+" streak bonus claimed."});
  }

  var txns=user.recentTxns||[];
  var typeIcon=function(t){return t==="earn"?"◈":t==="ref"?"◎":t==="streak"?"⚡":t==="wd"?"↑":t==="gc"?"⬡":t==="comp"?"◉":t==="task"?"◫":"◈";};
  var typeCol=function(t){return t==="earn"||t==="streak"||t==="ref"||t==="comp"||t==="task"?C.success:C.danger;};

  return(
    <div style={{minHeight:"100%",background:C.bg,paddingBottom:20}}>
      {/* Greeting */}
      <div style={{padding:"16px 18px 10px"}}>
        <div style={{fontSize:13,color:C.sub}}>{greeting}, {user.username||"there"}</div>
        <div style={{fontSize:11,color:C.muted}}>{todayStr} · Keep earning every day</div>
      </div>

      {/* Balance hero */}
      <div style={{margin:"0 14px 14px",background:"linear-gradient(145deg,#0f1128 0%,#161933 50%,#0b0d1e 100%)",borderRadius:22,padding:"22px 20px",border:"1px solid rgba(160,163,196,.15)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:120,height:120,borderRadius:"50%",background:"radial-gradient(circle,rgba(200,202,240,.06) 0%,transparent 70%)"}}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <div style={{fontSize:9,color:"rgba(180,185,230,.5)",fontWeight:700,textTransform:"uppercase",letterSpacing:2}}>Available Balance</div>
          <button onClick={function(){setBalVis(function(p){return !p;});}} style={{background:"rgba(255,255,255,.06)",border:"none",borderRadius:6,cursor:"pointer",padding:"3px 7px",color:"rgba(180,185,230,.45)"}}>
            {balVis?<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            :<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>}
          </button>
        </div>
        {balVis?<BalanceNum value={user.balance||0} C={C} forceLight={true}/>:<div style={{fontSize:52,fontWeight:900,fontFamily:"JetBrains Mono",color:"rgba(255,255,255,.2)",letterSpacing:-2,lineHeight:1}}>••••••</div>}
        <div style={{fontSize:12,color:"rgba(180,185,230,.5)",marginTop:4,marginBottom:12}}>Total earned: <span style={{color:"rgba(200,202,240,.7)",fontWeight:600}}>{fmt(user.totalEarned||0)}</span> · <span style={{color:tierCol,fontWeight:700}}>{user.tier||"Bronze"}</span></div>
        <div style={{height:4,background:"rgba(255,255,255,.08)",borderRadius:2,marginBottom:8,overflow:"hidden"}}>
          <div style={{height:4,width:tierPct+"%",background:"linear-gradient(90deg,"+tierCol+","+tierCol+"aa)",borderRadius:2,transition:"width .6s"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"rgba(180,185,230,.4)",marginBottom:16}}>
          <span style={{color:tierCol,fontWeight:700}}>{user.tier||"Bronze"}</span>
          <span>{toNext}</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Btn onClick={function(){navTo("rewards");}} v="ghost" style={{padding:"11px",fontSize:13,border:"1px solid rgba(160,163,196,.2)",color:"#e8eaf6"}}>Withdraw</Btn>
          <Btn onClick={function(){navTo("earn");}} style={{padding:"11px",fontSize:13}}>Earn More</Btn>
        </div>
      </div>

      {/* Daily Streak */}
      <div style={{margin:"0 14px 14px",background:C.card,border:"1px solid "+(alreadyClaimed?C.success+"44":C.gold+"44"),borderRadius:16,padding:"14px 16px",borderTop:"2px solid "+(alreadyClaimed?C.success:C.gold)}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:38,height:38,borderRadius:11,background:alreadyClaimed?C.success+"18":C.gold+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⚡</div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>Daily Streak <span onClick={function(){setShowCal(true);}} style={{fontSize:10,color:C.sub,cursor:"pointer",marginLeft:4,textDecoration:"underline"}}>Calendar</span></div>
              <div style={{fontSize:11,color:C.sub}}>Day {streakDay} of 7 · {fmt(todayReward)} today</div>
            </div>
          </div>
          {alreadyClaimed
            ?<Pill label="Claimed ✓" color={C.success} bg={C.success+"18"}/>
            :<Btn onClick={function(){setShowClaim(true);}} v="gold" style={{fontSize:12,padding:"7px 14px",borderRadius:20}}>{fmt(todayReward)}</Btn>
          }
        </div>
        <div style={{display:"flex",gap:4}}>
          {STREAK_REWARDS.map(function(r,i){
            var done=i<streakDay-1||(i===streakDay-1&&alreadyClaimed);
            var today=i===streakDay-1&&!alreadyClaimed;
            return <div key={i} style={{flex:1,height:4,borderRadius:2,background:done?C.success:today?C.gold:C.panel,transition:"background .3s"}}/>;
          })}
        </div>
      </div>

      {/* Quick stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,margin:"0 14px 14px"}}>
        {[[user.refs||0,"Referrals","◎"],[user.streak||0,"Streak Days","⚡"],[user.tier||"Bronze","Tier","◬"]].map(function(s){
          return <div key={s[1]} style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:"14px 10px",textAlign:"center"}}>
            <div style={{fontSize:20,marginBottom:4,color:C.sub}}>{s[2]}</div>
            <div style={{fontSize:s[0].toString().length>5?14:18,fontWeight:800,color:C.text,fontFamily:typeof s[0]==="number"?"JetBrains Mono":"Outfit"}}>{s[0]}</div>
            <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginTop:3}}>{s[1]}</div>
          </div>;
        })}
      </div>

      {/* Recent Activity */}
      <div style={{margin:"0 14px 14px",background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:"14px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:14,fontWeight:700,color:C.text}}>Recent Activity</div>
          <div onClick={function(){navTo("rewards");}} style={{fontSize:12,color:C.sub,cursor:"pointer"}}>View all →</div>
        </div>
        {txns.length===0?<div style={{textAlign:"center",padding:"16px 0",fontSize:12,color:C.muted}}>No activity yet — start earning!</div>
        :txns.slice(0,4).map(function(t,i){
          return <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderTop:i===0?"none":"1px solid "+C.div}}>
            <div style={{width:34,height:34,borderRadius:10,background:typeCol(t.type)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{typeIcon(t.type)}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.desc}</div>
              <div style={{fontSize:10,color:C.muted}}>{t.date}</div>
            </div>
            <div style={{fontWeight:700,fontFamily:"JetBrains Mono",color:t.amt>0?C.success:C.danger,fontSize:13,flexShrink:0}}>{t.amt>0?"+":""}{fmt(t.amt)}</div>
          </div>;
        })}
      </div>

      {/* Invite banner */}
      <div style={{margin:"0 14px",background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>👥</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>Invite Friends</div>
            <div style={{fontSize:11,color:C.sub}}>Earn $1.00 for every friend who joins and earns</div>
          </div>
        </div>
        <Btn onClick={function(){navTo("social");}} v="outline" style={{fontSize:12,padding:"7px 14px",borderRadius:20,whiteSpace:"nowrap"}}>Share</Btn>
      </div>

      {/* Streak claim sheet */}
      <Sheet show={showClaim} onClose={function(){setShowClaim(false);}} C={C} title="Claim Daily Streak">
        <div style={{padding:"24px 20px",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:12}}>⚡</div>
          <div style={{fontSize:28,fontWeight:900,color:C.gold,fontFamily:"JetBrains Mono",marginBottom:6}}>+{fmt(todayReward)}</div>
          <div style={{fontSize:14,color:C.sub,marginBottom:6}}>Day {streakDay} streak bonus</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:24,lineHeight:1.6}}>Claim every day to build your streak.<br/>Missing a day resets to Day 1.</div>
          <Btn onClick={claimStreak} v="gold" style={{width:"100%",padding:15,fontSize:15}}>Claim {fmt(todayReward)}</Btn>
        </div>
      </Sheet>

      {/* Calendar sheet */}
      <Sheet show={showCal} onClose={function(){setShowCal(false);}} C={C} title="Streak Calendar">
        <div style={{padding:"16px 18px 24px"}}>
          {(function(){
            var now=new Date(); var year=now.getFullYear(); var month=now.getMonth();
            var daysInMonth=new Date(year,month+1,0).getDate();
            var firstDay=new Date(year,month,1).getDay();
            var today=now.getDate();
            var cells=[];
            for(var i=0;i<firstDay;i++) cells.push(null);
            for(var d=1;d<=daysInMonth;d++) cells.push(d);
            return <div>
              <div style={{textAlign:"center",fontSize:14,fontWeight:700,color:C.text,marginBottom:14}}>
                {now.toLocaleString("default",{month:"long"})} {year}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:8}}>
                {["S","M","T","W","T","F","S"].map(function(d,i){
                  return <div key={i} style={{textAlign:"center",fontSize:9,color:C.muted,fontWeight:700,padding:"2px 0"}}>{d}</div>;
                })}
                {cells.map(function(d,i){
                  var isToday=d===today;
                  var isPast=d&&d<today;
                  return <div key={i} style={{aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,background:isToday?C.gold+"22":isPast?C.success+"22":"transparent",border:isToday?"2px solid "+C.gold+"88":"1px solid "+(d?C.div:"transparent"),fontSize:11,fontWeight:isToday?800:400,color:isToday?C.gold:isPast?C.success:d?C.muted:C.bg}}>
                    {d||""}
                  </div>;
                })}
              </div>
              <div style={{fontSize:10,color:C.muted,textAlign:"center",lineHeight:1.7}}>
                <span style={{color:C.success}}>■</span> Past days claimed &nbsp;
                <span style={{color:C.gold}}>■</span> Today
              </div>
            </div>;
          })()}
        </div>
      </Sheet>
    </div>
  );
}

/* ── EARN TAB ── */
function EarnTab({user,setUser,C,addTxn,setGlobalTxns}){
  var earnTab=useState("offers"); var setEarnTab=earnTab[1]; earnTab=earnTab[0];
  var srch=useState(""); var setSrch=srch[1]; srch=srch[0];
  var cat=useState("all"); var setCat=cat[1]; cat=cat[0];
  var taskCat=useState("all"); var setTaskCat=taskCat[1]; taskCat=taskCat[0];
  var selOffer=useState(null); var setSelOffer=selOffer[1]; selOffer=selOffer[0];
  var selTask=useState(null); var setSelTask=selTask[1]; selTask=selTask[0];
  var completing=useState(null); var setCompleting=completing[1]; completing=completing[0];
  var doneOffers=useState([]); var setDoneOffers=doneOffers[1]; doneOffers=doneOffers[0];
  var doneTasks=useState([]); var setDoneTasks=doneTasks[1]; doneTasks=doneTasks[0];
  var startingId=useState(null); var setStartingId=startingId[1]; startingId=startingId[0];
  var loading=useState(true); var setLoading=loading[1]; loading=loading[0];
  useEffect(function(){var t=setTimeout(function(){setLoading(false);},800);return function(){clearTimeout(t);};;},[]);

  var OFFER_CATS=["all","surveys","videos","games","installs","tasks"];
  var TASK_CATS=["all","social","review","signup","other"];
  var offers=OFFERS.filter(function(o){
    var ms=!srch||o.title.toLowerCase().indexOf(srch.toLowerCase())>=0;
    var mc=cat==="all"||o.cat===cat;
    return ms&&mc;
  });
  var tasks=TASKS.filter(function(t){return taskCat==="all"||t.cat===taskCat;});

  function startOffer(offer){
    setSelOffer(null); setStartingId(offer.id);
    if(navigator.vibrate) navigator.vibrate([80,30,50,30,50]);
    setTimeout(function(){
      setStartingId(null); setCompleting(offer);
      var txnId="TXN-O"+Date.now();
      if(addTxn) addTxn({id:txnId,type:"earn",desc:offer.title,provider:offer.prov,amt:offer.reward,date:"Just now",status:"pending",detail:"Submitted to "+offer.prov+". Awaiting postback confirmation."});
      setDoneOffers(function(p){return p.concat([offer.id]);});
      setTimeout(function(){
        if(setGlobalTxns) setGlobalTxns(function(p){return p.map(function(t){return t.id===txnId?Object.assign({},t,{status:"completed"}):t;});});
        setUser(function(p){return Object.assign({},p,{balance:+(p.balance+offer.reward).toFixed(2),totalEarned:+(p.totalEarned+offer.reward).toFixed(2)});});
      },30000);
      setTimeout(function(){setCompleting(null);},2800);
    },600);
  }

  function startTask(task){
    setSelTask(null);
    if(task.url) window.open(task.url,"_blank");
    var txnId="TXN-T"+Date.now();
    if(addTxn) addTxn({id:txnId,type:"task",desc:task.title,provider:task.company||"Cosmo",amt:task.reward,date:"Just now",status:"pending",detail:"Task submitted. Reward credited after verification (up to 24 hours)."});
    setTimeout(function(){
      if(setGlobalTxns) setGlobalTxns(function(p){return p.map(function(t){return t.id===txnId?Object.assign({},t,{status:"completed"}):t;});});
      setUser(function(p){return Object.assign({},p,{balance:+(p.balance+task.reward).toFixed(2),totalEarned:+(p.totalEarned+task.reward).toFixed(2)});});
      setDoneTasks(function(p){return p.concat([task.id]);});
    },10000);
  }

  var accents=["#c8a84b","#a0a3c4","#2ed880","#f5a623","#ff6b9d","#64b5f6"];

  return(
    <div style={{minHeight:"100%",background:C.bg,paddingBottom:20}}>
      {/* Tabs */}
      <div style={{display:"flex",gap:0,background:C.surf,borderBottom:"1px solid "+C.div,padding:"0 16px"}}>
        {[["offers","Offerwalls"],["tasks","Tasks"]].map(function(t){
          return <button key={t[0]} onClick={function(){setEarnTab(t[0]);}} style={{flex:1,padding:"14px 0",background:"none",border:"none",borderBottom:"2px solid "+(earnTab===t[0]?C.chrome:"transparent"),color:earnTab===t[0]?C.text:C.sub,fontWeight:earnTab===t[0]?700:400,fontSize:13,cursor:"pointer",fontFamily:"Outfit",transition:"all .15s"}}>{t[1]}</button>;
        })}
      </div>

      {/* Search */}
      <div style={{padding:"12px 14px 0"}}>
        <div style={{position:"relative"}}>
          <svg style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={srch} onChange={function(e){setSrch(e.target.value);}} placeholder={earnTab==="offers"?"Search offers...":"Search tasks..."} style={{background:C.panel,border:"1px solid "+C.border,color:C.text,borderRadius:12,paddingLeft:34,marginBottom:0}}/>
          {srch&&<button onClick={function(){setSrch("");}} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:C.sub,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>}
        </div>
      </div>

      {/* Category pills */}
      <div style={{display:"flex",gap:6,padding:"10px 14px",overflowX:"auto"}}>
        {(earnTab==="offers"?OFFER_CATS:TASK_CATS).map(function(c){
          var active=(earnTab==="offers"?cat:taskCat)===c;
          return <button key={c} onClick={function(){earnTab==="offers"?setCat(c):setTaskCat(c);}} style={{background:active?"linear-gradient(135deg,"+C.silver+","+C.chrome+")":"transparent",border:"1px solid "+(active?"transparent":C.border),borderRadius:20,padding:"5px 14px",cursor:"pointer",color:active?C.bg:C.sub,fontSize:11,fontWeight:700,fontFamily:"Outfit",whiteSpace:"nowrap",textTransform:"capitalize",flexShrink:0}}>{c}</button>;
        })}
      </div>

      {/* Content */}
      <div style={{padding:"0 14px"}}>
        {loading
          ?Array(4).fill(0).map(function(_,i){return <div key={i} style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:16,marginBottom:10}}><Skel C={C} h={16} r={8}/><div style={{marginTop:8}}/><Skel C={C} h={12} r={6}/></div>;})
          :earnTab==="offers"
            ?(offers.length===0
              ?<Empty msg={srch?"No offers match your search":"No offers available right now — check back soon!"} C={C}/>
              :offers.map(function(offer,i){
                var done=doneOffers.includes(offer.id);
                var starting=startingId===offer.id;
                var accent=accents[i%accents.length];
                return <div key={offer.id} onClick={function(){if(!done)setSelOffer(offer);}} style={{background:C.card,border:"1px solid "+(done?C.success+"44":C.border),borderRadius:16,padding:"14px 16px",marginBottom:10,cursor:done?"default":"pointer",borderLeft:"4px solid "+accent,opacity:done?0.7:1,transition:"opacity .2s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                        {offer.featured&&<Pill label="FEATURED" color={C.gold} bg={C.gold+"18"}/>}
                        {offer.time&&<Pill label={offer.time} color={C.sub} bg={C.panel}/>}
                        {offer.diff&&<Pill label={offer.diff} color={offer.diff==="Easy"?C.success:offer.diff==="Medium"?C.warn:C.danger} bg={(offer.diff==="Easy"?C.success:offer.diff==="Medium"?C.warn:C.danger)+"18"}/>}
                      </div>
                      <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:3}}>{offer.title}</div>
                      <div style={{fontSize:11,color:C.sub}}>{offer.prov} · {offer.desc}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:20,fontWeight:900,color:accent,fontFamily:"JetBrains Mono"}}>+{fmt(offer.reward)}</div>
                      <div style={{fontSize:10,color:done?C.success:starting?C.gold:C.sub,marginTop:2,fontWeight:done||starting?700:400}}>{done?"Done ✓":starting?"Starting...":"Tap to start"}</div>
                    </div>
                  </div>
                </div>;
              })
            )
            :(tasks.length===0
              ?<Empty msg={srch?"No tasks match your search":"No tasks available — check back soon!"} C={C}/>
              :tasks.map(function(task){
                var done=doneTasks.includes(task.id);
                return <div key={task.id} onClick={function(){if(!done)setSelTask(task);}} style={{background:C.card,border:"1px solid "+(done?C.success+"44":C.border),borderRadius:16,padding:"14px 16px",marginBottom:10,cursor:done?"default":"pointer",opacity:done?0.7:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:3}}>{task.title}</div>
                      <div style={{fontSize:11,color:C.sub}}>{task.company} · {task.cat}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:18,fontWeight:800,color:C.success,fontFamily:"JetBrains Mono"}}>+{fmt(task.reward)}</div>
                      <div style={{fontSize:10,color:done?C.success:C.sub,marginTop:2,fontWeight:done?700:400}}>{done?"Done ✓":"Tap to do"}</div>
                    </div>
                  </div>
                </div>;
              })
            )
        }
      </div>

      {/* Offer detail sheet */}
      {selOffer&&<Sheet show={true} onClose={function(){setSelOffer(null);}} C={C} title={selOffer.prov}>
        <div style={{padding:"0 18px 28px"}}>
          <div style={{fontSize:20,fontWeight:800,color:C.text,marginBottom:4,marginTop:12}}>{selOffer.title}</div>
          <div style={{fontSize:13,color:C.sub,marginBottom:16,lineHeight:1.7}}>{selOffer.desc}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {[["Reward",fmt(selOffer.reward),"$"],["Time",selOffer.time||"Varies","⏱"],["Difficulty",selOffer.diff||"Easy","◈"],["Provider",selOffer.prov,"◎"]].map(function(r){
              return <div key={r[0]} style={{background:C.panel,borderRadius:12,padding:"12px 14px"}}>
                <div style={{fontSize:10,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{r[0]}</div>
                <div style={{fontSize:13,fontWeight:700,color:C.chrome}}>{r[1]}</div>
              </div>;
            })}
          </div>
          <div style={{background:C.warn+"14",border:"1px solid "+C.warn+"44",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:11,color:C.warn,lineHeight:1.7}}>
            ⚠ Rewards are credited after postback confirmation (usually within 1 hour). If your reward doesn't arrive within 24 hours, use Missing Reward in your profile.
          </div>
          <Btn onClick={function(){startOffer(selOffer);}} style={{width:"100%",padding:15,fontSize:15}}>Start Offer</Btn>
        </div>
      </Sheet>}

      {/* Task detail sheet */}
      {selTask&&<Sheet show={true} onClose={function(){setSelTask(null);}} C={C} title={selTask.company||"Task"}>
        <div style={{padding:"0 18px 28px"}}>
          <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:6,marginTop:12}}>{selTask.title}</div>
          <div style={{fontSize:13,color:C.sub,marginBottom:16,lineHeight:1.7}}>{selTask.desc||"Complete the task to earn your reward."}</div>
          <div style={{background:C.panel,borderRadius:12,padding:"14px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,color:C.sub}}>Reward</span>
            <span style={{fontSize:20,fontWeight:900,color:C.success,fontFamily:"JetBrains Mono"}}>+{fmt(selTask.reward)}</span>
          </div>
          <div style={{background:C.warn+"14",border:"1px solid "+C.warn+"44",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:11,color:C.warn,lineHeight:1.7}}>
            ⚠ Task rewards are pending for up to 24 hours while we verify completion.
          </div>
          <Btn onClick={function(){startTask(selTask);}} style={{width:"100%",padding:14,fontSize:14}}>
            {selTask.url?"Open & Complete Task":"Mark as Complete"}
          </Btn>
        </div>
      </Sheet>}

      {/* Completion overlay */}
      {completing&&(
        <div onClick={function(){setCompleting(null);}} style={{position:"fixed",inset:0,background:"rgba(6,7,13,.97)",zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"Outfit",cursor:"pointer"}}>
          <div style={{fontSize:52,marginBottom:12,animation:"pop .4s ease"}}>◈</div>
          <div style={{fontSize:32,fontWeight:900,color:C.success,fontFamily:"JetBrains Mono",marginBottom:8}}>+{fmt(completing.reward)}</div>
          <div style={{fontSize:16,fontWeight:700,color:"rgba(220,222,246,.9)",marginBottom:6}}>{completing.title}</div>
          <div style={{fontSize:12,color:"rgba(173,177,204,.5)",marginBottom:4}}>Pending postback confirmation</div>
          <div style={{fontSize:10,color:"rgba(173,177,204,.3)",marginTop:10}}>Tap anywhere to dismiss</div>
          {/* Confetti */}
          {Array(8).fill(0).map(function(_,i){
            var colors=[C.gold,C.silver,C.success,C.warn,"#ff6b9d","#64b5f6","#a78bfa","#34d399"];
            return <div key={i} style={{position:"absolute",top:"30%",left:(15+i*10)+"%",width:8,height:8,borderRadius:2,background:colors[i%colors.length],animation:"confetti 1."+(5+i*.2)+"s ease-out "+(i*.1)+"s forwards"}}/>;
          })}
        </div>
      )}
    </div>
  );
}

/* ── REWARDS TAB ── */
function RewardsTab({user,setUser,C,globalTxns,setGlobalTxns}){
  var txns=globalTxns||TXNS;
  var setTxns=setGlobalTxns||function(){};
  var rtab=useState("wallet"); var setRtab=rtab[1]; rtab=rtab[0];
  var txFilter=useState("all"); var setTxFilter=txFilter[1]; txFilter=txFilter[0];
  var txSearch=useState(""); var setTxSearch=txSearch[1]; txSearch=txSearch[0];
  var showWD=useState(false); var setShowWD=showWD[1]; showWD=showWD[0];
  var showGC=useState(false); var setShowGC=showGC[1]; showGC=showGC[0];
  var wdStep=useState(0); var setWdStep=wdStep[1]; wdStep=wdStep[0];
  var gcStep=useState(0); var setGcStep=gcStep[1]; gcStep=gcStep[0];
  var pinStep=useState(false); var setPinStep=pinStep[1]; pinStep=pinStep[0];
  var pinFor=useState(""); var setPinFor=pinFor[1]; pinFor=pinFor[0];
  var wdM=useState("PayPal"); var setWdM=wdM[1]; wdM=wdM[0];
  var wdAmt=useState(""); var setWdAmt=wdAmt[1]; wdAmt=wdAmt[0];
  var wdEmail=useState(""); var setWdEmail=wdEmail[1]; wdEmail=wdEmail[0];
  var brand=useState(null); var setBrand=brand[1]; brand=brand[0];
  var gcType=useState(null); var setGcType=gcType[1]; gcType=gcType[0];
  var denom=useState(null); var setDenom=denom[1]; denom=denom[0];
  var selTxn=useState(null); var setSelTxn=selTxn[1]; selTxn=selTxn[0];
  var showCancelConfirm=useState(false); var setShowCancelConfirm=showCancelConfirm[1]; showCancelConfirm=showCancelConfirm[0];
  var toast=useState(""); var setToast=toast[1]; toast=toast[0];

  var pendingAmt=(txns||[]).filter(function(t){return t.status==="pending"&&t.amt>0;}).reduce(function(a,t){return a+t.amt;},0);
  var withdrawable=Math.max(0,+(( user.balance||0)-pendingAmt).toFixed(2));

  function showT(msg){setToast(msg);setTimeout(function(){setToast("");},2500);}
  function addTxnLocal(t){setTxns(function(p){return [t].concat(p);});setUser(function(u){return Object.assign({},u,{recentTxns:[t].concat((u.recentTxns||[]).slice(0,3))});});}

  function startWD(){
    var a=parseFloat(wdAmt);
    if(!a||a<5){showT("Minimum withdrawal is $5.00");return;}
    if(a>withdrawable){showT("Insufficient withdrawable balance — pending earnings not yet confirmed");return;}
    if(!wdEmail.includes("@")){showT("Enter a valid "+wdM+" email address");return;}
    setPinFor("wd");setPinStep(true);
  }
  function startGC(){
    if(!denom){showT("Select a denomination");return;}
    if(denom>withdrawable){showT("Insufficient withdrawable balance — pending earnings not yet confirmed");return;}
    setPinFor("gc");setPinStep(true);
  }
  function confirmPin(){
    setPinStep(false);
    if(pinFor==="wd"){
      var a=parseFloat(wdAmt);
      var newT={id:"TXN-"+Date.now(),type:"wd",desc:wdM+" Withdrawal",provider:wdM,amt:-a,date:"Just now",status:"pending",wdMethod:wdM,wdEmail:wdEmail,txnRef:"REF-"+Math.floor(Math.random()*9000000+1000000),detail:"Withdrawal submitted. Pending admin review — typically 1-2 business days. Ledger: Immutable record — cannot be deleted or edited."};
      setUser(function(p){return Object.assign({},p,{balance:Math.max(0,+(p.balance-a).toFixed(2))});});
      addTxnLocal(newT);setShowWD(false);setWdAmt("");setWdEmail("");setWdStep(0);
      showT(wdM+" withdrawal of "+fmt(a)+" submitted");
    } else {
      var bn=brand&&brand.name; var td=gcType&&gcType.name;
      var newT2={id:"TXN-"+Date.now(),type:"gc",desc:bn+" "+td+" $"+denom,provider:"Cosmo",amt:-denom,date:"Just now",status:"pending",detail:"Gift card order submitted. Admin will verify and email the code within 24 hours. Ledger: Immutable record — cannot be deleted or edited."};
      setUser(function(p){return Object.assign({},p,{balance:Math.max(0,+(p.balance-denom).toFixed(2))});});
      addTxnLocal(newT2);setShowGC(false);setBrand(null);setGcType(null);setDenom(null);setGcStep(0);
      showT("Gift card order submitted — code arrives within 24 hours");
    }
  }

  var GC_BRANDS=[
    {id:"amz",name:"Amazon",  abbr:"AMZ",color:"#ff9900",types:[{name:"Gift Card"},{name:"Reload"}]},
    {id:"stm",name:"Steam",   abbr:"STM",color:"#1b2838",types:[{name:"Wallet Credit"}]},
    {id:"nfx",name:"Netflix", abbr:"NFX",color:"#e50914",types:[{name:"Gift Card"}]},
    {id:"gpl",name:"Google Play",abbr:"GPL",color:"#4285f4",types:[{name:"Play Credit"}]},
    {id:"spt",name:"Spotify", abbr:"SPT",color:"#1db954",types:[{name:"Premium"}]},
    {id:"apl",name:"Apple",   abbr:"APL",color:"#555",types:[{name:"App Store"}]},
    {id:"ubr",name:"Uber",    abbr:"UBR",color:"#000",types:[{name:"Ride Credit"}]},
    {id:"xbox",name:"Xbox",   abbr:"XBX",color:"#107c10",types:[{name:"Gift Card"}]},
  ];
  var DENOMS=[5,10,25,50,100];

  var filtered=txns.filter(function(t){
    var mf=txFilter==="all"||t.type===txFilter;
    var ms=!txSearch||(t.desc||"").toLowerCase().indexOf(txSearch.toLowerCase())>=0;
    return mf&&ms;
  });

  var statusCol=function(s){return{completed:C.success,pending:C.warn,processing:C.silver,sent:C.success,rejected:C.danger,cancelled:C.muted}[s]||C.sub;};
  var typeIcon=function(t){return{earn:"◈",ref:"◎",streak:"⚡",wd:"↑",gc:"⬡",comp:"◉",task:"◫"}[t]||"◈";};

  var TRACKER_STEPS={wd:["Submitted","Under Review","Processing","Sent"],gc:["Submitted","Verified","Preparing Code","Code Sent"]};

  return(
    <div style={{minHeight:"100%",background:C.bg,paddingBottom:20}}>
      {toast&&<div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",background:C.card,border:"1px solid "+C.border,borderRadius:20,padding:"10px 18px",fontSize:12,color:C.text,zIndex:300,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,.4)"}}>{toast}</div>}

      {/* Tabs */}
      <div style={{display:"flex",background:C.surf,borderBottom:"1px solid "+C.div,padding:"0 16px"}}>
        {[["wallet","Wallet"],["history","History"]].map(function(t){
          return <button key={t[0]} onClick={function(){setRtab(t[0]);}} style={{flex:1,padding:"14px 0",background:"none",border:"none",borderBottom:"2px solid "+(rtab===t[0]?C.chrome:"transparent"),color:rtab===t[0]?C.text:C.sub,fontWeight:rtab===t[0]?700:400,fontSize:13,cursor:"pointer",fontFamily:"Outfit"}}>{t[1]}</button>;
        })}
      </div>

      {rtab==="wallet"&&(
        <div style={{padding:"14px"}}>
          {/* Balance card */}
          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:"18px",marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div>
                <div style={{fontSize:10,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>Total Balance</div>
                <div style={{fontSize:30,fontWeight:900,fontFamily:"JetBrains Mono",color:C.success}}>{fmt(user.balance||0)}</div>
                <div style={{display:"flex",gap:14,fontSize:11,marginTop:4}}>
                  <span style={{color:C.sub}}>Withdrawable: <span style={{color:C.chrome,fontWeight:700}}>{fmt(withdrawable)}</span></span>
                  {pendingAmt>0&&<span style={{color:C.warn}}>Pending: <span style={{fontWeight:700}}>{fmt(pendingAmt)}</span></span>}
                </div>
              </div>
              <Btn onClick={function(){setShowWD(true);}} v="outline" style={{fontSize:12,padding:"9px 16px",borderRadius:20,whiteSpace:"nowrap"}}>Withdraw</Btn>
            </div>
            {pendingAmt>0&&<div style={{background:C.warn+"14",border:"1px solid "+C.warn+"44",borderRadius:8,padding:"8px 12px",marginTop:8,fontSize:11,color:C.warn}}>⏳ {fmt(pendingAmt)} pending verification — not yet withdrawable</div>}
            <div style={{height:1,background:C.div,margin:"14px 0 10px"}}/>
            <div style={{fontSize:10,color:C.muted,lineHeight:1.7}}>Withdrawable = confirmed earnings only. Pending offers/tasks credit after postback verification (up to 24h).</div>
          </div>
          {/* Gift cards */}
          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:"16px",marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:12}}>Gift Cards</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {GC_BRANDS.map(function(b){
                return <div key={b.id} onClick={function(){setBrand(b);setShowGC(true);setGcStep(0);}} style={{background:C.panel,border:"1px solid "+C.border,borderRadius:12,padding:"10px 4px",cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:11,fontWeight:800,color:b.color,fontFamily:"JetBrains Mono",marginBottom:2}}>{b.abbr}</div>
                  <div style={{fontSize:8,color:C.muted}}>{b.name}</div>
                </div>;
              })}
            </div>
          </div>
        </div>
      )}

      {rtab==="history"&&(
        <div style={{padding:"14px"}}>
          <div style={{position:"relative",marginBottom:10}}>
            <svg style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={txSearch} onChange={function(e){setTxSearch(e.target.value);}} placeholder="Search transactions..." style={{background:C.panel,border:"1px solid "+C.border,color:C.text,borderRadius:12,paddingLeft:32,marginBottom:0}}/>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto"}}>
            {(function(){var types=[["all","All"],["earn","Earn"],["task","Tasks"],["streak","Streak"],["ref","Referral"],["comp","Competition"],["wd","Withdrawal"],["gc","Gift Card"]];
              return types.map(function(t){
                var a=txFilter===t[0];
                return <button key={t[0]} onClick={function(){setTxFilter(t[0]);}} style={{background:a?"linear-gradient(135deg,"+C.silver+","+C.chrome+")":"transparent",border:"1px solid "+(a?"transparent":C.border),borderRadius:20,padding:"5px 12px",cursor:"pointer",color:a?C.bg:C.sub,fontSize:10,fontWeight:700,fontFamily:"Outfit",whiteSpace:"nowrap",flexShrink:0}}>{t[1]}</button>;
              });
            })()}
          </div>
          {filtered.length===0?<Empty msg="No transactions yet" C={C}/>
            :filtered.map(function(t,i){
              return <div key={t.id||i} onClick={function(){setSelTxn(t);}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:C.card,border:"1px solid "+C.border,borderRadius:14,marginBottom:8,cursor:"pointer"}}>
                <div style={{width:36,height:36,borderRadius:10,background:statusCol(t.status)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{typeIcon(t.type)}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.desc}</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:2,display:"flex",gap:8}}>
                    <span>{t.date}</span>
                    <span style={{color:statusCol(t.status),fontWeight:700,textTransform:"capitalize"}}>{t.status}</span>
                  </div>
                </div>
                <div style={{fontWeight:700,fontFamily:"JetBrains Mono",color:t.amt>0?C.success:C.danger,fontSize:13,flexShrink:0}}>{t.amt>0?"+":""}{fmt(t.amt)}</div>
              </div>;
            })
          }
        </div>
      )}

      {/* WD Sheet */}
      <Sheet show={showWD} onClose={function(){setShowWD(false);setWdStep(0);setWdAmt("");setWdEmail("");}} C={C} title="Withdraw Cash">
        <div style={{padding:"16px 18px 28px"}}>
          <div style={{fontSize:12,color:C.sub,marginBottom:14}}>Withdrawable: <span style={{color:C.success,fontWeight:700}}>{fmt(withdrawable)}</span>{pendingAmt>0&&<span style={{color:C.warn,marginLeft:8,fontSize:10}}>({fmt(pendingAmt)} pending)</span>}</div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {["PayPal","Wise"].map(function(m){
              return <button key={m} onClick={function(){setWdM(m);}} style={{flex:1,padding:"10px",background:wdM===m?"linear-gradient(135deg,"+C.silver+","+C.chrome+")":C.panel,border:"1px solid "+(wdM===m?"transparent":C.border),borderRadius:12,cursor:"pointer",color:wdM===m?C.bg:C.sub,fontWeight:700,fontFamily:"Outfit",fontSize:13}}>{m}</button>;
            })}
          </div>
          <TextField label={"Amount (min $5, max $500)"} type="number" value={wdAmt} onChange={function(e){setWdAmt(e.target.value);}} placeholder="0.00" C={C}/>
          <TextField label={wdM+" Email"} type="email" value={wdEmail} onChange={function(e){setWdEmail(e.target.value);}} placeholder={"your@"+wdM.toLowerCase()+".com"} C={C}/>
          <div style={{background:C.warn+"14",border:"1px solid "+C.warn+"33",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:11,color:C.warn,lineHeight:1.7}}>
            Withdrawals are reviewed within 1-2 business days. Minimum $5.00. Your balance is deducted immediately and refunded if rejected.
          </div>
          <Btn onClick={startWD} style={{width:"100%",padding:14}}>Continue to PIN</Btn>
        </div>
      </Sheet>

      {/* GC Sheet */}
      <Sheet show={showGC} onClose={function(){setShowGC(false);setBrand(null);setGcType(null);setDenom(null);setGcStep(0);}} C={C} title={brand?brand.name+" Gift Card":"Gift Card"}>
        <div style={{padding:"16px 18px 28px"}}>
          {gcStep===0&&brand&&<>
            <div style={{fontSize:13,color:C.sub,marginBottom:14}}>Select type</div>
            {brand.types.map(function(t){
              return <div key={t.name} onClick={function(){setGcType(t);setGcStep(1);}} style={{background:C.panel,border:"1px solid "+C.border,borderRadius:12,padding:"14px",marginBottom:10,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:14,fontWeight:600,color:C.text}}>{t.name}</span>
                <span style={{color:C.sub}}>›</span>
              </div>;
            })}
          </>}
          {gcStep===1&&<>
            <div style={{fontSize:13,color:C.sub,marginBottom:14}}>Select denomination</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
              {DENOMS.map(function(d){
                return <button key={d} onClick={function(){setDenom(d);}} style={{background:denom===d?"linear-gradient(135deg,"+C.silver+","+C.chrome+")":C.panel,border:"1px solid "+(denom===d?"transparent":C.border),borderRadius:12,padding:"14px 8px",cursor:"pointer",fontFamily:"JetBrains Mono",fontWeight:800,fontSize:16,color:denom===d?C.bg:C.text}}>{"$"+d}</button>;
              })}
            </div>
            <Btn onClick={startGC} style={{width:"100%",padding:14}} disabled={!denom}>Continue to PIN</Btn>
          </>}
        </div>
      </Sheet>

      {/* PIN step */}
      <Sheet show={pinStep} onClose={function(){setPinStep(false);}} C={C} title="Confirm with PIN">
        <div style={{padding:"24px 18px 32px",textAlign:"center"}}>
          <div style={{fontSize:13,color:C.sub,marginBottom:24,lineHeight:1.6}}>Enter your 4-digit withdrawal PIN to confirm{pinFor==="wd"?" the "+fmt(parseFloat(wdAmt)||0)+" "+wdM+" withdrawal":" the "+fmt(denom||0)+" "+(brand&&brand.name)+" gift card"}</div>
          <PinBox label="" onDone={confirmPin} C={C}/>
          <div style={{fontSize:11,color:C.muted,marginTop:16}}>Forgot your PIN? Change it in Profile → Security</div>
        </div>
      </Sheet>

      {/* Cancel confirm */}
      <Pop show={showCancelConfirm} onClose={function(){setShowCancelConfirm(false);}} C={C}>
        <div style={{textAlign:"center",padding:"8px 0 6px"}}>
          <div style={{fontSize:28,marginBottom:10,color:C.danger}}>⊘</div>
          <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:6}}>Cancel Withdrawal?</div>
          <div style={{fontSize:12,color:C.sub,lineHeight:1.7,marginBottom:20}}>{selTxn&&fmt(Math.abs(selTxn.amt))} will be returned to your balance.</div>
          <div style={{display:"flex",gap:10}}>
            <Btn onClick={function(){setShowCancelConfirm(false);}} v="ghost" style={{flex:1,fontSize:13,padding:11,borderRadius:12}}>Keep It</Btn>
            <Btn onClick={function(){
              if(selTxn){
                setTxns(function(p){return p.map(function(t){return t.id===selTxn.id?Object.assign({},t,{status:"cancelled"}):t;});});
                setUser(function(p){return Object.assign({},p,{balance:+(p.balance+Math.abs(selTxn.amt)).toFixed(2)});});
                setSelTxn(null);
              }
              setShowCancelConfirm(false);
              showT("Withdrawal cancelled — balance restored");
            }} v="danger" style={{flex:1,fontSize:13,padding:11,borderRadius:12}}>Cancel Request</Btn>
          </div>
        </div>
      </Pop>

      {/* Txn detail sheet */}
      <Sheet show={!!selTxn} onClose={function(){setSelTxn(null);}} C={C} title="Transaction Detail">
        {selTxn&&<div style={{padding:"16px 18px 28px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontSize:24,fontWeight:900,fontFamily:"JetBrains Mono",color:selTxn.amt>0?C.success:C.danger}}>{selTxn.amt>0?"+":""}{fmt(selTxn.amt)}</div>
            <Pill label={selTxn.status} color={statusCol(selTxn.status)} bg={statusCol(selTxn.status)+"18"}/>
          </div>
          {[["Transaction ID",selTxn.id],["Ledger","Immutable record — cannot be deleted or edited"],["Date",selTxn.date],["Provider",selTxn.provider],["Method",selTxn.wdMethod||"—"],["Account",selTxn.wdEmail||"—"],["Reference",selTxn.txnRef||"—"]].map(function(r){
            return <div key={r[0]} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid "+C.div,fontSize:12,gap:12}}>
              <span style={{color:C.sub,flexShrink:0}}>{r[0]}</span>
              <span style={{color:C.text,fontFamily:"JetBrains Mono",textAlign:"right",wordBreak:"break-all",fontSize:11}}>{r[1]}</span>
            </div>;
          })}
          {selTxn.detail&&<div style={{background:C.panel,borderRadius:10,padding:"10px 14px",marginTop:12,fontSize:11,color:C.sub,lineHeight:1.7}}>{selTxn.detail}</div>}
          {/* Status tracker */}
          {(selTxn.type==="wd"||selTxn.type==="gc")&&<div style={{marginTop:16}}>
            {(TRACKER_STEPS[selTxn.type]||[]).map(function(step,i){
              var stepsDone=["submitted","pending","processing","sent","completed"].indexOf(selTxn.status);
              var done=i<=stepsDone||selTxn.status==="sent"||selTxn.status==="completed";
              return <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:20,height:20,borderRadius:"50%",background:done?C.success:C.panel,border:"2px solid "+(done?C.success:C.border),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {done&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span style={{fontSize:12,color:done?C.text:C.muted,fontWeight:done?600:400}}>{step}</span>
              </div>;
            })}
          </div>}
          {/* Cancel WD button */}
          {selTxn.type==="wd"&&selTxn.status==="pending"&&(
            <button onClick={function(){setShowCancelConfirm(true);}} style={{width:"100%",background:"rgba(255,64,96,.08)",border:"1px solid rgba(255,64,96,.3)",borderRadius:12,padding:"11px",cursor:"pointer",fontFamily:"Outfit",fontSize:13,fontWeight:700,color:C.danger,marginTop:14}}>Cancel Withdrawal Request</button>
          )}
          {selTxn.type==="wd"&&selTxn.status==="rejected"&&(
            <div style={{background:C.danger+"10",border:"1px solid "+C.danger+"33",borderRadius:10,padding:"10px 14px",marginTop:12,fontSize:11,color:C.danger,lineHeight:1.7}}>
              This withdrawal was rejected. Your balance has been refunded. If you believe this is an error, contact support with your transaction ID.
            </div>
          )}
        </div>}
      </Sheet>
    </div>
  );
}

/* ── SOCIAL TAB ── */
function SocialTab({user,setUser,addTxn,C}){
  var tab=useState("refs"); var setTab=tab[1]; tab=tab[0];
  var lbType=useState("earners"); var setLbType=lbType[1]; lbType=lbType[0];
  var copied=useState(false); var setCopied=copied[1]; copied=copied[0];
  var comps=useState(COMPS); var setComps=comps[1]; comps=comps[0];
  var selComp=useState(null); var setSelComp=selComp[1]; selComp=selComp[0];
  var code="COSMO-"+(user.username||"@USER").replace("@","").toUpperCase().slice(0,6);
  var tierCol=user.tier==="Gold"?C.gold:user.tier==="Silver"?C.silver:C.bronze;

  var TIERS=[
    {name:"Bronze",col:C.bronze,req:"Default",perks:["All offerwalls","Standard rates","Basic support"]},
    {name:"Silver",col:C.silver,req:"$200 earned or 10 refs",perks:["65% payout rate","Priority support","Silver badge"]},
    {name:"Gold",  col:C.gold,  req:"$1000 earned or 50 refs",perks:["80% payout rate","Dedicated support","Gold badge","Early feature access"]},
  ];

  function copyCode(){
    if(navigator.clipboard){navigator.clipboard.writeText(code).then(function(){setCopied(true);setTimeout(function(){setCopied(false);},2000);});}
    else{setCopied(true);setTimeout(function(){setCopied(false);},2000);}
  }
  function shareLink(){
    var url=window.location.origin+"?ref="+code;
    if(navigator.share){navigator.share({title:"Join Cosmo!",text:"Earn real cash from surveys and offers. Use my code: "+code,url:url});}
    else{if(navigator.clipboard) navigator.clipboard.writeText(url);}
  }

  return(
    <div style={{minHeight:"100%",background:C.bg,paddingBottom:20}}>
      <div style={{display:"flex",background:C.surf,borderBottom:"1px solid "+C.div,padding:"0 16px"}}>
        {[["refs","Referrals"],["comps","Competitions"],["leaderboard","Leaderboard"],["tiers","Tiers"]].map(function(t){
          return <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{flex:1,padding:"12px 0",background:"none",border:"none",borderBottom:"2px solid "+(tab===t[0]?C.chrome:"transparent"),color:tab===t[0]?C.text:C.sub,fontWeight:tab===t[0]?700:400,fontSize:11,cursor:"pointer",fontFamily:"Outfit"}}>{t[1]}</button>;
        })}
      </div>

      {/* ── REFERRALS ── */}
      {tab==="refs"&&<div style={{padding:"14px"}}>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:"18px",marginBottom:14}}>
          <div style={{fontSize:11,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>Your Referral Code</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
            <div style={{fontSize:22,fontWeight:900,letterSpacing:3,color:C.chrome,fontFamily:"JetBrains Mono"}}>{code}</div>
            <Btn onClick={copyCode} v="ghost" style={{fontSize:11,padding:"7px 14px",borderRadius:20}}>{copied?"Copied ✓":"Copy"}</Btn>
          </div>
        </div>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:"18px",marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:12}}>How it works</div>
          {[["1","Share your code or link","◎"],["2","Friend signs up and earns","⚡"],["3","You both get $1.00 bonus","$"]].map(function(s){
            return <div key={s[0]} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:C.silver+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:C.silver,flexShrink:0}}>{s[0]}</div>
              <div style={{fontSize:13,color:C.sub}}>{s[1]}</div>
              <div style={{marginLeft:"auto",fontSize:16,color:C.sub}}>{s[2]}</div>
            </div>;
          })}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:"14px",textAlign:"center"}}>
            <div style={{fontSize:28,fontWeight:900,fontFamily:"JetBrains Mono",color:C.chrome}}>{user.refs||0}</div>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginTop:3}}>Total Refs</div>
          </div>
          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:"14px",textAlign:"center"}}>
            <div style={{fontSize:28,fontWeight:900,fontFamily:"JetBrains Mono",color:C.success}}>{fmt((user.refs||0)*1)}</div>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginTop:3}}>Ref Earnings</div>
          </div>
        </div>
        <Btn onClick={shareLink} style={{width:"100%",padding:14,fontSize:14}}>Share Invite Link</Btn>
      </div>}

      {/* ── COMPETITIONS ── */}
      {tab==="comps"&&<div style={{padding:"14px"}}>
        {comps.length===0?<Empty msg="No competitions running right now — check back soon!" C={C}/>:comps.map(function(comp){
          return <div key={comp.id} onClick={function(){setSelComp(comp);}} style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:"16px",marginBottom:12,cursor:"pointer",borderTop:"2px solid "+(comp.joined?C.success:C.gold)}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:8}}>
              <div>
                <Pill label={comp.tag||"Competition"} color={C.gold} bg={C.gold+"18"}/>
                <div style={{fontSize:15,fontWeight:700,color:C.text,marginTop:6}}>{comp.name}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:20,fontWeight:900,color:C.gold,fontFamily:"JetBrains Mono"}}>{fmt(comp.prize)}</div>
                <div style={{fontSize:10,color:C.sub}}>prize pool</div>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.sub}}>
              <span>{comp.entered||0}/{comp.max||"∞"} entries</span>
              <span style={{color:C.warn}}>{countdown(comp.ends)}</span>
              {comp.joined&&<Pill label="Entered ✓" color={C.success} bg={C.success+"18"}/>}
            </div>
          </div>;
        })}
        <Sheet show={!!selComp} onClose={function(){setSelComp(null);}} C={C} title={selComp&&selComp.name}>
          {selComp&&<div style={{padding:"16px 18px 28px"}}>
            <div style={{fontSize:13,color:C.sub,lineHeight:1.7,marginBottom:16}}>{selComp.desc||"Enter for a chance to win a share of the prize pool."}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {[["Prize Pool",fmt(selComp.prize)],["Entry Cost",selComp.entryCost===0?"Free":fmt(selComp.entryCost)],["Entries",selComp.entered+"/"+selComp.max],["Ends",countdown(selComp.ends)]].map(function(r){
                return <div key={r[0]} style={{background:C.panel,borderRadius:12,padding:"12px 14px"}}>
                  <div style={{fontSize:10,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{r[0]}</div>
                  <div style={{fontSize:13,fontWeight:700,color:C.chrome}}>{r[1]}</div>
                </div>;
              })}
            </div>
            {selComp.joined
              ?<Btn v="ghost" style={{width:"100%",padding:14,fontSize:14}} disabled>Already Entered ✓</Btn>
              :<Btn onClick={function(){
                var cost=selComp.entryCost||0;
                if(cost>0&&(user.balance||0)<cost){return;}
                setComps(function(p){return p.map(function(c){return c.id===selComp.id?Object.assign({},c,{joined:true,entered:c.entered+1}):c;});});
                setSelComp(function(p){return Object.assign({},p,{joined:true,entered:p.entered+1});});
                if(cost>0&&setUser){setUser(function(p){return Object.assign({},p,{balance:Math.max(0,+(p.balance-cost).toFixed(2))});});}
                if(cost>0&&addTxn){addTxn({id:"TXN-C"+Date.now(),type:"comp",desc:"Entry — "+selComp.name,provider:"Cosmo",amt:-cost,date:"Just now",status:"completed",detail:"Entry fee paid for "+selComp.name+"."});}
              }} style={{width:"100%",padding:14,fontSize:14}}>
                {selComp.entryCost===0?"Enter for Free":"Enter for "+fmt(selComp.entryCost)}
              </Btn>
            }
          </div>}
        </Sheet>
      </div>}

      {/* ── LEADERBOARD ── */}
      {tab==="leaderboard"&&<div style={{padding:"14px"}}>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {[["earners","Top Earners"],["refs","Top Referrers"]].map(function(t){
            return <button key={t[0]} onClick={function(){setLbType(t[0]);}} style={{flex:1,background:lbType===t[0]?"linear-gradient(135deg,"+C.silver+","+C.chrome+")":C.panel,border:"1px solid "+(lbType===t[0]?"transparent":C.border),borderRadius:12,padding:10,fontFamily:"Outfit",fontSize:12,fontWeight:700,color:lbType===t[0]?C.bg:C.sub,cursor:"pointer"}}>{t[1]}</button>;
          })}
        </div>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,overflow:"hidden"}}>
          {(function(){
            var LB=lbType==="earners"?LB_EARNERS:LB_REFS;
            if(LB.length===0) return <Empty msg="Leaderboard populates once users start earning. Be the first!" C={C}/>;
            var medals=["◉","◈","◬"];
            return LB.map(function(e,i){
              return <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderTop:i===0?"none":"1px solid "+C.div,background:e.me?C.silver+"10":"transparent"}}>
                <div style={{fontSize:16,width:26,textAlign:"center",flexShrink:0,color:i===0?C.gold:i===1?C.silver:i===2?C.bronze:C.sub,fontWeight:900}}>{medals[i]||e.rank}</div>
                <div style={{width:32,height:32,borderRadius:9,background:C.panel,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:C.silver,flexShrink:0,border:"1px solid "+C.border}}>{e.handle[1].toUpperCase()}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:e.me?800:600,color:e.me?C.chrome:C.text}}>{e.handle}{e.me&&" (You)"}</div>
                  <div style={{fontSize:10,color:C.muted}}>{e.refs} refs</div>
                </div>
                <div style={{fontFamily:"JetBrains Mono",fontWeight:700,color:lbType==="earners"?C.success:C.silver,fontSize:13}}>{lbType==="earners"?fmt(e.earned):e.refs+" refs"}</div>
              </div>;
            });
          })()}
        </div>
        <div style={{fontSize:11,color:C.muted,textAlign:"center",marginTop:10}}>Resets weekly · Updated in real-time</div>
      </div>}

      {/* ── TIERS ── */}
      {tab==="tiers"&&<div style={{padding:"14px"}}>
        <div style={{background:C.card,border:"1px solid "+tierCol+"44",borderRadius:16,padding:"16px",marginBottom:14,borderTop:"2px solid "+tierCol}}>
          <div style={{fontSize:11,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>Your Current Tier</div>
          <div style={{fontSize:24,fontWeight:900,color:tierCol}}>{user.tier||"Bronze"}</div>
        </div>
        {TIERS.map(function(t){
          var active=user.tier===t.name;
          return <div key={t.name} style={{background:C.card,border:"1px solid "+(active?t.col+"44":C.border),borderRadius:16,padding:"16px",marginBottom:10,borderLeft:"4px solid "+(active?t.col:"transparent")}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:15,fontWeight:800,color:t.col}}>{t.name}</div>
              {active&&<Pill label="Current" color={t.col} bg={t.col+"18"}/>}
            </div>
            <div style={{fontSize:11,color:C.sub,marginBottom:8}}>Req: {t.req}</div>
            {t.perks.map(function(p){return <div key={p} style={{fontSize:12,color:C.text,marginBottom:4}}>✓ {p}</div>;})}
          </div>;
        })}
      </div>}
    </div>
  );
}

/* ── DISCOVER TAB ── */
function DiscoverTab({C}){
  return(
    <div style={{minHeight:"100%",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{fontSize:32,marginBottom:12}}>◎</div>
      <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:8,textAlign:"center"}}>Discover Near You</div>
      <div style={{fontSize:13,color:C.sub,textAlign:"center",lineHeight:1.7,marginBottom:20}}>Find local businesses and events where you can earn Cosmo rewards in person.</div>
      <Btn v="ghost" style={{padding:"11px 24px",fontSize:13}}>Enable Location to Explore</Btn>
    </div>
  );
}

/* ── STATIC SCREENS ── */
function TosScreen({onClose,C}){
  return(
    <div style={{background:C.bg,position:"fixed",inset:0,display:"flex",flexDirection:"column",fontFamily:"Outfit"}}>
      <div style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid "+C.div,flexShrink:0}}>
        <BackBtn onClick={onClose} C={C}/><div style={{fontSize:15,fontWeight:800,color:C.text}}>Terms of Service</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 18px",fontSize:13,color:C.sub,lineHeight:1.8}}>
        <div style={{fontWeight:800,color:C.text,marginBottom:8}}>Last updated: {new Date().toLocaleDateString()}</div>
        <p style={{marginBottom:12}}>By using Cosmo, you agree to these terms. You must be 18 or older to use this service.</p>
        <div style={{fontWeight:700,color:C.text,marginBottom:6}}>Rewards & Payments</div>
        <p style={{marginBottom:12}}>Rewards are earned by completing legitimate offers. Cosmo reserves the right to withhold payments where fraud is suspected. Minimum withdrawal is $5.00. Payments are processed within 1-2 business days.</p>
        <div style={{fontWeight:700,color:C.text,marginBottom:6}}>Prohibited Activities</div>
        <p style={{marginBottom:12}}>The following are strictly prohibited: using VPNs to manipulate offers, creating multiple accounts, using bots or automation, and fraudulent activity. Violations result in immediate account ban and balance forfeiture.</p>
        <div style={{fontWeight:700,color:C.text,marginBottom:6}}>Account Termination</div>
        <p style={{marginBottom:12}}>Cosmo may terminate accounts that violate these terms without notice. You may delete your account at any time from your profile settings.</p>
        <div style={{fontWeight:700,color:C.text,marginBottom:6}}>Disputes</div>
        <p>You have 7 days from a transaction date to dispute missing rewards via the Missing Reward feature in your profile.</p>
      </div>
    </div>
  );
}

function PrivacyScreen({onClose,C}){
  return(
    <div style={{background:C.bg,position:"fixed",inset:0,display:"flex",flexDirection:"column",fontFamily:"Outfit"}}>
      <div style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid "+C.div,flexShrink:0}}>
        <BackBtn onClick={onClose} C={C}/><div style={{fontSize:15,fontWeight:800,color:C.text}}>Privacy Policy</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 18px",fontSize:13,color:C.sub,lineHeight:1.8}}>
        <div style={{fontWeight:800,color:C.text,marginBottom:8}}>Last updated: {new Date().toLocaleDateString()}</div>
        <div style={{fontWeight:700,color:C.text,marginBottom:6}}>Data We Collect</div>
        <p style={{marginBottom:12}}>We collect your email address, username, device type, IP address, and activity within the app to provide and improve our service.</p>
        <div style={{fontWeight:700,color:C.text,marginBottom:6}}>How We Use Your Data</div>
        <p style={{marginBottom:12}}>Your data is used to operate the platform, prevent fraud, process payments, and communicate account updates. We do not sell your personal data to third parties.</p>
        <div style={{fontWeight:700,color:C.text,marginBottom:6}}>Offerwall Providers</div>
        <p style={{marginBottom:12}}>When you complete offers, your user ID and completion data is shared with our offerwall partners for reward verification. Please review their respective privacy policies.</p>
        <div style={{fontWeight:700,color:C.text,marginBottom:6}}>Your Rights</div>
        <p>You may request deletion of your account and data at any time through Profile → Account → Delete Account.</p>
      </div>
    </div>
  );
}

function SupportScreen({onClose,C}){
  var msg=useState(""); var setMsg=msg[1]; msg=msg[0];
  var sent=useState(false); var setSent=sent[1]; sent=sent[0];
  return(
    <div style={{background:C.bg,position:"fixed",inset:0,display:"flex",flexDirection:"column",fontFamily:"Outfit"}}>
      <div style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid "+C.div,flexShrink:0}}>
        <BackBtn onClick={onClose} C={C}/><div style={{fontSize:15,fontWeight:800,color:C.text}}>Help & Support</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 18px"}}>
        {[["Missing reward","Use the Missing Reward form in your profile to report offers that didn't credit."],["Withdrawal issue","Withdrawals take 1-2 business days. Check your spam folder for the payment notification."],["Account access","If you can't log in, use the Forgot Password option on the login screen."],["Other questions","Send us a message below and we'll respond within 24 hours."]].map(function(faq){
          return <div key={faq[0]} style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:"14px",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>{faq[0]}</div>
            <div style={{fontSize:12,color:C.sub,lineHeight:1.6}}>{faq[1]}</div>
          </div>;
        })}
        {!sent?<>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:8,marginTop:16}}>Send a message</div>
          <textarea value={msg} onChange={function(e){setMsg(e.target.value);}} placeholder="Describe your issue..." style={{background:C.panel,border:"1px solid "+C.border,color:C.text,borderRadius:12,padding:"12px 14px",width:"100%",minHeight:100,fontFamily:"Outfit",fontSize:13,resize:"none",outline:"none",marginBottom:10}}/>
          <Btn onClick={function(){if(msg.trim()){setSent(true);}}} style={{width:"100%",padding:13}}>Send Message</Btn>
        </>:<div style={{background:C.success+"14",border:"1px solid "+C.success+"44",borderRadius:12,padding:"14px",textAlign:"center",marginTop:16}}>
          <div style={{fontSize:24,marginBottom:8}}>✓</div>
          <div style={{fontSize:14,fontWeight:700,color:C.success}}>Message sent!</div>
          <div style={{fontSize:12,color:C.sub,marginTop:4}}>We'll reply to your registered email within 24 hours.</div>
        </div>}
      </div>
    </div>
  );
}

function MissingRewardScreen({onClose,C}){
  var provider=useState(""); var setProvider=provider[1]; provider=provider[0];
  var offerId=useState(""); var setOfferId=offerId[1]; offerId=offerId[0];
  var desc=useState(""); var setDesc=desc[1]; desc=desc[0];
  var sent=useState(false); var setSent=sent[1]; sent=sent[0];
  return(
    <div style={{background:C.bg,position:"fixed",inset:0,display:"flex",flexDirection:"column",fontFamily:"Outfit"}}>
      <div style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid "+C.div,flexShrink:0}}>
        <BackBtn onClick={onClose} C={C}/><div style={{fontSize:15,fontWeight:800,color:C.text}}>Report Missing Reward</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 18px"}}>
        {!sent?<>
          <div style={{fontSize:13,color:C.sub,lineHeight:1.7,marginBottom:18}}>If a reward didn't credit within 24 hours, submit a report. Include as much detail as possible. We investigate within 5 business days.</div>
          <TextField label="Offerwall Provider" value={provider} onChange={function(e){setProvider(e.target.value);}} placeholder="e.g. Lootably, AdGem, CPX Research" C={C}/>
          <TextField label="Offer/Survey ID (if available)" value={offerId} onChange={function(e){setOfferId(e.target.value);}} placeholder="e.g. SURVEY-12345" C={C}/>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:6}}>Description</div>
            <textarea value={desc} onChange={function(e){setDesc(e.target.value);}} placeholder="When did you complete it? What happened? Did you receive a completion screen?" style={{background:C.panel,border:"1px solid "+C.border,color:C.text,borderRadius:12,padding:"12px 14px",width:"100%",minHeight:100,fontFamily:"Outfit",fontSize:13,resize:"none",outline:"none"}}/>
          </div>
          <Btn onClick={function(){if(provider&&desc){setSent(true);}}} style={{width:"100%",padding:13}}>Submit Report</Btn>
        </>:<div style={{textAlign:"center",padding:"30px 0"}}>
          <div style={{fontSize:32,marginBottom:12}}>📋</div>
          <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:6}}>Report submitted!</div>
          <div style={{fontSize:13,color:C.sub,lineHeight:1.7}}>We'll investigate and respond within 5 business days. Check your email for updates.</div>
        </div>}
      </div>
    </div>
  );
}

function KycScreen({onClose,C}){
  var step=useState(0); var setStep=step[1]; step=step[0];
  var firstName=useState(""); var setFirstName=firstName[1]; firstName=firstName[0];
  var lastName=useState(""); var setLastName=lastName[1]; lastName=lastName[0];
  var dob=useState(""); var setDob=dob[1]; dob=dob[0];
  return(
    <div style={{background:C.bg,position:"fixed",inset:0,display:"flex",flexDirection:"column",fontFamily:"Outfit"}}>
      <div style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid "+C.div,flexShrink:0}}>
        <BackBtn onClick={step===0?onClose:function(){setStep(step-1);}} C={C}/>
        <div style={{fontSize:15,fontWeight:800,color:C.text}}>KYC Verification</div>
        <Pill label={"Step "+(step+1)+" of 3"} color={C.sub} bg={C.panel}/>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"24px 18px"}}>
        {step===0&&<>
          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>Personal Information</div>
          <div style={{fontSize:12,color:C.sub,marginBottom:18,lineHeight:1.6}}>Required for withdrawals above $50. Your data is encrypted and never shared without consent.</div>
          <TextField label="First Name" value={firstName} onChange={function(e){setFirstName(e.target.value);}} placeholder="As on ID" C={C}/>
          <TextField label="Last Name"  value={lastName}  onChange={function(e){setLastName(e.target.value);}}  placeholder="As on ID" C={C}/>
          <TextField label="Date of Birth" type="date" value={dob} onChange={function(e){setDob(e.target.value);}} C={C}/>
          <Btn onClick={function(){if(firstName&&lastName&&dob) setStep(1);}} style={{width:"100%",padding:13,marginTop:8}}>Continue</Btn>
        </>}
        {step===1&&<>
          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>Upload ID Document</div>
          <div style={{fontSize:12,color:C.sub,marginBottom:18,lineHeight:1.6}}>Accepted: National ID, Passport, or Driver's License</div>
          <div style={{border:"2px dashed "+C.border,borderRadius:14,padding:"32px 20px",textAlign:"center",marginBottom:16,cursor:"pointer"}}>
            <div style={{fontSize:28,marginBottom:8}}>📷</div>
            <div style={{fontSize:13,color:C.sub}}>Tap to upload front of ID</div>
          </div>
          <Btn onClick={function(){setStep(2);}} style={{width:"100%",padding:13}}>Continue</Btn>
        </>}
        {step===2&&<>
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:40,marginBottom:12}}>⏳</div>
            <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:6}}>Verification Submitted</div>
            <div style={{fontSize:13,color:C.sub,lineHeight:1.7}}>We'll review your documents within 1-2 business days. You'll receive an email notification once verified.</div>
          </div>
          <Btn onClick={onClose} v="ghost" style={{width:"100%",padding:13,marginTop:16}}>Back to Profile</Btn>
        </>}
      </div>
    </div>
  );
}

function ChangePinScreen({onClose,C}){
  var step=useState(0); var setStep=step[1]; step=step[0];
  var err=useState(""); var setErr=err[1]; err=err[0];
  var savedNewPin=useState(""); var setSavedNewPin=savedNewPin[1]; savedNewPin=savedNewPin[0];
  var DEMO_PIN="1234";
  return(
    <div style={{background:C.bg,position:"fixed",inset:0,display:"flex",flexDirection:"column",fontFamily:"Outfit"}}>
      <div style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid "+C.div,flexShrink:0}}>
        <BackBtn onClick={step===0?onClose:function(){setStep(step-1);setErr("");}} C={C}/>
        <div style={{fontSize:15,fontWeight:800,color:C.text}}>{["Verify Current PIN","Set New PIN","Confirm New PIN"][step]}</div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 18px 40px"}}>
        {err&&<div style={{color:C.danger,fontSize:12,marginBottom:16,padding:"8px 14px",background:C.danger+"14",borderRadius:8,textAlign:"center"}}>{err}</div>}
        {step===0&&<PinBox label="Enter your current PIN" onDone={function(p){if(p!==DEMO_PIN){setErr("Incorrect PIN. Try again.");return;}setStep(1);setErr("");}} C={C}/>}
        {step===1&&<PinBox label="Enter your new PIN" onDone={function(p){if(p.length!==4){setErr("PIN must be 4 digits");return;}setSavedNewPin(p);setStep(2);setErr("");}} C={C}/>}
        {step===2&&<PinBox label="Confirm your new PIN" onDone={function(p){if(p!==savedNewPin){setErr("PINs do not match. Try again.");setStep(1);return;}onClose();}} C={C}/>}
      </div>
    </div>
  );
}

function TwoFAScreen({onClose,C}){
  var method=useState(""); var setMethod=method[1]; method=method[0];
  var verifying=useState(false); var setVerifying=verifying[1]; verifying=verifying[0];
  var done=useState(false); var setDone=done[1]; done=done[0];
  return(
    <div style={{background:C.bg,position:"fixed",inset:0,display:"flex",flexDirection:"column",fontFamily:"Outfit"}}>
      <div style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid "+C.div,flexShrink:0}}>
        <BackBtn onClick={onClose} C={C}/><div style={{fontSize:15,fontWeight:800,color:C.text}}>Two-Factor Auth (2FA)</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"24px 18px"}}>
        {done?<div style={{textAlign:"center",padding:"30px 0"}}>
          <div style={{fontSize:32,marginBottom:12,color:C.success}}>✓</div>
          <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:6}}>2FA Enabled</div>
          <div style={{fontSize:13,color:C.sub,lineHeight:1.7}}>Your account is now protected with two-factor authentication.</div>
          <Btn onClick={onClose} v="ghost" style={{width:"100%",padding:13,marginTop:20}}>Done</Btn>
        </div>:!method?<>
          <div style={{fontSize:13,color:C.sub,lineHeight:1.7,marginBottom:20}}>Add an extra layer of security. Choose your preferred 2FA method.</div>
          {[["Authenticator App","Google Authenticator, Authy, etc.","◈"],["SMS","Text message to your phone","◎"]].map(function(m){
            return <div key={m[0]} onClick={function(){setMethod(m[0]);}} style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:"16px",marginBottom:12,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:24,color:C.sub}}>{m[2]}</div>
              <div><div style={{fontSize:14,fontWeight:700,color:C.text}}>{m[0]}</div><div style={{fontSize:12,color:C.sub}}>{m[1]}</div></div>
            </div>;
          })}
        </>:!verifying?<>
          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:12}}>Set up {method}</div>
          {method==="Authenticator App"?<div style={{background:C.panel,borderRadius:14,padding:"20px",textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:12,color:C.sub,marginBottom:8}}>Scan this QR code with your authenticator app</div>
            <div style={{width:140,height:140,background:C.card,borderRadius:10,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:11}}>QR Code<br/>(Firebase Auth)</div>
          </div>:<TextField label="Phone Number" type="tel" placeholder="+1 234 567 8900" C={C}/>}
          <Btn onClick={function(){setVerifying(true);}} style={{width:"100%",padding:13}}>Continue</Btn>
        </>:<>
          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:6,textAlign:"center"}}>Enter verification code</div>
          <div style={{fontSize:12,color:C.sub,marginBottom:20,textAlign:"center"}}>Enter the 6-digit code to confirm setup</div>
          <OTPBox onDone={function(){setDone(true);}} C={C}/>
        </>}
      </div>
    </div>
  );
}

/* ── NOTIFICATIONS SCREEN ── */
function NotifsScreen({notifs,setNotifs,navTo,onClose,C}){
  var typeCol=function(t){return{earn:C.success,ref:C.silver,streak:C.gold,comp:C.gold,wd:C.silver,system:C.sub}[t]||C.sub;};
  var typeNav={earn:"earn",ref:"social",streak:"home",comp:"social",wd:"rewards",system:"home"};
  function markAll(){setNotifs(function(p){return p.map(function(n){return Object.assign({},n,{read:true});});});}
  var unread=(notifs||[]).filter(function(n){return !n.read;}).length;
  return(
    <div style={{background:C.bg,fontFamily:"Outfit",flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
      <div style={{padding:"14px 18px",borderBottom:"1px solid "+C.div,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <BackBtn onClick={onClose} C={C}/>
          <div style={{fontSize:15,fontWeight:800,color:C.text}}>Notifications{unread>0&&<span style={{background:C.danger,color:"#fff",borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:700,marginLeft:8}}>{unread}</span>}</div>
        </div>
        {unread>0&&<button onClick={markAll} style={{background:"none",border:"none",cursor:"pointer",color:C.sub,fontSize:12,fontFamily:"Outfit"}}>Mark all read</button>}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"10px 14px"}}>
        {(!notifs||notifs.length===0)?<div style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:32,marginBottom:12}}>🔔</div>
          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:6}}>No notifications yet</div>
          <div style={{fontSize:12,color:C.sub}}>You'll see reward alerts, streak reminders and competition results here.</div>
        </div>:notifs.map(function(n,i){
          return <div key={n.id||i} onClick={function(){
            setNotifs(function(p){return p.map(function(x){return x.id===n.id?Object.assign({},x,{read:true}):x;});});
            if(typeNav[n.type]) navTo(typeNav[n.type]);
            onClose();
          }} style={{display:"flex",gap:12,padding:"12px 14px",background:n.read?"transparent":C.card,borderRadius:14,marginBottom:6,border:"1px solid "+(n.read?"transparent":C.border),cursor:"pointer",transition:"background .15s"}}>
            <div style={{width:38,height:38,borderRadius:11,background:typeCol(n.type)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{n.icon||"🔔"}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:n.read?500:700,color:C.text,marginBottom:2}}>{n.title}</div>
              <div style={{fontSize:11,color:C.sub,lineHeight:1.5}}>{n.msg}</div>
              <div style={{fontSize:10,color:C.muted,marginTop:4}}>{n.time}</div>
            </div>
            {!n.read&&<div style={{width:8,height:8,borderRadius:"50%",background:C.danger,flexShrink:0,marginTop:6}}/>}
          </div>;
        })}
      </div>
    </div>
  );
}

/* ── APP SETTINGS SCREEN ── */
function AppSettingsScreen({onClose,isDark,onToggleTheme,themeChoice,fontSizeKey,setFontSizeKey,C}){
  var perms=useState({location:false,notifications:false,camera:false,photos:false}); var setPerms=perms[1]; perms=perms[0];
  var soundOn=useState(true); var setSoundOn=soundOn[1]; soundOn=soundOn[0];
  var hapticOn=useState(true); var setHapticOn=hapticOn[1]; hapticOn=hapticOn[0];
  var showBalOn=useState(true); var setShowBalOn=showBalOn[1]; showBalOn=showBalOn[0];
  var saved=useState(""); var setSaved=saved[1]; saved=saved[0];
  function flash(msg){setSaved(msg);setTimeout(function(){setSaved("");},2000);}

  var currentTheme=themeChoice||"dark";
  var currentFont=fontSizeKey||"md";
  var fontPreviewSize={sm:11,md:14,lg:17,xl:20};

  var THEMES=[
    {id:"dark",  label:"Dark Mode",     desc:"Easier on eyes at night",
     icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>},
    {id:"light", label:"Light Mode",    desc:"Bright and clear for daytime",
     icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>},
    {id:"system",label:"System Default",desc:"Follows your device setting",
     icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>},
  ];
  var FONTS=[{id:"sm",label:"Small"},{id:"md",label:"Medium"},{id:"lg",label:"Large"},{id:"xl",label:"X-Large"}];

  return(
    <div style={{background:C.bg,position:"fixed",inset:0,display:"flex",flexDirection:"column",fontFamily:"Outfit"}}>
      <div style={{padding:"14px 18px",borderBottom:"1px solid "+C.div,display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <BackBtn onClick={onClose} C={C}/>
        <div style={{fontSize:15,fontWeight:800,color:C.text,flex:1}}>App Settings</div>
        {saved&&<Pill label={saved} color={C.success} bg={C.success+"22"}/>}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
        {/* Theme */}
        <div style={{fontSize:11,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:1.2,marginBottom:8}}>Theme</div>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,overflow:"hidden",marginBottom:20}}>
          {THEMES.map(function(t,i){
            var active=currentTheme===t.id;
            return <div key={t.id} onClick={function(){onToggleTheme&&onToggleTheme(t.id);flash("Theme updated");}} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderTop:i===0?"none":"1px solid "+C.div,cursor:"pointer",background:active?C.silver+"0d":"transparent"}}>
              <div style={{width:38,height:38,borderRadius:11,background:active?C.silver+"18":C.panel,border:"1px solid "+(active?C.silver+"55":C.border),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:active?C.silver:C.sub}}>{t.icon}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:active?C.chrome:C.text,marginBottom:2}}>{t.label}</div><div style={{fontSize:11,color:C.sub}}>{t.desc}</div></div>
              {active&&<div style={{width:20,height:20,borderRadius:"50%",background:C.success,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
            </div>;
          })}
        </div>
        {/* Text Size */}
        <div style={{fontSize:11,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:1.2,marginBottom:8}}>Text Size</div>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:16,marginBottom:20}}>
          <div style={{background:C.panel,borderRadius:10,padding:"10px 14px",marginBottom:12,textAlign:"center"}}>
            <div style={{fontSize:fontPreviewSize[currentFont],fontWeight:700,color:C.text,marginBottom:2}}>The quick brown fox</div>
            <div style={{fontSize:(fontPreviewSize[currentFont]||14)-2,color:C.sub}}>Preview text size</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {FONTS.map(function(f){
              var active=currentFont===f.id;
              return <button key={f.id} onClick={function(){setFontSizeKey&&setFontSizeKey(f.id);flash("Font size updated");}} style={{background:active?"linear-gradient(135deg,"+C.silver+","+C.chrome+")":C.panel,border:"1px solid "+(active?"transparent":C.border),borderRadius:12,padding:"12px 6px",cursor:"pointer",fontFamily:"Outfit",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <span style={{fontSize:fontPreviewSize[f.id],fontWeight:800,color:active?C.bg:C.text,lineHeight:1}}>Aa</span>
                <span style={{fontSize:9,fontWeight:700,color:active?C.bg:C.sub,textTransform:"uppercase",letterSpacing:.8}}>{f.label}</span>
              </button>;
            })}
          </div>
        </div>
        {/* Permissions */}
        <div style={{fontSize:11,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:1.2,marginBottom:8}}>Permissions</div>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,overflow:"hidden",marginBottom:20}}>
          {[{key:"location",label:"Location",desc:"Required for Discover / Near Me tab"},
            {key:"notifications",label:"Notifications",desc:"Reward alerts, streak reminders"},
            {key:"camera",label:"Camera",desc:"Required for KYC selfie verification"},
          ].map(function(perm,i){
            var granted=perms[perm.key];
            function req(){
              if(perm.key==="location"&&navigator.geolocation){navigator.geolocation.getCurrentPosition(function(){setPerms(function(p){return Object.assign({},p,{location:true});});});}
              else if(perm.key==="notifications"&&"Notification" in window){Notification.requestPermission().then(function(r){setPerms(function(p){return Object.assign({},p,{notifications:r==="granted"});});});}
              else{setPerms(function(p){return Object.assign({},p,{[perm.key]:true});});}
              flash("Permission updated");
            }
            return <div key={perm.key} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderTop:i===0?"none":"1px solid "+C.div}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:2}}>{perm.label}</div>
                <div style={{fontSize:11,color:C.sub}}>{perm.desc}</div>
              </div>
              {granted?<Pill label="Allowed" color={C.success} bg={C.success+"18"}/>:<button onClick={req} style={{background:C.panel,border:"1px solid "+C.border,borderRadius:10,padding:"6px 12px",cursor:"pointer",color:C.silver,fontSize:12,fontFamily:"Outfit",fontWeight:600}}>Allow</button>}
            </div>;
          })}
        </div>
        {/* Preferences */}
        <div style={{fontSize:11,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:1.2,marginBottom:8}}>Preferences</div>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,overflow:"hidden",marginBottom:20}}>
          {[[soundOn,setSoundOn,"Sound Effects","Play sounds on reward completions"],
            [hapticOn,setHapticOn,"Haptic Feedback","Vibrate on key interactions"],
            [showBalOn,setShowBalOn,"Show Balance on Home","Display balance on dashboard"],
          ].map(function(item,i){
            return <div key={item[2]} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderTop:i===0?"none":"1px solid "+C.div}}>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:2}}>{item[2]}</div><div style={{fontSize:11,color:C.sub}}>{item[3]}</div></div>
              <Tog on={item[0]} onToggle={function(){item[1](function(p){return !p;});flash("Saved");}}/>
            </div>;
          })}
        </div>
        {/* App info */}
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:"14px 16px",marginBottom:16}}>
          {[["App Version","1.0.0"],["Platform","PWA / Telegram Mini App"],["Build","2026"]].map(function(r){
            return <div key={r[0]} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}>
              <span style={{color:C.sub}}>{r[0]}</span><span style={{color:C.muted,fontFamily:"JetBrains Mono"}}>{r[1]}</span>
            </div>;
          })}
        </div>
        <button onClick={function(){if(window.caches)window.caches.keys().then(function(ks){ks.forEach(function(k){window.caches.delete(k);});});flash("Cache cleared");}} style={{width:"100%",background:"none",border:"1px solid "+C.border,borderRadius:12,padding:11,cursor:"pointer",color:C.sub,fontSize:13,fontFamily:"Outfit",fontWeight:600,marginBottom:8}}>Clear App Cache</button>
      </div>
    </div>
  );
}

/* ── PROFILE ROW ── */
function Row({first,label,sub,val,valCol,onClick,C}){
  return(
    <div onClick={onClick} style={{display:"flex",alignItems:"center",padding:"12px 0",borderTop:first?"none":"1px solid "+C.div,cursor:onClick?"pointer":"default"}}>
      <div style={{flex:1}}>
        <div style={{fontSize:13,color:C.text}}>{label}</div>
        {sub&&<div style={{fontSize:11,color:C.muted,marginTop:1}}>{sub}</div>}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        {val&&<span style={{fontSize:12,color:valCol||C.sub,fontWeight:600}}>{val}</span>}
        {onClick&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>}
      </div>
    </div>
  );
}

/* ── PROFILE SCREEN ── */
function ProfileScreen({user,setUser,onLogout,onClose,isDark,onToggleTheme,themeChoice,fontSizeKey,setFontSizeKey,navTo,C}){
  var subScreen=useState(""); var setSubScreen=subScreen[1]; subScreen=subScreen[0];
  var showDeleteConfirm=useState(false); var setShowDeleteConfirm=showDeleteConfirm[1]; showDeleteConfirm=showDeleteConfirm[0];
  var avatar=useState(null); var setAvatar=avatar[1]; avatar=avatar[0];
  var editBio=useState(false); var setEditBio=editBio[1]; editBio=editBio[0];
  var bio=useState(""); var setBio=bio[1]; bio=bio[0];

  if(subScreen==="settings") return <AppSettingsScreen onClose={function(){setSubScreen("");}} isDark={isDark} onToggleTheme={onToggleTheme} themeChoice={themeChoice} fontSizeKey={fontSizeKey} setFontSizeKey={setFontSizeKey} C={C}/>;
  if(subScreen==="kyc")     return <KycScreen onClose={function(){setSubScreen("");}} C={C}/>;
  if(subScreen==="2fa")     return <TwoFAScreen onClose={function(){setSubScreen("");}} C={C}/>;
  if(subScreen==="pin")     return <ChangePinScreen onClose={function(){setSubScreen("");}} C={C}/>;
  if(subScreen==="tos")     return <TosScreen onClose={function(){setSubScreen("");}} C={C}/>;
  if(subScreen==="privacy") return <PrivacyScreen onClose={function(){setSubScreen("");}} C={C}/>;
  if(subScreen==="support") return <SupportScreen onClose={function(){setSubScreen("");}} C={C}/>;
  if(subScreen==="missing") return <MissingRewardScreen onClose={function(){setSubScreen("");}} C={C}/>;

  var tierCol=user.tier==="Gold"?C.gold:user.tier==="Silver"?C.silver:C.bronze;
  var tierPct=user.tier==="Gold"?100:user.tier==="Silver"?Math.min(100,Math.round((user.totalEarned||0)/1000*100)):Math.min(100,Math.round((user.totalEarned||0)/200*100));
  var toNext=user.tier==="Gold"?"Max tier reached":user.tier==="Silver"?("$"+(1000-(user.totalEarned||0)).toFixed(2)+" to Diamond"):("$"+(200-(user.totalEarned||0)).toFixed(2)+" to Silver");

  function uploadAvatar(e){
    var file=e.target.files[0];
    if(!file) return;
    var reader=new FileReader();
    reader.onload=function(ev){setAvatar(ev.target.result);};
    reader.readAsDataURL(file);
  }

  return(
    <div style={{background:C.bg,position:"fixed",inset:0,fontFamily:"Outfit",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{padding:"10px 18px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid "+C.div,background:C.surf,flexShrink:0}}>
        <BackBtn onClick={onClose} C={C}/>
        <div style={{fontSize:15,fontWeight:800,color:C.text}}>Profile</div>
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        {/* Avatar + name */}
        <div style={{textAlign:"center",padding:"24px 20px 16px"}}>
          <label style={{cursor:"pointer",display:"inline-block",marginBottom:12}}>
            <div style={{width:80,height:80,borderRadius:"50%",background:avatar?"transparent":C.panel,border:"3px solid "+tierCol,margin:"0 auto",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:avatar?0:28}}>
              {avatar?<img src={avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span>👤</span>}
            </div>
            <input type="file" accept="image/*" onChange={uploadAvatar} style={{display:"none"}}/>
          </label>
          <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:2}}>{user.username||"@user"}</div>
          <div style={{fontSize:12,color:C.sub,marginBottom:6}}>{user.email}</div>
          {!editBio?<div onClick={function(){setEditBio(true);}} style={{fontSize:12,color:bio||C.muted,cursor:"pointer"}}>{bio||"No bio yet. Tap to add one."}</div>
          :<div style={{display:"flex",gap:8,maxWidth:300,margin:"0 auto"}}>
            <input value={bio} onChange={function(e){setBio(e.target.value);}} placeholder="Add a short bio..." style={{background:C.panel,border:"1px solid "+C.border,color:C.text,borderRadius:10,padding:"7px 10px",fontSize:12,marginBottom:0,flex:1}}/>
            <button onClick={function(){setEditBio(false);}} style={{background:C.silver,border:"none",borderRadius:10,padding:"7px 12px",cursor:"pointer",color:C.bg,fontFamily:"Outfit",fontWeight:600,fontSize:12}}>Save</button>
          </div>}
          <Pill label={user.tier||"Bronze"} color={tierCol} bg={tierCol+"22"}/>
        </div>
        {/* Stats row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,margin:"0 14px 14px",background:C.div,borderRadius:14,overflow:"hidden"}}>
          {[[fmt(user.balance||0),"BALANCE"],[fmt(user.totalEarned||0),"TOTAL EARNED"],[(user.refs||0)+" refs","REFERRALS"]].map(function(s){
            return <div key={s[1]} style={{background:C.card,padding:"14px 8px",textAlign:"center"}}>
              <div style={{fontSize:s[0].length>8?12:15,fontWeight:800,color:C.text,fontFamily:"JetBrains Mono"}}>{s[0]}</div>
              <div style={{fontSize:8,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginTop:3}}>{s[1]}</div>
            </div>;
          })}
        </div>
        {/* Tier progress */}
        <div style={{margin:"0 14px 14px",background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12}}>
            <span style={{color:tierCol,fontWeight:700}}>{user.tier||"Bronze"}</span>
            <span style={{color:C.muted}}>{toNext}</span>
          </div>
          <div style={{height:5,background:C.panel,borderRadius:3,overflow:"hidden"}}>
            <div style={{height:5,width:tierPct+"%",background:"linear-gradient(90deg,"+tierCol+","+tierCol+"aa)",borderRadius:3,transition:"width .6s"}}/>
          </div>
        </div>
        {/* Referral code */}
        <div style={{margin:"0 14px 14px",background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>Referral Code</div>
            <div style={{fontSize:16,fontWeight:900,letterSpacing:3,color:C.chrome,fontFamily:"JetBrains Mono"}}>
              COSMO-{(user.username||"USER").replace("@","").toUpperCase().slice(0,6)}
            </div>
          </div>
          <Btn onClick={function(){navTo&&navTo("social");}} v="ghost" style={{fontSize:11,padding:"7px 14px",borderRadius:20}}>View</Btn>
        </div>
        {/* Security */}
        <div style={{margin:"0 14px 14px",background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:"14px 16px"}}>
          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:8}}>Security</div>
          <Row first label="Withdrawal PIN" val="Set" valCol={C.success} onClick={function(){setSubScreen("pin");}} C={C}/>
          <Row label="KYC Verification" val={user.kyc==="verified"?"Verified":"Unverified"} valCol={user.kyc==="verified"?C.success:C.warn} onClick={function(){setSubScreen("kyc");}} C={C}/>
          <Row label="Email" val="Verified" valCol={C.success} C={C}/>
          <Row label="Two-Factor Auth (2FA)" val="Disabled" valCol={C.sub} onClick={function(){setSubScreen("2fa");}} C={C}/>
        </div>
        {/* Account */}
        <div style={{margin:"0 14px 14px",background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:"14px 16px"}}>
          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:8}}>Account</div>
          <Row first label="App Settings" onClick={function(){setSubScreen("settings");}} C={C}/>
          <Row label="Terms of Service"  onClick={function(){setSubScreen("tos");}} C={C}/>
          <Row label="Privacy Policy"    onClick={function(){setSubScreen("privacy");}} C={C}/>
          <Row label="Help & Support"    onClick={function(){setSubScreen("support");}} C={C}/>
          <Row label="Missing Reward"    onClick={function(){setSubScreen("missing");}} C={C}/>
        </div>
        {/* Logout */}
        <div style={{margin:"0 14px"}}>
          <Btn onClick={onLogout} v="ghost" style={{width:"100%",padding:13,fontSize:14,marginBottom:10}}>Log Out</Btn>
          <button onClick={function(){setShowDeleteConfirm(true);}} style={{width:"100%",background:"none",border:"none",cursor:"pointer",color:C.danger,fontSize:12,fontFamily:"Outfit",padding:"8px 0 20px"}}>Delete Account</button>
        </div>
      </div>
      <Pop show={showDeleteConfirm} onClose={function(){setShowDeleteConfirm(false);}} C={C}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:10}}>⚠</div>
          <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:8}}>Delete Account?</div>
          <div style={{fontSize:12,color:C.sub,lineHeight:1.7,marginBottom:20}}>This permanently deletes your account, balance, and all data. This cannot be undone.</div>
          <div style={{display:"flex",gap:10}}>
            <Btn onClick={function(){setShowDeleteConfirm(false);}} v="ghost" style={{flex:1,padding:11,fontSize:13,borderRadius:12}}>Cancel</Btn>
            <Btn onClick={function(){setShowDeleteConfirm(false);setTimeout(onLogout,400);}} v="danger" style={{flex:1,padding:11,fontSize:13,borderRadius:12}}>Delete</Btn>
          </div>
        </div>
      </Pop>
    </div>
  );
}

/* ── MAIN APP SHELL ── */
export default function CosmoApp(){
  var themeChoice=useState("dark"); var setThemeChoice=themeChoice[1]; themeChoice=themeChoice[0];
  var fontSizeKey=useState("md"); var setFontSizeKey=fontSizeKey[1]; fontSizeKey=fontSizeKey[0];
  var fontZoom={sm:0.88,md:1,lg:1.13,xl:1.26}[fontSizeKey]||1;
  var sysDark=typeof window!=="undefined"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme:dark)").matches;
  var isDark=themeChoice==="dark"?true:themeChoice==="light"?false:sysDark;
  var C=isDark?DARK:LIGHT;

  var screen=useState("splash"); var setScreen=screen[1]; screen=screen[0];
  var user=useState(null); var setUser=user[1]; user=user[0];
  var tab=useState("home"); var setTab=tab[1]; tab=tab[0];
  var showProfile=useState(false); var setShowProfile=showProfile[1]; showProfile=showProfile[0];
  var showNotifs=useState(false); var setShowNotifs=showNotifs[1]; showNotifs=showNotifs[0];
  var globalTxns=useState(TXNS); var setGlobalTxns=globalTxns[1]; globalTxns=globalTxns[0];
  var globalNotifs=useState(NOTIFS); var setGlobalNotifs=globalNotifs[1]; globalNotifs=globalNotifs[0];
  var streakClaimed=useState(false); var setStreakClaimed=streakClaimed[1]; streakClaimed=streakClaimed[0];

  /* SEO meta injection */
  useEffect(function(){
    document.title="Cosmo — Earn Real Cash from Surveys & Offers";
    var addMeta=function(name,content,prop){
      var sel=prop?'meta[property="'+name+'"]':'meta[name="'+name+'"]';
      var el=document.querySelector(sel)||document.createElement("meta");
      if(prop) el.setAttribute("property",name); else el.setAttribute("name",name);
      el.setAttribute("content",content);
      if(!document.head.contains(el)) document.head.appendChild(el);
    };
    addMeta("description","Earn real cash by completing surveys, watching videos, doing tasks and referring friends. Withdraw via PayPal or gift cards.");
    addMeta("robots","index,follow");
    addMeta("theme-color","#06070d");
    addMeta("og:title","Cosmo — Earn Real Cash from Surveys & Offers",true);
    addMeta("og:description","Complete surveys, tasks and referrals to earn real money. Withdraw via PayPal, Wise or gift cards.",true);
    addMeta("og:type","website",true);
    addMeta("og:url",window.location.href,true);
    addMeta("twitter:card","summary_large_image");
    addMeta("twitter:title","Cosmo — Earn Real Cash");
    var ld=document.createElement("script"); ld.type="application/ld+json";
    ld.textContent=JSON.stringify({"@context":"https://schema.org","@type":"WebApplication","name":"Cosmo","description":"Earn real cash from surveys, offers and referrals.","applicationCategory":"FinanceApplication","operatingSystem":"Web"});
    if(!document.querySelector('script[type="application/ld+json"]')) document.head.appendChild(ld);
    if(!document.querySelector('link[rel="icon"]')){var lnk=document.createElement("link");lnk.rel="icon";lnk.href='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="%2306070d"/><text y="22" x="4" font-size="20">◈</text></svg>';document.head.appendChild(lnk);}
    document.documentElement.lang="en";
  },[]);

  function addTxn(txn){
    setGlobalTxns(function(p){return [txn].concat(p);});
    setUser(function(u){if(!u) return u; return Object.assign({},u,{recentTxns:[txn].concat((u.recentTxns||[]).slice(0,3))});});
  }

  function navTo(t){
    if(t==="profile"){setShowProfile(true);setShowNotifs(false);return;}
    if(t==="notifs"){setShowNotifs(true);setShowProfile(false);return;}
    setTab(t); setShowProfile(false); setShowNotifs(false);
  }

  var TABS=[
    {id:"home",    label:"Home",    icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>},
    {id:"earn",    label:"Earn",    icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>},
    {id:"rewards", label:"Rewards", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>},
    {id:"social",  label:"Social",  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>},
    {id:"discover",label:"Near Me", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>},
  ];

  var css=CSS_BASE+"input,textarea,select{background:"+C.panel+";border:1.5px solid "+C.border+";color:"+C.text+";border-radius:12px;}input:focus,textarea:focus,select:focus{border-color:"+C.silver+";}";

  /* Auth screens */
  if(screen==="splash") return <div><style>{css}</style><Splash onDone={function(){setScreen("welcome");}} C={C}/></div>;
  if(screen==="welcome") return <div><style>{css}</style><Welcome onSignUp={function(){setScreen("signup");}} onLogin={function(){setScreen("login");}} onShowTos={function(){setScreen("tos");}} onShowPrivacy={function(){setScreen("privacy");}} C={C}/></div>;
  if(screen==="signup") return <div><style>{css}</style><SignUp onBack={function(){setScreen("welcome");}} onDone={function(u){setUser(u);setScreen("app");}} C={C}/></div>;
  if(screen==="login") return <div><style>{css}</style><Login onBack={function(){setScreen("welcome");}} onDone={function(u){setUser(u);setScreen("app");}} C={C}/></div>;
  if(screen==="tos") return <div><style>{css}</style><TosScreen onClose={function(){setScreen("welcome");}} C={C}/></div>;
  if(screen==="privacy") return <div><style>{css}</style><PrivacyScreen onClose={function(){setScreen("welcome");}} C={C}/></div>;

  if(!user) return <div><style>{css}</style><Welcome onSignUp={function(){setScreen("signup");}} onLogin={function(){setScreen("login");}} onShowTos={function(){setScreen("tos");}} onShowPrivacy={function(){setScreen("privacy");}} C={C}/></div>;

  var unread=(globalNotifs||[]).filter(function(n){return !n.read;}).length;

  /* Profile overlay */
  if(showProfile) return(
    <div style={{height:"100%",minHeight:"100svh",background:C.bg,fontFamily:"Outfit",display:"flex",flexDirection:"column",overflow:"hidden",position:"fixed",inset:0}}>
      <style>{css}</style>
      <div style={{flex:1,overflowY:"auto",zoom:fontZoom}}>
        <ProfileScreen user={user} setUser={setUser} onClose={function(){setShowProfile(false);}}
          isDark={isDark} onToggleTheme={function(val){setThemeChoice(val);}}
          themeChoice={themeChoice} fontSizeKey={fontSizeKey} setFontSizeKey={setFontSizeKey}
          onLogout={function(){setUser(null);setScreen("welcome");setShowProfile(false);}}
          navTo={navTo} C={C}/>
      </div>
    </div>
  );

  /* Notifs overlay */
  if(showNotifs) return(
    <div style={{height:"100%",minHeight:"100svh",background:C.bg,fontFamily:"Outfit",display:"flex",flexDirection:"column",overflow:"hidden",position:"fixed",inset:0}}>
      <style>{css}</style>
      <div style={{flex:1,overflowY:"auto",minHeight:0,zoom:fontZoom}}>
        <NotifsScreen notifs={globalNotifs} setNotifs={setGlobalNotifs} navTo={navTo} onClose={function(){setShowNotifs(false);}} C={C}/>
      </div>
    </div>
  );

  /* Main app */
  return(
    <div style={{height:"100%",minHeight:"100svh",background:C.bg,fontFamily:"Outfit",display:"flex",flexDirection:"column",overflow:"hidden",position:"fixed",inset:0}}>
      <style>{css}</style>
      {/* Hidden H1 for SEO */}
      <h1 style={{position:"absolute",width:1,height:1,overflow:"hidden",opacity:0,pointerEvents:"none"}}>Cosmo — Earn Real Cash from Surveys, Offers and Referrals</h1>

      {/* Top bar */}
      <header style={{background:C.surf,borderBottom:"1px solid "+C.div,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{fontSize:14,fontWeight:900,letterSpacing:3,background:isDark?"linear-gradient(105deg,"+C.muted+" 0%,"+C.chrome+" 35%,"+C.silver+" 50%,"+C.chrome+" 65%,"+C.muted+" 100%)":"linear-gradient(105deg,#606480 0%,#12142a 35%,#22264a 50%,#12142a 65%,#606480 100%)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"glint 3s linear infinite"}}>COSMO</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {/* Theme toggle */}
          <button onClick={function(){setThemeChoice(function(p){return p==="dark"?"light":"dark";});}} style={{background:C.panel,border:"1px solid "+C.border,color:C.sub,borderRadius:8,padding:"5px 11px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"Outfit",display:"flex",alignItems:"center",gap:5}}>
            {isDark
              ?<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
              :<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
            {isDark?"Light":"Dark"}
          </button>
          {/* Bell */}
          <button onClick={function(){setShowNotifs(true);}} style={{position:"relative",background:"none",border:"none",cursor:"pointer",padding:4,display:"flex",alignItems:"center",color:C.sub}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {unread>0&&<div style={{position:"absolute",top:2,right:2,width:8,height:8,borderRadius:"50%",background:C.danger}}/>}
          </button>
          {/* Avatar */}
          <button onClick={function(){setShowProfile(true);}} style={{width:32,height:32,borderRadius:"50%",background:C.panel,border:"2px solid "+C.border,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:C.sub,fontWeight:800,fontFamily:"Outfit"}}>
            {((user.username||"U").length>1?(user.username||"U")[1].toUpperCase():(user.username||"U")[0].toUpperCase())}
          </button>
        </div>
      </header>

      {/* Tab content — all mounted, CSS show/hide preserves state */}
      <main role="main" style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",zoom:fontZoom}}>
        <div style={{display:tab==="home"?"block":"none"}}><HomeTab user={user} setUser={setUser} navTo={navTo} C={C} addTxn={addTxn} streakClaimed={streakClaimed} setStreakClaimed={setStreakClaimed}/></div>
        <div style={{display:tab==="earn"?"block":"none"}}><EarnTab user={user} setUser={setUser} C={C} addTxn={addTxn} setGlobalTxns={setGlobalTxns}/></div>
        <div style={{display:tab==="rewards"?"block":"none"}}><RewardsTab user={user} setUser={setUser} C={C} globalTxns={globalTxns} setGlobalTxns={setGlobalTxns}/></div>
        <div style={{display:tab==="social"?"block":"none"}}><SocialTab user={user} setUser={setUser} addTxn={addTxn} C={C}/></div>
        <div style={{display:tab==="discover"?"block":"none"}}><DiscoverTab C={C}/></div>
      </main>

      {/* Bottom nav */}
      <nav role="navigation" aria-label="Main navigation" style={{background:C.surf,borderTop:"1px solid "+C.div,display:"flex",flexShrink:0,paddingBottom:"env(safe-area-inset-bottom,0)"}}>
        {TABS.map(function(t){
          var active=tab===t.id;
          return(
            <button key={t.id} onClick={function(){setTab(t.id);setShowProfile(false);setShowNotifs(false);}}
              style={{flex:1,padding:"10px 4px 8px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,color:active?C.chrome:C.muted,transition:"color .15s",fontFamily:"Outfit"}}>
              <div style={{color:active?C.chrome:C.muted,transition:"color .15s"}}>{t.icon}</div>
              <span style={{fontSize:9,fontWeight:active?800:400,letterSpacing:.5}}>{t.label}</span>
              {active&&<div style={{width:20,height:2,background:C.chrome,borderRadius:1,marginTop:1}}/>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
