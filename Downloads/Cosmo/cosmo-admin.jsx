import { useState, useEffect, useCallback, useRef } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const LOGO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA4KCw0LCQ4NDA0QDw4RFiQXFhQUFiwgIRokNC43NjMuMjI6QVNGOj1OPjIySGJJTlZYXV5dOEVmbWVabFNbXVn/2wBDAQ8QEBYTFioXFypZOzI7WVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVn/wAARCABQAFADASIAAhEBAxEB/8QAGwAAAQUBAQAAAAAAAAAAAAAABAABAgMGBQf/xAA2EAACAQMDAgMFBwIHAAAAAAABAgMABBEFEiExQQYTURQycYGhFSIjQmGRwXKxNENTYnOS4f/EABYBAQEBAAAAAAAAAAAAAAAAAAABAv/EABYRAQEBAAAAAAAAAAAAAAAAAAARAf/aAAwDAQACEQMRAD8AxFKmpVtk9KmzTjnpzQKlVqW08nuQyN8FNELpOoN7tnOfhGaAKlRzaPqKjJsbnH/GaElhkhbbLG6H0ZSKCNKmp6C61sLq8OIIWYevQV04NGs4+dQ1KGIjqiHcfpXN8y9umWMHr0jQZ+nerpdPeLi7uY4vVGmAI+QzUo0NovhK3I8xri4I7hOK7VrrHhGLAjh2f1xnivOHjhVsxTKcdkY/zipXBuLpgZ3lkwgwSBnHbpSkeiX/AI40qyXZp9usjepXao/ms7c+P9WmYiFo4l7bUH81mZYPKASb8LAyCRgn5daFFwyE+WT+hPWorVJ4g1u55l1VrdD+Zm2j6Dn5UXPAt9pMtzDdXOq3KsI2LNwmRndjrjtzWLiXz5MzSFV7k8k13bLVI9NhxaWiE9d0xzz646VcBNl4V1G8ZQsZGRnpwPic1o7fwFbxIDf34Ru4BArLy6/rF6NpupxGPyQDav0oVpZN2JGLMeDumJNECi7klicQ5gtx7yoeW/qbqf7UKJ7cHb7OrL6tkH6GroZxaI0Uke6KUYNJobEYZXlI7qQP7/8AlRUBYNcXJjsvxl27mweEH6mrrfTbx1l9hmWZkXLxwOd234d6Jh11IGu44rSKG3uovJdYxg455z681HSdSh0O+9ttHeaUIyqrrtAyMc0Aw0m4a2iurmWO3inyY3mYjfjqRRdv4avpb72VUUyGLzlIOQ6eoIq2z8QzQWaQR3ksSrktHJGs0ZJ9Aw+7U4vESQagLu3t4oZDC0LtHHtEhOOdo4BqiuDRdSaKT2OS1uWi+88Mbq5TPr2+tRmS/jt3ngms5ViH4ht0UlPnihdKvZNOe5CPtM8RiPBOQeoqq1ka2huI2kMfmrjofvcHiglMt7JGjXV0y7+VR3PT4dBQUsMkTYcGjybe/IkubwwMOCGjLHH6YotbH2xAlkstwFxhthyRUg1cvgfT9QQvpupoynlVOOK4d34JurQnzry2jQd2kArlAzDkTOc96rmnQMdzj5sTVBv2fotn/ibyW7Yf5duuB/2NEprdtaR40vSbS3b/AFZh5z/ueBWea4TdgA49elIwvI+C+Yx3PH0qUgrUbv7QdCzeZKPflwACfQAAAAVD7MuFiSR4zHG3KtIdoPw7mibWSC2CnZ5pB7jAoyfVTJbujWUPmueZn+8wHoM9KoG09NKScHUWuHVTn8PC/Ku4174SdQsem3jsf9/I+HWs9GbPzB7QJAmMERsAf3NU3E9qkpNqronYM+4/uAKDUreeHrXBXQ7pz2ErAZ+lTuvFt3BDssbKDTYz0O3L/WsZ7dKpPlsyk9881QTJKxJJJPc1KQzF394sfiaQjJ7UVsFPspCqFh9abzpk4DtgUSBioumasA5uJj1kaol3bqzH51cUqOypFVbSacRk1cFqQFIitYh3q4KBTgVLFWD/2Q==";

const MK = {
  dark:  { bg:"#06070d", surface:"#0a0b13", card:"#0e0f18", panel:"#0b0c15", text:"#dde1f5", sub:"#52556e", muted:"#252840", chrome:"#dde1f5", silver:"#adb1cc", pewter:"#72768f", danger:"#ff4060", warn:"#f0952a", success:"#2ed880", gold:"#c89a28", border:"rgba(180,185,230,0.08)", div:"rgba(180,185,230,0.06)" },
  light: { bg:"#b8bdd4", surface:"#c2c7de", card:"#ccd1e8", panel:"#c4c9e0", text:"#12142a", sub:"#44476a", muted:"#9294b0", chrome:"#12142a", silver:"#22264a", pewter:"#606480", danger:"#c01838", warn:"#a86020", success:"#108050", gold:"#786010", border:"rgba(18,20,42,0.10)", div:"rgba(18,20,42,0.06)" }
};

const fmt  = n => "$" + Number(n).toLocaleString();
const clamp = (v,a,b) => Math.min(b, Math.max(a, v));

const DAILY=[
  {day:"Mar 1",rev:265,pay:92,net:173},{day:"Mar 2",rev:280,pay:101,net:179},
  {day:"Mar 3",rev:240,pay:88,net:152},{day:"Mar 4",rev:320,pay:115,net:205},
  {day:"Mar 5",rev:295,pay:108,net:187},{day:"Mar 6",rev:258,pay:94,net:164},
  {day:"Mar 7",rev:340,pay:122,net:218}
];

/* ── SEED DATA — empty for launch, populated from Firebase ── */
const seedUsers=[];
const seedOws=[
  {id:"lootably",name:"Lootably",    providerCut:55,userCut:70,revenue:0,status:"active", postbackUrl:"https://api.cosmo.app/postback/lootably"},
  {id:"adgem",   name:"AdGem",       providerCut:50,userCut:65,revenue:0,status:"active", postbackUrl:"https://api.cosmo.app/postback/adgem"},
  {id:"cpx",     name:"CPX Research",providerCut:60,userCut:60,revenue:0,status:"testing",postbackUrl:"https://api.cosmo.app/postback/cpx"},
  {id:"torox",   name:"Torox",       providerCut:55,userCut:65,revenue:0,status:"inactive",postbackUrl:"https://api.cosmo.app/postback/torox"},
];
const seedTiers=[
  {id:"standard",label:"Standard",  pct:60},
  {id:"silver",  label:"Silver VIP",pct:70},
  {id:"gold",    label:"Gold VIP",  pct:80},
  {id:"diamond", label:"Diamond",   pct:90},
];
const seedWDs=[];
const seedComps=[];
const seedCards=[
  {id:"sc1",name:"Bronze Card",cost:0.5,minPrize:0.25,maxPrize:1,  winChance:60,status:"active"},
  {id:"sc2",name:"Silver Card",cost:1,  minPrize:0.5, maxPrize:2.5,winChance:50,status:"active"},
  {id:"sc3",name:"Gold Card",  cost:2,  minPrize:1,   maxPrize:5,  winChance:40,status:"active"},
];
const seedRefs=[];
const seedKeys=[];
const seedNotifications=[];

function PgDashboard({C,users,wds,totalRev,navTo,ambs,auditLog}){
  var pending=wds.filter(function(w){return w.status==="pending";}).length;
  var kycPending=(users||[]).filter(function(u){return u.kyc==="pending";}).length;
  var fraudFlags=(users||[]).filter(function(u){return u.status==="flagged";}).length;
  var openSupport=auditLog?auditLog.filter(function(a){return a.action&&a.action.indexOf("Ticket")>=0;}).length:3;
  var todaySignups=(users||[]).filter(function(u){var d=new Date(u.joined||"");var t=new Date();return d.toDateString()===t.toDateString();}).length;

  return(
    <div className="fade">
      {/* ── LIVE ALERT STRIP ── */}
      {(pending>0||kycPending>0||fraudFlags>0)&&(
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          {pending>0&&<div onClick={function(){navTo("cashflow");}} style={{flex:1,minWidth:140,background:C.warn+"14",border:"1px solid "+C.warn+"44",borderRadius:10,padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:C.warn,animation:"pulse 1.5s infinite"}}/>
            <div><div style={{fontSize:12,fontWeight:700,color:C.warn}}>{pending} Pending Withdrawal{pending>1?"s":""}</div><div style={{fontSize:10,color:C.sub}}>Tap to review →</div></div>
          </div>}
          {kycPending>0&&<div onClick={function(){navTo("kyc");}} style={{flex:1,minWidth:140,background:C.gold+"14",border:"1px solid "+C.gold+"44",borderRadius:10,padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:C.gold,animation:"pulse 1.5s infinite"}}/>
            <div><div style={{fontSize:12,fontWeight:700,color:C.gold}}>{kycPending} KYC Awaiting Review</div><div style={{fontSize:10,color:C.sub}}>Tap to review →</div></div>
          </div>}
          {fraudFlags>0&&<div onClick={function(){navTo("fraud");}} style={{flex:1,minWidth:140,background:C.danger+"14",border:"1px solid "+C.danger+"44",borderRadius:10,padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:C.danger,animation:"pulse 1.5s infinite"}}/>
            <div><div style={{fontSize:12,fontWeight:700,color:C.danger}}>{fraudFlags} Flagged Account{fraudFlags>1?"s":""}</div><div style={{fontSize:10,color:C.sub}}>Tap to review →</div></div>
          </div>}
        </div>
      )}

      {/* ── KPI ROW ── */}
      <div className="g2" style={{marginBottom:14}}>
        <Kpi label="Total Users"     val={users.length}                                              color={C.chrome}  sub={"+"+todaySignups+" today"} subC={C.success} C={C} onClick={function(){navTo("users");}}/>
        <Kpi label="Active Today"    val={users.filter(function(u){return u.status==="active";}).length} color={C.silver}  sub="Registered accounts"   subC={C.sub}     C={C}/>
        <Kpi label="Total Revenue"   val={fmt(totalRev)}                                             color={C.success}  sub="+23% this week"         subC={C.success} C={C} onClick={function(){navTo("cashflow");}}/>
        <Kpi label="Today Revenue"   val={fmt(340)}                                                  color={C.gold}     sub="+15% vs yesterday"      subC={C.success} C={C}/>
      </div>
      <div className="g2" style={{marginBottom:14}}>
        <Kpi label="Pending WDs"     val={pending}                 color={pending>0?C.warn:C.sub}    sub="Awaiting approval" subC={pending>0?C.warn:C.muted} C={C} onClick={function(){navTo("cashflow");}}/>
        <Kpi label="KYC Queue"       val={kycPending}              color={kycPending>0?C.gold:C.sub} sub="Docs to verify"    subC={kycPending>0?C.gold:C.muted} C={C} onClick={function(){navTo("kyc");}}/>
        <Kpi label="Fraud Flags"     val={fraudFlags}              color={fraudFlags>0?C.danger:C.sub} sub="Needs review"   subC={fraudFlags>0?C.danger:C.muted} C={C} onClick={function(){navTo("fraud");}}/>
        <Kpi label="Ambassadors"     val={(ambs||[]).filter(function(a){return a.status==="approved";}).length} color={C.silver} sub="Active" subC={C.sub} C={C} onClick={function(){navTo("ambassadors");}}/>
      </div>

      {/* ── CHARTS ── */}
      <div className="g2" style={{marginBottom:14}}>
        <Crd C={C} style={{padding:"18px 20px"}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:C.text}}>Daily Revenue</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={DAILY} margin={{top:4,right:4,left:-28,bottom:0}}>
              <defs><linearGradient id="dg1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.chrome} stopOpacity={.25}/><stop offset="95%" stopColor={C.chrome} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid stroke={C.div} strokeDasharray="3 6"/>
              <XAxis dataKey="day" tick={{fill:C.muted,fontSize:9}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.muted,fontSize:9}} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTip/>}/>
              <Area type="monotone" dataKey="rev" name="Revenue" stroke={C.chrome} fill="url(#dg1)" strokeWidth={2} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </Crd>
        <Crd C={C} style={{padding:"18px 20px"}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:C.text}}>Net Profit</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={DAILY} margin={{top:4,right:4,left:-28,bottom:0}}>
              <CartesianGrid stroke={C.div} strokeDasharray="3 6"/>
              <XAxis dataKey="day" tick={{fill:C.muted,fontSize:9}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.muted,fontSize:9}} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTip/>}/>
              <Bar dataKey="net" name="Net" fill={C.success} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Crd>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button className="btn btn-primary"  onClick={function(){navTo("notifications");}}>▶ Send Broadcast</button>
        <button className="btn btn-success"  onClick={function(){navTo("competitions");}}>+ New Competition</button>
        <button className="btn btn-ghost"    onClick={function(){navTo("users");}}>View All Users</button>
        <button className="btn btn-ghost"    onClick={function(){navTo("auditlog");}}>Audit Log</button>
      </div>
    </div>
  );
}


