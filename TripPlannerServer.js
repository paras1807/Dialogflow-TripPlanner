// 'use strict'

const express = require('express');
const { WebhookClient, Suggestion } = require('dialogflow-fulfillment');
const server = express();
const { Permission, dialogflow } = require('actions-on-google');


server.get('/', (req, res) => res.send('online'));
server.post('/dialogflow', express.json(), (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });
  const app = dialogflow();

  function generateRandomBookingNumber(length) {
    return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1);
  }

  function isExist(val) {
    return val && val != '';
  }

  function gotoBookARoom(agent) {
    agent.context.set({
      name: 'bookroomo-followup',
      lifespan: 5,
      parameters: {},
    });
  }

  function selectRooms(agent) {
    const hotelList = [];
    agent.add('Please select from below available Hotels.');
    for (let i = 1; i < 10; i++) {
      agent.add(new Suggestion('Hotel' + i));
    }
  }

  function bookRoomHandler(agent) {
    const [destination, date] = [
      agent.parameters['geo-city1'],
      agent.parameters['date'],
    ];
    if (!destination || destination == '') {
      agent.add(`Please provide destination for room booking?`);
      agent.add(new Suggestion(`Delhi`));
      agent.add(new Suggestion(`Mumbai`));
      // agent.add(`Type the city name`);
    } else if (!date || date == '') {
      agent.add(`For when you want to book a Room?`);
      agent.add(new Suggestion(`Today`));
      agent.add(new Suggestion(`Tomorrow`));
      agent.add(new Suggestion(`Friday`));
      // agent.add(`Enter Date`);
    } else {
      selectRooms(agent);
    }
  }

  function confirmRoomBookingFromFlightData(agent) {
    const destination = agent.parameters['geo-city1'];
    agent.add(`Do you want to book room for ${destination}?`);
    agent.add(new Suggestion(`Yes`));
    agent.add(new Suggestion(`No`));
  }

  function formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  function hotelSelectedIntentHandler(agent) {
    const [destination, date, hotelname] = [
      agent.parameters['geo-city1'],
      agent.parameters['date'],
      agent.parameters['hotel-name'],
    ];
    const regex = /^Hotel[1-9]$/i;
    if (regex.test(hotelname)) {
      hotelBooked(agent);
    } else {
      selectRooms();
    }
  }

  function hotelBooked(agent) {
    const [destination, date, hotelname] = [
      agent.parameters['geo-city1'],
      agent.parameters['date'],
      agent.parameters['hotel-name'],
    ];
    agent.add(`${hotelname} room booked for ${destination} for ${formatDate(date)}`);
  }

  function flightBookedAndStartFromBegining(agent) {
    agent.add('Thank you for your time.');
  }

  function startFromBegining(agent) {
    agent.context.set({
      name: 'flight_context',
      lifespan: 0,
    });
    flightBookingWelcomeIntentHandler(agent);
  }

  function flightBookingWelcomeIntentHandler(agent) {
    agent.add(`Hi, I am your travel planner, you can ask me to book your flight and hotel rooms :)`);
    agent.add(new Suggestion(`Book a flight`));
    agent.add(new Suggestion(`Book a room`));
  }

  function selectFlightSeatHandler(agent) {
    const [source, destination, date, flightClass, seat] = [
      agent.parameters['geo-city'],
      agent.parameters['geo-city1'],
      agent.parameters['date'],
      agent.parameters['flight-class'],
      agent.parameters['selected-seat'],
    ];
    if (!isExist(seat)) {
      agent.add(`Awesome! Please select your seats for flight from ${source} to ${destination} at ${formatDate(date)} for ${flightClass}`);
      addSeatSuggestion(agent);
    } else {
      if (seat === 'A2') {
        agent.add('That seat has already been taken. Please select another seat');
        addSeatSuggestion(agent);
        agent.context.set({
          name: 'BookFlights - SeatSelection- yes - SelectedSeat',
          lifespan: 5,
          parameters: {},
        });
      } else {
        // all correct
        makePayment(agent);
      }
    }
  }

  function makePayment(agent) {
    agent.add(`Please complete payment by clicking`);
    agent.add(new Suggestion(`Make Payment`));
    agent.context.set({
      name: 'MakePayment-followup',
      lifespan: 1,
      parameters: {
        'booking-date': new Date()
      }
    });
  }

  function paymentHandler(agent) {
    const delay = (t) => new Promise((resolve) => setTimeout(resolve, t));
    const [source, destination, date, flightClass, seat] = [
      agent.parameters['geo-city'],
      agent.parameters['geo-city1'],
      agent.parameters['date'],
      agent.parameters['flight-class'],
      agent.parameters['selected-seat'],
    ];


    return delay(3000).then(() => {
      agent.add(`Thank you for your payment! Your tickets have been booked from ${source} to ${destination} on ${formatDate(date)} in ${flightClass} class. Your booking id is ${generateRandomBookingNumber(10)}`);
      agent.add('Do you want to book a hotel?');
      agent.add(new Suggestion(`Book a room`));
      agent.add(new Suggestion(`No`));
    });
  }

  function addSeatSuggestion(agent) {
    agent.add(`A | 1 2 3 4 5 6`);
    agent.add(`B | 1 2 3 4 5 6`);
    agent.add(`C | 1 2 3 4 5 6`);
    agent.add(`A2 is booked for testing`);

    let chars = ['A', 'B', 'C'];
    for (let index = 0; index < chars.length; index++) {
      for (let j = 1; j <= 6; j++) {
        agent.add(new Suggestion(`${chars[index]}${j}`));
      }
    }
  }

  function askForFlightDestination(agent) {
    agent.add(`What's the destination of flight?`);
    agent.add(new Suggestion(`Frankfurt`));
    agent.add(new Suggestion(`Berlin`));
    agent.add(new Suggestion(`Munich`));
    agent.add(new Suggestion(`Zurich`));
    // agent.add(`Type the city name`);
    agent.context.set({
      name: 'flight-destination-followup',
      lifespan: 1,
    });
  }

  function askForFlightDate(agent) {
    agent.add(`For when you want to book a flight?`);
    agent.add(new Suggestion(`Today`));
    agent.add(new Suggestion(`Tomorrow`));
    agent.add(new Suggestion(`Friday`));
    // agent.add(`Enter Date`);
    agent.context.set({
      name: 'flight-date-followup',
      lifespan: 1,
    });
  }

  function askForFlightClass(agent) {
    agent.add(`Which class you want to travel?`);
    agent.add(new Suggestion(`Economy`));
    agent.add(new Suggestion(`Bussiness`));
    agent.add(new Suggestion('Change Date'));
    agent.add(new Suggestion('Change Destination'));
    agent.add(new Suggestion('Start Over'));
    agent.context.set({
      name: 'flight-class-followup',
      lifespan: 1,
    });
  }

  function askForFlightSeat(agent) {
    agent.add(`Do you want to select seat?`);
    agent.add(new Suggestion(`Yes`));
    agent.add(new Suggestion(`No`));
    agent.context.set({
      name: 'flight-seat-followup',
      lifespan: 1,
    });
  }

  function askForFlightSource(agent) {
    agent.add(`What's the origin of flight?`);
    agent.add(new Suggestion(`Use my location`));
    agent.add(new Suggestion(`Delhi`));
    agent.add(new Suggestion(`Mumbai`));
    agent.add(new Suggestion(`Rajasthan`));
    agent.add(new Suggestion(`Chennai`));
    agent.add(new Suggestion(`Bangalore`));
    agent.add(new Suggestion(`Kerala`));
    // agent.add(`Type the city name`);
    agent.context.set({
      name: 'flight-source-followup',
      lifespan: 1,
    });
  }

  function bookFlightIntentHandler(agent) {
    const [source, destination, date, flightClass] = [
      agent.context.get('flight_context').parameters['geo-city'],
      agent.context.get('flight_context').parameters['geo-city1'],
      agent.context.get('flight_context').parameters['date'],
      agent.context.get('flight_context').parameters['flight-class'],
    ];
    if (!isExist(source)) {
      askForFlightSource(agent);
    } else if (!isExist(destination)) {
      askForFlightDestination(agent);
    } else if (!isExist(date)) {
      askForFlightDate(agent);
    } else if (!isExist(flightClass)) {
      askForFlightClass(agent);
    } else {
      askForFlightSeat(agent);
    }
  }

  function flightDateFollowup(agent) {
    const date = agent.parameters.date;
    if (date.toString().substring(0, 10) === new Date().toISOString().substr(0, 10)) {
      // today not available
      agent.add('No flights are available for Today');
      agent.add(new Suggestion('Change Date'));
      agent.add(new Suggestion('Change Destination'));
      agent.add(new Suggestion('Start Over'));
    } else {
      bookFlightIntentHandler(agent);
    }
  }

  const requestPermission = (app) => {
    let conv = agent.conv();
    conv.ask(new Permission({
      context: 'To give results in your area',
      permissions: 'DEVICE_PRECISE_LOCATION',
    }))
    agent.add(conv);
  };

  const userInfo = (agent) => {
    if (agent.context.get('actions_intent_permission').parameters['PERMISSION']) {
      const city = agent.originalRequest.payload.device.location.city;
      if (city) {
        agent.add(`You are at ${city}. Type or select city to confirm.`);
        agent.add(new Suggestion(`${city}`));
        agent.context.set({
          name: 'flight-source-followup',
          lifespan: 1,
        });
      }
      else {
        // Note: Currently, precise locaton only returns lat/lng coordinates on phones and lat/lng coordinates 
        // and a geocoded address on voice-activated speakers. 
        // Coarse location only works on voice-activated speakers.
        agent.add('Sorry, I could not figure out where you are.');
        askForFlightSource(agent);
      }
    } else {
      agent.add('Sorry, I could not figure out where you are.');
      askForFlightSource(agent);
    }
  };

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', flightBookingWelcomeIntentHandler);
  intentMap.set('BookFlights', bookFlightIntentHandler);
  intentMap.set('flight.source.followup', bookFlightIntentHandler);
  intentMap.set('flight.class.followup', bookFlightIntentHandler);
  intentMap.set('flight.destination.followup', bookFlightIntentHandler);
  intentMap.set('flight.destination.change', bookFlightIntentHandler);
  intentMap.set('flight.date.change', bookFlightIntentHandler);
  intentMap.set('flight.date.followup', flightDateFollowup);
  intentMap.set('Start Over', startFromBegining);
  intentMap.set('FlightBooked - Bookroom - no', flightBookedAndStartFromBegining);
  intentMap.set('BookFlights - SeatSelection- yes', selectFlightSeatHandler);
  intentMap.set('BookFlights - SeatSelection - no', makePayment);
  intentMap.set('BookFlights - SeatSelection- yes - SelectedSeat', selectFlightSeatHandler);
  intentMap.set('BookFlights - MakePayment', paymentHandler);
  intentMap.set('booked.flight.and.book.room.same.destination.followup', confirmRoomBookingFromFlightData);
  intentMap.set('booked.flight.and.book.room.same.destination.followup - yes', selectRooms);
  intentMap.set('booked.flight.and.book.room.same.destination.followup - no', gotoBookARoom);
  intentMap.set('booked.flight.and.book.room.same.destination.followup - no - changeDestination', bookRoomHandler);
  intentMap.set('BookRooms', bookRoomHandler);
  intentMap.set('BookRooms - SelectHotel', hotelSelectedIntentHandler);
  intentMap.set('SelectHotel', hotelSelectedIntentHandler);

  intentMap.set('request.permission', requestPermission);
  intentMap.set('user.info', userInfo);

  agent.handleRequest(intentMap);
});

server.listen(process.env.PORT || 8080);
