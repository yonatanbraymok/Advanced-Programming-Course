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

  const phoneInput = useRef(null);
  const { register } = useContext(AuthContext);
  const { colors, isDarkMode } = useContext(ThemeContext);

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
    
    if (!username || !password || !confirmPassword || !name || !phone) {
      setErrorMsg('All fields are required.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    const checkValid = phoneInput.current?.isValidNumber(phone);
    if (!checkValid) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }

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
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        placeholder="Username"
        placeholderTextColor={colors.textSecondary}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        placeholder="Password (min 8 chars)"
        placeholderTextColor={colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        placeholder="Confirm Password"
        placeholderTextColor={colors.textSecondary}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        placeholder="Full Name"
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={setName}
      />

      <View style={styles.phoneContainer}>
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
          containerStyle={[styles.phoneInputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}
          textContainerStyle={[styles.phoneTextContainer, { backgroundColor: colors.surface }]}
          textInputStyle={{ color: colors.text }}
          codeTextStyle={{ color: colors.text }}
          withDarkTheme={isDarkMode}
          withShadow={false}
        />
      </View>

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

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleRegister} disabled={loading}>
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
  linkContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  linkText: {
    color: '#707070',
    fontSize: 15
  }
});
