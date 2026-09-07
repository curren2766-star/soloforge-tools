import { session, track, copyText } from './site.js';
const events = session('obs_storage');
const $=id=>document.getElementById(id);
const n=id=>Number($(id).value);
function event(name){ track(name, "obs_storage"); }
function fmtGB(g){if(!Number.isFinite(g))return"—";if(g>=1000)return(g/1000).toFixed(g>=10000?1:2)+" TB";if(g>=100)return g.toFixed(0)+" GB";return g.toFixed(2)+" GB"}
function fmtHours(h){if(!Number.isFinite(h)||h<0)return"—";const m=Math.round(h*60),hh=Math.floor(m/60),mm=m%60;return hh===0?`${mm}分`:mm===0?`${hh}時間`:`${hh}時間${mm}分`}
function rec(g){const t=[500,1000,2000,4000],need=g/.9,p=t.find(v=>v>=need);return !p?"4TB超を検討":p>=1000?`${p/1000}TB以上がおすすめ`:`${p}GB以上がおすすめ`}
function calc(trackComplete=false){
  const v=n("videoBitrate"),a=n("audioBitrate"),h=n("hours"),m=n("minutes"),s=n("storage"),u=n("uploadMbps"),e=n("efficiency");
  const bad=!$("obsForm").checkValidity()||e>1||!Number.isFinite(v)||v<=0||!Number.isFinite(a)||a<0||!Number.isFinite(h)||h<0||!Number.isFinite(m)||m<0||m>59||(h===0&&m===0)||!Number.isFinite(s)||s<=0||!Number.isFinite(u)||u<=0||!Number.isFinite(e)||e<=0;
  if(bad){$("status").textContent="入力値を確認してください。録画時間は1分以上、分は0〜59です。";$("obsResults").hidden=true;$("shareBtn").disabled=true;return null}
  $("obsResults").hidden=false;$("shareBtn").disabled=false;
  const sec=h*3600+m*60,total=v+a/1000,size=total*1e6*sec/8/1e9,per=total*1e6*3600/8/1e9,usable=s*.9,save=usable/per,fit=Math.floor(usable/size),eff=u*e,up=(size*8000/eff)/3600;
  $("fileSize").textContent=fmtGB(size);$("fileSizeSub").textContent=`${h}時間${m?m+"分":""} / 平均 ${total.toFixed(2)} Mbps`;
  $("storageHours").textContent=fmtHours(save);$("recordingsFit").textContent=`${fit}本`; $("recordingsSub").textContent=`${s>=1000?s/1000+"TB":s+"GB"}の90%まで使用`;
  $("uploadTime").textContent=fmtHours(up);$("uploadSub").textContent=`上り実効 ${eff.toFixed(1)} Mbps`; $("perHour").textContent=fmtGB(per); $("storageRecommendation").textContent=`SSD目安：${rec(size)}`;$("status").textContent="";
  if(trackComplete) events.complete(JSON.stringify([v,a,h,m,s,u,e]));return{v,a,h,m,s,u,e,total,size,per,save,fit,up}
}
async function copyResult(){const r=calc(false);if(!r)return;const text=`OBS録画容量の概算
録画時間: ${r.h}時間${r.m}分
平均ビットレート: ${r.total.toFixed(2)} Mbps
予想容量: ${fmtGB(r.size)}
1時間あたり: ${fmtGB(r.per)}
SSD保存可能時間: ${fmtHours(r.save)}
同条件の録画本数: ${r.fit}本
アップロード時間: ${fmtHours(r.up)}
※概算。可変ビットレート・回線状況等で変動します。`;const ok=await copyText(text);$("status").textContent=ok?"結果をコピーしました。":"自動コピーできませんでした。";if(ok)event("result_share",{tool:"obs_storage"})}
$("obsForm").addEventListener("submit",e=>{e.preventDefault();events.start();calc(true)});
$("shareBtn").addEventListener("click",copyResult);
["videoBitrate","audioBitrate","hours","minutes","storage","uploadMbps","efficiency"].forEach(id=>{
  $(id).addEventListener("input",()=>{events.start();calc(false)});
  $(id).addEventListener("change",()=>calc(true));
});
calc(false);
