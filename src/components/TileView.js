import React from 'react';
import {Map, TileLayer} from 'react-leaflet';

export default class TileView extends React.Component {
    constructor(props) {
        super();
        this.zoom = props.zoom;
        this.state = {
            data: props.data,
            lat: props.lat,
            lng: props.lng
        };
        this.handleMouseClick = this.handleMouseClick.bind(this);
    }

    componentWillReceiveProps(newProps) {
        this.setState({data: newProps.data, lat: newProps.lat, lng: newProps.lng})
    }

    handleMouseClick(ev){
        if(this.props.onMouseClick !== undefined){
            this.props.onMouseClick(ev.latlng);
        }
    }

    render() {
        const position = [this.state.lat, this.state.lng];
        const zoom = this.zoom;
        const {data} = this.state;
        return (
            <Map
                style = {{height: '850px'}}
                center = {position}
                zoom = {zoom}
                onClick = {this.handleMouseClick}
            >
                <
                    TileLayer
                    attribution = '&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {data}
            </Map>
        )
    }
}