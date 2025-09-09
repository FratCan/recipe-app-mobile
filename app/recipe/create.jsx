import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { API_url } from '../../constants/api';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import createRecipeStyles from '../../assets/styles/create-recipe.styles';
import LoadingSpinner from '../../components/LoadingSpinner';

const CreateRecipe = () => {
  const { user } = useUser();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [servings, setServings] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddRecipe = async () => {
    if (!title || !servings || !cookTime) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const recipeData = {
        userId: user.id,
        recipeId: Date.now().toString(),
        title,
        servings: parseInt(servings),
        cookTime: parseInt(cookTime),
        image: image || 'https://via.placeholder.com/150',
      };

      const response = await fetch(`${API_url}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        throw new Error('Failed to add recipe');
      }

      Alert.alert('Success', 'Recipe added to favorites');
      router.push('/tabs/favorites');
    } catch (error) {
      console.error('Error adding recipe:', error);
      Alert.alert('Error', 'Failed to add recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={createRecipeStyles.container}>
      <Text style={createRecipeStyles.title}>Create New Recipe</Text>

      <TouchableOpacity onPress={pickImage} style={createRecipeStyles.imagePickerContainer}>
        {image ? (
          <Image source={{ uri: image }} style={createRecipeStyles.selectedImage} />
        ) : (
          <View>
            <Text style={createRecipeStyles.imagePickerText}>Tap to Select Image</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={createRecipeStyles.inputGroup}>
        <Text style={createRecipeStyles.label}>Recipe Title</Text>
        <TextInput
          style={createRecipeStyles.input}
          placeholder="e.g., Delicious Chicken Curry"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={createRecipeStyles.inputGroup}>
        <Text style={createRecipeStyles.label}>Servings</Text>
        <TextInput
          style={createRecipeStyles.input}
          placeholder="e.g., 4"
          value={servings}
          onChangeText={setServings}
          keyboardType="numeric"
        />
      </View>

      <View style={createRecipeStyles.inputGroup}>
        <Text style={createRecipeStyles.label}>Cook Time (minutes)</Text>
        <TextInput
          style={createRecipeStyles.input}
          placeholder="e.g., 30"
          value={cookTime}
          onChangeText={setCookTime}
          keyboardType="numeric"
        />
      </View>

      {/* Add more fields as needed, e.g., ingredients, instructions */}

      <TouchableOpacity
        style={createRecipeStyles.button}
        onPress={handleAddRecipe}
        disabled={loading}
      >
        <Text style={createRecipeStyles.buttonText}>Add Recipe</Text>
      </TouchableOpacity>

      {loading && <LoadingSpinner />}
    </ScrollView>
  );
};

export default CreateRecipe;
