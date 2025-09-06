import React from "react";
import { View, Text, Alert, ScrollView, TouchableOpacity, FlatList } from "react-native";
import {useState,useEffect} from "react";
import {useClerk,useUser} from '@clerk/clerk-expo'
import { API_url } from "../../constants/api";
import {favoritesStyles} from "../../assets/styles/favorites.styles";
import { Ionicons } from '@expo/vector-icons';
import {COLORS} from "../../constants/colors";
import RecipeCard from "../../components/RecipeCard";
import NoFavoritesFound from "../../components/NoFavoritesFound";
import LoadingSpinner from "../../components/LoadingSpinner";

const FavoritesScreen =() =>{


    const {signOut} = useClerk();
    const {user} = useUser();
    const [favoritesRecipes,setFavoritesRecipes]=useState([]);
    const [loading,setLoading] = useState(true);


    useEffect(()=>{
        const loadFavorites = async() => {
            try {
                const response = await fetch(`${API_url}/favorites/${user.id}`)
                if(!response.ok) throw new Error("Failed to fetch favorites");

                const favorites= await response.json();
                const transformedFavorites=favorites.map(favorite =>({
                    ...favorite,
                    id:favorite.recipeId
                }))
                setFavoritesRecipes(transformedFavorites)
            } catch (error) {
                console.error("Error loading favorites",error)
                Alert.alert("Error","Failed to load favorites");
            }finally{
                setLoading(false);
            }
        }
        loadFavorites()
    },[user.id])

    const handleSignOut = () =>{
        Alert.alert("Logout","Are you sure want to logout ?",[
            {text:"Cancel",style:"cancel"},
            {text:"Logout",style:"destructive",onPress:signOut}
        ]);
    };

    if(loading) return <LoadingSpinner/>

    return(
        <View style={favoritesStyles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={favoritesStyles.header}>
                        <Text style={favoritesStyles.title}>Favorites</Text>
                        <TouchableOpacity style={favoritesStyles.logoutButton} onPress={handleSignOut}>
                            <Ionicons name="log-out-outline" size={22} color={COLORS.text}/>
                        </TouchableOpacity>
                    </View>

                    <View style={favoritesStyles.recipesSection}>
                                        <FlatList
                                                data={favoritesRecipes}
                                                keyExtractor={(item) => item.id.toString()}
                                                renderItem={({ item }) => <RecipeCard recipe={item}/>}
                                                numColumns={2}
                                                columnWrapperStyle={favoritesRecipes.row}
                                                contentContainerStyle={favoritesRecipes.recipeGrid}
                                                scrollEnabled={false}
                                                ListEmptyComponent={<NoFavoritesFound/>}
                                        />
                    </View>
                </ScrollView>
        </View>
    );
}

export default FavoritesScreen;