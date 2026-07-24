export interface LatLng {
    lat: number;
    lng: number;
}
export interface GeocodeResult {
    formattedAddress: string;
    lat: number;
    lng: number;
    city: string;
    area: string;
}
export declare function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult>;
export declare function getDistanceMatrix(origin: LatLng, destination: LatLng): Promise<{
    distanceMetres: number;
    durationSeconds: number;
    distanceText: string;
    durationText: string;
}>;
export declare function placesAutocomplete(input: string, sessionToken?: string): Promise<Array<{
    placeId: string;
    description: string;
    mainText: string;
    secondaryText: string;
}>>;
export declare function getPlaceDetails(placeId: string): Promise<LatLng & {
    address: string;
}>;
//# sourceMappingURL=maps.service.d.ts.map