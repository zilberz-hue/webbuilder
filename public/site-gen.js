/* Site generator UI: sends the spec to the server function (Claude builds the
   site), shows the result in an iframe, and lets the user refine it by chat. */
(function(){
'use strict';
var DEFAULT_BASE='/.netlify/functions/';
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}return null}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function rid(){var a=new Uint8Array(12);crypto.getRandomValues(a);return Array.prototype.map.call(a,function(x){return x.toString(16).padStart(2,'0')}).join('')}

var root=document.createElement('div');root.id='gen';
root.innerHTML=
 '<div class="gbar"><b>✨ בניית האתר</b>'+
 '<button data-a="undo" disabled>↶ גרסה קודמת</button>'+
 '<button data-a="device">📱 / 🖥️</button>'+
 '<button data-a="dl" disabled>הורד HTML</button>'+
 '<button data-a="open" disabled>פתח בלשונית</button>'+
 '<button data-a="close">סגור</button></div>'+
 '<div class="stage"><div class="overlay"><div class="spin"></div><div class="otxt">בונה את האתר…</div></div><iframe title="תצוגת האתר" sandbox="allow-scripts allow-forms allow-popups"></iframe></div>'+
 '<div class="side"><div class="log"></div>'+
 '<textarea placeholder="מה לשנות? למשל: תהפוך את הכותרת לגדולה יותר, תוסיף עמוד מחירים…"></textarea>'+
 '<button class="primary" data-a="send">שלח</button>'+
 '<details><summary>הגדרות שרת</summary>'+
 '<label>כתובת פונקציות</label><input type="text" id="gBase">'+
 '<label>קוד גישה (אם הוגדר)</label><input type="text" id="gKey"></details></div>';
document.body.appendChild(root);

var $=function(s){return root.querySelector(s)}, frame=$('iframe'), log=$('.log'), ta=$('textarea');
var versions=[], busy=false, timer=null;
$('#gBase').value=ls('sb.server')||DEFAULT_BASE;$('#gKey').value=ls('sb.key')||'';
$('#gBase').oninput=function(){ls('sb.server',this.value)};$('#gKey').oninput=function(){ls('sb.key',this.value)};

function say(t,c){var d=document.createElement('div');d.className='msg '+(c||'');d.textContent=t;log.appendChild(d);log.scrollTop=log.scrollHeight}
function base(){var b=($('#gBase').value||DEFAULT_BASE).trim();return b.slice(-1)==='/'?b:b+'/'}
function cur(){return versions[versions.length-1]||null}
function show(){var h=cur();frame.srcdoc=h||'';['undo','dl','open'].forEach(function(a){root.querySelector('[data-a='+a+']').disabled=!h||(a==='undo'&&versions.length<2)})}
function overlay(on,t){var o=$('.overlay');o.classList.toggle('on',on);if(t)$('.otxt').textContent=t}

function run(instruction){
  if(busy)return;
  var spec=window.SpecBuilder.getSpec(),html=cur(),id=rid(),key=$('#gKey').value.trim();
  busy=true;var t0=Date.now();
  overlay(true,'בונה את האתר…');
  clearInterval(timer);timer=setInterval(function(){$('.otxt').textContent=(html?'מעדכן':'בונה')+' את האתר… '+Math.round((Date.now()-t0)/1000)+' שניות'},1000);
  var done=function(){busy=false;clearInterval(timer);overlay(false)};
  fetch(base()+'site-builder-background',{method:'POST',mode:'no-cors',headers:{'content-type':'text/plain'},
    body:JSON.stringify({id:id,key:key||undefined,spec:spec,instruction:instruction||undefined,html:html||undefined})
  }).then(function(){poll(id,key,t0,done)}).catch(function(){done();say('לא הצלחתי להגיע לשרת. בדוק את כתובת הפונקציות בהגדרות.','err')});
}
function poll(id,key,t0,done){
  if(Date.now()-t0>14*60*1000){done();say('הבנייה לוקחת יותר מדי זמן. נסה שוב.','err');return}
  setTimeout(function(){
    fetch(base()+'site-builder-status?id='+id+(key?'&key='+encodeURIComponent(key):'')).then(function(r){
      if(r.status===404)throw new Error('הפונקציות לא נמצאו בכתובת שהוגדרה (404). האתר צריך להיות מפורסם ב-Netlify.');
      return r.json()}).then(function(j){
      if(j.status==='pending')return poll(id,key,t0,done);
      done();
      if(j.status==='done'){versions.push(j.html);if(versions.length>8)versions.shift();show();say('האתר מוכן. אפשר לבקש שינויים.')}
      else say(j.error||'שגיאה לא ידועה','err');
    }).catch(function(e){done();say(e.message||'שגיאת רשת','err')});
  },3000);
}

function send(){var v=ta.value.trim();if(!v&&cur())return;if(v)say(v,'me');ta.value='';run(v)}
root.addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;var a=b.dataset.a;
  if(a==='close')root.classList.remove('open');
  else if(a==='send')send();
  else if(a==='device')frame.classList.toggle('mobile');
  else if(a==='undo'&&versions.length>1){versions.pop();show();say('חזרתי לגרסה הקודמת.')}
  else if(a==='dl'&&cur()){var l=document.createElement('a');l.href=URL.createObjectURL(new Blob([cur()],{type:'text/html'}));l.download='index.html';document.body.appendChild(l);l.click();l.remove()}
  else if(a==='open'&&cur()){var w=window.open();if(w){w.document.open();w.document.write(cur());w.document.close()}}
});
ta.addEventListener('keydown',function(e){if(e.key==='Enter'&&(e.ctrlKey||e.metaKey))send()});

document.getElementById('btnBuild').onclick=function(){
  if(!window.SpecBuilder.hasContent()){alert('מלא קודם לפחות חלק מהאפיון (או לחץ "טען דוגמה").');return}
  root.classList.add('open');
  if(!versions.length&&!busy){say('שולח את האפיון ל-Claude. זה לוקח בדרך כלל דקה עד שלוש.');run()}
};
})();
