import React, { useState, useContext, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import PhoneInput from 'react-native-phone-number-input';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer');
  const [phone, setPhone] = useState('');
  const [locX, setLocX] = useState('');
  const [locY, setLocY] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const phoneInput = useRef(null);
  const { register } = useContext(AuthContext);
  const { colors, isDarkMode } = useContext(ThemeContext);

  const validateForm = () => {
    const errors = {};
    if (!username.trim()) errors.username = 'Username is required.';
    if (!name.trim()) errors.name = 'Full name is required.';
    if (!phone || phone === '+972') {
      errors.phone = 'Phone number is required.';
    } else if (!phoneInput.current?.isValidNumber(phone)) {
      errors.phone = 'Please enter a valid phone number.';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!password) {
      errors.password = 'Password is required.';
    } else if (!passwordRegex.test(password)) {
      errors.password = 'Must be at least 8 chars with uppercase, lowercase & digit.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    setErrorMsg('');
    if (!validateForm()) return;

    setLoading(true);
    
    const userData = { 
      username, 
      password, 
      name, 
      phone, 
      role,
      profileImage: profileImage || 'https://file.loading.io/resources/icon/9qk4gp.svg?v=1',
    };

    userData.location = {
      x: Number(locX) || 0,
      y: Number(locY) || 0
    };
    
    const result = await register(userData);
    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.error);
    } else {
      navigation.popToTop();
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.primary }]}>Create Account</Text>

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      <Text style={[styles.label, { color: colors.textSecondary }]}>I am registering as a...</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity 
          style={[styles.roleButton, role === 'customer' ? styles.roleButtonActive : { borderColor: colors.border, backgroundColor: colors.surface }]} 
          onPress={() => setRole('customer')}
        >
          <Text style={[styles.roleText, role === 'customer' ? styles.roleTextActive : { color: colors.text }]}>👤 Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.roleButton, role === 'restaurant_owner' ? styles.roleButtonActive : { borderColor: colors.border, backgroundColor: colors.surface }]} 
          onPress={() => setRole('restaurant_owner')}
        >
          <Text style={[styles.roleText, role === 'restaurant_owner' ? styles.roleTextActive : { color: colors.text }]}>🏪 Owner</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.imagePlaceholderText, { color: colors.textSecondary }]}>Choose Profile Picture</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: fieldErrors.username ? '#ff4d4d' : colors.border, color: colors.text, marginBottom: fieldErrors.username ? 4 : 15 }]}
        placeholder="Username"
        placeholderTextColor={colors.textSecondary}
        value={username}
        onChangeText={(t) => { setUsername(t); if (fieldErrors.username) setFieldErrors({...fieldErrors, username: null}); }}
        autoCapitalize="none"
      />
      {fieldErrors.username ? <Text style={styles.inlineError}>{fieldErrors.username}</Text> : null}

      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: fieldErrors.password ? '#ff4d4d' : colors.border, color: colors.text, marginBottom: 4 }]}
        placeholder="Password"
        placeholderTextColor={colors.textSecondary}
        value={password}
        onChangeText={(t) => { setPassword(t); if (fieldErrors.password) setFieldErrors({...fieldErrors, password: null}); }}
        secureTextEntry
      />
      {fieldErrors.password ? (
        <Text style={styles.inlineError}>{fieldErrors.password}</Text>
      ) : (
        <Text style={styles.hintText}>Min 8 chars, 1 uppercase, 1 lowercase & 1 digit</Text>
      )}

      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: fieldErrors.confirmPassword ? '#ff4d4d' : colors.border, color: colors.text, marginBottom: fieldErrors.confirmPassword ? 4 : 15 }]}
        placeholder="Confirm Password"
        placeholderTextColor={colors.textSecondary}
        value={confirmPassword}
        onChangeText={(t) => { setConfirmPassword(t); if (fieldErrors.confirmPassword) setFieldErrors({...fieldErrors, confirmPassword: null}); }}
        secureTextEntry
      />
      {fieldErrors.confirmPassword ? <Text style={styles.inlineError}>{fieldErrors.confirmPassword}</Text> : null}

      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: fieldErrors.name ? '#ff4d4d' : colors.border, color: colors.text, marginBottom: fieldErrors.name ? 4 : 15 }]}
        placeholder="Full Name"
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={(t) => { setName(t); if (fieldErrors.name) setFieldErrors({...fieldErrors, name: null}); }}
      />
      {fieldErrors.name ? <Text style={styles.inlineError}>{fieldErrors.name}</Text> : null}

      <View style={[styles.phoneContainer, { marginBottom: fieldErrors.phone ? 4 : 20 }]}>
        <PhoneInput
          ref={phoneInput}
          value={(() => {
            const digits = phone.replace(/^\+972/, '').replace(/\D/g, '');
            let f = '';
            if (digits.length > 0) f += digits.substring(0, 2);
            if (digits.length > 2) f += ' ' + digits.substring(2, 5);
            if (digits.length > 5) f += ' ' + digits.substring(5, 9);
            return f;
          })()}
          defaultCode="IL"
          layout="first"
          onChangeText={(text) => {
            const raw = text.replace(/\D/g, '');
            setPhone('+972' + raw);
            if (fieldErrors.phone) setFieldErrors({...fieldErrors, phone: null});
          }}
          textInputProps={{
            value: (() => {
              const digits = phone.replace(/^\+972/, '').replace(/\D/g, '');
              let f = '';
              if (digits.length > 0) f += digits.substring(0, 2);
              if (digits.length > 2) f += ' ' + digits.substring(2, 5);
              if (digits.length > 5) f += ' ' + digits.substring(5, 9);
              return f;
            })()
          }}
          containerStyle={[styles.phoneInputContainer, { backgroundColor: colors.surface, borderColor: fieldErrors.phone ? '#ff4d4d' : colors.border }]}
          textContainerStyle={[styles.phoneTextContainer, { backgroundColor: colors.surface }]}
          textInputStyle={{ color: colors.text }}
          codeTextStyle={{ color: colors.text }}
          withDarkTheme={isDarkMode}
          withShadow={false}
        />
      </View>
      {fieldErrors.phone ? <Text style={[styles.inlineError, { marginBottom: 15 }]}>{fieldErrors.phone}</Text> : null}

        <>
          <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Location Coordinates</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              placeholder="Location X"
              placeholderTextColor={colors.textSecondary}
              value={locX}
              onChangeText={setLocX}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.halfInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              placeholder="Location Y"
              placeholderTextColor={colors.textSecondary}
              value={locY}
              onChangeText={setLocY}
              keyboardType="numeric"
            />
          </View>
        </>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: (loading || Object.values(fieldErrors).some(err => err != null)) ? '#b0c4de' : colors.primary }]} 
        onPress={handleRegister} 
        disabled={loading || Object.values(fieldErrors).some(err => err != null)}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
        <Text style={[styles.linkText, { color: colors.textSecondary }]}>Already have an account? <Text style={{fontWeight: 'bold'}}>Log In</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#009de0',
    marginBottom: 30,
    textAlign: 'center'
  },
  imagePicker: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed'
  },
  imagePlaceholderText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    padding: 10
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  roleButtonActive: {
    borderColor: '#009de0',
    backgroundColor: 'rgba(0,157,224,0.05)',
  },
  roleText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  roleTextActive: {
    color: '#009de0',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  subLabel: {
    fontSize: 14,
    color: '#707070',
    marginBottom: 8,
    fontWeight: 'bold'
  },
  phoneContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  phoneInputContainer: {
    width: '100%',
    borderRadius: 8,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    backgroundColor: '#f9f9f9',
    elevation: 0,
    shadowOpacity: 0
  },
  phoneTextContainer: {
    backgroundColor: '#f9f9f9',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  button: {
    backgroundColor: '#009de0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  errorText: {
    color: '#ff4d4d',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  inlineError: {
    color: '#ff4d4d',
    fontSize: 13,
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: '600'
  },
  hintText: {
    color: '#888',
    fontSize: 12,
    marginBottom: 15,
    marginLeft: 4
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  linkText: {
    color: '#707070',
    fontSize: 15
  }
});
