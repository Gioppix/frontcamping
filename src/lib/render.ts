import { PlaceKind, type Camping, type Coordinate, type Place, type StreetNode } from "./storage";

export enum Mode {
    NEW,
    DELETE,
    UPDATE,
    STREET
}

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let map: google.maps.Map;
let pixelRatio: number;
let kind: PlaceKind;
let mode: string;
let name: string;
let hour: boolean;
let opening: number;
let closing: number;

let minLat: number;
let maxLat: number;
let minLon: number;
let maxLon: number;

export let editable: boolean;
import { get_saved_camping, save_camping } from "./storage";
let camping = await get_saved_camping();
console.log(camping)


const vertices_radiuses = 6;
export function init(c: HTMLCanvasElement, mapp: google.maps.Map) {
    map = mapp;
    canvas = c;
    let temp = canvas.getContext("2d");
    if (!temp) {
        throw new Error("no ctx");
    }
    ctx = temp;

    pixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * pixelRatio;
    canvas.height = canvas.offsetHeight * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);

    const minsmaxes = findMinMaxCoords(camping);
    minLat = minsmaxes.minLat;
    maxLat = minsmaxes.maxLat;
    minLon = minsmaxes.minLon;
    maxLon = minsmaxes.maxLon;

    map.fitBounds({
        north: maxLat,
        south: minLat,
        east: maxLon,
        west: minLon
    });
    // const a: google.maps.LatLng;
    // map.setCenter()
}
let selected: Coordinate | undefined = undefined;
export async function handleClick(lat: number, lon: number) {
    if (editable) {
        switch (mode) {
            case "DELETE":
                deleteee(lat, lon);
                break;
            case "NEW":
                neww(lat, lon);
                break;
            case "UPDATE":
                edit(lat, lon);
                break;
            case "STREET":
                street(lat, lon);
                break;
            default:
                throw new Error("unsupported mode")
        }
        await save_camping(camping);
    }

}


export function drawcamping() {




    ctx.clearRect(0, 0, canvas.width, canvas.height)
    function mapCoordinatesToCanvas(x: number, y: number): { newX: number, newY: number } {
        // Ensure the ranges are valid
        if (maxLat <= minLat || maxLon <= minLon) {
            throw new Error("Invalid latitude or longitude range");
        }

        // Map x (longitude) from [minLon, maxLon] to [0, canvasWidth]
        const newX = ((x - minLon) / (maxLon - minLon)) * canvas.width;

        // Map y (latitude) from [minLat, maxLat] to [canvasHeight, 0]
        // Note: Canvas coordinates are flipped vertically, 
        // the top is 0 and bottom is canvasHeight
        const newY = canvas.height - ((y - minLat) / (maxLat - minLat) * canvas.height);

        return { newX: newX / pixelRatio, newY: newY / pixelRatio };
    }

    for (let place of camping.places) {
        ctx.fillStyle = get_color(place.kind);
        ctx.beginPath();
        let first = true;
        for (let coord of place.positions) {
            const norm_coord = mapCoordinatesToCanvas(coord.lon, coord.lat);
            if (first) {
                first = false;
                ctx.moveTo(norm_coord.newX, norm_coord.newY);
            } else {
                ctx.lineTo(norm_coord.newX, norm_coord.newY);
            }

        }

        ctx.closePath();


        ctx.fill();
        ctx.fillStyle = "black";
        ctx.font = "20px serif";
        const pos = get_average(place.positions);
        const norm_pos = mapCoordinatesToCanvas(pos.lon, pos.lat);
        ctx.fillText(`${place.name ? place.name : ""} ${place.hours ? place.hours.opening + " " + place.hours.closing : ""}`, norm_pos.newX, norm_pos.newY);


        for (let coord of place.positions) {
            const norm_coord = mapCoordinatesToCanvas(coord.lon, coord.lat);
            if (editable) {
                if (coord == selected) {
                    ctx.fillStyle = '#0f0';
                } else {
                    ctx.fillStyle = '#000';
                }
                ctx.beginPath();
                ctx.arc(norm_coord.newX, norm_coord.newY, vertices_radiuses, 0, 2 * Math.PI);
                ctx.fill();
            }


        }
    }
    ctx.strokeStyle = 'white'; // Set line color to white
    ctx.lineWidth = 2; // Set line width

    camping.streets.forEach(street => {
        street.connects.forEach(connectionId => {
            const connectedStreet = camping.streets.find(s => s.id === connectionId);
            if (connectedStreet) {
                const start = mapCoordinatesToCanvas(street.position.lon, street.position.lat);
                const end = mapCoordinatesToCanvas(connectedStreet.position.lon, connectedStreet.position.lat);
                ctx.beginPath();
                ctx.moveTo(start.newX, start.newY);
                ctx.lineTo(end.newX, end.newY);
                ctx.stroke();
            }
        });
    });
    camping.streets.forEach(street => {
        const point = mapCoordinatesToCanvas(street.position.lon, street.position.lat);
        if (editable) {
            if (street.position == selected) {
                ctx.fillStyle = '#0f0';
            } else {
                ctx.fillStyle = '#000';
            }
            ctx.beginPath();
            ctx.arc(point.newX, point.newY, vertices_radiuses, 0, 2 * Math.PI);
            ctx.fill();
        }
    });

}




export function set_editable(b: boolean) {
    editable = b;
}

export function set_bounds(bounds: google.maps.LatLngBounds
) {
    minLat = bounds.getSouthWest().lat();
    maxLat = bounds.getNorthEast().lat();
    minLon = bounds.getSouthWest().lng();
    maxLon = bounds.getNorthEast().lng();
}


