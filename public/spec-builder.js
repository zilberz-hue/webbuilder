(function(){
'use strict';
var KEY='specBuilder.v1';

// ---- Schema: sections -> fields. type: text|area|select|chips|list
var SECTIONS=[
 {id:'overview',title:'סקירה כללית',hint:'מה האתר ולמה הוא קיים.',fields:[
  {k:'name',l:'שם הפרויקט / האתר',t:'text'},
  {k:'type',l:'סוג האתר',t:'select',o:['אתר תדמית','חנות מקוונת','בלוג / תוכן','פורטל / מערכת ווב','דף נחיתה','פלטפורמה / שוק','אחר']},
  {k:'desc',l:'תיאור קצר',t:'area',p:'במשפט או שניים: מה האתר עושה ועבור מי.'},
  {k:'goals',l:'מטרות עסקיות',t:'area',p:'כל מטרה בשורה נפרדת.'},
  {k:'kpis',l:'מדדי הצלחה (KPI)',t:'area',p:'למשל: 500 לידים בחודש, שיעור המרה 3%.'}]},
 {id:'audience',title:'קהל יעד ופרסונות',hint:'מי המשתמשים ומה הם צריכים.',fields:[
  {k:'personas',l:'פרסונות',t:'list',add:'הוסף פרסונה',name:'פרסונה',f:[
    {k:'n',l:'שם / תפקיד',t:'text'},{k:'need',l:'צורך עיקרי',t:'text'},{k:'pain',l:'כאב / חסם',t:'text'},{k:'dev',l:'מכשיר עיקרי',t:'select',o:['מובייל','דסקטופ','שניהם']}]},
  {k:'langs',l:'שפות האתר',t:'chips',o:['עברית','אנגלית','ערבית','רוסית','צרפתית','ספרדית']}]},
 {id:'pages',title:'מפת אתר ועמודים',hint:'כל עמוד, מטרתו והתוכן שבו.',fields:[
  {k:'pages',l:'עמודים',t:'list',add:'הוסף עמוד',name:'עמוד',f:[
    {k:'n',l:'שם העמוד',t:'text'},{k:'url',l:'כתובת (URL)',t:'text',p:'/about'},
    {k:'purpose',l:'מטרה',t:'text'},{k:'access',l:'גישה',t:'select',o:['ציבורי','משתמש רשום','מנהל']},
    {k:'content',l:'תוכן ורכיבים',t:'area',p:'כותרת, תמונת גיבור, טופס, גלריה...',full:1}]},
  {k:'nav',l:'מבנה ניווט',t:'area',p:'תפריט ראשי, תחתית, ניווט משני.'}]},
 {id:'features',title:'פיצ׳רים ופונקציונליות',hint:'מה המערכת יודעת לעשות, בסדר עדיפויות (MoSCoW).',fields:[
  {k:'features',l:'פיצ׳רים',t:'list',add:'הוסף פיצ׳ר',name:'פיצ׳ר',f:[
    {k:'n',l:'שם הפיצ׳ר',t:'text'},{k:'pri',l:'עדיפות',t:'select',o:['חובה (Must)','רצוי (Should)','נחמד (Could)','לא בגרסה זו (Won\'t)']},
    {k:'d',l:'תיאור וקריטריוני קבלה',t:'area',full:1}]},
  {k:'flows',l:'תהליכי משתמש מרכזיים',t:'area',p:'למשל: הרשמה ← אימות מייל ← מילוי פרופיל ← דשבורד.'}]},
 {id:'design',title:'עיצוב וחוויית משתמש',hint:'מראה, תחושה ושפה עיצובית.',fields:[
  {k:'tone',l:'אופי המותג',t:'chips',o:['מקצועי','חם ואנושי','צעיר ושובב','יוקרתי','מינימליסטי','טכנולוגי','אמין ושמרני']},
  {k:'colors',l:'צבעים',t:'text',p:'#2456D8 ראשי, #1F9D63 משני'},
  {k:'fonts',l:'פונטים',t:'text',p:'Heebo לכותרות, Assistant לגוף'},
  {k:'refs',l:'אתרי השראה / מתחרים',t:'area'},
  {k:'a11y',l:'נגישות',t:'select',o:['WCAG 2.1 AA (תקן ישראלי 5568)','WCAG 2.2 AA','בסיסית','לא נדרש']},
  {k:'responsive',l:'התאמה למכשירים',t:'chips',o:['מובייל','טאבלט','דסקטופ','הדפסה']}]},
 {id:'tech',title:'טכנולוגיה ואינטגרציות',hint:'בחירות טכניות ושירותים חיצוניים.',fields:[
  {k:'stack',l:'טכנולוגיה / פלטפורמה',t:'text',p:'React + Node, WordPress, Webflow, אתר סטטי...'},
  {k:'hosting',l:'אחסון ודומיין',t:'text'},
  {k:'integr',l:'אינטגרציות',t:'chips',o:['תשלומים (Stripe/PayPal)','דוא״ל (Resend/Mailchimp)','CRM','Google Analytics','וואטסאפ','התחברות חברתית','מפות','צ׳אט','CMS']},
  {k:'db',l:'נתונים ואחסון',t:'area',p:'אילו נתונים נשמרים, איפה, ומי ניגש.'},
  {k:'seo',l:'SEO וביצועים',t:'area',p:'מילות מפתח, מהירות טעינה (LCP < 2.5s), sitemap, schema.'},
  {k:'sec',l:'אבטחה ופרטיות',t:'area',p:'HTTPS, הרשאות, גיבויים, GDPR / חוק הגנת הפרטיות.'}]},
 {id:'content',title:'תוכן ומשפטי',hint:'מי מספק תוכן ואילו מסמכים נדרשים.',fields:[
  {k:'contentOwner',l:'אחריות על תוכן',t:'area',p:'טקסטים, תמונות, וידאו, תרגום — מי ומתי.'},
  {k:'legal',l:'מסמכים משפטיים',t:'chips',o:['תנאי שימוש','מדיניות פרטיות','הצהרת נגישות','מדיניות עוגיות','מדיניות החזרים','הסכמת דיוור']}]},
 {id:'plan',title:'לו״ז, תקציב וסיכונים',hint:'שלבים, עלויות ומה עלול להשתבש.',fields:[
  {k:'phases',l:'אבני דרך',t:'list',add:'הוסף שלב',name:'שלב',f:[
    {k:'n',l:'שלב',t:'text'},{k:'dur',l:'משך',t:'text',p:'שבועיים'},{k:'out',l:'תוצר',t:'text'}]},
  {k:'budget',l:'תקציב',t:'text'},
  {k:'launch',l:'תאריך השקה רצוי',t:'text'},
  {k:'risks',l:'סיכונים והנחות',t:'area',p:'כל פריט בשורה נפרדת.'},
  {k:'outscope',l:'מחוץ לתחום (Out of scope)',t:'area'}]}
];

// ---- State
var state=load(), cur=0;
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
function $(s,r){return (r||document).querySelector(s)}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function filled(v){return Array.isArray(v)?v.some(function(x){return typeof x==='object'?Object.keys(x).some(function(k){return x[k]}):x}):!!v}
function secDone(s){return s.fields.some(function(f){return filled(state[f.k])})}

// ---- Rendering: navigation
function renderNav(){
  var done=SECTIONS.filter(secDone).length;
  var h='<div class="prog"><i style="width:'+Math.round(done/SECTIONS.length*100)+'%"></i></div>';
  SECTIONS.forEach(function(s,i){
    h+='<button data-i="'+i+'" class="'+(i===cur?'on':'')+'"><span>'+(i+1)+'. '+esc(s.title)+'</span><span class="dot'+(secDone(s)?' done':'')+'"></span></button>';
  });
  $('#nav').innerHTML=h;
}

// ---- Rendering: editor
function fieldHtml(f,val,path){
  var id=' data-p="'+path+'"';
  var ph=f.p?' placeholder="'+esc(f.p)+'"':'';
  var h='<label>'+esc(f.l)+'</label>';
  if(f.t==='text')h+='<input type="text"'+id+ph+' value="'+esc(val)+'">';
  else if(f.t==='area')h+='<textarea'+id+ph+'>'+esc(val)+'</textarea>';
  else if(f.t==='select'){h+='<select'+id+'><option value="">— בחר —</option>'+f.o.map(function(o){return '<option'+(o===val?' selected':'')+'>'+esc(o)+'</option>'}).join('')+'</select>'}
  else if(f.t==='chips'){var a=Array.isArray(val)?val:[];h+='<div class="chips">'+f.o.map(function(o){return '<label><input type="checkbox" data-c="'+path+'" value="'+esc(o)+'"'+(a.indexOf(o)>-1?' checked':'')+'><span>'+esc(o)+'</span></label>'}).join('')+'</div>'}
  return h;
}
function renderEditor(){
  var s=SECTIONS[cur];
  var h='<h2>'+(cur+1)+'. '+esc(s.title)+'</h2><p class="hint">'+esc(s.hint)+'</p>';
  s.fields.forEach(function(f){
    if(f.t!=='list'){h+=fieldHtml(f,state[f.k],f.k);return}
    h+='<label>'+esc(f.l)+'</label>';
    var arr=state[f.k]||[];
    arr.forEach(function(it,i){
      h+='<div class="item"><div class="head"><b>'+esc(f.name)+' '+(i+1)+'</b><button data-del="'+f.k+':'+i+'">מחק</button></div><div class="row">';
      f.f.forEach(function(sf){
        h+='<div style="'+(sf.full?'grid-column:1/-1':'')+'">'+fieldHtml(sf,it[sf.k],f.k+'.'+i+'.'+sf.k)+'</div>';
      });
      h+='</div></div>';
    });
    h+='<button class="addbtn" data-add="'+f.k+'">+ '+esc(f.add)+'</button>';
  });
  h+='<div class="step-nav"><button data-go="-1"'+(cur===0?' disabled':'')+'>→ הקודם</button><button class="primary" data-go="1"'+(cur===SECTIONS.length-1?' disabled':'')+'>הבא ←</button></div>';
  $('#editor').innerHTML=h;
}

// ---- Preview + Markdown
function lines(v){return String(v||'').split('\n').map(function(x){return x.trim()}).filter(Boolean)}
function buildDoc(){
  // returns array of blocks: {h1|h2|h3|p|ul|table}
  var b=[],S=state;
  b.push({h1:S.name||'אפיון אתר ללא שם'});
  if(S.type)b.push({p:'סוג: '+S.type});
  var d=new Date().toLocaleDateString('he-IL');b.push({p:'תאריך: '+d});
  SECTIONS.forEach(function(sec){
    if(!secDone(sec))return;
    b.push({h2:sec.title});
    sec.fields.forEach(function(f){
      var v=S[f.k];if(!filled(v)||f.k==='name'||f.k==='type')return;
      if(f.t==='list'){
        if(f.k==='phases'){
          b.push({h3:f.l});b.push({table:[f.f.map(function(x){return x.l})].concat(v.map(function(it){return f.f.map(function(x){return it[x.k]||''})}))});
        }else if(f.k==='personas'){
          b.push({h3:f.l});b.push({table:[f.f.map(function(x){return x.l})].concat(v.map(function(it){return f.f.map(function(x){return it[x.k]||''})}))});
        }else{
          b.push({h3:f.l});
          v.forEach(function(it){
            b.push({h4:(it.n||'(ללא שם)')+(it.pri?' — '+it.pri:'')+(it.url?' — '+it.url:'')});
            var meta=[];if(it.purpose)meta.push('מטרה: '+it.purpose);if(it.access)meta.push('גישה: '+it.access);
            if(meta.length)b.push({p:meta.join(' · ')});
            if(it.content)b.push({p:it.content});if(it.d)b.push({p:it.d});
          });
        }
      }else if(f.t==='chips'){b.push({h3:f.l});b.push({ul:v})}
      else if(f.t==='area'&&lines(v).length>1){b.push({h3:f.l});b.push({ul:lines(v)})}
      else{b.push({h3:f.l});b.push({p:v})}
    });
  });
  return b;
}
function toHtml(b){
  return b.map(function(x){
    if(x.h1)return '<h1>'+esc(x.h1)+'</h1>';
    if(x.h2)return '<h2>'+esc(x.h2)+'</h2>';
    if(x.h3)return '<h3>'+esc(x.h3)+'</h3>';
    if(x.h4)return '<h4>'+esc(x.h4)+'</h4>';
    if(x.p)return '<p>'+esc(x.p).replace(/\n/g,'<br>')+'</p>';
    if(x.ul)return '<ul>'+x.ul.map(function(i){return '<li>'+esc(i)+'</li>'}).join('')+'</ul>';
    if(x.table)return '<table><thead><tr>'+x.table[0].map(function(c){return '<th>'+esc(c)+'</th>'}).join('')+'</tr></thead><tbody>'+x.table.slice(1).map(function(r){return '<tr>'+r.map(function(c){return '<td>'+esc(c)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table>';
    return '';
  }).join('');
}
function toMd(b){
  return b.map(function(x){
    if(x.h1)return '# '+x.h1;if(x.h2)return '## '+x.h2;if(x.h3)return '### '+x.h3;if(x.h4)return '#### '+x.h4;
    if(x.p)return x.p;
    if(x.ul)return x.ul.map(function(i){return '- '+i}).join('\n');
    if(x.table){var t=x.table,hd='| '+t[0].join(' | ')+' |',sp='|'+t[0].map(function(){return '---'}).join('|')+'|';
      return [hd,sp].concat(t.slice(1).map(function(r){return '| '+r.map(function(c){return String(c).replace(/\|/g,'/').replace(/\n/g,' ')}).join(' | ')+' |'})).join('\n')}
    return '';
  }).join('\n\n')+'\n';
}
function renderPreview(){
  var b=buildDoc();
  $('#preview').innerHTML=Object.keys(state).some(function(k){return filled(state[k])})?toHtml(b):'<p class="empty">התצוגה המקדימה של מסמך האפיון תופיע כאן בזמן שתמלא את השלבים.</p>';
}

// ---- State updates
function setPath(path,val){
  var p=path.split('.');
  if(p.length===1){state[p[0]]=val;return}
  var arr=state[p[0]]=state[p[0]]||[];var it=arr[+p[1]]=arr[+p[1]]||{};it[p[2]]=val;
}
function refresh(full){save();renderNav();renderPreview();if(full)renderEditor()}

document.addEventListener('input',function(e){
  var t=e.target;if(t.dataset&&t.dataset.p){setPath(t.dataset.p,t.value);refresh(false)}
});
document.addEventListener('change',function(e){
  var t=e.target;
  if(t.dataset&&t.dataset.c){var a=(state[t.dataset.c]||[]).slice(),i=a.indexOf(t.value);if(t.checked&&i<0)a.push(t.value);if(!t.checked&&i>-1)a.splice(i,1);state[t.dataset.c]=a;refresh(false)}
  else if(t.dataset&&t.dataset.p){setPath(t.dataset.p,t.value);refresh(false)}
});
document.addEventListener('click',function(e){
  var t=e.target.closest('button');if(!t)return;
  if(t.parentNode.id==='nav'){cur=+t.dataset.i;renderNav();renderEditor();return}
  if(t.dataset.go){cur=Math.max(0,Math.min(SECTIONS.length-1,cur+ +t.dataset.go));renderNav();renderEditor();window.scrollTo(0,0);return}
  if(t.dataset.add){(state[t.dataset.add]=state[t.dataset.add]||[]).push({});refresh(true);return}
  if(t.dataset.del){var p=t.dataset.del.split(':');state[p[0]].splice(+p[1],1);refresh(true)}
});

// ---- Toolbar
function download(name,text,mime){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:mime}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},500)}
function fname(){return (state.name||'website-spec').replace(/[^\w֐-׿-]+/g,'_')}
$('#btnMd').onclick=function(){download(fname()+'.md',toMd(buildDoc()),'text/markdown')};
$('#btnJson').onclick=function(){download(fname()+'.json',JSON.stringify(state,null,2),'application/json')};
$('#btnPrint').onclick=function(){window.print()};
$('#btnImport').onclick=function(){$('#fileIn').click()};
$('#fileIn').onchange=function(e){
  var f=e.target.files[0];if(!f)return;var r=new FileReader();
  r.onload=function(){try{var o=JSON.parse(r.result);if(!o||typeof o!=='object'||Array.isArray(o))throw 0;state=o;refresh(true)}catch(x){alert('קובץ JSON לא תקין')}};
  r.readAsText(f);e.target.value='';
};
$('#btnReset').onclick=function(){if(confirm('למחוק את כל האפיון?')){state={};cur=0;refresh(true)}};
$('#btnSample').onclick=function(){
  if(Object.keys(state).length&&!confirm('טעינת הדוגמה תחליף את התוכן הנוכחי. להמשיך?'))return;
  state=SAMPLE();cur=0;refresh(true);
};
function SAMPLE(){return {
 name:'מאסטר־שף — אתר קורסי בישול',type:'אתר תדמית',
 desc:'אתר שיווקי ורישום לקורסי בישול למתחילים ולמתקדמים, עם אפשרות הזמנת סדנאות פרטיות.',
 goals:'להגדיל רישום לקורסים\nלבנות רשימת דיוור\nלהציג סדנאות לחברות',kpis:'300 נרשמים לקורס בחודש\nשיעור המרה 4%\n1,000 מנויים לניוזלטר ברבעון',
 personas:[{n:'דנה, 32, מתחילה',need:'ללמוד בישול בסיסי אחרי העבודה',pain:'חוסר זמן ופחד מכישלון',dev:'מובייל'},{n:'רוני, מנהל HR',need:'סדנת גיבוש לצוות',pain:'קושי להשוות מחירים ותאריכים',dev:'דסקטופ'}],
 langs:['עברית','אנגלית'],
 pages:[{n:'בית',url:'/',purpose:'להסביר את ההצעה ולהוביל להרשמה',access:'ציבורי',content:'תמונת גיבור, 3 קורסים מובילים, המלצות, כפתור הרשמה'},{n:'קורסים',url:'/courses',purpose:'השוואה וסינון קורסים',access:'ציבורי',content:'רשימה עם סינון לפי רמה ותאריך, כרטיס קורס'},{n:'סדנאות לחברות',url:'/corporate',purpose:'יצירת לידים עסקיים',access:'ציבורי',content:'חבילות, גלריה, טופס בקשת הצעת מחיר'},{n:'האזור שלי',url:'/account',purpose:'ניהול הרשמות',access:'משתמש רשום',content:'הקורסים שלי, חשבוניות'}],
 nav:'תפריט ראשי: בית, קורסים, סדנאות לחברות, אודות, צור קשר. תחתית: תקנון, פרטיות, נגישות.',
 features:[{n:'הרשמה ותשלום לקורס',pri:'חובה (Must)',d:'בחירת מועד, תשלום באשראי, אישור במייל. קבלה: הרשמה מושלמת תוך פחות מ־2 דקות.'},{n:'רשימת המתנה',pri:'רצוי (Should)',d:'כשהקורס מלא, המשתמש מצטרף לרשימה ומקבל הודעה כשמתפנה מקום.'},{n:'בלוג מתכונים',pri:'נחמד (Could)',d:'מאמרים לקידום אורגני.'}],
 flows:'גילוי באינסטגרם ← עמוד קורס ← בחירת מועד ← תשלום ← מייל אישור\nחברה ← עמוד סדנאות ← טופס ← שיחת מכירה',
 tone:['חם ואנושי','צעיר ושובב'],colors:'#E4572E כתום ראשי, #2E4057 כחול כהה, #FFF8F0 רקע',fonts:'Heebo לכל האתר',refs:'masterchef.co.il, skillshare.com',a11y:'WCAG 2.1 AA (תקן ישראלי 5568)',responsive:['מובייל','דסקטופ'],
 stack:'אתר סטטי + פונקציות שרת (Netlify)',hosting:'Netlify, דומיין .co.il',integr:['תשלומים (Stripe/PayPal)','דוא״ל (Resend/Mailchimp)','Google Analytics','וואטסאפ'],
 db:'פרטי נרשמים ותשלומים ב־Firestore, ללא שמירת פרטי אשראי.',seo:'מילות מפתח: קורס בישול, סדנת בישול. LCP < 2.5s. sitemap.xml.',sec:'HTTPS, הרשאות לפי משתמש, גיבוי יומי.',
 contentOwner:'צילום מנות וטקסטים — השפית. תרגום לאנגלית — חיצוני.',legal:['תנאי שימוש','מדיניות פרטיות','הצהרת נגישות','מדיניות החזרים'],
 phases:[{n:'אפיון ועיצוב',dur:'3 שבועות',out:'מסמך אפיון + מוקאפים'},{n:'פיתוח',dur:'5 שבועות',out:'אתר בסביבת בדיקות'},{n:'בדיקות והשקה',dur:'שבועיים',out:'אתר חי'}],
 budget:'35,000–45,000 ₪',launch:'תחילת הרבעון הבא',risks:'עיכוב בתוכן מהלקוח\nשינויי דרישות באמצע פיתוח',outscope:'אפליקציית מובייל\nמערכת חברות מועדון'};}

window.SpecBuilder={getSpec:function(){return JSON.parse(JSON.stringify(state))},hasContent:function(){return Object.keys(state).some(function(k){return filled(state[k])})}};
renderNav();renderEditor();renderPreview();
})();
