$(document).ready(function(){

		updateOnlineStatus();	

		window.addEventListener('online',  updateOnlineStatus);
  		window.addEventListener('offline', updateOnlineStatus);

		var group = getLocalGroup();

		$('#select-choice-group').val(group);
		$('#select-choice-group').selectmenu('refresh');
		var jsonRender = renderRoutine();
		
		$('#select-choice-group').change(function(){
			stopTimerFunction();
			group=$('#select-choice-group').val();
			setLocalGroup(group);
			var jsonRender = renderRoutine();
			startTimerFunction();

		});

		$("#updateBtn").click(function(){
			stopTimerFunction();
			updateSchedule();
			startTimerFunction();

		});
		
		startTimerFunction();

});


function startTimerFunction(){
	console.log("starting timer!!");
	timerVar = setTimeout(function(){
		console.log("repainting from timer!!");
		var jsonRender = renderRoutine();
		timerVar = setTimeout(arguments.callee, 15000);
	},15000);
}


function stopTimerFunction(){
	console.log("stoping timer!!");
	clearTimeout(timerVar);
}



function startOverlay(msg){
	var showText=false;
	if (msg!='') showText=true; 

	$("#home").addClass('ui-disabled');

	$.mobile.loading( 'show', {
		text: msg,
		textVisible: showText,
		theme: 'a',
		html: ""
	});
}

function stopOverlay(){
	$("#home").removeClass('ui-disabled');
	$.mobile.loading( 'hide');
}


function updateOnlineStatus(event){
	online = navigator.onLine
	online ? $("#updateBtn").css('display','') : $("#updateBtn").css('display','none');
}

function getLocalGroup(){
	for (i=0; i<=localStorage.length-1; i++){  
		key = localStorage.key(i);  
		val = localStorage.getItem(key);
		if (key=="loadshedding_group") return val;
	}
	return " ";  
}

function getLocalUpdateDate(){
	for (i=0; i<=localStorage.length-1; i++){  
		key = localStorage.key(i);  
		val = localStorage.getItem(key);
		if (key=="loadshedding_update_date") return val;
	}	
	return " ";
}

function getLocalRoutineJson(){
	// return "[[[5,0,8,0],[13,0,17,0]],[[8,0,11,0],[17,0,20,0]],[[10,0,14,0],[19,30,21,30]],[[6,0,9,0],[14,0,18,0]],[[11,0,16,0],[20,0,22,0]],[[7,0,10,0],[16,0,19,30]],[[9,0,13,0],[18,0,21,0]]]";
	for (i=0; i<=localStorage.length-1; i++){  
		key = localStorage.key(i);  
		val = localStorage.getItem(key);
		if (key=="loadshedding_routine_json") return val;
	}	
	return " "	;
}

function setLocalGroup(group){
	if (window.localStorage) {
      localStorage.setItem("loadshedding_group",group);
	}
}

function setLocalUpdateDate(date){
	if (window.localStorage) {
      localStorage.setItem("loadshedding_update_date",date);
	}
}
function setLocalRoutineJson(routine){
	if (window.localStorage) {
      localStorage.setItem("loadshedding_routine_json",routine);
	}
}



function updateSchedule(){
	startOverlay("Downloading");
	$.ajax({
	    type: "GET",
	    url: "https://dl.dropboxusercontent.com/u/55610371/loadshedding.json",
	    success: function (routine) {
	    	stopOverlay();
	    	setLocalRoutineJson(routine);
		  	startOverlay("Refreshing");
		  	var test = renderRoutine();
		  	stopOverlay();
	    },
	    error: function(error) {
     		console.log(error.statusText);
   		}
	});
}




