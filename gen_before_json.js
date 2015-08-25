/* 
  usage
  convert ketaka json into a simpler format with old text to be replaced.
  node gen_before_json kdbfn lst_file
*/
var fs=require("fs");
var kde=require("ksana-database");
var kdb="jiangkangyur201504"||process.argv[2];
var db=null, ljfn="",oldtext,filecontents,filenames, json=[];

var fetchText=function(f,seg,s,l){
	var str=filecontents[f][seg];
	return str.substr(s,l);
}

var getApproved=function(rows) {
	var fidx=filenames.indexOf(ljfn);
	var segnames=db.getFileSegNames(fidx);
	rows.forEach(function(row){
		var state=row.doc.payload.state;
		if (state!=="approve") return;
		var pageid=parseInt(row.doc.pageid);
		var oldtext=fetchText(fidx,pageid-1,row.doc.start,row.doc.len);

		json.push({f:fidx,p:pageid-1,file:ljfn,page: segnames[pageid-1],offset:row.doc.start, from:oldtext, to:row.doc.payload.text});
	});
}
var doconvert=function(file){
	ljfn=file.substr(file.length-17,12).replace(/\\/,"/").replace("/","/lj").replace("-","_")+".xml";

	var rows=require("./"+file).rows;
	getApproved(rows);
}

var sortByFilePageOffset=function(){
	json=json.sort(function(a,b){
		//assuming offset<65536, total page <4096
		//reverse order offset for easier merge
		return (a.f*4096*65536+a.p*65536+ (65536-a.offset)) -(b.f*4096*65536+b.p*65536+ (65536-b.offset));
	}).map(function(item){
		return {file:item.file,page:item.page,offset:item.offset,from:item.from,to:item.to};
	})
}

kde.open(kdb,function(err,_db){
	db=_db;
	db.get([["filecontents"],["filenames"]],{recursive:true},function(data){
		filecontents=data[0];
		filenames=data[1];
		var lst=fs.readFileSync("./ketaka_json.lst"||process.argv[3],"utf8").split(/\r?\n/);		
		lst.map(doconvert);
		sortByFilePageOffset();
		fs.writeFileSync("./before_json/"+kdb+".json",JSON.stringify(json,""," "),"utf8");
	})
})