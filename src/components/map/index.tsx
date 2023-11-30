"use client"
import axios from 'axios'

import React, { useEffect, useRef } from 'react';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';

import * as maplibregl from '../../libs/maplibre-gl.js'
import '../../libs/maplibre-gl.css'
import "./index.scss"

export interface ResultSearch {
    ref_id: string
    distance: number
    address: string
    name: string
    display: string
    boundaries: Boundary[]
    categories: any[]
}

export interface Boundary {
    type: number
    id: string
    prefix: string
    name: string
    suffix: string
    full_name: string
}

export interface _Result {
    display: string
    name: string
    hs_num: string
    street: string
    address: string
    city_id: string
    city: string
    district_id: string
    district: string
    lat: number
    lng: number
}

export default function Map() {
    const mapContainer = useRef<any>(null);

    useEffect(() => {
        const map = new maplibregl.Map({
            container: 'map',
            style:
                'https://tw.map.zone/mt-tw/styles/street/style.json',
            center: [120.896174, 23.681396],
            zoom: 8
        });

        map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

        const geocoderApi = {
            forwardGeocode: async (config: any) => {
                const features: any[] = [];
                try {
                    const response = await fetch(`https://tw.map.zone/api/search?text=${config.query}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });

                    const results = await response.json();
                    for (let i = 0; i < results.length; i++) {
                        const _temp: _Result = await (await fetch(`https://tw.map.zone/api/place?refid=${results[i].ref_id}`)).json()

                        const point = {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [_temp.lng, _temp.lat]
                            },
                            place_name: _temp.display || _temp.name,
                            text: _temp.display || _temp.name,
                            place_type: ['place'],
                            center: [_temp.lng, _temp.lat]
                        };

                        features.push(point);
                    }
                } catch (e) {
                    console.error(`Failed to forwardGeocode with error: ${e}`);
                }

                return {
                    features
                };
            }
        };

        map.addControl(
            new MaplibreGeocoder(geocoderApi, { maplibregl }),
            "top-left"
        );
    }, []);

    return <div className="map-wrap">
        <div id="map" ref={mapContainer} className="map" />
    </div>
}