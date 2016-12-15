#citybreathe website
This is the main website for citybreathe accessible from https://citybreathe.com. It is written purely in HTML, CSS, Javascript and JQuery. [Chart.js](http://www.chartjs.org/) is used for the interactive charts, [handlebars](http://handlebarsjs.com/) for some additional info.

##How is the information parsed for the graphs?
I use PHP to create the required data which is then encoded in JSON for easy parsing. JQuery and AJAX are used to handle the request for data and the creation of the graph objects.

##Where are the php files?
They usually reside in the /dynamic/ folder and they will be posted shortly to their own repo.
