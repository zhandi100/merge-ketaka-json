var fs=require("fs");
//var content=fs.readFileSync("before_xml/084/lj0352_001.xml","utf8");
var filecontent="";
var jsonfn=process.argv[2]||"jiangkangyur201504.json";
var json=require("./before_json/"+jsonfn);
var lastfile="",pages={},currentfile="",currentpage="";

var error=function(msg,start) {
	throw msg+", start:"+start+" file:"+currentfile+" page:"+currentpage;
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
var fetchText=function(filecontent,start,len) {
	var realoff=getOffsetOmitTag(filecontent,start);
	if (realoff==-1) {
		error("invalid offset",start);
	}

	return filecontent.substr(realoff,len);
}

var getOffsetOmitTag=function(pagecontent,start){
	var intag=false;
	var remain=start;
	for (var i=0;i<pagecontent.length;i++) {
		var c=pagecontent[i];
		if (c==='<') intag=true;

		if (remain==0) {
			if (intag) {
				error("offset inside tag",start);
			} else {
				return i;
			}
		}
		if (!intag) remain--;

		if (c==='>') intag=false;
	}

	return -1;
}
var domerge=function(item){	
	if (item.file!==lastfile) {
		currentfile=item.file;
		filecontent=fs.readFileSync("before_xml/"+item.file,"utf8");
		pages=loadPage(filecontent);
	}
	currentpage=item.page;
	var t=fetchText(pages[item.page],item.start,item.len);
	if (t!==item.from) {
		error("offset inside tag",item.start);
	}
	lastfile=item.file;
}
json.map(domerge);