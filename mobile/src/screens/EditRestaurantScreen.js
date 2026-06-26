import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';

const API_BASE_URL = 'http://10.0.2.2:3000/api';

export default function EditRestaurantScreen({ route, navigation }) {
  const restaurant = route.params?.restaurant;
  const isEditing = !!restaurant;

  const { userToken } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  const [name, setName] = useState(restaurant?.name || '');
  const [description, setDescription] = useState(restaurant?.description || '');
  const [cuisine, setCuisine] = useState(restaurant?.cuisine || 'Burgers');
  const [cuisineModalVisible, setCuisineModalVisible] = useState(false);
  const cuisineOptions = ['Burgers', 'Asian', 'Italian', 'Other'];
  const [locX, setLocX] = useState(restaurant?.location?.x?.toString() || '0');
  const [locY, setLocY] = useState(restaurant?.location?.y?.toString() || '0');
  const [image, setImage] = useState(restaurant?.image || null);
  
  // Menu items state
  const [menu, setMenu] = useState(restaurant?.menu || []);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 1], // Banner aspect ratio
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddMenuItem = () => {
    const newItem = {
      id: `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: '',
      description: '',
      price: '',
      image: ''
    };
    setMenu([...menu, newItem]);
  };

  const handleRemoveMenuItem = (index) => {
    const newMenu = [...menu];
    newMenu.splice(index, 1);
    setMenu(newMenu);
  };

  const updateMenuItem = (index, field, value) => {
    const newMenu = [...menu];
    newMenu[index][field] = value;
    setMenu(newMenu);
  };

  const handleSave = async () => {
    setErrorMsg('');
    if (!name.trim()) {
      setErrorMsg('Restaurant name is required.');
      return;
    }

    // Validate menu items
    for (let i = 0; i < menu.length; i++) {
      if (!menu[i].name.trim() || !menu[i].price.toString().trim()) {
        setErrorMsg(`Menu item #${i + 1} is missing a name or price.`);
        return;
      }
    }

    setLoading(true);
    
    // Clean up menu payload (ensure prices are numbers)
    const cleanedMenu = menu.map(item => ({
      ...item,
      price: Number(item.price) || 0
    }));

    const payload = { 
      name: name.trim(), 
      description: description.trim(),
      cuisine: cuisine.trim(),
      image,
      location: {
        x: Number(locX) || 0,
        y: Number(locY) || 0
      },
      menu: cleanedMenu
    };
    
    try {
      const url = isEditing ? `${API_BASE_URL}/restaurants/${restaurant.id || restaurant._id}` : `${API_BASE_URL}/restaurants`;
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        navigation.goBack();
      } else {
        const data = await response.json();
        setErrorMsg(data.error || 'Failed to save restaurant');
      }
    } catch (error) {
      setErrorMsg('Network error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {isEditing ? 'Edit Restaurant' : 'New Restaurant'}
        </Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.bannerImage} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.imagePlaceholderText, { color: colors.textSecondary }]}>Add Banner Image</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Details</Text>
          
          <Text style={[styles.label, { color: colors.textSecondary }]}>Restaurant Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Mario's Pizza"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text, height: 80 }]}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Cuisine Type</Text>
          <TouchableOpacity 
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, justifyContent: 'center' }]} 
            onPress={() => setCuisineModalVisible(true)}
          >
            <Text style={{ color: cuisine ? colors.text : colors.textSecondary }}>
              {cuisine || "Select Cuisine"}
            </Text>
          </TouchableOpacity>

          <Modal visible={cuisineModalVisible} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select Cuisine</Text>
                {cuisineOptions.map(c => (
                  <TouchableOpacity 
                    key={c} 
                    style={[styles.modalOption, { borderBottomColor: colors.border }]} 
                    onPress={() => { setCuisine(c); setCuisineModalVisible(false); }}
                  >
                    <Text style={[styles.modalOptionText, { color: colors.text }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity 
                  style={styles.modalCancel} 
                  onPress={() => setCuisineModalVisible(false)}
                >
                  <Text style={{ color: '#ff4d4d', fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Location Coordinates</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Loc X"
              placeholderTextColor={colors.textSecondary}
              value={locX}
              onChangeText={setLocX}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.halfInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Loc Y"
              placeholderTextColor={colors.textSecondary}
              value={locY}
              onChangeText={setLocY}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.menuHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Menu Items</Text>
            <TouchableOpacity onPress={handleAddMenuItem}>
              <Text style={[styles.addMenuText, { color: colors.primary }]}>+ Add Item</Text>
            </TouchableOpacity>
          </View>

          {menu.length === 0 && (
            <Text style={{ color: colors.textSecondary, fontStyle: 'italic', marginTop: 10 }}>No menu items added yet.</Text>
          )}

          {menu.map((item, index) => (
            <View key={item.id || index} style={[styles.menuItemCard, { borderColor: colors.border }]}>
              <View style={styles.menuItemHeader}>
                <Text style={{ color: colors.text, fontWeight: 'bold' }}>Item #{index + 1}</Text>
                <TouchableOpacity onPress={() => handleRemoveMenuItem(index)}>
                  <Text style={{ color: '#ff4d4d', fontWeight: 'bold' }}>Remove</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.input, styles.compactInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="Item Name"
                placeholderTextColor={colors.textSecondary}
                value={item.name}
                onChangeText={(val) => updateMenuItem(index, 'name', val)}
              />
              <TextInput
                style={[styles.input, styles.compactInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="Description"
                placeholderTextColor={colors.textSecondary}
                value={item.description}
                onChangeText={(val) => updateMenuItem(index, 'description', val)}
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput, styles.compactInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  placeholder="Price (₪)"
                  placeholderTextColor={colors.textSecondary}
                  value={item.price.toString()}
                  onChangeText={(val) => updateMenuItem(index, 'price', val)}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.halfInput, styles.compactInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  placeholder="Image URL"
                  placeholderTextColor={colors.textSecondary}
                  value={item.image}
                  onChangeText={(val) => updateMenuItem(index, 'image', val)}
                />
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Restaurant</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.border }]} onPress={() => navigation.goBack()} disabled={loading}>
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
        
        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    backgroundColor: 'rgba(128,128,128,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 16,
  },
  backButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
  },
  imagePicker: {
    marginBottom: 20,
  },
  bannerImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed'
  },
  imagePlaceholderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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
    marginBottom: 16,
    fontSize: 16,
  },
  compactInput: {
    padding: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addMenuText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  menuItemCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    backgroundColor: 'rgba(128,128,128,0.05)',
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 16,
  },
  modalCancel: {
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  }
});