function PgUsers({C,users,setUsers,refs,banUser,unbanUser,adjustBalance,saveNotes,auditLog,showToast,doConfirm,logAction}){
  var srch=useState(""); var setSrch=srch[1]; srch=srch[0];
  var filt=useState("all"); var setFilt=filt[1]; filt=filt[0];
  var sel=useState(null); var setSel=sel[1]; sel=sel[0];
  var tab=useState("overview"); var setTab=tab[1]; tab=tab[0];
  var adjTgt=useState(null); var setAdjTgt=adjTgt[1]; adjTgt=adjTgt[0];
  /* Pagination */
  var page=useState(0); var setPage=page[1]; page=page[0];
  var perPage=useState(20); var setPerPage=perPage[1]; perPage=perPage[0];
  /* Bulk select */
  var selIds=useState([]); var setSelIds=selIds[1]; selIds=selIds[0];
  /* Date filter */
  var dateFrom=useState(""); var setDateFrom=dateFrom[1]; dateFrom=dateFrom[0];
  var dateTo=useState(""); var setDateTo=dateTo[1]; dateTo=dateTo[0];

  var filtered=users.filter(function(u){
    var matchF=filt==="all"||u.status===filt;
    var matchS=!srch||u.handle.toLowerCase().indexOf(srch.toLowerCase())>=0||u.email.toLowerCase().indexOf(srch.toLowerCase())>=0;
    var matchD=true;
    if(dateFrom&&u.joined){var jd=new Date(u.joined);matchD=jd>=new Date(dateFrom);}
    if(dateTo&&u.joined){var jd2=new Date(u.joined);matchD=matchD&&jd2<=new Date(dateTo);}
    return matchF&&matchS&&matchD;
  });
  var totalPages=Math.ceil(filtered.length/perPage);
  var paginated=filtered.slice(page*perPage,(page+1)*perPage);
  var allOnPageSelected=paginated.length>0&&paginated.every(function(u){return selIds.includes(u.id);});

  /* CSV Export */
  function downloadCSV(){
    var header=["Handle","Email","Status","Tier","Balance","Total Earned","Refs","Joined","Device","IP"];
    var rows=filtered.map(function(u){return[u.handle,u.email,u.status,u.tier||"Bronze","$"+u.balance,"—",u.refs,u.joined,u.device,u.ip].join(",");});
    var csv=[header.join(","),...rows].join("\n");
    var blob=new Blob([csv],{type:"text/csv"});
    var a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="cosmo_users_"+new Date().toISOString().slice(0,10)+".csv"; a.click();
    logAction("Users Exported",filtered.length+" rows");
    showToast("Exported "+filtered.length+" users");
  }
  /* Bulk actions */
  function bulkBan(){doConfirm("Bulk Ban",`Ban ${selIds.length} selected users?`,()=>{setUsers(function(p){return p.map(function(u){return selIds.includes(u.id)?Object.assign({},u,{status:"banned"}):u;});});logAction("Bulk Ban",selIds.length+" users");showToast(selIds.length+" users banned","error");setSelIds([]);},true);}
  function bulkUnban(){setUsers(function(p){return p.map(function(u){return selIds.includes(u.id)?Object.assign({},u,{status:"active"}):u;});});logAction("Bulk Unban",selIds.length+" users");showToast(selIds.length+" users unbanned");setSelIds([]);}
  function toggleSel(id){setSelIds(function(p){return p.includes(id)?p.filter(function(x){return x!==id;}):p.concat([id]);});setPage(0);}
  function toggleAll(){setSelIds(allOnPageSelected?[]:paginated.map(function(u){return u.id;}));}

  if(sel){
    var u=sel;
    var earned=u.balance*1.4+20;
    var isGold=earned>=1000||u.refs>=50;
    var isSilver=!isGold&&(earned>=200||u.refs>=10);
    var tierCol=isGold?C.gold:isSilver?C.silver:"#cd7f32";
    var tierLbl=isGold?"Gold":isSilver?"Silver":"Bronze";
    var nextPct=isGold?100:isSilver?Math.min(100,Math.round(earned/1000*100)):Math.min(100,Math.round(earned/200*100));
    var nextLbl=isGold?"Max tier":isSilver?"$"+(1000-Math.round(earned))+" to Gold":"$"+(200-Math.round(earned))+" to Silver";
    return(
      <div className="fade">
        <button className="btn btn-ghost" style={{marginBottom:16}} onClick={function(){setSel(null);setTab("overview");}}>Back to Users</button>
        <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:14}}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Crd C={C} style={{padding:"20px 16px",textAlign:"center"}}>
              <div style={{width:52,height:52,borderRadius:12,background:C.panel,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:C.silver,border:"1px solid "+C.border,margin:"0 auto 10px"}}>{u.handle[1].toUpperCase()}</div>
              <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:2}}>{u.handle}</div>
              <div style={{fontSize:11,color:C.sub,marginBottom:10}}>{u.email}</div>
              <div style={{display:"flex",gap:4,justifyContent:"center",flexWrap:"wrap",marginBottom:12}}>
                <SBadge s={u.status}/>
                <Badge label={tierLbl} color={tierCol} bg={tierCol+"22"}/>
                {u.ambassador&&<Badge label="Amb" color={C.silver} bg={C.silver+"18"}/>}
              </div>
            </Crd>
            <Crd C={C} style={{padding:"14px 16px"}}>
              {[["Joined",u.joined],["Device",u.device],["IP",u.ip],["Last Active",u.lastActive]].map(function(pair){
                return(
                  <div key={pair[0]} style={{display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:12}}>
                    <span style={{color:C.sub}}>{pair[0]}</span>
                    <span style={{color:C.text,fontWeight:600,maxWidth:"55%",textAlign:"right",wordBreak:"break-all"}}>{pair[1]}</span>
                  </div>
                );
              })}
            </Crd>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <button className="btn btn-success" onClick={function(){setAdjTgt(u);}}>+ Adjust Balance</button>
              {u.status==="banned"
                ?<button className="btn btn-success" onClick={function(){unbanUser(u.id);setSel(function(p){return Object.assign({},p,{status:"active"});});}}>Unban User</button>
                :<button className="btn btn-danger"  onClick={function(){banUser(u.id,"User profile");setSel(function(p){return Object.assign({},p,{status:"banned"});});}}>Ban User</button>
              }
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12,minWidth:0}}>
            <Tabs tabs={[{id:"overview",label:"Overview"},{id:"activity",label:"Activity"},{id:"log",label:"Admin Log"}]} active={tab} set={setTab} C={C}/>
            {tab==="overview"&&(
              <div>
                <Crd C={C} style={{padding:"18px 20px",marginBottom:12}}>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:C.text}}>Risk Score</div>
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
                    <div style={{fontSize:42,fontWeight:900,color:u.risk>60?C.danger:u.risk>30?C.warn:C.success,fontFamily:"JetBrains Mono"}}>{u.risk}</div>
                    <div style={{fontWeight:700,color:u.risk>60?C.danger:u.risk>30?C.warn:C.success}}>{u.risk>60?"High Risk":u.risk>30?"Medium Risk":"Low Risk"}</div>
                  </div>
                  <div style={{height:5,background:C.panel,borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:5,width:u.risk+"%",background:"linear-gradient(90deg,"+C.success+","+(u.risk>60?C.danger:C.warn)+")",borderRadius:3}}/>
                  </div>
                </Crd>
                <Crd C={C} style={{padding:"18px 20px",marginBottom:12}}>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:C.text}}>Tier Progress</div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:12,color:C.sub}}>Current: <strong style={{color:tierCol}}>{tierLbl}</strong></span>
                    <span style={{fontSize:12,color:C.sub}}>{nextLbl}</span>
                  </div>
                  <div style={{height:5,background:C.panel,borderRadius:3,overflow:"hidden",marginBottom:12}}>
                    <div style={{height:5,width:nextPct+"%",background:tierCol,borderRadius:3}}/>
                  </div>
                  <div className="g2" style={{gap:8}}>
                    {[["Lifetime Earned",fmt(earned),C.success],["Balance",fmt(u.balance),C.chrome],["Referrals",u.refs,C.silver],["KYC","Verified",C.success]].map(function(item){
                      return(
                        <div key={item[0]} style={{background:C.panel,borderRadius:8,padding:"10px 12px",border:"1px solid "+C.div}}>
                          <div style={{fontSize:9,color:C.sub,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>{item[0]}</div>
                          <div style={{fontSize:14,fontWeight:800,color:item[2],fontFamily:"JetBrains Mono"}}>{item[1]}</div>
                        </div>
                      );
                    })}
                  </div>
                </Crd>
                <Crd C={C} style={{padding:"18px 20px"}}>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:C.text}}>Security Status</div>
                  {[["Withdrawal Password","Set",C.success],["Location Opt-In","Opted In",C.silver],["2FA",u.ambassador?"Enabled":"Disabled",u.ambassador?C.success:C.warn],["Email Verified","Yes",C.success]].map(function(item){
                    return(
                      <div key={item[0]} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,fontSize:12}}>
                        <span style={{color:C.sub}}>{item[0]}</span>
                        <span style={{fontWeight:700,color:item[2]}}>{item[1]}</span>
                      </div>
                    );
                  })}
                  <div style={{height:1,background:C.div,margin:"10px 0 12px"}}/>
                  <button className="btn btn-ghost" style={{width:"100%",fontSize:11}} onClick={function(){doConfirm("Reset WD Password","Send reset link to "+u.handle+"?",function(){logAction("WD Password Reset",u.handle);showToast("Reset sent");},false);}}>Reset Withdrawal Password</button>
                </Crd>
              </div>
            )}
            {tab==="activity"&&(
              <Crd C={C} style={{padding:"18px 20px"}}>
                <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:C.text}}>Activity Timeline</div>
                {[["Offer completed — Lootably Survey","3/22/2026 09:14"],["Withdrawal requested — $50 PayPal","3/22/2026 08:45"],["Referral signup — @new_user_4","3/21/2026 14:30"],["Streak claimed — Day 5","3/21/2026 09:00"]].map(function(ev,i){
                  return(
                    <div key={i} style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start"}}>
                      <div style={{width:28,height:28,borderRadius:7,background:C.panel,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0,border:"1px solid "+C.border}}>•</div>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:C.text}}>{ev[0]}</div>
                        <div style={{fontSize:11,color:C.sub,marginTop:2}}>{ev[1]}</div>
                      </div>
                    </div>
                  );
                })}
              </Crd>
            )}
            {tab==="log"&&(
              <Crd C={C} style={{padding:"18px 20px"}}>
                <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:C.text}}>Admin Log</div>
                {auditLog.filter(function(a){return a.detail.indexOf(u.handle)>=0;}).length===0
                  ?<div style={{color:C.sub,fontSize:12}}>No actions logged for this user.</div>
                  :auditLog.filter(function(a){return a.detail.indexOf(u.handle)>=0;}).map(function(a,i){
                    return(
                      <div key={i} style={{marginBottom:10}}>
                        <div style={{fontSize:12,fontWeight:600,color:C.text}}>{a.action}</div>
                        <div style={{fontSize:11,color:C.sub}}>{a.detail} — {a.ts}</div>
                      </div>
                    );
                  })
                }
              </Crd>
            )}
          </div>
        </div>
        {adjTgt&&<AdjustModal user={adjTgt} onOk={function(v,r){adjustBalance(adjTgt.id,v,r);setAdjTgt(null);setSel(function(p){return Object.assign({},p,{balance:Math.max(0,p.balance+v)});});}} onNo={function(){setAdjTgt(null);}} C={C}/>}
      </div>
    );
  }

  return(
    <div className="fade">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,gap:10,flexWrap:"wrap"}}>
        <div style={{fontSize:16,fontWeight:800,color:C.text}}>{filtered.length} Users</div>
        <button className="btn btn-ghost" onClick={function(){showToast("CSV — connect backend first","error");}}>Export CSV</button>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <input value={srch} onChange={function(e){setSrch(e.target.value);}} placeholder="Search handle or email" style={{flex:1,minWidth:150,background:C.panel,border:"1px solid "+C.border,color:C.text,borderRadius:8,padding:"8px 12px",fontFamily:"Outfit",fontSize:13,outline:"none"}}/>
        <select value={filt} onChange={function(e){setFilt(e.target.value);}} style={{background:C.panel,border:"1px solid "+C.border,color:C.text,borderRadius:8,padding:"8px 11px",fontFamily:"Outfit",fontSize:13,outline:"none"}}>
          <option value="all">All</option><option value="active">Active</option><option value="banned">Banned</option>
        </select>
      </div>
      {filtered.length===0
        ?<div style={{textAlign:"center",padding:"36px 0",color:C.sub,fontSize:14}}>No users found.</div>
        :<Crd C={C}><div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <THead cols={["","User","Balance","Risk","Status","Actions"]} C={C}/>
            <tbody>
              {paginated.map(function(u,i){
                return(
                  <tr key={i} style={{borderBottom:"1px solid "+C.div,background:selIds.includes(u.id)?C.silver+"0a":"transparent"}} onClick={function(){setSel(u);setTab("overview");}}>
                    <td style={{padding:"8px 10px"}} onClick={function(e){e.stopPropagation();toggleSel(u.id);}}>
                      <div style={{width:15,height:15,borderRadius:3,border:"1.5px solid "+(selIds.includes(u.id)?C.silver:C.border),background:selIds.includes(u.id)?C.silver:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto"}}>
                        {selIds.includes(u.id)&&<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                    </td>
                    <td style={{padding:"11px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:30,height:30,borderRadius:7,background:C.panel,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:C.silver,border:"1px solid "+C.border,flexShrink:0}}>{u.handle[1].toUpperCase()}</div>
                        <div>
                          <div style={{fontWeight:700,color:C.text}}>{u.handle}</div>
                          <div style={{fontSize:11,color:C.sub}}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"11px 14px"}}><span style={{fontFamily:"JetBrains Mono",color:C.success,fontWeight:700}}>{fmt(u.balance)}</span></td>
                    <td style={{padding:"11px 14px"}}><RBadge score={u.risk}/></td>
                    <td style={{padding:"11px 14px"}}><SBadge s={u.status}/></td>
                    <td style={{padding:"11px 14px"}} onClick={function(e){e.stopPropagation();}}>
                      <div style={{display:"flex",gap:6}}>
                        <button className="btn btn-ghost" style={{padding:"4px 10px",fontSize:11}} onClick={function(){setSel(u);setTab("overview");}}>View</button>
                        {u.status==="banned"
                          ?<button className="btn btn-success" style={{padding:"4px 10px",fontSize:11}} onClick={function(){unbanUser(u.id);}}>Unban</button>
                          :<button className="btn btn-danger"  style={{padding:"4px 10px",fontSize:11}} onClick={function(){banUser(u.id,"User table");}}>Ban</button>
                        }
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Pagination controls */}
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderTop:"1px solid "+C.div,flexWrap:"wrap"}}>
            <button onClick={function(){setPage(0);}} disabled={page===0} style={{background:"none",border:"1px solid "+C.border,borderRadius:7,padding:"4px 9px",cursor:page===0?"not-allowed":"pointer",color:page===0?C.muted:C.sub,fontSize:12,opacity:page===0?0.4:1}}>«</button>
            <button onClick={function(){setPage(function(p){return Math.max(0,p-1);});}} disabled={page===0} style={{background:"none",border:"1px solid "+C.border,borderRadius:7,padding:"4px 9px",cursor:page===0?"not-allowed":"pointer",color:page===0?C.muted:C.sub,fontSize:12,opacity:page===0?0.4:1}}>‹ Prev</button>
            <span style={{flex:1,textAlign:"center",fontSize:11,color:C.sub}}>Page {page+1} / {Math.max(1,totalPages)} · {filtered.length} users</span>
            <select value={perPage} onChange={function(e){setPerPage(+e.target.value);setPage(0);}} style={{padding:"4px 8px",fontSize:11,width:80,marginBottom:0}}>
              {[10,20,50,100].map(function(n){return <option key={n} value={n}>{n} / page</option>;})}
            </select>
            <button onClick={function(){setPage(function(p){return Math.min(totalPages-1,p+1);});}} disabled={page>=totalPages-1} style={{background:"none",border:"1px solid "+C.border,borderRadius:7,padding:"4px 9px",cursor:page>=totalPages-1?"not-allowed":"pointer",color:page>=totalPages-1?C.muted:C.sub,fontSize:12,opacity:page>=totalPages-1?0.4:1}}>Next ›</button>
            <button onClick={function(){setPage(totalPages-1);}} disabled={page>=totalPages-1} style={{background:"none",border:"1px solid "+C.border,borderRadius:7,padding:"4px 9px",cursor:page>=totalPages-1?"not-allowed":"pointer",color:page>=totalPages-1?C.muted:C.sub,fontSize:12,opacity:page>=totalPages-1?0.4:1}}>»</button>
          </div>
        </div></Crd>
      }
    </div>
  );
}




/* Aliases for backward compat with copied Pg* components */
var StatusBadge = SBadge;
var RiskBadge = RBadge;

/* Card = alias for Crd (for components that use Card with C prop) */
function Card({children,style,C}){
  return <Crd C={C} style={style||{}}>{children}</Crd>;
}

function PgCashFlow({C,ows,tiers,setTiers,gSplit,setGSplit,wds,approveWD,rejectWD,totalRev,provPay,yourCut,userLiab,netProfit,burnRate,saveSettings,withdrawalEnabled,navTo}){
  const [tab,setTab]=useState("flow");
  const fl=[{p:Math.round(provPay/totalRev*100),c:C.danger},{p:Math.round(userLiab/totalRev*100),c:C.silver},{p:Math.round(netProfit/totalRev*100),c:C.success}];
  return(
    <div className="fade">
      <div className="g2" style={{marginBottom:14}}>
        {[[fmt(totalRev),"Total Revenue",C.chrome],[fmt(Math.round(provPay)),"Provider Payout",C.danger],[fmt(Math.round(yourCut)),"Your Cut",C.silver],[fmt(Math.round(netProfit)),"Net Profit",C.success]].map(([v,l,c],i)=>(
          <Kpi key={l} label={l} val={v} color={c} delay={i*.05} C={C}/>
        ))}
      </div>
      <Card C={C} style={{padding:"12px 16px",marginBottom:14}}>
        <div style={{display:"flex",gap:3,marginBottom:8,fontSize:10,color:C.sub}}>
          {[[C.danger,"Provider"],[C.silver,"Users"],[C.success,"You"]].map(([c,l])=><span key={l} style={{display:"flex",alignItems:"center",gap:4,marginRight:12}}><span style={{width:6,height:6,borderRadius:2,background:c,display:"inline-block"}}/>{l}</span>)}
        </div>
        <div style={{display:"flex",height:18,borderRadius:5,overflow:"hidden",gap:2}}>
          {fl.map((s,i)=><div key={i} style={{flex:s.p,background:s.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"rgba(0,0,0,.65)",opacity:.9}}>{s.p>9?s.p+"%":""}</div>)}
        </div>
      </Card>
      <Tabs tabs={[{id:"flow",label:"Cash Flow"},{id:"splits",label:"Splits"},{id:"runway",label:"Runway"},{id:"withdrawals",label:"Withdrawals"}]} active={tab} set={setTab} C={C}/>
      {tab==="flow"&&<div className="g2">
        <Card C={C} style={{padding:"18px 20px"}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:C.text}}>Revenue vs Payouts vs Net</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={DAILY} margin={{top:4,right:4,left:-28,bottom:0}}>
              <defs>{[["g1",C.chrome],["g2",C.danger],["g3",C.success]].map(([id,c])=><linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={c} stopOpacity={.25}/><stop offset="95%" stopColor={c} stopOpacity={0}/></linearGradient>)}</defs>
              <CartesianGrid stroke={C.div} strokeDasharray="3 6"/><XAxis dataKey="day" tick={{fill:C.muted,fontSize:9}} axisLine={false} tickLine={false}/><YAxis tick={{fill:C.muted,fontSize:9}} axisLine={false} tickLine={false}/><Tooltip content={<ChartTip/>}/>
              <Area type="monotone" dataKey="rev" name="Revenue" stroke={C.chrome} fill="url(#g1)" strokeWidth={2} dot={false}/>
              <Area type="monotone" dataKey="pay" name="Payouts" stroke={C.danger} fill="url(#g2)" strokeWidth={2} dot={false} strokeDasharray="4 3"/>
              <Area type="monotone" dataKey="net" name="Net" stroke={C.success} fill="url(#g3)" strokeWidth={2} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[{l:"Daily Burn",v:fmt(Math.round(burnRate)),c:C.danger,i:"🔥"},{l:"Monthly Owed",v:fmt(Math.round(userLiab)),c:C.silver,i:"⚠"},{l:"Today Net",v:fmt(218),c:C.success,i:"↑"},{l:"Pending",v:fmt(wds.filter(w=>w.status==="pending").reduce((a,w)=>a+w.amount,0)),c:C.sub,i:"◷"}].map((s,i)=>(
            <Card key={i} C={C} style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontSize:18}}>{s.i}</div>
              <div><div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5}}>{s.l}</div><div style={{fontSize:18,fontWeight:800,color:s.c,fontFamily:"JetBrains Mono"}}>{s.v}</div></div>
            </Card>
          ))}
        </div>
      </div>}
      {tab==="splits"&&<div className="g2">
        <Card C={C} style={{padding:"20px 22px"}}>
          <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:16}}>Global User Split</div>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
            <div><div style={{fontSize:40,fontWeight:900,color:C.chrome,fontFamily:"JetBrains Mono",lineHeight:1}}>{gSplit}%</div><div style={{fontSize:9,color:C.sub,marginTop:3,textTransform:"uppercase",letterSpacing:1}}>to users</div></div>
            <div style={{flex:1}}><input type="range" min="40" max="100" value={gSplit} onChange={e=>setGSplit(+e.target.value)}/></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:26,fontWeight:900,color:C.success,fontFamily:"JetBrains Mono",lineHeight:1}}>{100-gSplit}%</div><div style={{fontSize:9,color:C.sub,marginTop:3,textTransform:"uppercase",letterSpacing:1}}>you keep</div></div>
          </div>
          <button className="btn btn-primary" style={{width:"100%"}} onClick={saveSettings}>Save</button>
        </Card>
        <Card C={C} style={{padding:"20px 22px"}}>
          <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:16}}>Per-Tier Splits</div>
          {tiers.map((tr,i)=>{const tc=[C.pewter,C.silver,C.gold,C.chrome];return(
            <div key={tr.id} style={{marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                <div style={{width:6,height:6,borderRadius:2,background:tc[i],flexShrink:0}}/>
                <span style={{fontSize:12,fontWeight:700,color:C.text,width:100}}>{tr.label}</span>
                <div style={{flex:1}}><input type="range" min="40" max="100" value={tr.pct} onChange={e=>setTiers(p=>p.map(x=>x.id===tr.id?{...x,pct:+e.target.value}:x))}/></div>
                <span style={{fontFamily:"JetBrains Mono",fontSize:13,fontWeight:700,color:tc[i],width:38,textAlign:"right"}}>{tr.pct}%</span>
              </div>
            </div>
          );})}
          <button className="btn btn-primary" style={{width:"100%"}} onClick={saveSettings}>Save Tiers</button>
        </Card>
      </div>}
      {tab==="runway"&&<div className="g2">
        <Card C={C} style={{padding:"24px 26px"}}>
          <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:2,marginBottom:6}}>Runway Projection</div>
          <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:4}}>
            <div style={{fontSize:70,fontWeight:900,fontFamily:"JetBrains Mono",lineHeight:1,color:C.success}}>47</div>
            <div style={{fontSize:16,color:C.sub}}>days</div>
          </div>
          <div style={{fontSize:12,fontWeight:700,color:C.success,marginBottom:18}}>✓ Healthy runway</div>
          {[["Cash reserves",fmt(14500)],["Daily burn",fmt(Math.round(burnRate))],["Break-even/mo",fmt(Math.round(burnRate*45))]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:13}}><span style={{color:C.sub}}>{l}</span><span style={{color:C.text,fontWeight:700,fontFamily:"JetBrains Mono"}}>{v}</span></div>
          ))}
        </Card>
        <Card C={C} style={{padding:"20px 22px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Liability Breakdown</div>
          {[{l:"Pending withdrawals",p:2,c:C.danger},{l:"Spendable balance",p:45,c:C.silver},{l:"Earned, not withdrawn",p:35,c:C.success},{l:"Hold period",p:18,c:C.sub}].map(s=>(
            <div key={s.l} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:12}}><span style={{color:C.sub}}>{s.l}</span><span style={{color:s.c,fontFamily:"JetBrains Mono",fontWeight:700}}>{fmt(Math.round(userLiab*s.p/100))}</span></div>
              <div style={{height:3,background:C.panel,borderRadius:2,overflow:"hidden"}}><div style={{height:3,width:s.p+"%",background:s.c,borderRadius:2}}/></div>
            </div>
          ))}
        </Card>
      </div>}
      {tab==="withdrawals"&&<div>
        {withdrawalEnabled===false&&<div style={{background:C.danger+"18",border:`1px solid ${C.danger}44`,borderRadius:10,padding:"12px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18}}>🔒</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.danger,marginBottom:2}}>Withdrawals are currently PAUSED</div>
            <div style={{fontSize:11,color:C.sub}}>No new withdrawal requests can be submitted by users. Go to Settings to re-enable.</div>
          </div>
          <button className="btn btn-primary" style={{marginLeft:"auto",flexShrink:0,fontSize:11}} onClick={()=>navTo("settings")}>Go to Settings</button>
        </div>}
        <Card C={C}><div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <THead cols={["User","Amount","Method","Status","Date","Actions"]} C={C}/>
            <tbody>{wds.map((w,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${C.div}`}}>
                <td style={{padding:"11px 14px",fontWeight:700,color:C.text}}>{w.user}</td>
                <td style={{padding:"11px 14px"}}><span style={{fontFamily:"JetBrains Mono",color:C.success,fontWeight:700}}>{fmt(w.amount)}</span></td>
                <td style={{padding:"11px 14px",color:C.sub}}>{w.method}</td>
                <td style={{padding:"11px 14px"}}><StatusBadge s={w.status}/></td>
                <td style={{padding:"11px 14px",color:C.sub,fontSize:12}}>{w.date}</td>
                <td style={{padding:"11px 14px"}}>{w.status==="pending"&&<div style={{display:"flex",gap:6}}>
                  <button className="btn btn-success" style={{padding:"4px 9px",fontSize:11}} onClick={()=>approveWD(w.id)}>✓</button>
                  <button className="btn btn-danger"  style={{padding:"4px 9px",fontSize:11}} onClick={()=>rejectWD(w.id)}>✕</button>
                </div>}</td>
              </tr>
            ))}</tbody>
          </table>
          {wds.filter(w=>w.status==="pending").length===0&&<div style={{textAlign:"center",padding:"28px",color:C.sub,fontSize:13}}>No pending withdrawals.</div>}
        </div></Card>
      </div>}
    </div>
  );
}

function PgOfferwalls({C,ows,setOws,showToast,doConfirm,logAction}){
  const [editId,setEditId]=useState(null);
  const [tab,setTab]=useState("overview");
  const payColors={paid:C.success,pending:C.warn,overdue:C.danger};

  return(
    <div className="fade">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,gap:10}}>
        <div style={{fontSize:16,fontWeight:800,color:C.text}}>Offerwalls</div>
        <div style={{display:"flex",gap:8}}>
          <Tabs tabs={[{id:"overview",label:"Overview"},{id:"payments",label:"Payments"},{id:"regions",label:"Regions"}]} active={tab} set={setTab} C={C}/>
          <button className="btn btn-primary" style={{fontSize:11}} onClick={()=>showToast("Add offerwall — connect backend first","error")}>+ Add</button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        {[
          [ows.filter(o=>o.status==="active").length+" active","Providers",C.chrome],
          ["$"+ows.reduce((a,o)=>a+o.revenue,0).toLocaleString(),"Total Revenue",C.success],
          [ows.reduce((a,o)=>a+(o.ecpm||0),0).toFixed(2)+" avg","eCPM",C.gold],
          [ows.filter(o=>o.paymentStatus==="pending").length+" pending","Payments",C.warn],
        ].map(([v,l,c])=>(
          <Crd key={l} C={C} style={{padding:"12px 14px"}}>
            <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>{l}</div>
            <div style={{fontSize:18,fontWeight:800,fontFamily:"JetBrains Mono",color:c}}>{v}</div>
          </Crd>
        ))}
      </div>

      {tab==="overview"&&ows.map((ow,i)=>{
        const oc=[C.gold,C.success,C.warn][i];
        const youGet=100-ow.providerCut;
        const userPct=(youGet*ow.userCut/100).toFixed(1);
        const yourPct=(youGet*(1-ow.userCut/100)).toFixed(1);
        const isE=editId===ow.id;
        return(
          <Card key={ow.id} C={C} style={{padding:"18px 20px",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <div style={{width:7,height:7,borderRadius:2,background:oc}}/>
              <span style={{fontSize:15,fontWeight:800,color:C.text}}>{ow.name}</span>
              <StatusBadge s={ow.status}/>
              <Badge label={(ow.paymentStatus||"paid")} color={payColors[ow.paymentStatus||"paid"]} bg={(payColors[ow.paymentStatus||"paid"])+"22"}/>
              <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                <button className="btn btn-ghost" style={{fontSize:11}} onClick={()=>setEditId(isE?null:ow.id)}>{isE?"✓ Done":"✎ Edit"}</button>
                <button className="btn btn-danger" style={{fontSize:11}} onClick={()=>doConfirm("Remove Offerwall",`Remove ${ow.name}?`,()=>{setOws(p=>p.filter(o=>o.id!==ow.id));logAction("Offerwall Removed",ow.name);},"error")}>✕</button>
              </div>
            </div>

            {/* Stats grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
              {[
                ["Revenue",fmt(ow.revenue),oc],
                ["Your Cut",yourPct+"%",C.success],
                ["User Payout",userPct+"% of your cut",C.pewter],
                ["eCPM","$"+(ow.ecpm||0).toFixed(2),C.gold],
                ["Fill Rate",(ow.fillRate||0)+"%",ow.fillRate>60?C.success:ow.fillRate>40?C.warn:C.danger],
                ["Chargeback",(ow.chargebackRate||0)+"%",ow.chargebackRate<2?C.success:ow.chargebackRate<4?C.warn:C.danger],
                ["Terms",ow.paymentTerms||"Net-30",C.silver],
                ["Min Payout","$"+(ow.minPayout||50),C.sub],
              ].map(([l,v,c])=>(
                <div key={l} style={{background:C.panel,borderRadius:8,padding:"9px 11px",border:`1px solid ${C.div}`}}>
                  <div style={{fontSize:8,color:C.sub,textTransform:"uppercase",letterSpacing:1.3,marginBottom:4}}>{l}</div>
                  <div style={{fontFamily:"JetBrains Mono",fontWeight:700,color:c,fontSize:12}}>{v}</div>
                </div>
              ))}
            </div>

            {isE&&(
              <div style={{background:C.panel,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.div}`,marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:C.sub,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Edit Revenue Splits</div>
                {[["Provider cut",ow.providerCut,"providerCut",30,70,C.danger],["User payout (% of your cut)",ow.userCut,"userCut",40,95,C.silver]].map(([l,v,k,mn,mx,c])=>(
                  <div key={k} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12}}>
                      <span style={{color:C.sub}}>{l}</span><span style={{color:c,fontWeight:700,fontFamily:"JetBrains Mono"}}>{v}%</span>
                    </div>
                    <input type="range" min={mn} max={mx} value={v} onChange={e=>setOws(p=>p.map(o=>o.id===ow.id?{...o,[k]:+e.target.value}:o))}/>
                  </div>
                ))}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[["eCPM ($)","ecpm"],["Fill Rate (%)","fillRate"],["Chargeback (%)","chargebackRate"],["Min Payout ($)","minPayout"]].map(([l,k])=>(
                    <div key={k}>
                      <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>{l}</div>
                      <input type="number" value={ow[k]||0} onChange={e=>setOws(p=>p.map(o=>o.id===ow.id?{...o,[k]:+e.target.value}:o))} style={{fontFamily:"JetBrains Mono"}}/>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:10}}>
                  <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>Payment Terms</div>
                  <select value={ow.paymentTerms||"Net-30"} onChange={e=>setOws(p=>p.map(o=>o.id===ow.id?{...o,paymentTerms:e.target.value}:o))}>
                    {["Weekly","Net-15","Net-30","Net-45","Net-60"].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{marginTop:10}}>
                  <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>Payment Status</div>
                  <select value={ow.paymentStatus||"paid"} onChange={e=>setOws(p=>p.map(o=>o.id===ow.id?{...o,paymentStatus:e.target.value}:o))}>
                    {["paid","pending","overdue"].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div style={{background:C.panel,borderRadius:7,padding:"8px 12px",border:`1px solid ${C.div}`,marginBottom:8}}>
              <div style={{fontSize:8,color:C.sub,textTransform:"uppercase",letterSpacing:1.5,marginBottom:3}}>Postback URL</div>
              <code style={{fontSize:11,fontFamily:"JetBrains Mono",color:C.silver,wordBreak:"break-all"}}>{ow.postback}</code>
            </div>
            <div style={{display:"flex",height:5,borderRadius:3,overflow:"hidden",gap:1,marginBottom:5}}>
              <div style={{flex:ow.providerCut,background:C.danger,opacity:.7}}/>
              <div style={{flex:parseFloat(userPct),background:C.silver,opacity:.7}}/>
              <div style={{flex:parseFloat(yourPct),background:C.success,opacity:.7}}/>
            </div>
            <div style={{display:"flex",gap:12,fontSize:9,color:C.muted}}>
              <span style={{color:C.danger}}>Provider {ow.providerCut}%</span>
              <span style={{color:C.silver}}>Users ~{userPct}%</span>
              <span style={{color:C.success}}>You ~{yourPct}%</span>
            </div>
          </Card>
        );
      })}

      {tab==="payments"&&(
        <Crd C={C}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <THead cols={["Provider","Revenue","eCPM","Terms","Min Payout","Status","Chargeback %"]} C={C}/>
              <tbody>
                {ows.map((ow,i)=>(
                  <tr key={i} style={{borderBottom:`1px solid ${C.div}`}}>
                    <td style={{padding:"12px 14px",fontWeight:700,color:C.text}}>{ow.name}</td>
                    <td style={{padding:"12px 14px"}}><span style={{fontFamily:"JetBrains Mono",color:C.success,fontWeight:700}}>{fmt(ow.revenue)}</span></td>
                    <td style={{padding:"12px 14px"}}><span style={{fontFamily:"JetBrains Mono",color:C.gold,fontWeight:700}}>${(ow.ecpm||0).toFixed(2)}</span></td>
                    <td style={{padding:"12px 14px",color:C.sub}}>{ow.paymentTerms||"Net-30"}</td>
                    <td style={{padding:"12px 14px",color:C.sub,fontFamily:"JetBrains Mono"}}>${ow.minPayout||50}</td>
                    <td style={{padding:"12px 14px"}}><Badge label={ow.paymentStatus||"paid"} color={payColors[ow.paymentStatus||"paid"]} bg={(payColors[ow.paymentStatus||"paid"])+"22"}/></td>
                    <td style={{padding:"12px 14px"}}><span style={{fontFamily:"JetBrains Mono",color:ow.chargebackRate<2?C.success:ow.chargebackRate<4?C.warn:C.danger,fontWeight:700}}>{ow.chargebackRate||0}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{padding:"12px 16px",borderTop:`1px solid ${C.div}`,fontSize:11,color:C.sub}}>
            💡 Chargeback rate over 5% means the provider is reversing payments for fraud — consider reducing traffic or switching providers.
          </div>
        </Crd>
      )}

      {tab==="regions"&&(
        <div>
          <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px",marginBottom:14,fontSize:12,color:C.sub,lineHeight:1.7}}>
            <strong style={{color:C.text}}>Geographic Reality:</strong> US/UK/CA/AU users earn 5-10x more per offer than West African users. Many providers have zero fill for NG/GH. Set per-country multipliers below — this adjusts how much of your cut you share with users from each region.
          </div>
          {ows.map((ow,i)=>(
            <Card key={ow.id} C={C} style={{padding:"16px 18px",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>{ow.name} — Region Fill Rates</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                {(ow.supportedRegions||[]).map(r=>(
                  <div key={r} style={{background:C.success+"18",border:`1px solid ${C.success}44`,borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:700,color:C.success}}>{r}</div>
                ))}
              </div>
              <div style={{fontSize:11,color:C.sub,marginBottom:10}}>User payout multiplier by region (vs your default split):</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {[["US/CA/AU","Tier 1","100%",C.success],["UK/EU","Tier 2","90%",C.silver],["LATAM","Tier 3","70%",C.warn],["NG/GH/KE","West Africa","40%",C.danger],["IN/PK","South Asia","50%",C.warn],["Other","Rest","60%",C.sub]].map(([region,label,pct,c])=>(
                  <div key={region} style={{background:C.panel,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.div}`}}>
                    <div style={{fontSize:9,color:C.sub,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{label}</div>
                    <div style={{fontSize:11,fontWeight:700,color:C.text,marginBottom:4}}>{region}</div>
                    <div style={{fontSize:14,fontWeight:800,fontFamily:"JetBrains Mono",color:c}}>{pct}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:10,color:C.muted,marginTop:10}}>Connect backend to make these editable per offerwall. Applied at payout calculation time.</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PgAuditLog({C,auditLog,navTo}){
  var srch=useState(""); var setSrch=srch[1]; srch=srch[0];
  var actor=useState("all"); var setActor=actor[1]; actor=actor[0];
  var page=useState(0); var setPage=page[1]; page=page[0];
  var perPage=20;

  /* Deep-link map: action keyword → admin page */
  var DEEP_LINK_MAP={
    "User":"users","Ban":"users","Unban":"users","Balance":"users","KYC":"kyc",
    "Competition":"competitions","Draw":"competitions","Ambassador":"ambassadors",
    "Tier":"tiers","Notification":"notifications","Message":"notifications",
    "Task":"tasks","Offerwall":"offerwalls","Postback":"postbacklog",
    "Settings":"settings","Withdrawal":"cashflow","Revenue":"cashflow",
    "API":"apikeys","Fraud":"fraud","Scratch":"scratch","Referral":"referrals",
    "Leaderboard":"leaderboards","Template":"notifications","Broadcast":"notifications",
  };
  function getDeepLink(action){
    var keys=Object.keys(DEEP_LINK_MAP);
    for(var i=0;i<keys.length;i++){if(action&&action.indexOf(keys[i])>=0) return DEEP_LINK_MAP[keys[i]];}
    return null;
  }

  var actors=["all"].concat([...new Set((auditLog||[]).map(function(a){return a.admin||"System";}))]);
  var filtered=(auditLog||[]).filter(function(a){
    var ms=!srch||(a.action||"").toLowerCase().indexOf(srch.toLowerCase())>=0||(a.detail||"").toLowerCase().indexOf(srch.toLowerCase())>=0;
    var ma=actor==="all"||(a.admin||"System")===actor;
    return ms&&ma;
  });
  var totalPages=Math.ceil(filtered.length/perPage);
  var paginated=filtered.slice(page*perPage,(page+1)*perPage);

  var actionColor=function(action){
    if(!action) return C.sub;
    if(action.indexOf("Deleted")>=0||action.indexOf("Ban")>=0||action.indexOf("Blocked")>=0||action.indexOf("Shutdown")>=0) return C.danger;
    if(action.indexOf("Created")>=0||action.indexOf("Approved")>=0||action.indexOf("Restored")>=0) return C.success;
    if(action.indexOf("Updated")>=0||action.indexOf("Saved")>=0||action.indexOf("Sent")>=0) return C.silver;
    return C.gold;
  };

  return(
    <div className="fade">
      <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:4}}>Audit Log</div>
      <div style={{fontSize:12,color:C.sub,marginBottom:14}}>Complete record of all admin actions. Click any entry to navigate to the relevant section.</div>

      {/* Toolbar */}
      <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:180}}>
          <svg style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={srch} onChange={function(e){setSrch(e.target.value);setPage(0);}} placeholder="Search actions or details..." style={{paddingLeft:30}}/>
        </div>
        <select value={actor} onChange={function(e){setActor(e.target.value);setPage(0);}} style={{width:140,marginBottom:0}}>
          {actors.map(function(a){return <option key={a} value={a}>{a==="all"?"All Admins":a}</option>;})}
        </select>
        <span style={{fontSize:11,color:C.muted,whiteSpace:"nowrap"}}>{filtered.length} entries</span>
      </div>

      {/* Log table */}
      <Crd C={C}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <THead cols={["Time","Action","Detail","Admin","→"]} C={C}/>
            <tbody>
              {paginated.map(function(a,i){
                var dl=getDeepLink(a.action||"");
                return(
                  <tr key={i} onClick={dl?function(){navTo(dl);}:undefined}
                    style={{borderBottom:"1px solid "+C.div,cursor:dl?"pointer":"default",transition:"background .12s"}}
                    onMouseEnter={function(e){if(dl) e.currentTarget.style.background=C.silver+"0a";}}
                    onMouseLeave={function(e){e.currentTarget.style.background="transparent";}}>
                    <td style={{padding:"10px 14px",fontSize:11,color:C.muted,whiteSpace:"nowrap",fontFamily:"JetBrains Mono"}}>{a.time}</td>
                    <td style={{padding:"10px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:actionColor(a.action),flexShrink:0}}/>
                        <span style={{fontSize:12,fontWeight:700,color:actionColor(a.action)}}>{a.action}</span>
                      </div>
                    </td>
                    <td style={{padding:"10px 14px",fontSize:12,color:C.sub,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.detail||"—"}</td>
                    <td style={{padding:"10px 14px",fontSize:11,color:C.muted}}>{a.admin||"System"}</td>
                    <td style={{padding:"10px 14px",textAlign:"center"}}>
                      {dl&&<span style={{fontSize:11,color:C.silver,fontWeight:600}}>→ {dl}</span>}
                    </td>
                  </tr>
                );
              })}
              {paginated.length===0&&<tr><td colSpan={5} style={{padding:"28px",textAlign:"center",color:C.muted,fontSize:13}}>No matching entries</td></tr>}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages>1&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderTop:"1px solid "+C.div,flexWrap:"wrap"}}>
          <button onClick={function(){setPage(0);}} disabled={page===0} style={{background:"none",border:"1px solid "+C.border,borderRadius:7,padding:"4px 9px",cursor:page===0?"not-allowed":"pointer",color:page===0?C.muted:C.sub,fontSize:12,opacity:page===0?0.4:1}}>«</button>
          <button onClick={function(){setPage(function(p){return Math.max(0,p-1);});}} disabled={page===0} style={{background:"none",border:"1px solid "+C.border,borderRadius:7,padding:"4px 9px",cursor:page===0?"not-allowed":"pointer",color:page===0?C.muted:C.sub,fontSize:12,opacity:page===0?0.4:1}}>‹ Prev</button>
          <span style={{flex:1,textAlign:"center",fontSize:11,color:C.sub}}>Page {page+1} / {totalPages}</span>
          <button onClick={function(){setPage(function(p){return Math.min(totalPages-1,p+1);});}} disabled={page>=totalPages-1} style={{background:"none",border:"1px solid "+C.border,borderRadius:7,padding:"4px 9px",cursor:page>=totalPages-1?"not-allowed":"pointer",color:page>=totalPages-1?C.muted:C.sub,fontSize:12,opacity:page>=totalPages-1?0.4:1}}>Next ›</button>
          <button onClick={function(){setPage(totalPages-1);}} disabled={page>=totalPages-1} style={{background:"none",border:"1px solid "+C.border,borderRadius:7,padding:"4px 9px",cursor:page>=totalPages-1?"not-allowed":"pointer",color:page>=totalPages-1?C.muted:C.sub,fontSize:12,opacity:page>=totalPages-1?0.4:1}}>»</button>
        </div>}
      </Crd>
    </div>
  );
}


function PgTiers({C,tiers,setTiers,users,gSplit,saveSettings,showToast,logAction}){
  const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,...style}}>{children}</div>;
  const tierColors={bronze:"#cd7f32",silver:C.silver,gold:C.gold,diamond:C.chrome};
  const tierDefs=[
    {id:"bronze", label:"Bronze", icon:"🥉", color:"#cd7f32", minEarned:0,   minRefs:0,  multiplier:1.00, wdFee:5, desc:"Default tier for all new users"},
    {id:"silver", label:"Silver", icon:"🥈", color:C.silver,  minEarned:200, minRefs:10, multiplier:1.10, wdFee:3, desc:"Unlocked at $200 earned or 10 referrals"},
    {id:"gold",   label:"Gold",   icon:"🥇", color:C.gold,    minEarned:1000,minRefs:50, multiplier:1.20, wdFee:1, desc:"Unlocked at $1,000 earned or 50 referrals"},
  ];
  const [thresholds,setThresholds]=useState({
    silverEarned:200, silverRefs:10,
    goldEarned:1000,  goldRefs:50,
  });
  const [mults,setMults]=useState({bronze:100,silver:110,gold:120});
  const [fees,setFees]=useState({bronze:5,silver:3,gold:1});

  const tierCount=(tier)=>{
    if(tier==="gold")    return users.filter(u=>(u.totalEarned||u.balance)>=thresholds.goldEarned  || (u.refs||0)>=thresholds.goldRefs).length;
    if(tier==="silver")  return users.filter(u=>((u.totalEarned||u.balance)>=thresholds.silverEarned|| (u.refs||0)>=thresholds.silverRefs) && (u.totalEarned||u.balance)<thresholds.goldEarned && (u.refs||0)<thresholds.goldRefs).length;
    return users.filter(u=>(u.totalEarned||u.balance)<thresholds.silverEarned && (u.refs||0)<thresholds.silverRefs).length;
  };

  return(
    <div className="fade">
      <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:6}}>Tiers Management</div>
      <div style={{fontSize:12,color:C.sub,marginBottom:18}}>Configure unlock thresholds, reward multipliers and withdrawal fees for each tier.</div>

      {/* Tier overview cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:18}}>
        {tierDefs.map(t=>(
          <Card key={t.id} style={{padding:"18px 20px",borderTop:`3px solid ${t.color}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <span style={{fontSize:22}}>{t.icon}</span>
              <div><div style={{fontSize:15,fontWeight:800,color:t.color}}>{t.label}</div><div style={{fontSize:10,color:C.sub}}>{tierCount(t.id)} users</div></div>
            </div>
            <div style={{height:4,background:C.panel,borderRadius:2,overflow:"hidden",marginBottom:12}}>
              <div style={{height:4,width:Math.min(100,tierCount(t.id)/users.length*100)+"%",background:t.color,borderRadius:2,transition:"width .5s"}}/>
            </div>
            <div style={{fontSize:11,color:C.sub,lineHeight:1.6}}>{t.desc}</div>
          </Card>
        ))}
      </div>

      <div className="g2" style={{gap:14,marginBottom:14}}>
        {/* Unlock thresholds */}
        <Card style={{padding:"20px 22px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:16}}>🔓 Unlock Thresholds</div>
          {[
            {label:"Silver — Min Earned ($)",  key:"silverEarned", color:"#adb1cc"},
            {label:"Silver — Min Referrals",   key:"silverRefs",   color:"#adb1cc"},
            {label:"Gold — Min Earned ($)",    key:"goldEarned",   color:C.gold},
            {label:"Gold — Min Referrals",     key:"goldRefs",     color:C.gold},
          ].map(f=>(
            <div key={f.key} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12,color:C.sub}}>{f.label}</span>
                <span style={{fontFamily:"JetBrains Mono",fontSize:13,fontWeight:700,color:f.color}}>{thresholds[f.key]}{f.key.includes("Earned")?"":""}</span>
              </div>
              <input type="number" value={thresholds[f.key]} onChange={e=>setThresholds(p=>({...p,[f.key]:+e.target.value}))} style={{fontFamily:"JetBrains Mono"}}/>
            </div>
          ))}
          <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>{saveSettings();logAction("Tier Thresholds Updated",`Silver: $${thresholds.silverEarned}/${thresholds.silverRefs} refs · Gold: $${thresholds.goldEarned}/${thresholds.goldRefs} refs`);}}>Save Thresholds</button>
        </Card>

        {/* Benefits per tier */}
        <Card style={{padding:"20px 22px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:16}}>⚡ Benefits Per Tier</div>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Task Reward Multiplier</div>
            {[{id:"bronze",label:"Bronze",color:"#cd7f32"},{id:"silver",label:"Silver",color:C.silver},{id:"gold",label:"Gold",color:C.gold}].map(t=>(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:t.color,flexShrink:0}}/>
                <span style={{fontSize:12,color:C.text,width:60}}>{t.label}</span>
                <div style={{flex:1}}><input type="range" min={100} max={200} value={mults[t.id]} onChange={e=>setMults(p=>({...p,[t.id]:+e.target.value}))}/></div>
                <span style={{fontFamily:"JetBrains Mono",fontSize:13,fontWeight:700,color:t.color,width:48,textAlign:"right"}}>×{(mults[t.id]/100).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Withdrawal Fee (%)</div>
            {[{id:"bronze",label:"Bronze",color:"#cd7f32"},{id:"silver",label:"Silver",color:C.silver},{id:"gold",label:"Gold",color:C.gold}].map(t=>(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:t.color,flexShrink:0}}/>
                <span style={{fontSize:12,color:C.text,width:60}}>{t.label}</span>
                <div style={{flex:1}}><input type="range" min={0} max={15} value={fees[t.id]} onChange={e=>setFees(p=>({...p,[t.id]:+e.target.value}))}/></div>
                <span style={{fontFamily:"JetBrains Mono",fontSize:13,fontWeight:700,color:t.color,width:36,textAlign:"right"}}>{fees[t.id]}%</span>
              </div>
            ))}
          </div>
          <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>{saveSettings();logAction("Tier Benefits Updated","Multipliers and fees saved");}}>Save Benefits</button>
        </Card>
      </div>

      {/* Users by tier table */}
      <Card>
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.div}`,fontSize:13,fontWeight:700,color:C.text}}>Users by Tier</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <THead cols={["User","Balance","Refs","Current Tier","Progress to Next"]} C={C}/>
            <tbody>{[...users].sort((a,b)=>(b.totalEarned||b.balance)-(a.totalEarned||a.balance)).map((u,i)=>{
              const earned=u.totalEarned||u.balance;
              const isGold=earned>=thresholds.goldEarned||u.refs>=thresholds.goldRefs;
              const isSilver=!isGold&&(earned>=thresholds.silverEarned||u.refs>=thresholds.silverRefs);
              const tierLabel=isGold?"Gold":isSilver?"Silver":"Bronze";
              const tierCol=isGold?C.gold:isSilver?C.silver:"#cd7f32";
              const nextPct=isGold?100:isSilver?Math.min(100,Math.round(earned/thresholds.goldEarned*100)):Math.min(100,Math.round(earned/thresholds.silverEarned*100));
              const nextLabel=isGold?"Max tier":isSilver?`$${thresholds.goldEarned-earned} to Gold`:`$${thresholds.silverEarned-earned} to Silver`;
              return(
                <tr key={i} style={{borderBottom:`1px solid ${C.div}`}}>
                  <td style={{padding:"11px 14px",fontWeight:700,color:C.text}}>{u.handle}</td>
                  <td style={{padding:"11px 14px"}}><span style={{fontFamily:"JetBrains Mono",color:C.success,fontWeight:700}}>{fmt(u.balance)}</span></td>
                  <td style={{padding:"11px 14px",color:C.sub}}>{u.refs}</td>
                  <td style={{padding:"11px 14px"}}><Badge label={tierLabel} color={tierCol} bg={tierCol+"22"}/></td>
                  <td style={{padding:"11px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{flex:1,height:3,background:C.panel,borderRadius:2,overflow:"hidden"}}><div style={{height:3,width:nextPct+"%",background:tierCol,borderRadius:2}}/></div>
                      <span style={{fontSize:10,color:C.sub,whiteSpace:"nowrap"}}>{nextLabel}</span>
                    </div>
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ── KYC VERIFICATION ── */
function PgKYC({C,users,setUsers,showToast,doConfirm,logAction}){
  const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,...style}}>{children}</div>;
  const [tab,setTab]=useState("pending");
  const [thresholds,setThresholds]=useState({phone:20,identity:100,fullKYC:500});

  // Simulate KYC data per user
  const kycData=users.map((u,i)=>({
    ...u,
    kycLevel: i===0?"full":i===1?"identity":i===2?"phone":i===5?"rejected":"none",
    kycSubmitted: i<3?"3/20/2026":null,
    idType: i===0?"Passport":i===1?"Driver's License":null,
    country: ["UK","US","CA","AU","NG","GH","--"][i]||"--",
  }));

  const pending=kycData.filter(u=>u.kycLevel==="none"&&u.balance>thresholds.phone);
  const review =kycData.filter(u=>u.kycLevel==="identity"||u.kycLevel==="phone");
  const verified=kycData.filter(u=>u.kycLevel==="full");
  const rejected=kycData.filter(u=>u.kycLevel==="rejected");

  const KycBadge=({level})=>{
    const m={full:["Verified","#2ed880"],identity:["ID Submitted","#f0952a"],phone:["Phone ✓","#adb1cc"],rejected:["Rejected","#ff4060"],none:["Unverified","#52556e"]};
    const [l,c]=m[level]||m.none;
    return <Badge label={l} color={c} bg={c+"22"}/>;
  };

  return(
    <div className="fade">
      <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:6}}>KYC Verification</div>
      <div style={{fontSize:12,color:C.sub,marginBottom:18}}>Identity verification for withdrawal compliance. Required at configurable thresholds.</div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        {[[verified.length,"Verified","#2ed880"],[review.length,"In Review","#f0952a"],[rejected.length,"Rejected","#ff4060"],[kycData.filter(u=>u.kycLevel==="none").length,"Unverified","#52556e"]].map(([v,l,c])=>(
          <Card key={l} style={{padding:"14px 16px"}}>
            <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>{l}</div>
            <div style={{fontSize:22,fontWeight:800,fontFamily:"JetBrains Mono",color:c}}>{v}</div>
          </Card>
        ))}
      </div>

      <div className="g2" style={{gap:14,marginBottom:14}}>
        {/* Threshold config */}
        <Card style={{padding:"18px 20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>🔐 Verification Thresholds</div>
          <div style={{background:C.panel,borderRadius:9,padding:"12px 14px",border:`1px solid ${C.div}`,marginBottom:14,fontSize:12,color:C.sub,lineHeight:1.7}}>
            Users must verify at the required level before withdrawals above each threshold are processed.
          </div>
          {[
            {label:"Phone SMS OTP required above",key:"phone",   color:C.silver, icon:"📱"},
            {label:"Government ID required above", key:"identity",color:C.gold,   icon:"🪪"},
            {label:"Selfie + ID required above",   key:"fullKYC", color:C.danger, icon:"🤳"},
          ].map(f=>(
            <div key={f.key} style={{marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:14}}>{f.icon}</span>
                <span style={{fontSize:12,color:C.sub,flex:1}}>{f.label}</span>
                <span style={{fontFamily:"JetBrains Mono",fontSize:13,fontWeight:700,color:f.color}}>${thresholds[f.key]}</span>
              </div>
              <input type="number" value={thresholds[f.key]} onChange={e=>setThresholds(p=>({...p,[f.key]:+e.target.value}))}/>
            </div>
          ))}
          <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>{logAction("KYC Thresholds Updated",`Phone:$${thresholds.phone} ID:$${thresholds.identity} Full:$${thresholds.fullKYC}`);showToast("KYC thresholds saved");}}>Save Thresholds</button>
        </Card>

        {/* Provider config */}
        <Card style={{padding:"18px 20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>🏢 Verification Method</div>
          {[
            {label:"Manual Review",    desc:"You manually review uploaded documents. Free but slow.",  active:true},
            {label:"Stripe Identity",  desc:"Automated ID verification. $1.50/check. Instant.",       active:false},
            {label:"Persona",          desc:"Enterprise KYC platform. Best for scale.",               active:false},
          ].map((p,i)=>(
            <div key={i} style={{padding:"12px 14px",background:p.active?C.success+"14":C.panel,border:`1px solid ${p.active?C.success+"44":C.div}`,borderRadius:9,marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:700,color:p.active?C.success:C.text}}>{p.label}</span>
                {p.active&&<Badge label="Active" color={C.success} bg={C.success+"22"}/>}
              </div>
              <div style={{fontSize:11,color:C.sub}}>{p.desc}</div>
            </div>
          ))}
          <div style={{fontSize:11,color:C.sub,marginTop:8}}>To switch providers, update your backend integration and API keys.</div>
        </Card>
      </div>

      {/* Review queue */}
      <Tabs tabs={[{id:"pending",label:`Pending Review (${review.length})`},{id:"verified",label:`Verified (${verified.length})`},{id:"rejected",label:`Rejected (${rejected.length})`},{id:"all",label:"All Users"}]} active={tab} set={setTab} C={C}/>
      <Card>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <THead cols={["User","Country","KYC Level","ID Type","Submitted","Actions"]} C={C}/>
            <tbody>{(tab==="pending"?review:tab==="verified"?verified:tab==="rejected"?rejected:kycData).map((u,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${C.div}`}}>
                <td style={{padding:"11px 14px"}}><div><div style={{fontWeight:700,color:C.text}}>{u.handle}</div><div style={{fontSize:11,color:C.sub}}>{u.email}</div></div></td>
                <td style={{padding:"11px 14px",color:C.sub}}>{u.country}</td>
                <td style={{padding:"11px 14px"}}><KycBadge level={u.kycLevel}/></td>
                <td style={{padding:"11px 14px",color:C.sub,fontSize:12}}>{u.idType||"—"}</td>
                <td style={{padding:"11px 14px",color:C.sub,fontSize:12}}>{u.kycSubmitted||"—"}</td>
                <td style={{padding:"11px 14px"}}>
                  <div style={{display:"flex",gap:6}}>
                    {(u.kycLevel==="identity"||u.kycLevel==="phone")&&<>
                      <button className="btn btn-success" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>doConfirm("Approve KYC",`Verify identity for ${u.handle}?`,()=>{if(setUsers)setUsers(p=>p.map(x=>x.id===u.id?{...x,kyc:"verified"}:x));logAction("KYC Approved",u.handle);showToast(`${u.handle} KYC verified ✓`);},false)}>✓ Verify</button>
                      <button className="btn btn-danger" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>doConfirm("Reject KYC",`Reject KYC for ${u.handle}?`,()=>{if(setUsers)setUsers(p=>p.map(x=>x.id===u.id?{...x,kyc:"rejected"}:x));if(setUsers)setUsers(p=>p.map(x=>x.id===u.id?{...x,kyc:'rejected'}:x));logAction("KYC Rejected",u.handle);showToast(`${u.handle} KYC rejected`,"error");})}>✕ Reject</button>
                    </>}
                    {u.kycLevel==="full"&&<button className="btn btn-ghost" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>doConfirm("Revoke KYC",`Revoke verified status for ${u.handle}?`,()=>{logAction("KYC Revoked",u.handle);showToast("KYC revoked","error");})}>↺ Revoke</button>}
                    {u.kycLevel==="none"&&<span style={{fontSize:11,color:C.muted}}>Not submitted</span>}
                    {u.kycLevel==="rejected"&&<button className="btn btn-ghost" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>{logAction("KYC Reset",u.handle);showToast("KYC reset — user can resubmit");}}>↺ Reset</button>}
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ── GIFT CARDS MANAGEMENT ── */
function PgGiftCards({C,users,showToast,doConfirm,logAction}){
  const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,...style}}>{children}</div>;
  const [gcTab,setGcTab]=useState("orders");
  const [fulfillId,setFulfillId]=useState(null);
  const [fulfillCode,setFulfillCode]=useState("");
  const [orders,setOrders]=useState([]);
  const [brands,setBrands]=useState([
    {id:"b1",name:"Amazon",     denoms:[5,10,25,50,100],status:"active"},
    {id:"b2",name:"Steam",      denoms:[5,10,20,50],    status:"active"},
    {id:"b3",name:"Netflix",    denoms:[15,30,60],      status:"active"},
    {id:"b4",name:"Google Play",denoms:[5,10,25],       status:"active"},
    {id:"b5",name:"Spotify",    denoms:[10,30,60],      status:"active"},
    {id:"b6",name:"Apple",      denoms:[5,10,25,50],    status:"active"},
    {id:"b7",name:"PlayStation",denoms:[10,20,50],      status:"out_of_stock"},
    {id:"b8",name:"Xbox",       denoms:[10,15,50],      status:"active"},
    {id:"b9",name:"Uber",       denoms:[5,10,25,50],    status:"active"},
  ]);

  const pending=orders.filter(o=>o.status==="pending");
  const sent=orders.filter(o=>o.status==="sent");
  const statusCol=s=>s==="sent"?C.success:s==="pending"?C.warn:C.danger;

  function fulfillOrder(id){
    setFulfillId(id);setFulfillCode("");
  }
  function confirmFulfill(){
    if(!fulfillCode.trim()){showToast("Enter a gift card code","error");return;}
    const o=orders.find(x=>x.id===fulfillId);
    setOrders(p=>p.map(x=>x.id===fulfillId?{...x,status:"sent",codeRef:fulfillCode.trim()}:x));
    logAction("GC Order Fulfilled",`${fulfillId} — Code sent to ${o&&o.email}`);
    showToast(`Gift card code sent to ${o&&o.user}`);
    setFulfillId(null);setFulfillCode("");
  }
  function rejectOrder(id){
    const o=orders.find(x=>x.id===id);
    doConfirm("Reject GC Order",`Reject and refund $${o&&o.amount} to ${o&&o.user}?`,()=>{
      setOrders(p=>p.map(x=>x.id===id?{...x,status:"rejected"}:x));
      logAction("GC Order Rejected",id);
      showToast("Order rejected","error");
    },true);
  }

  return(
    <div className="fade">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div style={{fontSize:16,fontWeight:800,color:C.text}}>Gift Cards</div>
        {pending.length>0&&<div style={{background:C.warn+"18",border:`1px solid ${C.warn}44`,borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700,color:C.warn}}>{pending.length} Pending</div>}
      </div>
      <div style={{fontSize:12,color:C.sub,marginBottom:14}}>Review and fulfill gift card orders. Send codes directly to users via email.</div>
      <Tabs tabs={[{id:"orders",label:`Orders (${orders.length})`},{id:"brands",label:"Brands"}]} active={gcTab} set={setGcTab} C={C}/>

      {gcTab==="orders"&&<div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
          {[[pending.length,"Pending",C.warn],[sent.length,"Fulfilled",C.success],[orders.filter(o=>o.status==="rejected").length,"Rejected",C.danger]].map(([v,l,c])=>(
            <Card key={l} style={{padding:"13px 16px"}}>
              <div style={{fontSize:22,fontWeight:800,fontFamily:"JetBrains Mono",color:c}}>{v}</div>
              <div style={{fontSize:10,color:C.sub,textTransform:"uppercase",letterSpacing:.8,marginTop:3}}>{l}</div>
            </Card>
          ))}
        </div>
        <Card><div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <THead cols={["Order","User","Brand","Amount","Date","Status","Actions"]} C={C}/>
            <tbody>
              {orders.map((o,i)=>(
                <tr key={i} style={{borderBottom:`1px solid ${C.div}`}}>
                  <td style={{padding:"10px 14px",fontFamily:"JetBrains Mono",fontSize:10,color:C.muted}}>{o.id}</td>
                  <td style={{padding:"10px 14px",fontWeight:700,color:C.text}}>{o.user}</td>
                  <td style={{padding:"10px 14px",color:C.sub}}>{o.brand} {o.type}</td>
                  <td style={{padding:"10px 14px",fontFamily:"JetBrains Mono",fontWeight:700,color:C.success}}>${o.amount}</td>
                  <td style={{padding:"10px 14px",fontSize:11,color:C.muted}}>{o.date}</td>
                  <td style={{padding:"10px 14px"}}>
                    <span style={{fontWeight:700,color:statusCol(o.status),fontSize:11,textTransform:"capitalize"}}>{o.status}</span>
                    {o.codeRef&&<div style={{fontSize:9,color:C.muted,fontFamily:"JetBrains Mono",marginTop:2}}>{o.codeRef}</div>}
                  </td>
                  <td style={{padding:"10px 14px"}}>
                    {o.status==="pending"&&<div style={{display:"flex",gap:6}}>
                      <button className="btn btn-success" style={{fontSize:10,padding:"3px 8px"}} onClick={()=>{setFulfillId(o.id);setFulfillCode("");}}>Send Code</button>
                      <button className="btn btn-danger"  style={{fontSize:10,padding:"3px 8px"}} onClick={()=>rejectOrder(o.id)}>Reject</button>
                    </div>}
                    {o.status==="sent"&&<span style={{fontSize:11,color:C.success}}>✓ Fulfilled</span>}
                    {o.status==="rejected"&&<span style={{fontSize:11,color:C.danger}}>✗ Rejected</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></Card>
      </div>}

      {gcTab==="brands"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
        {brands.map(b=>(
          <Card key={b.id} style={{padding:"14px 18px"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>{b.name}</div>
                <div style={{fontSize:11,color:C.sub}}>Denominations: {b.denoms.map(d=>"$"+d).join(", ")}</div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:11,fontWeight:700,color:b.status==="active"?C.success:C.warn}}>{b.status==="active"?"Active":"Out of Stock"}</span>
                <button onClick={()=>{setBrands(p=>p.map(x=>x.id===b.id?{...x,status:x.status==="active"?"out_of_stock":"active"}:x));logAction("Brand Status",b.name+" → "+(b.status==="active"?"OOS":"active"));}} style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 10px",cursor:"pointer",color:C.sub,fontSize:11,fontFamily:"Outfit",fontWeight:600}}>
                  {b.status==="active"?"Mark OOS":"Restock"}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>}
      {/* Fulfill modal */}
      {fulfillId&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:C.surf,borderRadius:16,padding:"24px",width:"100%",maxWidth:420,border:"1px solid "+C.border}}>
          <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:4}}>Send Gift Card Code</div>
          {orders.filter(function(x){return x.id===fulfillId;}).map(function(o){return(
            <div key={o.id}>
              <div style={{fontSize:12,color:C.sub,marginBottom:14}}>Order: {fulfillId} · {o.brand} ${o.amount} · To: {o.user} ({o.email})</div>
              <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:6}}>Gift Card Code</div>
              <input value={fulfillCode} onChange={function(e){setFulfillCode(e.target.value);}} placeholder="e.g. XXXX-XXXX-XXXX-XXXX" style={{marginBottom:14,fontFamily:"JetBrains Mono"}}/>
              <div style={{display:"flex",gap:10}}>
                <button className="btn btn-success" style={{flex:1}} onClick={confirmFulfill}>Send Code to User</button>
                <button className="btn btn-ghost" style={{flex:1}} onClick={function(){setFulfillId(null);}}>Cancel</button>
              </div>
            </div>
          );})}
        </div>
      </div>}
    </div>
  );
}


function PgWithdrawalMethods({C,showToast,doConfirm,logAction,saveSettings}){
  const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,...style}}>{children}</div>;
  const [methods,setMethods]=useState([
    {id:"paypal",  name:"PayPal",   icon:"🅿",  enabled:true,  minWD:5,  maxWD:500, fee:2, processingDays:1, currencies:["USD","GBP","EUR"]},
    {id:"wise",    name:"Wise",     icon:"🌍",  enabled:true,  minWD:10, maxWD:1000,fee:1, processingDays:1, currencies:["USD","GBP","EUR","NGN","GHS"]},
    {id:"btc",     name:"Bitcoin",  icon:"₿",   enabled:false, minWD:20, maxWD:5000,fee:0, processingDays:1, currencies:["BTC"]},
    {id:"giftcard",name:"Gift Cards",icon:"🎁", enabled:true,  minWD:5,  maxWD:200, fee:0, processingDays:0, currencies:["USD"]},
  ]);
  const [editing,setEditing]=useState(null);
  const [globalMin,setGlobalMin]=useState(5);
  const [holdDays,setHoldDays]=useState(3);

  return(
    <div className="fade">
      <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:6}}>Withdrawal Methods</div>
      <div style={{fontSize:12,color:C.sub,marginBottom:18}}>Configure payout providers, fees, limits and processing rules.</div>

      <div className="g2" style={{gap:14,marginBottom:18}}>
        <Card style={{padding:"18px 20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>⚙ Global Rules</div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:C.sub,marginBottom:6}}>Global minimum withdrawal ($)</div>
            <input type="number" value={globalMin} onChange={e=>setGlobalMin(+e.target.value)} style={{fontFamily:"JetBrains Mono"}}/>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:C.sub,marginBottom:6}}>New account hold period (days)</div>
            <input type="number" value={holdDays} onChange={e=>setHoldDays(+e.target.value)} style={{fontFamily:"JetBrains Mono"}}/>
            <div style={{fontSize:10,color:C.muted,marginTop:4}}>New users must wait this many days before their first withdrawal.</div>
          </div>
          <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>{logAction("Withdrawal Rules Updated",`Min:$${globalMin} Hold:${holdDays}d`);saveSettings();}}>Save Rules</button>
        </Card>
        <Card style={{padding:"18px 20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>📊 This Month</div>
          {[["Total Paid Out",fmt(870),"#2ed880"],["Pending Approvals",fmt(80),"#f0952a"],["Avg Processing Time","1.2 days",C.silver],["Most Used Method","PayPal",C.chrome]].map(([l,v,c])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:10,fontSize:13}}>
              <span style={{color:C.sub}}>{l}</span>
              <span style={{color:c,fontWeight:700,fontFamily:"JetBrains Mono"}}>{v}</span>
            </div>
          ))}
        </Card>
      </div>

      {methods.map(m=>{
        const isE=editing===m.id;
        return(
          <Card key={m.id} style={{padding:"18px 20px",marginBottom:12,borderLeft:`3px solid ${m.enabled?C.success:C.muted}`}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:isE?16:0}}>
              <div style={{width:40,height:40,borderRadius:10,background:C.panel,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,border:"1px solid "+C.border}}>{m.icon}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:3}}>
                  <span style={{fontSize:14,fontWeight:800,color:C.text}}>{m.name}</span>
                  <StatusBadge s={m.enabled?"active":"inactive"}/>
                </div>
                <div style={{fontSize:11,color:C.sub}}>Min ${m.minWD} · Max ${m.maxWD} · {m.fee}% fee · {m.processingDays===0?"Instant":m.processingDays+"d processing"}</div>
              </div>
              <div style={{display:"flex",gap:7,flexShrink:0}}>
                <button className="btn btn-ghost" style={{fontSize:11}} onClick={()=>setEditing(isE?null:m.id)}>{isE?"✓ Done":"✎ Edit"}</button>
                <button className={`btn ${m.enabled?"btn-warn":"btn-success"}`} style={{fontSize:11}} onClick={()=>{setMethods(p=>p.map(x=>x.id===m.id?{...x,enabled:!x.enabled}:x));logAction("Payment Method Toggled",`${m.name} ${m.enabled?"disabled":"enabled"}`);showToast(`${m.name} ${m.enabled?"disabled":"enabled"}`);}}>{m.enabled?"Disable":"Enable"}</button>
              </div>
            </div>
            {isE&&<div className="g2" style={{gap:10}}>
              {[["Min Withdrawal ($)","minWD"],["Max Withdrawal ($)","maxWD"],["Fee (%)","fee"],["Processing (days)","processingDays"]].map(([l,k])=>(
                <div key={k}>
                  <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.4,marginBottom:5}}>{l}</div>
                  <input type="number" value={m[k]} onChange={e=>setMethods(p=>p.map(x=>x.id===m.id?{...x,[k]:+e.target.value}:x))} style={{fontFamily:"JetBrains Mono"}}/>
                </div>
              ))}
              <div style={{gridColumn:"1/-1"}}>
                <button className="btn btn-primary" onClick={()=>{logAction("Payment Method Updated",m.name);showToast("Saved");setEditing(null);}}>Save {m.name}</button>
              </div>
            </div>}
          </Card>
        );
      })}
    </div>
  );
}

