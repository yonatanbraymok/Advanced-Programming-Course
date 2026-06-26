import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import PhoneInput from 'react-native-phone-number-input';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';

const API_BASE_URL = 'http://10.0.2.2:3000/api';

export default function EditProfileScreen({ route, navigation }) {
  const { profile } = route.params;
  const { userToken } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  const [username, setUsername] = useState(profile?.username || '');
  const [name, setName] = useState(profile?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [locX, setLocX] = useState(profile?.location?.x?.toString() || '0');
  const [locY, setLocY] = useState(profile?.location?.y?.toString() || '0');
  const [profileImage, setProfileImage] = useState(profile?.profileImage || null);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleSave = async () => {
    setErrorMsg('');
    if (!name.trim()) {
      setErrorMsg('Name is required.');
      return;
    }

    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    
    const userData = { 
      username: username.trim(),
      name: name.trim(), 
      phone, 
      profileImage,
      location: {
        x: Number(locX) || 0,
        y: Number(locY) || 0
      }
    };

    if (password) {
      userData.password = password;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(userData)
      });
      const data = await response.json();

      if (response.ok) {
        navigation.goBack();
      } else {
        setErrorMsg(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setErrorMsg('Network error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.primary }]}>Edit Profile</Text>

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.imagePlaceholderText, { color: colors.textSecondary }]}>Change Picture</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={[styles.label, { color: colors.textSecondary }]}>Username</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        value={name}
        onChangeText={setName}
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number</Text>
      <View style={styles.phoneContainer}>
        <PhoneInput
          defaultValue={phone}
          defaultCode="IL"
          layout="first"
          onChangeFormattedText={(text) => {
            setPhone(text);
          }}
          containerStyle={[styles.phoneInputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}
          textContainerStyle={{ backgroundColor: colors.surface, borderRadius: 8 }}
          codeTextStyle={{ color: colors.text }}
          textInputStyle={{ color: colors.text }}
          withDarkTheme={colors.background === '#121212'}
        />
      </View>

      <Text style={[styles.label, { color: colors.textSecondary }]}>Location Coordinates</Text>
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

      <Text style={[styles.label, { color: colors.textSecondary }]}>New Password (leave blank to keep)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Min 8 chars, 1 uppercase, 1 digit"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>Confirm New Password</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Changes</Text>}
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.border }]} onPress={() => navigation.goBack()} disabled={loading}>
        <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center'
  },
  imagePicker: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed'
  },
  imagePlaceholderText: {
    fontSize: 14,
    textAlign: 'center',
    padding: 10
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  halfInput: {
    width: '48%',
  },
  phoneContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  phoneInputContainer: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 0,
    shadowOpacity: 0
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  cancelButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  errorText: {
    color: '#ff4d4d',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold'
  }
});
