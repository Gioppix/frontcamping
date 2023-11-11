// export enum HygeneType {
//     SHOWERS,
//     WC,
//     LAUNDRY,
//     DISHWASHING,
//     DOGWASHING
// }

// export interface Hygene {
//     type: HygeneType,
//     queue: number,
//     av_spaces: number,
//     description?: string,
//     wait_time_minutes?: number,
//     open_time_minutes?: number,
//     close_time_minutes?: number,
//     accessible: boolean,
// }
export interface Coordinate {
    lat: number,
    lon: number
}
export enum PlaceKind {
    PIAZZOLA,
    BAGNI,
    SPIAGGIA,
    RESTAURANT_BAR,
    MARKET,
    PARKING
}
export interface Place {
    id: number,
    positions: Coordinate[],
    kind: PlaceKind,
    hours?: {
        opening: number,
        closing: number,
    }
}
export interface StreetNode {
    id: number,
    position: Coordinate,
    connects: number[]
}

export interface Camping {
    places: Place[],
    streets: StreetNode[]
}


import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient('https://wfemmcrupcbdohckoocn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmZW1tY3J1cGNiZG9oY2tvb2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA2MTgzMTQsImV4cCI6MjAwNjE5NDMxNH0.QDx8Vim9mn9sxUJNR14MRNp-_Oh8w9WEUNuPNPEVc5o')

export async function get_saved_camping(): Promise<Camping> {
    // const saved = localStorage.getItem('camping');
    // if (saved) {
    //     return JSON.parse(saved);
    // }
    // localStorage.setItem('camping', JSON.stringify(defaultcamping));
    // return defaultcamping;
    const res = await supabase.from("campings").select("camping").eq("id", 1).single();
    if (res.error) {
        console.log(res.error)
    }
    console.log(res.data)
    return res.data?.camping as Camping;

}
export async function save_camping(c: Camping) {
    //localStorage.setItem('camping', JSON.stringify(c));

    const { data, error } = await supabase
        .from('campings')
        .update({ camping: c })
        .eq("id", 1)
        .select()
    if (error) {
        console.log(error)
    }
    if (data) {
        console.log("SAVED")
    }

    // return res.data;

}

export const kinds = [];

// let defaultcamping: Camping = {
//     places: [
//         {
//             id: 1,
//             positions: [
//                 { lon: 10.287822, lat: 45.137695 },
//                 { lon: 10.288491, lat: 45.137683 },
//                 { lon: 10.288506, lat: 45.137888 },
//                 { lon: 10.287840, lat: 45.137905 }
//             ],
//             kind: "SPOT"
//         },
//         {
//             id: 2,
//             positions: [
//                 { lon: 10.287542, lat: 45.138108 },
//                 { lon: 10.287606, lat: 45.138031 },
//                 { lon: 10.287533, lat: 45.138035 }
//             ],
//             kind: "SPOT"
//         }
//     ]
// }

