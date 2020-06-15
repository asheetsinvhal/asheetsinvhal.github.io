var apiCall_List = [];
var sheetName = "";
var members;

// Initialising Google Sheets API with verification of the user.//
function initClient() {
	//TODO: Update placeholder with your API key generated from Google cloud console.//
    var API_KEY = 'AIzaSyBHPulqLz69RWAQV9I-AQ7oHL-7aDm8ntY';
    //TODO: Update placeholder with your client ID.//
    var CLIENT_ID = '288596195086-4kckr5a3iaus4qeo28t4qleoegq0bffd.apps.googleusercontent.com';
	// These are default values
    var SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
    gapi.client.init({
        'apiKey': API_KEY,
        'clientId': CLIENT_ID,
        'scope': SCOPE,
        'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(function() {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
        updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}
function updateSignInStatus(isSignedIn) {
    if (isSignedIn) {
		//Custom function to specify the sheet names//
        setSheets();
    }
}
function handleSignInClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignOutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}
function setSheets() { 
	//Specify read and write sheets respectively//
    apiRead_Sheet = ['Grocery Names']; 
	// Write sheet along with the start cell must be mentioned//
    apiWrite_Sheet = 'Orders!A2';  
    readSheets();
}
function readSheets() {
    //Google sheets api begins here//
    var params = {
        /*The ID of the spreadsheet to retrieve data from. 
			Ensure that the sheet has been published
		*/
        spreadsheetId: '1hjev7D-SCDPjukXNyclKtJX8tfBxI7m2mzpbZlUM1Jk',
        ranges: apiRead_Sheet,
        // The default render option is ValueRenderOption.FORMATTED_VALUE.
        valueRenderOption: 'UNFORMATTED_VALUE',
        //The default dateTime render option is[DateTimeRenderOption.SERIAL_NUMBER].
        dateTimeRenderOption: 'FORMATTED_STRING',
    };
	//To Read data from sheet//
    var request = gapi.client.sheets.spreadsheets.values.batchGet(params);
	//Making asynchronous call so as to retreive the values after they are updated in the spreadsheet
	return new Promise((resolve, reject) => {
		request.then(function(response) {
			//For testing the ouput in console
			console.log(response.result); 
			if (response.status == 200) {
				// Sheet data retrieved
				var all_data = response.result; 
				members = all_data.valueRanges[0].values; 
			}
			resolve();
		}, function(reason) {
            console.error('error: ' + reason.result.error.message);
			reject();
		});
	});
}

// Function to retrieve data from webpage and to send it to the sheet
order_action = async function(buttonId) {
	var user_name = document.getElementById('user_name').value;
    var cno = document.getElementById('cno').value;
	var grocery = document.getElementById('grocery').value;
    var qty = parseInt(document.getElementById('quantity').value);
    var price = Math.round(parseFloat(document.getElementById('price').value) * 100) / 100;
    var bill_value = qty * price;

    var params = {
        //The ID of the spreadsheet to write data into.
		spreadsheetId: '11hJrOFXSRW0a7Nmfbi9yfQUfl6-kmTscyYOc-29w8gQ',
        //The A1 notation of the cell address.Even if the cell is filled, next entry will go to next row/column
		range: apiWrite_Sheet,
        //Specify how the input data should be interpreted. RAW or USER_ENTERED.
		valueInputOption: 'USER_ENTERED',
        //TODO: Update placeholder value.
		insertDataOption: 'OVERWRITE'
    };
    if (buttonId == "buy") {
        var valueRangeBody = {
            "values": [
			    // Sequence in which the values are to be written in the sheet
                [user_name,cno,grocery,price,qty,bill_value] 
            ]
        };
    } else {
        clearInputs();
		return;
    }
	//Using the append method of Sheets API
    var request = gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody);
	//Calling the API again to read the data from spreadsheet
    await request.then(async function(response) {
            if (response.status == 200) {
                showNotif('ORDER SUCCESFUL');
                await readSheets();
                await putOrderData();
            } else {
                showNotif('! TRY AGAIN !');
            }
            clearInputs();
        },
        function(reason) {
            console.error('error: ' + reason.result.error.message);
        });
	
}
function showPort() {
    document.getElementById('order-popup').style.display = 'block';
}

function hidePort() {
    document.getElementById('order-popup').style.display = 'none';
}	
function clearInputs(){
	document.getElementById('user_name').value = '';
	document.getElementById('cno').value = '';
    document.getElementById('grocery').value = -1;
    document.getElementById('quantity').value = '';
    document.getElementById('price').value = '';
	document.getElementById('order-popup').style.display = 'none';
}