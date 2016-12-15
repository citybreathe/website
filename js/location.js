// hide search results
$( "#searchResults" ).hide();
$( "#chartsContainer" ).hide();
$("#lChartLeft").hide();
$("#lChartRight").hide();
$("#lMainGraphContainer").hide();

var hook1 = 'dynamic/graphs.php';
var colours = ["#66d041", "#99d041", "#c8d041", "#d0b341", "#d09241", "#d07a41", "#d05f41", "#d04141", "#8e2e2e", "#000000"];

function startLookup()
{
    var $_GET = {};
    document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
        function decode(s) {
            return decodeURIComponent(s.split("+").join(" "));
        }

        $_GET[decode(arguments[1])] = decode(arguments[2]);
    });


    // check if undefined
    var location = $_GET["location"];
    var x_cord = $_GET["lat"];
    var y_cord = $_GET["lng"];
    var name = $_GET["name"];
    var error = $_GET["e"];
    var error_message = $_GET["message"];
    if (location != undefined && x_cord == undefined && error == undefined)
    {
        // keep the search bar value the same -- no x and y though so just a search
        $("#locationText").val(location);

        // we have a location
        getCoords(encodeURI(location));

    }else if (error != undefined)
    {
        // there was an error
        // display the error
        loadStatusText(decodeURI(error_message), true);

    }else if (x_cord != undefined && y_cord != undefined) {

        // keep the search bar value the same -- no x and y though so just a search
        $("#locationText").val(location);

        // load the status text
        loadStatusText(name, false);

        // start the process to get the results
        loadDashboardForCoords(x_cord, y_cord, name);
    }

}

function getCoords(theAddress)
{
    $.getJSON('dynamic/addressLookup.php', {address: theAddress}, function(data) {

        if (data["success"] == 1)
        {
            // we have a location
            console.log(data["content"]);

            // main dict
            var results = data["content"]["results"];


            // find out how many locations we have -- if just one reload with correct x and y coords
            // results.length == 1 will enable multisearch

            if (data["content"]["status"]=="OK")
            {
                if (true)
                {
                    // get the coords
                    var coords = results[0]["geometry"]["location"];

                    // create new url
                    var url = window.location.href;
                    url = url+"&lat="+coords["lat"]+"&lng="+coords["lng"]+"&name="+encodeURI(results[0]["formatted_address"]);
                    window.location.replace(url);
                }
            }else if (data["content"]["status"]=="ZERO_RESULTS") {
                // no results
                var url = window.location.href;
                url = url+"&e=1&message="+encodeURI("No results were found for ")+theAddress+".";
                window.location.replace(url);
            }else {
                // something has gone wrong

            }


        }else {
            console.error("There was an error gathering the address");
        }

    });
}

// load status text
function loadStatusText(loc, error)
{
    if (!error)
    {
        // Compile the template
        var theTemplate = Handlebars.compile('Searching for the closest monitoring station to {{location-name}}...');

        var context={
            "location-name": loc,
        };

        // Pass our data to the template
        var theCompiledHtml = theTemplate(context);

        // Add the compiled html to the page
        $('#search_status').html(theCompiledHtml);
    }else {
        // there was an error
        $('#search_status').html(loc);
    }

}

// load dashboard for coords
function loadDashboardForCoords(lat, lng, name)
{
    // query the location -- get all the required info such as pollution center info

    $.getJSON("dynamic/station_info.php", { lat: lat, lng:lng }, function(data) {

        // check for success
        if (data["success"]==1)
        {
            // hide the status
            $( "#search_status" ).hide();

            // successful
            var stationInfo = data["station"];

            loadStationInfo(stationInfo["siteName"], stationInfo["comp_distance"], stationInfo["last_updated"]);

            // draw the first graph
            loadFirstGraph(data["stationID"]);
            loadSecondGraph(data["stationID"]);
            loadThirdGraph(data["stationID"]);

        }else {
            // not successful
            var url = window.location.href;
            url = url+"&e=1&message="+encodeURI("Sorry, there are currently no active pollution stations around "+name+". We add new stations daily however, so check back soon.");
            window.location.replace(url);
        }
    });
}

// load status text
function loadStationInfo(authName, miles, date)
{
    // Compile the template
    var theTemplate = Handlebars.compile('Showing you data from the station at {{auth-name}}, approximately {{miles}} miles away, which was last updated {{date}}.');

    // get the current time
    var dt = new Date();
    var time = dt.getMinutes();
    
    var context={
        "auth-name": authName,
        "miles": Math.round(miles * 100) / 100,
        "date": time+" minutes ago",
    };

    // Pass our data to the template
    var theCompiledHtml = theTemplate(context);

    // Add the compiled html to the page
    $('#station-info').html(theCompiledHtml);
}