/* ── POSTBACK LOG ── */
function PgPostbackLog({C,ows,users,showToast,doConfirm,logAction}){
  const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,...style}}>{children}</div>;
  const [filter,setFilter]=useState("all");

  const postbacks=[];

  const filtered=filter==="all"?postbacks:postbacks.filter(p=>p.status===filter);
  const statColor={credited:C.success,duplicate:C.danger,failed:C.danger,pending:C.warn};

  return(
    <div className="fade">
      <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:6}}>Postback Log</div>
      <div style={{background:C.warn+"14",border:`1px solid ${C.warn}44`,borderRadius:8,padding:"10px 14px",marginBottom:12,fontSize:11,color:C.warn}}>⚠ Production: All postbacks must be verified by HMAC signature + conversion_id idempotency check before crediting users.</div>
      <div style={{fontSize:12,color:C.sub,marginBottom:18}}>Every offerwall completion event received. Duplicates and invalid signatures are flagged automatically.</div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        {[
          [postbacks.filter(p=>p.status==="credited").length, "Credited",  C.success],
          [postbacks.filter(p=>p.status==="pending").length,  "Pending",   C.warn],
          [postbacks.filter(p=>p.status==="duplicate").length,"Duplicates",C.danger],
          [postbacks.filter(p=>p.status==="failed").length,   "Failed",    C.danger],
        ].map(([v,l,c])=>(
          <Card key={l} style={{padding:"14px 16px",cursor:"pointer"}} onClick={()=>setFilter(l.toLowerCase())}>
            <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>{l}</div>
            <div style={{fontSize:22,fontWeight:800,fontFamily:"JetBrains Mono",color:c}}>{v}</div>
          </Card>
        ))}
      </div>

      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {["all","credited","pending","duplicate","failed"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?C.panel:"none",border:`1px solid ${filter===f?C.border:"transparent"}`,cursor:"pointer",padding:"6px 14px",borderRadius:8,fontFamily:"Outfit",fontSize:11,fontWeight:700,letterSpacing:.8,textTransform:"uppercase",color:filter===f?C.chrome:C.sub,transition:"all .18s"}}>{f}</button>
        ))}
        <button className="btn btn-ghost" style={{fontSize:11,marginLeft:"auto"}} onClick={()=>showToast("Export — connect backend first","error")}>⤓ Export</button>
      </div>

      <Card><div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <THead cols={["ID","Provider","User","Offer","Reward","Status","Signature","Time","Actions"]} C={C}/>
          <tbody>{filtered.map((p,i)=>(
            <tr key={i} style={{borderBottom:`1px solid ${C.div}`,background:p.status==="duplicate"||p.status==="failed"?C.danger+"08":"transparent"}}>
              <td style={{padding:"10px 14px"}}><code style={{fontSize:10,fontFamily:"JetBrains Mono",color:C.sub}}>{p.id}</code></td>
              <td style={{padding:"10px 14px"}}><Badge label={p.provider} color={C.silver} bg={C.silver+"18"}/></td>
              <td style={{padding:"10px 14px",fontWeight:700,color:C.text}}>{p.user}</td>
              <td style={{padding:"10px 14px",color:C.sub,fontSize:12}}>{p.offer}</td>
              <td style={{padding:"10px 14px"}}><span style={{fontFamily:"JetBrains Mono",color:C.success,fontWeight:700}}>{fmt(p.reward)}</span></td>
              <td style={{padding:"10px 14px"}}><Badge label={p.status} color={statColor[p.status]||C.sub} bg={(statColor[p.status]||C.sub)+"22"}/></td>
              <td style={{padding:"10px 14px"}}><Badge label={p.sig} color={p.sig==="valid"?C.success:C.danger} bg={p.sig==="valid"?C.success+"22":C.danger+"22"}/></td>
              <td style={{padding:"10px 14px",color:C.muted,fontSize:11,whiteSpace:"nowrap"}}>{p.ts}</td>
              <td style={{padding:"10px 14px"}}>
                {p.status==="pending"&&<button className="btn btn-success" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>doConfirm("Manual Credit",`Manually credit ${fmt(p.reward)} to ${p.user}?`,()=>{logAction("Manual Credit",`${p.user} ${fmt(p.reward)} from ${p.provider}`);showToast("Manually credited");},false)}>Credit</button>}
                {(p.status==="duplicate"||p.status==="failed")&&<button className="btn btn-ghost" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>doConfirm("Retry Postback",`Retry and credit ${p.user}?`,()=>{logAction("Postback Retried",`${p.id} for ${p.user}`);showToast("Retried & credited");},false)}>Retry</button>}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div></Card>
    </div>
  );
}

