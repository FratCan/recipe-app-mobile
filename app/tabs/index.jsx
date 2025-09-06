import { View,ScrollView,TouchableOpacity,Text, RefreshControl,FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { mealAPI } from "../../services/mealAPI";
import { homeStyles } from "../../assets/styles/home.styles";
import { COLORS } from "../../constants/colors";
import { Image } from "expo-image";
import { Ionicons } from '@expo/vector-icons';
import CategoryFilter from "../../components/CategoryFilter";
import RecipeCard from "../../components/RecipeCard";
import LoadingSpinner from "../../components/LoadingSpinner";

//const sleep = (ms) => new Promise(resolve => setTimeout(resolve,ms))

const HomeScreen = () => {

    const router = useRouter();
    const [selectedCategory,setSelectedCategory] = useState("Beef");
    const [recipes,setRecipes] = useState([]);
    const [categories,setCategories] = useState([]);
    const [featuredRecipe,setFeaturedRecipe] = useState(null);
    const [loading,setLoading] = useState(true);
    const [refreshing,setRefreshing] = useState(false);

    const loadData = async()  =>{
        try {
            setLoading(true);

            const [apiCategories,randomMeals,featuredMeal] = await Promise.all([
                mealAPI.getCategories(),
                mealAPI.getRandomMeals(10),
                mealAPI.getRandomMeal()
            ]);


            const transformedCategories= apiCategories.map((cat,index) => ({
                id:index+1,
                name:cat.strCategory,
                image:cat.strCategoryThumb,
                description:cat.strCategoryDescription
            }));
            setCategories(transformedCategories);

            if(!selectedCategory) setSelectedCategory(transformedCategories[0].name);

            const transformedMeals=randomMeals.map(meal => mealAPI.transformMealData(meal)).filter(meal => meal !== null);
            setRecipes(transformedMeals);

            const transformedFeaturedMeal = mealAPI.transformMealData(featuredMeal);
            setFeaturedRecipe(transformedFeaturedMeal);

        } catch (error) {
            console.error("Error loading data:", error);
        }finally {
            setLoading(false);
        }
    }

    const loadCategoryData=async(category) =>{
        try {
            const meals= await mealAPI.filterByCategory(category);
            const transformedMeals = meals.map(meal => mealAPI.transformMealData(meal)).filter(meal => meal !== null);
            setRecipes(transformedMeals);
        } catch (error) {
            console.error("Error loading category data:", error);
            setRecipes([]);
        }
    }

    const handleCategorySelect = async (category) =>{
        setSelectedCategory(category);
        await loadCategoryData(category);
    }


    const onRefresh = async() =>{
        setRefreshing(true);
        //await sleep(2000)
        await loadData();
        setRefreshing(false);
    }

    useEffect(() => {
        loadData();
    },[]);

    if (loading && !refreshing) return <LoadingSpinner message="Loading delicions recipes..." />;

    return (
        <View style={homeStyles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[COLORS.primary]}
                    tintColor={COLORS.primary}
                    />
                }
                contentContainerStyle={homeStyles.scrollContext}
            >
                <View style={homeStyles.welcomeSection}>
                    <Image
                        source={require("../../assets/images/lamb.png")}
                        style={{
                            width:100,
                            height:100,
                        }}
                    />
                    <Image
                        source={require("../../assets/images/chicken.png")}
                        style={{
                            width:100,
                            height:100,
                        }}
                    />
                    <Image
                        source={require("../../assets/images/pork.png")}
                        style={{
                            width:100,
                            height:100,
                        }}
                    />
                </View>

                {featuredRecipe &&
                <View style={homeStyles.featuredSection}>
                        <TouchableOpacity
                            style={homeStyles.featuredCard}
                            activeOpacity={0.8}
                            onPress={() => router.push(`/recipe/${featuredRecipe.id}`)}
                        >
                            <View style={homeStyles.featuredImageContainer}>
                                <Image
                                    source={{ uri: featuredRecipe.image }}
                                    style={homeStyles.featuredImage}
                                    contentFit="cover"
                                    transition={500}
                                />
                                <View style={homeStyles.featuredOverlay}>
                                    <View style={homeStyles.featuredBadge}>
                                        <Text style={homeStyles.featuredBadgeText}>Featured</Text>
                                    </View>

                                    <View style={homeStyles.featuredContent}>
                                        <Text style={homeStyles.featuredTitle} numberOfLines={2}>
                                            {featuredRecipe.title}
                                        </Text>

                                        <View style={homeStyles.featuredMeta}>
                                            <View style={homeStyles.metaItem}>
                                                <Ionicons name="time-outline" size={16} color={COLORS.white} />
                                                <Text style={homeStyles.metaText}>{featuredRecipe.cookTime}</Text>
                                            </View>
                                            <View style={homeStyles.metaItem}>
                                                <Ionicons name="people-outline" size={16} color={COLORS.white} />
                                                <Text style={homeStyles.metaText}>{featuredRecipe.servings}</Text>
                                            </View>
                                            {featuredRecipe.area && (
                                            <View style={homeStyles.metaItem}>
                                                <Ionicons name="location-outline" size={16} color={COLORS.white} />
                                                <Text style={homeStyles.metaText}>{featuredRecipe.area}</Text>
                                            </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                </View>
                }

                {categories.length > 0 &&(
                    <CategoryFilter
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={handleCategorySelect}
                    />
                )}

                <View style={homeStyles.recipesSection}>
                    <View style={homeStyles.sectionHeader}>
                        <Text style={homeStyles.sectionTitle}>{selectedCategory}</Text>
                    </View>
                </View>

                {recipes.length > 0 ?(
                    <FlatList
                        data={recipes}
                        keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
                        renderItem={({ item }) => <RecipeCard recipe={item}/>}
                        numColumns={2}
                        columnWrapperStyle={homeStyles.row}
                        contentContainerStyle={homeStyles.recipeGrid}
                        scrollEnabled={false}
                    />
                ):(
                    <View style={homeStyles.emptyState}>
                        <Ionicons name="restaurant-outline" size={64} color={COLORS.textLight} />
                        <Text style={homeStyles.emptyTitle}>No recipes found</Text>
                        <Text style={homeStyles.emptyDescription}>Try a different category</Text>
                    </View>
                )
                }
            </ScrollView>
        </View>
    );
}

export default HomeScreen;