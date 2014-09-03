var http = require('http');
var url = require('url');
var exec = require('child_process').exec;
var fs = require('fs');
var qs = require('querystring');

var message = "";


var bridges = new Array();
var bridge_settings = new Array();
var port = 8080;

function webRequest(req, res) {
	console.log("web request:" + req.method + " on " + req.url);
	
	switch(req.url) {
	case "/":
		mainPage(req, res);
		endRequest(req, res);
		break;
	case "/update":
		doPost(req, res);
		//endRequest(req, res);
		break;
	case "/favicon.ico":
		console.log("handle favicon - 404");
		res.writeHead(404, {"Content-Type": "text/html"});
		endRequest(req, res);
		break;
	}
}

function mainPage(req, res) {
	res.writeHead(200, {"Content-Type": "text/html"});
	topHead(req, res);
	body(req, res);
	bottom(req, res);
}

function body(req, res) {
	res.write("<hr><table border=\"0\">");
	res.write("<tr valign=\"top\">");
	for(var i=0; i<bridges.length; i++) {
		var ilkm = bridge_settings[i].split(/[;:]/);
		//console.log("sets");
		//console.log(bridge_settings);
		//console.log("ilkm");
		//console.log(ilkm);
		res.write("<td>");
		res.write("<form method=\"POST\" action=\"/update\"><input type=\"hidden\" name=\"bridge\" value=\""+i.toString()+"\"><table border=\"1\"><tr><th colspan=\"4\">Bridge "+bridges[i]+"</th></tr>");
		res.write("<tr><td>Speed</td><td><input type=\"text\" name=\"speed\" value=\""+ilkm[1]+"\"> kbps</td><td colspan=\"2\">0 is unlimited</td></tr>");
		res.write("<tr><td>Latency</td><td><input type=\"text\" name=\"latency\" value=\""+ilkm[3]+"\"> ms</td>");
		res.write("<td>Jitter</td><td><input type=\"text\" name=\"jitter\" value=\""+ilkm[5]+"\"> ms</td></tr>");
		res.write("<tr><td>Duplicated Packets</td><td><input type=\"text\" name=\"dupe\" value=\""+ilkm[7]+"\"> %</td></tr>");
		res.write("<tr><td>Dropped Packets</td><td><input type=\"text\" name=\"dropped\" value=\""+ilkm[9]+"\"> %</td>");
		res.write("<td>Distribution</td><td><input type=\"text\" name=\"dropdist\" value=\""+ilkm[11]+"\"> %</td></tr>");
		res.write("<tr><td>Corrupted Packets</td><td><input type=\"text\" name=\"corrupt\" value=\""+ilkm[13]+"\"> %</td></tr>");
		res.write("<tr><td>Out-of-order Packets</td><td><input type=\"text\" name=\"outoforder\" value=\""+ilkm[15]+"\"> %</td>");
		res.write("<td>Distribution</td><td><input type=\"text\" name=\"ooodist\" value=\""+ilkm[17]+"\"> %</td></tr>");
		res.write("<tr><td colspan=\"4\" align=\"right\"><input type=\"submit\" name=\"Update\" value=\"Update\"></td></tr>");
		res.write("</table></form>");
		res.write("</td>");
	}
	res.write("</tr>");
	res.write("</table>");
	
	res.write("<hr><h3>Help</h3><b>Speed</b>: Data rate packets are allowed to pass the interface (uses delay and queueing - classic token bucket filter)<br><b>Latency</b>: How much delay to put onto packets<br>");
	res.write("<b>Jitter</b>: How much to randomally change the latency by - i.e. total latency is latency +/- a random amount specified by jitter, 10ms delay + 5ms jitter can mean packets are delayed by between 5 and 15ms<br>");
	res.write("<b>Duplicated Packets</b>: Random duplication of packet data based on this number as a percentage<br>");
	res.write("<b>Dropped Packets</b>: Percentage change of packets being dropped<br>");
	res.write("<b>Dropped Packets Distribution</b>: tries to bundle together dropped packets into \"bunches\", this number (as a percentages) defines how bunched up they are<br>");
	res.write("<b>Corrupted Packets</b>: Packets are randomally corrupted and have a change of being corrupted based on this percentage<br>");
	res.write("<b>Corrupted Packets Distribution</b>: tries to bundle together corrupted packets into \"bunches\", this number (as a percentages) defines how bunched up they are<br>");
	res.write("<b>Out-of-order Packets</b>: Packets are randomally delayed to cause out-of-order delivery this number defines the chance of this occuring as a percent<br>");
	res.write("<b>Out-of-order Packets Distribution</b>: tries to bundle together out-of-order packets into \"bunches\", this number (as a percentages) defines how bunched up they are<br>");
}

function bottom(req, res) {
	res.write("</body></html>");
}

function topHead(req, res) {
	res.write("<html><head></head><style type=\"text/css\">body {background-color:#999;}p {color:blue;}</style><body><h2>Bridge WANEMU</h2>");
	if(message != "") {
		res.write("<hr><table border=\"0\" width=\"100%\"><tr width=\"100%\"><td width=\"100%\" bgcolor=\"#eeeeee\"><font color=\"#FF3333\">"+message+"</font></td></tr></table>");
		message = "";
	}
	
}

