"use client"
import {useEffect, useRef} from 'react';
import L from 'leaflet';

import boundariesHamburgStadtteile from '@/global/boundaries/hamburg/hamburgStadtteile.json';

function onMapClick(e) {
    alert("You clicked the map at " + e.latlng);
}

function Map() {

    const isInitial = useRef(true);
    useEffect(() => {
        if (!isInitial.current) return;
        isInitial.current = false;

        const mapLatLan = L.latLng(53.57532,10.01534);
        const map = L.map("map").setView(mapLatLan, 12);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        L.geoJson(boundariesHamburgStadtteile).addTo(map);

        map.on('click', onMapClick);

    }, []);

    return (
        <div className="h-full" id="map"></div>
    );
}

export default Map;