/* ── SUPPORT / TICKETS ── */
function PgSupport({C,users,showToast,doConfirm,logAction}){
  const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,...style}}>{children}</div>;
  const [tab,setTab]=useState("open");
  const [selected,setSelected]=useState(null);
  const [reply,setReply]=useState("");

  const [tickets,setTickets]=useState([]);

  const priorityColor={high:C.danger,medium:C.warn,low:C.sub};
  const categoryLabel={missing_reward:"Missing Reward",account:"Account Issue",referral:"Referral",ban_appeal:"Ban Appeal"};
  const open=tickets.filter(t=>t.status==="open");
  const closed=tickets.filter(t=>t.status==="closed");
  const shown=tab==="open"?open:closed;

  if(selected){
    const t=selected;
    return(
      <div className="fade">
        <button className="btn btn-ghost" style={{marginBottom:14}} onClick={()=>{setSelected(null);setReply("");}}>← Back to Tickets</button>
        <div className="g2" style={{gap:14,alignItems:"start"}}>
          <div>
            <Card style={{padding:"18px 20px",marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:C.sub,marginBottom:4}}>{t.id} · {categoryLabel[t.category]}</div>
              <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:10}}>{t.subject}</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                <Badge label={t.status} color={t.status==="open"?C.warn:C.sub} bg={t.status==="open"?C.warn+"22":C.sub+"22"}/>
                <Badge label={t.priority+" priority"} color={priorityColor[t.priority]} bg={priorityColor[t.priority]+"22"}/>
              </div>
              {[["User",t.user],["Email",t.email],["Opened",t.created]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:12}}><span style={{color:C.sub}}>{l}</span><span style={{color:C.text,fontWeight:600}}>{v}</span></div>
              ))}
            </Card>
            {t.status==="open"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
              <button className="btn btn-success" style={{textAlign:"left"}} onClick={()=>doConfirm("Close Ticket",`Mark ticket ${t.id} as resolved?`,()=>{setTickets(p=>p.map(x=>x.id===t.id?{...x,status:"closed"}:x));logAction("Ticket Closed",t.id);showToast("Ticket closed");setSelected(null);},false)}>✓ Mark Resolved</button>
              <button className="btn btn-warn" style={{textAlign:"left"}} onClick={()=>showToast("Escalation — connect support system","error")}>↑ Escalate</button>
            </div>}
          </div>
          <div>
            <Card style={{padding:"18px 20px"}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Conversation</div>
              <div style={{maxHeight:320,overflowY:"auto",marginBottom:14}}>
                {t.messages.map((m,i)=>(
                  <div key={i} style={{marginBottom:12,display:"flex",flexDirection:"column",alignItems:m.from==="admin"?"flex-end":"flex-start"}}>
                    <div style={{background:m.from==="admin"?C.silver+"22":C.panel,border:`1px solid ${m.from==="admin"?C.silver+"44":C.div}`,borderRadius:10,padding:"10px 13px",maxWidth:"85%"}}>
                      <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{m.from==="admin"?"You (Admin)":t.user} · {m.ts}</div>
                      <div style={{fontSize:13,color:C.text,lineHeight:1.6}}>{m.text}</div>
                    </div>
                  </div>
                ))}
              </div>
              {t.status==="open"&&<>
                <textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder="Type your reply…" style={{minHeight:80,resize:"vertical",marginBottom:10}}/>
                <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>{if(!reply.trim()){showToast("Write a reply first","error");return;}setTickets(p=>p.map(x=>x.id===t.id?{...x,messages:[...x.messages,{from:"admin",text:reply,ts:new Date().toLocaleString()}]}:x));setSelected(p=>({...p,messages:[...p.messages,{from:"admin",text:reply,ts:new Date().toLocaleString()}]}));logAction("Ticket Reply",`${t.id} — ${t.user}`);showToast("Reply sent");setReply("");}}>Send Reply</button>
              </>}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div className="fade">
      <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:6}}>Support & Tickets</div>
      <div style={{fontSize:12,color:C.sub,marginBottom:18}}>User support requests, disputes and ban appeals.</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        {[[open.length,"Open","#f0952a"],[closed.length,"Closed",C.sub],[open.filter(t=>t.priority==="high").length,"High Priority",C.danger],[tickets.filter(t=>t.category==="ban_appeal").length,"Ban Appeals",C.silver]].map(([v,l,c])=>(
          <Card key={l} style={{padding:"14px 16px"}}>
            <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>{l}</div>
            <div style={{fontSize:22,fontWeight:800,fontFamily:"JetBrains Mono",color:c}}>{v}</div>
          </Card>
        ))}
      </div>
      <Tabs tabs={[{id:"open",label:`Open (${open.length})`},{id:"closed",label:`Closed (${closed.length})`}]} active={tab} set={setTab} C={C}/>
      <Card>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <THead cols={["ID","User","Subject","Category","Priority","Opened","Action"]} C={C}/>
            <tbody>{shown.map((t,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${C.div}`,cursor:"pointer"}} onClick={()=>setSelected(t)}>
                <td style={{padding:"11px 14px"}}><code style={{fontSize:11,fontFamily:"JetBrains Mono",color:C.sub}}>{t.id}</code></td>
                <td style={{padding:"11px 14px",fontWeight:700,color:C.text}}>{t.user}</td>
                <td style={{padding:"11px 14px",color:C.sub,fontSize:12,maxWidth:200}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.subject}</div></td>
                <td style={{padding:"11px 14px"}}><Badge label={categoryLabel[t.category]} color={C.silver} bg={C.silver+"18"}/></td>
                <td style={{padding:"11px 14px"}}><Badge label={t.priority} color={priorityColor[t.priority]} bg={priorityColor[t.priority]+"22"}/></td>
                <td style={{padding:"11px 14px",color:C.sub,fontSize:12}}>{t.created}</td>
                <td style={{padding:"11px 14px"}}><button className="btn btn-ghost" style={{fontSize:11,padding:"4px 10px"}} onClick={e=>{e.stopPropagation();setSelected(t);}}>Open →</button></td>
              </tr>
            ))}</tbody>
          </table>
          {shown.length===0&&<div style={{textAlign:"center",padding:"32px",color:C.sub,fontSize:13}}>No {tab} tickets.</div>}
        </div>
      </Card>
    </div>
  );
}


/* ── ADMIN PROFILE ── */
function PgTasks({C,showToast,logAction,doConfirm}){
  const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,...style}}>{children}</div>;

  const [tasks,setTasks]=useState([
    {id:"tk1",title:"Follow Cosmo on X",cat:"social",company:"Cosmo",reward:0.50,time:"1 min",diff:"Easy",slots:null,expires:null,status:"active",completed:1247,created:"Apr 1, 2026",url:"https://x.com/CosmoEarn",urlLabel:"Open X Profile"},
    {id:"tk2",title:"Join Cosmo Discord",cat:"social",company:"Cosmo",reward:0.75,time:"2 min",diff:"Easy",slots:null,expires:null,status:"active",completed:988,created:"Apr 1, 2026",url:"https://discord.gg/cosmo",urlLabel:"Join Discord"},
    {id:"tk3",title:"Rate the App — 5 Stars",cat:"review",company:"Cosmo",reward:1.50,time:"2 min",diff:"Easy",slots:null,expires:null,status:"active",completed:2103,created:"Apr 1, 2026",url:"https://play.google.com/store/apps/cosmo",urlLabel:"Rate on Play Store"},
    {id:"tk4",title:"Complete Your Profile",cat:"profile",company:"Cosmo",reward:0.25,time:"3 min",diff:"Easy",slots:null,expires:null,status:"active",completed:3412,created:"Apr 1, 2026",url:"",urlLabel:"In-App"},
    {id:"tk5",title:"Write a Product Review — BuyPower NG",cat:"review",company:"BuyPower NG",reward:3.50,time:"10 min",diff:"Medium",slots:50,expires:"Apr 30, 2026",status:"active",completed:12,created:"Apr 10, 2026",url:"https://buypower.ng",urlLabel:"Visit BuyPower NG"},
    {id:"tk6",title:"Sign Up & Verify — PiggyVest",cat:"signup",company:"PiggyVest",reward:5.00,time:"5 min",diff:"Easy",slots:200,expires:"May 15, 2026",status:"active",completed:67,created:"Apr 8, 2026",url:"https://piggyvest.com/register",urlLabel:"Sign Up on PiggyVest"},
    {id:"tk7",title:"Beta Test — New Feature Drop",cat:"beta",company:"Cosmo",reward:2.00,time:"15 min",diff:"Medium",slots:25,expires:"Apr 18, 2026",status:"active",completed:8,created:"Apr 15, 2026",url:"https://beta.cosmo.app",urlLabel:"Open Beta Link"},
    {id:"tk8",title:"Refer a Business Owner",cat:"referral",company:"Cosmo",reward:10.00,time:"Open",diff:"Hard",slots:null,expires:null,status:"active",completed:34,created:"Apr 1, 2026",url:"",urlLabel:"Share referral link"},
  ]);

  const [showForm,setShowForm]=useState(false);
  const [editTask,setEditTask]=useState(null);
  const [form,setForm]=useState({title:"",cat:"social",company:"Cosmo",reward:0,time:"5 min",diff:"Easy",slots:"",expires:"",status:"active",url:"",urlLabel:""});
  const [filter,setFilter]=useState("all");

  const CATS=["all","social","review","signup","profile","beta","referral"];
  const filtered=filter==="all"?tasks:tasks.filter(t=>t.cat===filter);
  const totalPaid=tasks.reduce((a,t)=>a+(t.completed*t.reward),0);

  function openNew(){setForm({title:"",cat:"social",company:"Cosmo",reward:0,time:"5 min",diff:"Easy",slots:"",expires:"",status:"active"});setEditTask(null);setShowForm(true);}
  function openEdit(t){setForm({...t,slots:t.slots||"",expires:t.expires||"",url:t.url||"",urlLabel:t.urlLabel||""});setEditTask(t.id);setShowForm(true);}
  function saveTask(){
    if(!form.title.trim()){showToast("Task title required","error");return;}
    if(editTask){
      setTasks(p=>p.map(t=>t.id===editTask?{...t,...form,slots:form.slots?+form.slots:null,expires:form.expires||null}:t));
      logAction("Task Updated",form.title);showToast("Task updated");
    } else {
      const newT={...form,id:"tk"+Date.now(),slots:form.slots?+form.slots:null,expires:form.expires||null,completed:0,created:new Date().toLocaleDateString()};
      setTasks(p=>[newT,...p]);
      logAction("Task Created",form.title);showToast("Task created");
    }
    setShowForm(false);
  }
  function toggleStatus(t){
    const next=t.status==="active"?"paused":"active";
    doConfirm(next==="active"?"Activate Task":"Pause Task",`${next==="active"?"Users will see and can complete":"Users will no longer see"} "${t.title}".`,()=>{
      setTasks(p=>p.map(x=>x.id===t.id?{...x,status:next}:x));
      logAction(next==="active"?"Task Activated":"Task Paused",t.title);
      showToast(`Task ${next}`);
    },next==="paused");
  }
  function deleteTask(t){
    doConfirm("Delete Task",`Permanently delete "${t.title}"? This cannot be undone.`,()=>{
      setTasks(p=>p.filter(x=>x.id!==t.id));
      logAction("Task Deleted",t.title);showToast("Task deleted","error");
    },true);
  }

  const diffCol=d=>d==="Easy"?"#2ed880":d==="Medium"?"#f0952a":"#ff4060";

  return(
    <div className="fade">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div style={{fontSize:16,fontWeight:800,color:C.text}}>Cosmo Tasks</div>
        <button className="btn btn-primary" style={{fontSize:12}} onClick={openNew}>+ New Task</button>
      </div>
      <div style={{fontSize:12,color:C.sub,marginBottom:16}}>Manage curated tasks from Cosmo and brand partners. Separate from offerwalls.</div>

      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
        {[
          ["Total Tasks",tasks.length,"◫"],
          ["Active",tasks.filter(t=>t.status==="active").length,"◎"],
          ["Total Completions",tasks.reduce((a,t)=>a+t.completed,0).toLocaleString(),"◈"],
          ["Total Paid Out","$"+totalPaid.toFixed(2),"$"],
        ].map(function(s){return(
          <Card key={s[0]} style={{padding:"14px 16px"}}>
            <div style={{fontSize:18,color:C.silver,marginBottom:6}}>{s[2]}</div>
            <div style={{fontSize:20,fontWeight:800,fontFamily:"JetBrains Mono",color:C.text}}>{s[1]}</div>
            <div style={{fontSize:10,color:C.sub,textTransform:"uppercase",letterSpacing:.8,marginTop:3}}>{s[0]}</div>
          </Card>
        );})}
      </div>

      {/* Filter pills */}
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        {CATS.map(k=><button key={k} onClick={()=>setFilter(k)} style={{background:filter===k?C.silver:"transparent",color:filter===k?C.bg:C.sub,border:`1px solid ${filter===k?"transparent":C.border}`,borderRadius:20,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"Outfit",textTransform:"capitalize"}}>{k}</button>)}
      </div>

      {/* Task list */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map(function(t){
          return(
            <Card key={t.id} style={{padding:"14px 18px"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:5}}>
                    <span style={{fontSize:14,fontWeight:700,color:t.status==="active"?C.text:C.sub}}>{t.title}</span>
                    <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:10,background:t.status==="active"?C.success+"18":C.danger+"18",color:t.status==="active"?C.success:C.danger,textTransform:"uppercase"}}>{t.status}</span>
                    <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:10,background:diffCol(t.diff)+"18",color:diffCol(t.diff)}}>{t.diff}</span>
                  </div>
                  <div style={{display:"flex",gap:16,fontSize:11,color:C.sub,flexWrap:"wrap"}}>
                    <span>Company: <b style={{color:C.silver}}>{t.company}</b></span>
                    <span>Category: <b style={{color:C.silver,textTransform:"capitalize"}}>{t.cat}</b></span>
                    <span>Reward: <b style={{color:C.success,fontFamily:"JetBrains Mono"}}>${t.reward.toFixed(2)}</b></span>
                    <span>Time: <b style={{color:C.silver}}>{t.time}</b></span>
                    <span>Completions: <b style={{color:C.chrome}}>{t.completed.toLocaleString()}</b></span>
                    {t.url?<span>Link: <a href={t.url} target="_blank" rel="noopener noreferrer" style={{color:C.silver,textDecoration:"underline"}}>{t.urlLabel||t.url}</a></span>:<span style={{color:C.muted}}>No URL set</span>}
                    {t.slots&&<span>Slots: <b style={{color:C.warn}}>{t.slots-t.completed} left / {t.slots}</b></span>}
                    {t.expires&&<span>Expires: <b style={{color:C.warn}}>{t.expires}</b></span>}
                  </div>
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <button onClick={()=>openEdit(t)} style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",color:C.silver,fontSize:11,fontFamily:"Outfit",fontWeight:600}}>Edit</button>
                  <button onClick={()=>toggleStatus(t)} style={{background:t.status==="active"?C.warn+"18":"#2ed88018",border:`1px solid ${t.status==="active"?C.warn+"44":"#2ed88044"}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",color:t.status==="active"?C.warn:C.success,fontSize:11,fontFamily:"Outfit",fontWeight:600}}>
                    {t.status==="active"?"Pause":"Activate"}
                  </button>
                  <button onClick={()=>deleteTask(t)} style={{background:C.danger+"18",border:`1px solid ${C.danger}44`,borderRadius:8,padding:"6px 12px",cursor:"pointer",color:C.danger,fontSize:11,fontFamily:"Outfit",fontWeight:600}}>Delete</button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit modal */}
      {showForm&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:C.surf,borderRadius:18,padding:"24px",width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",border:"1px solid "+C.border}}>
          <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:16}}>{editTask?"Edit Task":"Create New Task"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            {[["Task Title","text","title","2"],["Company / Brand","text","company","1"],["Time Estimate","text","time","1"],["Reward ($)","number","reward","1"],["Slots (blank = unlimited)","number","slots","1"],["Expires (date)","date","expires","1"],["Task URL (link shown to user)","text","url","2"],["URL Button Label","text","urlLabel","1"]].map(function(f){
              return(
                <div key={f[2]} style={{gridColumn:"span "+f[3]}}>
                  <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>{f[0]}</div>
                  <input type={f[1]} value={form[f[2]]||""} onChange={e=>setForm(p=>({...p,[f[2]]:e.target.value}))} style={{marginBottom:0}} placeholder={f[2]==="url"?"https://...":f[2]==="urlLabel"?"e.g. Open X Profile":""}/>
                </div>
              );
            })}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
            {[["Category","cat",["social","review","signup","profile","beta","referral"]],["Difficulty","diff",["Easy","Medium","Hard"]],["Status","status",["active","paused"]]].map(function(f){
              return(
                <div key={f[1]}>
                  <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>{f[0]}</div>
                  <select value={form[f[1]]} onChange={e=>setForm(p=>({...p,[f[1]]:e.target.value}))} style={{marginBottom:0,width:"100%"}}>
                    {f[2].map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button className="btn btn-primary" style={{flex:1}} onClick={saveTask}>Save Task</button>
            <button className="btn" style={{flex:1,background:C.panel,color:C.sub,border:"1px solid "+C.border}} onClick={()=>setShowForm(false)}>Cancel</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

function PgAdminProfile({C,adminEmail,setAdminEmail,showToast,doConfirm,logAction,doLogout}){
  const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,...style}}>{children}</div>;
  const [newEmail,setNewEmail]=useState(adminEmail);
  const [curPass,setCurPass]=useState("");
  const [newPass,setNewPass]=useState("");
  const [confirmPass,setConfirmPass]=useState("");
  const [showCur,setShowCur]=useState(false);
  const [showNew,setShowNew]=useState(false);
  const [twoFA,setTwoFA]=useState(false);
  const [sessions]=useState([
    {device:"iPhone 14 Pro",browser:"Safari",ip:"192.168.1.1",  last:"Now",        current:true},
    {device:"MacBook Pro",  browser:"Chrome", ip:"192.168.1.10", last:"2h ago",     current:false},
    {device:"Windows PC",   browser:"Edge",   ip:"192.168.1.22", last:"Yesterday",  current:false},
  ]);

  const saveEmail=()=>{
    if(!newEmail.includes("@")){showToast("Enter a valid email","error");return;}
    if(newEmail===adminEmail){showToast("That's already your email","error");return;}
    doConfirm("Change Email",`Change admin email to ${newEmail}?`,()=>{
      setAdminEmail(newEmail);
      logAction("Admin Email Changed",`→ ${newEmail}`);
      showToast("Email updated");
    },false);
  };

  const savePassword=()=>{
    if(!curPass){showToast("Enter your current password","error");return;}
    if(newPass.length<8){showToast("New password must be 8+ characters","error");return;}
    if(newPass!==confirmPass){showToast("Passwords don't match","error");return;}
    if(curPass!=="admin"){showToast("Current password incorrect","error");return;}
    doConfirm("Change Password","Update your admin password?",()=>{
      logAction("Admin Password Changed","Password updated");
      showToast("Password changed — use it next login");
      setCurPass(""); setNewPass(""); setConfirmPass("");
    },false);
  };

  const strength=newPass.length===0?0:newPass.length<6?1:newPass.length<8?2:newPass.length<12?3:4;
  const strengthLabel=["","Weak","Fair","Good","Strong"];
  const strengthColor=["",C.danger,C.warn,C.gold,C.success];

  return(
    <div className="fade">
      <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:16}}>My Profile</div>

      <div className="g2" style={{gap:14,marginBottom:14}}>
        {/* Account info */}
        <Card style={{padding:"20px 22px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:16}}>⊙ Account Details</div>
          {/* Avatar */}
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
            <div style={{width:56,height:56,borderRadius:14,overflow:"hidden",border:`1.5px solid ${C.border}`,flexShrink:0}}>
              <img src={LOGO} alt="Admin" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:800,color:C.text}}>Cosmo Admin</div>
              <div style={{fontSize:12,color:C.sub,marginTop:2}}>{adminEmail}</div>
              <div style={{marginTop:6}}><Badge label="Super Admin" color={C.gold} bg={C.gold+"22"}/></div>
            </div>
          </div>

          <div style={{marginBottom:14}}>
            <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.4,marginBottom:6}}>Email Address</div>
            <div style={{display:"flex",gap:8}}>
              <input value={newEmail} onChange={e=>setNewEmail(e.target.value)} type="email" style={{flex:1}}/>
              <button className="btn btn-primary" style={{flexShrink:0}} onClick={saveEmail}>Save</button>
            </div>
          </div>

          <div style={{height:1,background:C.div,margin:"16px 0"}}/>

          <div style={{marginBottom:10}}>
            <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.4,marginBottom:5}}>Role</div>
            <div style={{fontSize:13,color:C.text,fontWeight:600}}>Super Administrator</div>
            <div style={{fontSize:11,color:C.sub,marginTop:2}}>Full access to all admin features</div>
          </div>

          <div style={{marginBottom:0}}>
            <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.4,marginBottom:5}}>Member Since</div>
            <div style={{fontSize:13,color:C.text,fontWeight:600}}>January 5, 2024</div>
          </div>
        </Card>

        {/* Change password */}
        <Card style={{padding:"20px 22px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:16}}>◈ Change Password</div>
          {[
            {label:"Current Password",val:curPass,set:setCurPass,show:showCur,toggle:()=>setShowCur(p=>!p)},
            {label:"New Password",    val:newPass,set:setNewPass,show:showNew,toggle:()=>setShowNew(p=>!p)},
            {label:"Confirm New",     val:confirmPass,set:setConfirmPass,show:showNew,toggle:()=>setShowNew(p=>!p)},
          ].map((f,i)=>(
            <div key={i} style={{marginBottom:12}}>
              <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.4,marginBottom:5}}>{f.label}</div>
              <div style={{position:"relative"}}>
                <input type={f.show?"text":"password"} value={f.val} onChange={e=>f.set(e.target.value)} placeholder="••••••••" style={{paddingRight:44}}/>
                <button onClick={f.toggle} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.sub,fontSize:14,padding:0}}>{f.show?"●":"○"}</button>
              </div>
              {i===1&&newPass.length>0&&<>
                <div style={{display:"flex",gap:3,marginTop:6}}>
                  {[1,2,3,4].map(s=><div key={s} style={{flex:1,height:2,borderRadius:1,background:strength>=s?strengthColor[strength]:C.muted,transition:"background .3s"}}/>)}
                </div>
                <div style={{fontSize:10,color:strengthColor[strength],marginTop:3,fontWeight:600}}>{strengthLabel[strength]}</div>
              </>}
            </div>
          ))}
          {newPass&&confirmPass&&newPass!==confirmPass&&<div style={{fontSize:11,color:C.danger,marginBottom:10}}>⚠ Passwords don't match</div>}
          <button className="btn btn-primary" style={{width:"100%",marginTop:4}} onClick={savePassword}>Update Password</button>
        </Card>
      </div>

      <div className="g2" style={{gap:14}}>
        {/* 2FA */}
        <Card style={{padding:"20px 22px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>⊛ Two-Factor Authentication</div>
          <div style={{background:twoFA?C.success+"14":C.panel,border:`1px solid ${twoFA?C.success+"44":C.div}`,borderRadius:9,padding:"14px 16px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:twoFA?C.success:C.text}}>2FA is {twoFA?"Enabled":"Disabled"}</div>
                <div style={{fontSize:11,color:C.sub,marginTop:3}}>{twoFA?"Your account is protected with an authenticator app.":"Enable 2FA for significantly stronger security."}</div>
              </div>
              <Toggle on={twoFA} onChange={()=>{
                if(!twoFA){doConfirm("Enable 2FA","You'll be shown a QR code to scan with Google Authenticator or Authy.",()=>{setTwoFA(true);logAction("2FA Enabled","Admin account");showToast("2FA enabled — scan QR code in your authenticator app");},false);}
                else{doConfirm("Disable 2FA","Disabling 2FA makes your account less secure. Continue?",()=>{setTwoFA(false);logAction("2FA Disabled","Admin account");showToast("2FA disabled","error");});}
              }}/>
            </div>
          </div>
          {!twoFA&&<div style={{fontSize:11,color:C.sub,lineHeight:1.6}}>Recommended: Use Google Authenticator or Authy. Required for accounts with access to withdrawals and user data.</div>}
          {twoFA&&<button className="btn btn-ghost" style={{width:"100%"}} onClick={()=>showToast("Backup codes — connect backend first","error")}>⤓ Download Backup Codes</button>}
        </Card>

        {/* Active sessions */}
        <Card style={{padding:"20px 22px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>◉ Active Sessions</div>
          {sessions.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 13px",background:C.panel,borderRadius:8,marginBottom:8,border:`1px solid ${s.current?C.success+"44":C.div}`}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,fontWeight:700,color:C.text}}>{s.device}</span>
                  {s.current&&<Badge label="This session" color={C.success} bg={C.success+"22"}/>}
                </div>
                <div style={{fontSize:10,color:C.sub,marginTop:2}}>{s.browser} · {s.ip} · {s.last}</div>
              </div>
              {!s.current&&<button className="btn btn-danger" style={{fontSize:11,padding:"4px 9px",flexShrink:0}} onClick={()=>doConfirm("Revoke Session",`Sign out ${s.device}?`,()=>{logAction("Session Revoked",s.device);showToast(`${s.device} signed out`,"error");})}>✕</button>}
            </div>
          ))}
          <button className="btn btn-danger" style={{width:"100%",marginTop:4}} onClick={()=>doConfirm("Sign Out All","Sign out all other sessions? You'll stay logged in on this device.",()=>{logAction("All Sessions Revoked","Except current");showToast("All other sessions signed out");},false)}>Sign Out All Other Sessions</button>
        </Card>
      </div>
    </div>
  );
}




/* ── ANALYTICS (proper component) ── */
function PgAnalytics({C,users,totalRev}){
  var period=useState("30d"); var setPeriod=period[1]; period=period[0];
  var dateFrom=useState(""); var setDateFrom=dateFrom[1]; dateFrom=dateFrom[0];
  var dateTo=useState(""); var setDateTo=dateTo[1]; dateTo=dateTo[0];

  var activeUsers=users.filter(function(u){return u.status==="active";}).length;
  var arpu=activeUsers>0?(totalRev/activeUsers).toFixed(2):"0.00";
  var avgBalance=users.length>0?(users.reduce(function(a,u){return a+(u.balance||0);},0)/users.length).toFixed(2):"0.00";

  /* Retention data (seeded) */
  var RETENTION=[
    {day:"Day 1", r:100},{day:"Day 3",r:72},{day:"Day 7",r:54},{day:"Day 14",r:41},{day:"Day 30",r:28},{day:"Day 60",r:19},
  ];
  /* Cohort — signups by week */
  var COHORT=[
    {week:"W1 Apr",users:312,active:288,rev:840},{week:"W2 Apr",users:445,active:398,rev:1240},
    {week:"W3 Apr",users:389,active:341,rev:980},{week:"W4 Apr",users:521,active:468,rev:1590},
  ];
  /* Earnings by type */
  var BY_TYPE=[
    {name:"Surveys",  val:3820},{name:"Games", val:2140},{name:"Videos",val:890},
    {name:"Tasks",    val:1230},{name:"Refs",  val:560},
  ];

  var PERIODS=["7d","30d","90d","Custom"];
  var Crd2=function(p){return <Crd C={C} style={{padding:"18px 20px",...(p.style||{})}}>{p.children}</Crd>;};

  return(
    <div className="fade">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div style={{fontSize:16,fontWeight:800,color:C.text}}>Analytics</div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          {PERIODS.map(function(p){return(
            <button key={p} onClick={function(){setPeriod(p);}} style={{background:period===p?"linear-gradient(135deg,"+C.silver+","+C.chrome+")":"transparent",border:"1px solid "+(period===p?"transparent":C.border),borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:700,color:period===p?C.bg:C.sub,cursor:"pointer",fontFamily:"Outfit"}}>{p}</button>
          );})}
        </div>
      </div>
      {period==="Custom"&&<div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10,flexWrap:"wrap"}}>
        <input type="date" value={dateFrom} onChange={function(e){setDateFrom(e.target.value);}} style={{padding:"5px 10px",fontSize:11,width:130,marginBottom:0}}/>
        <span style={{fontSize:11,color:C.muted}}>to</span>
        <input type="date" value={dateTo} onChange={function(e){setDateTo(e.target.value);}} style={{padding:"5px 10px",fontSize:11,width:130,marginBottom:0}}/>
      </div>}
      <div style={{fontSize:12,color:C.sub,marginBottom:16}}>Last {period==="Custom"?"custom range":period} · All times UTC</div>

      {/* ── KEY METRICS ROW ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[
          {label:"Total Revenue",      val:fmt(totalRev),         sub:"all time",      col:C.success},
          {label:"ARPU",               val:"$"+arpu,              sub:"per active user",col:C.gold},
          {label:"Avg Balance",        val:"$"+avgBalance,        sub:"per user",       col:C.silver},
          {label:"Active Users",       val:activeUsers,           sub:"of "+users.length+" total",col:C.chrome},
        ].map(function(s){return(
          <Crd2 key={s.label} style={{padding:"14px 16px"}}>
            <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>{s.label}</div>
            <div style={{fontSize:20,fontWeight:800,fontFamily:"JetBrains Mono",color:s.col,marginBottom:3}}>{s.val}</div>
            <div style={{fontSize:10,color:C.muted}}>{s.sub}</div>
          </Crd2>
        );})}
      </div>

      {/* ── CHARTS ROW 1 ── */}
      <div className="g2" style={{marginBottom:14}}>
        <Crd2>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Daily Revenue</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={DAILY} margin={{top:4,right:4,left:-28,bottom:0}}>
              <defs><linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.success} stopOpacity={.3}/><stop offset="95%" stopColor={C.success} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid stroke={C.div} strokeDasharray="3 6"/>
              <XAxis dataKey="day" tick={{fill:C.muted,fontSize:9}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.muted,fontSize:9}} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTip/>}/>
              <Area type="monotone" dataKey="rev" name="Revenue ($)" stroke={C.success} fill="url(#ag1)" strokeWidth={2} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </Crd2>
        <Crd2>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>User Retention</div>
          <div style={{fontSize:10,color:C.sub,marginBottom:10}}>% of users still active after N days</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={RETENTION} margin={{top:4,right:4,left:-28,bottom:0}}>
              <defs><linearGradient id="rg1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.silver} stopOpacity={.25}/><stop offset="95%" stopColor={C.silver} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid stroke={C.div} strokeDasharray="3 6"/>
              <XAxis dataKey="day" tick={{fill:C.muted,fontSize:9}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.muted,fontSize:9}} axisLine={false} tickLine={false} domain={[0,100]} tickFormatter={function(v){return v+"%";}}/>
              <Tooltip content={<ChartTip/>} formatter={function(v){return v+"%";}}/>
              <Area type="monotone" dataKey="r" name="Retention %" stroke={C.silver} fill="url(#rg1)" strokeWidth={2} dot={{r:3,fill:C.silver}}/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{display:"flex",gap:16,marginTop:10,fontSize:10,color:C.sub}}>
            {[["Day 1","100%",C.success],["Day 7","54%",C.gold],["Day 30","28%",C.warn]].map(function(r){
              return <span key={r[0]} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><span style={{fontSize:11,fontWeight:700,color:r[2]}}>{r[1]}</span><span>{r[0]}</span></span>;
            })}
          </div>
        </Crd2>
      </div>

      {/* ── CHARTS ROW 2 ── */}
      <div className="g2" style={{marginBottom:14}}>
        <Crd2>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>New Users by Week</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={COHORT} margin={{top:4,right:4,left:-28,bottom:0}}>
              <CartesianGrid stroke={C.div} strokeDasharray="3 6"/>
              <XAxis dataKey="week" tick={{fill:C.muted,fontSize:9}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.muted,fontSize:9}} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTip/>}/>
              <Bar dataKey="users"  name="Signups" fill={C.chrome+"cc"} radius={[3,3,0,0]}/>
              <Bar dataKey="active" name="Active"  fill={C.success+"cc"} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Crd2>
        <Crd2>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Earnings by Offer Type</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {BY_TYPE.map(function(t){
              var pct=Math.round(t.val/BY_TYPE.reduce(function(a,x){return a+x.val;},0)*100);
              return(
                <div key={t.name}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:12}}>
                    <span style={{color:C.text,fontWeight:600}}>{t.name}</span>
                    <span style={{fontFamily:"JetBrains Mono",color:C.success}}>${t.val.toLocaleString()}</span>
                  </div>
                  <div style={{height:6,background:C.panel,borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:6,width:pct+"%",background:"linear-gradient(90deg,"+C.silver+","+C.chrome+")",borderRadius:3,transition:"width .6s"}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </Crd2>
      </div>

      {/* ── COHORT TABLE ── */}
      <Crd2>
        <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Weekly Cohort Performance</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <THead cols={["Week","Signups","Active","Active %","Revenue","ARPU"]} C={C}/>
            <tbody>
              {COHORT.map(function(c,i){
                var actPct=Math.round(c.active/c.users*100);
                var weekArpu=(c.rev/c.users).toFixed(2);
                return(
                  <tr key={i} style={{borderBottom:"1px solid "+C.div}}>
                    <td style={{padding:"11px 14px",fontWeight:700,color:C.text}}>{c.week}</td>
                    <td style={{padding:"11px 14px",fontFamily:"JetBrains Mono",color:C.chrome}}>{c.users}</td>
                    <td style={{padding:"11px 14px",fontFamily:"JetBrains Mono",color:C.silver}}>{c.active}</td>
                    <td style={{padding:"11px 14px"}}><span style={{fontFamily:"JetBrains Mono",fontWeight:700,color:actPct>80?C.success:actPct>60?C.gold:C.warn}}>{actPct}%</span></td>
                    <td style={{padding:"11px 14px",fontFamily:"JetBrains Mono",color:C.success}}>${c.rev.toLocaleString()}</td>
                    <td style={{padding:"11px 14px",fontFamily:"JetBrains Mono",color:C.gold}}>${weekArpu}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Crd2>
    </div>
  );
}


function PgNotifications({C,users,ambs,notifForm,setNotifForm,showToast,doConfirm,logAction}){
  const [nTab,setNTab]=useState("send");
  const [schedule,setSchedule]=useState(false);
  const [schedDate,setSchedDate]=useState("");
  const [schedTime,setSchedTime]=useState("");
  const [dmSearch,setDmSearch]=useState("");
  const [dmTarget,setDmTarget]=useState(null);
  const [dmTitle,setDmTitle]=useState("");
  const [dmMsg,setDmMsg]=useState("");
  const [dmType,setDmType]=useState("message");
  const [sentDMs,setSentDMs]=useState([]);
  const [templates,setTemplates]=useState([
    {id:"t1",name:"New Competition",   text:"A new competition is live! Enter now for your chance to win {prize}."},
    {id:"t2",name:"Streak Reminder",   text:"Don't break your streak! Open Cosmo and claim today's reward."},
    {id:"t3",name:"Withdrawal Approved",text:"Your withdrawal of {amount} has been approved and is on its way."},
    {id:"t4",name:"New Offer Available",text:"A high-paying offer just dropped. Earn {amount} — limited time!"},
    {id:"t5",name:"KYC Required",      text:"Action required: Please verify your identity to continue withdrawing. Tap here to start KYC."},
    {id:"t6",name:"Suspicious Activity",text:"We detected unusual activity on your account. It has been temporarily restricted pending review."},
  ]);
  const [newTpl,setNewTpl]=useState({name:"",text:""});
  const [addingTpl,setAddingTpl]=useState(false);
  const [histLog,setHistLog]=useState([]);
  const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,...style}}>{children}</div>;

  const dmUsers=(users||[]).filter(u=>dmSearch.length>=2&&(u.handle.toLowerCase().includes(dmSearch.toLowerCase())||u.email.toLowerCase().includes(dmSearch.toLowerCase())));
  const DM_TYPES=[["message","Direct Message"],["alert","Alert"],["reward","Reward Notice"],["kyc","KYC Notice"],["tier","Tier Update"],["warning","Warning"]];
  const dmTypeCol=t=>({message:C.silver,alert:C.warn,reward:C.success,kyc:C.gold,tier:C.gold,warning:C.danger}[t]||C.silver);

  function sendDM(){
    if(!dmTarget){showToast("Select a recipient","error");return;}
    if(!dmTitle.trim()||!dmMsg.trim()){showToast("Fill title and message","error");return;}
    const entry={to:dmTarget.handle,title:dmTitle,msg:dmMsg,type:dmType,sent:new Date().toLocaleString()};
    setSentDMs(p=>[entry,...p]);
    logAction("Direct Message Sent",`To: ${dmTarget.handle} — "${dmTitle}"`);
    showToast(`Message sent to ${dmTarget.handle}`);
    setDmTarget(null);setDmSearch("");setDmTitle("");setDmMsg("");
  }

  return(
    <div className="fade">
      <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:16}}>Notifications</div>
      <Tabs tabs={[{id:"send",label:"Broadcast"},{id:"direct",label:"Direct Message"},{id:"templates",label:"Templates"},{id:"history",label:"History"}]} active={nTab} set={setNTab} C={C}/>

      {/* ── BROADCAST TAB ── */}
      {nTab==="send"&&<div className="g2">
        <Card style={{padding:"18px 20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:16}}>Send Broadcast Notification</div>
          {[["Target","select","target"],["Title","text","title"],["Message","textarea","msg"]].map(([l,t,k])=>(
            <div key={k} style={{marginBottom:12}}>
              <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.4,marginBottom:5}}>{l}</div>
              {t==="select"?<select value={notifForm[k]} onChange={e=>setNotifForm(p=>({...p,[k]:e.target.value}))}>
                {["All Users","Ambassadors","Active Users","Inactive 7 Days","High Risk","Bronze Tier","Silver Tier","Gold Tier"].map(o=><option key={o}>{o}</option>)}
              </select>:t==="textarea"?<textarea value={notifForm[k]} onChange={e=>setNotifForm(p=>({...p,[k]:e.target.value}))} style={{minHeight:80,resize:"vertical"}} placeholder="Message…"/>:<input value={notifForm[k]} onChange={e=>setNotifForm(p=>({...p,[k]:e.target.value}))} placeholder="Title…"/>}
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:schedule?12:16}}>
            <div><div style={{fontSize:12,color:C.sub}}>Schedule for later</div>{schedule&&<div style={{fontSize:10,color:C.muted}}>Sends at specified time</div>}</div>
            <Toggle on={schedule} onChange={()=>setSchedule(p=>!p)}/>
          </div>
          {schedule&&<div className="g2" style={{gap:10,marginBottom:14}}>
            <div><div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>Date</div><input type="date" value={schedDate} onChange={e=>setSchedDate(e.target.value)}/></div>
            <div><div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>Time</div><input type="time" value={schedTime} onChange={e=>setSchedTime(e.target.value)}/></div>
          </div>}
          <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>{
            if(!notifForm.title.trim()||!notifForm.msg.trim()){showToast("Fill all fields","error");return;}
            if(schedule&&(!schedDate||!schedTime)){showToast("Set date and time","error");return;}
            const entry={title:notifForm.title,target:notifForm.target,delivered:Math.floor(Math.random()*5000+100),sent:new Date().toLocaleDateString(),scheduled:schedule,openRate:"—"};
            setHistLog(p=>[entry,...p]);
            logAction(schedule?"Notification Scheduled":"Notification Sent",`"${notifForm.title}" to ${notifForm.target}`);
            showToast(schedule?`Scheduled for ${schedDate} ${schedTime}`:`Sent to ${notifForm.target}`);
            setNotifForm({title:"",msg:"",target:"All Users"});setSchedule(false);
          }}>{schedule?"⏰ Schedule":"▶ Send Now"}</button>
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Card style={{padding:"16px 18px"}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>Quick Templates</div>
            {templates.slice(0,3).map((t,i)=>(
              <div key={i} style={{padding:"9px 12px",background:C.panel,borderRadius:8,marginBottom:8,border:`1px solid ${C.div}`,cursor:"pointer"}} onClick={()=>setNotifForm(p=>({...p,title:t.name,msg:t.text}))}>
                <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:2}}>{t.name}</div>
                <div style={{fontSize:10,color:C.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.text}</div>
              </div>
            ))}
            <button className="btn btn-ghost" style={{width:"100%",fontSize:11}} onClick={()=>setNTab("templates")}>View All Templates →</button>
          </Card>
          <Card style={{padding:"16px 18px"}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>Reach Estimate</div>
            {[["All Users",(users||[]).length],["Active Users",(users||[]).filter(u=>u.status==="active").length],["Ambassadors",(ambs||[]).filter(a=>a.status==="approved").length]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:12}}><span style={{color:C.sub}}>{l}</span><span style={{fontFamily:"JetBrains Mono",color:C.chrome,fontWeight:700}}>{v.toLocaleString()}</span></div>
            ))}
          </Card>
        </div>
      </div>}

      {/* ── DIRECT MESSAGE TAB ── */}
      {nTab==="direct"&&<div>
        <Card style={{padding:"18px 20px",marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>Send Private Message to a User</div>
          <div style={{fontSize:11,color:C.sub,marginBottom:16,lineHeight:1.6}}>Search for any user by handle or email, select them, then compose and send. Messages appear in their in-app notification inbox.</div>

          {/* Recipient search */}
          {!dmTarget&&<div style={{marginBottom:14}}>
            <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.4,marginBottom:6}}>Recipient</div>
            <div style={{position:"relative"}}>
              <svg style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={dmSearch} onChange={e=>setDmSearch(e.target.value)} placeholder="Search by handle or email..." style={{paddingLeft:34}}/>
            </div>
            {dmSearch.length>=2&&dmUsers.length===0&&<div style={{fontSize:11,color:C.muted,padding:"8px 0"}}>No users found</div>}
            {dmUsers.slice(0,6).map(u=>(
              <div key={u.id} onClick={()=>{setDmTarget(u);setDmSearch("");}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:C.panel,borderRadius:9,marginTop:6,border:`1px solid ${C.div}`,cursor:"pointer"}}>
                <div style={{width:32,height:32,borderRadius:8,background:C.card,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:C.silver,border:`1px solid ${C.border}`,flexShrink:0}}>{u.handle[1].toUpperCase()}</div>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:C.text}}>{u.handle}</div><div style={{fontSize:11,color:C.sub}}>{u.email} · {u.tier}</div></div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            ))}
          </div>}

          {/* Selected recipient */}
          {dmTarget&&<div style={{background:C.panel,borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10,border:`1px solid ${C.silver}44`}}>
            <div style={{width:34,height:34,borderRadius:9,background:C.card,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:C.silver,border:`1px solid ${C.border}`,flexShrink:0}}>{dmTarget.handle[1].toUpperCase()}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:C.text}}>{dmTarget.handle}</div><div style={{fontSize:11,color:C.sub}}>{dmTarget.email}</div></div>
            <button onClick={()=>{setDmTarget(null);setDmTitle("");setDmMsg("");}} style={{background:"none",border:"none",cursor:"pointer",color:C.sub,fontSize:18,padding:2}}>×</button>
          </div>}

          {/* Message type */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.4,marginBottom:6}}>Message Type</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {DM_TYPES.map(([id,label])=>(
                <button key={id} onClick={()=>setDmType(id)} style={{background:dmType===id?dmTypeCol(id)+"22":"transparent",border:`1px solid ${dmType===id?dmTypeCol(id)+"66":C.border}`,borderRadius:20,padding:"5px 12px",cursor:"pointer",color:dmType===id?dmTypeCol(id):C.sub,fontSize:11,fontWeight:700,fontFamily:"Outfit"}}>{label}</button>
              ))}
            </div>
          </div>

          {/* Title + message */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.4,marginBottom:5}}>Title</div>
            <input value={dmTitle} onChange={e=>setDmTitle(e.target.value)} placeholder="e.g. Action Required: Verify Your Account"/>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.4,marginBottom:5}}>Message</div>
            <textarea value={dmMsg} onChange={e=>setDmMsg(e.target.value)} style={{minHeight:90,resize:"vertical"}} placeholder="Write your message here…"/>
          </div>

          {/* Template quick-fill */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,color:C.sub,marginBottom:6}}>Or pick a template:</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {templates.map(t=>(
                <button key={t.id} onClick={()=>{setDmTitle(t.name);setDmMsg(t.text);}} style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:20,padding:"4px 10px",cursor:"pointer",color:C.sub,fontSize:10,fontFamily:"Outfit",fontWeight:600}}>{t.name}</button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" style={{width:"100%"}} onClick={sendDM}>
            ▶ Send to {dmTarget?dmTarget.handle:"..."}
          </button>
        </Card>

        {/* Sent DMs log */}
        <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>Recent Direct Messages</div>
        {sentDMs.map((dm,i)=>(
          <Card key={i} style={{padding:"13px 16px",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:dmTypeCol(dm.type),marginTop:5,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <span style={{fontSize:13,fontWeight:700,color:C.text}}>{dm.title}</span>
                  <span style={{fontSize:9,padding:"2px 7px",borderRadius:10,background:dmTypeCol(dm.type)+"18",color:dmTypeCol(dm.type),fontWeight:700,textTransform:"uppercase"}}>{dm.type}</span>
                </div>
                <div style={{fontSize:12,color:C.sub,marginBottom:4}}>{dm.msg}</div>
                <div style={{fontSize:10,color:C.muted}}>To: <b style={{color:C.silver}}>{dm.to}</b> · {dm.sent}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>}

      {/* ── TEMPLATES TAB ── */}
      {nTab==="templates"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>Notification Templates</div>
          <button className="btn btn-primary" style={{fontSize:11}} onClick={()=>setAddingTpl(true)}>+ New</button>
        </div>
        {addingTpl&&<Card style={{padding:"16px 18px",marginBottom:12,border:`1px solid ${C.silver}44`}}>
          <div style={{marginBottom:10}}><div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>Name</div><input value={newTpl.name} onChange={e=>setNewTpl(p=>({...p,name:e.target.value}))} placeholder="Template name"/></div>
          <div style={{marginBottom:12}}><div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>Message (use {"{"+"amount}"}, {"{"+"prize}"} as placeholders)</div><textarea value={newTpl.text} onChange={e=>setNewTpl(p=>({...p,text:e.target.value}))} style={{minHeight:60,resize:"vertical"}} placeholder="Message…"/></div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-primary" style={{fontSize:11}} onClick={()=>{if(!newTpl.name.trim()||!newTpl.text.trim()){showToast("Fill both fields","error");return;}setTemplates(p=>[...p,{id:"t"+Date.now(),...newTpl}]);logAction("Template Created",newTpl.name);showToast("Saved");setAddingTpl(false);setNewTpl({name:"",text:""});}}>Save</button>
            <button className="btn btn-ghost" style={{fontSize:11}} onClick={()=>setAddingTpl(false)}>Cancel</button>
          </div>
        </Card>}
        {templates.map((t,i)=>(
          <Card key={i} style={{padding:"14px 16px",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>{t.name}</div><div style={{fontSize:12,color:C.sub,lineHeight:1.5}}>{t.text}</div></div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <button className="btn btn-ghost" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>{setNotifForm(p=>({...p,title:t.name,msg:t.text}));setNTab("send");showToast("Template loaded");}}>Use</button>
                <button className="btn btn-ghost" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>{setDmTitle(t.name);setDmMsg(t.text);setNTab("direct");showToast("Loaded for DM");}}>DM</button>
                <button className="btn btn-danger" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>doConfirm("Delete Template",`Delete "${t.name}"?`,()=>{setTemplates(p=>p.filter(x=>x.id!==t.id));logAction("Template Deleted",t.name);},"error")}>✕</button>
              </div>
            </div>
          </Card>
        ))}
      </div>}

      {/* ── HISTORY TAB ── */}
      {nTab==="history"&&<Card><div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <THead cols={["Title","Target","Delivered","Open Rate","Sent","Type"]} C={C}/>
          <tbody>{histLog.map((n,i)=>(
            <tr key={i} style={{borderBottom:`1px solid ${C.div}`}}>
              <td style={{padding:"11px 14px",fontWeight:700,color:C.text}}>{n.title}</td>
              <td style={{padding:"11px 14px"}}><Badge label={n.target} color={C.silver} bg={C.silver+"18"}/></td>
              <td style={{padding:"11px 14px"}}><span style={{fontFamily:"JetBrains Mono",color:C.success,fontWeight:700}}>{(n.delivered||0).toLocaleString()}</span></td>
              <td style={{padding:"11px 14px",fontFamily:"JetBrains Mono",color:C.gold,fontWeight:700}}>{n.openRate||"—"}</td>
              <td style={{padding:"11px 14px",color:C.sub,fontSize:12}}>{n.sent}</td>
              <td style={{padding:"11px 14px"}}>{n.scheduled?<Badge label="Scheduled" color={C.warn} bg={C.warn+"22"}/>:<Badge label="Sent" color={C.success} bg={C.success+"22"}/>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div></Card>}
    </div>
  );
}


/* ── DISCOVER (extracted to avoid hook-in-function violation) ── */
function PgDiscover({C,cfg,setCfg,isDark,showToast,doConfirm,logAction}){
  const [radius,setRadius]=useState(10);
  const [enabled,setEnabled]=useState(cfg.discoverMap);
  const [showPhotos,setShowPhotos]=useState(true);
  const [hideBanned,setHideBanned]=useState(true);
  const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,...style}}>{children}</div>;
  const optedIn=[];
  const toggle=()=>{
    const next=!enabled;
    setEnabled(next);
    setCfg(p=>({...p,discoverMap:next}));
    logAction("Discover Map Toggled",next?"Enabled":"Disabled");
    showToast(`Discover map ${next?"enabled":"disabled"}`);
  };
  return(
    <div className="fade">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,gap:10,flexWrap:"wrap"}}>
        <div style={{fontSize:16,fontWeight:800,color:C.text}}>Discover Map</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:12,color:C.sub}}>Feature {enabled?"enabled":"disabled"}</span>
          <Toggle on={enabled} onChange={toggle}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        {[[optedIn.length,"Opted In",C.success],[optedIn.length,"Active Now",C.silver],[radius+"km","Radius",C.chrome],["0","Removed (30d)",C.sub]].map(([v,l,c])=>(
          <Card key={l} style={{padding:"13px 15px"}}>
            <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>{l}</div>
            <div style={{fontSize:20,fontWeight:800,fontFamily:"JetBrains Mono",color:c}}>{v}</div>
          </Card>
        ))}
      </div>
      <div className="g2" style={{gap:14,marginBottom:14}}>
        <Card style={{padding:16}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:10}}>Live Map Preview</div>
          <div style={{height:260,background:C.panel,borderRadius:10,position:"relative",overflow:"hidden",border:`1px solid ${C.div}`,opacity:enabled?1:.4,transition:"opacity .3s"}}>
            <div style={{position:"absolute",inset:0,background:isDark?"radial-gradient(ellipse at 40% 60%,#0f1a2e,#06070d)":"radial-gradient(ellipse at 40% 60%,#d0d8f0,#b8bdd4)"}}/>
            <div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:Math.min(200,radius*18),height:Math.min(200,radius*18),borderRadius:"50%",border:`1.5px dashed ${C.silver}44`,background:C.silver+"08",transition:"width .4s,height .4s"}}/>
            {optedIn.map((u,i)=>(
              <div key={i} style={{position:"absolute",left:u.x+"%",top:u.y+"%",transform:"translate(-50%,-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{width:12,height:12,borderRadius:"50%",background:u.c,boxShadow:`0 0 8px ${u.c}66`}}/>
                <span style={{fontSize:7,color:u.c,fontWeight:700,whiteSpace:"nowrap",background:C.bg+"dd",padding:"1px 4px",borderRadius:3}}>{u.h}</span>
              </div>
            ))}
            <div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <div style={{width:16,height:16,borderRadius:"50%",background:C.chrome,boxShadow:`0 0 12px ${C.chrome}88`,border:`2px solid ${C.surface}`}}/>
              <span style={{fontSize:7,color:C.chrome,fontWeight:800,whiteSpace:"nowrap",background:C.bg+"dd",padding:"1px 4px",borderRadius:3}}>Admin</span>
            </div>
            {!enabled&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.55)",borderRadius:10}}><span style={{color:"#adb1cc",fontSize:13,fontWeight:700}}>Feature Disabled</span></div>}
          </div>
          <div style={{display:"flex",gap:14,marginTop:10,fontSize:10,color:C.sub}}>
            {[[C.success,"Opted in"],[C.warn,"Flagged"],[C.chrome,"Admin"]].map(([c,l])=>(
              <span key={l} style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:7,height:7,borderRadius:"50%",background:c,display:"inline-block"}}/>{l}</span>
            ))}
          </div>
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Card style={{padding:"16px 18px"}}>
            <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:14}}>⚙ Map Settings</div>
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:12,color:C.sub}}>Nearby radius</span>
                <span style={{fontFamily:"JetBrains Mono",fontSize:13,fontWeight:700,color:C.chrome}}>{radius} km</span>
              </div>
              <input type="range" min={1} max={100} value={radius} onChange={e=>setRadius(+e.target.value)}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted,marginTop:3}}><span>1km</span><span>100km</span></div>
            </div>
            {[["Show profile photos on map",showPhotos,setShowPhotos],["Hide banned users",hideBanned,setHideBanned],["Show opt-in count to users",true,()=>{}]].map(([l,v,sv],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <span style={{fontSize:12,color:C.sub}}>{l}</span>
                <Toggle on={v} onChange={()=>sv(p=>!p)}/>
              </div>
            ))}
            <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>{logAction("Discover Settings Saved",`Radius:${radius}km`);showToast("Settings saved");}}>Save Settings</button>
          </Card>
          <Card style={{padding:"16px 18px"}}>
            <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:12}}>◎ Quick Actions</div>
            <button className="btn btn-warn" style={{width:"100%",marginBottom:8,textAlign:"left"}} onClick={()=>doConfirm("Clear All Locations","Remove all cached user locations?",()=>{logAction("Discover Cleared","All locations removed");showToast("Locations cleared");},"error")}>↺ Clear All Cached Locations</button>
            <button className="btn btn-ghost" style={{width:"100%",textAlign:"left"}} onClick={()=>showToast("Export — connect backend first","error")}>⤓ Export Opted-In Users</button>
          </Card>
        </div>
      </div>
      <Card>
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.div}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>Users on Map ({optedIn.length})</div>
          <div style={{fontSize:11,color:C.sub}}>Only opted-in users visible</div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <THead cols={["User","Last Seen","Status","Actions"]} C={C}/>
            <tbody>{optedIn.map((u,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${C.div}`}}>
                <td style={{padding:"11px 14px",fontWeight:700,color:C.text}}>{u.h}</td>
                <td style={{padding:"11px 14px",color:C.sub,fontSize:12}}>{u.last} ago</td>
                <td style={{padding:"11px 14px"}}><Badge label="Opted In" color={C.success} bg={C.success+"22"}/></td>
                <td style={{padding:"11px 14px"}}><button className="btn btn-danger" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>doConfirm("Remove from Map",`Remove ${u.h}?`,()=>{logAction("Removed from Discover",u.h);showToast(`${u.h} removed`);},"error")}>✕ Remove</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ── AMBASSADORS (extracted to avoid hook-in-function violation) ── */
function PgAmbassadors({C,ambs,setAmbs,users,setUsers,showToast,doConfirm,logAction}){
  const [tab,setTab]=useState("pending");
  const [criteria,setCriteria]=useState({minRefs:50,minEarned:500,minAccountAge:30,inviteOnly:false});
  const [benefits,setBenefits]=useState({bonusPct:10,exclusiveOffers:true,prioritySupport:true,earlyAccess:true,customBadge:true});
  const [editBenUser,setEditBenUser]=useState(null);
  const [userSearch,setUserSearch]=useState("");
  const [showAddUser,setShowAddUser]=useState(false);
  const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,...style}}>{children}</div>;

  const pending =ambs.filter(a=>a.status==="pending");
  const approved=ambs.filter(a=>a.status==="approved");
  const rejected=ambs.filter(a=>a.status==="rejected");
  const shown=tab==="pending"?pending:tab==="approved"?approved:rejected;

  const approve=(handle)=>{setAmbs(p=>p.map(x=>x.user===handle?{...x,status:"approved",perks:`+${benefits.bonusPct}%`}:x));setUsers&&setUsers(p=>p.map(x=>x.handle===handle?{...x,ambassador:true}:x));logAction("Ambassador Approved",handle);showToast(`${handle} approved as ambassador`);};
  const revoke=(handle)=>{setAmbs(p=>p.map(x=>x.user===handle?{...x,status:"rejected"}:x));setUsers&&setUsers(p=>p.map(x=>x.handle===handle?{...x,ambassador:false}:x));logAction("Ambassador Revoked",handle);showToast(`${handle} removed from ambassadors`,"error");};

  /* User search + direct promote */
  const TIERS=["Bronze","Silver","Gold"];
  const filteredUsers=(users||[]).filter(u=>userSearch.length>=2&&(u.handle.toLowerCase().includes(userSearch.toLowerCase())||u.email.toLowerCase().includes(userSearch.toLowerCase())));

  function promoteUser(u){
    const curIdx=TIERS.indexOf(u.tier);
    if(curIdx>=TIERS.length-1){showToast(`${u.handle} is already Gold tier`,"error");return;}
    const newTier=TIERS[curIdx+1];
    doConfirm("Promote Tier",`Promote ${u.handle} from ${u.tier} to ${newTier}?`,()=>{
      setUsers&&setUsers(p=>p.map(x=>x.id===u.id?{...x,tier:newTier}:x));
      logAction("Tier Promoted",`${u.handle}: ${u.tier} → ${newTier}`);
      showToast(`${u.handle} promoted to ${newTier}`);
    },false);
  }
  function demoteUser(u){
    const curIdx=TIERS.indexOf(u.tier);
    if(curIdx<=0){showToast(`${u.handle} is already Bronze tier`,"error");return;}
    const newTier=TIERS[curIdx-1];
    doConfirm("Demote Tier",`Demote ${u.handle} from ${u.tier} to ${newTier}?`,()=>{
      setUsers&&setUsers(p=>p.map(x=>x.id===u.id?{...x,tier:newTier}:x));
      logAction("Tier Demoted",`${u.handle}: ${u.tier} → ${newTier}`);
      showToast(`${u.handle} demoted to ${newTier}`,"error");
    },true);
  }
  function makeAmbassador(u){
    if(ambs.find(a=>a.user===u.handle&&a.status==="approved")){showToast("Already an ambassador","error");return;}
    setAmbs(p=>[...p.filter(a=>a.user!==u.handle),{user:u.handle,refs:u.refs,applied:"Manual",status:"approved",perks:`+${benefits.bonusPct}%`}]);
    setUsers&&setUsers(p=>p.map(x=>x.id===u.id?{...x,ambassador:true}:x));
    logAction("Ambassador Added Manually",u.handle);
    showToast(`${u.handle} added as ambassador`);
    setUserSearch("");setShowAddUser(false);
  }

  const tierCol=t=>t==="Gold"?C.gold:t==="Silver"?C.silver:C.bronze;

  return(
    <div className="fade">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div style={{fontSize:16,fontWeight:800,color:C.text}}>Ambassadors</div>
        <button className="btn btn-primary" style={{fontSize:12}} onClick={()=>setShowAddUser(p=>!p)}>+ Add User</button>
      </div>
      <div style={{fontSize:12,color:C.sub,marginBottom:16}}>Manage ambassador applications, manually add users, and control tier overrides.</div>

      {/* ── USER SEARCH PANEL ── */}
      {showAddUser&&<Card style={{padding:"18px 20px",marginBottom:14,border:`1px solid ${C.silver}44`}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>Find User — Promote Tier or Make Ambassador</div>
        <div style={{position:"relative",marginBottom:12}}>
          <svg style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search by handle or email..." style={{paddingLeft:34}}/>
        </div>
        {userSearch.length>=2&&filteredUsers.length===0&&<div style={{fontSize:12,color:C.muted,padding:"8px 0"}}>No users found for "{userSearch}"</div>}
        {filteredUsers.map(u=>{
          const isAmb=ambs.find(a=>a.user===u.handle&&a.status==="approved");
          const tierC=tierCol(u.tier);
          return(
            <div key={u.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:C.panel,borderRadius:10,marginBottom:8,border:`1px solid ${C.div}`}}>
              <div style={{width:36,height:36,borderRadius:9,background:C.card,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:C.silver,border:`1px solid ${C.border}`,flexShrink:0}}>{u.handle[1].toUpperCase()}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,color:C.text,marginBottom:2}}>{u.handle}</div>
                <div style={{fontSize:11,color:C.sub}}>{u.email} · <span style={{color:tierC,fontWeight:700}}>{u.tier}</span> · {u.refs} refs{isAmb?' · Ambassador ♛':''}</div>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0,flexWrap:"wrap"}}>
                <button onClick={()=>promoteUser(u)} style={{background:C.success+"18",border:`1px solid ${C.success}44`,borderRadius:8,padding:"5px 10px",cursor:"pointer",color:C.success,fontSize:11,fontFamily:"Outfit",fontWeight:600}}>↑ Promote</button>
                <button onClick={()=>demoteUser(u)} style={{background:C.warn+"18",border:`1px solid ${C.warn}44`,borderRadius:8,padding:"5px 10px",cursor:"pointer",color:C.warn,fontSize:11,fontFamily:"Outfit",fontWeight:600}}>↓ Demote</button>
                {!isAmb&&<button onClick={()=>makeAmbassador(u)} style={{background:C.gold+"18",border:`1px solid ${C.gold}44`,borderRadius:8,padding:"5px 10px",cursor:"pointer",color:C.gold,fontSize:11,fontFamily:"Outfit",fontWeight:700}}>♛ Make Amb</button>}
                {isAmb&&<button onClick={()=>doConfirm("Remove Ambassador",`Remove ${u.handle} as ambassador?`,()=>{revoke(u.handle);},true)} style={{background:C.danger+"18",border:`1px solid ${C.danger}44`,borderRadius:8,padding:"5px 10px",cursor:"pointer",color:C.danger,fontSize:11,fontFamily:"Outfit",fontWeight:600}}>✕ Remove</button>}
              </div>
            </div>
          );
        })}
      </Card>}

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {[[pending.length,"Pending",C.warn,"pending"],[approved.length,"Active",C.success,"approved"],[rejected.length,"Rejected",C.sub,"rejected"]].map(([v,l,c,tid])=>(
          <Card key={l} style={{padding:"13px 16px",cursor:"pointer",borderTop:`2px solid ${c}`}} onClick={()=>setTab(tid)}>
            <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>{l}</div>
            <div style={{fontSize:22,fontWeight:800,fontFamily:"JetBrains Mono",color:c}}>{v}</div>
          </Card>
        ))}
      </div>

      {/* Config cards */}
      <div className="g2" style={{gap:14,marginBottom:16}}>
        <Card style={{padding:"18px 20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>◈ Application Criteria</div>
          <div style={{fontSize:11,color:C.sub,marginBottom:14,lineHeight:1.6}}>Users must meet ALL of these to apply.</div>
          {[{label:"Min referrals",key:"minRefs",suffix:"refs"},{label:"Min total earned",key:"minEarned",suffix:"USD"},{label:"Account age",key:"minAccountAge",suffix:"days"}].map(f=>(
            <div key={f.key} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:12,color:C.sub}}>{f.label}</span>
                <span style={{fontFamily:"JetBrains Mono",fontSize:12,fontWeight:700,color:C.chrome}}>{criteria[f.key]} {f.suffix}</span>
              </div>
              <input type="number" value={criteria[f.key]} onChange={e=>setCriteria(p=>({...p,[f.key]:+e.target.value}))}/>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div><div style={{fontSize:12,color:C.sub}}>Invite-only mode</div><div style={{fontSize:10,color:C.muted}}>Disables self-application</div></div>
            <Toggle on={criteria.inviteOnly} onChange={()=>setCriteria(p=>({...p,inviteOnly:!p.inviteOnly}))}/>
          </div>
          <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>{logAction("Ambassador Criteria Updated",`MinRefs:${criteria.minRefs}`);showToast("Criteria saved");}}>Save Criteria</button>
        </Card>
        <Card style={{padding:"18px 20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>♛ Default Benefits</div>
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:12,color:C.sub}}>Referral bonus %</span>
              <span style={{fontFamily:"JetBrains Mono",fontSize:13,fontWeight:700,color:C.gold}}>+{benefits.bonusPct}%</span>
            </div>
            <input type="range" min={0} max={50} value={benefits.bonusPct} onChange={e=>setBenefits(p=>({...p,bonusPct:+e.target.value}))}/>
          </div>
          {[["Exclusive offers","exclusiveOffers"],["Priority support","prioritySupport"],["Early feature access","earlyAccess"],["Custom badge","customBadge"]].map(([l,k])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
              <span style={{fontSize:12,color:C.sub}}>{l}</span>
              <Toggle on={benefits[k]} onChange={()=>setBenefits(p=>({...p,[k]:!p[k]}))}/>
            </div>
          ))}
          <button className="btn btn-primary" style={{width:"100%",marginTop:4}} onClick={()=>{logAction("Benefits Updated",`Bonus:+${benefits.bonusPct}%`);showToast("Benefits saved");}}>Save Benefits</button>
        </Card>
      </div>

      {/* Pending alert */}
      {pending.length>0&&<Card style={{padding:"16px 18px",marginBottom:14,border:`1px solid ${C.warn}44`}}>
        <div style={{fontSize:12,fontWeight:700,color:C.warn,marginBottom:12}}>⚠ {pending.length} Application{pending.length>1?"s":""} Awaiting Review</div>
        {pending.map((a,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:C.panel,borderRadius:9,marginBottom:8,border:`1px solid ${C.div}`}}>
            <div style={{width:36,height:36,borderRadius:9,background:C.card,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:C.silver,border:`1px solid ${C.border}`,flexShrink:0}}>{a.user[1].toUpperCase()}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,color:C.text}}>{a.user}</div><div style={{fontSize:11,color:C.sub,marginTop:2}}>{a.refs} refs · {a.applied}</div></div>
            <button className="btn btn-success" style={{fontSize:11}} onClick={()=>approve(a.user)}>✓ Approve</button>
            <button className="btn btn-danger"  style={{fontSize:11}} onClick={()=>revoke(a.user)}>✕ Reject</button>
          </div>
        ))}
      </Card>}

      {/* Ambassador list */}
      <Tabs tabs={[{id:"pending",label:`Pending (${pending.length})`},{id:"approved",label:`Active (${approved.length})`},{id:"rejected",label:`Rejected (${rejected.length})`}]} active={tab} set={setTab} C={C}/>
      <Card>
        {shown.length===0?<div style={{padding:"28px",textAlign:"center",color:C.sub,fontSize:13}}>No {tab} ambassadors.</div>:
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <THead cols={["User","Refs","Tier","Bonus","Status","Actions"]} C={C}/>
            <tbody>{shown.map((a,i)=>{
              const u=(users||[]).find(x=>x.handle===a.user);
              const tierC=u?tierCol(u.tier):C.sub;
              return(
                <tr key={i} style={{borderBottom:`1px solid ${C.div}`}}>
                  <td style={{padding:"11px 14px",fontWeight:700,color:C.text}}>{a.user}</td>
                  <td style={{padding:"11px 14px",color:C.sub}}>{a.refs}</td>
                  <td style={{padding:"11px 14px"}}>{u&&<span style={{fontWeight:700,color:tierC}}>{u.tier}</span>}</td>
                  <td style={{padding:"11px 14px"}}><span style={{fontFamily:"JetBrains Mono",fontWeight:700,color:C.gold}}>{a.perks}</span></td>
                  <td style={{padding:"11px 14px"}}><StatusBadge s={a.status}/></td>
                  <td style={{padding:"11px 14px"}}>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {a.status==="approved"&&u&&<>
                        <button className="btn btn-success" style={{fontSize:10,padding:"3px 8px"}} onClick={()=>promoteUser(u)}>↑</button>
                        <button className="btn" style={{fontSize:10,padding:"3px 8px",background:C.warn+"18",color:C.warn,border:`1px solid ${C.warn}33`}} onClick={()=>demoteUser(u)}>↓</button>
                        <button className="btn btn-ghost" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>setEditBenUser(editBenUser===a.user?null:a.user)}>✎</button>
                        <button className="btn btn-danger" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>doConfirm("Remove Ambassador",`Remove ${a.user}?`,()=>revoke(a.user),true)}>✕</button>
                      </>}
                      {a.status==="rejected"&&<button className="btn btn-success" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>approve(a.user)}>↺ Re-approve</button>}
                      {a.status==="pending"&&<><button className="btn btn-success" style={{fontSize:11,padding:"4px 9px"}} onClick={()=>approve(a.user)}>✓</button><button className="btn btn-danger" style={{fontSize:11,padding:"4px 9px"}} onClick={()=>revoke(a.user)}>✕</button></>}
                    </div>
                    {editBenUser===a.user&&<div style={{marginTop:10,background:C.panel,borderRadius:9,padding:"12px 14px",border:`1px solid ${C.div}`}}>
                      <div style={{fontSize:10,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Override for {a.user}</div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                        <span style={{fontSize:12,color:C.sub}}>Bonus %</span>
                        <input type="number" defaultValue={parseInt(a.perks)||benefits.bonusPct} style={{width:70,fontFamily:"JetBrains Mono"}} onChange={e=>setAmbs(p=>p.map(x=>x.user===a.user?{...x,perks:`+${e.target.value}%`}:x))}/>
                      </div>
                      <button className="btn btn-primary" style={{fontSize:11}} onClick={()=>{logAction("Benefits Overridden",a.user);showToast("Saved");setEditBenUser(null);}}>Save</button>
                    </div>}
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>}
      </Card>
    </div>
  );
}



function PgReferrals({C,refs,setRefs,refBonus,setRefBonus,saveSettings,showToast,logAction}){
  const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,...style}}>{children}</div>;
  return(
      <div className="fade">
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,gap:10,flexWrap:"wrap"}}>
  <div style={{fontSize:16,fontWeight:800,color:C.text}}>Referrals</div>
  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
    <span style={{fontSize:12,color:C.sub}}>Bonus/ref:</span>
    <input type="number" value={refBonus} onChange={e=>setRefBonus(+e.target.value)} style={{width:64}}/>
    <button className="btn btn-primary" onClick={saveSettings}>Save</button>
  </div>
</div>
<div className="g2" style={{marginBottom:14}}>
  <Kpi label="Total Referrals" val={refs.length} color={C.silver} C={C}/>
  <Kpi label="Total Paid" val={fmt(refs.filter(r=>r.status==="paid").reduce((a,r)=>a+r.bonus,0))} color={C.success} C={C}/>
</div>
<Card><div style={{overflowX:"auto"}}>
  <table style={{width:"100%",borderCollapse:"collapse"}}>
    <THead cols={["Referrer","Invitee","Bonus","Status","Date","Actions"]} C={C}/>
    <tbody>{refs.map((r,i)=>(
      <tr key={i} style={{borderBottom:`1px solid ${C.div}`}}>
        <td style={{padding:"11px 14px",fontWeight:700,color:C.text}}>{r.ref}</td>
        <td style={{padding:"11px 14px",color:C.sub}}>{r.inv}</td>
        <td style={{padding:"11px 14px"}}><span style={{fontFamily:"JetBrains Mono",color:C.success,fontWeight:700}}>{fmt(r.bonus)}</span></td>
        <td style={{padding:"11px 14px"}}><StatusBadge s={r.status}/></td>
        <td style={{padding:"11px 14px",color:C.sub,fontSize:12}}>{r.date}</td>
        <td style={{padding:"11px 14px"}}>{r.status==="pending"&&<button className="btn btn-success" style={{fontSize:11,padding:"4px 11px"}} onClick={()=>{setRefs(p=>p.map(x=>x.ref===r.ref&&x.inv===r.inv?{...x,status:"paid"}:x));logAction("Bonus Paid",`${r.ref}→${r.inv}`);showToast("Bonus paid");}}>Pay</button>}</td>
      </tr>
    ))}</tbody>
  </table>
</div></Card>
      </div>
  );
}

/* ── STREAKS ── */
function PgStreaks({C,streaks,setStreaks,users,showToast,logAction}){
  const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,...style}}>{children}</div>;
  return(
      <div className="fade">
<div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:14}}>Streak & Bonuses</div>
<Card style={{padding:"18px 20px",marginBottom:14}}>
  <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:C.text}}>🔥 Daily Rewards — click any to edit</div>
  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
    {streaks.map((v,i)=>(
      <div key={i} style={{flex:"1 1 72px",background:C.panel,borderRadius:8,padding:"10px 8px",textAlign:"center",border:`1px solid ${C.div}`,minWidth:64}}>
        <div style={{fontSize:9,color:C.sub,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Day {i+1}</div>
        <input type="number" value={v} step="0.01" min="0.01" max="100" onChange={e=>{const n=parseFloat(e.target.value);if(!isNaN(n)&&n>0)setStreaks(p=>{const a=[...p];a[i]=n;return a;});}} style={{textAlign:"center",fontFamily:"JetBrains Mono",fontSize:13,fontWeight:700,color:C.gold,padding:"5px 3px"}}/>
      </div>
    ))}
  </div>
  <button className="btn btn-primary" style={{marginTop:14}} onClick={()=>{logAction("Streak Config Saved","");showToast("Streak rewards saved");}}>Save</button>
</Card>
<Card><div style={{overflowX:"auto"}}>
  <table style={{width:"100%",borderCollapse:"collapse"}}>
    <THead cols={["User","Streak","Last Claim","Actions"]} C={C}/>
    <tbody>{users.filter(u=>u.status!=="banned").map((u,i)=>(
      <tr key={i} style={{borderBottom:`1px solid ${C.div}`}}>
        <td style={{padding:"11px 14px",fontWeight:700,color:C.text}}>{u.handle}</td>
        <td style={{padding:"11px 14px"}}><span style={{color:C.gold,fontWeight:700}}>🔥 5 days</span></td>
        <td style={{padding:"11px 14px",color:C.sub,fontSize:12}}>{u.lastActive}</td>
        <td style={{padding:"11px 14px"}}><button className="btn btn-ghost" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>{logAction("Streak Reset",u.handle);showToast(`Streak reset for ${u.handle}`);}}>↺ Reset</button></td>
      </tr>
    ))}</tbody>
  </table>
</div></Card>
      </div>
  );
}

/* ── SETTINGS ── */
function PgSettings({C,cfg,setCfg,adminEmail,gSplit,setGSplit,tiers,setTiers,saveSettings,doLogout,showToast,doConfirm,logAction}){
  const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,...style}}>{children}</div>;
  const [blockInput,setBlockInput]=useState("");
  const isDark=C.bg==="#06070d";

  const mkToggle=(key,label,onMsg,offMsg,dangerOff)=>()=>{
    const next=!cfg[key];
    doConfirm(next?`Enable ${label}`:`Disable ${label}`,next?`${onMsg}`:`${offMsg}`,
      ()=>{setCfg(p=>({...p,[key]:next}));logAction(next?`${label} Enabled`:`${label} Disabled`,"Global toggle");showToast(next?`${label} enabled`:`${label} disabled`,next?"success":(dangerOff?"error":"warn"));},
      dangerOff&&!next);
  };

  const featureToggles=[
    {key:"offerwallsEnabled",   label:"Offerwall",          desc:"Controls whether users can see and complete offerwall offers (Lootably, AdGem, CPX).",       danger:true},
    {key:"tasksEnabled",        label:"Cosmo Tasks",        desc:"Controls whether the Tasks tab is visible and tasks can be completed.",                        danger:false},
    {key:"giftCardsEnabled",    label:"Gift Cards",         desc:"Controls whether users can redeem balance for gift cards.",                                     danger:true},
    {key:"withdrawalEnabled",   label:"Cash Withdrawals",   desc:"Controls whether users can submit PayPal/Wise withdrawal requests.",                           danger:true},
    {key:"discoverEnabled",     label:"Discover / Near Me", desc:"Controls whether the Near Me tab and location sharing is available.",                          danger:false},
    {key:"competitionsEnabled", label:"Competitions",       desc:"Controls whether users can view and enter competitions.",                                       danger:false},
    {key:"referralsEnabled",    label:"Referral Program",   desc:"Controls whether referral codes work and bonuses are paid out.",                                danger:false},
    {key:"scratchCards",        label:"Scratch Cards",      desc:"Controls whether scratch card rewards are active.",                                             danger:false},
    {key:"biometricEnabled",    label:"Biometric Auth",     desc:"Controls whether users can enable fingerprint/Face ID authorization.",                          danger:false},
    {key:"discoverMap",         label:"Discover Map",       desc:"Controls whether the map view is shown inside the Discover tab.",                               danger:false},
    {key:"maintenanceMode",     label:"Maintenance Mode",   desc:"Blocks ALL users from accessing the app. Show maintenance message below.",                     danger:true},
  ];

  return(
    <div className="fade">
      <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:4}}>Settings</div>
      <div style={{fontSize:12,color:C.sub,marginBottom:16}}>Global controls for the Cosmo platform. Changes take effect immediately for all users.</div>

      {/* ── STATUS OVERVIEW ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
        {[
          {label:"Withdrawals",key:"withdrawalEnabled",icon:"$"},
          {label:"Offerwall",  key:"offerwallsEnabled",icon:"◈"},
          {label:"Gift Cards", key:"giftCardsEnabled", icon:"⬡"},
          {label:"App Live",   key:"maintenanceMode",  icon:"⚡",invert:true},
        ].map(function(s){
          var on=s.invert?!cfg[s.key]:!!cfg[s.key];
          return(
            <div key={s.key} style={{background:on?C.success+"14":C.danger+"14",border:`1px solid ${on?C.success+"33":C.danger+"33"}`,borderRadius:12,padding:"12px 10px",textAlign:"center"}}>
              <div style={{fontSize:16,color:on?C.success:C.danger,marginBottom:4}}>{s.icon}</div>
              <div style={{fontSize:11,fontWeight:700,color:on?C.success:C.danger}}>{on?"ON":"OFF"}</div>
              <div style={{fontSize:9,color:C.sub,textTransform:"uppercase",letterSpacing:.8,marginTop:2}}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── FEATURE TOGGLES ── */}
      <Card style={{padding:"18px 20px",marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Feature Controls</div>
        {featureToggles.map(function(ft,i){
          var on=ft.key==="maintenanceMode"?!cfg[ft.key]:!!cfg[ft.key];
          return(
            <div key={ft.key} style={{display:"flex",alignItems:"flex-start",gap:12,paddingBottom:14,marginBottom:14,borderBottom:i<featureToggles.length-1?`1px solid ${C.div}`:"none"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <span style={{fontSize:13,fontWeight:700,color:C.text}}>{ft.label}</span>
                  <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10,background:on?C.success+"18":C.danger+"18",color:on?C.success:C.danger}}>{on?"ACTIVE":"OFF"}</span>
                  {ft.danger&&<span style={{fontSize:9,color:C.warn,fontWeight:600}}>High Impact</span>}
                </div>
                <div style={{fontSize:11,color:C.sub,lineHeight:1.5}}>{ft.desc}</div>
              </div>
              <Toggle on={ft.key==="maintenanceMode"?!!cfg[ft.key]:!!cfg[ft.key]} onChange={mkToggle(ft.key,ft.label,`${ft.label} is now enabled for all users.`,`${ft.label} is now disabled. Users will see an unavailable message.`,ft.danger)}/>
            </div>
          );
        })}
      </Card>

      {/* ── MAINTENANCE ── */}
      <Card style={{padding:"18px 20px",marginBottom:14,border:cfg.maintenanceMode?`1px solid ${C.warn}55`:`1px solid ${C.border}`}}>
        <div style={{fontSize:13,fontWeight:700,color:cfg.maintenanceMode?C.warn:C.text,marginBottom:12}}>
          {cfg.maintenanceMode?"Maintenance Mode Active":"Maintenance & Updates"}
        </div>
        {cfg.maintenanceMode&&<div style={{background:C.warn+"18",border:`1px solid ${C.warn}44`,borderRadius:8,padding:"10px 14px",fontSize:11,color:C.warn,marginBottom:14}}>
          App is currently blocked for all users. Disable maintenance mode to restore access.
        </div>}
        {[["Maintenance Message","maintenanceMsg","text","Shown to users during maintenance"],["Force Update Min Version","forceUpdateVersion","text","e.g. 1.2.0"],["Force Update Message","forceUpdateMsg","text","Shown when user must update"]].map(function(f){
          return(
            <div key={f[0]} style={{marginBottom:12}}>
              <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>{f[0]} <span style={{color:C.muted,fontWeight:400}}>— {f[3]}</span></div>
              <input type={f[2]} value={cfg[f[1]]||""} onChange={e=>setCfg(p=>({...p,[f[1]]:e.target.value}))} style={{marginBottom:0}}/>
            </div>
          );
        })}
        <button className="btn btn-primary" style={{width:"100%",marginTop:8}} onClick={saveSettings}>Save Maintenance Settings</button>
      </Card>

      {/* ── FINANCIAL CONTROLS ── */}
      <div className="g2" style={{marginBottom:14}}>
        <Card style={{padding:"18px 20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Financial Limits</div>
          {[
            ["Min Withdrawal ($)","minWithdraw","number","Minimum a user can withdraw"],
            ["Max Withdrawal ($)","maxWithdraw","number","Maximum single withdrawal"],
            ["Daily Earning Cap ($)","dailyEarningCap","number","Max earnings per user per day"],
            ["Daily Withdrawal Cap ($)","dailyWithdrawCap","number","Max withdrawals per user per day"],
            ["Referral Bonus ($)","referralBonus","number","Bonus paid per verified referral"],
            ["New User Bonus ($)","newUserBonus","number","Bonus credited on first sign-up (0 to disable)"],
          ].map(function(f){
            return(
              <div key={f[0]} style={{marginBottom:12}}>
                <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>{f[0]}</div>
                <div style={{fontSize:9,color:C.muted,marginBottom:4}}>{f[3]}</div>
                <input type={f[2]} value={cfg[f[1]]||0} onChange={e=>setCfg(p=>({...p,[f[1]]:+e.target.value}))} style={{marginBottom:0}}/>
              </div>
            );
          })}
          <button className="btn btn-primary" style={{width:"100%",marginTop:8}} onClick={saveSettings}>Save Financial</button>
        </Card>

        <Card style={{padding:"18px 20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Streak & Reward Settings</div>
          {[
            ["Min Streak Day to Claim","minStreakClaim","number","Day 1 minimum to qualify for streak claim"],
            ["KYC Threshold ($)","kycThreshold","number","Balance at which KYC is required before withdrawal"],
          ].map(function(f){
            return(
              <div key={f[0]} style={{marginBottom:12}}>
                <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>{f[0]}</div>
                <input type={f[2]} value={cfg[f[1]]||0} onChange={e=>setCfg(p=>({...p,[f[1]]:+e.target.value}))} style={{marginBottom:0}}/>
              </div>
            );
          })}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,marginTop:4}}>
            <div>
              <div style={{fontSize:13,color:C.text,fontWeight:600,marginBottom:2}}>Streak Protection</div>
              <div style={{fontSize:11,color:C.sub}}>Allow users to protect streaks with a freeze token</div>
            </div>
            <Toggle on={!!cfg.streakProtect} onChange={()=>setCfg(p=>({...p,streakProtect:!p.streakProtect}))}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div>
              <div style={{fontSize:13,color:C.text,fontWeight:600,marginBottom:2}}>Require KYC for Withdrawals</div>
              <div style={{fontSize:11,color:C.sub}}>Enforce KYC verification above threshold</div>
            </div>
            <Toggle on={!!cfg.kycRequired} onChange={()=>setCfg(p=>({...p,kycRequired:!p.kycRequired}))}/>
          </div>
          <button className="btn btn-primary" style={{width:"100%",marginTop:4}} onClick={saveSettings}>Save Streak Settings</button>
        </Card>
      </div>

      {/* ── GEOGRAPHIC BLOCKING ── */}
      <Card style={{padding:"18px 20px",marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:6}}>Geographic Blocking</div>
        <div style={{fontSize:11,color:C.sub,marginBottom:14,lineHeight:1.6}}>Block specific countries from accessing Cosmo. Users in blocked countries will see a "not available in your region" message. Use ISO 3166-1 alpha-2 codes (e.g. CN, RU, IR).</div>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <input value={blockInput} onChange={e=>setBlockInput(e.target.value.toUpperCase())} placeholder="e.g. CN" style={{flex:1,marginBottom:0}} maxLength={2}/>
          <button className="btn btn-primary" style={{flexShrink:0}} onClick={()=>{
            if(!blockInput.trim()||blockInput.length>2) return;
            if((cfg.blockedCountries||[]).includes(blockInput)){showToast("Already blocked","error");return;}
            setCfg(p=>({...p,blockedCountries:[...(p.blockedCountries||[]),blockInput]}));
            logAction("Country Blocked",blockInput);
            setBlockInput("");
            showToast(blockInput+" blocked");
          }}>Add</button>
        </div>
        {(cfg.blockedCountries||[]).length>0
          ?<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
            {(cfg.blockedCountries||[]).map(function(cc){
              return <div key={cc} style={{background:C.danger+"18",border:`1px solid ${C.danger}33`,borderRadius:20,padding:"4px 10px",fontSize:12,color:C.danger,display:"flex",alignItems:"center",gap:6,fontFamily:"JetBrains Mono",fontWeight:700}}>
                {cc}<button onClick={()=>{setCfg(p=>({...p,blockedCountries:p.blockedCountries.filter(c=>c!==cc)}));logAction("Country Unblocked",cc);showToast(cc+" unblocked","success");}} style={{background:"none",border:"none",cursor:"pointer",color:C.danger,fontSize:14,padding:0,lineHeight:1}}>×</button>
              </div>;
            })}
          </div>
          :<div style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>No countries blocked — app available globally</div>
        }
      </Card>

      {/* ── DANGER ZONE ── */}
      <Card style={{padding:"18px 20px",border:`1px solid ${C.danger}33`}}>
        <div style={{fontSize:13,fontWeight:700,color:C.danger,marginBottom:12}}>Danger Zone</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <button className="btn" style={{background:C.danger+"18",color:C.danger,border:`1px solid ${C.danger}44`,textAlign:"left",padding:"12px 16px"}} onClick={()=>doConfirm("Reset All Feature Flags","This will re-enable all features (offerwalls, gifts, withdrawals, etc) and disable maintenance mode. Use to quickly restore after emergency shutdown.",()=>{setCfg(p=>({...p,withdrawalEnabled:true,giftCardsEnabled:true,offerwallsEnabled:true,tasksEnabled:true,discoverEnabled:true,competitionsEnabled:true,referralsEnabled:true,maintenanceMode:false}));showToast("All features restored","success");},true)}>
            Reset All Features to Default (Emergency Restore)
          </button>
          <button className="btn" style={{background:C.danger+"18",color:C.danger,border:`1px solid ${C.danger}44`,textAlign:"left",padding:"12px 16px"}} onClick={()=>doConfirm("Emergency Shutdown","This will simultaneously disable ALL user-facing features and enable maintenance mode. Use only in a critical security incident.",()=>{setCfg(p=>({...p,withdrawalEnabled:false,giftCardsEnabled:false,offerwallsEnabled:false,tasksEnabled:false,maintenanceMode:true}));logAction("Emergency Shutdown","All features disabled");showToast("Emergency shutdown — all features disabled","error");},true)}>
            Emergency Full Shutdown (Disable Everything)
          </button>
        </div>
      </Card>
    </div>
  );
}


function PgFraud({C,users,fraud,setFraud,banUser,unbanUser,saveSettings,setPage}){
  const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,...style}}>{children}</div>;
  return(
      <div className="fade">
<div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:14}}>Fraud & Bans</div>
<div className="g2" style={{marginBottom:14}}>
  <Kpi label="High Risk" val={users.filter(u=>u.risk>=70).length} color={C.danger} C={C}/>
  <Kpi label="Banned" val={users.filter(u=>u.status==="banned").length} color={C.sub} C={C}/>
</div>
<Card style={{padding:"16px 18px",marginBottom:12}}>
  <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:C.text}}>⚠ Flagged Users</div>
  {users.filter(u=>u.risk>=40).map((u,i)=>(
    <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:C.panel,borderRadius:9,marginBottom:8,border:`1px solid ${u.risk>=70?C.danger+"44":C.warn+"44"}`}}>
      <div style={{fontSize:18}}>{u.risk>=70?"🔴":"🟡"}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:3}}>
          <span style={{fontWeight:700,color:C.text}}>{u.handle}</span><RiskBadge score={u.risk}/><StatusBadge s={u.status}/>
        </div>
        <div style={{fontSize:11,color:C.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.notes||"Flagged by system"} · {u.ip}</div>
      </div>
      <div style={{display:"flex",gap:6,flexShrink:0}}>
        {u.status!=="banned"?<button className="btn btn-danger" style={{fontSize:11}} onClick={()=>banUser(u.id,"Banned from fraud panel")}>⊘ Ban</button>:<button className="btn btn-success" style={{fontSize:11}} onClick={()=>unbanUser(u.id)}>✓ Unban</button>}
        <button className="btn btn-ghost" style={{fontSize:11}} onClick={()=>setPage("users")}>View</button>
      </div>
    </div>
  ))}
  {users.filter(u=>u.risk>=40).length===0&&<div style={{color:C.sub,fontSize:12}}>No flagged users.</div>}
</Card>
<Card style={{padding:"16px 18px"}}>
  <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:C.text}}>⚙ Fraud Rules</div>
  <div style={{marginBottom:14}}>
    <div style={{fontSize:12,color:C.text,marginBottom:6}}>Max Accounts per Device</div>
    <input type="number" value={fraud.maxAccounts} onChange={e=>setFraud(p=>({...p,maxAccounts:+e.target.value}))} style={{width:72}}/>
  </div>
  {[["VPN Detection","vpnDetect"],["Auto-Ban (score 90+)","autoBan"]].map(([l,k])=>(
    <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <span style={{fontSize:13,color:C.text}}>{l}</span>
      <Toggle on={fraud[k]} onChange={()=>setFraud(p=>({...p,[k]:!p[k]}))}/>
    </div>
  ))}
  <button className="btn btn-primary" onClick={saveSettings}>Save Rules</button>
</Card>
      </div>
  );
}

/* ── API KEYS ── */
function PgApiKeys({C,keys,setKeys,showToast,doConfirm,logAction}){
  const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,...style}}>{children}</div>;
  return(
      <div className="fade">
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,gap:10}}>
  <div style={{fontSize:16,fontWeight:800,color:C.text}}>API Keys</div>
  <button className="btn btn-primary" onClick={()=>showToast("Add key — connect backend first","error")}>+ Add</button>
</div>
<div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",marginBottom:14,fontSize:12,color:C.sub}}>
  🔐 Keys are masked. Full values are only shown once on creation and stored encrypted server-side.
</div>
{keys.map((k,i)=>(
  <Card key={i} style={{padding:"16px 18px",marginBottom:10}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
      <span style={{fontSize:16}}>🔑</span>
      <span style={{fontSize:14,fontWeight:800,color:C.text}}>{k.name}</span>
      <StatusBadge s={k.status}/>
      <div style={{marginLeft:"auto",display:"flex",gap:7}}>
        <button className="btn btn-ghost" style={{fontSize:11}} onClick={()=>{logAction("Key Rotated",k.name);showToast(`${k.name} rotated`);}}>↺ Rotate</button>
        <button className="btn btn-danger" style={{fontSize:11}} onClick={()=>doConfirm("Delete Key",`Delete "${k.name}"?`,()=>{setKeys(p=>p.filter(x=>x.name!==k.name));logAction("Key Deleted",k.name);},"error")}>✕</button>
      </div>
    </div>
    <div className="g2" style={{gap:8}}>
      {[["Key",k.key],["Endpoint",k.endpoint],["Last Used",k.lastUsed]].map(([l,v])=>(
        <div key={l} style={{background:C.panel,borderRadius:7,padding:"9px 11px",border:`1px solid ${C.div}`}}>
          <div style={{fontSize:8,color:C.sub,textTransform:"uppercase",letterSpacing:1.5,marginBottom:3}}>{l}</div>
          <code style={{fontSize:11,fontFamily:"JetBrains Mono",color:C.silver,wordBreak:"break-all"}}>{v}</code>
        </div>
      ))}
    </div>
  </Card>
))}
      </div>
  );
}

/* ══════════════════════════════════════════════════════
   COMPETITION / SCRATCH / LEADERBOARDS COMPONENTS
══════════════════════════════════════════════════════ */

function PgCompetitions({C,comps,setComps,users,setUsers,showToast,doConfirm,logAction}){
  const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,...style}}>{children}</div>;
  const [filter,setFilter]=useState("active");
  const [showForm,setShowForm]=useState(false);
  const [editId,setEditId]=useState(null);
  const emptyForm={name:"",prize:0,entryCost:1,maxEntries:1000,winners:1,ends:"",drawType:"Random Draw",tag:"Weekly Draw",desc:"",requirements:"",prizeBreakdown:"",status:"active"};
  const [form,setForm]=useState(emptyForm);

  const filtered=comps.filter(c=>filter==="all"?true:c.status===filter);
  const active=comps.filter(c=>c.status==="active");
  const completed=comps.filter(c=>c.status==="completed");
  const cancelled=comps.filter(c=>c.status==="cancelled");
  const totalPrize=comps.reduce((a,c)=>a+c.prize,0);

  function openNew(){setForm(emptyForm);setEditId(null);setShowForm(true);}
  function openEdit(c){setForm({...c});setEditId(c.id);setShowForm(true);}

  function saveComp(){
    if(!form.name.trim()){showToast("Competition name required","error");return;}
    if(!form.prize||form.prize<=0){showToast("Prize amount required","error");return;}
    if(!form.ends){showToast("End date required","error");return;}
    if(form.winners<1){showToast("At least 1 winner required","error");return;}
    if(editId){
      setComps(p=>p.map(c=>c.id===editId?{...c,...form,winners:+form.winners,prize:+form.prize,entryCost:+form.entryCost,maxEntries:+form.maxEntries}:c));
      logAction("Competition Updated",form.name);showToast("Competition updated");
    } else {
      setComps(p=>[...p,{...form,id:"c"+Date.now(),entries:0,joined:[],entrantIds:[],winners:+form.winners,prize:+form.prize,entryCost:+form.entryCost,maxEntries:+form.maxEntries,winners_drawn:[],created:new Date().toLocaleDateString()}]);
      logAction("Competition Created",form.name);showToast("Competition created");
    }
    setShowForm(false);
  }

  function pickWinners(c){
    const eligible=users.filter(u=>(c.entrantIds||[]).includes(u.id)&&u.status==="active");
    if(eligible.length<c.winners){showToast(`Only ${eligible.length} eligible entrants — need ${c.winners}`,"error");return;}
    const shuffled=[...eligible].sort(()=>Math.random()-0.5);
    const drawn=shuffled.slice(0,c.winners);
    const names=drawn.map(u=>u.handle).join(", ");
    const prizeEach=+(c.prize/c.winners).toFixed(2);
    doConfirm("Confirm Winner Draw",`Draw ${c.winners} winner${c.winners>1?"s":""} from ${eligible.length} eligible entrants?

Selected: ${names}
Prize: $${prizeEach} each`,()=>{
      setComps(p=>p.map(x=>x.id===c.id?{...x,status:"completed",winners_drawn:drawn.map(u=>u.handle)}:x));
      if(setUsers)setUsers(p=>p.map(u=>{const w=drawn.find(d=>d.id===u.id);return w?{...u,balance:+(u.balance+prizeEach).toFixed(2),totalEarned:+(u.totalEarned+prizeEach).toFixed(2)}:u;}));
      logAction("Competition Draw+Prize",`${c.name} — Winners: ${names} — $${prizeEach} each`);
      showToast(`Winners drawn & $${prizeEach} credited to each winner`);
    },false);
  }

  function cancelComp(c){
    doConfirm("Cancel Competition",`Cancel "${c.name}"? Users who paid entry fees should be refunded. This action moves the competition to Cancelled status.`,()=>{
      setComps(p=>p.map(x=>x.id===c.id?{...x,status:"cancelled"}:x));
      logAction("Competition Cancelled",c.name);showToast("Competition cancelled — issue refunds if entry fee was charged","error");
    },true);
  }

  function deleteComp(c){
    doConfirm("Delete Competition",`Permanently delete "${c.name}"? This cannot be undone.`,()=>{
      setComps(p=>p.filter(x=>x.id!==c.id));
      logAction("Competition Deleted",c.name);showToast("Competition deleted","error");
    },true);
  }

  const statusColor=s=>s==="active"?C.success:s==="completed"?C.silver:C.danger;

  return(
    <div className="fade">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div style={{fontSize:16,fontWeight:800,color:C.text}}>Competitions</div>
        <button className="btn btn-primary" onClick={openNew}>+ New Competition</button>
      </div>
      <div style={{fontSize:12,color:C.sub,marginBottom:14}}>Create and manage prize competitions. Draw winners, track entries, and archive results.</div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
        {[["Active",active.length,"⬡",C.success],["Completed",completed.length,"◎",C.silver],["Cancelled",cancelled.length,"⊘",C.danger],["Total Prize Pool","$"+totalPrize.toLocaleString(),"$",C.gold]].map(s=>(
          <Card key={s[0]} style={{padding:"13px 14px",cursor:s[0]!=="Total Prize Pool"?"pointer":"default"}} onClick={()=>s[0]!=="Total Prize Pool"&&setFilter(s[0].toLowerCase())}>
            <div style={{fontSize:18,color:s[3],marginBottom:5}}>{s[2]}</div>
            <div style={{fontSize:18,fontWeight:800,fontFamily:"JetBrains Mono",color:C.text}}>{s[1]}</div>
            <div style={{fontSize:10,color:C.sub,textTransform:"uppercase",letterSpacing:.8,marginTop:2}}>{s[0]}</div>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        {["active","completed","cancelled","all"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?C.silver:"transparent",color:filter===f?C.bg:C.sub,border:`1px solid ${filter===f?"transparent":C.border}`,borderRadius:20,padding:"5px 14px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"Outfit",textTransform:"capitalize"}}>{f}</button>
        ))}
      </div>

      {/* Competition list */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map(c=>{
          const fill=Math.round((c.entries||0)/c.maxEntries*100);
          const sc=statusColor(c.status);
          return(
            <Card key={c.id} style={{padding:"16px 18px",border:`1px solid ${sc}33`}}>
              <div style={{height:3,background:`linear-gradient(90deg,${sc},${sc}66)`,borderRadius:3,marginBottom:14}}/>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:12}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:5}}>
                    <span style={{fontSize:15,fontWeight:800,color:C.text}}>{c.name}</span>
                    <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:10,background:sc+"18",color:sc,textTransform:"uppercase"}}>{c.status}</span>
                    {c.tag&&<span style={{fontSize:9,color:C.sub,border:`1px solid ${C.border}`,padding:"2px 7px",borderRadius:10}}>{c.tag}</span>}
                  </div>
                  <div style={{display:"flex",gap:14,fontSize:11,color:C.sub,flexWrap:"wrap"}}>
                    <span>Prize: <b style={{color:C.gold,fontFamily:"JetBrains Mono"}}>${c.prize}</b></span>
                    <span>Entry: <b style={{color:C.silver,fontFamily:"JetBrains Mono"}}>{c.entryCost===0?"Free":"$"+c.entryCost}</b></span>
                    <span>Entries: <b style={{color:C.chrome,fontFamily:"JetBrains Mono"}}>{c.entries||0}/{c.maxEntries}</b></span>
                    <span>Winners: <b style={{color:C.gold}}>{c.winners}</b></span>
                    <span>Draw: <b style={{color:C.silver}}>{c.drawType}</b></span>
                    <span>Ends: <b style={{color:C.warn}}>{c.ends}</b></span>
                  </div>
                  {/* Progress bar */}
                  <div style={{marginTop:10}}>
                    <div style={{height:4,background:C.panel,borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:4,width:fill+"%",background:`linear-gradient(90deg,${C.silver},${C.gold})`,borderRadius:2,transition:"width .5s"}}/>
                    </div>
                    <div style={{fontSize:9,color:C.muted,marginTop:3}}>{fill}% full</div>
                  </div>
                  {/* Winners drawn */}
                  {c.status==="completed"&&(c.winners_drawn||[]).length>0&&(
                    <div style={{background:C.success+"14",border:`1px solid ${C.success}33`,borderRadius:8,padding:"8px 12px",marginTop:10,fontSize:11,color:C.success}}>
                      Winners: {c.winners_drawn.join(", ")}
                    </div>
                  )}
                  {c.status==="cancelled"&&(
                    <div style={{background:C.danger+"14",border:`1px solid ${C.danger}33`,borderRadius:8,padding:"8px 12px",marginTop:10,fontSize:11,color:C.danger}}>
                      Cancelled — verify entry fee refunds were processed
                    </div>
                  )}
                </div>
                {/* Actions */}
                <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
                  {c.status==="active"&&<button className="btn btn-success" style={{fontSize:11}} onClick={()=>pickWinners(c)}>Draw Winners</button>}
                  {c.status==="active"&&<button onClick={()=>openEdit(c)} style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",color:C.silver,fontSize:11,fontFamily:"Outfit",fontWeight:600}}>Edit</button>}
                  {c.status==="active"&&<button onClick={()=>cancelComp(c)} style={{background:C.warn+"18",border:`1px solid ${C.warn}44`,borderRadius:8,padding:"6px 12px",cursor:"pointer",color:C.warn,fontSize:11,fontFamily:"Outfit",fontWeight:600}}>Cancel</button>}
                  <button onClick={()=>deleteComp(c)} style={{background:C.danger+"18",border:`1px solid ${C.danger}44`,borderRadius:8,padding:"6px 12px",cursor:"pointer",color:C.danger,fontSize:11,fontFamily:"Outfit",fontWeight:600}}>Delete</button>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length===0&&<div style={{textAlign:"center",padding:"40px 20px",color:C.muted,fontSize:13}}>No {filter} competitions</div>}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(4px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:C.surf,borderRadius:18,padding:"24px",width:"100%",maxWidth:600,maxHeight:"90vh",overflowY:"auto",border:"1px solid "+C.border}}>
          <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:16}}>{editId?"Edit Competition":"Create Competition"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            {[["Name","text","name"],["Tag (badge)","text","tag"],["Prize Pool ($)","number","prize"],["Entry Cost ($, 0 = free)","number","entryCost"],["Max Entries","number","maxEntries"],["Number of Winners","number","winners"],["End Date","date","ends"],["Draw Type","text","drawType"]].map(f=>(
              <div key={f[2]} style={{gridColumn:f[2]==="name"?"span 2":"span 1"}}>
                <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>{f[0]}</div>
                <input type={f[1]} value={form[f[2]]||""} min={f[1]==="number"?0:undefined} onChange={e=>setForm(p=>({...p,[f[2]]:f[1]==="number"?+e.target.value:e.target.value}))} style={{marginBottom:0}}/>
              </div>
            ))}
          </div>
          {[["Description","desc","Describe what this competition is about"],["Requirements (one per line)","requirements","e.g. Must have earned this week"],["Prize Breakdown (one per line)","prizeBreakdown","e.g. 1st: $300, 2nd: $150, 3rd: $50"]].map(f=>(
            <div key={f[1]} style={{marginBottom:12}}>
              <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>{f[0]}</div>
              <textarea value={form[f[1]]||""} onChange={e=>setForm(p=>({...p,[f[1]]:e.target.value}))} placeholder={f[2]} rows={3} style={{width:"100%",background:C.panel,border:`1px solid ${C.border}`,color:C.text,borderRadius:10,padding:"10px 12px",fontFamily:"Outfit",fontSize:13,outline:"none",resize:"vertical"}}/>
            </div>
          ))}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>Status</div>
            <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={{width:"100%",marginBottom:0}}>
              {["active","completed","cancelled"].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button className="btn btn-primary" style={{flex:1}} onClick={saveComp}>Save Competition</button>
            <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setShowForm(false)}>Cancel</button>
          </div>
        </div>
      </div>}
    </div>
  );
}


function PgScratch({C,cards,setCards,showToast,doConfirm,logAction}){
  const [editId,setEditId]=useState(null);
  const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,...style}}>{children}</div>;
  return(
    <div className="fade">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{fontSize:16,fontWeight:800,color:C.text}}>Scratch Cards</div>
        <button className="btn btn-primary" onClick={()=>{setCards(p=>[...p,{id:"sc"+Date.now(),name:"New Card",cost:1,minPrize:0.5,maxPrize:3,winChance:50,status:"active"}]);showToast("Card added");}}>+ Add</button>
      </div>
      <div className="g2">
        {cards.map((sc,i)=>{
          const oc=[C.gold,C.silver,C.chrome][i%3];
          const isE=editId===sc.id;
          return(
            <Card key={sc.id} style={{padding:"16px 18px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <span style={{fontSize:16}}>🎫</span>
                {isE?<input value={sc.name} onChange={e=>setCards(p=>p.map(x=>x.id===sc.id?{...x,name:e.target.value}:x))} style={{fontWeight:800,fontSize:13}}/>:<span style={{fontSize:13,fontWeight:800,flex:1,color:C.text}}>{sc.name}</span>}
                <button className="btn btn-ghost" style={{padding:"4px 9px",fontSize:11}} onClick={()=>setEditId(isE?null:sc.id)}>{isE?"✓":"✎"}</button>
                <button className="btn btn-danger" style={{padding:"4px 9px",fontSize:11}} onClick={()=>doConfirm("Delete",`Delete "${sc.name}"?`,()=>{setCards(p=>p.filter(x=>x.id!==sc.id));logAction("Card Deleted",sc.name);},"error")}>✕</button>
              </div>
              {isE?(
                <div className="g2" style={{gap:8}}>
                  {[["Cost","cost"],["Min Prize","minPrize"],["Max Prize","maxPrize"],["Win %","winChance"]].map(([l,k])=>(
                    <div key={k}><div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>{l}</div><input type="number" value={sc[k]} onChange={e=>setCards(p=>p.map(x=>x.id===sc.id?{...x,[k]:+e.target.value}:x))}/></div>
                  ))}
                </div>
              ):(
                [["Cost",fmt(sc.cost),C.sub],["Min",fmt(sc.minPrize),C.success],["Max",fmt(sc.maxPrize),C.success],["Win",sc.winChance+"%",oc]].map(([l,v,c])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:12}}><span style={{color:C.sub}}>{l}</span><span style={{color:c,fontWeight:700,fontFamily:"JetBrains Mono"}}>{v}</span></div>
                ))
              )}
              <div style={{marginTop:8}}><StatusBadge s={sc.status}/></div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function PgLeaderboards({C,users,doConfirm,logAction,showToast}){
  const [lb,setLb]=useState("earners");
  const [period,setPeriod]=useState("alltime");
  const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,...style}}>{children}</div>;
  const sortedUsers=[...users].sort((a,b)=>{
    if(lb==="earners")   return b.balance-a.balance;
    if(lb==="referrers") return b.refs-a.refs;
    if(lb==="streak")    return (b.streak||5)-(a.streak||5);
    if(lb==="tier"){const t={Gold:3,Silver:2,Bronze:1,Standard:0};return (t[b.tier]||0)-(t[a.tier]||0);}
    return b.balance-a.balance;
  });
  const colLabel={earners:"Balance",referrers:"Refs",streak:"Streak",tier:"Tier"};
  const colVal=(u)=>{
    if(lb==="earners")   return <span style={{fontFamily:"JetBrains Mono",color:C.success,fontWeight:700}}>{fmt(u.balance)}</span>;
    if(lb==="referrers") return <span style={{fontFamily:"JetBrains Mono",color:C.silver,fontWeight:700}}>{u.refs}</span>;
    if(lb==="streak")    return <span style={{color:C.gold,fontWeight:700}}>🔥 {u.streak||5}d</span>;
    if(lb==="tier")      return <Badge label={u.tier} color={u.tier==="Gold"?C.gold:u.tier==="Silver"?C.silver:"#cd7f32"} bg={(u.tier==="Gold"?C.gold:u.tier==="Silver"?C.silver:"#cd7f32")+"22"}/>;
  };
  return(
    <div className="fade">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,gap:10,flexWrap:"wrap"}}>
        <div style={{fontSize:16,fontWeight:800,color:C.text}}>Leaderboards</div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          {/* Period filter */}
          <div style={{display:"flex",gap:3,background:C.panel,padding:3,borderRadius:8,border:"1px solid "+C.border}}>
            {["weekly","monthly","alltime"].map(p=>(
              <button key={p} onClick={()=>setPeriod(p)} style={{background:period===p?C.card:"none",border:`1px solid ${period===p?C.border:"transparent"}`,cursor:"pointer",padding:"5px 10px",borderRadius:6,fontFamily:"Outfit",fontSize:10,fontWeight:700,letterSpacing:.6,textTransform:"uppercase",color:period===p?C.chrome:C.sub,transition:"all .18s"}}>
                {p==="alltime"?"All Time":p.charAt(0).toUpperCase()+p.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn btn-danger" style={{fontSize:11}} onClick={()=>doConfirm("Reset Leaderboard",`Reset the ${lb} leaderboard (${period})?`,()=>{logAction("Leaderboard Reset",`${lb} / ${period}`);showToast("Leaderboard reset");},"error")}>↺ Reset</button>
        </div>
      </div>
      {/* Category tabs */}
      <Tabs tabs={[{id:"earners",label:"Top Earners"},{id:"referrers",label:"Referrers"},{id:"streak",label:"Streaks"},{id:"tier",label:"By Tier"}]} active={lb} set={setLb} C={C}/>
      <Card><div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <THead cols={["Rank","User","Email",colLabel[lb],"Status"]} C={C}/>
          <tbody>{sortedUsers.slice(0,10).map((u,i)=>(
            <tr key={i} style={{borderBottom:`1px solid ${C.div}`}}>
              <td style={{padding:"11px 14px"}}><span style={{fontSize:15,fontWeight:900,color:[C.gold,C.silver,C.pewter][i]||C.sub}}>{["🥇","🥈","🥉"][i]||i+1}</span></td>
              <td style={{padding:"11px 14px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:26,height:26,borderRadius:6,background:C.panel,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:C.silver,border:`1px solid ${C.border}`,flexShrink:0}}>{u.handle[1].toUpperCase()}</div><span style={{fontWeight:700,color:C.text}}>{u.handle}</span>{u.ambassador&&<Badge label="Amb" color={C.gold} bg={C.gold+"18"}/>}</div></td>
              <td style={{padding:"11px 14px",color:C.sub,fontSize:11}}>{u.email}</td>
              <td style={{padding:"11px 14px"}}>{colVal(u)}</td>
              <td style={{padding:"11px 14px"}}><StatusBadge s={u.status}/></td>
            </tr>
          ))}</tbody>
        </table>
      </div></Card>
    </div>
  );
}


/* ======== MAIN APP ======== */
export default function CosmoAdmin(){
  var screen=useState("loading"); var setScreen=screen[1]; screen=screen[0];
  var email=useState(""); var setEmail=email[1]; email=email[0];
  var pass=useState(""); var setPass=pass[1]; pass=pass[0];
  var loginErr=useState(""); var setLoginErr=loginErr[1]; loginErr=loginErr[0];
  var logging=useState(false); var setLogging=logging[1]; logging=logging[0];
  var adminEmail=useState(""); var setAdminEmail=adminEmail[1]; adminEmail=adminEmail[0];
  var theme=useState("dark"); var setTheme=theme[1]; theme=theme[0];
  var page=useState("dashboard"); var setPage=page[1]; page=page[0];
  var sideOpen=useState(true); var setSideOpen=sideOpen[1]; sideOpen=sideOpen[0];
  var isMobile=useState(false); var setIsMobile=isMobile[1]; isMobile=isMobile[0];
  var toast=useState(null); var setToast=toast[1]; toast=toast[0];
  var confirmQ=useState(null); var setConfirmQ=confirmQ[1]; confirmQ=confirmQ[0];
  var users=useState(seedUsers); var setUsers=users[1]; users=users[0];
  var ows=useState(seedOws); var setOws=ows[1]; ows=ows[0];
  var tiers=useState(seedTiers); var setTiers=tiers[1]; tiers=tiers[0];
  var gSplit=useState(62); var setGSplit=gSplit[1]; gSplit=gSplit[0];
  var streaks=useState([0.06,0.09,0.12,0.15,0.18,0.21,0.30]); var setStreaks=streaks[1]; streaks=streaks[0];
  var wds=useState(seedWDs); var setWds=wds[1]; wds=wds[0];
  var comps=useState(seedComps); var setComps=comps[1]; comps=comps[0];
  var cards=useState(seedCards); var setCards=cards[1]; cards=cards[0];
  var refs=useState(seedRefs); var setRefs=refs[1]; refs=refs[0];
  var ambs=useState(seedAmb); var setAmbs=ambs[1]; ambs=ambs[0];
  var keys=useState([]); var setKeys=keys[1]; keys=keys[0];
  var refBonus=useState(1); var setRefBonus=refBonus[1]; refBonus=refBonus[0];
  var cfg=useState({name:"Cosmo",minWithdraw:10,maxWithdraw:500,discoverMap:true,clans:false,auctions:false,scratchCards:true,withdrawalEnabled:true,giftCardsEnabled:true,offerwallsEnabled:true,tasksEnabled:true,discoverEnabled:true,competitionsEnabled:true,referralsEnabled:true,biometricEnabled:true,twoFAEnabled:true,maintenanceMode:false,maintenanceMsg:"We are performing maintenance. Back shortly!",dailyEarningCap:50,dailyWithdrawCap:200,minStreakClaim:1,blockedCountries:[],forceUpdateVersion:"1.0.0",forceUpdateMsg:"Please update Cosmo to the latest version to continue earning.",newUserBonus:0,referralBonus:1,streakProtect:false,kycRequired:false,kycThreshold:50}); var setCfg=cfg[1]; cfg=cfg[0];
  var fraud=useState({maxAccounts:3,vpnDetect:false,autoBan:false}); var setFraud=fraud[1]; fraud=fraud[0];
  var notifForm=useState({title:"",msg:"",target:"All Users"}); var setNotifForm=notifForm[1]; notifForm=notifForm[0];
  var auditLog=useState([]); var setAuditLog=auditLog[1]; auditLog=auditLog[0];

  useEffect(function(){
    var t=setTimeout(function(){setScreen("login");},2200);
    return function(){clearTimeout(t);};
  },[]);

  useEffect(function(){
    function check(){
      var mobile=window.innerWidth<768;
      setIsMobile(mobile);
      setSideOpen(!mobile);
    }
    check();
    window.addEventListener("resize",check);
    return function(){window.removeEventListener("resize",check);};
  },[]);

  useEffect(function(){
    if(screen==="app"){
      function reset(){
        clearTimeout(timerRef.current);
        timerRef.current=setTimeout(function(){
          setScreen("login");
          setAdminEmail("");
          showToast("Session expired","error");
        },30*60*1000);
      }
      reset();
      var evs=["mousedown","keydown","touchstart","scroll"];
      evs.forEach(function(e){window.addEventListener(e,reset);});
      return function(){
        clearTimeout(timerRef.current);
        evs.forEach(function(e){window.removeEventListener(e,reset);});
      };
    }
  },[screen]);

  var C=MK[theme];
  var isDark=theme==="dark";

  function showToast(msg,type){setToast({msg:msg,type:type||"success"});}

  function doConfirm(title,msg,onOk,danger){
    setConfirmQ({title:title,msg:msg,onOk:onOk,danger:danger!==false});
  }

  function logAction(action,detail){
    setAuditLog(function(p){
      return [{id:Date.now(),action:action,detail:detail,admin:adminEmail||"admin",ts:new Date().toLocaleString()}].concat(p.slice(0,199));
    });
  }

  var totalRev=ows.reduce(function(a,o){return a+o.revenue;},0);
  var provPay=ows.reduce(function(a,o){return a+o.revenue*(o.providerCut/100);},0);
  var yourCut=totalRev-provPay;
  var userLiab=yourCut*(gSplit/100);
  var netProfit=yourCut-userLiab;
  var burnRate=userLiab/30;

  function banUser(id,reason){
    var u=users.filter(function(x){return x.id===id;})[0];
    doConfirm("Ban User","Ban "+(u&&u.handle)+"?",function(){
      setUsers(function(p){return p.map(function(x){return x.id===id?Object.assign({},x,{status:"banned"}):x;});});
      logAction("User Banned",(u&&u.handle)+" — "+(reason||"No reason"));
      showToast((u&&u.handle)+" banned","error");
    });
  }

  function unbanUser(id){
    var u=users.filter(function(x){return x.id===id;})[0];
    doConfirm("Unban User","Unban "+(u&&u.handle)+"?",function(){
      setUsers(function(p){return p.map(function(x){return x.id===id?Object.assign({},x,{status:"active"}):x;});});
      logAction("User Unbanned",(u&&u.handle));
      showToast((u&&u.handle)+" unbanned");
    },false);
  }

  function adjustBalance(id,delta,reason){
    var u=users.filter(function(x){return x.id===id;})[0];
    var d=clamp(delta,-500,500);
    setUsers(function(p){return p.map(function(x){return x.id===id?Object.assign({},x,{balance:Math.max(0,x.balance+d)}):x;});});
    logAction("Balance Adjusted",(u&&u.handle)+" "+(d>0?"+":"")+fmt(d)+" — "+reason);
    showToast("Balance "+(d>0?"+":"")+fmt(d));
  }

  function saveNotes(id,notes){
    var u=users.filter(function(x){return x.id===id;})[0];
    setUsers(function(p){return p.map(function(x){return x.id===id?Object.assign({},x,{notes:notes}):x;});});
    logAction("Notes Updated",(u&&u.handle));
    showToast("Notes saved");
  }

  function approveWD(id){
    var w=wds.filter(function(x){return x.id===id;})[0];
    doConfirm("Approve Withdrawal","Approve $"+(w&&w.amount)+" for "+(w&&w.user)+"? Balance will be deducted.",function(){
      setWds(function(p){return p.map(function(x){return x.id===id?Object.assign({},x,{status:"approved"}):x;});});
      setUsers(function(p){return p.map(function(x){return x.id===(w&&w.userId)?Object.assign({},x,{balance:Math.max(0,x.balance-(w&&w.amount))}):x;});});
      logAction("Withdrawal Approved",(w&&w.user)+" $"+(w&&w.amount));
      showToast("Withdrawal approved");
    },false);
  }

  function rejectWD(id){
    var w=wds.filter(function(x){return x.id===id;})[0];
    doConfirm("Reject Withdrawal","Reject $"+(w&&w.amount)+" for "+(w&&w.user)+"? Their balance will be refunded.",function(){
      setWds(function(p){return p.map(function(x){return x.id===id?Object.assign({},x,{status:"rejected"}):x;});});
      setUsers(function(p){return p.map(function(x){return x.id===(w&&w.userId)?Object.assign({},x,{balance:+(x.balance+(w&&w.amount||0)).toFixed(2)}):x;});});
      logAction("Withdrawal Rejected + Refunded",(w&&w.user)+" — $"+(w&&w.amount)+" refunded");
      showToast("Rejected & refunded to user","error");
    });
  }

  function saveSettings(){logAction("Settings Saved","Config updated");showToast("Settings saved");}

  function doLogin(){
    setLoginErr("");
    if(!email.trim()||!pass){setLoginErr("Enter your credentials.");return;}
    setLogging(true);
    setTimeout(function(){
      if(email==="admin@cosmo.app"&&pass==="admin"){
        setAdminEmail(email);
        setScreen("app");
      } else {
        setLoginErr("Invalid email or password.");
      }
      setLogging(false);
    },1100);
  }

  function doLogout(){
    doConfirm("Sign Out","Sign out of Cosmo Admin?",function(){
      setScreen("login");
      setAdminEmail("");
      setPass("");
      setPage("dashboard");
    },false);
  }

  function navTo(id){
    setPage(id);
    if(isMobile) setSideOpen(false);
  }

  var NAV=[
    /* ── Overview ── */
    {id:"dashboard",   icon:"▣",label:"Dashboard",  group:"Overview"},
    {id:"analytics",   icon:"▲",label:"Analytics",   group:"Overview"},
    /* ── Users ── */
    {id:"users",       icon:"◎",label:"Users",        group:"Users"},
    {id:"kyc",         icon:"⊡",label:"KYC",           group:"Users"},
    {id:"fraud",       icon:"⊘",label:"Fraud & Bans",  group:"Users"},
    {id:"support",     icon:"◑",label:"Support",        group:"Users"},
    /* ── Earn ── */
    {id:"offerwalls",  icon:"◈",label:"Offerwalls",     group:"Earn"},
    {id:"tasks",       icon:"◫",label:"Tasks",           group:"Earn"},
    /* ── Engagement ── */
    {id:"competitions",icon:"⬡",label:"Competitions",  group:"Engage"},
    {id:"leaderboards",icon:"⬟",label:"Leaderboards",  group:"Engage"},
    {id:"streaks",     icon:"⊛",label:"Streaks",        group:"Engage"},
    {id:"referrals",   icon:"◇",label:"Referrals",      group:"Engage"},
    {id:"ambassadors", icon:"♛",label:"Ambassadors",    group:"Engage"},
    {id:"scratch",     icon:"⬜",label:"Scratch Cards",  group:"Engage"},
    /* ── Money ── */
    {id:"cashflow",    icon:"$",label:"Revenue",         group:"Money"},
    {id:"wdmethods",   icon:"⊞",label:"Withdrawals",    group:"Money"},
    {id:"giftcards",   icon:"◻",label:"Gift Cards",     group:"Money"},
    {id:"tiers",       icon:"◬",label:"Tiers",           group:"Money"},
    /* ── Platform ── */
    {id:"notifications",icon:"⌁",label:"Notifications", group:"Platform"},
    {id:"discover",    icon:"⊕",label:"Discover",        group:"Platform"},
    {id:"postbacklog", icon:"⌬",label:"Postbacks",       group:"Platform"},
    {id:"apikeys",     icon:"⌗",label:"API Keys",        group:"Platform"},
    {id:"auditlog",    icon:"⊟",label:"Audit Log",       group:"Platform"},
    {id:"settings",    icon:"⚙",label:"Settings",        group:"Platform"},
    /* ── Admin ── */
    {id:"profile",     icon:"⊙",label:"My Profile",     group:"Admin"}
  ];

  var pendingWDs=wds.filter(function(w){return w.status==="pending";}).length;

  var css="@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');"+
    "*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}"+
    "html,body,#root{height:100%;overflow:hidden}"+
    "html{-webkit-text-size-adjust:100%}"+
    "::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-thumb{background:"+C.muted+";border-radius:2px}"+
    "input,textarea,select{background:"+C.panel+";border:1px solid "+C.border+";color:"+C.text+";border-radius:8px;padding:8px 12px;font-family:Outfit;font-size:13px;outline:none;transition:border-color .2s;width:100%}"+
    "input:focus,textarea:focus,select:focus{border-color:"+C.silver+";box-shadow:0 0 0 3px "+C.silver+"14}"+
    "select option{background:"+C.card+";color:"+C.text+"}"+
    "input[type=range]{-webkit-appearance:none;height:3px;background:"+C.muted+";border-radius:2px;outline:none;cursor:pointer;padding:0;border:none}"+
    "input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:"+C.chrome+";border:2px solid "+C.silver+";cursor:pointer}"+
    "@keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}"+
    "@keyframes spin{to{transform:rotate(360deg)}}"+
    "@keyframes glint{0%{background-position:200% center}100%{background-position:-200% center}}"+
    ".fade{animation:up .35s ease both}"+
    ".shine{background:linear-gradient(105deg,"+C.muted+" 0%,"+C.chrome+" 35%,"+C.silver+" 50%,"+C.chrome+" 65%,"+C.muted+" 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:glint 3.5s linear infinite}"+
    ".btn{border:none;border-radius:9px;padding:8px 16px;font-family:Outfit;font-size:12px;font-weight:700;cursor:pointer;letter-spacing:.4px;transition:all .18s;white-space:nowrap}"+
    ".btn:hover{opacity:.85;transform:translateY(-1px)}"+
    ".btn-primary{background:"+C.silver+";color:"+(isDark?"#000":"#fff")+"}"+
    ".btn-ghost{background:"+C.panel+";color:"+C.sub+";border:1px solid "+C.border+"}"+
    ".btn-ghost:hover{color:"+C.text+"}"+
    ".btn-danger{background:"+C.danger+"20;color:"+C.danger+";border:1px solid "+C.danger+"40}"+
    ".btn-success{background:"+C.success+"20;color:"+C.success+";border:1px solid "+C.success+"40}"+
    ".btn-warn{background:"+C.warn+"20;color:"+C.warn+";border:1px solid "+C.warn+"40}"+
    ".nav-btn{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;transition:all .15s;border:none;background:none;width:100%;text-align:left;font-family:Outfit;color:"+C.sub+";white-space:nowrap}"+
    ".nav-btn:hover{background:"+C.card+";color:"+C.text+"}"+
    ".nav-btn.active{background:"+C.card+";color:"+C.chrome+";border:1px solid "+C.border+"}"+
    ".g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}"+
    "@media(max-width:600px){.g2{grid-template-columns:1fr!important}}";

  /* Page lookup - no renderPage function, direct conditional */
  var activePage=null;
  if(page==="dashboard")    activePage=<PgDashboard C={C} users={users} wds={wds} totalRev={totalRev} navTo={navTo}/>;
  else if(page==="users")   activePage=<PgUsers C={C} users={users} setUsers={setUsers} refs={refs} banUser={banUser} unbanUser={unbanUser} adjustBalance={adjustBalance} saveNotes={saveNotes} auditLog={auditLog} showToast={showToast} doConfirm={doConfirm} logAction={logAction}/>;
  else if(page==="cashflow") activePage=<PgCashFlow C={C} ows={ows} tiers={tiers} setTiers={setTiers} gSplit={gSplit} setGSplit={setGSplit} wds={wds} approveWD={approveWD} rejectWD={rejectWD} totalRev={totalRev} provPay={provPay} yourCut={yourCut} userLiab={userLiab} netProfit={netProfit} burnRate={burnRate} saveSettings={saveSettings} withdrawalEnabled={cfg.withdrawalEnabled} navTo={navTo}/>;
  else if(page==="offerwalls") activePage=<PgOfferwalls C={C} ows={ows} setOws={setOws} showToast={showToast} doConfirm={doConfirm} logAction={logAction}/>;
  else if(page==="auditlog") activePage=<PgAuditLog C={C} auditLog={auditLog} navTo={navTo} showToast={showToast} doConfirm={doConfirm} logAction={logAction}/>;
  else if(page==="tiers")    activePage=<PgTiers C={C} tiers={tiers} setTiers={setTiers} users={users} gSplit={gSplit} saveSettings={saveSettings} showToast={showToast} logAction={logAction}/>;
  else if(page==="kyc")      activePage=<PgKYC C={C} users={users} setUsers={setUsers} showToast={showToast} doConfirm={doConfirm} logAction={logAction}/>;
  else if(page==="giftcards") activePage=<PgGiftCards C={C} users={users} showToast={showToast} doConfirm={doConfirm} logAction={logAction}/>;
  else if(page==="wdmethods") activePage=<PgWithdrawalMethods C={C} showToast={showToast} doConfirm={doConfirm} logAction={logAction} saveSettings={saveSettings}/>;
  else if(page==="postbacklog") activePage=<PgPostbackLog C={C} ows={ows} users={users} showToast={showToast} doConfirm={doConfirm} logAction={logAction}/>;
  else if(page==="support")  activePage=<PgSupport C={C} users={users} showToast={showToast} doConfirm={doConfirm} logAction={logAction}/>;
  else if(page==="tasks")    activePage=<PgTasks C={C} showToast={showToast} logAction={logAction} doConfirm={doConfirm}/>;
  else if(page==="profile")  activePage=<PgAdminProfile C={C} adminEmail={adminEmail} setAdminEmail={setAdminEmail} showToast={showToast} doConfirm={doConfirm} logAction={logAction} doLogout={doLogout}/>;
  else if(page==="analytics") activePage=<PgAnalytics C={C} users={users} ows={ows} totalRev={totalRev} netProfit={netProfit} isDark={isDark}/>;
  else if(page==="notifications") activePage=<PgNotifications C={C} users={users} ambs={ambs} notifForm={notifForm} setNotifForm={setNotifForm} showToast={showToast} doConfirm={doConfirm} logAction={logAction}/>;
  else if(page==="discover") activePage=<PgDiscover C={C} cfg={cfg} setCfg={setCfg} isDark={isDark} showToast={showToast} doConfirm={doConfirm} logAction={logAction}/>;
  else if(page==="referrals") activePage=<PgReferrals C={C} refs={refs} setRefs={setRefs} refBonus={refBonus} setRefBonus={setRefBonus} saveSettings={saveSettings} showToast={showToast} logAction={logAction}/>;
  else if(page==="ambassadors") activePage=<PgAmbassadors C={C} ambs={ambs} setAmbs={setAmbs} users={users} setUsers={setUsers} showToast={showToast} doConfirm={doConfirm} logAction={logAction}/>;
  else if(page==="streaks")  activePage=<PgStreaks C={C} streaks={streaks} setStreaks={setStreaks} users={users} showToast={showToast} logAction={logAction}/>;
  else if(page==="competitions") activePage=<PgCompetitions C={C} comps={comps} setComps={setComps} users={users} setUsers={setUsers} showToast={showToast} doConfirm={doConfirm} logAction={logAction}/>;
  else if(page==="scratch")  activePage=<PgScratch C={C} cards={cards} setCards={setCards} showToast={showToast} doConfirm={doConfirm} logAction={logAction}/>;
  else if(page==="settings") activePage=<PgSettings C={C} cfg={cfg} setCfg={setCfg} adminEmail={adminEmail} gSplit={gSplit} setGSplit={setGSplit} tiers={tiers} setTiers={setTiers} saveSettings={saveSettings} doLogout={doLogout} showToast={showToast} doConfirm={doConfirm} logAction={logAction}/>;
  else if(page==="fraud")    activePage=<PgFraud C={C} users={users} fraud={fraud} setFraud={setFraud} banUser={banUser} unbanUser={unbanUser} saveSettings={saveSettings} setPage={navTo}/>;
  else if(page==="leaderboards") activePage=<PgLeaderboards C={C} users={users} doConfirm={doConfirm} logAction={logAction} showToast={showToast}/>;
  else if(page==="apikeys")  activePage=<PgApiKeys C={C} keys={keys} setKeys={setKeys} showToast={showToast} doConfirm={doConfirm} logAction={logAction}/>;
  else activePage=<div style={{color:C.sub,padding:20}}>Page not found</div>;

  if(screen==="loading") return(
    <div style={{height:"100vh",background:"#06070d",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"Outfit"}}>
      <style>{"@keyframes glint{0%{background-position:200% center}100%{background-position:-200% center}}@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      <div style={{width:80,height:80,borderRadius:18,overflow:"hidden",border:"1.5px solid rgba(180,185,230,.15)",marginBottom:22}}>
        <img src={LOGO} alt="Cosmo" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
      </div>
      <div style={{fontSize:24,fontWeight:900,letterSpacing:6,background:"linear-gradient(105deg,#252840 0%,#dde1f5 35%,#adb1cc 50%,#dde1f5 65%,#252840 100%)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"glint 2.5s linear infinite",marginBottom:6}}>COSMO</div>
      <div style={{fontSize:10,color:"#52556e",letterSpacing:2,textTransform:"uppercase",marginBottom:30}}>Admin Panel</div>
      <div style={{width:30,height:30,borderRadius:"50%",border:"2.5px solid rgba(180,185,230,.1)",borderTopColor:"#adb1cc",animation:"spin 0.9s linear infinite"}}/>
    </div>
  );

  if(screen==="login") return(
    <div style={{height:"100vh",background:"#06070d",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Outfit",padding:"16px"}}>
      <style>{"@keyframes glint{0%{background-position:200% center}100%{background-position:-200% center}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}"}</style>
      <div style={{width:"100%",maxWidth:400,animation:"up .5s ease both"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:60,height:60,borderRadius:14,overflow:"hidden",border:"1.5px solid rgba(180,185,230,.15)",margin:"0 auto 12px"}}>
            <img src={LOGO} alt="Cosmo" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          </div>
          <div style={{fontSize:18,fontWeight:900,letterSpacing:4,background:"linear-gradient(105deg,#252840 0%,#dde1f5 35%,#adb1cc 50%,#dde1f5 65%,#252840 100%)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"glint 3s linear infinite",marginBottom:4}}>COSMO</div>
          <div style={{fontSize:9,color:"#52556e",letterSpacing:2,textTransform:"uppercase"}}>Admin Panel</div>
        </div>
        <div style={{background:"#0e0f18",border:"1px solid rgba(180,185,230,.08)",borderRadius:18,padding:"28px",boxShadow:"0 28px 72px rgba(0,0,0,.6)"}}>
          <div style={{fontSize:17,fontWeight:800,color:"#dde1f5",marginBottom:3}}>Welcome back</div>
          <div style={{fontSize:12,color:"#52556e",marginBottom:22}}>Sign in to continue</div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:9,color:"#52556e",fontWeight:700,textTransform:"uppercase",letterSpacing:1.4,marginBottom:5}}>Email</div>
            <input value={email} onChange={function(e){setEmail(e.target.value);}} placeholder="your@email.com" type="email" style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(180,185,230,.1)",color:"#dde1f5",borderRadius:9,padding:"11px 13px"}}/>
          </div>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:9,color:"#52556e",fontWeight:700,textTransform:"uppercase",letterSpacing:1.4,marginBottom:5}}>Password</div>
            <input value={pass} onChange={function(e){setPass(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"&&!logging)doLogin();}} placeholder="password" type="password" style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(180,185,230,.1)",color:"#dde1f5",borderRadius:9,padding:"11px 13px"}}/>
          </div>
          {loginErr&&<div style={{fontSize:12,color:"#ff4060",background:"#ff406010",border:"1px solid #ff406030",borderRadius:8,padding:"8px 12px",marginBottom:14}}>{loginErr}</div>}
          <button disabled={logging} onClick={doLogin} style={{width:"100%",background:"#adb1cc",color:"#000",border:"none",borderRadius:9,padding:"12px",fontFamily:"Outfit",fontSize:14,fontWeight:800,cursor:logging?"not-allowed":"pointer",opacity:logging?0.6:1,transition:"all .2s"}}>
            {logging?"Signing in...":"Sign In"}
          </button>
          <div style={{textAlign:"center",marginTop:14,fontSize:10,color:"#2a2d42"}}>Authorised personnel only</div>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{display:"flex",height:"100vh",background:C.bg,overflow:"hidden",fontFamily:"Outfit,sans-serif",color:C.text,position:"relative"}}>
      <style>{css}</style>
      {toast&&<Toast msg={toast.msg} type={toast.type} done={function(){setToast(null);}}/>}
      {confirmQ&&<ConfirmModal title={confirmQ.title} msg={confirmQ.msg} danger={confirmQ.danger} onOk={function(){confirmQ.onOk();setConfirmQ(null);}} onNo={function(){setConfirmQ(null);}}/>}
      {isMobile&&sideOpen&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:98}} onClick={function(){setSideOpen(false);}}/>}
      <aside style={{position:isMobile?"fixed":"relative",left:isMobile?(sideOpen?"0":"-240px"):undefined,top:0,bottom:0,zIndex:isMobile?99:undefined,width:sideOpen?220:52,flexShrink:0,background:C.surface,borderRight:"1px solid "+C.div,display:"flex",flexDirection:"column",transition:"width .25s ease,left .25s ease",overflow:"hidden",boxShadow:isDark?"4px 0 24px rgba(0,0,0,.5)":"2px 0 12px rgba(0,0,0,.08)"}}>
        <div style={{padding:"12px 8px",display:"flex",alignItems:"center",gap:9,borderBottom:"1px solid "+C.div,flexShrink:0}}>
          <div style={{width:30,height:30,borderRadius:7,overflow:"hidden",border:"1px solid "+C.border,flexShrink:0}}>
            <img src={LOGO} alt="Cosmo" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          </div>
          {sideOpen&&<div style={{overflow:"hidden",flex:1}}>
            <div className="shine" style={{fontSize:12,fontWeight:900,letterSpacing:2.5,whiteSpace:"nowrap"}}>COSMO</div>
            <div style={{fontSize:8,color:C.sub,letterSpacing:1.5,textTransform:"uppercase"}}>Admin</div>
          </div>}
          <button onClick={function(){setSideOpen(function(p){return !p;});}} style={{background:"none",border:"none",cursor:"pointer",color:C.sub,fontSize:10,padding:"4px 5px",flexShrink:0,borderRadius:5,lineHeight:1}}>
            {sideOpen?"◂":"▸"}
          </button>
        </div>
        <nav style={{flex:1,padding:"5px 3px",overflowY:"auto",overflowX:"hidden"}}>
          {(function(){
            var rendered=[]; var lastGroup="";
            NAV.forEach(function(n){
              if(sideOpen&&n.group&&n.group!==lastGroup){
                lastGroup=n.group;
                rendered.push(<div key={"grp-"+n.group} style={{fontSize:8,fontWeight:700,letterSpacing:1.8,color:C.muted,textTransform:"uppercase",padding:"14px 14px 5px",marginTop:lastGroup==="Overview"?0:4}}>{n.group}</div>);
              }
              rendered.push(
                <button key={n.id} className={"nav-btn"+(page===n.id?" active":"")} onClick={function(){navTo(n.id);}} title={!sideOpen?n.label:undefined}>
                  <span style={{fontSize:12,width:19,textAlign:"center",flexShrink:0,position:"relative"}}>
                    {n.icon}
                    {n.id==="cashflow"&&pendingWDs>0&&<span style={{position:"absolute",top:-3,right:-3,width:7,height:7,borderRadius:"50%",background:C.warn,border:"1.5px solid "+C.surface}}/>}
                    {n.id==="support"&&<span style={{position:"absolute",top:-3,right:-3,width:7,height:7,borderRadius:"50%",background:C.danger,border:"1.5px solid "+C.surface}}/>}
                    {n.id==="kyc"&&<span style={{position:"absolute",top:-3,right:-3,width:7,height:7,borderRadius:"50%",background:C.warn,border:"1.5px solid "+C.surface}}/>}
                  </span>
                  {sideOpen&&<span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontSize:12}}>{n.label}</span>}
                </button>
              );
            });
            return rendered;
          })()}
        </nav>
        <div style={{padding:"5px 3px",borderTop:"1px solid "+C.div,flexShrink:0}}>
          <button className="nav-btn" style={{color:C.danger}} onClick={doLogout}>
            <span style={{fontSize:12,width:19,textAlign:"center",flexShrink:0}}>x</span>
            {sideOpen&&<span style={{fontSize:12}}>Logout</span>}
          </button>
        </div>
      </aside>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
        <header style={{background:C.surface,borderBottom:"1px solid "+C.div,padding:"10px 16px",display:"flex",alignItems:"center",gap:10,flexShrink:0,boxShadow:isDark?"0 1px 20px rgba(0,0,0,.4)":"0 1px 8px rgba(0,0,0,.06)"}}>
          {isMobile&&<button onClick={function(){setSideOpen(function(p){return !p;});}} style={{background:"none",border:"none",cursor:"pointer",color:C.sub,fontSize:16,padding:4,borderRadius:6,flexShrink:0}}>☰</button>}
          <div style={{fontSize:15,fontWeight:800,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {(NAV.filter(function(n){return n.id===page;})[0]||{label:page}).label}
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <span style={{fontSize:10,color:C.sub,display:isMobile?"none":"block"}}>
              {now.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})} {now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
            </span>
            <button style={{background:"none",border:"none",cursor:"pointer",color:C.sub,fontSize:14,padding:4,position:"relative"}} onClick={function(){navTo("cashflow");}}>
              🔔
              {pendingWDs>0&&<span style={{position:"absolute",top:0,right:0,width:6,height:6,borderRadius:"50%",background:C.warn,border:"1.5px solid "+C.surface}}/>}
            </button>
            <button onClick={function(){setTheme(isDark?"light":"dark");}} style={{background:C.card,border:"1px solid "+C.border,color:C.sub,borderRadius:7,padding:"5px 9px",cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"Outfit"}}>
              {isDark?"Light":"Dark"}
            </button>
            <div style={{display:"flex",alignItems:"center",gap:7,background:C.card,borderRadius:9,padding:"4px 10px 4px 5px",border:"1px solid "+C.border,cursor:"pointer"}} onClick={function(){navTo("profile");}}>
              <div style={{width:24,height:24,borderRadius:6,overflow:"hidden",border:"1px solid "+C.border,flexShrink:0}}>
                <img src={LOGO} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              </div>
              {!isMobile&&<div style={{lineHeight:1.2}}>
                <div style={{fontSize:10,fontWeight:700,color:C.text}}>Admin</div>
                <div style={{fontSize:9,color:C.sub}}>{adminEmail}</div>
              </div>}
            </div>
          </div>
        </header>
        <main style={{flex:1,overflow:"auto",padding:isMobile?"12px":"18px",minWidth:0}} key={page}>
          {cfg.maintenanceMode&&<div style={{background:C.warn+"18",border:`1px solid ${C.warn}44`,borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10,fontSize:12}}>
            <span>🔧</span>
            <div><strong style={{color:C.warn}}>Maintenance Mode Active</strong><span style={{color:C.sub,marginLeft:8}}>Users see: "{cfg.maintenanceMsg}"</span></div>
            <button className="btn btn-ghost" style={{marginLeft:"auto",fontSize:11,flexShrink:0}} onClick={()=>navTo("settings")}>Settings</button>
          </div>}
          {cfg.withdrawalEnabled===false&&page!=="cashflow"&&<div style={{background:C.danger+"14",border:`1px solid ${C.danger}33`,borderRadius:10,padding:"9px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:8,fontSize:11}}>
            <span>🔒</span>
            <span style={{color:C.danger,fontWeight:600}}>Withdrawals paused</span>
            <button className="btn btn-ghost" style={{marginLeft:"auto",fontSize:10,flexShrink:0}} onClick={()=>navTo("cashflow")}>View Withdrawals</button>
          </div>}
          {activePage}
        </main>
      </div>
    </div>
  );
}var seedUsers=[];
var seedOws=[];
var seedWDs=[];
var seedComps=[];
var seedRefs=[];