function distance(lo1: number, lo2: number, la1: number, la2: number): number {
    return Math.sqrt((lo1 - lo2) * (lo1 - lo2) + (la1 - la2) * (la1 - la2))
}


function findMinMaxCoords(camping: Camping): { minLat: number, maxLat: number, minLon: number, maxLon: number } {
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLon = Infinity;
    let maxLon = -Infinity;

    // Check all positions in places
    for (const place of camping.places) {
        for (const pos of place.positions) {
            minLat = Math.min(minLat, pos.lat);
            maxLat = Math.max(maxLat, pos.lat);
            minLon = Math.min(minLon, pos.lon);
            maxLon = Math.max(maxLon, pos.lon);
        }
    }

    // Check all positions in streets

    for (const street of camping.streets) {
        minLat = Math.min(minLat, street.position.lat);
        maxLat = Math.max(maxLat, street.position.lat);
        minLon = Math.min(minLon, street.position.lon);
        maxLon = Math.max(maxLon, street.position.lon);
    }

    return { minLat, maxLat, minLon, maxLon };
}


function get_color(p: PlaceKind): string {
    switch (p) {
        case PlaceKind.BAGNI:
            return "brown"
        case PlaceKind.MARKET:
            return "purple"
        case PlaceKind.PARKING:
            return "grey"
        case PlaceKind.PIAZZOLA:
            return "green"
        case PlaceKind.RESTAURANT_BAR:
            return "red"
        case PlaceKind.SPIAGGIA:
            return "yellow"
        default:
            return "black"
    }
}

export function setKind(k: PlaceKind) {
    kind = k;
}

export function setMode(m: string) {
    mode = m;
}

export function setname(n: string) {
    name = n;
}
export function sethour(v: boolean) {
    hour = v;
}
export function setopening(v: number) {
    opening = v;
}
export function setclosing(v: number) {
    closing = v;
}



function edit(lat: number, lon: number) {
    if (editable) {
        if (!selected) {
            console.log(lat, lon)
            let distances: number[] = [];
            for (let place of camping.places) {
                for (let coord of place.positions) {
                    distances.push(distance(coord.lon, lon, coord.lat, lat))
                }
            }
            for (let street of camping.streets) {
                distances.push(distance(street.position.lon, lon, street.position.lat, lat))
            }
            let min = Math.min(...distances);
            for (let place of camping.places) {
                for (let coord of place.positions) {
                    if (distance(coord.lon, lon, coord.lat, lat) == min) {
                        selected = coord;
                    }
                }
            }
            for (let street of camping.streets) {
                if (distance(street.position.lon, lon, street.position.lat, lat) == min) {
                    selected = street.position;
                }
            }
        } else {
            selected.lat = lat;
            selected.lon = lon;
            selected = undefined;
            save_camping(camping);
        }
    }
}

let place: Place | undefined = undefined;
function neww(lat: number, lon: number) {
    if (!place) {
        console.log("CREATING NEW PLACE")
        place = {
            id: Math.floor(Math.random() * (9999 - 100 + 1)) + 100,
            kind,
            positions: [],
            name,
            hours: hour ? { closing, opening } : undefined
        }
        camping.places.push(place)
        place.positions.push({ lat, lon })
    } else {
        console.log(distance(place.positions[0].lon, lon, place.positions[0].lat, lat))
        if (distance(place.positions[0].lon, lon, place.positions[0].lat, lat) < 0.000015424627867554907) {
            place = undefined;
            console.log("FINISHED PLACE")
            save_camping(camping);

        } else {
            console.log("USING LAST PLACE")

            place.positions.push({ lat, lon })
        }
    }
}

let first_street: StreetNode | undefined = undefined;
function street(lat: number, lon: number) {
    let selected_street: StreetNode | undefined = undefined;

    for (let street_node of camping.streets) {
        if (distance(street_node.position.lon, lon, street_node.position.lat, lat) < 0.000015424627867554907) {
            selected_street = street_node;
        }
    }
    if (!selected_street) {
        selected_street = {
            connects: [],
            id: Math.floor(Math.random() * (9999 - 100 + 1)) + 100,
            position: { lat, lon }
        }
        camping.streets.push(selected_street)
    }
    if (!first_street) {
        first_street = selected_street;
    } else {
        first_street.connects.push(selected_street.id);
        selected_street.connects.push(first_street.id);
        first_street = undefined;
    }



}


function deleteee(lat: number, lon: number) {

    for (let to_delete of camping.streets) {
        if (distance(to_delete.position.lon, lon, to_delete.position.lat, lat) < 0.000015424627867554907) {
            for (let inner_node of camping.streets) {
                inner_node.connects = inner_node.connects.filter(id => id != to_delete.id)
            }
            camping.streets = camping.streets.filter(node => node !== to_delete);
        }
    }


    for (let to_delete_place of camping.places) {

        for (let to_delete_coord of to_delete_place.positions) {
            if (distance(to_delete_coord.lon, lon, to_delete_coord.lat, lat) < 0.000015424627867554907) {
                camping.places = camping.places.filter(p => p != to_delete_place);
                return;
            }
        }


    }
}



function get_average(coordinates: Coordinate[]): Coordinate {
    // if (coordinates.length === 0) {
    //     return null; // Return null for empty array
    // }

    let totalLat = 0;
    let totalLon = 0;

    for (const coord of coordinates) {
        totalLat += coord.lat;
        totalLon += coord.lon;
    }

    return {
        lat: totalLat / coordinates.length,
        lon: totalLon / coordinates.length
    };
}