// load first graph
function loadFirstGraph(id)
{   
    $.getJSON(hook1, { type: '6', id:id }, function(data) {
        $("#lChartLeft").show();
        
        var content = data["content"];

        // create the dict
        var data = [];
        var labels = [];
        var bgcolors = [];
        for (var i=0; i<content.length; i++)
        {
            var a = content[i];
            data.push(parseInt(a["band"]));
            labels.push(a["pollutantCode"]);
            var hex = colours[parseInt(a["band"])];
            bgcolors.push("rgba("+hexToRgb(hex).r+","+hexToRgb(hex).g+","+hexToRgb(hex).b+", 0.8)");
        }
        
        var data = {
            datasets: [{
                data: data,
                backgroundColor: bgcolors,
                label: 'Pollution' // for legend
            }],
            labels: labels
        };

        var ctx = document.getElementById("lChartSmallPi1");
        new Chart(ctx, {
            data: data,
            type: 'polarArea',
            options: {
                ticks: {
                      stepSize: 1
                    }
            }
        });

    });
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// load second graph
function loadSecondGraph(id)
{   
    $.getJSON(hook1, { type: '7', id:id }, function(data) {
        $("#lChartRight").show();
        var content = data["content"];
        
        var data = {
            datasets: [{
                data: content[1],
                backgroundColor: colours,
                label: 'Pollution' // for legend
            }],
            labels: content[0]
        };

        var ctx = document.getElementById("lChartSmallPi2");
        new Chart(ctx, {
            data: data,
            type: 'pie',
            options: {
                ticks: {
                      stepSize: 1
                    }
            }
        });

    });
}

// load third graph
function loadThirdGraph(id)
{
    $.getJSON(hook1, { type: '8', id:id }, function(data) {
        $("#lMainGraphContainer").show();
        
        var dict = data["content"];
        
         // create the arrays
        var allData = [];
        
        var theKeys = Object.keys(dict);
        for (var j=0; j< theKeys.length; j++)
        {
            var theKey = theKeys[j];
            var theData = dict[theKey];
            var dataSet = [];

            for (var i=0; i< theData.length; i++)
            {
                // get min and max
                dataSet.push(theData[i]["airQualityIndex"]);
            }

            // add dataset to 
            allData.push(dataSet);
        }

        // create the dataset
        var dataset = [];
        var colors = [["rgba(75,192,192,0.4)", "rgba(75,192,192,1)", "rgba(75,192,192,1)", "rgba(75,192,192,1)", "rgba(220,220,220,1)"],["rgba(46, 204, 113,0.4)","rgba(46, 204, 113,1.0)","rgba(46, 204, 113,1.0)","rgba(46, 204, 113,1.0)","rgba(46, 204, 113,1.0)"],["rgba(155, 89, 182,0.4)", "rgba(155, 89, 182,1.0)", "rgba(155, 89, 182,1.0)", "rgba(155, 89, 182,1.0)", "rgba(155, 89, 182,1.0)"],["rgba(241, 196, 15,0.4)", "rgba(241, 196, 15,1.0)", "rgba(241, 196, 15,1.0)", "rgba(241, 196, 15,1.0)", "rgba(241, 196, 15,1.0)"],["rgba(230, 126, 34,0.4)", "rgba(230, 126, 34,1.0)", "rgba(230, 126, 34,1.0)", "rgba(230, 126, 34,1.0)", "rgba(230, 126, 34,1.0)"], ["rgba(231, 76, 60,0.4)", "rgba(231, 76, 60,1.0)", "rgba(231, 76, 60,1.0)", "rgba(231, 76, 60,1.0)", "rgba(231, 76, 60,1.0)"]];


        // generate the timestamps
        var labels = [];
        var c = 0;
        for (var k=0; k<allData[0].length; k++)
        {
            var dataPoint = dict[theKeys[0]][k];

            // convert mysql timestamp
            var t = dataPoint["timestamp"].split(/[- :]/);
            var d = new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]));

            // give a time format -- but sparingly
            if (true) //c%8 == 0
            {
                labels.push(t[3]+":"+t[4]);
            }else {
                labels.push("");
            }

            c++;
        }

        for (var i=0; i<theKeys.length; i++)
        {
            // get the color var
            var col = colors[i];
            if (col == undefined)
            {
                col = colors[0];
            }

            // create the data point
            var d = {
                    label: theKeys[i],
                    fill: true,
                    lineTension: 0.1,
                    backgroundColor: col[0],
                    borderColor: col[1],
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: col[2],
                    pointBackgroundColor: "#fff",
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: col[3],
                    pointHoverBorderColor: col[4],
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: allData[i],
                    spanGaps: false,
                };

            dataset.push(d);
        }

        var data = {
            labels: labels,
            datasets: dataset
        };

        var ctx = document.getElementById('lMainGraph');
        var myLineChart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  yAxes: [{
                    ticks: {
                      stepSize: 1
                    }
                  }],
                    xAxes: [{
                        display:false,
                  }],
            
                }
            }
        });


    });
}

startLookup();