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

		json.push({f:fidx,seg:pageid-1,file:ljfn,page: segnames[pageid-1],start:row.doc.start, len:row.doc.len, from:oldtext, text:row.doc.payload.text});
	});
}
var doconvert=function(file){
	var json=require("./"+file);
	ljfn=file.substr(file.length-17,12).replace(/\\/,"/").replace("/","/lj").replace("-","_")+".xml";

	var rows=json.rows;
	getApproved(rows);
}

kde.open(kdb,function(err,_db){
	db=_db;
	db.get([["filecontents"],["filenames"]],{recursive:true},function(data){
		filecontents=data[0];
		filenames=data[1];
		var lst=fs.readFileSync("./ketaka_json.lst"||process.argv[3],"utf8").split(/\r?\n/);		
		lst.map(doconvert);
		fs.writeFileSync("./before_json/"+kdb+".json",JSON.stringify(json,""," "),"utf8");
	})
})