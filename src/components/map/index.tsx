"use client"

import React, {useEffect, useRef} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import "./index.scss"

import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';

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

export default function Map() {
    const mapContainer = useRef<any>(null);

    useEffect(() => {
        const map = new maplibregl.Map({
            container: 'map',
            style:
                'http://192.168.10.91:8085/styles/Taiwan-Tile/style.json',
            center: [120.896174, 23.681396],
            zoom: 8
        });

        map.addControl(new maplibregl.NavigationControl());

        const geocoderApi = {
            forwardGeocode: async (config: any) => {
                const features = [];
                try {
                    const request =
                        `http://192.168.10.111:5256/api/geocodings/search?text=${config.query}`;

                    const response = await fetch(request);
                    const results = await response.json();

                    const listApi = results.map((item: ResultSearch) => {
                        return `http://192.168.10.111:5256/api/geocodings/place?refid=${item.ref_id}`
                    })

                    Promise.all(listApi).then((values) => {
                        console.log(values)
                    })

                    // for (const feature of geojson.features) {
                    //     const center = [
                    //         feature.bbox[0] +
                    //         (feature.bbox[2] - feature.bbox[0]) / 2,
                    //         feature.bbox[1] +
                    //         (feature.bbox[3] - feature.bbox[1]) / 2
                    //     ];
                    //     const point = {
                    //         type: 'Feature',
                    //         geometry: {
                    //             type: 'Point',
                    //             coordinates: center
                    //         },
                    //         place_name: feature.properties.display_name,
                    //         properties: feature.properties,
                    //         text: feature.properties.display_name,
                    //         place_type: ['place'],
                    //         center
                    //     };
                    //     features.push(point);
                    // }
                } catch (e) {
                    console.error(`Failed to forwardGeocode with error: ${e}`);
                }

                return {
                    // features
                };
            }
        };

        map.addControl(
            new MaplibreGeocoder(geocoderApi, {
                maplibregl
            })
        );
    }, []);

    return <div className="map-wrap">
        <div id="map" ref={mapContainer} className="map"/>
    </div>
}