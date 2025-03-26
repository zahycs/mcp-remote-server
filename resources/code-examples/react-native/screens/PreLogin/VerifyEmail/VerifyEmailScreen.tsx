import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import { styles } from './Styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../../../helper/config';

const VerifyEmailScreen = ({ route, navigation }: any) => {
  const { registerData, otp } = route.params;
  const [otpValue, setOtpValue] = useState('');
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = otpValue.split('');
    newOtp[index] = value;
    const newOtpString = newOtp.join('');
    setOtpValue(newOtpString);

    // Move to next input if value is entered
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    if (!otpValue || otpValue.length !== 4) {
      Alert.alert('Error', 'Please enter the complete OTP');
      return;
    }

    if (parseInt(otpValue) !== parseInt(otp)) {
      Alert.alert('Error', 'OTP does not match. Please try again.');
      return;
    }

    try {
      const response = await axios.post(
        `${API.BASE_URL}${API.ENDPOINTS.MOBILEAPI}/v1/register`,
        {
          ...registerData,
          user_otp: otpValue,
          sent_opt: otp,
          signup_step1_email_otp: 'done',
        }
      );

      if (response.data.loginInfo) {
        // Store login info in AsyncStorage
        await AsyncStorage.setItem('userToken', response.data.loginInfo.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.loginInfo));

        // Navigate to DrawerNavigator
        navigation.reset({
          index: 0,
          routes: [{ name: 'DrawerNavigator' }],
        });
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.msg || 'Unable to verify OTP. Please try again later.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>
          Please enter the verification code sent to your email
        </Text>
      </View>

      <View style={styles.otpContainer}>
        {[0, 1, 2, 3].map((index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.otpInput}
            maxLength={1}
            keyboardType="number-pad"
            onChangeText={(value) => handleOtpChange(value, index)}
            value={otpValue[index] || ''}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default VerifyEmailScreen; 