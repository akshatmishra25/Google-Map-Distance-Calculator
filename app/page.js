"use client"
import { useRef, useState } from 'react';
import { useJsApiLoader, GoogleMap, MarkerF, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import button from './assets/location-pin.png';
import originIcon from './assets/OriginIcon.png';
import destinationIcon from './assets/DestinationIcon.png';
import GravitiLogo from './assets/Graviti-logo.png';
import Image from 'next/image';

export default function Home() {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [directionsRes, setDirectionsRes] = useState(null);
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState('');
  const [routes, setRoutes] = useState([]);
  const [waypoints, setWaypoints] = useState([]);

  const [originloc, setOriginLoc] = useState({ lat: 0, lng: 0 });
  const [destinationloc, setDestinationLoc] = useState({ lat: 0, lng: 0 });

  const originRef = useRef();
  const destinationRef = useRef();
  const waypointRef = useRef();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
    libraries: ['places'],
  });

  const center = { lat: 28.6567, lng: 77.2415 };

  if (!isLoaded) {
    return <p>Loading ...</p>;
  }

  async function calculateRoute() {
    if (originRef.current.value === '' || destinationRef.current.value === '') {
      return;
    }
    setLoading(true);
    const directionService = new window.google.maps.DirectionsService();
    const routeOptions = {
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      waypoints: [...waypoints.map((waypoint) => ({ location: waypoint.location }))],
      travelMode: window.google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
    };
    const results = await new Promise((resolve, reject) => {
      directionService.route(routeOptions, (response, status) => {
        if (status === 'OK') {
          resolve(response);
        } else {
          reject(status);
          window.alert('Directions request failed due to ' + status);
        }
      });
    });

    setOrigin(originRef.current.value);
    setDestination(destinationRef.current.value);
    setLoading(false);
    setDirectionsRes(results);
    setDistance(results.routes[0].legs[0].distance.text);
    setTime(results.routes[0].legs[0].duration.text);
    setRoutes(results.routes);

    setOriginLoc(results.routes[0].legs[0].start_location);
    setDestinationLoc(results.routes[0].legs[0].end_location);
  }

  const handleAddWaypoint = () => {
    const newWaypoint = { location: waypointRef.current.value };
    setWaypoints((prevWaypoints) => [...prevWaypoints, newWaypoint]);
    waypointRef.current.value = '';
  };

  return (
    
    <>
    <nav className='bg-white hidden sm:flex'>
        <Image src={GravitiLogo} alt='logo' className='ml-4 my-2'/>
      </nav>
    <div className="min-h-screen bg-gray-100 flex justify-center">
      
      <div className="container flex flex-col items-center">
        <p className="text-xl text-blue-900 my-8">Let's calculate <span className='font-bold'>distance</span> from Google maps</p>
        <div className="flex flex-col-reverse sm:flex-row w-full items-center justify-around">
          <div className="flex flex-col space-y-4 w-full ml-0 md:ml-16 md:w-5/9 p-4">
           <div className='flex flex-col sm:flex-row'>
           <div className='flex flex-col'>
           <div>
              <label className="block text-sm font-medium text-gray-700">Origin</label>
              <Autocomplete>
                <input
                  type="text"
                  placeholder="Origin"
                  ref={originRef}
                  className="mt-1 block w-full sm:w-250 p-2 border text-gray-900 border-gray-300 rounded-md"
                />
              </Autocomplete>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stop</label>
              <Autocomplete>
                <input
                  type="text"
                  placeholder="Waypoints"
                  ref={waypointRef}
                  className="mt-1 block w-full sm:w-250 p-2 border border-gray-300 text-gray-900 rounded-md"
                />
              </Autocomplete>
              <button className="flex items-center justify-items-end mt-2 text-gray-500" onClick={handleAddWaypoint}>
                <AiOutlinePlusCircle className="mr-1" /> Add another stop
              </button>
            </div>
            <div className="space-y-2">
              {waypoints.map((waypoint, index) => (
                <div key={index} className="text-blue-900">
                  {waypoint.location}
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Destination</label>
              <Autocomplete>
                <input
                  type="text"
                  placeholder="Destination"
                  ref={destinationRef}
                  className="mt-1 block w-full sm:w-250 p-2 border border-gray-300 text-gray-900 rounded-md"
                />
              </Autocomplete>
            </div>
            
           </div>
           <div className='flex justify-center items-center mt-4 sm:m-auto'>
           <button className="bg-blue-800 text-white p-4 rounded-full" onClick={calculateRoute}>
              Calculate
            </button>
           </div>
           </div>
            
            
            <div className="bg-white p-4 flex justify-between">
                <div className="text-lg font-semibold text-gray-900">Distance</div>
                <div className="text-2xl text-blue-400">{distance}</div>
            </div>
            <div className='p-4 mt-0'>
              <div className="text-black">
                {!loading ? (
                  <p>
                    The distance between {origin} and {destination} via the selected route is {distance}.
                  </p>
                ) : (
                  <p>Please select a route.</p>
                )}
                {loading && <div className="text-blue-500">Loading...</div>}
              </div>
            </div>
          </div>
          <div className="w-full sm:w-560 h-96 mt-8 md:mt-0">
            <GoogleMap
              center={center}
              zoom={12}
              mapContainerStyle={{ width: '100%', height: '100%' }}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                disableDefaultUI: true,
              }}
            >
              <MarkerF
                position={center}
                clickable={false}
                icon={{
                  url: button,
                  scaledSize: new window.google.maps.Size(30, 30),
                }}
              />
              <MarkerF
                position={originloc}
                clickable={false}
                icon={{
                  url: originIcon,
                  scaledSize: new window.google.maps.Size(20, 20),
                }}
                zIndex={10}
                draggable={true}
                onDragEnd={(e) => setOriginLoc({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
              />
              <MarkerF
                position={destinationloc}
                clickable={false}
                icon={{
                  url: destinationIcon,
                  scaledSize: new window.google.maps.Size(20, 20),
                }}
                zIndex={10}
                draggable={true}
                onDragEnd={(e) => setDestinationLoc({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
              />
              {directionsRes && <DirectionsRenderer directions={directionsRes} />}
            </GoogleMap>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
