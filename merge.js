var diffmode=false;    // true for manual check, false for production

var jsonfn=process.argv[2]||"ketaka84.json";  //default json filename
if (jsonfn.indexOf(".json")==-1)jsonfn+=".json";
var json=require("./"+jsonfn);


//////////////////////////////////////////////////////////////////////

var fs=require("fs");
var mkdirp=require("./mkdirp");
var path=require("path");
var lastfile="",pages={},currentfile="",currentpage="";
var unmerged=[],lasterror="",mergecount=0;

var errormerge=function(item){
	item.err=lasterror;
	lasterror="";
	unmerged.push(JSON.stringify(item));
}

var loadPage=function(filecontent) {
	var page={},lastidx=0,lastid="_";
	filecontent.replace(/<pb id="(.+?)"\/>\n?/g,function(m,m1,idx){
		if (lastidx===0) {
			page[lastid]=filecontent.substr(0,idx);
		}
		page[lastid]=filecontent.substring(lastidx,idx);
		lastidx=idx+m.length;
		lastid=m1;
	});
	page[lastid]=filecontent.substring(lastidx).trim();	
	return page;
}
var fetchText=function(pagecontent,offset,len) {
	var realoff=getOffsetOmitTag(pagecontent,offset);
	if (typeof realoff !=="number") return null;
	return pagecontent.substr(realoff,len);
}

var getOffsetOmitTag=function(pagecontent,offset){
	var intag=false;
	var remain=offset;
	for (var i=0;i<pagecontent.length;i++) {
		var c=pagecontent[i];
		if (c==='<') intag=true;
		if (remain==0) {
			if (intag) {
				lasterror="offset inside tag";
				return null;
			} else {
				return i;
			}
		}
		if (!intag) remain--;
		if (c==='>') intag=false;
	}
	lasterror="invalid offset";
	return null;
}

var merge=function(item) {
	var page=pages[currentpage];
	var realoff=getOffsetOmitTag(page,item.offset);
	var newtext=diffmode?("["+item.from+"|"+item.to+"]"):item.to;
	pages[currentpage]=page.substr(0,realoff)+newtext+page.substr(realoff+item.from.length);
}

var createnewfilecontent=function() {
	var s="";
	for (var i in pages) {
		if (i!=="_") s+='<pb id="'+i+'"/>\n';
		s+=pages[i];
	}
	return s;
}

var savemergefile=function() {
	if (!lastfile)return;
	var outfn="merged_xml/"+lastfile;
	var dir=path.dirname(outfn);
	mkdirp.sync(dir);	//create folder if not exist
	fs.writeFileSync(outfn,createnewfilecontent(),"utf8");
}

var trymerge=function(item){	
	if (item.file!==lastfile) {
		savemergefile();
		currentfile=item.file;
		pages=loadPage(fs.readFileSync("before_xml/"+item.file,"utf8"));
	}
	currentpage=item.page;
	var t=fetchText(pages[item.page],item.offset,item.from.length);

	if (t!==item.from) {
		if (!lasterror) lasterror="xml mismatch:"+t;
		errormerge(item);
	} else {
		mergecount++;
		merge(item);
	}
	lastfile=item.file;
}

json.map(trymerge);
savemergefile(); //last file content

console.log("success merged",mergecount,"unmerged",unmerged.length,"check unmerged.json");
fs.writeFileSync("unmerged.json",unmerged.join("\n"),"utf8")