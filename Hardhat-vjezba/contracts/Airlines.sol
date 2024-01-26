// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;


contract Airlines {
   struct Airline {
       uint id;
       string name;
       string country;
       address airAddress;
   }

    struct Flight {
       uint id;
       string origin;
       string destination;
       string status;
       uint airlineId;
    }

   struct Customer {
        uint id;
        address custAddress;
        uint[] flightIds;
   }

   address owner;
   uint nextAirlineId = 0;
   uint nextFlightId = 0;
   uint nextCustomereId = 0;
   mapping(uint => Airline) airlines;
   mapping(uint => Flight) flights;
   mapping(address => Customer) customers;
   mapping(address => string) positions;


   event FlightBooked(uint _id);


   modifier onlyOwner {
       require(msg.sender == owner, "Not owner.");
       _;
   }


   constructor() {
       owner = msg.sender;
   }

   function addAirline(string memory _name, string memory _country, address _airline) external onlyOwner {
       airlines[nextAirlineId] = Airline(nextAirlineId, _name, _country, _airline);
       nextAirlineId++;
   }

   function addFlight(uint _airlineId, string memory _origin, string memory _destination) external {
        require(msg.sender == airlines[_airlineId].airAddress, "Airline doesn't own this flight.");
        flights[nextFlightId] = Flight(nextFlightId, _origin, _destination, "pending", _airlineId);
        nextFlightId++;
   }

   function endFlight(uint _flightId) external {
        require(msg.sender == airlines[_flightId].airAddress, "Airline doesn't own this flight.");
        require(_flightId == flights[_flightId].id, "Flight does not exist.");
        flights[_flightId].status = "done";
   }


   function bookFlight(uint _flightId) external {
        require(keccak256(abi.encodePacked(flights[_flightId].status)) == keccak256(abi.encodePacked("pending")), "Flight is already done.");
        if (customers[msg.sender].flightIds.length == 0) {
            uint[] memory customerFlights = new uint[](1);
            customerFlights[0] = _flightId;
            customers[msg.sender] = Customer(_flightId, msg.sender, customerFlights);
        } else {
            customers[msg.sender].flightIds.push(_flightId);

        }
   }

   function getAirlinesFlights(uint _id) view external returns (Flight[] memory) {
        uint counter = 0;
        
        for (uint i=0; i<nextFlightId; i++) {
             if(flights[i].airlineId == _id) {
                counter++;
             }
        }

        Flight[] memory airlineFlights = new Flight[](counter);
        uint currentIndex = 0;

        for (uint i=0; i<nextFlightId; i++) {
             if(flights[i].airlineId == _id) {
                airlineFlights[currentIndex] = flights[i];
                currentIndex++;
             }
        }

        return airlineFlights;
   }

   function getCustromersFlights() view external returns (Flight[] memory) {
        uint[] memory customerFlightIds = customers[msg.sender].flightIds;

        Flight[] memory customerFlights = new Flight[](customerFlightIds.length);

        for (uint i=0; i<customerFlightIds.length; i++) {
             customerFlights[i] = flights[i];
        }

        return customerFlights;
   }


}