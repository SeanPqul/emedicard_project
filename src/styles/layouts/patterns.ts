/**
 * Layout Pattern Styles
 * 
 * Reusable layout patterns and utilities for consistent spacing and arrangement
 */

import { StyleSheet } from 'react-native';
import { getSpacing } from '../theme';

// ===== FLEXBOX LAYOUTS =====
export const flexLayouts = StyleSheet.create({
  // Basic flex containers
  flex: {
    flex: 1,
  },
  
  row: {
    flexDirection: 'row',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  // Alignment patterns
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  centerHorizontal: {
    alignItems: 'center',
  },
  
  centerVertical: {
    justifyContent: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  spaceAround: {
    justifyContent: 'space-around',
  },
  
  spaceEvenly: {
    justifyContent: 'space-evenly',
  },
  
  // Flex wrapping
  wrap: {
    flexWrap: 'wrap',
  },
  
  nowrap: {
    flexWrap: 'nowrap',
  },
  
  // Common flex combinations
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  rowStart: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  
  rowEnd: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  
  columnCenter: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  columnSpaceBetween: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

// ===== SPACING UTILITIES =====
export const spacing = StyleSheet.create({
  // Margin utilities
  m0: { margin: 0 },
  mXs: { margin: getSpacing('xs') },
  mSm: { margin: getSpacing('sm') },
  mMd: { margin: getSpacing('md') },
  mLg: { margin: getSpacing('lg') },
  mXl: { margin: getSpacing('xl') },
  mXxl: { margin: getSpacing('xxl') },
  
  // Horizontal margin
  mhXs: { marginHorizontal: getSpacing('xs') },
  mhSm: { marginHorizontal: getSpacing('sm') },
  mhMd: { marginHorizontal: getSpacing('md') },
  mhLg: { marginHorizontal: getSpacing('lg') },
  mhXl: { marginHorizontal: getSpacing('xl') },
  
  // Vertical margin
  mvXs: { marginVertical: getSpacing('xs') },
  mvSm: { marginVertical: getSpacing('sm') },
  mvMd: { marginVertical: getSpacing('md') },
  mvLg: { marginVertical: getSpacing('lg') },
  mvXl: { marginVertical: getSpacing('xl') },
  
  // Top margin
  mtXs: { marginTop: getSpacing('xs') },
  mtSm: { marginTop: getSpacing('sm') },
  mtMd: { marginTop: getSpacing('md') },
  mtLg: { marginTop: getSpacing('lg') },
  mtXl: { marginTop: getSpacing('xl') },
  
  // Bottom margin
  mbXs: { marginBottom: getSpacing('xs') },
  mbSm: { marginBottom: getSpacing('sm') },
  mbMd: { marginBottom: getSpacing('md') },
  mbLg: { marginBottom: getSpacing('lg') },
  mbXl: { marginBottom: getSpacing('xl') },
  
  // Padding utilities
  p0: { padding: 0 },
  pXs: { padding: getSpacing('xs') },
  pSm: { padding: getSpacing('sm') },
  pMd: { padding: getSpacing('md') },
  pLg: { padding: getSpacing('lg') },
  pXl: { padding: getSpacing('xl') },
  pXxl: { padding: getSpacing('xxl') },
  
  // Horizontal padding
  phXs: { paddingHorizontal: getSpacing('xs') },
  phSm: { paddingHorizontal: getSpacing('sm') },
  phMd: { paddingHorizontal: getSpacing('md') },
  phLg: { paddingHorizontal: getSpacing('lg') },
  phXl: { paddingHorizontal: getSpacing('xl') },
  
  // Vertical padding
  pvXs: { paddingVertical: getSpacing('xs') },
  pvSm: { paddingVertical: getSpacing('sm') },
  pvMd: { paddingVertical: getSpacing('md') },
  pvLg: { paddingVertical: getSpacing('lg') },
  pvXl: { paddingVertical: getSpacing('xl') },
});

// ===== CONTAINER PATTERNS =====
export const containers = StyleSheet.create({
  // Screen containers
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  screenWithPadding: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: getSpacing('lg'),
  },
  
  safeArea: {
    flex: 1,
  },
  
  // Content containers
  content: {
    flex: 1,
    paddingHorizontal: getSpacing('lg'),
  },
  
  contentCentered: {
    flex: 1,
    paddingHorizontal: getSpacing('lg'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Section containers
  section: {
    marginBottom: getSpacing('xl'),
  },
  
  sectionWithBorder: {
    marginBottom: getSpacing('xl'),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: getSpacing('lg'),
  },
  
  // Card containers
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: getSpacing('lg'),
    marginBottom: getSpacing('md'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  cardFlat: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: getSpacing('lg'),
    marginBottom: getSpacing('md'),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  // List containers
  list: {
    flex: 1,
  },
  
  listItem: {
    paddingVertical: getSpacing('md'),
    paddingHorizontal: getSpacing('lg'),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  
  listItemLast: {
    paddingVertical: getSpacing('md'),
    paddingHorizontal: getSpacing('lg'),
    borderBottomWidth: 0,
  },
});

// ===== GRID PATTERNS =====
export const gridPatterns = StyleSheet.create({
  // Two column grid
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  twoColumnItem: {
    width: '48%', // Leaves 4% for spacing
    marginBottom: getSpacing('md'),
  },
  
  // Three column grid
  threeColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  threeColumnItem: {
    width: '31%', // Leaves 6% for spacing
    marginBottom: getSpacing('md'),
  },
  
  // Equal width items
  equalRow: {
    flexDirection: 'row',
  },
  
  equalItem: {
    flex: 1,
    marginHorizontal: getSpacing('xs'),
  },
  
  equalItemFirst: {
    flex: 1,
    marginRight: getSpacing('xs'),
  },
  
  equalItemLast: {
    flex: 1,
    marginLeft: getSpacing('xs'),
  },
});

// ===== POSITIONING UTILITIES =====
export const positioning = StyleSheet.create({
  // Absolute positioning
  absolute: {
    position: 'absolute',
  },
  
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  // Common absolute positions
  topLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  
  topRight: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  
  bottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  
  bottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  
  center: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  
  // Relative positioning
  relative: {
    position: 'relative',
  },
});

// ===== OVERFLOW UTILITIES =====
export const overflow = StyleSheet.create({
  hidden: {
    overflow: 'hidden',
  },
  
  visible: {
    overflow: 'visible',
  },
  
  scroll: {
    overflow: 'scroll',
  },
});