function doPost(req, res) {
    var body = '';
    var POST;
    req.on('data', function (data) {
        body += data;
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6) { 
            // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
            request.connection.destroy();
        }
    });
    req.on('end', function () {

        POST = qs.parse(body);
        setParams(POST, req, res);
        // use POST

    });
}

function setParams(postdata, req, res) {
	
	//console.log("postdata");
	//console.log(postdata);
	
	var brnum = postdata["bridge"];
	var newline = "speed:"+postdata["speed"]+";latency:"+postdata["latency"]+";jitter:"+postdata["jitter"]+";dupe:"+postdata["dupe"]+";dropped:"+postdata["dropped"];
	newline += ";dropdist:"+postdata["dropdist"]+";corrupt:"+postdata["corrupt"]+";outoforder:"+postdata["outoforder"]+";ooodist:"+postdata["ooodist"];
	
	bridge_settings[brnum] = newline;
	var brname = bridges[brnum];

	// console.log("new dataline: "+newline);
	
	var speedline = "";
	var netemline = "";
	
	netemline = "tc qdisc del dev "+brname+" root;tc qdisc add dev "+brname+" root netem";
	if(postdata["latency"] != 0) netemline += " delay "+postdata["latency"]+"ms";
	if(postdata["jitter"] != 0 && postdata["latency"] != 0) netemline += " "+postdata["jitter"]+"ms";
	if(postdata["dupe"] != 0) netemline += " duplicate "+postdata["dupe"]+"%";
	if(postdata["dropped"] != 0) netemline += " loss "+postdata["dropped"]+"%";
	if(postdata["dropped"] != 0 && postdata["dropdist"] != 0) netemline += " "+postdata["dropdist"]+"%";
	if(postdata["corrupt"] != 0) netemline += " corrupt "+postdata["corrupt"]+"%";
	if(postdata["outoforder"] != 0) netemline += " reorder "+postdata["outoforder"]+"%";
	if(postdata["outoforder"] != 0 && postdata["ooodist"] != 0) netemline += " "+postdata["ooodist"]+"%";
	if(postdata["speed"] != 0) netemline += " rate "+postdata["speed"]+"kbit";
	
	
	
	//if(postdata["speed"] != 0) {
		//speedline = "tc qdisc add dev "+brname+	" parent 1:1 handle 10: tbf rate "+postdata["speed"]+"kbit buffer 1600 limit 3000";
		//netemline += ";"+speedline;
	//}
	
	
	var child = exec(netemline, function(error, stdout, stderr) {
	    //console.log('stdout: ' + stdout);
	    //console.log('stderr: ' + stderr);
	    if (error !== null) {
	    	console.log("applied netem bits failed: "+error);
	    	console.log("was called as "+netemline);
	    	message = "<font color=\"#FF3333\">failed to apply... ("+error+")</font>";
	    } else {
	    	message = "<font color=\"#1111FF\">Applied</font>";
	    	//console.log("applied netembits");
	    	//console.log("stdout: "+stdout);
	    }
	    
		res.writeHead(302, {"Location": "/"});
		endRequest(req, res);

	});
	//console.log("netline is "+netemline);

}

function endRequest(req, res) {
	res.end();
}



function startUp() {
	// here we probe the modules, check for root, check for tc
	// modprobe sch_netem, sch_tbf
	
	// check for bridges
	
	// rather then doing it via a directory read..?
	var flist = fs.readdirSync("/sys/class/net");
	for(var i=0;i<flist.length;i++) {
		//console.log("at "+flist[i]);
		if(flist[i].match(/^emu.*/) !== null) {
			//console.log("----- match");
			bridges.push(flist[i]);
			
			bridge_settings.push("speed:0;latency:0;jitter:0;dupe:0;dropped:0;dropdist:0;corrupt:0;outoforder:0;ooodist:0");
			
		}
	}
	
	if(bridges.length < 1) {
		console.log("didnt find any bridge interfaces.... expecting to find an interface with a name starting with emu... did you create one yet?");
		process.exit(2);
	}
	
	
	var child = exec("/sbin/modprobe -a sch_netem sch_tbf", function(error, stdout, stderr) {
	    //console.log('stdout: ' + stdout);
	    //console.log('stderr: ' + stderr);
	    if (error !== null) {
	      console.log('Problem loading kernel modules: ' + error);
	    } else {
	    	console.log("Probing kernel modeuls...");
	    	startServer();
	    }
	});
}

function usage() {
    //console.log("Usage: "+process.argv[1]+" port interface0 [... interfaceN]");
	console.log("Usage: "+process.argv[1]+" port");
    process.exit(1);
}

//if(typeof process.argv[3] == "undefined") {
if(typeof process.argv[2] == "undefined") {
    usage();
}

port = parseInt(process.argv[2]);

if((port < 1) || (port > 65535) || (typeof port != "number")) {
	usage();
}

startUp();

function startServer() {
	console.log("starting webserver on port "+port.toString());
	var server = http.createServer(function (req, res) {
			webRequest(req,res);
		});
	
	
	server.listen(port);
}

