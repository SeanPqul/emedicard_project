import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

//Pixel3 baseline
const guidelineBaseWidth = 393;
const guidelineBaseHeight = 786;

const scale = (size: number): number => width / guidelineBaseWidth * size;
const verticalScale = (size: number): number => height / guidelineBaseHeight * size;
const moderateScale = (size: number, factor: number = 0.5): number => size + ( scale(size) - size ) * factor;

export { moderateScale, scale, verticalScale };
