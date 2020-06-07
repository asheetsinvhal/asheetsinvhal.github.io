/* To display team scores*/
var teams_data1 = [];
var teams_data2 = [];
var teams_data3 = [];
var teams_data4 = [];

var teams_total;
var tableData;
var cell1, cell2, cell3;
function initClient() {
		var API_KEY = 'AIzaSyA16qFTzT3YFBt1dWKnhvBYLQ8F0E-ZCrA'; // TODO: Update placeholder with desired API key.
    var CLIENT_ID = '640886712280-1s9dj5rprihdgouqo3r2cd663ougcetq.apps.googleusercontent.com'; // TODO: Update placeholder with desired client ID.
    var SCOPE = 'https://www.googleapis.com/auth/spreadsheets';


    gapi.client.init({
            'apiKey': API_KEY,
            'clientId': CLIENT_ID,
            'scope': SCOPE,
            'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        })
        .then(function() {
            gapi.auth2.getAuthInstance()
                .isSignedIn.listen(updateSignInStatus);
            updateSignInStatus(gapi.auth2.getAuthInstance()
                .isSignedIn.get());
        });
}

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function updateSignInStatus(isSignedIn) {
    if (isSignedIn) {
        getTeamData();
    }
}

function handleSignInClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignOutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function getTeamData() { //Google sheets api
    var params = {
        // The ID of the spreadsheet to retrieve data from.
        spreadsheetId: '11hJrOFXSRW0a7Nmfbi9yfQUfl6-kmTscyYOc-29w8gQ',
        // The A1 notation of the values to retrieve.
        ranges: ['TeamScoresR1','TeamScoresR2','TeamScoresR3','TeamScoresR4'],   

        // How values should be represented in the output.
        // The default render option is ValueRenderOption.FORMATTED_VALUE.
        valueRenderOption: 'UNFORMATTED_VALUE', // TODO: Update placeholder value.

    };

    var request = gapi.client.sheets.spreadsheets.values.batchGet(params); // to read data
    request.then(function(response) {
	   console.log( response.result);
        if (response.status == 200) {
            var all_data = response.result;
            teams_data1 = all_data.valueRanges[0].values; //Change for each round
            teams_data2 = all_data.valueRanges[1].values;
            teams_data3 = all_data.valueRanges[2].values;
            teams_data4 = all_data.valueRanges[3].values;
        }
    }, function(reason) {
        console.error('error: ' + reason.result.error.message);
    });
}

 function loadTeamData() {
	  var round = document.getElementById('round').value;
	  tableData = document.getElementById('scoreTable').getElementsByTagName('tbody')[0];
	  var teams_table_list= [];
	  resetTable(tableData);
    var row_count = 0; 
    switch(round){
			case "1":
				teams_table_list = teams_data1;
				break;
			case "2":
				teams_table_list = teams_data2;
				break;
			case "3":
				teams_table_list = teams_data3;
				break;
			case "4":
				teams_table_list = teams_data4;
				break;
			default:
				return;
		}
    for (var k = 1; k < teams_table_list.length; k += 1) {
        var row = tableData.insertRow(row_count);
        cell1 = row.insertCell(0);
        cell1.innerHTML = teams_table_list[k][0];
        cell2 = row.insertCell(1);
        cell2.innerHTML = teams_table_list[k][1];
        cell3 = row.insertCell(2);
				cell3.innerHTML = Math.round(parseFloat(teams_table_list[k][8]) * 100) / 100;
        cell4 = row.insertCell(3);
				var score = Math.round(parseFloat(teams_table_list[k][2]) * 100) / 100;
        cell4.innerHTML = score;
        row_count += 1;
        if( row_count == 12){
          break;
        }
    }
   }
    
    function resetTable(tableData) {
      if( tableData.rows && tableData.rows.length > 0){
         var rowCount = tableData.rows.length;
         for (var i = rowCount-1; i > -1; i-=1) {
            tableData.deleteRow(i);
         }
      }else{
         return;		
      }
	  }
