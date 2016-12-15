// inital hide
$("#mChart1").hide();
$("#mChart2").hide();

var hook1 = 'dynamic/graphs.php';
var colours = ["#66d041", "#99d041", "#c8d041", "#d0b341", "#d09241", "#d07a41", "#d05f41", "#d04141", "#8e2e2e", "#000000"];

// graph 1
$.getJSON(hook1, { type: '1' }, function(data) {
    
    // show chart
    $("#mChart1").show();
    
    // get and parse the pollutant data
    var data = {
        labels: data["pollutant_bands"],
        datasets: [
            {
                data: data["polutant_indexes"],
                backgroundColor: colours,
                hoverBackgroundColor: colours
            }]
    };
    
    
    var ctx = document.getElementById('mChart1');
    var myPieChart = new Chart(ctx,{
        type: 'pie',
        data: data,
        options: {}
    });

    // load in graph 1's text, changes from 'loading...'
    loadGraph1Text();

});


// graph 2
$.getJSON(hook1, { type: '2' }, function(data) {

    // show chart
    $("#mChart2").show();
    
    // get and parse the pollutant data
    var data = {
        labels: data["pollutant_bands"],
        datasets: [
            {
                data: data["polutant_indexes"],
                backgroundColor: colours,
                hoverBackgroundColor: colours
            }]
    };
    
    
    var ctx = document.getElementById('mChart2');
    var myPieChart = new Chart(ctx,{
        type: 'pie',
        data: data,
        options: {}
    });

    // load in graph 2's text, changes from 'loading...'
    loadGraph2Text();

});


// graph 3
$.getJSON(hook1, { type: '3' }, function(data) {

    var content = data["content"][0];
    
    // Compile the template
    var theTemplate = Handlebars.compile('<div class="pollutebar band{{band}}">Band {{band}}</div><div id="emphasisTitle">{{name}}</div>Is one of the worst areas for air pollution in {{area}} currently at band {{band}} for {{pollutant}}');

    // set context
    var context={
        "name": content["name"],
        "band": content["band"],
        "pollutant": content["pollutant"],
        "area": "London and the South East"
    };

    // Pass our data to the template
    var theCompiledHtml = theTemplate(context);

    // Add the compiled html to the page
    $('#module1').html(theCompiledHtml);

});


// graph 4
$.getJSON(hook1, { type: '4' }, function(data) {

    var content = data["content"][0];
    
    // Compile the template
    var theTemplate = Handlebars.compile('<div class="pollutebar band{{band}}">Band {{band}}</div><div id="emphasisTitle">{{name}}</div>Had one of the worst instances of air pollution in the past 7 days accross {{area}} reaching band {{band}} for {{pollutant}} on {{timestamp}}');

    // set context
    var context={
        "name": content["name"],
        "band": content["band"],
        "pollutant": content["pollutant"],
        "area": "London and the South East",
        "timestamp": content["timestamp"]
    };

    // Pass our data to the template
    var theCompiledHtml = theTemplate(context);

    // Add the compiled html to the page
    $('#module2').html(theCompiledHtml);

});

// graph 5
$.getJSON(hook1, { type: '5' }, function(data) {

    var content = data["content"];
    for (var i=0; i<content.length; i++)
    {
        // each row
        var thisRow = content[i];
        
        
        var row = "<tr><td>"+thisRow["name"]+"</td><td>Band "+thisRow["band"]+"</td><td>"+thisRow["pollutant"]+"</td><td>"+thisRow["timestamp"]+"</td><td>"+thisRow["numberOfOffences"]+"</td></tr>";
        $('#badLocTable tr:last').after(row);
    }
    
    // table style
    $('#badLocTable').stacktable();
});

// load graph 1 text
function loadGraph1Text()
{
    // Compile the template
    var theTemplate = Handlebars.compile('The current air pollution bands in London and the South East - last updated {{last-updated-time}}');

    // get the current time
    var dt = new Date();
    var time = dt.getMinutes();

    var context={
        "last-updated-time": time+" minutes ago",
    };

    // Pass our data to the template
    var theCompiledHtml = theTemplate(context);

    // Add the compiled html to the page
    $('.graph1-desc').html(theCompiledHtml);
}

// load graph 2 text
function loadGraph2Text()
{
    // Compile the template
    var theTemplate = Handlebars.compile('The average air pollution bands in London and the South East over the past 7 days - last updated {{last-updated-time}}');

    // get the current time
    var dt = new Date();
    var time = dt.getMinutes();

    var context={
        "last-updated-time": time+" minutes ago",
    };

    // Pass our data to the template
    var theCompiledHtml = theTemplate(context);

    // Add the compiled html to the page
    $('.graph2-desc').html(theCompiledHtml);
}