import React from 'react';
import TileView from "./TileView";
import {
    fetchOsmData,
    fetchRoutableTile, filterHighwayData,
    getIntersectionNodes, getMappedElements,
    parseToJson
} from "../data/api";
import {Marker, Polyline, Popup} from "react-leaflet";
import {Input} from "semantic-ui-react";
import {loadOsmTestData, mapNodesLinesToID} from "../utils/OpenLR/test/Helperfunctions";
import OSMIntegration from "../utils/OpenLRData/OSMIntegration";
import OpenLRDecoder from "../utils/OpenLR/Decoder";
import LineEncoder from "../utils/OpenLR/coder/LineEncoder";
import MapDataBase from "../utils/OpenLR/map/MapDataBase";
import Line from "../utils/OpenLR/map/Line";
import Node from "../utils/OpenLR/map/Node";

let inputDataEnum = {
    "RoutableTiles": 0,
    "OpenStreetMap": 2
};

export default class OpenLrDemo extends React.Component{
    constructor(props){
        super(props);
        this.init = this.init.bind(this);
        this.state = {
            // data: [],
            coordinates: [],
            lat: 51.21205,
            lng: 4.39717,
        };
        this.x = 8392;
        this.y = 5469;
        // this.coordinates =[];
        this.addMarker = this.addMarker.bind(this);
        this.createMarker = this.createMarker.bind(this);
        this.reset = this.reset.bind(this);
        this.findMarkers = this.findMarkers.bind(this);
    }

    componentDidMount(){
        this.init(0,this.x,this.y);
    }

    init(mode,x,y){
        if(x === undefined || y === undefined){
            x = 8392;
            y = 5469;
        }
        if(mode === inputDataEnum.RoutableTiles){
            fetchRoutableTile(14,x,y).then((data)=>{getIntersectionNodes(data.triples).then((intersections)=>{this.createMarker(intersections)})});
        }
        else if(mode === inputDataEnum.OpenStreetMap){
            fetchOsmData()
                .then((data)=>{parseToJson(data).then((json)=>{getMappedElements(json).then((elements)=>{filterHighwayData(elements).then((highwayData)=>{this.createLineStringsOsm(highwayData)})})})});
        }
    }

    createMarker(latitude,longitude){
         return <Marker key={latitude+"_"+longitude} position={[latitude, longitude]}>
                <Popup>
                    <p>{latitude+" "+longitude}</p>
                </Popup>
            </Marker>;
    }

    findMarkers(){
        let {coordinates} = this.state;
        if(coordinates.length >= 2){
            let l = [];
            let n = [];
            n.push(new Node(0,coordinates[0].lat,coordinates[0].lng));
            for(let i=1;i<coordinates.length;i++){
                n.push(new Node(i,coordinates[i].lat,coordinates[i].lng));
                l.push(new Line(i,n[i-1],n[i]));
            }
            let {nodes,lines} = mapNodesLinesToID(n,l);
            let mapDataBase = new MapDataBase(lines,nodes);
            let encoded = LineEncoder.encode(mapDataBase,l,0,0);
            console.log(encoded);

            let osmDataBase;
            //
            loadOsmTestData()
                .then((data)=>{parseToJson(data)
                    .then((json)=>{getMappedElements(json)
                        .then((elements)=>{filterHighwayData(elements)
                            .then((highwayData)=>{
                                osmDataBase = OSMIntegration.initMapDataBase(highwayData.nodes,highwayData.ways,highwayData.relations);
                                let decoded = OpenLRDecoder.decode(encoded,osmDataBase);
                                console.log(decoded);
                            })})})});
        }
        else{
            console.log("Not enough coordinates given to form a line",this.state.coordinates);
        }
    }

    addMarker(latlng){
        // this.coordinates.push(latlng);
        // let marker = this.createMarker(latlng.lat,latlng.lng);
        this.setState((state, props)=>{
            // let data = state.data;
            // data.push(marker);
            let coordinates = state.coordinates;
            coordinates.push(latlng);
            return {
                // data: data,
                coordinates: coordinates,
                lat: state.lat,
                lng: state.lng,
            }
        });
    }

    createLineStringsOpenLr(lines,posOffset,negOffset){
        let lat = 51.21205;
        let lng = 4.39717;
        let lineStrings = [];
        if(lines !== undefined){
            for (let line of lines) {
                lineStrings.push(
                    <Polyline positions = {[line.getLatitudeDeg(),line.getLongitudeDeg()]} key={line.getID()}>
                        <Popup>
                            <p>{line.getID()}</p>
                        </Popup>
                    </Polyline>);
            }
            this.setState({data: lineStrings, lat: lat, lng: lng});
        }
    }

    reset(){
        this.setState((state,props)=>{
            return {
                data: [],
                coordinates: [],
                lat: state.lat,
                lng: state.lng,
            }
        });
        // this.coordinates =[];
    }

    render(){
        let {/*data,*/lat,lng} = this.state;
        // console.log(data);
        let d = this.state.coordinates.map((c)=>{
            return this.createMarker(c.lat,c.lng);
        });
        return <div>
            <div>
                <TileView zoom={14} lat={lat} lng={lng} data={d} onMouseClick={this.addMarker}/>
            </div>
            <button onClick={()=>{this.init(inputDataEnum.RoutableTiles,this.x,this.y)}}>Common Nodes between Ways</button>
            <button onClick={()=>{this.init(inputDataEnum.OpenStreetMap,this.x,this.y)}}>Highway:traffic_signals Nodes</button>
            <button onClick={this.findMarkers}>Find lines in data</button>
            <button onClick={this.reset}>Reset</button>
            current tile x value: {this.x}   current tile y value: {this.y}
            <Input placeholder="tile x value" onChange={(e,data)=>{this.x = data.value}}/>
            <Input placeholder="tile y value" onChange={(e,data)=>{this.y = data.value}}/>
        </div>;
    }
}