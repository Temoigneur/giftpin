/**
 * Strict matching for the manage page's "Not sure what to add?" ideas guide
 * (29 Oct 2026, Ben's report). Tapping an idea like Kitchen → Stockpot used to
 * hand the term to Shopify's own search, which prefix- and typo-matches: a
 * store with no stockpot still answered with anything containing "sto", so
 * the registrant was shown unrelated products as if they were a match.
 *
 * Now the manage page still asks Shopify's predictive search for candidates
 * (it's the only product search a storefront page can call), then keeps only
 * the products whose title, type or tags contain every key word of the idea
 * as a whole word (plural/singular forms count, "stock pot" = "stockpot"),
 * ranks them, and says plainly when the store has nothing that fits.
 *
 * Shipped as a JS source string because it runs in the manage page's inline
 * script; the tests evaluate this exact string, so there's one copy only.
 * Keep it ES5 (no arrows, const, or spread) like the rest of that script.
 */
export const IDEA_MATCH_JS = String.raw`function gpIdeaMatch(term,products){
  var GENERIC={a:1,an:1,and:1,or:1,the:1,of:1,for:1,with:1,set:1,pack:1,piece:1,pcs:1,kit:1,'&':1};
  function stem(w){
    if(w.length>4&&/ies$/.test(w))w=w.slice(0,-3)+'y';
    else if(w.length>4&&/ves$/.test(w))w=w.slice(0,-3)+'f';
    else if(w.length>3&&/(s|x|z|ch|sh)es$/.test(w))w=w.slice(0,-2);
    else if(w.length>3&&/[^s]s$/.test(w))w=w.slice(0,-1);
    if(w.length>3&&/e$/.test(w))w=w.slice(0,-1);
    return w;
  }
  function words(s){
    s=String(s==null?'':s).toLowerCase();
    try{s=s.normalize('NFKD').replace(/[̀-ͯ]/g,'');}catch(_){}
    var out=[],parts=s.split(/[^a-z0-9]+/);
    for(var i=0;i<parts.length;i++)if(parts[i])out.push(stem(parts[i]));
    return out;
  }
  function has(list,k){
    for(var i=0;i<list.length;i++){
      if(list[i]===k)return true;
      if(i+1<list.length&&stem(list[i]+list[i+1])===k)return true;
    }
    return false;
  }
  var all=words(term),keys=[];
  for(var i=0;i<all.length;i++)if(!GENERIC[all[i]]&&keys.indexOf(all[i])<0)keys.push(all[i]);
  if(!keys.length)keys=all;
  var joined=keys.length>1?stem(keys.join('')):null;
  var out=[];
  (products||[]).forEach(function(p,idx){
    if(!p||!p.title)return;
    var t=words(p.title);
    var tags=Array.isArray(p.tags)?p.tags.join(' '):p.tags;
    var other=words((p.type||p.product_type||'')+' '+(tags||''));
    var inTitle=0,inOther=0;
    for(var j=0;j<keys.length;j++){
      if(has(t,keys[j]))inTitle++;
      else if(has(other,keys[j]))inOther++;
    }
    var full=inTitle+inOther===keys.length;
    if(!full&&joined){
      if(has(t,joined))inTitle=keys.length,full=true;
      else if(has(other,joined))inOther=keys.length,full=true;
    }
    if(!full)return;
    var score=inTitle===keys.length?100:inTitle>0?70:50;
    if(all.length>1&&(' '+t.join(' ')+' ').indexOf(' '+all.join(' ')+' ')>=0)score+=10;
    score-=Math.min(20,Math.max(0,t.length-keys.length));
    out.push({p:p,s:score,i:idx});
  });
  out.sort(function(a,b){return b.s-a.s||a.i-b.i;});
  return out.map(function(x){return x.p;});
}`;
