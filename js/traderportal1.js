/** * Trading portal for trader 1 */
var country_data = {
    "AUSTRALIA": ["BHP", "CSL", "RIO", "IRE", "CBA"],
    "UK": ["LLOY", "BP", "AZN", "BARC", "BRBY"],
    "USA": ["AMZN", "UNH", "AAPL", "F", "BA"],
    "INDIA": ["BPCL", "RELIANCE", "IDEA", "HDFCBANK", "TATAMOTORS"],
    "CHINA": ["PTR", "ABC", "XIACF", "BABA", "ALI"],
    "GERMANY": ["SAP", "SIE", "ADS", "VOW", "TVAG"],
    "FRANCE": ["FP.PA", "SAN", "LVMH", "BNP", "UG"]
};
var apiCall_List = [];
var apiWrite_Sheet = "";
var country;
var stocks;
var portfolio_data;
var team_data;
var upper_ckt;
var lower_ckt;
var max_stk_qty = 0;
var cash_balance;
var stk_price = 0;

function initClient() {
    var API_KEY = 'AIzaSyA16qFTzT3YFBt1dWKnhvBYLQ8F0E-ZCrA';
    //TODO: Update placeholder with desired API key.//
    var CLIENT_ID = '640886712280-1s9dj5rprihdgouqo3r2cd663ougcetq.apps.googleusercontent.com';
    //TODO: Update placeholder with desired client ID.//
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
        setSheets();
    }
}

function handleSignInClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignOutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}
//new addition
function setSheets() {
    var round = document.getElementById('round').value;
    switch (parseInt(round)) {
        case 1:
            apiCall_List = ['Stock_Names', 'Stock_Prices', 'PortfolioR1', 'TeamScoresR1'];
            apiWrite_Sheet = 'TestUIn1!A2';
            makeApiCall();
            break;
        case 2:
            apiCall_List = ['Stock_Names', 'Stock_Prices', 'PortfolioR2', 'TeamScoresR2'];
            apiWrite_Sheet = 'TestUIn2!A2';
            makeApiCall();
            break;
        case 3:
            apiCall_List = ['Stock_Names', 'Stock_Prices', 'PortfolioR3', 'TeamScoresR3'];
            apiWrite_Sheet = 'TestUIn3!A2';
            makeApiCall();
            break;
        case 4:
            apiCall_List = ['Stock_Names', 'Stock_Prices', 'PortfolioR4', 'TeamScoresR4'];
            apiWrite_Sheet = 'TestUIn4!A2';
            makeApiCall();
            break;
        default:
            apiCall_List = ['Stock_Names', 'Stock_Prices', 'PortfolioR1', 'TeamScoresR1'];
            apiWrite_Sheet = 'TestUIn1!A2';
            makeApiCall();
            break;
    }
}

