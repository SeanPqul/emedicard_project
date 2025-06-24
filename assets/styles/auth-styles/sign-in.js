import { moderateScale, verticalScale } from '@/src/utils/scaling-utils';
import { StyleSheet } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    paddingHorizontal: wp('5%'), //
    paddingBottom: hp('5%'),
  },

  orgLogosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: hp('4%'),
  },
  orgLogo: {
    alignItems: 'center',
  },
  logoImage: {
    width: moderateScale(100),       
    height: moderateScale(100),
    marginBottom: verticalScale(8.8),
  },
  orgText: {
    fontSize: moderateScale(13),  
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },

  title: {
    fontSize: moderateScale(32), 
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: verticalScale(4),
  },
  subtitle: {
    fontSize: moderateScale(16),  
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: moderateScale(19.5), 
    marginBottom: verticalScale(22),
  },

  formContainer: {
    width: wp('90%'),              
    alignSelf: 'center',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(11),     
    paddingHorizontal: moderateScale(13), 
    paddingVertical: verticalScale(13),   
    fontSize: moderateScale(17.5),         
    marginBottom: verticalScale(13),      
    color: '#1F2937',
  },

  passwordContainer: {
    position: 'relative',
    marginBottom: verticalScale(13),
  },
  passwordInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(11),
    paddingHorizontal: moderateScale(13),
    paddingVertical: verticalScale(13),
    paddingRight: moderateScale(44),     
    fontSize: moderateScale(17.5),
    color: '#1F2937',
  },
  eyeIcon: {
    position: 'absolute',
    right: moderateScale(13),      
    top: verticalScale(13),         
    size: moderateScale(23),           
  },

  errorForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(13), 
    minHeight: verticalScale(22),      
  },
  errorContainer: {
    flex: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: moderateScale(14),   
    fontWeight: '500',
  },
  forgotPasswordText: {
    color: '#10B981',
    fontSize: moderateScale(15),   
    fontWeight: '500',
  },

  signInButton: {
    backgroundColor: '#10B981',
    borderRadius: moderateScale(11),
    height: hp('7.15%'),               
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('3%'),          
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(8.5),  
    elevation: 8,                    
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  signInButtonText: {
    color: 'white',
    fontSize: moderateScale(18),      
    fontWeight: 'bold',
  },

  orText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: moderateScale(13.2),      
    marginBottom: verticalScale(17.6),  
  },

  googleButton: {
    alignItems: 'center',
    marginBottom: verticalScale(13.2),  
  },

  googleIcon: {
    width: wp('55%'),                   
    height: hp('7.15%'),                
  },

  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signUpText: {
    color: '#6B7280',
    fontSize: moderateScale(14),      
  },
  signUpLinkText: {
    color: '#10B981',
    fontSize: moderateScale(13),      
    fontWeight: '600',
  },
});
