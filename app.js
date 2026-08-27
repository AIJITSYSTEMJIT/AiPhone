const $=s=>document.querySelector(s), status=$('#status'), tr=$('#transcript'), q=$('#q'), video=$('#video');
let rec,stream;
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
function state(s){document.body.className=s;status.textContent='COOP • '+s.toUpperCase()}
function speak(text){speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(text);u.onstart=()=>state('speaking');u.onend=()=>state('ready');speechSynthesis.speak(u)}
async function ask(text){
 if(!text.trim())return; tr.textContent='You: '+text; state('thinking');
 try{
  let r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})});
  if(!r.ok)throw Error(await r.text()); let d=await r.json(); tr.textContent+='\\n\\nCoop: '+d.answer; speak(d.answer);
 }catch(e){state('ready');tr.textContent+='\\n\\nConnection error: '+e.message}
}
$('#send').onclick=()=>{let x=q.value;q.value='';ask(x)};q.onkeydown=e=>{if(e.key==='Enter')$('#send').click()};
$('#stop').onclick=()=>{speechSynthesis.cancel();if(rec)rec.stop();state('ready')};
$('#mic').onclick=()=>{let SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){alert('Speech recognition is unavailable in this browser.');return}
 rec=new SR();rec.lang='en-US';rec.interimResults=true;rec.continuous=false;rec.onstart=()=>state('listening');rec.onresult=e=>{let x=[...e.results].map(r=>r[0].transcript).join('');tr.textContent='You: '+x;if(e.results[e.results.length-1].isFinal)ask(x)};rec.onend=()=>{if(document.body.className==='listening')state('ready')};rec.start()};
$('#cam').onclick=async()=>{try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});video.srcObject=stream;video.hidden=false;state('camera ready')}catch(e){alert(e.message)}};
