"use client"
import {useEffect, useRef} from 'react';
import L from 'leaflet';
import boundariesData from '@/global/boundaries/hamburg/hamburgStadtteile.json';
import resultData from '@/global/results/evaluation.json';

function getColor(percentage: number) {
    if (percentage < 50) {
        return 'red';
    } else if (percentage < 75) {
        return 'orange';
    } else {
        return 'green';
    }
}

function renderResults(map: L.Map) {
    boundariesData.features.forEach((stadtteil: any) => {
        if(resultData.hasOwnProperty(stadtteil.properties.Stadtteil)) {
            //TODO Gradient evaluation
            let stadtColor = getColor(resultData[stadtteil.properties.Stadtteil].matchingScore)
            map.addLayer(L.geoJSON(stadtteil, {
                style: {
                    color: stadtColor,
                    fillColor: stadtColor,
                    opacity: 1
                }
            }))
        }
        else {
            map.addLayer(L.geoJSON(stadtteil, {
                style: {
                    color: 'gray',
                    opacity: 0.5,
                    stroke: false,
                }
            }))
        }
    })

    Object.entries(resultData).forEach(([key, value]) => {
        //console.log(key, value);
    })
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
        renderResults(map);

    }, []);

    return (
        <div>
            <div className="h-full" id="map"></div>
        </div>
    );
}

export default Map;