function renderRoutine(){
	var group = getLocalGroup();
	var routine = getLocalRoutineJson();
	var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

	// test = "[[[5,0,8,0],[13,0,17,0]],[[8,0,11,0],[17,0,20,0]],[[10,0,14,0],[19,30,21,30]],[[6,0,9,0],[14,0,18,0]],[[11,0,16,0],[20,0,22,0]],[[7,0,10,0],[16,0,19,30]],[[9,0,13,0],[18,0,21,0]]]";

	var start=0;
	var start =+group;

	var finalJson = {};
	var listJson = new Array();

	$("#list").html("");


	if(routine==' '){
		$("#list").append("<li>Please update to load the schedule!!<p>You need to be online to update the schedule.</p></li>");
		$('#list').listview('refresh');
		listJson.push({day:'',first:'',second:''});
		finalJson.data = listJson;
		return finalJson;
	}


	var routineJson = JSON.parse(routine);

	start = start++;

	for (i=0;i<7;i++){
		// pointer should go from 0,6,5,4,3,2,1,0,6,5.....
		// we have i which goes from 0,1,2,3.... 
		// and a starting value which can range between 1 to 7

		var pointer = (8-start+i) % 7;
		if(pointer<0) pointer=pointer+7;

		var day = routineJson[pointer];

		var firstShift= new Array();
		firstShift= day[0];
		var secondShift= new Array();
		secondShift= day[1];

		firstStartHour = firstShift[0];
		firstStartMin = firstShift[1];
		firstEndHour = firstShift[2];
		firstEndMin = firstShift[3];

		secondStartHour = secondShift[0];
		secondStartMin = secondShift[1];
		secondEndHour = secondShift[2];
		secondEndMin = secondShift[3];

		firstString=parseHour(firstStartHour,firstStartMin)+" ‒ "+parseHour(firstEndHour,firstEndMin);
		secondString=parseHour(secondStartHour,secondStartMin)+" ‒ "+parseHour(secondEndHour,secondEndMin);
		timestring=firstString +"<br/>"+secondString

		day = days[i];

		eachJson = {day:day,first:firstString,second:secondString};
        listJson.push(eachJson);

		var weekday =+ new Date().getDay();
		var styleClass="";
		var darkbulb="";
		var lightbulb="";
		if(i==weekday){
			styleClass = "today";
			powerOut=isPowerOut(firstStartHour, firstStartMin, firstEndHour, firstEndMin, secondStartHour, secondStartMin, secondEndHour, secondEndMin);
			darkbulb= powerOut?"show":"hide";
			lightbulb= powerOut?"hide":"show";
		}else{
			styleClass = "nottoday";
		}
		
		bulbHtml= '<div class="current-status"> <img id="darkbulb" class="'+darkbulb+'" src="images/bulb_dark_32.png"/>';
		bulbHtml+= '<img id="lightbulb" class="'+lightbulb+'" src="images/bulb_light_32.png"/>';
		bulbHtml+= '</div>';

		
				
		listElement= "<li ";
		listElement+= "class =\""+styleClass+"\"";
		listElement+="><div class=\"ui-block-p\">";
		listElement+=day;
		listElement+="</div><div class=\"ui-block-q\"><div class=\"timetext\">";
		listElement+=timestring;
		listElement+="</div>";
		listElement+=bulbHtml;
		listElement+="</div></li>"
		
		$("#list").append(listElement);
		$('#list').listview('refresh');



	}


	finalJson.data = listJson;

	return finalJson;
}

function isPowerOut(fsh,fsm,feh,fem,ssh,ssm,seh,sem){
	var now = new Date();
	var fstart = new Date(now.getFullYear(),now.getMonth(),now.getDate(),fsh,fsm).getTime();
	var fend = new Date(now.getFullYear(),now.getMonth(),now.getDate(),feh,fem).getTime();
	var sstart = new Date(now.getFullYear(),now.getMonth(),now.getDate(),ssh,ssm).getTime();
	var send = new Date(now.getFullYear(),now.getMonth(),now.getDate(),seh,sem).getTime();
	console.log(now.getMinutes());
	now = now.getTime();


	if(((fstart < now ) && (now < fend )) || ((sstart < now ) && (now < send )) ) {
	  return true;
	}
	else {
	 return false;
	}
}

function parseHour(hour,min){
	tail="A";
	if (hour<12){
		tail=" AM";

	}else if (hour==12&& min == 0){
		tail=" AM";
	}else{
		hour=hour-12;
		tail=" PM";
	}

	hs = hour;
	ms = min;

	if(hour<10) hs="0"+hour;
	if(min<10) ms="0"+min;

	return hs +":"+ms+tail;

}

