import React, { Component } from 'react';
import {
    NativeModules,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    DeviceEventEmitter,
    ActivityIndicator,
    Platform
} from 'react-native';

import { Icon } from 'react-native-elements';

const { ReactNativeAudioStreaming } = NativeModules;

// Possibles states
const PLAYING = 'PLAYING';
const STREAMING = 'STREAMING';
const PAUSED = 'PAUSED';
const STOPPED = 'STOPPED';
const ERROR = 'ERROR';
const METADATA_UPDATED = 'METADATA_UPDATED';
const BUFFERING = 'BUFFERING';
const START_PREPARING = 'START_PREPARING'; // Android only
const BUFFERING_START = 'BUFFERING_START'; // Android only

// UI
const iconSize = 40;

class Player extends Component {
    constructor(props) {
        super(props);
        this._onPress = this._onPress.bind(this);
        this.state = {
            status: STOPPED,
            song: ''
        };
    }

    componentDidMount() {
        this.subscription = DeviceEventEmitter.addListener(
            'AudioBridgeEvent', (evt) => {
                // We just want meta update for song name
                if (evt.status === METADATA_UPDATED && evt.key === 'StreamTitle') {
                    this.setState({song: evt.value});
                } else if (evt.status != METADATA_UPDATED) {
                    this.setState(evt);
                }
            }
        );

        ReactNativeAudioStreaming.getStatus((error, status) => {
            (error) ? console.log(error) : this.setState(status)
        });
    }

    _onPress() {
        switch (this.state.status) {
            case PLAYING:
            case STREAMING:
                ReactNativeAudioStreaming.pause();
                break;
            case PAUSED:
                ReactNativeAudioStreaming.resume();
                break;
            case STOPPED:
            case ERROR:
                ReactNativeAudioStreaming.play(this.props.url, {showIniOSMediaCenter: true, showInAndroidNotifications: true});
                break;
            case BUFFERING:
                ReactNativeAudioStreaming.stop();
                break;
        }
    }

    render() {
        let icon = null;
        switch (this.state.status) {
            case PLAYING:
            case STREAMING:
                icon = <Icon name='pause-circle-outline' size={45} color='#ffffff' />
                break;
            case PAUSED:
            case STOPPED:
            case ERROR:
                icon = <Icon name='play-circle-outline' size={45} color='#ffffff' />
                break;
            case BUFFERING:
            case BUFFERING_START:
            case START_PREPARING:
                icon = <ActivityIndicator
                    animating={true}
                    style={{height: 36}}
                    size="large"
                />;
                break;
        }

        return (
            <TouchableOpacity style={{ backgroundColor: '#faac1c'}} onPress={this._onPress}>
                {icon}
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        // position: 'absolute',
        // bottom: 0,
        // left: 0,
        // right: 0,
        // alignItems: 'center',
        // flexDirection: 'row',
        // justifyContent: 'center',
        // height: 45,
        // width: 50,
        // paddingLeft: 10,
        // paddingRight: 10,
        // borderColor: '#000033',
        // borderTopWidth: 1,
        backgroundColor: '#faac1c'
    },
    icon: {
        color: '#000',
        fontSize: 35,
        fontWeight: 'bold',
        lineHeight: 33,
        borderColor: '#000033',
        borderWidth: 3,
        borderRadius: 18,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },

});

export { Player, ReactNativeAudioStreaming }
