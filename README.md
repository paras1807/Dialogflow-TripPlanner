# Dialogflow-TripPlanner

The backend Node server can be started through the local system.
For this to work
1) start the tunnel by executing command "npm run tunnel"
	-> This will give an https ip messgae for example "Forwarding                    https://b40a0a29.ngrok.io -> http://localhost:8080"
	-> Copy "https://b40a0a29.ngrok.io" and paste in fullfillment url "https://b40a0a29.ngrok.io/dialog" and save it
2) start the node server on local "node TripPlannerServer.js"

=> Now all the request from dialog flow will be redirected to your local server.

![Trip Planner Use Case](https://github.com/paras1807/Dialogflow-TripPlanner/blob/master/TripPlanner.jpg)

You can import the zip file tripplanner in dialogflow.
