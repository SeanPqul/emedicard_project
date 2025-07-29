import { moderateScale } from '@/src/utils/scaling-utils';

const FONT_SIZES = {
  headline: moderateScale(28),       // Page titles
  //subheadline: moderateScale(18),    // Subtitle, secondary header, Buttons
  body: moderateScale(17),           // Regular body text
  action: moderateScale(15),         // Prominent actions (e.g. "Forgot password?")           
  caption: moderateScale(13),        // Small text, label, error, links
  micro: moderateScale(12)           // Requirements, micro text, captions
} as const;

const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  bold: '600',
} as const;

export { FONT_SIZES, FONT_WEIGHTS };

