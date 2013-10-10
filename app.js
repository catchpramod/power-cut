$(document).ready(function(){

		updateOnlineStatus();	

		window.addEventListener('online',  updateOnlineStatus);
  		window.addEventListener('offline', updateOnlineStatus);

		var group = getLocalGroup();
		var routine = getLocalRoutineJson();
		$('#select-choice-group').val(group);
		$('#select-choice-group').selectmenu('refresh');
		var jsonRender = renderRoutine(group,routine);
		
		$('#select-choice-group').change(function(){
			group=$('#select-choice-group').val();
			setLocalGroup(group);
			var routine = getLocalRoutineJson();
			var jsonRender = renderRoutine(group,routine);

		});

	

		$("#updateBtn").click(function(){
		  updateSchedule();
		  
		});


	   
		
});


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
	console.log(online);
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
	console.log('getting local routine');
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
	  console.log("group saved "+group);
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
      console.log('routine saved!!!')
	}
}



function updateSchedule(){
	startOverlay("Downloading");
	$.ajax({
	    type: "GET",
	    url: "https://dl.dropboxusercontent.com/u/55610371/loadshedding.json",
	    success: function (routine) {
	    	stopOverlay();
	    	console.log(routine);
	    	// routine = JSON.stringify(routine);
	    	console.log('after stringify\'' + routine+'\'');
	    	setLocalRoutineJson(routine);
	    	var group = getLocalGroup();
		  	var routine = getLocalRoutineJson();
		  	console.log('routine::::'+routine);
		  	startOverlay("Refreshing");
		  	var test = renderRoutine(group,routine);
		  	stopOverlay();
	    },
	    error: function(error) {
     		console.log(error.statusText);
   		}
	});
}




function renderRoutine(group,routine){
	console.log('rendering routine');

	var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

	// test = "[[[5,0,8,0],[13,0,17,0]],[[8,0,11,0],[17,0,20,0]],[[10,0,14,0],[19,30,21,30]],[[6,0,9,0],[14,0,18,0]],[[11,0,16,0],[20,0,22,0]],[[7,0,10,0],[16,0,19,30]],[[9,0,13,0],[18,0,21,0]]]";

	var start=0;
	var start =+group;

	var finalJson = {};
	var listJson = new Array();

	$("#list").html("");
	console.log('routine:  \'' + routine+'\'');


	if(routine==' '){
		$("#list").append("<li>Please update to load the schedule!!<p>You need to be online to update the schedule.</p></li>");
		$('#list').listview('refresh');
		listJson.push({day:'',first:'',second:''});
		finalJson.data = listJson;
		console.log('No schedule found!!');
		return finalJson;
	}


	var routineJson = JSON.parse(routine);
	console.log('routinejson:  \'' + routineJson+'\'');

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

		firstString=parseHour(firstStartHour,firstStartMin)+" - "+parseHour(firstEndHour,firstEndMin);
		secondString=parseHour(secondStartHour,secondStartMin)+" - "+parseHour(secondEndHour,secondEndMin);

		day = days[i];

		eachJson = {day:day,first:firstString,second:secondString};
        listJson.push(eachJson);

		console.log(eachJson);
		console.log(listJson);


				
		listElement= "<li style=\"padding: 10px 5px;\"><div class=\"ui-grid-b\"><div class=\"ui-block-a\" style=\"margin-right: -10px;\">";
		listElement+=day;
		listElement+="</div><div class=\"ui-block-b\" class=\"hours\" style=\"font-weight: 100; font-size: 14px; margin-right: 10px;\" align=\"center\">";
		listElement+=firstString;
		listElement+="</div><div class=\"ui-block-c\" class=\"hours\" style=\"font-weight: 100; font-size: 14px;\" align=\"center\">";
		listElement+=secondString;
		listElement+="</div></div></li>";

		$("#list").append(listElement);
		$('#list').listview('refresh');



	}


	finalJson.data = listJson;
	console.log(finalJson);
	return finalJson;
}

function parseHour(hour,min){
	tail="A";
	if (hour<12){
		tail="A";

	}else if (hour==12&& min == 0){
		tail="A";
	}else{
		hour=hour-12;
		tail="P";
	}

	hs = hour;
	ms = min;

	if(hour<10) hs="0"+hour;
	if(min<10) ms="0"+min;

	return hs +":"+ms+tail;

}

// http://udacityblogg.appspot.com/loadshedding.json

