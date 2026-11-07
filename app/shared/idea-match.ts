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
 * ranks them, and says plainly when the store has nothing that fits. Other
 * names an item is commonly sold under (idea-aliases.ts) count too.
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
    var out=[],parts=s.split(/[^a-z0-9\u0900-\u097f\u3040-\u30ff\u3400-\u9fff]+/);
    for(var i=0;i<parts.length;i++)if(parts[i])out.push(stem(parts[i]));
    return out;
  }
  function has(list,k){
    // Chinese and Japanese have no spaces between words, so a run of characters in a
    // title counts if it contains the key as a substring.
    if(/[\u3040-\u30ff\u3400-\u9fff]/.test(k))return list.join('').indexOf(k)>=0;
    for(var i=0;i<list.length;i++){
      if(list[i]===k)return true;
      if(i+1<list.length&&stem(list[i]+list[i+1])===k)return true;
    }
    return false;
  }
  function prep(name){
    var all=words(name),keys=[];
    for(var i=0;i<all.length;i++)if(!GENERIC[all[i]]&&keys.indexOf(all[i])<0)keys.push(all[i]);
    if(!keys.length)keys=all;
    return {all:all,keys:keys,joined:keys.length>1?stem(keys.join('')):null};
  }
  function score(n,t,other){
    var keys=n.keys,inTitle=0,inOther=0;
    if(!keys.length)return -1;
    for(var j=0;j<keys.length;j++){
      if(has(t,keys[j]))inTitle++;
      else if(has(other,keys[j]))inOther++;
    }
    var full=inTitle+inOther===keys.length;
    if(!full&&n.joined){
      if(has(t,n.joined))inTitle=keys.length,full=true;
      else if(has(other,n.joined))inOther=keys.length,full=true;
    }
    if(!full)return -1;
    var sc=inTitle===keys.length?100:inTitle>0?70:50;
    if(n.all.length>1&&(' '+t.join(' ')+' ').indexOf(' '+n.all.join(' ')+' ')>=0)sc+=10;
    return sc-Math.min(20,Math.max(0,t.length-keys.length));
  }
  // term is the idea's own name, or [name, ...other names it's sold under];
  // the idea's own name wins a tie.
  var names=(Array.isArray(term)?term:[term]).map(prep);
  var out=[];
  (products||[]).forEach(function(p,idx){
    if(!p||!p.title)return;
    var t=words(p.title);
    var tags=Array.isArray(p.tags)?p.tags.join(' '):p.tags;
    var other=words((p.type||p.product_type||'')+' '+(tags||''));
    var best=-1;
    for(var k=0;k<names.length;k++){
      var sc=score(names[k],t,other);
      if(sc>=0&&k===0)sc+=5;
      if(sc>best)best=sc;
    }
    if(best<0)return;
    out.push({p:p,s:best,i:idx});
  });
  out.sort(function(a,b){return b.s-a.s||a.i-b.i;});
  return out.map(function(x){return x.p;});
}`;