function makeApiCall() {
    //Google sheets api//
    var params = {
        //The ID of the spreadsheet to retrieve data from.//
        spreadsheetId: '11hJrOFXSRW0a7Nmfbi9yfQUfl6-kmTscyYOc-29w8gQ',
        //The A1 notation of the values to retrieve.//
        ranges: apiCall_List,
        //ranges: ['Stock_Names', 'Stock_Prices', 'PortfolioR2', 'TeamScoresR2'],
        // For ROund2 ranges: ['Stock_Names', 'Stock_Prices', 'PortfolioR3', 'TeamScoresR3'],
        // For ROund3 The default render option is ValueRenderOption.FORMATTED_VALUE.
        valueRenderOption: 'UNFORMATTED_VALUE',
        //TODO: Update placeholder value.The
        //default dateTime render option is[DateTimeRenderOption.SERIAL_NUMBER].
        dateTimeRenderOption: 'FORMATTED_STRING',
        //TODO: Update placeholder value.
    };
    var request = gapi.client.sheets.spreadsheets.values.batchGet(params);
    //to read data
    return new Promise((resolve, reject) => {
        request.then(function(response) {
            console.log(response.result);
            if (response.status == 200) {
                var all_data = response.result;
                country = all_data.valueRanges[0].values;
                stocks = all_data.valueRanges[1].values;
                portfolio_data = all_data.valueRanges[2].values;
                team_data = all_data.valueRanges[3].values;
            }
            resolve();
        }, function(reason) {
            console.error('error: ' + reason.result.error.message);
            reject();
        });
    });
}
putTeamData = function() {
    hidePort();
};
putCountryData = function() {
    //change to putTeamData 
    team_id = document.getElementById('team_id').value;
    country_name = document.getElementById('country_name').value;
    //Team name & Balance 
    cash_balance = Math.round(team_data[team_id][8] * 100) / 100;
    document.getElementById('team_name').innerHTML = team_data[team_id][1];
    document.getElementById('team_balance').innerHTML = cash_balance;
    main_content = document.getElementById('main');
    main_content.innerHTML = '<option>-</option>';
    for (var i in country_data[country_name]) {
        main_content.innerHTML += '<option>' + country_data[country_name][i] + '</option>';
    }
    team_id = document.getElementById('team_id').value;
    if (team_id != -1 && country_name != -1) {
        getPortfolio();
    }
};
getPortfolio = function() {
    main_p = document.getElementById('main_p');
    main_p.innerHTML = '';
    main_p.innerHTML += '<div style="display: table">';
    main_p.innerHTML += '<div style="display: table-row"><div style="display: table-cell;padding: 4px;border: 1px solid black;color: #0ba216;">StockID</div><div style="display: table-cell;padding: 4px;border: 1px solid black;color: #0ba216;"> QTY </div><div style="display: table-cell;padding: 4px;border: 1px solid black;color: #0ba216;"> VALUE </div></div>';
    var stock_count = 0;
    for (var k = 1; k < portfolio_data.length; k += 1) {
        if (portfolio_data[k][0] == parseInt(team_id)) {
            var current_value = Math.round(parseFloat(portfolio_data[k][4]) * 100) / 100;
            main_p.innerHTML += '<div style="display: table-row">' + '<div style="display: table-cell;padding: 4px;border: 1px solid black;">' + portfolio_data[k][1] + '</div>' + '<div style="display: table-cell;padding: 4px;border: 1px solid black;">' + portfolio_data[k][2] + '</div>' + '<div style="display: table-cell;padding: 4px;border: 1px solid black;">' + current_value + '</div>' + '</div>';
            stock_count += 1;
        }
        if ((round == 1 && stock_count == 5) || (stock_count == 10)) break;
    }
    main_p.innerHTML += '</div>';
    showPort();
};

function showPort() {
    document.getElementById('portfolio-popup').style.display = 'block';
}

