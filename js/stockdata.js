/* Stock table data that shows price changes*/
var old_cmp_list1 = [0];
var new_cmp_list1 = [0];
var old_cmp_list2 = [0];
var new_cmp_list2 = [0];
var last_refresh = 'NEVER';
var stocks_data;
var country_name1;
var country_name2;
var tableData1;
var tableData2;
var cell1, cell2, cell3, cell4;
var updatePriceRun = 0;
var refreshIntervalId1 = 0;
var refreshIntervalId2 = 0;

function initClient() {
    var API_KEY = 'AIzaSyA16qFTzT3YFBt1dWKnhvBYLQ8F0E-ZCrA';
    //TODO: Update placeholder with desired API key.
    var CLIENT_ID = '640886712280-1s9dj5rprihdgouqo3r2cd663ougcetq.apps.googleusercontent.com';
    //TODO: Update placeholder with desired client ID.
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
        makeApiCall();
    }
}

function handleSignInClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignOutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function makeApiCall() {
    //Google sheets api
    var params = {
        //The ID of the spreadsheet to retrieve data from.
        spreadsheetId: '11hJrOFXSRW0a7Nmfbi9yfQUfl6-kmTscyYOc-29w8gQ',
        //The A1 notation of the values to retrieve.
        ranges: ['Stock_Prices'],
        //How values should be represented in the output.The
        //default render option is ValueRenderOption.FORMATTED_VALUE.
        valueRenderOption: 'UNFORMATTED_VALUE',
        //TODO: Update placeholder value.
    };
    var request = gapi.client.sheets.spreadsheets.values.batchGet(params);
    //to read data
    return new Promise((resolve, reject) => {
        request.then(function(response) {
            console.log(response.result);
            if (response.status == 200) {
                var all_data = response.result;
                stocks_data = all_data.valueRanges[0].values;
            }
            resolve();
        }, function(reason) {
            console.error('error: ' + reason.result.error.message);
            reject();
        });
    });
}
loadStockTable1 = function() {
    clearInterval(refreshIntervalId1);
    tableData1 = document.getElementById('stockTable1').getElementsByTagName('tbody')[0];
    resetTable(tableData1);
    var stock_count_t1 = 0;
    country_name1 = document.getElementById('country_name1').value;
    for (var k = 1; k < stocks_data.length; k += 1) {
        if (stocks_data[k][10] == country_name1) {
            var cmp = Math.round(parseFloat(stocks_data[k][6]) * 100) / 100;
            var row = tableData1.insertRow(stock_count_t1);
            cell1 = row.insertCell(0);
            cell1.innerHTML = stocks_data[k][0];
            cell2 = row.insertCell(1);
            cell2.innerHTML = stocks_data[k][1];
            cell3 = row.insertCell(2);
            cell4 = row.insertCell(3);
            cell3.innerHTML = cmp;
            cell4.innerHTML = 0.00;
            stock_count_t1 += 1;
        }
        if (stock_count_t1 == 5) {
            break;
        }
    }
    if (stock_count_t1 == 5) {
        updatePriceRun = 1;
        refreshIntervalId1 = setInterval(updatePriceData1, 8000);
    } else {
        clearInterval(refreshIntervalId1);
    }
}
loadStockTable2 = function() {
    clearInterval(refreshIntervalId2);
    tableData2 = document.getElementById('stockTable2').getElementsByTagName('tbody')[0];
    resetTable(tableData2);
    var stock_count_t2 = 0;
    country_name2 = document.getElementById('country_name2').value;
    for (var k = 1; k < stocks_data.length; k += 1) {
        if (stocks_data[k][10] == country_name2) {
            var cmp = Math.round(parseFloat(stocks_data[k][6]) * 100) / 100;
            var row = tableData2.insertRow(stock_count_t2);
            cell1 = row.insertCell(0);
            cell1.innerHTML = stocks_data[k][0];
            cell2 = row.insertCell(1);
            cell2.innerHTML = stocks_data[k][1];
            cell3 = row.insertCell(2);
            cell4 = row.insertCell(3);
            cell3.innerHTML = cmp;
            cell4.innerHTML = 0.00;
            stock_count_t2 += 1;
        }
        if (stock_count_t2 == 5) {
            break;
        }
    }
    if (stock_count_t2 == 5) {
        updatePriceRun = 1;
        refreshIntervalId2 = setInterval(updatePriceData2, 8000);
    } else {
        clearInterval(refreshIntervalId2);
    }
} /*OLD function resetTable(tableData){if( tableData.rows){var rowCount=tableData.rows.length; for (var i=0; i < rowCount; i+=1){tableData.deleteRow(i);}}else{return;}}*/
function resetTable(tableData) {
    if (tableData.rows && tableData.rows.length > 0) {
        var rowCount = tableData.rows.length;
        for (var i = rowCount - 1; i > -1; i -= 1) {
            tableData.deleteRow(i);
        }
    } else {
        return;
    }
}
async function updatePriceData1() {
    var stk_table = document.getElementById('stockTable1');
    for (var r = 1, n = stk_table.rows.length; r < n; r += 1) {
        var old_cmp = Math.round(parseFloat(stk_table.rows[r].cells[2].innerHTML) * 100) / 100;
        old_cmp_list1.push(old_cmp);
    }
    await makeApiCall();
    for (var j = 1; j < stocks_data.length; j += 1) {
        if (stocks_data[j][10] == country_name1) {
            var new_cmp = Math.round(parseFloat(stocks_data[j][6]) * 100) / 100;
            new_cmp_list1.push(new_cmp);
        }
        if (new_cmp_list1.length == 10) {
            break;
        }
    }
    for (var i = 1; i < new_cmp_list1.length; i += 1) {
        var curr = new_cmp_list1[i];
        var old = old_cmp_list1[i];
        if (curr < old) {
            stk_table.rows[i].cells[2].innerHTML = curr;
            stk_table.rows[i].cells[3].innerHTML = '&darr; ' + Math.round((old - curr) * 100) / 100;
            stk_table.rows[i].cells[3].style.background = '#e63900';
            stk_table.rows[i].cells[3].style.color = '#f0f0f5';
            stk_table.rows[i].cells[3].style.background = '#323C50';
            stk_table.rows[i].cells[3].style.color = '#e63900';
        } else if (curr > old) {
            stk_table.rows[i].cells[2].innerHTML = curr;
            stk_table.rows[i].cells[3].innerHTML = '&uarr; ' + Math.round((curr - old) * 100) / 100;
            stk_table.rows[i].cells[3].style.background = '#278b27';
            stk_table.rows[i].cells[3].style.color = '#f0f0f5';
            stk_table.rows[i].cells[3].style.background = '#323C50';
            stk_table.rows[i].cells[3].style.color = '#47d147';
        }
    }
    old_cmp_list1 = [0];
    new_cmp_list1 = [0];
}