let defaultcamping: Camping = {
    "places": [
        {
            "id": 1,
            "positions": [
                {
                    "lat": 46.47875632378434,
                    "lon": 11.331689176659552
                },
                {
                    "lat": 46.47828348151281,
                    "lon": 11.331477818458211
                },
                {
                    "lat": 46.47811976208783,
                    "lon": 11.332202255746369
                },
                {
                    "lat": 46.478339561034886,
                    "lon": 11.332293450852875
                },
                {
                    "lat": 46.47842083100899,
                    "lon": 11.331971853926506
                },
                {
                    "lat": 46.47868311055187,
                    "lon": 11.332055002405967
                }
            ],
            "kind": PlaceKind.BAGNI,
        },
        {
            "id": 2,
            "positions": [
                {
                    "lat": 46.47868311055187,
                    "lon": 11.332055002405967
                },
                {
                    "lat": 46.47842083100899,
                    "lon": 11.331971853926506
                },
                {
                    "lat": 46.478215656284284,
                    "lon": 11.332860441525447
                },
                {
                    "lat": 46.4784631604818,
                    "lon": 11.332965047677028
                }
            ],
            "kind": PlaceKind.MARKET,
            hours: {
                opening: 60 * 6,
                closing: 60 * 20
            }
        },
        {
            "id": 3,
            "positions": [
                {
                    "lat": 46.47872238443359,
                    "lon": 11.332325922433778
                },
                {
                    "lat": 46.47859124491484,
                    "lon": 11.332895355374898
                },
                {
                    "lat": 46.478842441462376,
                    "lon": 11.332995401738412
                },
                {
                    "lat": 46.478955110125355,
                    "lon": 11.332447694624829
                }
            ],
            "kind": PlaceKind.PARKING
        },
        {
            "id": 4,
            "positions": [
                {
                    "lat": 46.47917202039895,
                    "lon": 11.331937913894201
                },
                {
                    "lat": 46.47910728540679,
                    "lon": 11.332325216052265
                },
                {
                    "lat": 46.47915900194741,
                    "lon": 11.33234077283181
                },
                {
                    "lat": 46.47911467348705,
                    "lon": 11.332646544659507
                },
                {
                    "lat": 46.47927905801284,
                    "lon": 11.332705821413253
                },
                {
                    "lat": 46.4793215393264,
                    "lon": 11.332396830901995
                },
                {
                    "lat": 46.47938987876119,
                    "lon": 11.332421775413092
                },
                {
                    "lat": 46.47945637110185,
                    "lon": 11.332022930899836
                }
            ],
            "kind": PlaceKind.PIAZZOLA
        },
        {
            "id": 5,
            "positions": [
                {
                    "lat": 46.47935327630659,
                    "lon": 11.331121265757247
                },
                {
                    "lat": 46.47926092563651,
                    "lon": 11.331845462191268
                },
                {
                    "lat": 46.47946040288749,
                    "lon": 11.331945508554782
                },
                {
                    "lat": 46.47958365747135,
                    "lon": 11.331181420893918
                }
            ],
            "kind": PlaceKind.RESTAURANT_BAR,
            hours: {
                opening: 60 * 7,
                closing: 60 * 23
            }
        },
        {
            "id": 6,
            "positions": [
                {
                    "lat": 46.47919954762839,
                    "lon": 11.330187586073318
                },
                {
                    "lat": 46.47899637537333,
                    "lon": 11.330055084882499
                },
                {
                    "lat": 46.47875511528414,
                    "lon": 11.331177323991142
                },
                {
                    "lat": 46.478965676540554,
                    "lon": 11.331198781663261
                }
            ],
            "kind": PlaceKind.SPIAGGIA,
            hours: {
                opening: 9 * 60,
                closing: 18 * 60
            }
        },
        {
            "id": 7,
            "positions": [
                {
                    "lat": 46.479097738667164,
                    "lon": 11.33186960194962
                },
                {
                    "lat": 46.47923072398124,
                    "lon": 11.331324040570507
                },
                {
                    "lat": 46.479238112044705,
                    "lon": 11.330943166890393
                },
                {
                    "lat": 46.47914576117919,
                    "lon": 11.330899178597065
                },
                {
                    "lat": 46.47902570481967,
                    "lon": 11.331260203864986
                },
                {
                    "lat": 46.478922271435955,
                    "lon": 11.331482827213222
                },
                {
                    "lat": 46.47884660943904,
                    "lon": 11.33176797411599
                }
            ],
            "kind": PlaceKind.PIAZZOLA
        },
        {
            "id": 8,
            "positions": [
                {
                    "lat": 46.4786268125402,
                    "lon": 11.331240115332747
                },
                {
                    "lat": 46.47799512239252,
                    "lon": 11.33091825025096
                },
                {
                    "lat": 46.47821307479257,
                    "lon": 11.329979477095748
                },
                {
                    "lat": 46.47884291538088,
                    "lon": 11.330274788242804
                }
            ],
            "kind": PlaceKind.PARKING
        }
    ],
    "streets": [
        {
            "id": 1,
            position: {
                lat: 46.479601597051776,
                "lon": 11.331384008563479
            },
            "connects": [
                2
            ]
        },
        {
            "id": 2,
            "position": {
                "lat": 46.47950555278996,
                "lon": 11.332010572523874,
            },
            "connects": [
                1,
                3,
                7
            ]
        },
        {
            "id": 3,
            "position": {
                "lat": 46.47936887412511,
                "lon": 11.332917159170908
            },
            "connects": [
                2,
                4
            ]
        },
        {
            "id": 4,
            "position": {
                "lat": 46.47901794084557,
                "lon": 11.332768564725999
            },
            "connects": [
                3,
                5
            ]
        },
        {
            "id": 5,
            "position": {
                "lat": 46.47908443364077,
                "lon": 11.332421486813988
            },
            "connects": [
                4,
                6
            ]
        },
        {
            "id": 6,
            "position": {
                "lat": 46.47901424679903,
                "lon": 11.332358723057556
            },
            "connects": [
                5,
                7,
                9,
                10
            ]
        },
        {
            "id": 7,
            "position": {
                "lat": 46.479143538279395,
                "lon": 11.331884508372756
            },
            "connects": [
                2,
                6,
                8,
                9,
                10
            ]
        },
        {
            "id": 8,
            "position": {
                "lat": 46.479328239861246,
                "lon": 11.331096475233213
            },
            "connects": [
                7
            ]
        },
        {
            "id": 9,
            "position": {
                "lat": 46.47881476791239,
                "lon": 11.331782047791936
            },
            "connects": [
                6,
                7,
                10,
                12,
                13,
                14
            ]
        },
        {
            "id": 10,
            "position": {
                "lat": 46.478748274787655,
                "lon": 11.332254652889393
            },
            "connects": [
                6,
                7,
                9,
                11
            ]
        },
        {
            "id": 11,
            "position": {
                "lat": 46.47856644357625,
                "lon": 11.332901508667774
            },
            "connects": [
                10
            ]
        },
        {
            "id": 12,
            "position": {
                "lat": 46.47865510135411,
                "lon": 11.33152499880488
            },
            "connects": [
                9,
                13,
                14,
                15
            ]
        },
        {
            "id": 13,
            "position": {
                "lat": 46.47871420645908,
                "lon": 11.331119656497322
            },
            "connects": [
                9,
                12,
                14
            ]
        },
        {
            "id": 14,
            "position": {
                "lat": 46.478983495069656,
                "lon": 11.331195831298828
            },
            "connects": [
                9,
                12,
                13
            ]
        },
        {
            "id": 15,
            "position": {
                "lat": 46.478983495069656,
                "lon": 11.331195831298828
            },
            "connects": [
                12
            ]
        }
    ]
}
// save_camping(defaultcamping);
