var apiRead_Sheet = [];
var apiWrite_Sheet = "";
var groceries_data;
var item_price = 0;
var unit_qty = 0;

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
				groceries_data = all_data.valueRanges[0].values; //Data on 1st sheet--0,2nd sheet--1
				loadGroceryData();
			}
			resolve();
		}, function(reason) {
            console.error('error: ' + reason.result.error.message);
			reject();
		});
	});
}

function loadGroceryData(){
    item_content = document.getElementById('grocery');
    item_content.innerHTML = '<option>-</option>';
    for (var i in groceries_data) {
        item_content.innerHTML += '<option>' + groceries_data[i][0] + '</option>';
    }
}

function updateGroceryPrice() {
    var item_name = document.getElementById('grocery').value;
	for(var i = 1; i <= groceries_data.length; i++) {
		if(groceries_data[i][0] == item_name) {
			unit_qty = groceries_data[i][2];
			item_price = groceries_data[i][1];
			break;
		}
	}
	document.getElementById('quantity').setAttribute('placeholder', 'UNIT SIZE ' + unit_qty ? unit_qty : 0);
	document.getElementById('price').value = item_price ? Math.round(parseFloat(item_price) * 100) / 100 : 0;
        
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
                await loadOrderData();
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

function loadOrderData() {
    order_book = document.getElementById('order_book');
    order_book.innerHTML = '';
    order_book.innerHTML += '<div style="display: table">';
    order_book.innerHTML += '<div style="display: table-row"><div style="display: table-cell;padding: 4px;border: 1px solid black;color: #0ba216;">ITEM</div><div style="display: table-cell;padding: 4px;border: 1px solid black;color: #0ba216;"> QTY </div><div style="display: table-cell;padding: 4px;border: 1px solid black;color: #0ba216;"> VALUE </div></div>';
    var row_count = 0;
    for (var k = 1; k < groceries_data.length; k += 1) {
        if (groceries_data[k][0] == parseInt(team_id)) {
            var current_value = Math.round(parseFloat(groceries_data[k][4]) * 100) / 100;
            order_book.innerHTML += '<div style="display: table-row">' + '<div style="display: table-cell;padding: 4px;border: 1px solid black;">' + groceries_data[k][1] + '</div>' + '<div style="display: table-cell;padding: 4px;border: 1px solid black;">' + groceries_data[k][2] + '</div>' + '<div style="display: table-cell;padding: 4px;border: 1px solid black;">' + current_value + '</div>' + '</div>';
            row_count += 1;
        }
        if (row_count == 5) break;
    }
    order_book.innerHTML += '</div>';
    showPort();
};