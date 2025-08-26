    import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    TextInput,
    TouchableOpacity,
    Alert,
    } from "react-native";
    import { useState } from "react";
    import { Ionicons } from "@expo/vector-icons";
    import { authStyles } from "../../assets/styles/auth.styles";
    import { useRouter } from "expo-router";
    import { COLORS } from "../../constants/colors";
    import { useSignUp } from "@clerk/clerk-expo";
    import VerifyEmail from "./verify-email";

    const SignUpScreen = () => {
    const router = useRouter();
    const {signUp,isLoaded } = useSignUp();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);

    const handleSignUp = async () => {
                if (!email || !password) Alert.alert("Error", "Please fill in all fields");
                if(password.length < 6) return Alert.alert("Error", "Password must be at least 6 characters long");
                if (!isLoaded) return;
                setLoading(true);
                try {
                    await signUp.create({emailAddress: email,password});
                    await signUp.prepareEmailAddressVerification({strategy: "email_code"});
                    setPendingVerification(true);
                } catch (err) {
                Alert.alert("Error", err.errors?.[0]?.message || "Failed to create account");
                console.error(JSON.stringify(err, null, 2));
                } finally {
                setLoading(false);
                }
    };

    if(pendingVerification) return <VerifyEmail email={email} onBack={() => setPendingVerification(false)} />

    return (
        <View style={authStyles.container}>
        <KeyboardAvoidingView
            style={authStyles.keyboardView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "android" ? 64 : Platform.OS === "ios" ? 40 : 0}
        >
            <ScrollView
            contentContainerStyle={authStyles.scrollContext}
            showsVerticalScrollIndicator={false}
            >
            <View style={authStyles.imageContainer}>
                <Image
                source={require("../../assets/images/i2.png")}
                style={authStyles.image}
                contentFit="contain"
                />
            </View>
            <Text style={authStyles.title}>Create Account</Text>

            {/*Form Container*/}
            <View style={authStyles.formContainer}>
                {/*Email Input*/}
                <View style={authStyles.inputContainer}>
                <TextInput
                    style={authStyles.textInput}
                    placeholder="Enter Email"
                    placeholderTextColor={COLORS.textLight}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                </View>
                {/*Password Input*/}
                <View style={authStyles.inputContainer}>
                <TextInput
                    style={authStyles.textInput}
                    placeholder="Enter Password"
                    placeholderTextColor={COLORS.textLight}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    style={authStyles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                >
                    <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={COLORS.textLight}
                    />
                </TouchableOpacity>
                </View>
                {/*Sign Up Button*/}
                <TouchableOpacity
                    style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
                    onPress={handleSignUp}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <Text style={authStyles.buttonText}>{loading ? "Creating Account..." : "Sign Up"}</Text>
                </TouchableOpacity>
                {/*Sign in*/}
                <TouchableOpacity
                    style={authStyles.linkContainer}
                    onPress={() => router.push("/auth/sign-in")}
                >
                    <Text style={authStyles.linkText}>
                        Already have an account?<Text style={authStyles.link}>Sign In</Text>
                    </Text>
                </TouchableOpacity>
            </View>
            </ScrollView>
        </KeyboardAvoidingView>
        </View>
    );
    };

    export default SignUpScreen;