function hidePort() {
    document.getElementById('portfolio-popup').style.display = 'none';
}
/* // Old code for reference
function refreshTeamData() {
    //write to sheets api
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            team_data = JSON.parse(this.responseText);
        }
    }
    xhttp.open("GET", "/teamdata", true);
    xhttp.send();
}
*/
function updateMarketPrice() { 
  shares = [];
    var params = {
        //The ID of the spreadsheet to retrieve data from.
      spreadsheetId: '11hJrOFXSRW0a7Nmfbi9yfQUfl6-kmTscyYOc-29w8gQ',
        //The A1 notation of the values to retrieve.
      ranges: ['Stock_Prices'],
        //TODO: Update placeholder value.How values should be represented in the output.The
        //default render option is ValueRenderOption.FORMATTED_VALUE.
      valueRenderOption: 'UNFORMATTED_VALUE',
        //TODO: Update placeholder value.How dates,
        //times,
        //and durations should be represented in the output.This is ignored
        //if value_render_option is FORMATTED_VALUE.The
        //default dateTime render option is[DateTimeRenderOption.SERIAL_NUMBER].
      dateTimeRenderOption: 'FORMATTED_STRING',
        //TODO: Update placeholder value.
    };
    var request = gapi.client.sheets.spreadsheets.values.batchGet(params);
    //to read data 
    request.then(function(response) {
        var stockId = document.getElementById('main').value;
        if (response.status == 200 && response.result.valueRanges[0] != null) {
            shares = response.result.valueRanges[0].values;
            //refreshed values of stocks
            for (var k = 1; k < shares.length; k += 1) {
                if (shares[k][0] == stockId) {
                    max_stk_qty = shares[k][5];
                    stk_price = shares[k][6];
                    break;
                }
            }
            upper_ckt = Math.round(parseFloat(1.20 * stk_price) * 100) / 100;
            lower_ckt = Math.round(parseFloat(0.80 * stk_price) * 100) / 100;
            document.getElementById('price').value = stk_price ? Math.round(parseFloat(stk_price) * 100) / 100 : 0;
            document.getElementById('quantity').setAttribute('placeholder', 'MAX BUY ' + max_stk_qty ? max_stk_qty : 0);
        }
    }, function(reason) {
        console.error('error: ' + reason.result.error.message);
    });
}
/* var $form=$('form#test-form'), 
url='https://script.google.com/a/imi.edu/macros/s/AKfycbyAeh_5252xghfdNs1Je9MlLQ9OmiuKz-TUxO7fmzkjCAqJdha_/exec' 
//App script url$('#submit-form').on('click', function(e){e.preventDefault(); 
var jqxhr=$.ajax({url: url, method: "GET", dataType: "json", data: $form.serializeObject()}).success( // do something );
})*/
stock_action = async function(buttonId) {
    var teamId = document.getElementById('team_id').value;
    var country = document.getElementById('country_name').value;
    var stockId = document.getElementById('main').value;
    //main - > stock ID
    var qty = parseInt(document.getElementById('quantity').value);
    var price = Math.round(parseFloat(document.getElementById('price').value) * 100) / 100;
    var trx_value = qty * price;
    if (teamId == "-1" || country == "-1" || stockId == "-" || isNaN(qty) || isNaN(price)) {
        showNotif('DATA MISSING !');
        return;
    }
    if ((buttonId == "BUY" && (price <= stk_price)) || (buttonId == "SELL" && (price >= stk_price))) {
        showNotif('INCORRECT ORDER AMOUNT !');
        return;
    }
    
    
    if ((trx_value > cash_balance) && buttonId == "BUY") {
        showNotif('INSUFFICIENT CASH BALANCE !');
        return;
    }
    if (price > upper_ckt || price < lower_ckt) {
        showNotif('PRICE EXCEEDS ±20% !');
        return;
    }
     //Added for quantity check
    /*if(buttonId == "SELL"){
        //await makeApiCall();
        //main_p = document.getElementById('main_p');
        if
        {
        team_id == portfolio_data[1][0]
        for (var k = 1; k <6; k += 1) {
        if (portfolio_data[k][1] == stockId && portfolio_data[k][2] < qty) {
                showNotif('Cannot sell as quantity exceeds');
                return;
        }
        }
        }
    }*/
    showNotif('PLACING ' + buttonId + ' ORDER');
    var params = {
        //The ID of the spreadsheet to retrieve data from.
      spreadsheetId: '11hJrOFXSRW0a7Nmfbi9yfQUfl6-kmTscyYOc-29w8gQ',
        //The A1 notation of the values to retrieve.
      range: apiWrite_Sheet,
        //CHANGES EVERY ROUND How the input data should be interpreted.
      valueInputOption: 'USER_ENTERED',
        //TODO: Update placeholder value.
    };
    
    
    if (buttonId == "BUY") {
        var valueRangeBody = {
            "values": [
                [qty, price, 0, 0, stockId, teamId]
            ]
        };
    } else {
        var valueRangeBody = {
            "values": [
                [0, 0, qty, price, stockId, teamId]
            ]
        };
    }
    var request = gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody);
    await request.then(async function(response) {
            if (response.status == 200) {
                showNotif(buttonId + ' ORDER SUCCESFUL');
                await makeApiCall();
                await putCountryData();
            } else {
                showNotif('! TRY AGAIN !');
                showPort();
            }
            document.getElementById('country_name').value = '';
            document.getElementById('main').value = -1;
            document.getElementById('quantity').setAttribute('placeholder', '');
            document.getElementById('quantity').value = '';
            document.getElementById('team_id').value = '';
            document.getElementById('price').value = '';
        },
        function(reason) {
            console.error('error: ' + reason.result.error.message);
        });
}

function showNotif(text, background = "white", color = "red") {
    if (document.getElementById('notif').style.display == 'block') {
        setTimeout(function() {
            showNotif(text, background)
        }, 2000);
    } else {
        document.getElementById('notif').innerHTML = text;
        document.getElementById('notif').style.background = background;
        document.getElementById('notif').style.display = 'block';
        document.getElementById('notif').style.color = color;
        setTimeout(function() {
            document.getElementById('notif').style.display = 'none'
        }, 2000);
    }
}
