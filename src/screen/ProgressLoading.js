import React from "react";
import { View } from 'react-native';
import Svg, { Rect } from "react-native-svg";

export default function ProgressLoading({ progress }) {

    const bWidth = 230; // Width
    const progressWidth = (progress / 100) * bWidth;
    return (
        <View>
            <Svg width={bWidth} height={6}>
                <Rect width={bWidth} height={"100%"} fill={'#f5f8fa'} />
                <Rect width={progressWidth} height={"100%"} fill={'#f5f8fa'} />
            </Svg>
        </View>
    );
}