function updatePriceData2() {
    var stk_table = document.getElementById('stockTable2');
    for (var r = 1, n = stk_table.rows.length; r < n; r += 1) {
        var old_cmp = Math.round(parseFloat(stk_table.rows[r].cells[2].innerHTML) * 100) / 100;
        old_cmp_list2.push(old_cmp);
    }
    makeApiCall();
    for (var j = 1; j < stocks_data.length; j += 1) {
        if (stocks_data[j][10] == country_name2) {
            var new_cmp = Math.round(parseFloat(stocks_data[j][6]) * 100) / 100;
            new_cmp_list2.push(new_cmp);
        }
        if (new_cmp_list2.length == 10) {
            break;
        }
    }
    for (var i = 1; i < new_cmp_list2.length; i += 1) {
        var curr = new_cmp_list2[i];
        var old = old_cmp_list2[i];
        if (curr < old) {
            stk_table.rows[i].cells[2].innerHTML = curr;
            stk_table.rows[i].cells[3].innerHTML = '&darr; ' + Math.round((old - curr) * 100) / 100;
            stk_table.rows[i].cells[3].style.background = '#e63900';
            stk_table.rows[i].cells[3].style.color = '#f0f0f5';
            stk_table.rows[i].cells[3].style.background = '#323C50';
            stk_table.rows[i].cells[3].style.color = '#e63900';
        } else if (curr > old) {
            stk_table.rows[i].cells[2].innerHTML = curr;
            stk_table.rows[i].cells[3].innerHTML = '&uarr; ' + Math.round((curr - old) * 100) / 100;
            stk_table.rows[i].cells[3].style.background = '#278b27';
            stk_table.rows[i].cells[3].style.color = '#f0f0f5';
            stk_table.rows[i].cells[3].style.background = '#323C50';
            stk_table.rows[i].cells[3].style.color = '#47d147';
        }
    }
    old_cmp_list2 = [0];
    new_cmp_list2 = [0];
}
